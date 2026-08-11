/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package qdrant

import (
	"context"
	"fmt"
	"math"
	"reflect"
	"sort"
	"strconv"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"
	qdrantapi "github.com/qdrant/go-client/qdrant"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

const defaultTopK = 4

type qdrantSearchStore struct {
	config             *ManagerConfig
	collectionName     string
	indexingFields     []string
	payloadTypes       map[string]qdrantapi.PayloadSchemaType
	denseVectorFields  map[string]uint64
	sparseVectorFields sets.Set[string]
}

func (q *qdrantSearchStore) Store(ctx context.Context, docs []*schema.Document, opts ...indexer.Option) (ids []string, err error) {
	if len(docs) == 0 {
		return nil, nil
	}
	options := indexer.GetImplSpecificOptions(&searchstore.IndexerOptions{}, opts...)
	defer func() {
		if err != nil && options.ProgressBar != nil {
			_ = options.ProgressBar.ReportError(err)
		}
	}()

	fields := sets.FromSlice(options.IndexingFields)
	if len(fields) == 0 {
		return nil, fmt.Errorf("[Store] no indexing fields provided")
	}
	allowed := sets.FromSlice(q.indexingFields)
	for field := range fields {
		if _, ok := allowed[field]; !ok {
			return nil, fmt.Errorf("[Store] indexing field %q does not exist in qdrant collection", field)
		}
	}
	var partitionKey string
	var partitionValue any
	if (options.PartitionKey == nil) != (options.Partition == nil) {
		return nil, fmt.Errorf("[Store] partition key and value must be provided together")
	}
	if options.PartitionKey != nil {
		partitionKey = *options.PartitionKey
		if partitionKey == "" {
			return nil, fmt.Errorf("[Store] partition key is empty")
		}
		if isBuiltInPayloadField(partitionKey) {
			return nil, fmt.Errorf("[Store] reserved field %q cannot be a partition key", partitionKey)
		}
		values, err := q.partitionValues(partitionKey, []string{*options.Partition})
		if err != nil {
			return nil, fmt.Errorf("[Store] invalid partition: %w", err)
		}
		partitionValue = values[0]
	}

	ids = make([]string, 0, len(docs))
	for _, batch := range slices.Chunks(docs, q.config.BatchSize) {
		points, batchIDs, err := q.documentsToPoints(ctx, batch, fields, partitionKey, partitionValue)
		if err != nil {
			return nil, err
		}
		if _, err = q.config.Client.Upsert(ctx, &qdrantapi.UpsertPoints{
			CollectionName: q.collectionName,
			Points:         points,
			Wait:           ptr.Of(true),
		}); err != nil {
			return nil, fmt.Errorf("[Store] qdrant upsert failed: %w", err)
		}
		ids = append(ids, batchIDs...)
		if options.ProgressBar != nil {
			if err = options.ProgressBar.AddN(len(batch)); err != nil {
				return nil, err
			}
		}
	}

	return ids, nil
}

func (q *qdrantSearchStore) Retrieve(ctx context.Context, query string, opts ...retriever.Option) ([]*schema.Document, error) {
	common := retriever.GetCommonOptions(&retriever.Options{TopK: ptr.Of(defaultTopK)}, opts...)
	specific := retriever.GetImplSpecificOptions(&searchstore.RetrieverOptions{}, opts...)
	if common.TopK == nil || ptr.From(common.TopK) <= 0 {
		return nil, fmt.Errorf("[Retrieve] topK must be positive")
	}

	fields := q.indexingFields
	if specific.MultiMatch != nil {
		fields = specific.MultiMatch.Fields
		query = specific.MultiMatch.Query
	}
	fields = uniqueStrings(fields)
	if len(fields) == 0 {
		return nil, fmt.Errorf("[Retrieve] no vector fields selected")
	}
	allowed := sets.FromSlice(q.indexingFields)
	for _, field := range fields {
		if _, ok := allowed[field]; !ok {
			return nil, fmt.Errorf("[Retrieve] vector field %q does not exist in qdrant collection", field)
		}
	}

	filter, err := q.buildFilter(common.DSLInfo, specific)
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] build qdrant filter failed: %w", err)
	}

	var dense [][]float64
	var sparse []map[int]float64
	hybrid := ptr.From(q.config.EnableHybrid)
	if hybrid {
		dense, sparse, err = q.config.Embedding.EmbedStringsHybrid(ctx, []string{query})
	} else {
		dense, err = q.config.Embedding.EmbedStrings(ctx, []string{query})
	}
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] embed query failed: %w", err)
	}
	if len(dense) != 1 {
		return nil, fmt.Errorf("[Retrieve] embedder returned %d dense vectors, expected 1", len(dense))
	}
	denseVector, err := denseToFloat32(dense[0], q.config.Embedding.Dimensions())
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] invalid dense embedding: %w", err)
	}

	topK := uint64(ptr.From(common.TopK))
	prefetch := newPrefetchQueries(fields, densePrefix,
		func() *qdrantapi.Query { return qdrantapi.NewQueryDense(denseVector) }, filter, topK)
	if hybrid {
		if len(sparse) != 1 {
			return nil, fmt.Errorf("[Retrieve] embedder returned %d sparse vectors, expected 1", len(sparse))
		}
		indices, values, err := sparseToQdrant(sparse[0])
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] invalid sparse embedding: %w", err)
		}
		prefetch = append(prefetch, newPrefetchQueries(fields, sparsePrefix,
			func() *qdrantapi.Query { return qdrantapi.NewQuerySparse(indices, values) }, filter, topK)...)
	}

	request := &qdrantapi.QueryPoints{
		CollectionName: q.collectionName,
		Filter:         filter,
		Limit:          ptr.Of(topK),
		WithPayload:    qdrantapi.NewWithPayload(true),
	}
	vectorNames := make([]string, 0, len(q.denseVectorFields)+len(q.sparseVectorFields))
	for name := range q.denseVectorFields {
		vectorNames = append(vectorNames, name)
	}
	for name := range q.sparseVectorFields {
		vectorNames = append(vectorNames, name)
	}
	if len(vectorNames) > 0 {
		sort.Strings(vectorNames)
		request.WithVectors = qdrantapi.NewWithVectorsInclude(vectorNames...)
	}
	if common.ScoreThreshold != nil && (math.IsNaN(*common.ScoreThreshold) || math.IsInf(*common.ScoreThreshold, 0)) {
		return nil, fmt.Errorf("[Retrieve] score threshold must be finite")
	}
	if len(prefetch) == 1 {
		request.Query = prefetch[0].Query
		request.Using = prefetch[0].Using
	} else {
		request.Prefetch = prefetch
		request.Query = qdrantapi.NewQueryFusion(qdrantapi.Fusion_RRF)
	}

	result, err := q.config.Client.Query(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] qdrant query failed: %w", err)
	}
	docs, err := scoredPointsToDocuments(result)
	if err != nil {
		return nil, err
	}
	if len(prefetch) == 1 {
		normalizeScores(docs, q.config.Distance)
	}
	if common.ScoreThreshold != nil {
		filtered := docs[:0]
		for _, doc := range docs {
			if doc.Score() >= *common.ScoreThreshold {
				filtered = append(filtered, doc)
			}
		}
		docs = filtered
	}
	return docs, nil
}

