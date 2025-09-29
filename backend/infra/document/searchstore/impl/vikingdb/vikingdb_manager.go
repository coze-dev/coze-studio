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
	"fmt"
	"strings"

	"github.com/volcengine/volc-sdk-golang/service/vikingdb"

	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ManagerConfig struct {
	Service *vikingdb.VikingDBService

	IndexingConfig  *VikingIndexingConfig
	EmbeddingConfig *VikingEmbeddingConfig

	// TODO: cache viking collection & index client
}

type VikingIndexingConfig struct {
	// vector index config
	Type     IndexType      // default: hnsw / hnsw_hybrid
	Distance *IndexDistance // default: ip
	Quant    *IndexQuant    // default: int8
	HnswM    *int64         // default: 20
	HnswCef  *int64         // default: 400
	HnswSef  *int64         // default: 800

	// others
	CpuQuota   int64 // default: 2
	ShardCount int64 // default: 1
}

type VikingEmbeddingConfig struct {
	UseVikingEmbedding bool
	EnableHybrid       bool

	// viking embedding config
	ModelName    VikingEmbeddingModelName
	ModelVersion *string
	DenseWeight  *float64

	// builtin embedding config
	BuiltinEmbedding embedding.Embedder
}

func NewVikingDBService(host string, region string, ak string, sk string, scheme string) *vikingdb.VikingDBService {
	return vikingdb.NewVikingDBService(host, region, ak, sk, scheme)
}

func NewManager(config *ManagerConfig) (searchstore.Manager, error) {
	if config.Service == nil {
		return nil, fmt.Errorf("[NewManager] vikingdb service is nil")
	}
	if config.EmbeddingConfig == nil {
		return nil, fmt.Errorf("[NewManager] vikingdb embedding config is nil")
	}
	if !config.EmbeddingConfig.UseVikingEmbedding && config.EmbeddingConfig.BuiltinEmbedding == nil {
		return nil, fmt.Errorf("[NewManager] vikingdb built embedding not provided")
	}
	if !config.EmbeddingConfig.UseVikingEmbedding && config.EmbeddingConfig.EnableHybrid {
		return nil, fmt.Errorf("[NewManager] vikingdb hybrid not support for builtin embedding")
	}
	if config.EmbeddingConfig.UseVikingEmbedding && config.EmbeddingConfig.ModelName == "" {
		return nil, fmt.Errorf("[NewManager] vikingdb model name is empty")
	}
	if config.EmbeddingConfig.UseVikingEmbedding &&
		config.EmbeddingConfig.EnableHybrid &&
		config.EmbeddingConfig.ModelName.SupportStatus() != embedding.SupportDenseAndSparse {
		return nil, fmt.Errorf("[NewManager] vikingdb embedding model not support sparse embedding, model=%v", config.EmbeddingConfig.ModelName)
	}
	if config.IndexingConfig == nil {
		config.IndexingConfig = &VikingIndexingConfig{}
	}
	if config.IndexingConfig.Type == "" {
		if !config.EmbeddingConfig.UseVikingEmbedding || !config.EmbeddingConfig.EnableHybrid {
			config.IndexingConfig.Type = IndexTypeHNSW
		} else {
			config.IndexingConfig.Type = IndexTypeHNSWHybrid
		}
	}
	if config.IndexingConfig.Distance == nil {
		config.IndexingConfig.Distance = ptr.Of(IndexDistanceIP)
	}
	if config.IndexingConfig.Quant == nil {
		config.IndexingConfig.Quant = ptr.Of(IndexQuantInt8)
	}
	if config.IndexingConfig.HnswM == nil {
		config.IndexingConfig.HnswM = ptr.Of(int64(20))
	}
	if config.IndexingConfig.HnswCef == nil {
		config.IndexingConfig.HnswCef = ptr.Of(int64(400))
	}
	if config.IndexingConfig.HnswSef == nil {
		config.IndexingConfig.HnswSef = ptr.Of(int64(800))
	}
	if config.IndexingConfig.CpuQuota == 0 {
		config.IndexingConfig.CpuQuota = 2
	}
	if config.IndexingConfig.ShardCount == 0 {
		config.IndexingConfig.ShardCount = 1
	}

	return &manager{
		config: config,
	}, nil
}

type manager struct {
	config *ManagerConfig
}

func (m *manager) Create(ctx context.Context, req *searchstore.CreateRequest) error {
	if err := m.createCollection(ctx, req); err != nil {
		return err
	}

	if err := m.createIndex(ctx, req); err != nil {
		return err
	}

	return nil
}

func (m *manager) Drop(_ context.Context, req *searchstore.DropRequest) error {
	if err := m.config.Service.DropIndex(req.CollectionName, vikingIndexName); err != nil {
		if !strings.Contains(err.Error(), errIndexNotFound) {
			return err
		}
	}
	if err := m.config.Service.DropCollection(req.CollectionName); err != nil {
		if !strings.Contains(err.Error(), errCollectionNotFound) {
			return err
		}
	}

	return nil
}

func (m *manager) GetType() searchstore.SearchStoreType {
	return searchstore.TypeVectorStore
}

func (m *manager) GetSearchStore(_ context.Context, collectionName string) (searchstore.SearchStore, error) {
	collection, err := m.config.Service.GetCollection(collectionName)
	if err != nil {
		return nil, err
	}

	return &vkSearchStore{manager: m, collection: collection}, nil
}

