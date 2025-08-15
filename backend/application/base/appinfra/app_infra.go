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

package appinfra

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/cloudwego/eino-ext/components/embedding/ollama"
	"github.com/cloudwego/eino-ext/components/embedding/openai"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/volcengine/volc-sdk-golang/service/visual"

	"github.com/coze-dev/coze-studio/backend/application/internal"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/embedding"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/cache/redis"
	"github.com/coze-dev/coze-studio/backend/infra/impl/coderunner/direct"
	"github.com/coze-dev/coze-studio/backend/infra/impl/coderunner/sandbox"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/ocr/ppocr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/ocr/veocr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/parser/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/parser/ppstructure"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/searchstore/elasticsearch"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/searchstore/milvus"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/searchstore/vikingdb"
	"github.com/coze-dev/coze-studio/backend/infra/impl/embedding/ark"
	embeddingHttp "github.com/coze-dev/coze-studio/backend/infra/impl/embedding/http"
	"github.com/coze-dev/coze-studio/backend/infra/impl/embedding/wrap"
	"github.com/coze-dev/coze-studio/backend/infra/impl/es"
	"github.com/coze-dev/coze-studio/backend/infra/impl/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/impl/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/impl/imagex/veimagex"
	"github.com/coze-dev/coze-studio/backend/infra/impl/mysql"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type AppDependencies struct {
	DB                    *gorm.DB
	CacheCli              cache.Cmdable
	IDGenSVC              idgen.IDGenerator
	ESClient              es.Client
	ImageXClient          imagex.ImageX
	TOSClient             storage.Storage
	ResourceEventProducer eventbus.Producer
	AppEventProducer      eventbus.Producer
	ModelMgr              modelmgr.Manager
	CodeRunner            coderunner.Runner
	OCR                   ocr.OCR
	ParserManager         parser.Manager
	SearchStoreManagers   []searchstore.Manager
}

func Init(ctx context.Context) (*AppDependencies, error) {
	deps := &AppDependencies{}
	var err error

	deps.DB, err = mysql.New()
	if err != nil {
		return nil, fmt.Errorf("init db failed, err=%w", err)
	}

	deps.CacheCli = redis.New()

	deps.IDGenSVC, err = idgen.New(deps.CacheCli)
	if err != nil {
		return nil, fmt.Errorf("init id gen svc failed, err=%w", err)
	}

	deps.ESClient, err = es.New()
	if err != nil {
		return nil, fmt.Errorf("init es client failed, err=%w", err)
	}

	deps.ImageXClient, err = initImageX(ctx)
	if err != nil {
		return nil, fmt.Errorf("init imagex client failed, err=%w", err)
	}

	deps.TOSClient, err = initTOS(ctx)
	if err != nil {
		return nil, fmt.Errorf("init tos client failed, err=%w", err)
	}

	deps.ResourceEventProducer, err = initResourceEventBusProducer()
	if err != nil {
		return nil, fmt.Errorf("init resource event bus producer failed, err=%w", err)
	}

	deps.AppEventProducer, err = initAppEventProducer()
	if err != nil {
		return nil, fmt.Errorf("init app event producer failed, err=%w", err)
	}

	deps.ModelMgr, err = initModelMgr()
	if err != nil {
		return nil, fmt.Errorf("init model manager failed, err=%w", err)
	}

	deps.CodeRunner = initCodeRunner()

	deps.OCR = initOCR()

	imageAnnotationModel, _, err := internal.GetBuiltinChatModel(ctx, "IA_")
	if err != nil {
		return nil, fmt.Errorf("get builtin chat model failed, err=%w", err)
	}

	deps.ParserManager, err = initParserManager(deps.TOSClient, deps.OCR, imageAnnotationModel)
	if err != nil {
		return nil, fmt.Errorf("init parser manager failed, err=%w", err)
	}

	deps.SearchStoreManagers, err = initSearchStoreManagers(ctx, deps.ESClient)
	if err != nil {
		return nil, fmt.Errorf("init search store managers failed, err=%w", err)
	}

	return deps, nil
}

func initSearchStoreManagers(ctx context.Context, es es.Client) ([]searchstore.Manager, error) {
	// es full text search
	esSearchstoreManager := elasticsearch.NewManager(&elasticsearch.ManagerConfig{Client: es})

	// vector search
	mgr, err := getVectorStore(ctx)
	if err != nil {
		return nil, fmt.Errorf("init vector store failed, err=%w", err)
	}

	return []searchstore.Manager{esSearchstoreManager, mgr}, nil
}

func initImageX(ctx context.Context) (imagex.ImageX, error) {
	uploadComponentType := os.Getenv(consts.FileUploadComponentType)
	if uploadComponentType != consts.FileUploadComponentTypeImagex {
		return storage.NewImagex(ctx)
	}
	return veimagex.New(
		os.Getenv(consts.VeImageXAK),
		os.Getenv(consts.VeImageXSK),
		os.Getenv(consts.VeImageXDomain),
		os.Getenv(consts.VeImageXUploadHost),
		os.Getenv(consts.VeImageXTemplate),
		[]string{os.Getenv(consts.VeImageXServerID)},
	)
}

