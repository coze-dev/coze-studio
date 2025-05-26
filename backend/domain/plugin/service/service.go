package service

import (
	"context"

	"github.com/getkin/kin-openapi/openapi3"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

//go:generate mockgen -destination ../../../internal/mock/domain/plugin/interface.go --package mockPlugin -source service.go
type PluginService interface {
	// Draft Plugin
	CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (resp *CreateDraftPluginResponse, err error)
	CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error)
	GetDraftPlugin(ctx context.Context, req *GetDraftPluginRequest) (resp *GetDraftPluginResponse, err error)
	MGetDraftPlugins(ctx context.Context, req *MGetDraftPluginsRequest) (resp *MGetDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithCode(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error)
	DeleteDraftPlugin(ctx context.Context, req *DeleteDraftPluginRequest) (err error)

	// Online Plugin
	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)
	GetGetOnlinePlugin(ctx context.Context, req *GetOnlinePluginRequest) (resp *GetOnlinePluginResponse, err error)
	MGetOnlinePlugins(ctx context.Context, req *MGetOnlinePluginsRequest) (resp *MGetOnlinePluginsResponse, err error)
	GetPluginNextVersion(ctx context.Context, req *GetPluginNextVersionRequest) (resp *GetPluginNextVersionResponse, err error)
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
	OpenapiDoc *entity.Openapi3T
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

type CreateDraftPluginWithCodeRequest struct {
	SpaceID     int64
	DeveloperID int64
	ProjectID   *int64
	Manifest    *entity.PluginManifest
	OpenapiDoc  *entity.Openapi3T
}

type CreateDraftPluginWithCodeResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}

type PluginAuthInfo struct {
	AuthType     *consts.AuthType
	Location     *consts.HTTPParamLocation
	Key          *string
	ServiceToken *string
	OauthInfo    *string
	AuthSubType  *consts.AuthSubType
	AuthPayload  *string
}

type DeleteDraftPluginRequest struct {
	PluginID int64
}

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
	Plugins []*entity.PluginInfo
}

type GetPluginNextVersionRequest struct {
	PluginID int64
}

type GetPluginNextVersionResponse struct {
	Version string
}

type PublishPluginRequest struct {
	PluginID    int64
	Version     string
	VersionDesc string
}

type MGetVersionPluginsRequest struct {
	VersionPlugins []entity.VersionPlugin
}

type MGetVersionPluginsResponse struct {
	Plugins []*entity.PluginInfo
}

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

type BindAgentToolsRequest struct {
	AgentID int64
	ToolIDs []int64
}

type GetDraftAgentToolRequest struct {
	AgentID  int64
	ToolName string
}

type GetAgentToolResponse struct {
	Tool *entity.ToolInfo
}

type MGetAgentToolsRequest struct {
	AgentID int64
	SpaceID int64
	IsDraft bool

	VersionAgentTools []entity.VersionAgentTool
}

type MGetAgentToolsResponse struct {
	Tools []*entity.ToolInfo
}

type UpdateBotDefaultParamsRequest struct {
	PluginID    int64
	AgentID     int64
	ToolName    string
	Parameters  openapi3.Parameters
	RequestBody *openapi3.RequestBodyRef
	Responses   openapi3.Responses
}

type PublishAgentToolsRequest struct {
	AgentID int64
}

type PublishAgentToolsResponse struct {
	VersionTools map[int64]entity.VersionAgentTool
}

type ExecuteToolRequest struct {
	PluginID  int64
	ToolID    int64
	ExecScene consts.ExecuteScene

	ArgumentsInJson string
}

type ExecuteToolResponse struct {
	Tool        *entity.ToolInfo
	TrimmedResp string
	RawResp     string
}

type ListPluginProductsRequest struct {
}

type ListPluginProductsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type InstallPluginProductRequest struct {
	SpaceID   int64
	ProductID int64
}

type InstallPluginProductResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}
