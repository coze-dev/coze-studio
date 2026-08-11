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
	"sort"
	"strings"

	qdrantapi "github.com/qdrant/go-client/qdrant"

	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const (
	defaultBatchSize = 64
	densePrefix      = "dense_"
	sparsePrefix     = "sparse_"
)

type client interface {
	CollectionExists(ctx context.Context, collectionName string) (bool, error)
	GetCollectionInfo(ctx context.Context, collectionName string) (*qdrantapi.CollectionInfo, error)
	CreateCollection(ctx context.Context, request *qdrantapi.CreateCollection) error
	DeleteCollection(ctx context.Context, collectionName string) error
	CreateFieldIndex(ctx context.Context, request *qdrantapi.CreateFieldIndexCollection) (*qdrantapi.UpdateResult, error)
	Upsert(ctx context.Context, request *qdrantapi.UpsertPoints) (*qdrantapi.UpdateResult, error)
	Delete(ctx context.Context, request *qdrantapi.DeletePoints) (*qdrantapi.UpdateResult, error)
	Query(ctx context.Context, request *qdrantapi.QueryPoints) ([]*qdrantapi.ScoredPoint, error)
}

type ManagerConfig struct {
	Client    client
	Embedding embedding.Embedder

	EnableHybrid *bool
	Distance     qdrantapi.Distance
	ShardNum     uint32
	BatchSize    int
}

func NewManager(config *ManagerConfig) (searchstore.Manager, error) {
	if config == nil {
		return nil, fmt.Errorf("[NewManager] qdrant config not provided")
	}
	if config.Client == nil {
		return nil, fmt.Errorf("[NewManager] qdrant client not provided")
	}
	if config.Embedding == nil {
		return nil, fmt.Errorf("[NewManager] qdrant embedder not provided")
	}

	supportsSparse := config.Embedding.SupportStatus() == embedding.SupportDenseAndSparse
	if config.EnableHybrid == nil {
		config.EnableHybrid = ptr.Of(supportsSparse)
	} else if ptr.From(config.EnableHybrid) && !supportsSparse {
		return nil, fmt.Errorf("[NewManager] qdrant hybrid search requires a dense-and-sparse embedder")
	}
	if config.Distance == qdrantapi.Distance_UnknownDistance {
		config.Distance = qdrantapi.Distance_Dot
	}
	if config.ShardNum == 0 {
		config.ShardNum = 1
	}
	if config.BatchSize <= 0 {
		config.BatchSize = defaultBatchSize
	}

	return &manager{config: config}, nil
}

type manager struct {
	config *ManagerConfig
}

func (m *manager) Create(ctx context.Context, req *searchstore.CreateRequest) error {
	if req == nil || req.CollectionName == "" || len(req.Fields) == 0 {
		return fmt.Errorf("[Create] invalid request params")
	}

	dense, sparse, err := m.vectorConfig(req.Fields)
	if err != nil {
		return fmt.Errorf("[Create] invalid fields: %w", err)
	}

	exists, err := m.config.Client.CollectionExists(ctx, req.CollectionName)
	if err != nil {
		return fmt.Errorf("[Create] check collection failed: %w", err)
	}
	if exists {
		info, err := m.config.Client.GetCollectionInfo(ctx, req.CollectionName)
		if err != nil {
			return fmt.Errorf("[Create] describe existing collection failed: %w", err)
		}
		if err := m.validateCollection(info, dense, sparse); err != nil {
			return err
		}
		return m.ensurePayloadIndexes(ctx, req.CollectionName, req.Fields, info.GetPayloadSchema())
	}

	create := &qdrantapi.CreateCollection{
		CollectionName: req.CollectionName,
		VectorsConfig:  qdrantapi.NewVectorsConfigMap(dense),
		ShardNumber:    ptr.Of(m.config.ShardNum),
	}
	if len(sparse) > 0 {
		create.SparseVectorsConfig = qdrantapi.NewSparseVectorsConfig(sparse)
	}
	if err := m.config.Client.CreateCollection(ctx, create); err != nil {
		return fmt.Errorf("[Create] create collection failed: %w", err)
	}

	return m.ensurePayloadIndexes(ctx, req.CollectionName, req.Fields, nil)
}

func (m *manager) ensurePayloadIndexes(ctx context.Context, collectionName string, fields []*searchstore.Field, existing map[string]*qdrantapi.PayloadSchemaInfo) error {
	for _, field := range fields {
		fieldType, schemaType, ok := payloadFieldTypes(field)
		if !ok {
			continue
		}
		if schema, exists := existing[field.Name]; exists {
			if schema.GetDataType() != schemaType {
				return fmt.Errorf("[Create] payload field %q has type %s, expected %s", field.Name, schema.GetDataType(), schemaType)
			}
			continue
		}
		if _, err := m.config.Client.CreateFieldIndex(ctx, &qdrantapi.CreateFieldIndexCollection{
			CollectionName: collectionName,
			FieldName:      field.Name,
			FieldType:      ptr.Of(fieldType),
			Wait:           ptr.Of(true),
		}); err != nil {
			return fmt.Errorf("[Create] create payload index for field %q failed: %w", field.Name, err)
		}
	}
	return nil
}

