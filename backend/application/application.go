package application

import (
	"context"
	"fmt"
	"os"

	"code.byted.org/flow/opencoze/backend/application/conversation"
	"code.byted.org/flow/opencoze/backend/application/knowledge"
	"code.byted.org/flow/opencoze/backend/application/memory"
	"code.byted.org/flow/opencoze/backend/application/prompt"
	"code.byted.org/flow/opencoze/backend/application/session"
	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelMgrImpl "code.byted.org/flow/opencoze/backend/domain/modelmgr/service"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/dao"
	"code.byted.org/flow/opencoze/backend/domain/search"
	searchSVC "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/domain/user"
	userImpl "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	idgenInterface "code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	"code.byted.org/flow/opencoze/backend/infra/impl/es8"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/imagex/veimagex"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/minio"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

var (
	openapiAuthDomainSVC openapiauth.ApiAuth
	modelMgrDomainSVC    modelmgr.Manager
	pluginDomainSVC      plugin.PluginService

	// TODO(@maronghong): 优化 repository 抽象
	pluginDraftRepo    dao.PluginDraftDAO
	toolDraftRepo      dao.ToolDraftDAO
	pluginRepo         dao.PluginDAO
	agentToolDraftRepo dao.AgentToolDraftDAO

	workflowDomainSVC workflow.Service

	permissionDomainSVC permission.Permission
	searchDomainSVC     search.Search
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

	esClient, err := es8.NewElasticSearch()
	if err != nil {
		return err
	}

	imagexClient := veimagex.New(
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

	searchSvr, searchConsumer, err := searchSVC.NewSearchService(ctx, &searchSVC.SearchConfig{
		ESClient: esClient,
	})
	if err != nil {
		return err
	}

	logs.Infof("start search domain consumer...")
	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_search", "search", searchConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}
	logs.Infof("start search domain consumer success")

	// ---------------- init service ----------------
	permissionDomainSVC = permission.NewService()
	session.InitService(cacheCli, idGenSVC)
	memoryServices := memory.InitService(db, idGenSVC, tosClient)
	prompt.InitService(db, idGenSVC, permissionDomainSVC)

	searchDomainSVC = searchSvr
	modelMgrDomainSVC = modelMgrImpl.NewModelManager(db, idGenSVC)
	workflowRepo := service.NewWorkflowRepository(idGenSVC, db, cacheCli)
	workflow.SetRepository(workflowRepo)
	workflowDomainSVC = service.NewWorkflowService(workflowRepo)
	userDomainSVC = userImpl.NewUserDomain(ctx, &userImpl.Config{
		DB:     db,
		ImageX: imagexClient,
	})
	openapiAuthDomainSVC = openapiauth.NewService(&openapiauth.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	pluginDomainSVC = plugin.NewPluginService(&plugin.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	knowledgeDomainSVC, err := knowledge.InitService(db, idGenSVC, tosClient, memoryServices.RDBService, imagexClient, esClient)
	if err != nil {
		return err
	}

	singleAgentDomainSVC, err := singleagent.InitService(&singleagent.ServiceComponents{
		Components: &singleagent.Components{
			IDGen: idGenSVC,
			DB:    db,
			Cache: cacheCli,
		},
		PermissionDomainSVC: permissionDomainSVC,
		KnowledgeDomainSVC:  knowledgeDomainSVC,
		ModelMgrDomainSVC:   modelMgrDomainSVC,
		PluginDomainSVC:     pluginDomainSVC,
		WorkflowDomainSVC:   workflowDomainSVC,
		UserDomainSVC:       userDomainSVC,
	})
	if err != nil {
		return err
	}

	conversation.InitService(db, idGenSVC, tosClient, imagexClient, singleAgentDomainSVC)

	return nil
}
