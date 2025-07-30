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
	"os"
	"testing"

	"github.com/cloudwego/eino-ext/components/embedding/openai"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"github.com/volcengine/volc-sdk-golang/service/vikingdb"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/impl/embedding/wrap"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestVikingEmbeddingIntegration(t *testing.T) {
	if os.Getenv("ENABLE_VIKINGDB_INTEGRATION_TEST") != "true" {
		return
	}

	ctx := context.Background()
	svc := vikingdb.NewVikingDBService(
		"api-vikingdb.volces.com",
		"cn-beijing",
		os.Getenv("VIKING_DB_AK"),
		os.Getenv("VIKING_DB_SK"),
		"https",
	)

	cfg := &ManagerConfig{
		Service:        svc,
		IndexingConfig: nil,
		EmbeddingConfig: &VikingEmbeddingConfig{
			UseVikingEmbedding: true,
			EnableHybrid:       false,
			ModelName:          ModelNameDoubaoEmbedding,
			ModelVersion:       ModelNameDoubaoEmbedding.ModelVersion(),
			DenseWeight:        nil,
			BuiltinEmbedding:   nil,
		},
	}

	mgr, err := NewManager(cfg)
	assert.NoError(t, err)

	collectionName := "test_coze_coll_1"

	t.Run("create", func(t *testing.T) {
		err = mgr.Create(ctx, &searchstore.CreateRequest{
			CollectionName: collectionName,
			Fields: []*searchstore.Field{
				{
					Name:      searchstore.FieldID,
					Type:      searchstore.FieldTypeInt64,
					IsPrimary: true,
				},
				{
					Name: searchstore.FieldCreatorID,
					Type: searchstore.FieldTypeInt64,
				},
				{
					Name: "document_id",
					Type: searchstore.FieldTypeInt64,
				},
				{
					Name:     searchstore.FieldTextContent,
					Type:     searchstore.FieldTypeText,
					Indexing: true,
				},
			},
			CollectionMeta: nil,
		})
		assert.NoError(t, err)
	})

	t.Run("store", func(t *testing.T) {
		ss, err := mgr.GetSearchStore(ctx, collectionName)
		assert.NoError(t, err)

		ids, err := ss.Store(ctx, []*schema.Document{
			{
				ID:      "101",
				Content: "埃菲尔铁塔：位于法国巴黎，是世界上最著名的地标之一，由居斯塔夫・埃菲尔设计并建于 1889 年。",
				MetaData: map[string]any{
					document.MetaDataKeyCreatorID: int64(111),
					document.MetaDataKeyExternalStorage: map[string]any{
						"document_id": int64(567),
					},
				},
			},
			{
				ID:      "102",
				Content: "长城：位于中国，是世界七大奇迹之一，从秦至明代修筑而成，全长超过 2 万公里",
				MetaData: map[string]any{
					document.MetaDataKeyCreatorID: int64(111),
					document.MetaDataKeyExternalStorage: map[string]any{
						"document_id": int64(567),
					},
				},
			},
			{
				ID:      "103",
				Content: "罗马斗兽场：位于意大利罗马，于公元 70-80 年间建成，是古罗马帝国最大的圆形竞技场。",
				MetaData: map[string]any{
					document.MetaDataKeyCreatorID: int64(111),
					document.MetaDataKeyExternalStorage: map[string]any{
						"document_id": int64(568),
					},
				},
			},
		}, searchstore.WithIndexingFields([]string{searchstore.FieldTextContent}))
		assert.NoError(t, err)
		fmt.Println(ids)
	})

	t.Run("retrieve", func(t *testing.T) {
		ss, err := mgr.GetSearchStore(ctx, collectionName)
		assert.NoError(t, err)

		dsl := &searchstore.DSL{
			Op:    searchstore.OpIn,
			Field: "creator_id",
			Value: int64(111),
		}
		opts := []retriever.Option{
			searchstore.WithRetrieverPartitionKey("document_id"),
			searchstore.WithPartitions([]string{"567"}),
			retriever.WithDSLInfo(dsl.DSL()),
		}
		resp, err := ss.Retrieve(ctx, "旅游景点推荐", opts...)
		assert.NoError(t, err)
		fmt.Println(resp)
	})

	t.Run("drop", func(t *testing.T) {
		assert.NoError(t, mgr.Drop(ctx, &searchstore.DropRequest{CollectionName: collectionName}))
	})
}

