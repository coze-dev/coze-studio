package crossplugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
)

type PluginService interface {
	MGetVersionPlugins(ctx context.Context, req *plugin.MGetVersionPluginsRequest) (plugins []*plugin.PluginInfo, err error)
	MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *plugin.MGetPluginLatestVersionResponse, err error)
	BindAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error)
	MGetAgentTools(ctx context.Context, req *plugin.MGetAgentToolsRequest) (tools []*plugin.ToolInfo, err error)
	ExecuteTool(ctx context.Context, req *plugin.ExecuteToolRequest, opts ...plugin.ExecuteToolOpt) (resp *plugin.ExecuteToolResponse, err error)
	PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error)
	DeleteDraftPlugin(ctx context.Context, PluginID int64) (err error)
	PublishPlugin(ctx context.Context, req *plugin.PublishPluginRequest) (err error)
	PublishAPPPlugins(ctx context.Context, req *plugin.PublishAPPPluginsRequest) (resp *plugin.PublishAPPPluginsResponse, err error)
}

var defaultSVC PluginService

func DefaultSVC() PluginService {
	return defaultSVC
}

func SetDefaultSVC(svc PluginService) {
	defaultSVC = svc
}
