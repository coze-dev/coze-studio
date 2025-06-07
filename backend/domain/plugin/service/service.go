package service

import (
	"context"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

//go:generate mockgen -destination ../../../internal/mock/domain/plugin/interface.go --package mockPlugin -source service.go
type PluginService interface {
	// Draft Plugin
	CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (pluginID int64, err error)
	CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error)
	GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGetDraftPlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithCode(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error)
	DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error)
	DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error)

	// Online Plugin
	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)
	PublishAPPPlugins(ctx context.Context, req *PublishAPPPluginsRequest) (resp *PublishAPPPluginsResponse, err error)
	GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *MGetPluginLatestVersionResponse, err error)
	GetPluginNextVersion(ctx context.Context, pluginID int64) (version string, err error)
	MGetVersionPlugins(ctx context.Context, req *MGetVersionPluginsRequest) (plugins []*entity.PluginInfo, err error)

	// Draft Tool
	MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	UpdateDraftTool(ctx context.Context, req *UpdateToolDraftRequest) (err error)
	ConvertToOpenapi3Doc(ctx context.Context, req *ConvertToOpenapi3DocRequest) (resp *ConvertToOpenapi3DocResponse)

	// Online Tool
	GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error)
	MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)

	// Agent Tool
	BindAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error)
	GetDraftAgentToolByName(ctx context.Context, agentID int64, toolName string) (tool *entity.ToolInfo, err error)
	MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (tools []*entity.ToolInfo, err error)
	UpdateBotDefaultParams(ctx context.Context, req *UpdateBotDefaultParamsRequest) (err error)

	PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error)

	ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpt) (resp *ExecuteToolResponse, err error)

	// Product
	ListPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error)
	GetPluginProductAllTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)
}

type CreateDraftPluginRequest struct {
	PluginType   common.PluginType
	IconURI      string
	SpaceID      int64
	DeveloperID  int64
	ProjectID    *int64
	Name         string
	Desc         string
	ServerURL    string
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type UpdateDraftPluginWithCodeRequest struct {
	PluginID   int64
	OpenapiDoc *plugin.Openapi3T
	Manifest   *entity.PluginManifest
}

type UpdateDraftPluginRequest struct {
	PluginID     int64
	Name         *string
	Desc         *string
	URL          *string
	Icon         *common.PluginIcon
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
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

type PluginAuthInfo struct {
	AuthType     *plugin.AuthType
	Location     *plugin.HTTPParamLocation
	Key          *string
	ServiceToken *string
	OauthInfo    *string
	AuthSubType  *plugin.AuthSubType
	AuthPayload  *string
}

type PublishPluginRequest = plugin.PublishPluginRequest

type PublishAPPPluginsRequest = plugin.PublishAPPPluginsRequest

type PublishAPPPluginsResponse = plugin.PublishAPPPluginsResponse

type MGetVersionPluginsRequest = plugin.MGetVersionPluginsRequest

type MGetPluginLatestVersionResponse = plugin.MGetPluginLatestVersionResponse

type UpdateToolDraftRequest struct {
	PluginID     int64
	ToolID       int64
	Name         *string
	Desc         *string
	SubURL       *string
	Method       *string
	Parameters   openapi3.Parameters
	RequestBody  *openapi3.RequestBodyRef
	Responses    openapi3.Responses
	Disabled     *bool
	SaveExample  *bool
	DebugExample *common.DebugExample
}

type MGetAgentToolsRequest = plugin.MGetAgentToolsRequest

type UpdateBotDefaultParamsRequest struct {
	PluginID    int64
	AgentID     int64
	ToolName    string
	Parameters  openapi3.Parameters
	RequestBody *openapi3.RequestBodyRef
	Responses   openapi3.Responses
}

type ExecuteToolRequest = plugin.ExecuteToolRequest

type ExecuteToolResponse = plugin.ExecuteToolResponse

type ListPluginProductsRequest struct{}

type ListPluginProductsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type ConvertToOpenapi3DocRequest struct {
	RawInput        string
	PluginServerURL *string
}

type ConvertToOpenapi3DocResponse struct {
	OpenapiDoc *plugin.Openapi3T
	Manifest   *entity.PluginManifest
	Format     common.PluginDataFormat
	ErrMsg     string
}
