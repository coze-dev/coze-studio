package plugin

import (
	"context"

	"gorm.io/gorm"

	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type ServiceComponents struct {
	IDGen    idgen.IDGenerator
	DB       *gorm.DB
	Eventbus search.ResourceEventbus
}

func InitService(ctx context.Context, components *ServiceComponents) (*PluginApplicationService, error) {
	err := pluginConf.InitConfig(ctx)
	if err != nil {
		return nil, err
	}

	toolRepo := repository.NewToolRepo(&repository.ToolRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginRepo := repository.NewPluginRepo(&repository.PluginRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginSVC := service.NewService(&service.Components{
		IDGen:          components.IDGen,
		DB:             components.DB,
		PluginRepo:     pluginRepo,
		ToolRepo:       toolRepo,
		ResNotifierSVC: components.Eventbus,
	})

	PluginApplicationSVC.pluginRepo = pluginRepo
	PluginApplicationSVC.DomainSVC = pluginSVC
	PluginApplicationSVC.toolRepo = toolRepo

	return PluginApplicationSVC, nil
}
