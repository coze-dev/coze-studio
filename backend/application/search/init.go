package search

import (
	"context"
	"fmt"
	"os"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/application/singleagent"
	app "code.byted.org/flow/opencoze/backend/domain/app/service"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	prompt "code.byted.org/flow/opencoze/backend/domain/prompt/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/pkg/jsoner"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type ServiceComponents struct {
	DB                   *gorm.DB
	Cache                *redis.Client
	TOS                  storage.Storage
	ESClient             *es8.Client
	ProjectEventBus      ProjectEventBus
	SingleAgentDomainSVC singleagent.SingleAgent
	APPDomainSVC         app.AppService
	KnowledgeDomainSVC   knowledge.Knowledge
	PluginDomainSVC      service.PluginService
	WorkflowDomainSVC    workflow.Service
	UserDomainSVC        user.User
	ConnectorDomainSVC   connector.Connector
	PromptDomainSVC      prompt.Prompt
	DatabaseDomainSVC    database.Database
}

func InitService(ctx context.Context, s *ServiceComponents) (*SearchApplicationService, error) {
	searchDomainSVC := search.NewDomainService(ctx, s.ESClient)

	SearchSVC.DomainSVC = searchDomainSVC
	SearchSVC.ServiceComponents = s
	SearchSVC.FavRepo = jsoner.New[favInfo]("project:user:agent:", s.Cache)

	// setup consumer
	searchConsumer := search.NewProjectHandler(ctx, s.ESClient)

	logs.Infof("start search domain consumer...")
	nameServer := os.Getenv(consts.RocketMQServer)

	err := rmq.RegisterConsumer(nameServer, "opencoze_search_app", "cg_search_app", searchConsumer)
	if err != nil {
		return nil, fmt.Errorf("register search consumer failed, err=%w", err)
	}

	searchResourceConsumer := search.NewResourceHandler(ctx, s.ESClient)

	err = rmq.RegisterConsumer(nameServer, "opencoze_search_resource", "cg_search_resource", searchResourceConsumer)
	if err != nil {
		return nil, fmt.Errorf("register search consumer failed, err=%w", err)
	}

	return SearchSVC, nil
}

type (
	ResourceEventBus = search.ResourceEventBus
	ProjectEventBus  = search.ProjectEventBus
)

func NewResourceEventBus(p eventbus.Producer) search.ResourceEventBus {
	return search.NewResourceEventBus(p)
}

func NewProjectEventBus(p eventbus.Producer) search.ProjectEventBus {
	return search.NewProjectEventBus(p)
}
