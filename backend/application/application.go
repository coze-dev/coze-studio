package application

import (
	"context"
	"os"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"

	"github.com/milvus-io/milvus/client/v2/milvusclient"

	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	rewrite "code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite/llm_based"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	knowledgees "code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore/text/elasticsearch"
	knolwedgemilvus "code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore/vector/milvus"
	knowledgeImpl "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	dbservice "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	rdbservice "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelMgrImpl "code.byted.org/flow/opencoze/backend/domain/modelmgr/service"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/dao"
	"code.byted.org/flow/opencoze/backend/domain/prompt"
	"code.byted.org/flow/opencoze/backend/domain/search"
	searchImpl "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/domain/session"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	idgenInterface "code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	hembed "code.byted.org/flow/opencoze/backend/infra/impl/embedding/http"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/imagex/veimagex"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/minio"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

var (
	tosClient             storage.Storage
	promptDomainSVC       prompt.Prompt
	imagexClient          imagex.ImageX
	singleAgentDomainSVC  singleagent.SingleAgent
	knowledgeDomainSVC    knowledge.Knowledge
	agentRunDomainSVC     run.Run
	conversationDomainSVC conversation.Conversation
	messageDomainSVC      message.Message
	openapiAuthDomainSVC  openapiauth.ApiAuth
	modelMgrDomainSVC     modelmgr.Manager
	pluginDomainSVC       plugin.PluginService

	// TODO(@maronghong): 优化 repository 抽象
	pluginDraftRepo    dao.PluginDraftDAO
	toolDraftRepo      dao.ToolDraftDAO
	pluginRepo         dao.PluginDAO
	agentToolDraftRepo dao.AgentToolDraftDAO

	workflowDomainSVC   workflow.Service
	sessionDomainSVC    session.Session
	permissionDomainSVC permission.Permission
	variablesDomainSVC  variables.Variables
	searchDomainSVC     search.Search
	databaseDomainSVC   database.Database
	userDomainSVC       user.User
	idGenSVC            idgenInterface.IDGenerator
)

func Init(ctx context.Context) (err error) {
	db, err := mysql.New()
	if err != nil {
		return err
	}

	cacheCli := redis.New()

	idGenSVC, err = idgen.New(cacheCli)
	if err != nil {
		return err
	}

	// p1, err = rmq.NewProducer("127.0.0.1:9876", "topic.a", 3)
	// if err != nil {
	// 	return err
	// }

	// c1, err = rmq.RegisterConsumer("127.0.0.1:9876", "topic.a", "group.b", &singleAgentEventBus{})
	// if err != nil {
	// 	return err
	// }

	sessionDomainSVC = session.NewService(cacheCli, idGenSVC)

	imagexClient = veimagex.New(
		os.Getenv(consts.VeImageXAK),
		os.Getenv(consts.VeImageXSK),
		os.Getenv(consts.VeImageXDomain),
		os.Getenv(consts.VeImageXTemplate),
		[]string{os.Getenv(consts.VeImageXServerID)},
	)

	tosClient, err = minio.New(ctx,
		os.Getenv(consts.MinIO_Endpoint),
		os.Getenv(consts.MinIO_AK),
		os.Getenv(consts.MinIO_SK),
		"bucket1",
		false,
	)
	if err != nil {
		return err
	}

	searchProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_search", 1)
	if err != nil {
		return err
	}

	domainNotifier, err := searchImpl.NewDomainNotifier(ctx, &searchImpl.DomainNotifierConfig{
		Producer: searchProducer,
	})
	if err != nil {
		return err
	}

	variablesDomainSVC = variables.NewService(db, idGenSVC)

	searchSvr, searchConsumer, err := searchImpl.NewSearchService(ctx, &searchImpl.SearchConfig{
		ESClient: nil,
	})
	if err != nil {
		return err
	}
	searchDomainSVC = searchSvr

	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_search", "search_apps", searchConsumer)
	if err != nil {
		return err
	}

	promptDomainSVC = prompt.NewService(db, idGenSVC)

	permissionDomainSVC = permission.NewService()

	singleAgentDomainSVC = singleagent.NewService(&singleagent.Components{
		PluginSvr: singleagentCross.NewPlugin(),
		IDGen:     idGenSVC,
		DB:        db,
		Cache:     cacheCli,

		DomainNotifierSvr: domainNotifier,
	})

	agentRunDomainSVC = run.NewService(&run.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	conversationDomainSVC = conversation.NewService(&conversation.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	messageDomainSVC = message.NewService(&message.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	openapiAuthDomainSVC = openapiauth.NewService(&openapiauth.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	modelMgrDomainSVC = modelMgrImpl.NewModelManager(db, idGenSVC)

	workflowRepo := service.NewWorkflowRepository(idGenSVC, db, cacheCli)
	workflow.SetRepository(workflowRepo)
	workflowDomainSVC = service.NewWorkflowService(workflowRepo)

	// TODO: 实例化一下的几个 Service
	pluginDomainSVC = plugin.NewPluginService(&plugin.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	rdbService := rdbservice.NewService(db, idGenSVC)
	databaseDomainSVC = dbservice.NewService(rdbService, db, idGenSVC, tosClient)

	userDomainSVC, err = user.NewUserDomain(ctx, &user.Config{
		DB:     db,
		ImageX: imagexClient,
	})
	if err != nil {
		return err
	}

	knowledgeProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_knowledge", 2)
	if err != nil {
		return err
	}

	var ss []searchstore.SearchStore
	cert, err := os.ReadFile(os.Getenv("ES_CA_CERT_PATH"))
	if err != nil {
		return err
	}

	knowledgeES, err := elasticsearch.NewTypedClient(elasticsearch.Config{
		Addresses: strings.Split(os.Getenv("ES_ADDR"), ";"),
		Username:  os.Getenv("ES_USERNAME"),
		Password:  os.Getenv("ES_PASSWORD"),
		CACert:    cert,
	})
	if err != nil {
		return err
	}

	ss = append(ss, knowledgees.NewSearchStore(&knowledgees.Config{
		Client:       knowledgeES,
		CompactTable: nil,
	}))

	mc, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
		Address: os.Getenv("MILVUS_ADDR"),
	})
	if err != nil {
		return err
	}

	if false {
		// TODO: embedding 加到 docker compose
		emb, err := hembed.NewEmbedding("http://127.0.0.1:6543")
		if err != nil {
			return err
		}

		mvs, err := knolwedgemilvus.NewSearchStore(&knolwedgemilvus.Config{
			Client:       mc,
			Embedding:    emb,
			EnableHybrid: ptr.Of(true),
		})
		if err != nil {
			return err
		}
		ss = append(ss, mvs)
	}

	var knowledgeEventHandler eventbus.ConsumerHandler
	knowledgeDomainSVC, knowledgeEventHandler = knowledgeImpl.NewKnowledgeSVC(&knowledgeImpl.KnowledgeSVCConfig{
		DB:            db,
		IDGen:         idGenSVC,
		RDB:           rdbService,
		Producer:      knowledgeProducer,
		SearchStores:  ss,
		FileParser:    nil, // default builtin
		Storage:       tosClient,
		ImageX:        imagexClient,
		QueryRewriter: rewrite.NewRewriter(nil, ""),
		Reranker:      nil, // default rrf
	})

	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_knowledge", "knowledge", knowledgeEventHandler)
	if err != nil {
		return err
	}

	return nil
}
