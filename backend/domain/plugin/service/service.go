package service

import (
	"context"

	"github.com/getkin/kin-openapi/openapi3"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginService interface {
	CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (resp *CreateDraftPluginResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithDoc(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error)
	DeleteDraftPlugin(ctx context.Context, req *DeleteDraftPluginRequest) (err error)

	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)
	GetPluginNextVersion(ctx context.Context, req *GetPluginNextVersionRequest) (resp *GetPluginNextVersionResponse, err error)

	UpdateDraftTool(ctx context.Context, req *UpdateToolDraftRequest) (err error)

	GetOnlineTool(ctx context.Context, req *GetOnlineToolsRequest) (resp *GetOnlineToolsResponse, err error)
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
	PluginType   common.PluginType
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
	OpenapiDoc *openapi3.T
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
	PluginID    int64
	Identity    entity.AgentToolIdentity
	Parameters  openapi3.Parameters
	RequestBody *openapi3.RequestBodyRef
	Responses   openapi3.Responses
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