func newPrefetchQueries(fields []string, prefix string, query func() *qdrantapi.Query,
	filter *qdrantapi.Filter, limit uint64) []*qdrantapi.PrefetchQuery {
	result := make([]*qdrantapi.PrefetchQuery, len(fields))
	for i, field := range fields {
		result[i] = &qdrantapi.PrefetchQuery{
			Query:  query(),
			Using:  ptr.Of(prefix + field),
			Filter: filter,
			Limit:  ptr.Of(limit),
		}
	}
	return result
}

func (q *qdrantSearchStore) Delete(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	pointIDs := make([]*qdrantapi.PointId, 0, len(ids))
	for _, id := range ids {
		parsed, err := parsePointID(id)
		if err != nil {
			return fmt.Errorf("[Delete] invalid document id %q: %w", id, err)
		}
		pointIDs = append(pointIDs, parsed)
	}
	_, err := q.config.Client.Delete(ctx, &qdrantapi.DeletePoints{
		CollectionName: q.collectionName,
		Wait:           ptr.Of(true),
		Points:         qdrantapi.NewPointsSelector(pointIDs...),
	})
	if err != nil {
		return fmt.Errorf("[Delete] qdrant delete failed: %w", err)
	}
	return nil
}

func (q *qdrantSearchStore) documentsToPoints(ctx context.Context, docs []*schema.Document, fields sets.Set[string], partitionKey string, partitionValue any) ([]*qdrantapi.PointStruct, []string, error) {
	points := make([]*qdrantapi.PointStruct, len(docs))
	ids := make([]string, len(docs))
	hybrid := ptr.From(q.config.EnableHybrid)
	valuesByField := make(map[string][]string, len(fields))
	for field := range fields {
		valuesByField[field] = make([]string, len(docs))
	}

	for i, doc := range docs {
		if doc == nil {
			return nil, nil, fmt.Errorf("[documentsToPoints] document at index %d is nil", i)
		}
		documentID, pointID, err := parseDocumentID(doc.ID)
		if err != nil {
			return nil, nil, fmt.Errorf("[documentsToPoints] invalid document id %q: %w", doc.ID, err)
		}
		creatorID, err := document.GetDocumentCreatorID(doc)
		if err != nil {
			return nil, nil, fmt.Errorf("[documentsToPoints] creator_id missing or invalid: %w", err)
		}
		payload := map[string]any{
			searchstore.FieldID:          documentID,
			searchstore.FieldCreatorID:   creatorID,
			searchstore.FieldTextContent: doc.Content,
		}
		ext, err := document.GetDocumentExternalStorage(doc)
		if err != nil {
			return nil, nil, fmt.Errorf("[documentsToPoints] external storage missing for document %s: %w", doc.ID, err)
		}
		vectors := make(map[string]*qdrantapi.Vector, len(fields)*2+len(q.denseVectorFields)+len(q.sparseVectorFields))
		for key, value := range ext {
			if isBuiltInPayloadField(key) {
				return nil, nil, fmt.Errorf("[documentsToPoints] external storage must not contain reserved field %q", key)
			}
			if dimensions, ok := q.denseVectorFields[key]; ok {
				dense, err := explicitDenseToFloat32(value, dimensions)
				if err != nil {
					return nil, nil, fmt.Errorf("[documentsToPoints] invalid dense vector field %q: %w", key, err)
				}
				vectors[key] = qdrantapi.NewVectorDense(dense)
				continue
			}
			if _, ok := q.sparseVectorFields[key]; ok {
				indices, values, err := explicitSparseToQdrant(value)
				if err != nil {
					return nil, nil, fmt.Errorf("[documentsToPoints] invalid sparse vector field %q: %w", key, err)
				}
				vectors[key] = qdrantapi.NewVectorSparse(indices, values)
				continue
			}
			if isVectorValue(value) {
				return nil, nil, fmt.Errorf("[documentsToPoints] vector field %q is not declared in the qdrant collection", key)
			}
			normalized, err := q.normalizePayloadValue(key, value)
			if err != nil {
				return nil, nil, fmt.Errorf("[documentsToPoints] invalid payload field %q: %w", key, err)
			}
			payload[key] = normalized
		}
		if partitionKey != "" {
			payload[partitionKey] = partitionValue
		}
		qPayload, err := qdrantapi.TryValueMap(payload)
		if err != nil {
			return nil, nil, fmt.Errorf("[documentsToPoints] convert payload for document %s failed: %w", doc.ID, err)
		}
		points[i] = &qdrantapi.PointStruct{
			Id:      pointID,
			Payload: qPayload,
			Vectors: qdrantapi.NewVectorsMap(vectors),
		}
		ids[i] = doc.ID

		for field := range fields {
			value, err := documentTextField(doc, ext, field)
			if err != nil {
				return nil, nil, err
			}
			valuesByField[field][i] = value
		}
	}

	for field, values := range valuesByField {
		var dense [][]float64
		var sparse []map[int]float64
		var err error
		if hybrid {
			dense, sparse, err = q.config.Embedding.EmbedStringsHybrid(ctx, values)
		} else {
			dense, err = q.config.Embedding.EmbedStrings(ctx, values)
		}
		if err != nil {
			return nil, nil, fmt.Errorf("[documentsToPoints] embed field %q failed: %w", field, err)
		}
		if len(dense) != len(docs) {
			return nil, nil, fmt.Errorf("[documentsToPoints] field %q returned %d dense vectors, expected %d", field, len(dense), len(docs))
		}
		if hybrid && len(sparse) != len(docs) {
			return nil, nil, fmt.Errorf("[documentsToPoints] field %q returned %d sparse vectors, expected %d", field, len(sparse), len(docs))
		}

		for i := range docs {
			denseVector, err := denseToFloat32(dense[i], q.config.Embedding.Dimensions())
			if err != nil {
				return nil, nil, fmt.Errorf("[documentsToPoints] invalid dense embedding for field %q: %w", field, err)
			}
			vectors := points[i].Vectors.GetVectors().GetVectors()
			vectors[denseFieldName(field)] = qdrantapi.NewVectorDense(denseVector)
			if hybrid {
				indices, sparseValues, err := sparseToQdrant(sparse[i])
				if err != nil {
					return nil, nil, fmt.Errorf("[documentsToPoints] invalid sparse embedding for field %q: %w", field, err)
				}
				vectors[sparseFieldName(field)] = qdrantapi.NewVectorSparse(indices, sparseValues)
			}
		}
	}

	return points, ids, nil
}

