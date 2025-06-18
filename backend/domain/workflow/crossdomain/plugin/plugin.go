package plugin

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	workflow3 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
)

//go:generate  mockgen -destination pluginmock/plugin_mock.go --package pluginmock -source plugin.go
type PluginService interface {
	GetPluginToolsInfo(ctx context.Context, req *PluginToolsInfoRequest) (*PluginToolsInfoResponse, error)
	GetPluginInvokableTools(ctx context.Context, req *PluginToolsInvokableRequest) (map[int64]PluginInvokableTool, error)
}

func GetPluginService() PluginService {
	return pluginSrvImpl
}

func SetPluginService(ts PluginService) {
	pluginSrvImpl = ts
}

var pluginSrvImpl PluginService

type PluginEntity = vo.PluginEntity

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

type DebugExample struct {
	ReqExample  string
	RespExample string
}

type ToolInfo struct {
	ToolName     string
	ToolID       int64
	Description  string
	DebugExample *DebugExample

	Inputs  []*workflow3.APIParameter
	Outputs []*workflow3.APIParameter
}

type PluginToolsInfoResponse struct {
	PluginID      int64
	SpaceID       int64
	Version       string
	PluginName    string
	Description   string
	IconURL       string
	PluginType    int64
	ToolInfoList  map[int64]ToolInfo
	LatestVersion *string
	IsOfficial    bool
}

type ExecConfig = vo.ExecuteConfig

type PluginInvokableTool interface {
	Info(ctx context.Context) (*schema.ToolInfo, error)
	PluginInvoke(ctx context.Context, argumentsInJSON string, cfg ExecConfig) (string, error)
}

type pluginInvokableTool struct {
	pluginInvokableTool PluginInvokableTool
}

func NewInvokableTool(pl PluginInvokableTool) tool.InvokableTool {
	return &pluginInvokableTool{
		pluginInvokableTool: pl,
	}
}

func (p pluginInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	return p.pluginInvokableTool.Info(ctx)
}

func (p pluginInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	execCfg := execute.GetExecuteConfig(opts...)
	return p.pluginInvokableTool.PluginInvoke(ctx, argumentsInJSON, execCfg)

}