func initTOS(ctx context.Context) (storage.Storage, error) {
	return storage.New(ctx)
}

func initResourceEventBusProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)
	resourceEventBusProducer, err := eventbus.NewProducer(nameServer,
		consts.RMQTopicResource, consts.RMQConsumeGroupResource, 1)
	if err != nil {
		return nil, fmt.Errorf("init resource producer failed, err=%w", err)
	}

	return resourceEventBusProducer, nil
}

func initAppEventProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)
	appEventProducer, err := eventbus.NewProducer(nameServer, consts.RMQTopicApp, consts.RMQConsumeGroupApp, 1)
	if err != nil {
		return nil, fmt.Errorf("init app producer failed, err=%w", err)
	}

	return appEventProducer, nil
}

func initCodeRunner() coderunner.Runner {
	switch typ := os.Getenv(consts.CodeRunnerType); typ {
	case "sandbox":
		getAndSplit := func(key string) []string {
			v := os.Getenv(key)
			if v == "" {
				return nil
			}
			return strings.Split(v, ",")
		}
		config := &sandbox.Config{
			AllowEnv:       getAndSplit(consts.CodeRunnerAllowEnv),
			AllowRead:      getAndSplit(consts.CodeRunnerAllowRead),
			AllowWrite:     getAndSplit(consts.CodeRunnerAllowWrite),
			AllowNet:       getAndSplit(consts.CodeRunnerAllowNet),
			AllowRun:       getAndSplit(consts.CodeRunnerAllowRun),
			AllowFFI:       getAndSplit(consts.CodeRunnerAllowFFI),
			NodeModulesDir: os.Getenv(consts.CodeRunnerNodeModulesDir),
			TimeoutSeconds: 0,
			MemoryLimitMB:  0,
		}
		if f, err := strconv.ParseFloat(os.Getenv(consts.CodeRunnerTimeoutSeconds), 64); err == nil {
			config.TimeoutSeconds = f
		} else {
			config.TimeoutSeconds = 60.0
		}
		if mem, err := strconv.ParseInt(os.Getenv(consts.CodeRunnerMemoryLimitMB), 10, 64); err == nil {
			config.MemoryLimitMB = mem
		} else {
			config.MemoryLimitMB = 100
		}
		return sandbox.NewRunner(config)
	default:
		return direct.NewRunner()
	}
}

func initOCR() ocr.OCR {
	var ocr ocr.OCR
	switch os.Getenv(consts.OCRType) {
	case "ve":
		ocrAK := os.Getenv(consts.VeOCRAK)
		ocrSK := os.Getenv(consts.VeOCRSK)
		if ocrAK == "" || ocrSK == "" {
			logs.Warnf("[ve_ocr] ak / sk not configured, ocr might not work well")
		}
		inst := visual.NewInstance()
		inst.Client.SetAccessKey(ocrAK)
		inst.Client.SetSecretKey(ocrSK)
		ocr = veocr.NewOCR(&veocr.Config{Client: inst})
	case "paddleocr":
		url := os.Getenv(consts.PPOCRAPIURL)
		client := &http.Client{}
		ocr = ppocr.NewOCR(&ppocr.Config{Client: client, URL: url})
	default:
		// accept ocr not configured
	}

	return ocr
}

func initParserManager(storage storage.Storage, ocr ocr.OCR, imageAnnotationModel chatmodel.BaseChatModel) (parser.Manager, error) {
	var parserManager parser.Manager
	parserType := os.Getenv(consts.ParserType)
	switch parserType {
	case "builtin", "":
		parserManager = builtin.NewManager(storage, ocr, imageAnnotationModel)
	case "paddleocr":
		url := os.Getenv(consts.PPStructureAPIURL)
		client := &http.Client{}
		apiConfig := &ppstructure.APIConfig{
			Client: client,
			URL:    url,
		}
		parserManager = ppstructure.NewManager(apiConfig, ocr, storage, imageAnnotationModel)
	default:
		return nil, fmt.Errorf("parser type %s not supported", parserType)
	}

	return parserManager, nil
}

func getVectorStore(ctx context.Context) (searchstore.Manager, error) {
	vsType := os.Getenv("VECTOR_STORE_TYPE")

	switch vsType {
	case "milvus":
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		milvusAddr := os.Getenv("MILVUS_ADDR")
		user := os.Getenv("MILVUS_USER")
		password := os.Getenv("MILVUS_PASSWORD")
		mc, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
			Address:  milvusAddr,
			Username: user,
			Password: password,
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

	case "http":
		var (
			httpEmbeddingBaseURL = os.Getenv("HTTP_EMBEDDING_ADDR")
			httpEmbeddingDims    = os.Getenv("HTTP_EMBEDDING_DIMS")
		)
		dims, err := strconv.ParseInt(httpEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init http embedding dims failed, err=%w", err)
		}
		emb, err = embeddingHttp.NewEmbedding(httpEmbeddingBaseURL, dims, batchSize)
		if err != nil {
			return nil, fmt.Errorf("init http embedding failed, err=%w", err)
		}

	default:
		return nil, fmt.Errorf("init knowledge embedding failed, type not configured")
	}

	return emb, nil
}