func documentTextField(doc *schema.Document, ext map[string]any, field string) (string, error) {
	if field == searchstore.FieldTextContent {
		return doc.Content, nil
	}
	value, ok := ext[field]
	if !ok {
		return "", fmt.Errorf("[documentTextField] field %q not found", field)
	}
	text, ok := value.(string)
	if !ok {
		return "", fmt.Errorf("[documentTextField] field %q must be string, got %T", field, value)
	}
	return text, nil
}

func parsePointID(id string) (*qdrantapi.PointId, error) {
	_, pointID, err := parseDocumentID(id)
	return pointID, err
}

func parseDocumentID(id string) (int64, *qdrantapi.PointId, error) {
	n, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return 0, nil, err
	}
	if n < 0 {
		return 0, nil, fmt.Errorf("document id must not be negative")
	}
	return n, qdrantapi.NewIDNum(uint64(n)), nil
}

func denseToFloat32(src []float64, dimensions int64) ([]float32, error) {
	if int64(len(src)) != dimensions {
		return nil, fmt.Errorf("vector dimension is %d, expected %d", len(src), dimensions)
	}
	dst := make([]float32, len(src))
	for i, value := range src {
		if math.IsNaN(value) || math.IsInf(value, 0) {
			return nil, fmt.Errorf("vector contains non-finite value at index %d", i)
		}
		converted := float32(value)
		if math.IsInf(float64(converted), 0) {
			return nil, fmt.Errorf("vector value at index %d is outside float32 range", i)
		}
		dst[i] = converted
	}
	return dst, nil
}

