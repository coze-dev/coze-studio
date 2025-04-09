package plugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginService interface {
	Create(ctx context.Context, req *CreatePluginRequest) (resp *CreatePluginResponse, err error)
	List(ctx context.Context, req *ListPluginsRequest) (resp ListPluginsResponse, err error)
	Update(ctx context.Context, req *UpdatePluginRequest) (err error)
	Delete(ctx context.Context, req *DeletePluginRequest) (err error)

	Publish(ctx context.Context, req *PublishPluginRequest) (err error)
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

	Tools []*entity.ToolIdentity
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

type ToolService interface {
	Create(ctx context.Context, req *CreateToolRequest) (resp *CreateToolResponse, err error)
	MGet(ctx context.Context, req *MGetToolsRequest) (resp *MGetToolsResponse, err error)
	Update(ctx context.Context, req *UpdateToolRequest) (err error)
	Delete(ctx context.Context, req *DeleteToolRequest) (err error)

	BindAgent(ctx context.Context, req *BindAgentToolRequest) (err error)
	GetAgentTool(ctx context.Context, req *GetAgentToolRequest) (resp *GetAgentToolResponse, err error)
	UpdateAgentTool(ctx context.Context, req *UpdateAgentToolRequest) (err error)
	UnbindAgent(ctx context.Context, req *UnbindAgentToolRequest) (err error)

	Execute(ctx context.Context, req *ExecuteRequest) (resp *ExecuteResponse, err error)
}

type CreateToolRequest struct {
	SpaceID int64
	Tool    *entity.ToolInfo
}

type CreateToolResponse struct {
	*entity.ToolIdentity
}

type MGetToolsRequest struct {
	SpaceID int64
	ToolIDs []*entity.ToolIdentity
}

type MGetToolsResponse struct {
	Tools []*entity.ToolInfo
}

type UpdateToolRequest struct {
	SpaceID int64

	Tool *entity.ToolInfo
}

type DeleteToolRequest struct {
	SpaceID int64
	*entity.ToolIdentity
}

type BindAgentToolRequest struct {
	SpaceID int64
	AgentID int64
	*entity.ToolIdentity
}

type GetAgentToolRequest struct {
	SpaceID int64
	AgentID int64
	*entity.ToolIdentity
}

type UpdateAgentToolRequest struct {
	SpaceID int64
	AgentID int64

	ReqParameters  []*plugin_common.APIParameter
	RespParameters []*plugin_common.APIParameter
}

type UnbindAgentToolRequest struct {
	SpaceID int64
	AgentID int64
	*entity.ToolIdentity
}

type GetAgentToolResponse struct {
	Tool *entity.ToolInfo
}

type ExecuteRequest struct {
	SpaceID int64
	AgentID int64
	*entity.ToolIdentity

	ArgumentsInJson string
}

type ExecuteResponse struct {
	Result string
}
