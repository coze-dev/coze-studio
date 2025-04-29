package plugin

import (
	"context"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginService interface {
	CreatePluginDraft(ctx context.Context, req *CreatePluginDraftRequest) (resp *CreatePluginDraftResponse, err error)
	MGetDraftPlugins(ctx context.Context, req *MGetDraftPluginsRequest) (resp *MGetDraftPluginsResponse, err error)
	ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error)
	UpdatePluginDraft(ctx context.Context, plugin *UpdatePluginDraftRequest) (err error)
	UpdatePluginDraftWithDoc(ctx context.Context, req *UpdatePluginDraftWithCodeRequest) (err error)
	DeletePluginDraft(ctx context.Context, req *DeletePluginDraftRequest) (err error)

	ListPlugins(ctx context.Context, req *ListPluginsRequest) (resp *ListPluginsResponse, err error)
	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)

	CreateToolDraft(ctx context.Context, req *CreateToolDraftRequest) (resp *CreateToolDraftResponse, err error)
	UpdateToolDraft(ctx context.Context, req *UpdateToolDraftRequest) (err error)
	ListDraftTools(ctx context.Context, req *ListDraftToolsRequest) (resp *ListDraftToolsResponse, err error)

	MGetTools(ctx context.Context, req *MGetToolsRequest) (resp *MGetToolsResponse, err error)
	GetAllTools(ctx context.Context, req *GetAllToolsRequest) (resp *GetAllToolsResponse, err error)
	ListTools(ctx context.Context, req *ListToolsRequest) (resp *ListToolsResponse, err error)

	BindAgentTool(ctx context.Context, req *BindAgentToolRequest) (err error)
	GetAgentTool(ctx context.Context, req *GetAgentToolRequest) (resp *GetAgentToolResponse, err error)
	MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (resp *MGetAgentToolsResponse, err error)
	UpdateAgentToolDraft(ctx context.Context, req *UpdateAgentToolDraftRequest) (err error)
	UnbindAgentTool(ctx context.Context, req *UnbindAgentToolRequest) (err error)

	PublishAgentTools(ctx context.Context, req *PublishAgentToolsRequest) (resp *PublishAgentToolsResponse, err error)

	ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *ExecuteToolResponse, err error)
}

type CreatePluginDraftRequest struct {
	SpaceID int64

	Plugin *entity.PluginInfo
}

type CreatePluginDraftResponse struct {
	PluginID int64
}

type MGetDraftPluginsRequest struct {
	PluginIDs []int64
}

type MGetDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
}

type ListDraftPluginsRequest struct {
	SpaceID int64

	PageInfo entity.PageInfo
}

type ListDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type UpdatePluginDraftWithCodeRequest struct {
	PluginID   int64
	OpenapiDoc *openapi3.T
	Manifest   *entity.PluginManifest
}

type UpdatePluginDraftRequest struct {
	Plugin *entity.PluginInfo
}

type DeletePluginDraftRequest struct {
	PluginID int64
}

type ListPluginsRequest struct {
	SpaceID int64

	PageInfo entity.PageInfo
}

type ListPluginsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
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
	PluginID int64

	PrivacyInfo *string
}

type GetPluginServerURLRequest struct {
	PluginID int64
}

type GetPluginServerURLResponse struct {
	ServerURL string
}

type CreateToolDraftRequest struct {
	Tool *entity.ToolInfo
}

type CreateToolDraftResponse struct {
	ToolID int64
}

type UpdateToolDraftRequest struct {
	Tool *entity.ToolInfo
}

type ListDraftToolsRequest struct {
	PluginID int64
	PageInfo entity.PageInfo
}

type MGetToolsRequest struct {
	VersionTools []entity.VersionTool
}

type MGetToolsResponse struct {
	Tools []*entity.ToolInfo
}

type GetAllToolsRequest struct {
	PluginID int64
	Draft    bool
}

type GetAllToolsResponse struct {
	Tools []*entity.ToolInfo
}

type ListToolsRequest struct {
	PluginID int64
	PageInfo entity.PageInfo
}

type ListToolsResponse struct {
	Tools []*entity.ToolInfo
	Total int64
}

type ListDraftToolsResponse struct {
	Tools []*entity.ToolInfo
	Total int64
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
	UserID  int64
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

type PublishAgentToolsRequest struct {
	AgentID int64
	UserID  int64
}

type PublishAgentToolsResponse struct {
	ToolVersions map[int64]int64
}

type ExecuteToolRequest struct {
	PluginID  int64
	ToolID    int64
	ExecScene consts.ExecuteScene

	ArgumentsInJson string
}

type ExecuteToolResponse struct {
	Result string
}
