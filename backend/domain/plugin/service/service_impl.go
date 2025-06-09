package service

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
}

func NewService(components *Components) PluginService {
	return &pluginServiceImpl{
		db:         components.DB,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
	}
}

type pluginServiceImpl struct {
	db         *gorm.DB
	pluginRepo repository.PluginRepository
	toolRepo   repository.ToolRepository
}