func explicitDenseToFloat32(value any, dimensions uint64) ([]float32, error) {
	switch vector := value.(type) {
	case []float64:
		return denseToFloat32(vector, int64(dimensions))
	case []float32:
		if uint64(len(vector)) != dimensions {
			return nil, fmt.Errorf("vector dimension is %d, expected %d", len(vector), dimensions)
		}
		result := make([]float32, len(vector))
		for i, item := range vector {
			if math.IsNaN(float64(item)) || math.IsInf(float64(item), 0) {
				return nil, fmt.Errorf("vector contains non-finite value at index %d", i)
			}
			result[i] = item
		}
		return result, nil
	default:
		return nil, fmt.Errorf("value must be []float64 or []float32, got %T", value)
	}
}

func sparseToQdrant(src map[int]float64) ([]uint32, []float32, error) {
	keys := make([]int, 0, len(src))
	for key, value := range src {
		if key < 0 || uint64(key) > math.MaxUint32 {
			return nil, nil, fmt.Errorf("sparse index %d is outside uint32 range", key)
		}
		if math.IsNaN(value) || math.IsInf(value, 0) {
			return nil, nil, fmt.Errorf("sparse value for index %d is not finite", key)
		}
		if math.IsInf(float64(float32(value)), 0) {
			return nil, nil, fmt.Errorf("sparse value for index %d is outside float32 range", key)
		}
		keys = append(keys, key)
	}
	sort.Ints(keys)
	indices := make([]uint32, len(keys))
	values := make([]float32, len(keys))
	for i, key := range keys {
		indices[i] = uint32(key)
		values[i] = float32(src[key])
	}
	return indices, values, nil
}

