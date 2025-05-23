package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginRepository interface {
	CreateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error)
	GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (err error)
	UpdateDraftPluginWithoutURLChanged(ctx context.Context, plugin *entity.PluginInfo) (err error)
	UpdateDraftPluginWithDoc(ctx context.Context, req *UpdatePluginDraftWithDoc) (err error)
	DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error)

	GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error)
	CheckOnlinePluginExist(ctx context.Context, pluginID int64) (exist bool, err error)
	MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	ListCustomOnlinePlugins(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error)

	GetVersionPlugin(ctx context.Context, vPlugin entity.VersionPlugin) (plugin *entity.PluginInfo, exist bool, err error)
	MGetVersionPlugins(ctx context.Context, vPlugins []entity.VersionPlugin) (plugin []*entity.PluginInfo, err error)

	PublishPlugin(ctx context.Context, draftPlugin *entity.PluginInfo) (err error)

	GetPluginAllDraftTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)
	GetPluginAllOnlineTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)
	ListPluginDraftTools(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error)

	InstallPluginProduct(ctx context.Context, req *InstallPluginProductRequest) (resp *InstallPluginProductResponse, err error)
	GetSpaceAllPluginProducts(ctx context.Context, spaceID int64) (plugins []*entity.PluginInfo, err error)
}

type UpdatePluginDraftWithDoc struct {
	PluginID   int64
	OpenapiDoc *entity.Openapi3T
	Manifest   *entity.PluginManifest

	UpdatedTools  []*entity.ToolInfo
	NewDraftTools []*entity.ToolInfo
}

type InstallPluginProductRequest struct {
	SpaceID   int64
	ProductID int64
}

type InstallPluginProductResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}

type ToolRepository interface {
	CreateDraftTool(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error)
	UpdateDraftTool(ctx context.Context, tool *entity.ToolInfo) (err error)
	GetDraftTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error)
	MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)

	GetDraftToolWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error)
	MGetDraftToolWithAPI(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error)
	DeleteDraftTool(ctx context.Context, toolID int64) (err error)

	GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error)
	MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	CheckOnlineToolExist(ctx context.Context, toolID int64) (exist bool, err error)
	CheckOnlineToolsExist(ctx context.Context, toolIDs []int64) (exists map[int64]bool, err error)

	GetVersionTool(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, exist bool, err error)

	BindDraftAgentTools(ctx context.Context, spaceID, agentID int64, toolIDs []int64) (err error)
	GetDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity) (tool *entity.ToolInfo, exist bool, err error)
	MGetDraftAgentTools(ctx context.Context, agentID, spaceID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	UpdateDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error)
	GetSpaceAllDraftAgentTools(ctx context.Context, agentID, spaceID int64) (tools []*entity.ToolInfo, err error)

	GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error)
	MGetVersionAgentTools(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error)
	BatchCreateVersionAgentTools(ctx context.Context, agentID int64, tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error)

	UpdateDraftToolAndDebugExample(ctx context.Context, pluginID int64, doc *entity.Openapi3T, updatedTool *entity.ToolInfo) (err error)
}
