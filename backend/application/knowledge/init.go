package knowledge

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/cloudwego/eino-ext/components/embedding/ark"
	"github.com/cloudwego/eino-ext/components/embedding/openai"
	ao "github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/ollama"
	mo "github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino-ext/components/model/qwen"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/volcengine/volc-sdk-golang/service/vikingdb"
	"github.com/volcengine/volc-sdk-golang/service/visual"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/application/search"
	knowledgeImpl "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/cache"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/nl2sql"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/ocr"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/embedding"
	"code.byted.org/flow/opencoze/backend/infra/contract/es"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/messages2query"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	chatmodelImpl "code.byted.org/flow/opencoze/backend/infra/impl/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/impl/document/crawl/crawl4ai"
	builtinNL2SQL "code.byted.org/flow/opencoze/backend/infra/impl/document/nl2sql/builtin"
	"code.byted.org/flow/opencoze/backend/infra/impl/document/ocr/veocr"
	builtinParser "code.byted.org/flow/opencoze/backend/infra/impl/document/parser/builtin"
	"code.byted.org/flow/opencoze/backend/infra/impl/document/rerank/rrf"
	sses "code.byted.org/flow/opencoze/backend/infra/impl/document/searchstore/elasticsearch"
	ssmilvus "code.byted.org/flow/opencoze/backend/infra/impl/document/searchstore/milvus"
	ssvikingdb "code.byted.org/flow/opencoze/backend/infra/impl/document/searchstore/vikingdb"
	"code.byted.org/flow/opencoze/backend/infra/impl/embedding/wrap"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	builtinM2Q "code.byted.org/flow/opencoze/backend/infra/impl/messages2query/builtin"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type ServiceComponents struct {
	DB       *gorm.DB
	IDGenSVC idgen.IDGenerator
	Storage  storage.Storage
	RDB      rdb.RDB
	ImageX   imagex.ImageX
	ES       es.Client
	EventBus search.ResourceEventBus
	CacheCli cache.Cmdable
}

func InitService(c *ServiceComponents) (*KnowledgeApplicationService, error) {
	ctx := context.Background()

	nameServer := os.Getenv(consts.RMQServer)

	knowledgeProducer, err := rmq.NewProducer(nameServer, consts.RMQTopicKnowledge, consts.RMQTopicKnowledgeSearch, 2)
	if err != nil {
		return nil, fmt.Errorf("init knowledge producer failed, err=%w", err)
	}

	var sManagers []searchstore.Manager

	// es full text search
	sManagers = append(sManagers, sses.NewManager(&sses.ManagerConfig{Client: c.ES}))

	// vector search
	mgr, err := getVectorStore(ctx)
	if err != nil {
		return nil, fmt.Errorf("init vector store failed, err=%w", err)
	}
	sManagers = append(sManagers, mgr)

	var ocrImpl ocr.OCR
	switch os.Getenv("OCR_TYPE") {
	case "ve":
		ocrAK := os.Getenv("VE_OCR_AK")
		ocrSK := os.Getenv("VE_OCR_SK")
		inst := visual.NewInstance()
		inst.Client.SetAccessKey(ocrAK)
		inst.Client.SetSecretKey(ocrSK)
		ocrImpl = veocr.NewOCR(&veocr.Config{Client: inst})
	default:
		// accept ocr not configured
	}

	root, err := os.Getwd()
	if err != nil {
		logs.Warnf("[InitConfig] Failed to get current working directory: %v", err)
		root = os.Getenv("PWD")
	}

	var rewriter messages2query.MessagesToQuery
	if rewriterChatModel, _, err := getBuiltinChatModel(ctx, "M2Q_"); err != nil {
		return nil, err
	} else {
		filePath := filepath.Join(root, "resources/conf/prompt/messages_to_query_template_jinja2.json")
		rewriterTemplate, err := readJinja2PromptTemplate(filePath)
		if err != nil {
			return nil, err
		}
		rewriter, err = builtinM2Q.NewMessagesToQuery(ctx, rewriterChatModel, rewriterTemplate)
		if err != nil {
			return nil, err
		}
	}

	var n2s nl2sql.NL2SQL
	if n2sChatModel, _, err := getBuiltinChatModel(ctx, "NL2SQL_"); err != nil {
		return nil, err
	} else {
		filePath := filepath.Join(root, "resources/conf/prompt/nl2sql_template_jinja2.json")
		n2sTemplate, err := readJinja2PromptTemplate(filePath)
		if err != nil {
			return nil, err
		}
		n2s, err = builtinNL2SQL.NewNL2SQL(ctx, n2sChatModel, n2sTemplate)
		if err != nil {
			return nil, err
		}
	}

	imageAnnoChatModel, configured, err := getBuiltinChatModel(ctx, "IA_")
	if err != nil {
		return nil, err
	}

	knowledgeDomainSVC, knowledgeEventHandler := knowledgeImpl.NewKnowledgeSVC(&knowledgeImpl.KnowledgeSVCConfig{
		DB:                        c.DB,
		IDGen:                     c.IDGenSVC,
		RDB:                       c.RDB,
		Producer:                  knowledgeProducer,
		SearchStoreManagers:       sManagers,
		ParseManager:              builtinParser.NewManager(c.Storage, ocrImpl, imageAnnoChatModel), // default builtin
		Storage:                   c.Storage,
		Crawler:                   crawl4ai.NewCrawl4ai(),
		Rewriter:                  rewriter,
		Reranker:                  rrf.NewRRFReranker(0), // default rrf
		NL2Sql:                    n2s,
		OCR:                       ocrImpl,
		CacheCli:                  c.CacheCli,
		IsAutoAnnotationSupported: configured,
		ModelFactory:              chatmodelImpl.NewDefaultFactory(),
	})

	if err = rmq.RegisterConsumer(nameServer, "opencoze_knowledge", "cg_knowledge", knowledgeEventHandler); err != nil {
		return nil, fmt.Errorf("register knowledge consumer failed, err=%w", err)
	}

	KnowledgeSVC.DomainSVC = knowledgeDomainSVC
	KnowledgeSVC.eventBus = c.EventBus
	KnowledgeSVC.storage = c.Storage
	return KnowledgeSVC, nil
}

