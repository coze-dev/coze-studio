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
package impl

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/cloudwego/eino-ext/components/embedding/gemini"
	"github.com/cloudwego/eino-ext/components/embedding/ollama"
	"github.com/cloudwego/eino-ext/components/embedding/openai"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"google.golang.org/genai"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore/impl/elasticsearch"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore/impl/milvus"
	searchstoreOceanbase "github.com/coze-dev/coze-studio/backend/infra/document/searchstore/impl/oceanbase"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore/impl/vikingdb"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/infra/embedding/impl/ark"
	"github.com/coze-dev/coze-studio/backend/infra/embedding/impl/http"
	"github.com/coze-dev/coze-studio/backend/infra/embedding/impl/wrap"
	"github.com/coze-dev/coze-studio/backend/infra/es/impl/es"
	"github.com/coze-dev/coze-studio/backend/infra/oceanbase"
	"github.com/coze-dev/coze-studio/backend/pkg/envkey"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type Manager = searchstore.Manager

func New(ctx context.Context, conf *config.KnowledgeConfig, es es.Client) ([]Manager, error) {
	// es full text search
	esSearchstoreManager := elasticsearch.NewManager(&elasticsearch.ManagerConfig{Client: es})

	// vector search
	mgr, err := getVectorStore(ctx, conf)
	if err != nil {
		return nil, fmt.Errorf("init vector store failed, err=%w", err)
	}

	return []searchstore.Manager{esSearchstoreManager, mgr}, nil
}

func getVectorStore(ctx context.Context, conf *config.KnowledgeConfig) (searchstore.Manager, error) {
	vsType := os.Getenv("VECTOR_STORE_TYPE")

	switch vsType {
	case "milvus":
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		var (
			milvusAddr  = os.Getenv("MILVUS_ADDR")
			user        = os.Getenv("MILVUS_USER")
			password    = os.Getenv("MILVUS_PASSWORD")
			milvusToken = os.Getenv("MILVUS_TOKEN")
		)
		mc, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
			Address:  milvusAddr,
			Username: user,
			Password: password,
			APIKey:   milvusToken,
		})
		if err != nil {
			return nil, fmt.Errorf("init milvus client failed, err=%w", err)
		}

		emb, err := getEmbedding(ctx, conf.EmbeddingConfig)
		if err != nil {
			return nil, fmt.Errorf("init milvus embedding failed, err=%w", err)
		}

		mgr, err := milvus.NewManager(&milvus.ManagerConfig{
			Client:       mc,
			Embedding:    emb,
			EnableHybrid: ptr.Of(true),
		})
		if err != nil {
			return nil, fmt.Errorf("init milvus vector store failed, err=%w", err)
		}

		return mgr, nil
	case "vikingdb":
		var (
			host      = os.Getenv("VIKING_DB_HOST")
			region    = os.Getenv("VIKING_DB_REGION")
			ak        = os.Getenv("VIKING_DB_AK")
			sk        = os.Getenv("VIKING_DB_SK")
			scheme    = os.Getenv("VIKING_DB_SCHEME")
			modelName = os.Getenv("VIKING_DB_MODEL_NAME")
		)
		if ak == "" || sk == "" {
			return nil, fmt.Errorf("invalid vikingdb ak / sk")
		}
		if host == "" {
			host = "api-vikingdb.volces.com"
		}
		if region == "" {
			region = "cn-beijing"
		}
		if scheme == "" {
			scheme = "https"
		}

		var embConfig *vikingdb.VikingEmbeddingConfig
		if modelName != "" {
			embName := vikingdb.VikingEmbeddingModelName(modelName)
			if embName.Dimensions() == 0 {
				return nil, fmt.Errorf("embedding model not support, model_name=%s", modelName)
			}
			embConfig = &vikingdb.VikingEmbeddingConfig{
				UseVikingEmbedding: true,
				EnableHybrid:       embName.SupportStatus() == embedding.SupportDenseAndSparse,
				ModelName:          embName,
				ModelVersion:       embName.ModelVersion(),
				DenseWeight:        ptr.Of(0.2),
				BuiltinEmbedding:   nil,
			}
		} else {
			builtinEmbedding, err := getEmbedding(ctx, conf.EmbeddingConfig)
			if err != nil {
				return nil, fmt.Errorf("builtint embedding init failed, err=%w", err)
			}

			embConfig = &vikingdb.VikingEmbeddingConfig{
				UseVikingEmbedding: false,
				EnableHybrid:       false,
				BuiltinEmbedding:   builtinEmbedding,
			}
		}

		svc := vikingdb.NewVikingDBService(host, region, ak, sk, scheme)
		mgr, err := vikingdb.NewManager(&vikingdb.ManagerConfig{
			Service:         svc,
			IndexingConfig:  nil, // use default config
			EmbeddingConfig: embConfig,
		})
		if err != nil {
			return nil, fmt.Errorf("init vikingdb manager failed, err=%w", err)
		}

		return mgr, nil

	case "oceanbase":
		emb, err := getEmbedding(ctx, conf.EmbeddingConfig)
		if err != nil {
			return nil, fmt.Errorf("init oceanbase embedding failed, err=%w", err)
		}

		var (
			host     = os.Getenv("OCEANBASE_HOST")
			port     = os.Getenv("OCEANBASE_PORT")
			user     = os.Getenv("OCEANBASE_USER")
			password = os.Getenv("OCEANBASE_PASSWORD")
			database = os.Getenv("OCEANBASE_DATABASE")
		)
		if host == "" || port == "" || user == "" || password == "" || database == "" {
			return nil, fmt.Errorf("invalid oceanbase configuration: host, port, user, password, database are required")
		}

		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			user, password, host, port, database)

		client, err := oceanbase.NewOceanBaseClient(dsn)
		if err != nil {
			return nil, fmt.Errorf("init oceanbase client failed, err=%w", err)
		}

		if err = client.InitDatabase(ctx); err != nil {
			return nil, fmt.Errorf("init oceanbase database failed, err=%w", err)
		}

		// Get configuration from environment variables with defaults
		batchSize := envkey.GetIntD("OCEANBASE_BATCH_SIZE", 100)
		enableCache := envkey.GetBoolD("OCEANBASE_ENABLE_CACHE", true)
		cacheTTL := time.Duration(envkey.GetI32D("OCEANBASE_CACHE_TTL", 300)) * time.Second
		maxConnections := envkey.GetIntD("OCEANBASE_MAX_CONNECTIONS", 100)
		connTimeout := time.Duration(envkey.GetI32D("OCEANBASE_CONN_TIMEOUT", 30)) * time.Second

		managerConfig := &searchstoreOceanbase.ManagerConfig{
			Client:         client,
			Embedding:      emb,
			BatchSize:      batchSize,
			EnableCache:    enableCache,
			CacheTTL:       cacheTTL,
			MaxConnections: maxConnections,
			ConnTimeout:    connTimeout,
		}
		mgr, err := searchstoreOceanbase.NewManager(managerConfig)
		if err != nil {
			return nil, fmt.Errorf("init oceanbase vector store failed, err=%w", err)
		}
		return mgr, nil

	default:
		return nil, fmt.Errorf("unexpected vector store type, type=%s", vsType)
	}
}

