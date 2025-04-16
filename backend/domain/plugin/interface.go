package plugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginService interface {
	Create(ctx context.Context, req *CreatePluginRequest) (resp *CreatePluginResponse, err error)
	List(ctx context.Context, req *ListPluginsRequest) (resp *ListPluginsResponse, err error)
	Update(ctx context.Context, req *UpdatePluginRequest) (err error)
	Delete(ctx context.Context, req *DeletePluginRequest) (err error)

	Publish(ctx context.Context, req *PublishPluginRequest) (resp *PublishPluginResponse, err error)
}

type CreatePluginRequest struct {
	SpaceID int64

	Plugin *entity.PluginInfo
}

type CreatePluginResponse struct {
	PluginID int64
}

type ListPluginsRequest struct {
	SpaceID  int64
	PageInfo PageInfo
}

type ListPluginsResponse struct {
	Plugins []*entity.PluginInfo
}

type PageInfo struct {
	Page     int32
	PageSize int32
}

type UpdatePluginRequest struct {
	SpaceID int64

	Plugin *entity.PluginInfo
}

type DeletePluginRequest struct {
	SpaceID  int64
	PluginID int64
}

type PublishPluginRequest struct {
	SpaceID  int64
	PluginID int64

	PrivacyInfo *string
}

type PublishPluginResponse struct {
	Version string
}

type GetPluginServerURLRequest struct {
	PluginID int64
}

type GetPluginServerURLResponse struct {
	ServerURL string
}

type ToolService interface {
	Create(ctx context.Context, req *CreateToolRequest) (resp *CreateToolResponse, err error)
	MGet(ctx context.Context, req *MGetToolsRequest) (resp *MGetToolsResponse, err error)
	Update(ctx context.Context, req *UpdateToolRequest) (err error)
	Delete(ctx context.Context, req *DeleteToolRequest) (err error)

	BindAgent(ctx context.Context, req *BindAgentToolRequest) (err error)
	GetAgentTool(ctx context.Context, req *GetAgentToolRequest) (resp *GetAgentToolResponse, err error)
	MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (resp *MGetAgentToolsResponse, err error)
	UpdateAgentTool(ctx context.Context, req *UpdateAgentToolRequest) (err error)
	UnbindAgent(ctx context.Context, req *UnbindAgentToolRequest) (err error)

	Execute(ctx context.Context, req *ExecuteRequest, opts ...entity.ExecuteOpts) (resp *ExecuteResponse, err error)
}

type CreateToolRequest struct {
	Tool *entity.ToolInfo
}

type CreateToolResponse struct {
	ToolID int64
}

type VersionTool struct {
	ToolID  int64
	Version *string
}

type MGetToolsRequest struct {
	VersionTools []VersionTool
}

type MGetToolsResponse struct {
	Tools []*entity.ToolInfo
}

type UpdateToolRequest struct {
	Tool *entity.ToolInfo
}

type DeleteToolRequest struct {
	ToolID int64
}

type BindAgentToolRequest struct {
	AgentID  int64
	PluginID int64
	ToolID   int64
}

type GetAgentToolRequest struct {
	AgentID int64
	IsDraft bool
	ToolID  int64
}

type GetAgentToolResponse struct {
	Tool *entity.ToolInfo
}

type MGetAgentToolsRequest struct {
	AgentID int64
	IsDraft bool
	ToolIDs []int64
}

type MGetAgentToolsResponse struct {
	Tools []*entity.ToolInfo
}

type UpdateAgentToolRequest struct {
	AgentID int64

	ReqParameters  []*plugin_common.APIParameter
	RespParameters []*plugin_common.APIParameter
}

type UnbindAgentToolRequest struct {
	AgentID int64
	ToolID  int64
}

type ExecuteRequest struct {
	PluginID  int64
	ToolID    int64
	ExecScene entity.ExecuteScene

	ArgumentsInJson string
}

type ExecuteResponse struct {
	Result string
}
