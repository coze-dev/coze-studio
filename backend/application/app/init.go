package app

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen    idgen.IDGenerator
	DB       *gorm.DB
	OSS      storage.Storage
	Eventbus search.ProjectEventBus

	UserSVC      user.User
	PluginSVC    plugin.PluginService
	WorkflowSVC  workflow.Service
	DatabaseSVC  database.Database
	KnowledgeSVC knowledge.Knowledge
	VariablesSVC variables.Variables
}

func InitService(components *ServiceComponents) (*APPApplicationService, error) {
	appRepo := repository.NewAPPRepo(&repository.APPRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	domainComponents := &service.Components{
		IDGen:        components.IDGen,
		DB:           components.DB,
		APPRepo:      appRepo,
		VariablesSVC: components.VariablesSVC,
		KnowledgeSVC: components.KnowledgeSVC,
		WorkflowSVC:  components.WorkflowSVC,
		DatabaseSVC:  components.DatabaseSVC,
	}

	domainSVC := service.NewService(domainComponents)

	APPApplicationSVC.DomainSVC = domainSVC
	APPApplicationSVC.appRepo = appRepo

	APPApplicationSVC.oss = components.OSS
	APPApplicationSVC.eventbus = components.Eventbus

	APPApplicationSVC.userSVC = components.UserSVC

	return APPApplicationSVC, nil
}