func getEmbedding(ctx context.Context, cfg *config.EmbeddingConfig) (embedding.Embedder, error) {
	var (
		emb           embedding.Embedder
		err           error
		connInfo      = cfg.Connection.BaseConnInfo
		embeddingInfo = cfg.Connection.EmbeddingInfo
	)

	switch cfg.Type {
	case config.EmbeddingType_OpenAI:
		openaiConnCfg := cfg.Connection.Openai
		openAICfg := &openai.EmbeddingConfig{
			APIKey:     connInfo.APIKey,
			BaseURL:    connInfo.BaseURL,
			Model:      connInfo.Model,
			ByAzure:    openaiConnCfg.ByAzure,
			APIVersion: openaiConnCfg.APIVersion,
		}

		if openaiConnCfg.RequestDims > 0 {
			// some openai model not support request dims
			openAICfg.Dimensions = ptr.Of(int(openaiConnCfg.RequestDims))
		}

		emb, err = wrap.NewOpenAIEmbedder(ctx, openAICfg, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init openai embedding failed, err=%w", err)
		}
	case config.EmbeddingType_Ark:
		arkCfg := cfg.Connection.Ark

		apiType := ark.APITypeText
		if ark.APIType(arkCfg.APIType) == ark.APITypeMultiModal {
			apiType = ark.APITypeMultiModal
		}

		emb, err = ark.NewArkEmbedder(ctx, &ark.EmbeddingConfig{
			APIKey:  connInfo.APIKey,
			Model:   connInfo.Model,
			BaseURL: connInfo.BaseURL,
			APIType: &apiType,
		}, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init ark embedding client failed, err=%w", err)
		}

	case config.EmbeddingType_Ollama:
		emb, err = wrap.NewOllamaEmbedder(ctx, &ollama.EmbeddingConfig{
			BaseURL: connInfo.BaseURL,
			Model:   connInfo.Model,
		}, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init ollama embedding failed, err=%w", err)
		}
	case config.EmbeddingType_Gemini:
		geminiCfg := cfg.Connection.Gemini

		if len(connInfo.Model) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_MODEL environment variable is required")
		}
		if len(connInfo.APIKey) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_API_KEY environment variable is required")
		}

		geminiCli, err1 := genai.NewClient(ctx, &genai.ClientConfig{
			APIKey:   connInfo.APIKey,
			Backend:  genai.Backend(geminiCfg.Backend),
			Project:  geminiCfg.Project,
			Location: geminiCfg.Location,
			HTTPOptions: genai.HTTPOptions{
				BaseURL: connInfo.BaseURL,
			},
		})
		if err1 != nil {
			return nil, fmt.Errorf("init gemini client failed, err=%w", err)
		}

		emb, err = wrap.NewGeminiEmbedder(ctx, &gemini.EmbeddingConfig{
			Client:               geminiCli,
			Model:                connInfo.Model,
			OutputDimensionality: ptr.Of(int32(embeddingInfo.Dims)),
		}, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init gemini embedding failed, err=%w", err)
		}
	case config.EmbeddingType_HTTP:
		httpCfg := cfg.Connection.HTTP

		emb, err = http.NewEmbedding(httpCfg.Address, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init http embedding failed, err=%w", err)
		}

	default:
		return nil, fmt.Errorf("init knowledge embedding failed, type not configured")
	}

	return emb, nil
}
