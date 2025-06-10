package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type ToolRepository interface {
	CreateDraftTool(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error)
	UpsertDraftTools(ctx context.Context, pluginID int64, tools []*entity.ToolInfo) (err error)
	UpdateDraftTool(ctx context.Context, tool *entity.ToolInfo) (err error)
	GetDraftTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error)
	MGetDraftTools(ctx context.Context, toolIDs []int64, opts ...ToolSelectedOptions) (tools []*entity.ToolInfo, err error)

	GetDraftToolWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error)
	MGetDraftToolWithAPI(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI, opts ...ToolSelectedOptions) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error)
	DeleteDraftTool(ctx context.Context, toolID int64) (err error)

	GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error)
	MGetOnlineTools(ctx context.Context, toolIDs []int64, opts ...ToolSelectedOptions) (tools []*entity.ToolInfo, err error)

	GetVersionTool(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, exist bool, err error)
	MGetVersionTools(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error)

	BindDraftAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error)
	GetDraftAgentTool(ctx context.Context, agentID, toolID int64) (tool *entity.ToolInfo, exist bool, err error)
	GetDraftAgentToolWithToolName(ctx context.Context, agentID int64, toolName string) (tool *entity.ToolInfo, exist bool, err error)
	MGetDraftAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	UpdateDraftAgentTool(ctx context.Context, req *UpdateDraftAgentToolRequest) (err error)
	GetSpaceAllDraftAgentTools(ctx context.Context, agentID int64) (tools []*entity.ToolInfo, err error)

	GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error)
	GetVersionAgentToolWithToolName(ctx context.Context, req *GetVersionAgentToolWithToolNameRequest) (tool *entity.ToolInfo, exist bool, err error)
	MGetVersionAgentTool(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error)
	BatchCreateVersionAgentTools(ctx context.Context, agentID int64, agentVersion string, tools []*entity.ToolInfo) (err error)

	UpdateDraftToolAndDebugExample(ctx context.Context, pluginID int64, doc *plugin.Openapi3T, updatedTool *entity.ToolInfo) (err error)

	GetPluginAllDraftTools(ctx context.Context, pluginID int64, opts ...ToolSelectedOptions) (tools []*entity.ToolInfo, err error)
	GetPluginAllOnlineTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)
	ListPluginDraftTools(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error)
}

type GetVersionAgentToolWithToolNameRequest struct {
	AgentID      int64
	ToolName     string
	AgentVersion *string
}

type UpdateDraftAgentToolRequest struct {
	AgentID  int64
	ToolName string
	Tool     *entity.ToolInfo
}