func TestBuiltinEmbeddingIntegration(t *testing.T) {
	if os.Getenv("ENABLE_VIKINGDB_INTEGRATION_TEST") != "true" {
		return
	}

	ctx := context.Background()
	svc := vikingdb.NewVikingDBService(
		"api-vikingdb.volces.com",
		"cn-beijing",
		os.Getenv("VIKING_DB_AK"),
		os.Getenv("VIKING_DB_SK"),
		"https",
	)

	embConfig := &openai.EmbeddingConfig{
		APIKey:     os.Getenv("OPENAI_EMBEDDING_API_KEY"),
		ByAzure:    true,
		BaseURL:    os.Getenv("OPENAI_EMBEDDING_BASE_URL"),
		Model:      os.Getenv("OPENAI_EMBEDDING_MODEL"),
		Dimensions: ptr.Of(1024),
	}
	emb, err := wrap.NewOpenAIEmbedder(ctx, embConfig, 1024, 100)
	assert.NoError(t, err)

	cfg := &ManagerConfig{
		Service:        svc,
		IndexingConfig: nil,
		EmbeddingConfig: &VikingEmbeddingConfig{
			UseVikingEmbedding: false,
			BuiltinEmbedding:   emb,
		},
	}

	mgr, err := NewManager(cfg)
	assert.NoError(t, err)

	collectionName := "test_coze_coll_2"

	t.Run("create", func(t *testing.T) {
		err = mgr.Create(ctx, &searchstore.CreateRequest{
			CollectionName: collectionName,
			Fields: []*searchstore.Field{
				{
					Name:      searchstore.FieldID,
					Type:      searchstore.FieldTypeInt64,
					IsPrimary: true,
				},
				{
					Name: searchstore.FieldCreatorID,
					Type: searchstore.FieldTypeInt64,
				},
				{
					Name: "document_id",
					Type: searchstore.FieldTypeInt64,
				},
				{
					Name:     searchstore.FieldTextContent,
					Type:     searchstore.FieldTypeText,
					Indexing: true,
				},
			},
			CollectionMeta: nil,
		})
		assert.NoError(t, err)
	})

	t.Run("store", func(t *testing.T) {
		ss, err := mgr.GetSearchStore(ctx, collectionName)
		assert.NoError(t, err)

		ids, err := ss.Store(ctx, []*schema.Document{
			{
				ID:      "101",
				Content: "埃菲尔铁塔：位于法国巴黎，是世界上最著名的地标之一，由居斯塔夫・埃菲尔设计并建于 1889 年。",
				MetaData: map[string]any{
					document.MetaDataKeyCreatorID: int64(111),
					document.MetaDataKeyExternalStorage: map[string]any{
						"document_id": int64(567),
					},
				},
			},
			{
				ID:      "102",
				Content: "长城：位于中国，是世界七大奇迹之一，从秦至明代修筑而成，全长超过 2 万公里",
				MetaData: map[string]any{
					document.MetaDataKeyCreatorID: int64(111),
					document.MetaDataKeyExternalStorage: map[string]any{
						"document_id": int64(567),
					},
				},
			},
			{
				ID:      "103",
				Content: "罗马斗兽场：位于意大利罗马，于公元 70-80 年间建成，是古罗马帝国最大的圆形竞技场。",
				MetaData: map[string]any{
					document.MetaDataKeyCreatorID: int64(111),
					document.MetaDataKeyExternalStorage: map[string]any{
						"document_id": int64(568),
					},
				},
			},
		}, searchstore.WithIndexingFields([]string{searchstore.FieldTextContent}))
		assert.NoError(t, err)
		fmt.Println(ids)
	})

	t.Run("retrieve", func(t *testing.T) {
		ss, err := mgr.GetSearchStore(ctx, collectionName)
		assert.NoError(t, err)

		dsl := &searchstore.DSL{
			Op:    searchstore.OpIn,
			Field: "creator_id",
			Value: int64(111),
		}
		opts := []retriever.Option{
			searchstore.WithRetrieverPartitionKey("document_id"),
			searchstore.WithPartitions([]string{"567"}),
			retriever.WithDSLInfo(dsl.DSL()),
		}
		resp, err := ss.Retrieve(ctx, "旅游景点推荐", opts...)
		assert.NoError(t, err)
		fmt.Println(resp)
	})

	t.Run("drop", func(t *testing.T) {
		assert.NoError(t, mgr.Drop(ctx, &searchstore.DropRequest{CollectionName: collectionName}))
	})

}
