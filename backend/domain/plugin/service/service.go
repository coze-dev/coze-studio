package service

import (
	"context"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginService interface {
	CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (resp *CreateDraftPluginResponse, err error)
	MGetDraftPlugins(ctx context.Context, req *MGetDraftPluginsRequest) (resp *MGetDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithDoc(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error)

	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)

	UpdateDraftTool(ctx context.Context, req *UpdateToolDraftRequest) (err error)

	MGetOnlineTools(ctx context.Context, req *MGetOnlineToolsRequest) (resp *MGetOnlineToolsResponse, err error)

	BindAgentTool(ctx context.Context, req *BindAgentToolRequest) (err error)
	GetAgentTool(ctx context.Context, req *GetAgentToolRequest) (resp *GetAgentToolResponse, err error)
	MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (resp *MGetAgentToolsResponse, err error)
	UnbindAgentTool(ctx context.Context, req *UnbindAgentToolRequest) (err error)
	UpdateBotDefaultParams(ctx context.Context, req *UpdateBotDefaultParamsRequest) (err error)

	PublishAgentTools(ctx context.Context, req *PublishAgentToolsRequest) (resp *PublishAgentToolsResponse, err error)

	ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *ExecuteToolResponse, err error)
}

type CreateDraftPluginRequest struct {
	Plugin *entity.PluginInfo
}

type CreateDraftPluginResponse struct {
	PluginID int64
}

type MGetDraftPluginsRequest struct {
	PluginIDs []int64
}

type MGetDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
}

type UpdateDraftPluginWithCodeRequest struct {
	PluginID   int64
	OpenapiDoc *openapi3.T
	Manifest   *entity.PluginManifest
}

type UpdateDraftPluginRequest struct {
	PluginID     int64
	Name         *string
	Desc         *string
	URL          *string
	Icon         *plugin_develop_common.PluginIcon
	AuthType     *consts.AuthType
	Location     *consts.HTTPParamLocation
	Key          *string
	ServiceToken *string
	OauthInfo    *string
	CommonParams map[plugin_develop_common.ParameterLocation][]*plugin_develop_common.CommonParamSchema
	AuthSubType  *consts.AuthSubType
	AuthPayload  *string
}

type DeleteDraftPluginRequest struct {
	PluginID int64
}

type GetPluginRequest struct {
	PluginID int64
}

type GetPluginResponse struct {
	Plugin *entity.PluginInfo
}

type MGetPluginsRequest struct {
	PluginIDs []int64
}

type MGetPluginsResponse struct {
	Plugins []*entity.PluginInfo
}

type PublishPluginRequest struct {
	PluginID    int64
	Version     string
	VersionDesc string
}

type GetPluginServerURLRequest struct {
	PluginID int64
}

type GetPluginServerURLResponse struct {
	ServerURL string
}

type CreateDraftToolRequest struct {
	Tool *entity.ToolInfo
}

type CreateDraftToolResponse struct {
	ToolID int64
}

type UpdateToolDraftRequest struct {
	PluginID       int64
	ToolID         int64
	Name           *string
	Desc           *string
	SubURL         *string
	Method         *string
	RequestParams  []*plugin_develop_common.APIParameter
	ResponseParams []*plugin_develop_common.APIParameter
	Disabled       *bool
	SaveExample    *bool
	DebugExample   *plugin_develop_common.DebugExample
}

type MGetOnlineToolsRequest struct {
	VersionTools []entity.VersionTool
}

type MGetOnlineToolsResponse struct {
	Tools []*entity.ToolInfo
}

type BindAgentToolRequest struct {
	entity.AgentToolIdentity
}

type GetAgentToolRequest struct {
	entity.AgentToolIdentity

	IsDraft bool
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

type UpdateAgentToolDraftRequest struct {
	entity.AgentToolIdentity
	Tool *entity.ToolInfo
}

type UnbindAgentToolRequest struct {
	entity.AgentToolIdentity
}

type UpdateBotDefaultParamsRequest struct {
	PluginID       int64
	Identity       entity.AgentToolIdentity
	RequestParams  []*plugin_develop_common.APIParameter
	ResponseParams []*plugin_develop_common.APIParameter
}

type PublishAgentToolsRequest struct {
	AgentID int64
	SpaceID int64
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
