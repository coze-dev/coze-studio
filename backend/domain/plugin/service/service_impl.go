package service

import (
	"context"

	"github.com/go-resty/resty/v2"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	OSS        storage.Storage
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
	OAuthRepo  repository.OAuthRepository
}

func NewService(components *Components) PluginService {
	impl := &pluginServiceImpl{
		db:         components.DB,
		oss:        components.OSS,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
		oauthRepo:  components.OAuthRepo,
		httpCli:    resty.New(),
	}

	initOnce.Do(func() {
		ctx := context.Background()
		safego.Go(ctx, func() {
			impl.processOAuthAccessToken(ctx)
		})
	})

	return impl
}

type pluginServiceImpl struct {
	db         *gorm.DB
	oss        storage.Storage
	pluginRepo repository.PluginRepository
	toolRepo   repository.ToolRepository
	oauthRepo  repository.OAuthRepository
	httpCli    *resty.Client
}