func getVectorStore(ctx context.Context) (searchstore.Manager, error) {
	vsType := os.Getenv("VECTOR_STORE_TYPE")

	switch vsType {
	case "milvus":
		cctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		milvusAddr := os.Getenv("MILVUS_ADDR")
		mc, err := milvusclient.New(cctx, &milvusclient.ClientConfig{Address: milvusAddr})
		if err != nil {
			return nil, fmt.Errorf("init milvus client failed, err=%w", err)
		}

		emb, err := getEmbedding(ctx)
		if err != nil {
			return nil, fmt.Errorf("init milvus embedding failed, err=%w", err)
		}

		mgr, err := ssmilvus.NewManager(&ssmilvus.ManagerConfig{
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

		var embConfig *ssvikingdb.VikingEmbeddingConfig
		if modelName != "" {
			embName := ssvikingdb.VikingEmbeddingModelName(modelName)
			if embName.Dimensions() == 0 {
				return nil, fmt.Errorf("embedding model not support, model_name=%s", modelName)
			}
			embConfig = &ssvikingdb.VikingEmbeddingConfig{
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

			embConfig = &ssvikingdb.VikingEmbeddingConfig{
				UseVikingEmbedding: false,
				EnableHybrid:       false,
				BuiltinEmbedding:   builtinEmbedding,
			}
		}
		svc := vikingdb.NewVikingDBService(host, region, ak, sk, scheme)
		mgr, err := ssvikingdb.NewManager(&ssvikingdb.ManagerConfig{
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
	var emb embedding.Embedder

	switch os.Getenv("EMBEDDING_TYPE") {
	case "openai":
		var (
			openAIEmbeddingBaseURL    = os.Getenv("OPENAI_EMBEDDING_BASE_URL")
			openAIEmbeddingModel      = os.Getenv("OPENAI_EMBEDDING_MODEL")
			openAIEmbeddingApiKey     = os.Getenv("OPENAI_EMBEDDING_API_KEY")
			openAIEmbeddingByAzure    = os.Getenv("OPENAI_EMBEDDING_BY_AZURE")
			openAIEmbeddingApiVersion = os.Getenv("OPENAI_EMBEDDING_API_VERSION")
			openAIEmbeddingDims       = os.Getenv("OPENAI_EMBEDDING_DIMS")
		)

		byAzure, err := strconv.ParseBool(openAIEmbeddingByAzure)
		if err != nil {
			return nil, fmt.Errorf("init openai embedding by_azure failed, err=%w", err)
		}

		dims, err := strconv.ParseInt(openAIEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init openai embedding dims failed, err=%w", err)
		}

		emb, err = wrap.NewOpenAIEmbedder(ctx, &openai.EmbeddingConfig{
			APIKey:     openAIEmbeddingApiKey,
			ByAzure:    byAzure,
			BaseURL:    openAIEmbeddingBaseURL,
			APIVersion: openAIEmbeddingApiVersion,
			Model:      openAIEmbeddingModel,
			Dimensions: ptr.Of(int(dims)),
		}, dims)
		if err != nil {
			return nil, fmt.Errorf("init openai embedding failed, err=%w", err)
		}

	case "ark":
		var (
			arkEmbeddingModel = os.Getenv("ARK_EMBEDDING_MODEL")
			arkEmbeddingAK    = os.Getenv("ARK_EMBEDDING_AK")
			arkEmbeddingDims  = os.Getenv("ARK_EMBEDDING_DIMS")
		)

		dims, err := strconv.ParseInt(arkEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init ark embedding dims failed, err=%w", err)
		}

		emb, err = wrap.NewArkEmbedder(ctx, &ark.EmbeddingConfig{
			APIKey: arkEmbeddingAK,
			Model:  arkEmbeddingModel,
		}, dims)
		if err != nil {
			return nil, fmt.Errorf("init ark embedding client failed, err=%w", err)
		}
	default:
		return nil, fmt.Errorf("init knowledge embedding failed, type not configured")
	}

	return emb, nil
}

func getBuiltinChatModel(ctx context.Context, envPrefix string) (bcm chatmodel.BaseChatModel, configured bool, err error) {
	getEnv := func(key string) string {
		if val := os.Getenv(envPrefix + key); val != "" {
			return val
		}
		return os.Getenv(key)
	}

	switch getEnv("BUILTIN_CM_TYPE") {
	case "openai":
		byAzure, _ := strconv.ParseBool(getEnv("BUILTIN_CM_OPENAI_BY_AZURE"))
		bcm, err = mo.NewChatModel(ctx, &mo.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_OPENAI_API_KEY"),
			ByAzure: byAzure,
			BaseURL: getEnv("BUILTIN_CM_OPENAI_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_OPENAI_MODEL"),
		})
	case "ark":
		bcm, err = ao.NewChatModel(ctx, &ao.ChatModelConfig{
			APIKey: getEnv("BUILTIN_CM_ARK_API_KEY"),
			Model:  getEnv("BUILTIN_CM_ARK_MODEL"),
		})
	case "deepseek":
		bcm, err = deepseek.NewChatModel(ctx, &deepseek.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_DEEPSEEK_API_KEY"),
			BaseURL: getEnv("BUILTIN_CM_DEEPSEEK_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_DEEPSEEK_MODEL"),
		})
	case "ollama":
		bcm, err = ollama.NewChatModel(ctx, &ollama.ChatModelConfig{
			BaseURL: getEnv("BUILTIN_CM_OLLAMA_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_OLLAMA_MODEL"),
		})
	case "qwen":
		bcm, err = qwen.NewChatModel(ctx, &qwen.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_QWEN_API_KEY"),
			BaseURL: getEnv("BUILTIN_CM_QWEN_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_QWEN_MODEL"),
		})
	default:
		// accept builtin chat model not configured
	}

	if err != nil {
		return nil, false, fmt.Errorf("knowledge init openai chat mode failed, %w", err)
	}
	if bcm != nil {
		configured = true
	}

	return
}

func readJinja2PromptTemplate(jsonFilePath string) (prompt.ChatTemplate, error) {
	b, err := os.ReadFile(jsonFilePath)
	if err != nil {
		return nil, err
	}
	var m2qMessages []*schema.Message
	if err = json.Unmarshal(b, &m2qMessages); err != nil {
		return nil, err
	}
	tpl := make([]schema.MessagesTemplate, len(m2qMessages))
	for i := range m2qMessages {
		tpl[i] = m2qMessages[i]
	}
	return prompt.FromMessages(schema.Jinja2, tpl...), nil
}
