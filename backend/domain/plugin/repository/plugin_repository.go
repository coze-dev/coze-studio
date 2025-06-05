package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginRepository interface {
	CreateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error)
	CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error)
	GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error)
	MGetDraftPlugins(ctx context.Context, pluginIDs []int64, opts ...PluginSelectedOptions) (plugins []*entity.PluginInfo, err error)
	GetAPPAllDraftPlugins(ctx context.Context, appID int64) (plugins []*entity.PluginInfo, err error)
	ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (err error)
	UpdateDraftPluginWithoutURLChanged(ctx context.Context, plugin *entity.PluginInfo) (err error)
	UpdateDraftPluginWithCode(ctx context.Context, req *UpdatePluginDraftWithCode) (err error)
	DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error)
	DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error)

	GetOnlinePlugin(ctx context.Context, pluginID int64, opts ...PluginSelectedOptions) (plugin *entity.PluginInfo, exist bool, err error)
	CheckOnlinePluginExist(ctx context.Context, pluginID int64) (exist bool, err error)
	MGetOnlinePlugins(ctx context.Context, pluginIDs []int64, opts ...PluginSelectedOptions) (plugins []*entity.PluginInfo, err error)
	ListCustomOnlinePlugins(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error)

	GetVersionPlugin(ctx context.Context, vPlugin entity.VersionPlugin) (plugin *entity.PluginInfo, exist bool, err error)
	MGetVersionPlugins(ctx context.Context, vPlugins []entity.VersionPlugin, opts ...PluginSelectedOptions) (plugin []*entity.PluginInfo, err error)

	PublishPlugin(ctx context.Context, draftPlugin *entity.PluginInfo) (err error)
	PublishPlugins(ctx context.Context, draftPlugins []*entity.PluginInfo) (err error)
}

type UpdatePluginDraftWithCode struct {
	PluginID   int64
	OpenapiDoc *plugin.Openapi3T
	Manifest   *entity.PluginManifest

	UpdatedTools  []*entity.ToolInfo
	NewDraftTools []*entity.ToolInfo
}

type CreateDraftPluginWithCodeRequest struct {
	SpaceID     int64
	DeveloperID int64
	ProjectID   *int64
	Manifest    *entity.PluginManifest
	OpenapiDoc  *plugin.Openapi3T
}

type CreateDraftPluginWithCodeResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}

type ListDraftPluginsRequest struct {
	SpaceID  int64
	APPID    int64
	PageInfo entity.PageInfo
}

type ListDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}
