package application

import (
	"context"
	"fmt"
	"os"

	"code.byted.org/flow/opencoze/backend/application/openapiauth"
	"code.byted.org/flow/opencoze/backend/application/plugin"
	appworkflow "code.byted.org/flow/opencoze/backend/application/workflow"

	"code.byted.org/flow/opencoze/backend/application/connector"
	"code.byted.org/flow/opencoze/backend/application/conversation"
	"code.byted.org/flow/opencoze/backend/application/icon"
	"code.byted.org/flow/opencoze/backend/application/knowledge"
	"code.byted.org/flow/opencoze/backend/application/memory"
	"code.byted.org/flow/opencoze/backend/application/prompt"
	"code.byted.org/flow/opencoze/backend/application/singleagent"
	userApp "code.byted.org/flow/opencoze/backend/application/user"
	modelMgrImpl "code.byted.org/flow/opencoze/backend/domain/modelmgr/service"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/search"
	searchSVC "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/domain/user"
	userImpl "code.byted.org/flow/opencoze/backend/domain/user/service"
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
	searchDomainSVC search.Search
	userDomainSVC   user.User
)

func Init(ctx context.Context) (err error) {
	db, err := mysql.New()
	if err != nil {
		return err
	}

	cacheCli := redis.New()

	idGenSVC, err := idgen.New(cacheCli)
	if err != nil {
		return err
	}

	esClient, err := es8.New()
	if err != nil {
		return err
	}

	imagexClient, err := veimagex.New(
		os.Getenv(consts.VeImageXAK),
		os.Getenv(consts.VeImageXSK),
		os.Getenv(consts.VeImageXDomain),
		os.Getenv(consts.VeImageXUploadHost),
		os.Getenv(consts.VeImageXTemplate),
		[]string{os.Getenv(consts.VeImageXServerID)},
	)
	if err != nil {
		return err
	}

	tosClient, err = minio.New(ctx,
		os.Getenv(consts.MinIOEndpoint),
		os.Getenv(consts.MinIO_AK),
		os.Getenv(consts.MinIO_SK),
		os.Getenv(consts.MinIOBucket),
		false,
	)
	if err != nil {
		return err
	}
	// init single agent domain service
	searchProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_search_app", "search_app", 1)
	if err != nil {
		return fmt.Errorf("init search producer failed, err=%w", err)
	}

	appDomainNotifier, err := searchSVC.NewAppDomainNotifier(&searchSVC.DomainNotifierConfig{
		Producer: searchProducer,
	})
	if err != nil {
		return err
	}
	searchResourceProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_search_resource", "search_resource", 1)
	if err != nil {
		return fmt.Errorf("init search producer failed, err=%w", err)
	}

	resourceDomainNotifier, err := searchSVC.NewResourceDomainNotifier(&searchSVC.DomainNotifierConfig{
		Producer: searchResourceProducer,
	})
	if err != nil {
		return err
	}
	searchSvr, searchConsumer, err := searchSVC.NewSearchService(ctx, &searchSVC.SearchConfig{
		ESClient: esClient,
		Storage:  tosClient,
	})
	if err != nil {
		return err
	}

	logs.Infof("start search domain consumer...")
	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_search_app", "search_app", searchConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}
	searchSvr, searchResourceConsumer, err := searchSVC.NewSearchResourceService(ctx, &searchSVC.SearchConfig{
		ESClient: esClient,
		Storage:  tosClient,
	})
	if err != nil {
		return err
	}

	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_search_resource", "search_resource", searchResourceConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}

	// ---------------- init service ----------------
	openapiauth.InitService(db, idGenSVC)
	modelMgrDomainSVC := modelMgrImpl.NewModelManager(db, idGenSVC)
	permissionDomainSVC := permission.NewService()
	prompt.InitService(db, idGenSVC, permissionDomainSVC)
	memoryServices := memory.InitService(db, idGenSVC, tosClient, resourceDomainNotifier)
	connectorDomainSVC := connector.InitService(tosClient)

	searchDomainSVC = searchSvr // TODO : remove me later

	userDomainSVC = userImpl.NewUserDomain(ctx, &userImpl.Config{
		DB:      db,
		IconOSS: tosClient,
		IDGen:   idGenSVC,
	})

	pluginDomainSVC, err := plugin.InitService(ctx, &plugin.ServiceComponents{
		IDGen:          idGenSVC,
		DB:             db,
		ResNotifierSVC: resourceDomainNotifier,
	})
	if err != nil {
		return err
	}

	knowledgeDomainSVC, err := knowledge.InitService(&knowledge.ServiceComponents{
		DB:             db,
		IDGenSVC:       idGenSVC,
		Storage:        tosClient,
		RDB:            memoryServices.RDBService,
		ImageX:         imagexClient,
		ES:             esClient,
		DomainNotifier: resourceDomainNotifier,
	})
	if err != nil {
		return err
	}

	workflowDomainSVC := appworkflow.InitService(appworkflow.ServiceComponents{
		IDGen:              idGenSVC,
		DB:                 db,
		Cache:              cacheCli,
		DatabaseDomainSVC:  memoryServices.DatabaseService,
		VariablesDomainSVC: memoryServices.VariablesService,
		PluginDomainSVC:    pluginDomainSVC,
		KnowledgeDomainSVC: knowledgeDomainSVC,
		ModelManager:       modelMgrDomainSVC,
		DomainNotifier:     resourceDomainNotifier,
	})

	singleAgentDomainSVC, err := singleagent.InitService(&singleagent.ServiceComponents{
		IDGen:               idGenSVC,
		DB:                  db,
		Cache:               cacheCli,
		TosClient:           tosClient,
		ImageX:              imagexClient,
		PermissionDomainSVC: permissionDomainSVC,
		KnowledgeDomainSVC:  knowledgeDomainSVC,
		ModelMgrDomainSVC:   modelMgrDomainSVC,
		PluginDomainSVC:     pluginDomainSVC,
		WorkflowDomainSVC:   workflowDomainSVC,
		UserDomainSVC:       userDomainSVC,
		DomainNotifier:      appDomainNotifier,
		VariablesDomainSVC:  memoryServices.VariablesService,
		Connector:           connectorDomainSVC,
		DatabaseDomainSVC:   memoryServices.DatabaseService,
	})
	if err != nil {
		return err
	}

	singleAgentSVC = singleAgentDomainSVC // TODO : remove me later

	conversation.InitService(db, idGenSVC, tosClient, imagexClient, singleAgentDomainSVC)

	err = icon.Init(tosClient)
	if err != nil {
		return fmt.Errorf("init icon service failed, err=%w", err)
	}

	err = userApp.Init(userDomainSVC, tosClient)
	if err != nil {
		return fmt.Errorf("init user service failed, err=%w", err)
	}

	return nil
}