func (m *manager) Drop(ctx context.Context, req *searchstore.DropRequest) error {
	if req == nil || req.CollectionName == "" {
		return fmt.Errorf("[Drop] invalid request params")
	}
	exists, err := m.config.Client.CollectionExists(ctx, req.CollectionName)
	if err != nil {
		return fmt.Errorf("[Drop] check collection failed: %w", err)
	}
	if !exists {
		return nil
	}
	if err := m.config.Client.DeleteCollection(ctx, req.CollectionName); err != nil {
		return fmt.Errorf("[Drop] delete collection failed: %w", err)
	}
	return nil
}

func (m *manager) GetType() searchstore.SearchStoreType {
	return searchstore.TypeVectorStore
}

func (m *manager) GetSearchStore(ctx context.Context, collectionName string) (searchstore.SearchStore, error) {
	if collectionName == "" {
		return nil, fmt.Errorf("[GetSearchStore] collection name is empty")
	}
	exists, err := m.config.Client.CollectionExists(ctx, collectionName)
	if err != nil {
		return nil, fmt.Errorf("[GetSearchStore] check collection failed: %w", err)
	}
	if !exists {
		return nil, errorx.New(errno.ErrKnowledgeNonRetryableCode,
			errorx.KVf("reason", "[GetSearchStore] collection=%v does not exist", collectionName))
	}

	info, err := m.config.Client.GetCollectionInfo(ctx, collectionName)
	if err != nil {
		return nil, fmt.Errorf("[GetSearchStore] describe collection failed: %w", err)
	}
	indexingFields, err := indexingFieldsFromCollection(info)
	if err != nil {
		return nil, fmt.Errorf("[GetSearchStore] invalid collection schema: %w", err)
	}
	if err := m.validateEmbeddedVectors(info, indexingFields); err != nil {
		return nil, fmt.Errorf("[GetSearchStore] incompatible collection schema: %w", err)
	}
	denseVectorFields, sparseVectorFields := explicitVectorFieldsFromCollection(info)

	return &qdrantSearchStore{
		config:             m.config,
		collectionName:     collectionName,
		indexingFields:     indexingFields,
		payloadTypes:       payloadTypesFromCollection(info),
		denseVectorFields:  denseVectorFields,
		sparseVectorFields: sparseVectorFields,
	}, nil
}

func (m *manager) validateEmbeddedVectors(info *qdrantapi.CollectionInfo, fields []string) error {
	params := info.GetConfig().GetParams()
	dense := params.GetVectorsConfig().GetParamsMap().GetMap()
	sparse := params.GetSparseVectorsConfig().GetMap()
	hybrid := ptr.From(m.config.EnableHybrid)
	for _, field := range fields {
		name := denseFieldName(field)
		vector := dense[name]
		if vector.GetSize() != uint64(m.config.Embedding.Dimensions()) {
			return fmt.Errorf("dense vector %q has size %d, expected %d", name, vector.GetSize(), m.config.Embedding.Dimensions())
		}
		if vector.GetDistance() != m.config.Distance {
			return fmt.Errorf("dense vector %q has distance %s, expected %s", name, vector.GetDistance(), m.config.Distance)
		}
		if hybrid {
			name = sparseFieldName(field)
			if _, exists := sparse[name]; !exists {
				return fmt.Errorf("sparse vector %q is missing", name)
			}
		}
	}
	return nil
}

func (m *manager) vectorConfig(fields []*searchstore.Field) (map[string]*qdrantapi.VectorParams, map[string]*qdrantapi.SparseVectorParams, error) {
	dense := make(map[string]*qdrantapi.VectorParams)
	sparse := make(map[string]*qdrantapi.SparseVectorParams)
	vectorNames := make(map[string]struct{})
	embeddedFieldCount := 0
	hybrid := ptr.From(m.config.EnableHybrid)
	addVectorName := func(name string) error {
		if _, exists := vectorNames[name]; exists {
			return fmt.Errorf("duplicate qdrant vector name %q", name)
		}
		vectorNames[name] = struct{}{}
		return nil
	}
	addDense := func(name string) error {
		if err := addVectorName(name); err != nil {
			return err
		}
		dense[name] = &qdrantapi.VectorParams{
			Size:     uint64(m.config.Embedding.Dimensions()),
			Distance: m.config.Distance,
		}
		return nil
	}
	addSparse := func(name string) error {
		if err := addVectorName(name); err != nil {
			return err
		}
		sparse[name] = &qdrantapi.SparseVectorParams{}
		return nil
	}

	for _, field := range fields {
		if field == nil || field.Name == "" {
			return nil, nil, fmt.Errorf("field is nil or unnamed")
		}
		if field.Indexing {
			if field.Type != searchstore.FieldTypeText {
				return nil, nil, fmt.Errorf("qdrant only supports text field embedding, field=%s, type=%d", field.Name, field.Type)
			}
			if err := addDense(denseFieldName(field.Name)); err != nil {
				return nil, nil, err
			}
			if hybrid {
				if err := addSparse(sparseFieldName(field.Name)); err != nil {
					return nil, nil, err
				}
			}
			embeddedFieldCount++
		}

		switch field.Type {
		case searchstore.FieldTypeDenseVector:
			if strings.HasPrefix(field.Name, densePrefix) || strings.HasPrefix(field.Name, sparsePrefix) {
				return nil, nil, fmt.Errorf("explicit vector field %q uses a reserved prefix", field.Name)
			}
			if err := addDense(field.Name); err != nil {
				return nil, nil, err
			}
		case searchstore.FieldTypeSparseVector:
			if strings.HasPrefix(field.Name, densePrefix) || strings.HasPrefix(field.Name, sparsePrefix) {
				return nil, nil, fmt.Errorf("explicit vector field %q uses a reserved prefix", field.Name)
			}
			if err := addSparse(field.Name); err != nil {
				return nil, nil, err
			}
		}
	}
	if embeddedFieldCount == 0 {
		return nil, nil, fmt.Errorf("at least one indexing text field is required")
	}

	return dense, sparse, nil
}

