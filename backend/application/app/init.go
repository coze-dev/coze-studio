package app

import (
	redisV9 "github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen           idgen.IDGenerator
	DB              *gorm.DB
	OSS             storage.Storage
	CacheCli        *redisV9.Client
	ProjectEventBus search.ProjectEventBus

	UserSVC      user.User
	ConnectorSVC connector.Connector
	VariablesSVC variables.Variables
}

func InitService(components *ServiceComponents) (*APPApplicationService, error) {
	appRepo := repository.NewAPPRepo(&repository.APPRepoComponents{
		IDGen:    components.IDGen,
		DB:       components.DB,
		CacheCli: components.CacheCli,
	})

	domainComponents := &service.Components{
		IDGen:   components.IDGen,
		DB:      components.DB,
		APPRepo: appRepo,
	}

	domainSVC := service.NewService(domainComponents)

	APPApplicationSVC.DomainSVC = domainSVC
	APPApplicationSVC.appRepo = appRepo

	APPApplicationSVC.oss = components.OSS
	APPApplicationSVC.projectEventBus = components.ProjectEventBus

	APPApplicationSVC.userSVC = components.UserSVC
	APPApplicationSVC.connectorSVC = components.ConnectorSVC
	APPApplicationSVC.variablesSVC = components.VariablesSVC

	return APPApplicationSVC, nil
}
