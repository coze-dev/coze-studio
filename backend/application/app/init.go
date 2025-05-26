package app

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
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

	UserSVC user.User
}

func InitService(components *ServiceComponents) error {
	appRepo := repository.NewAPPRepo(&repository.APPRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	appSVC := service.NewService(&service.Components{
		IDGen:   components.IDGen,
		DB:      components.DB,
		APPRepo: appRepo,
	})

	APPApplicationSVC.DomainSVC = appSVC
	APPApplicationSVC.appRepo = appRepo

	APPApplicationSVC.oss = components.OSS
	APPApplicationSVC.eventbus = components.Eventbus

	APPApplicationSVC.userSVC = components.UserSVC

	return nil
}