func (m *manager) validateCollection(info *qdrantapi.CollectionInfo, dense map[string]*qdrantapi.VectorParams, sparse map[string]*qdrantapi.SparseVectorParams) error {
	if info == nil || info.GetConfig() == nil || info.GetConfig().GetParams() == nil {
		return fmt.Errorf("existing collection has no vector configuration")
	}
	params := info.GetConfig().GetParams()
	actualDense := params.GetVectorsConfig().GetParamsMap().GetMap()
	for name, expected := range dense {
		actual, ok := actualDense[name]
		if !ok {
			return fmt.Errorf("existing collection is missing dense vector %q", name)
		}
		if actual.GetSize() != expected.GetSize() || actual.GetDistance() != expected.GetDistance() {
			return fmt.Errorf("existing dense vector %q is incompatible: size=%d distance=%s, expected size=%d distance=%s",
				name, actual.GetSize(), actual.GetDistance(), expected.GetSize(), expected.GetDistance())
		}
	}
	actualSparse := params.GetSparseVectorsConfig().GetMap()
	for name := range sparse {
		if _, ok := actualSparse[name]; !ok {
			return fmt.Errorf("existing collection is missing sparse vector %q", name)
		}
	}
	return nil
}

func payloadFieldTypes(field *searchstore.Field) (qdrantapi.FieldType, qdrantapi.PayloadSchemaType, bool) {
	switch field.Type {
	case searchstore.FieldTypeInt64:
		return qdrantapi.FieldType_FieldTypeInteger, qdrantapi.PayloadSchemaType_Integer, true
	case searchstore.FieldTypeText:
		if field.Indexing {
			return qdrantapi.FieldType_FieldTypeText, qdrantapi.PayloadSchemaType_Text, true
		}
		return qdrantapi.FieldType_FieldTypeKeyword, qdrantapi.PayloadSchemaType_Keyword, true
	default:
		return 0, 0, false
	}
}

func indexingFieldsFromCollection(info *qdrantapi.CollectionInfo) ([]string, error) {
	if info == nil || info.GetConfig() == nil || info.GetConfig().GetParams() == nil ||
		info.GetConfig().GetParams().GetVectorsConfig() == nil {
		return nil, fmt.Errorf("dense vector configuration is missing")
	}
	fields := make([]string, 0)
	for name := range info.GetConfig().GetParams().GetVectorsConfig().GetParamsMap().GetMap() {
		if strings.HasPrefix(name, densePrefix) {
			fields = append(fields, strings.TrimPrefix(name, densePrefix))
		}
	}
	if len(fields) == 0 {
		return nil, fmt.Errorf("no embedded text vector fields found")
	}
	sort.Strings(fields)
	return fields, nil
}

func payloadTypesFromCollection(info *qdrantapi.CollectionInfo) map[string]qdrantapi.PayloadSchemaType {
	types := make(map[string]qdrantapi.PayloadSchemaType, len(info.GetPayloadSchema()))
	for field, schema := range info.GetPayloadSchema() {
		types[field] = schema.GetDataType()
	}
	return types
}

func explicitVectorFieldsFromCollection(info *qdrantapi.CollectionInfo) (map[string]uint64, sets.Set[string]) {
	dense := make(map[string]uint64)
	sparse := make(sets.Set[string])
	params := info.GetConfig().GetParams()
	for name, vector := range params.GetVectorsConfig().GetParamsMap().GetMap() {
		if !strings.HasPrefix(name, densePrefix) {
			dense[name] = vector.GetSize()
		}
	}
	for name := range params.GetSparseVectorsConfig().GetMap() {
		if !strings.HasPrefix(name, sparsePrefix) {
			sparse[name] = struct{}{}
		}
	}
	return dense, sparse
}

func denseFieldName(name string) string {
	return densePrefix + name
}

func sparseFieldName(name string) string {
	return sparsePrefix + name
}
