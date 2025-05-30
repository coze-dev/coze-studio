package app

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen    idgen.IDGenerator
	DB       *gorm.DB
	OSS      storage.Storage
	Eventbus search.ProjectEventBus

	UserSVC   user.User
	PluginSVC plugin.PluginService
}

func InitService(components *ServiceComponents) (*APPApplicationService, error) {
	appRepo := repository.NewAPPRepo(&repository.APPRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
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
	APPApplicationSVC.eventbus = components.Eventbus

	APPApplicationSVC.userSVC = components.UserSVC

	return APPApplicationSVC, nil
}