func explicitSparseToQdrant(value any) ([]uint32, []float32, error) {
	switch vector := value.(type) {
	case map[int]float64:
		return sparseToQdrant(vector)
	case map[uint32]float32:
		indices := make([]uint32, 0, len(vector))
		for index, item := range vector {
			if math.IsNaN(float64(item)) || math.IsInf(float64(item), 0) {
				return nil, nil, fmt.Errorf("sparse value for index %d is not finite", index)
			}
			indices = append(indices, index)
		}
		sort.Slice(indices, func(i, j int) bool { return indices[i] < indices[j] })
		values := make([]float32, len(indices))
		for i, index := range indices {
			values[i] = vector[index]
		}
		return indices, values, nil
	default:
		return nil, nil, fmt.Errorf("value must be map[int]float64 or map[uint32]float32, got %T", value)
	}
}

func isVectorValue(value any) bool {
	switch value.(type) {
	case []float64, []float32, map[int]float64, map[uint32]float32:
		return true
	default:
		return false
	}
}

func isBuiltInPayloadField(field string) bool {
	switch field {
	case searchstore.FieldID, searchstore.FieldCreatorID, searchstore.FieldTextContent:
		return true
	default:
		return false
	}
}

func (q *qdrantSearchStore) normalizePayloadValue(field string, value any) (any, error) {
	switch q.payloadTypes[field] {
	case qdrantapi.PayloadSchemaType_Integer:
		integer, ok := integerValue(value)
		if !ok {
			return nil, fmt.Errorf("value must be an integer, got %T", value)
		}
		return integer, nil
	case qdrantapi.PayloadSchemaType_Keyword, qdrantapi.PayloadSchemaType_Text, qdrantapi.PayloadSchemaType_Uuid:
		if _, ok := value.(string); !ok {
			return nil, fmt.Errorf("value must be a string, got %T", value)
		}
	case qdrantapi.PayloadSchemaType_Bool:
		if _, ok := value.(bool); !ok {
			return nil, fmt.Errorf("value must be a bool, got %T", value)
		}
	}
	return value, nil
}

