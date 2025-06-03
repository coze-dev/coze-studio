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
	CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (resp *CreateDraftPluginResponse, err error)
	CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error)
	GetDraftPlugin(ctx context.Context, req *GetDraftPluginRequest) (resp *GetDraftPluginResponse, err error)
	MGetDraftPlugins(ctx context.Context, req *MGetDraftPluginsRequest) (resp *MGetDraftPluginsResponse, err error)
	ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithCode(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error)
	DeleteDraftPlugin(ctx context.Context, req *DeleteDraftPluginRequest) (err error)

	// Online Plugin
	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)
	PublishAPPPlugins(ctx context.Context, req *PublishAPPPluginsRequest) (resp *PublishAPPPluginsResponse, err error)
	GetGetOnlinePlugin(ctx context.Context, req *GetOnlinePluginRequest) (resp *GetOnlinePluginResponse, err error)
	MGetOnlinePlugins(ctx context.Context, req *MGetOnlinePluginsRequest) (resp *MGetOnlinePluginsResponse, err error)
	GetPluginNextVersion(ctx context.Context, pluginID int64) (version string, err error)
	MGetVersionPlugins(ctx context.Context, req *MGetVersionPluginsRequest) (resp *MGetVersionPluginsResponse, err error)

	// Draft Tool
	MGetDraftTools(ctx context.Context, req *MGetDraftToolsRequest) (resp *MGetDraftToolsResponse, err error)
	UpdateDraftTool(ctx context.Context, req *UpdateToolDraftRequest) (err error)

	// Online Tool
	GetOnlineTool(ctx context.Context, req *GetOnlineToolsRequest) (resp *GetOnlineToolsResponse, err error)
	MGetOnlineTools(ctx context.Context, req *MGetOnlineToolsRequest) (resp *MGetOnlineToolsResponse, err error)

	// Agent Tool
	BindAgentTools(ctx context.Context, req *BindAgentToolsRequest) (err error)
	GetDraftAgentTool(ctx context.Context, req *GetDraftAgentToolRequest) (resp *GetAgentToolResponse, err error)
	MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (resp *MGetAgentToolsResponse, err error)
	UpdateBotDefaultParams(ctx context.Context, req *UpdateBotDefaultParamsRequest) (err error)

	PublishAgentTools(ctx context.Context, req *PublishAgentToolsRequest) (resp *PublishAgentToolsResponse, err error)

	ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *ExecuteToolResponse, err error)

	// Product
	ListPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error)
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

type CreateDraftPluginResponse struct {
	PluginID int64
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

type GetDraftPluginRequest struct {
	PluginID int64
}

type GetDraftPluginResponse struct {
	Plugin *entity.PluginInfo
}

type MGetDraftPluginsRequest struct {
	PluginIDs []int64
}

type MGetDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
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

type DeleteDraftPluginRequest = plugin.DeleteDraftPluginRequest

type GetOnlinePluginRequest struct {
	PluginID int64
}

type GetOnlinePluginResponse struct {
	Plugin *entity.PluginInfo
}

type MGetOnlinePluginsRequest struct {
	PluginIDs []int64
}

type MGetOnlinePluginsResponse struct {
	Plugins []*plugin.PluginInfo
}

type PublishPluginRequest = plugin.PublishPluginRequest

type PublishAPPPluginsRequest = plugin.PublishAPPPluginsRequest

type PublishAPPPluginsResponse = plugin.PublishAPPPluginsResponse

type MGetVersionPluginsRequest = plugin.MGetVersionPluginsRequest

type MGetVersionPluginsResponse = plugin.MGetVersionPluginsResponse

type MGetDraftToolsRequest struct {
	ToolIDs []int64
}

type MGetDraftToolsResponse struct {
	Tools []*entity.ToolInfo
}

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

type MGetOnlineToolsRequest struct {
	ToolIDs []int64
}

type MGetOnlineToolsResponse struct {
	Tools []*entity.ToolInfo
}

type GetOnlineToolsRequest struct {
	ToolID int64
}

type GetOnlineToolsResponse struct {
	Tool *entity.ToolInfo
}

type BindAgentToolsRequest = plugin.BindAgentToolsRequest

type GetDraftAgentToolRequest struct {
	AgentID  int64
	ToolName string
}

type GetAgentToolResponse struct {
	Tool *entity.ToolInfo
}

type MGetAgentToolsRequest = plugin.MGetAgentToolsRequest

type MGetAgentToolsResponse = plugin.MGetAgentToolsResponse

type UpdateBotDefaultParamsRequest struct {
	PluginID    int64
	AgentID     int64
	ToolName    string
	Parameters  openapi3.Parameters
	RequestBody *openapi3.RequestBodyRef
	Responses   openapi3.Responses
}

type PublishAgentToolsRequest = plugin.PublishAgentToolsRequest

type PublishAgentToolsResponse = plugin.PublishAgentToolsResponse

type ExecuteToolRequest = plugin.ExecuteToolRequest

type ExecuteToolResponse = plugin.ExecuteToolResponse

type ListPluginProductsRequest struct{}

type ListPluginProductsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}
