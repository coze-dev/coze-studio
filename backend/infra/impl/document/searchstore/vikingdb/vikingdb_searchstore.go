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

package vikingdb

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"
	"github.com/volcengine/volc-sdk-golang/service/vikingdb"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type vkSearchStore struct {
	*manager
	collection *vikingdb.Collection
	index      *vikingdb.Index
}

func (v *vkSearchStore) Store(ctx context.Context, docs []*schema.Document, opts ...indexer.Option) (ids []string, err error) {
	if len(docs) == 0 {
		return nil, nil
	}

	implSpecOptions := indexer.GetImplSpecificOptions(&searchstore.IndexerOptions{}, opts...)

	defer func() {
		if err != nil {
			if implSpecOptions.ProgressBar != nil {
				_ = implSpecOptions.ProgressBar.ReportError(err)
			}
		}
	}()

	docsWithoutVector, err := slices.TransformWithErrorCheck(docs, v.document2DataWithoutVector)
	if err != nil {
		return nil, fmt.Errorf("[Store] vikingdb failed to transform documents, %w", err)
	}

	indexingFields := sets.FromSlice(implSpecOptions.IndexingFields)
	for _, part := range slices.Chunks(docsWithoutVector, 100) {
		docsWithVector, err := v.addEmbedding(ctx, part, indexingFields)
		if err != nil {
			return nil, err
		}

		if err := v.collection.UpsertData(docsWithVector); err != nil {
			return nil, err
		}

		if implSpecOptions.ProgressBar != nil {
			if err = implSpecOptions.ProgressBar.AddN(len(part)); err != nil {
				return nil, err
			}
		}
	}

	ids = slices.Transform(docs, func(a *schema.Document) string { return a.ID })

	return
}

func (v *vkSearchStore) Retrieve(ctx context.Context, query string, opts ...retriever.Option) (docs []*schema.Document, err error) {
	indexClient := v.index
	if indexClient == nil {
		foundIndex := false
		for _, index := range v.collection.Indexes {
			if index.IndexName == vikingIndexName {
				foundIndex = true
				break
			}
		}
		if !foundIndex {
			return nil, fmt.Errorf("[Retrieve] vikingdb index not found, name=%s", vikingIndexName)
		}

		indexClient, err = v.config.Service.GetIndex(v.collection.CollectionName, vikingIndexName)
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] vikingdb failed to get index, %w", err)
		}
	}

	options := retriever.GetCommonOptions(&retriever.Options{TopK: ptr.Of(4)}, opts...)
	implSpecOptions := retriever.GetImplSpecificOptions(&searchstore.RetrieverOptions{}, opts...)

	searchOpts := vikingdb.NewSearchOptions().
		SetLimit(int64(ptr.From(options.TopK))).
		SetText(query).
		SetRetry(true)

	filter, err := v.genFilter(ctx, options, implSpecOptions)
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] vikingdb failed to build filter, %w", err)
	}
	if filter != nil {
		// Cross-partition recall is not supported, use filter instead
		searchOpts = searchOpts.SetFilter(filter)
	}

	var data []*vikingdb.Data

	if v.config.EmbeddingConfig.UseVikingEmbedding {
		data, err = indexClient.SearchWithMultiModal(searchOpts)
	} else {
		var dense [][]float64
		dense, err = v.config.EmbeddingConfig.BuiltinEmbedding.EmbedStrings(ctx, []string{query})
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] embed failed, %w", err)
		}
		if len(dense) != 1 {
			return nil, fmt.Errorf("[Retrieve] unexpected dense vector size, expected=1, got=%d", len(dense))
		}
		data, err = indexClient.SearchByVector(dense[0], searchOpts)
	}
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] vikingdb search failed, %w", err)
	}

	docs, err = v.parseSearchResult(data)
	if err != nil {
		return nil, err
	}

	return
}

func (v *vkSearchStore) Delete(ctx context.Context, ids []string) error {
	for _, part := range slices.Chunks(ids, 100) {
		if err := v.collection.DeleteData(part); err != nil {
			return err
		}
	}

	return nil
}

func (v *vkSearchStore) document2DataWithoutVector(doc *schema.Document) (data vikingdb.Data, err error) {
	creatorID, err := document.GetDocumentCreatorID(doc)
	if err != nil {
		return data, err
	}

	docID, err := strconv.ParseInt(doc.ID, 10, 64)
	if err != nil {
		return data, err
	}

	fields := map[string]interface{}{
		searchstore.FieldID:          docID,
		searchstore.FieldCreatorID:   creatorID,
		searchstore.FieldTextContent: doc.Content,
	}

	if ext, err := document.GetDocumentExternalStorage(doc); err == nil { // try load
		for key, val := range ext {
			fields[key] = val
		}
	}
	return vikingdb.Data{
		Id:     doc.ID,
		Fields: fields,
	}, nil
}

func (v *vkSearchStore) addEmbedding(ctx context.Context, rows []vikingdb.Data, indexingFields map[string]struct{}) ([]vikingdb.Data, error) {
	if v.config.EmbeddingConfig.UseVikingEmbedding {
		return rows, nil
	}

	emb := v.config.EmbeddingConfig.BuiltinEmbedding

	for indexingField := range indexingFields {
		values := make([]string, len(rows))
		for i, row := range rows {
			val, found := row.Fields[indexingField]
			if !found {
				return nil, fmt.Errorf("[addEmbedding] indexing field not found in document, field=%s", indexingField)
			}

			strVal, ok := val.(string)
			if !ok {
				return nil, fmt.Errorf("[addEmbedding] val not string, field=%s, val=%v", indexingField, val)
			}

			values[i] = strVal
		}

		dense, err := emb.EmbedStrings(ctx, values)
		if err != nil {
			return nil, fmt.Errorf("[addEmbedding] failed to embed, %w", err)
		}
		if len(dense) != len(values) {
			return nil, fmt.Errorf("[addEmbedding] unexpected dense vector size, expected=%d, got=%d", len(values), len(dense))
		}

		df := denseFieldName(indexingField)
		for i := range dense {
			rows[i].Fields[df] = dense[i]
		}
	}

	return rows, nil
}

