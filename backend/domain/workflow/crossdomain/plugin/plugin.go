package plugin

import (
	"context"
	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

//go:generate  mockgen -destination pluginmock/plugin_mock.go --package pluginmock -source plugin.go
type ToolService interface {
	GetPluginInvokableTools(ctx context.Context, req *PluginToolsInfoRequest) (map[int64]tool.InvokableTool, error)
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

type PluginToolsInfoRequest struct {
	PluginEntity PluginEntity
	ToolIDs      []int64
	IsDraft      bool
}

type ToolInfo struct {
	ToolName     string
	ToolID       int64
	DebugExample *vo.DebugExample
	Inputs       []*vo.Variable
	Outputs      []*vo.Variable
}

type PluginToolsInfoResponse struct {
	PluginID     int64
	SpaceID      int64
	Version      string
	PluginName   string
	Description  string
	IconURI      string
	PluginType   int64
	ToolInfoList map[int64]ToolInfo
}
