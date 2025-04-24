package application

import (
	"context"
	"fmt"
	"os"
	"time"

	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	knowledgeImpl "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelMgrImpl "code.byted.org/flow/opencoze/backend/domain/modelmgr/service"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/prompt"
	"code.byted.org/flow/opencoze/backend/domain/session"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/kafka"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/imagex/veimagex"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/minio"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

var (
	promptDomainSVC       prompt.Prompt
	imagexClient          imagex.ImageX
	singleAgentDomainSVC  singleagent.SingleAgent
	knowledgeDomainSVC    knowledge.Knowledge
	agentRunDomainSVC     run.Run
	conversationDomainSVC conversation.Conversation
	messageDomainSVC      message.Message
	modelMgrDomainSVC     modelmgr.Manager
	pluginDomainSVC       plugin.PluginService
	workflowDomainSVC     workflow.Service
	sessionDomainSVC      session.Session
	permissionDomainSVC   permission.Permission
	variablesDomainSVC    variables.Variables
	p1                    eventbus.Producer
	c1                    eventbus.Consumer

	tosClient storage.Storage
)

func Init(ctx context.Context) (err error) {
	db, err := mysql.New()
	if err != nil {
		return err
	}

	// p1, err = rmq.NewProducer("127.0.0.1:9876", "topic.a", 3)
	// if err != nil {
	// 	return err
	// }

	// c1, err = rmq.NewConsumer("127.0.0.1:9876", "topic.a", "group.b", &singleAgentEventBus{})
	// if err != nil {
	// 	return err
	// }

	imagexClient = veimagex.New(
		os.Getenv(consts.VeImageXAK),
		os.Getenv(consts.VeImageXSK),
		os.Getenv(consts.VeImageXDomain),
		os.Getenv(consts.VeImageXTemplate),
		[]string{os.Getenv(consts.VeImageXServerID)},
	)

	tosClient, err := minio.New(ctx,
		os.Getenv(consts.MinIO_Endpoint),
		os.Getenv(consts.MinIO_AK),
		os.Getenv(consts.MinIO_SK),
		"bucket1",
		false,
	)
	if err != nil {
		return err
	}

	tosClient.Test() // TODO : for test remove me later

	// for test only
	// token, _ := imagexClient.GetUploadAuth(ctx)
	// logs.Infof("[imagexClient] token.AccessKeyID: %v", token.AccessKeyID)
	// resURL, err := imagexClient.GetResourceURL(ctx, "tos-cn-i-2vw640id5q/a5756141d590363606fd88b243048047.JPG")
	// logs.Infof("[imagexClient] resURL: %v , err = %v", resURL, err)
	// fileInfo, err := imagexClient.Upload(ctx, []byte("hello world"), imagex.WithStoreKey("te.txt"))
	// jsonStr, _ := json.Marshal(fileInfo)
	// logs.Infof("[imagexClient] fileInfo: %+v , err = %v", string(jsonStr), err)
	fmt.Println(imagexClient)

	p1, err = kafka.NewProducer("127.0.0.1:9092", "opencoze_topic")
	if err != nil {
		return err
	}

	c1, err = kafka.NewConsumer("127.0.0.1:9092", "opencoze_topic", "group_a", &singleAgentEventBus{})
	if err != nil {
		return err
	}

	// TODO: just for test, remove me later
	err = p1.Send(ctx, []byte(fmt.Sprintf("hello world %v", time.Now())), eventbus.WithShardingKey("ack"))
	if err != nil {
		logs.Errorf("send msg failed, err: %v", err)
	}

	cacheCli := redis.New()

	idGenSVC, err := idgen.New(cacheCli)
	if err != nil {
		return err
	}

	promptDomainSVC = prompt.NewService(db, idGenSVC)

	permissionDomainSVC = permission.NewService()

	singleAgentDomainSVC = singleagent.NewService(&singleagent.Components{
		ToolSvr: singleagentCross.NewTool(),
		IDGen:   idGenSVC,
		DB:      db,
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

	sessionDomainSVC = session.NewSessionService(cacheCli, idGenSVC)

	// TODO: register mq consume handler
	knowledgeDomainSVC, _ = knowledgeImpl.NewKnowledgeSVC(&knowledgeImpl.KnowledgeSVCConfig{
		DB:            db,
		IDGen:         idGenSVC,
		RDB:           nil,
		Producer:      p1,
		SearchStores:  nil,
		FileParser:    nil,
		ImageX:        imagexClient,
		QueryRewriter: nil,
		Reranker:      nil,
	})

	modelMgrDomainSVC = modelMgrImpl.NewModelManager(db, idGenSVC)

	service.InitWorkflowService(idGenSVC, db)
	workflowDomainSVC = service.GetWorkflowService()

	// TODO: 实例化一下的几个 Service
	_ = pluginDomainSVC

	return nil
}
