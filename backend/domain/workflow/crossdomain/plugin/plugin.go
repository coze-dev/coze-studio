package plugin

import (
	"context"

	workflow3 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

//go:generate  mockgen -destination pluginmock/plugin_mock.go --package pluginmock -source plugin.go
type ToolService interface {
	GetPluginInvokableTools(ctx context.Context, req *PluginToolsInvokableRequest) (map[int64]tool.InvokableTool, error)
	GetPluginToolsInfo(ctx context.Context, req *PluginToolsInfoRequest) (*PluginToolsInfoResponse, error)
}

func GetToolService() ToolService {
	return toolSrvImpl
}

func SetToolService(ts ToolService) {
	toolSrvImpl = ts
}

var toolSrvImpl ToolService

type PluginEntity struct {
	PluginID      int64
	PluginVersion *string
}

type WorkflowAPIParameters = []*workflow3.APIParameter
type PluginToolsInfoRequest struct {
	PluginEntity PluginEntity
	ToolIDs      []int64
	IsDraft      bool
}
type ToolsInvokableInfo struct {
	ToolID                      int64
	RequestAPIParametersConfig  WorkflowAPIParameters
	ResponseAPIParametersConfig WorkflowAPIParameters
}
type PluginToolsInvokableRequest struct {
	PluginEntity       PluginEntity
	ToolsInvokableInfo map[int64]*ToolsInvokableInfo
	IsDraft            bool
}

type ToolInfo struct {
	ToolName     string
	ToolID       int64
	Description  string
	DebugExample *vo.DebugExample

	Inputs  []*workflow3.APIParameter
	Outputs []*workflow3.APIParameter
}

type PluginToolsInfoResponse struct {
	PluginID     int64
	SpaceID      int64
	Version      string
	PluginName   string
	Description  string
	IconURL      string
	PluginType   int64
	ToolInfoList map[int64]ToolInfo
}
