package crossplugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
)

type PluginService interface {
	MGetVersionPlugins(ctx context.Context, req *plugin.MGetVersionPluginsRequest) (resp *plugin.MGetVersionPluginsResponse, err error)
	BindAgentTools(ctx context.Context, req *plugin.BindAgentToolsRequest) (err error)
	MGetAgentTools(ctx context.Context, req *plugin.MGetAgentToolsRequest) (resp *plugin.MGetAgentToolsResponse, err error)
	ExecuteTool(ctx context.Context, req *plugin.ExecuteToolRequest, opts ...plugin.ExecuteToolOpts) (resp *plugin.ExecuteToolResponse, err error)
	PublishAgentTools(ctx context.Context, req *plugin.PublishAgentToolsRequest) (resp *plugin.PublishAgentToolsResponse, err error)
	DeleteDraftPlugin(ctx context.Context, req *plugin.DeleteDraftPluginRequest) (err error)
	PublishPlugin(ctx context.Context, req *plugin.PublishPluginRequest) (err error)
	GetPluginNextVersion(ctx context.Context, req *plugin.GetPluginNextVersionRequest) (resp *plugin.GetPluginNextVersionResponse, err error)
}

var defaultSVC PluginService

func DefaultSVC() PluginService {
	return defaultSVC
}

func SetDefaultSVC(svc PluginService) {
	defaultSVC = svc
}