func (v *vkSearchStore) parseSearchResult(result []*vikingdb.Data) ([]*schema.Document, error) {
	docs := make([]*schema.Document, 0, len(result))
	for _, data := range result {
		ext := make(map[string]any)
		doc := document.WithDocumentExternalStorage(&schema.Document{MetaData: map[string]any{}}, ext).
			WithScore(data.Score)

		for field, val := range data.Fields {
			switch field {
			case searchstore.FieldID:
				jn, ok := val.(json.Number)
				if !ok {
					return nil, fmt.Errorf("[parseSearchResult] id type assertion failed, val=%v", val)
				}
				doc.ID = jn.String()
			case searchstore.FieldCreatorID:
				jn, ok := val.(json.Number)
				if !ok {
					return nil, fmt.Errorf("[parseSearchResult] creator_id type assertion failed, val=%v", val)
				}
				creatorID, err := jn.Int64()
				if err != nil {
					return nil, fmt.Errorf("[parseSearchResult] creator_id value not int64, val=%v", jn.String())
				}
				doc = document.WithDocumentCreatorID(doc, creatorID)
			case searchstore.FieldTextContent:
				text, ok := val.(string)
				if !ok {
					return nil, fmt.Errorf("[parseSearchResult] content value not string, val=%v", val)
				}
				doc.Content = text
			default:
				switch t := val.(type) {
				case json.Number:
					if i64, err := t.Int64(); err == nil {
						ext[field] = i64
					} else if f64, err := t.Float64(); err == nil {
						ext[field] = f64
					} else {
						ext[field] = t.String()
					}
				default:
					ext[field] = val
				}
			}
		}

		docs = append(docs, doc)
	}

	return docs, nil
}

func (v *vkSearchStore) genFilter(ctx context.Context, co *retriever.Options, ro *searchstore.RetrieverOptions) (map[string]any, error) {
	filter, err := v.dsl2Filter(ctx, co.DSLInfo)
	if err != nil {
		return nil, err
	}

	if ro.PartitionKey != nil && len(ro.Partitions) > 0 {
		var (
			key       = ptr.From(ro.PartitionKey)
			fieldType = ""
			conds     any
		)
		for _, field := range v.collection.Fields {
			if field.FieldName == key {
				fieldType = field.FieldType
			}
		}
		if fieldType == "" {
			return nil, fmt.Errorf("[Retrieve] partition key not found, key=%s", key)
		}

		switch fieldType {
		case vikingdb.Int64:
			c := make([]int64, 0, len(ro.Partitions))
			for _, item := range ro.Partitions {
				i64, err := strconv.ParseInt(item, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("[Retrieve] partition value parse error, key=%s, val=%v, err=%v", key, item, err)
				}
				c = append(c, i64)
			}
			conds = c
		case vikingdb.String:
			conds = ro.Partitions
		default:
			return nil, fmt.Errorf("[Retrieve] invalid field type for partition, key=%s, type=%s", key, fieldType)
		}

		op := map[string]any{"op": "must", "field": key, "conds": conds}

		if filter != nil {
			filter = op
		} else {
			filter = map[string]any{
				"op":    "and",
				"conds": []map[string]any{op, filter},
			}
		}
	}

	return filter, nil
}

func (v *vkSearchStore) dsl2Filter(ctx context.Context, src map[string]any) (map[string]any, error) {
	dsl, err := searchstore.LoadDSL(src)
	if err != nil {
		return nil, err
	}
	if dsl == nil {
		return nil, nil
	}

	toSliceValue := func(val any) any {
		if reflect.TypeOf(val).Kind() == reflect.Slice {
			return val
		}
		return []any{val}
	}

	var filter map[string]any

	switch dsl.Op {
	case searchstore.OpEq, searchstore.OpIn:
		filter = map[string]any{
			"op":    "must",
			"field": dsl.Field,
			"conds": toSliceValue(dsl.Value),
		}
	case searchstore.OpNe:
		filter = map[string]any{
			"op":    "must_not",
			"field": dsl.Field,
			"conds": toSliceValue(dsl.Value),
		}
	case searchstore.OpLike:
		logs.CtxWarnf(ctx, "[dsl2Filter] vikingdb invalid dsl type, skip, type=%s", dsl.Op)
	case searchstore.OpAnd, searchstore.OpOr:
		var conds []map[string]any
		sub, ok := dsl.Value.([]map[string]any)
		if !ok {
			return nil, fmt.Errorf("[dsl2Filter] invalid value for and/or, should be []map[string]any")
		}
		for _, subDSL := range sub {
			cond, err := v.dsl2Filter(ctx, subDSL)
			if err != nil {
				return nil, err
			}
			conds = append(conds, cond)
		}
		op := "and"
		if dsl.Op == searchstore.OpOr {
			op = "or"
		}
		filter = map[string]any{
			"op":    op,
			"field": dsl.Field,
			"conds": conds,
		}
	}

	return filter, nil
}