func uniqueStrings(values []string) []string {
	result := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

func scoredPointsToDocuments(points []*qdrantapi.ScoredPoint) ([]*schema.Document, error) {
	docs := make([]*schema.Document, 0, len(points))
	for _, point := range points {
		if point == nil {
			continue
		}
		payload := make(map[string]any, len(point.GetPayload()))
		for key, value := range point.GetPayload() {
			converted, err := valueToAny(value)
			if err != nil {
				return nil, fmt.Errorf("[scoredPointsToDocuments] decode field %q failed: %w", key, err)
			}
			payload[key] = converted
		}

		doc := &schema.Document{MetaData: map[string]any{}}
		if id, ok := payload[searchstore.FieldID].(int64); ok {
			doc.ID = strconv.FormatInt(id, 10)
		} else if point.GetId() != nil {
			doc.ID = pointIDString(point.GetId())
		}
		if creatorID, ok := payload[searchstore.FieldCreatorID].(int64); ok {
			doc = document.WithDocumentCreatorID(doc, creatorID)
		} else {
			return nil, fmt.Errorf("[scoredPointsToDocuments] creator_id missing or invalid for document %s", doc.ID)
		}
		if content, ok := payload[searchstore.FieldTextContent].(string); ok {
			doc.Content = content
		}
		ext := make(map[string]any)
		for key, value := range payload {
			if !isBuiltInPayloadField(key) {
				ext[key] = value
			}
		}
		addPointVectors(ext, point.GetVectors())
		doc = document.WithDocumentExternalStorage(doc, ext).WithScore(float64(point.GetScore()))
		docs = append(docs, doc)
	}
	return docs, nil
}

func addPointVectors(ext map[string]any, vectors *qdrantapi.VectorsOutput) {
	named := vectors.GetVectors()
	if named == nil {
		return
	}
	for name, vector := range named.Vectors {
		if dense := vector.GetDenseVector(); dense != nil {
			ext[name] = append([]float32(nil), dense.Data...)
			continue
		}
		if sparse := vector.GetSparseVector(); sparse != nil {
			decoded := make(map[uint32]float32, len(sparse.Indices))
			for i, index := range sparse.Indices {
				decoded[index] = sparse.Values[i]
			}
			ext[name] = decoded
		}
	}
}

func normalizeScores(docs []*schema.Document, distance qdrantapi.Distance) {
	if len(docs) == 0 {
		return
	}
	switch distance {
	case qdrantapi.Distance_Dot, qdrantapi.Distance_Cosine:
		for _, doc := range docs {
			doc.WithScore((doc.Score() + 1) / 2)
		}
	case qdrantapi.Distance_Euclid, qdrantapi.Distance_Manhattan:
		minScore, maxScore := docs[0].Score(), docs[0].Score()
		for _, doc := range docs[1:] {
			minScore = min(minScore, doc.Score())
			maxScore = max(maxScore, doc.Score())
		}
		span := maxScore - minScore
		for _, doc := range docs {
			if span == 0 {
				doc.WithScore(1)
			} else {
				doc.WithScore(1 - (doc.Score()-minScore)/span)
			}
		}
	}
}

func pointIDString(id *qdrantapi.PointId) string {
	if uuid := id.GetUuid(); uuid != "" {
		return uuid
	}
	return strconv.FormatUint(id.GetNum(), 10)
}

func valueToAny(value *qdrantapi.Value) (any, error) {
	if value == nil {
		return nil, nil
	}
	switch kind := value.GetKind().(type) {
	case *qdrantapi.Value_NullValue:
		return nil, nil
	case *qdrantapi.Value_BoolValue:
		return kind.BoolValue, nil
	case *qdrantapi.Value_IntegerValue:
		return kind.IntegerValue, nil
	case *qdrantapi.Value_DoubleValue:
		return kind.DoubleValue, nil
	case *qdrantapi.Value_StringValue:
		return kind.StringValue, nil
	case *qdrantapi.Value_ListValue:
		values := kind.ListValue.GetValues()
		result := make([]any, len(values))
		for i, item := range values {
			converted, err := valueToAny(item)
			if err != nil {
				return nil, err
			}
			result[i] = converted
		}
		return result, nil
	case *qdrantapi.Value_StructValue:
		result := make(map[string]any, len(kind.StructValue.GetFields()))
		for key, item := range kind.StructValue.GetFields() {
			converted, err := valueToAny(item)
			if err != nil {
				return nil, err
			}
			result[key] = converted
		}
		return result, nil
	default:
		return nil, fmt.Errorf("unsupported qdrant payload type %T", kind)
	}
}

func toSlice(value any) ([]any, error) {
	if value == nil {
		return []any{nil}, nil
	}
	rv := reflect.ValueOf(value)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		return []any{value}, nil
	}
	items := make([]any, rv.Len())
	for i := 0; i < rv.Len(); i++ {
		items[i] = rv.Index(i).Interface()
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("filter value list is empty")
	}
	return items, nil
}
