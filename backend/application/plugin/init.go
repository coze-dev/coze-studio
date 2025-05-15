package plugin

import (
	"gorm.io/gorm"

	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	pluginSVC  service.PluginService
	toolRepo   repository.ToolRepository
	pluginRepo repository.PluginRepository
)

type ServiceComponents struct {
	IDGen          idgen.IDGenerator
	DB             *gorm.DB
	ResNotifierSVC search.ResourceDomainNotifier
}

func InitService(components *ServiceComponents) (service.PluginService, error) {
	err := pluginConf.InitConfig()
	if err != nil {
		return nil, err
	}

	toolRepo = repository.NewToolRepo(&repository.ToolRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginRepo = repository.NewPluginRepo(&repository.PluginRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginSVC = service.NewService(&service.Components{
		IDGen:          components.IDGen,
		DB:             components.DB,
		PluginRepo:     pluginRepo,
		ToolRepo:       toolRepo,
		ResNotifierSVC: components.ResNotifierSVC,
	})

	return pluginSVC, nil
}
