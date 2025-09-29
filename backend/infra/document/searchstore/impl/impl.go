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
	"strconv"
	"time"

	"github.com/cloudwego/eino-ext/components/embedding/gemini"
	"github.com/cloudwego/eino-ext/components/embedding/ollama"
	"github.com/cloudwego/eino-ext/components/embedding/openai"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"google.golang.org/genai"

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
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type Manager = searchstore.Manager

func New(ctx context.Context, es es.Client) ([]Manager, error) {
	// es full text search
	esSearchstoreManager := elasticsearch.NewManager(&elasticsearch.ManagerConfig{Client: es})

	// vector search
	mgr, err := getVectorStore(ctx)
	if err != nil {
		return nil, fmt.Errorf("init vector store failed, err=%w", err)
	}

	return []searchstore.Manager{esSearchstoreManager, mgr}, nil
}

func getVectorStore(ctx context.Context) (searchstore.Manager, error) {
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

		emb, err := getEmbedding(ctx)
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
			builtinEmbedding, err := getEmbedding(ctx)
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
		emb, err := getEmbedding(ctx)
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

		if err := client.InitDatabase(ctx); err != nil {
			return nil, fmt.Errorf("init oceanbase database failed, err=%w", err)
		}

		// Get configuration from environment variables with defaults
		batchSize := 100
		if bs := os.Getenv("OCEANBASE_BATCH_SIZE"); bs != "" {
			if bsInt, err := strconv.Atoi(bs); err == nil {
				batchSize = bsInt
			}
		}

		enableCache := true
		if ec := os.Getenv("OCEANBASE_ENABLE_CACHE"); ec != "" {
			if ecBool, err := strconv.ParseBool(ec); err == nil {
				enableCache = ecBool
			}
		}

		cacheTTL := 300 * time.Second
		if ct := os.Getenv("OCEANBASE_CACHE_TTL"); ct != "" {
			if ctInt, err := strconv.Atoi(ct); err == nil {
				cacheTTL = time.Duration(ctInt) * time.Second
			}
		}

		maxConnections := 100
		if mc := os.Getenv("OCEANBASE_MAX_CONNECTIONS"); mc != "" {
			if mcInt, err := strconv.Atoi(mc); err == nil {
				maxConnections = mcInt
			}
		}

		connTimeout := 30 * time.Second
		if ct := os.Getenv("OCEANBASE_CONN_TIMEOUT"); ct != "" {
			if ctInt, err := strconv.Atoi(ct); err == nil {
				connTimeout = time.Duration(ctInt) * time.Second
			}
		}

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

func getEmbedding(ctx context.Context) (embedding.Embedder, error) {
	var batchSize int
	if bs, err := strconv.ParseInt(os.Getenv("EMBEDDING_MAX_BATCH_SIZE"), 10, 64); err != nil {
		logs.CtxWarnf(ctx, "EMBEDDING_MAX_BATCH_SIZE not set / invalid, using default batchSize=100")
		batchSize = 100
	} else {
		batchSize = int(bs)
	}

	var emb embedding.Embedder

	switch os.Getenv("EMBEDDING_TYPE") {
	case "openai":
		var (
			openAIEmbeddingBaseURL     = os.Getenv("OPENAI_EMBEDDING_BASE_URL")
			openAIEmbeddingModel       = os.Getenv("OPENAI_EMBEDDING_MODEL")
			openAIEmbeddingApiKey      = os.Getenv("OPENAI_EMBEDDING_API_KEY")
			openAIEmbeddingByAzure     = os.Getenv("OPENAI_EMBEDDING_BY_AZURE")
			openAIEmbeddingApiVersion  = os.Getenv("OPENAI_EMBEDDING_API_VERSION")
			openAIEmbeddingDims        = os.Getenv("OPENAI_EMBEDDING_DIMS")
			openAIRequestEmbeddingDims = os.Getenv("OPENAI_EMBEDDING_REQUEST_DIMS")
		)

		byAzure, err := strconv.ParseBool(openAIEmbeddingByAzure)
		if err != nil {
			return nil, fmt.Errorf("init openai embedding by_azure failed, err=%w", err)
		}

		dims, err := strconv.ParseInt(openAIEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init openai embedding dims failed, err=%w", err)
		}

		openAICfg := &openai.EmbeddingConfig{
			APIKey:     openAIEmbeddingApiKey,
			ByAzure:    byAzure,
			BaseURL:    openAIEmbeddingBaseURL,
			APIVersion: openAIEmbeddingApiVersion,
			Model:      openAIEmbeddingModel,
			// Dimensions: ptr.Of(int(dims)),
		}
		reqDims := conv.StrToInt64D(openAIRequestEmbeddingDims, 0)
		if reqDims > 0 {
			// some openai model not support request dims
			openAICfg.Dimensions = ptr.Of(int(reqDims))
		}

		emb, err = wrap.NewOpenAIEmbedder(ctx, openAICfg, dims, batchSize)
		if err != nil {
			return nil, fmt.Errorf("init openai embedding failed, err=%w", err)
		}

	case "ark":
		var (
			arkEmbeddingBaseURL = os.Getenv("ARK_EMBEDDING_BASE_URL")
			arkEmbeddingModel   = os.Getenv("ARK_EMBEDDING_MODEL")
			arkEmbeddingApiKey  = os.Getenv("ARK_EMBEDDING_API_KEY")
			// deprecated: use ARK_EMBEDDING_API_KEY instead
			// ARK_EMBEDDING_AK will be removed in the future
			arkEmbeddingAK      = os.Getenv("ARK_EMBEDDING_AK")
			arkEmbeddingDims    = os.Getenv("ARK_EMBEDDING_DIMS")
			arkEmbeddingAPIType = os.Getenv("ARK_EMBEDDING_API_TYPE")
		)

		dims, err := strconv.ParseInt(arkEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init ark embedding dims failed, err=%w", err)
		}

		apiType := ark.APITypeText
		if arkEmbeddingAPIType != "" {
			if t := ark.APIType(arkEmbeddingAPIType); t != ark.APITypeText && t != ark.APITypeMultiModal {
				return nil, fmt.Errorf("init ark embedding api_type failed, invalid api_type=%s", t)
			} else {
				apiType = t
			}
		}

		emb, err = ark.NewArkEmbedder(ctx, &ark.EmbeddingConfig{
			APIKey: func() string {
				if arkEmbeddingApiKey != "" {
					return arkEmbeddingApiKey
				}
				return arkEmbeddingAK
			}(),
			Model:   arkEmbeddingModel,
			BaseURL: arkEmbeddingBaseURL,
			APIType: &apiType,
		}, dims, batchSize)
		if err != nil {
			return nil, fmt.Errorf("init ark embedding client failed, err=%w", err)
		}

	case "ollama":
		var (
			ollamaEmbeddingBaseURL = os.Getenv("OLLAMA_EMBEDDING_BASE_URL")
			ollamaEmbeddingModel   = os.Getenv("OLLAMA_EMBEDDING_MODEL")
			ollamaEmbeddingDims    = os.Getenv("OLLAMA_EMBEDDING_DIMS")
		)

		dims, err := strconv.ParseInt(ollamaEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init ollama embedding dims failed, err=%w", err)
		}

		emb, err = wrap.NewOllamaEmbedder(ctx, &ollama.EmbeddingConfig{
			BaseURL: ollamaEmbeddingBaseURL,
			Model:   ollamaEmbeddingModel,
		}, dims, batchSize)
		if err != nil {
			return nil, fmt.Errorf("init ollama embedding failed, err=%w", err)
		}
	case "gemini":
		var (
			geminiEmbeddingBaseURL  = os.Getenv("GEMINI_EMBEDDING_BASE_URL")
			geminiEmbeddingModel    = os.Getenv("GEMINI_EMBEDDING_MODEL")
			geminiEmbeddingApiKey   = os.Getenv("GEMINI_EMBEDDING_API_KEY")
			geminiEmbeddingDims     = os.Getenv("GEMINI_EMBEDDING_DIMS")
			geminiEmbeddingBackend  = os.Getenv("GEMINI_EMBEDDING_BACKEND") // "1" for BackendGeminiAPI / "2" for BackendVertexAI
			geminiEmbeddingProject  = os.Getenv("GEMINI_EMBEDDING_PROJECT")
			geminiEmbeddingLocation = os.Getenv("GEMINI_EMBEDDING_LOCATION")
		)

		if len(geminiEmbeddingModel) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_MODEL environment variable is required")
		}
		if len(geminiEmbeddingApiKey) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_API_KEY environment variable is required")
		}
		if len(geminiEmbeddingDims) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_DIMS environment variable is required")
		}
		if len(geminiEmbeddingBackend) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_BACKEND environment variable is required")
		}

		dims, convErr := strconv.ParseInt(geminiEmbeddingDims, 10, 64)
		if convErr != nil {
			return nil, fmt.Errorf("invalid GEMINI_EMBEDDING_DIMS value: %s, err=%w", geminiEmbeddingDims, convErr)
		}

		backend, convErr := strconv.ParseInt(geminiEmbeddingBackend, 10, 64)
		if convErr != nil {
			return nil, fmt.Errorf("invalid GEMINI_EMBEDDING_BACKEND value: %s, err=%w", geminiEmbeddingBackend, convErr)
		}

		geminiCli, err := genai.NewClient(ctx, &genai.ClientConfig{
			APIKey:   geminiEmbeddingApiKey,
			Backend:  genai.Backend(backend),
			Project:  geminiEmbeddingProject,
			Location: geminiEmbeddingLocation,
			HTTPOptions: genai.HTTPOptions{
				BaseURL: geminiEmbeddingBaseURL,
			},
		})
		if err != nil {
			return nil, fmt.Errorf("init gemini client failed, err=%w", err)
		}

		emb, err = wrap.NewGeminiEmbedder(ctx, &gemini.EmbeddingConfig{
			Client:               geminiCli,
			Model:                geminiEmbeddingModel,
			OutputDimensionality: ptr.Of(int32(dims)),
		}, dims, batchSize)
		if err != nil {
			return nil, fmt.Errorf("init gemini embedding failed, err=%w", err)
		}
	case "http":
		var (
			httpEmbeddingBaseURL = os.Getenv("HTTP_EMBEDDING_ADDR")
			httpEmbeddingDims    = os.Getenv("HTTP_EMBEDDING_DIMS")
		)
		dims, err := strconv.ParseInt(httpEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init http embedding dims failed, err=%w", err)
		}
		emb, err = http.NewEmbedding(httpEmbeddingBaseURL, dims, batchSize)
		if err != nil {
			return nil, fmt.Errorf("init http embedding failed, err=%w", err)
		}

	default:
		return nil, fmt.Errorf("init knowledge embedding failed, type not configured")
	}

	return emb, nil
}
