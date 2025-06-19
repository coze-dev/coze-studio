package plugin

import (
	"context"

	"gorm.io/gorm"

	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	oauth "code.byted.org/flow/opencoze/backend/domain/openauth/oauth/service"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen    idgen.IDGenerator
	DB       *gorm.DB
	OSS      storage.Storage
	EventBus search.ResourceEventBus
	UserSVC  user.User
	OAuthSVC oauth.OAuthService
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
		IDGen:      components.IDGen,
		DB:         components.DB,
		OSS:        components.OSS,
		PluginRepo: pluginRepo,
		ToolRepo:   toolRepo,
	})

	PluginApplicationSVC.DomainSVC = pluginSVC
	PluginApplicationSVC.eventbus = components.EventBus
	PluginApplicationSVC.oss = components.OSS
	PluginApplicationSVC.userSVC = components.UserSVC
	PluginApplicationSVC.oauthSVC = components.OAuthSVC
	PluginApplicationSVC.pluginRepo = pluginRepo
	PluginApplicationSVC.toolRepo = toolRepo

	return PluginApplicationSVC, nil
}