func (m *manager) createCollection(ctx context.Context, req *searchstore.CreateRequest) error {
	svc := m.config.Service

	collection, err := svc.GetCollection(req.CollectionName)
	if err != nil {
		if !strings.Contains(err.Error(), errCollectionNotFound) {
			return err
		}
	} else if collection != nil {
		return nil
	}

	fields, vopts, err := m.mapFields(req.Fields)
	if err != nil {
		return err
	}

	if vopts != nil {
		_, err = svc.CreateCollection(req.CollectionName, fields, "", vopts)
	} else {
		_, err = svc.CreateCollection(req.CollectionName, fields, "")
	}
	if err != nil {
		return err
	}

	logs.CtxInfof(ctx, "[vikingdb] Create collection success, collection=%s", req.CollectionName)

	return nil
}

func (m *manager) createIndex(ctx context.Context, req *searchstore.CreateRequest) error {
	svc := m.config.Service
	index, err := svc.GetIndex(req.CollectionName, vikingIndexName)
	if err != nil {
		if !strings.Contains(err.Error(), errIndexNotFound) {
			return err
		}
	} else if index != nil {
		return nil
	}

	vectorIndex := &vikingdb.VectorIndexParams{
		IndexType: string(m.config.IndexingConfig.Type),
		Distance:  string(ptr.From(m.config.IndexingConfig.Distance)),
		Quant:     string(ptr.From(m.config.IndexingConfig.Quant)),
		HnswM:     ptr.From(m.config.IndexingConfig.HnswM),
		HnswCef:   ptr.From(m.config.IndexingConfig.HnswCef),
		HnswSef:   ptr.From(m.config.IndexingConfig.HnswSef),
	}

	opts := vikingdb.NewIndexOptions().
		SetVectorIndex(vectorIndex).
		SetCpuQuota(m.config.IndexingConfig.CpuQuota).
		SetShardCount(m.config.IndexingConfig.ShardCount)

	_, err = svc.CreateIndex(req.CollectionName, vikingIndexName, opts)
	if err != nil {
		return err
	}

	logs.CtxInfof(ctx, "[vikingdb] Create index success, collection=%s, index=%s", req.CollectionName, vikingIndexName)

	return nil
}

func (m *manager) mapFields(srcFields []*searchstore.Field) ([]vikingdb.Field, []*vikingdb.VectorizeTuple, error) {
	var (
		foundID        bool
		foundCreatorID bool
		dstFields      = make([]vikingdb.Field, 0, len(srcFields))
		vectorizeOpts  []*vikingdb.VectorizeTuple
		embConfig      = m.config.EmbeddingConfig
	)

	for _, srcField := range srcFields {
		switch srcField.Name {
		case searchstore.FieldID:
			foundID = true
		case searchstore.FieldCreatorID:
			foundCreatorID = true
		default:
		}

		if srcField.Indexing {
			if srcField.Type != searchstore.FieldTypeText {
				return nil, nil, fmt.Errorf("[mapFields] currently only support text field indexing, field=%s", srcField.Name)
			}
			if embConfig.UseVikingEmbedding {
				vt := vikingdb.NewVectorizeTuple().SetDense(m.newVectorizeModelConf(srcField.Name, false))
				if embConfig.EnableHybrid {
					vt = vt.SetSparse(m.newVectorizeModelConf(srcField.Name, true))
				}
				vectorizeOpts = append(vectorizeOpts, vt)
			} else {
				dstFields = append(dstFields, vikingdb.Field{
					FieldName:  denseFieldName(srcField.Name),
					FieldType:  vikingdb.Vector,
					DefaultVal: nil,
					Dim:        m.getDims(),
				})
			}

		}

		dstField := vikingdb.Field{
			FieldName:    srcField.Name,
			IsPrimaryKey: srcField.IsPrimary,
		}
		switch srcField.Type {
		case searchstore.FieldTypeInt64:
			dstField.FieldType = vikingdb.Int64
		case searchstore.FieldTypeText:
			dstField.FieldType = vikingdb.Text
		case searchstore.FieldTypeDenseVector:
			dstField.FieldType = vikingdb.Vector
			dstField.Dim = m.getDims()
		case searchstore.FieldTypeSparseVector:
			dstField.FieldType = vikingdb.Sparse_Vector
		default:
			return nil, nil, fmt.Errorf("unknown field type: %v", srcField.Type)
		}
		dstFields = append(dstFields, dstField)
	}

	if !foundID {
		dstFields = append(dstFields, vikingdb.Field{
			FieldName:    searchstore.FieldID,
			FieldType:    vikingdb.Int64,
			IsPrimaryKey: true,
		})
	}

	if !foundCreatorID {
		dstFields = append(dstFields, vikingdb.Field{
			FieldName: searchstore.FieldCreatorID,
			FieldType: vikingdb.Int64,
		})
	}

	return dstFields, vectorizeOpts, nil
}

func (m *manager) newVectorizeModelConf(fieldName string, isSparse bool) *vikingdb.VectorizeModelConf {
	embConfig := m.config.EmbeddingConfig
	vmc := vikingdb.NewVectorizeModelConf().
		SetTextField(fieldName).
		SetModelName(string(embConfig.ModelName))
	if !isSparse {
		vmc = vmc.SetDim(m.getDims())
	}
	if embConfig.ModelVersion != nil {
		vmc = vmc.SetModelVersion(ptr.From(embConfig.ModelVersion))
	}
	return vmc
}

func (m *manager) getDims() int64 {
	if m.config.EmbeddingConfig.UseVikingEmbedding {
		return m.config.EmbeddingConfig.ModelName.Dimensions()
	}

	return m.config.EmbeddingConfig.BuiltinEmbedding.Dimensions()
}
