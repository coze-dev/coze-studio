package plugin

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	pluginDomainSVC service.PluginService
	toolRepo        repository.ToolRepository
	pluginRepo      repository.PluginRepository
)

type ServiceComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func InitService(components *ServiceComponents) (service.PluginService, error) {
	toolRepo = repository.NewToolRepo(&repository.ToolRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginRepo = repository.NewPluginRepo(&repository.PluginRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginDomainSVC = service.NewService(&service.Components{
		IDGen:      components.IDGen,
		DB:         components.DB,
		PluginRepo: pluginRepo,
		ToolRepo:   toolRepo,
	})

	return pluginDomainSVC, nil
}
