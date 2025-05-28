package crossplugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
)

// TODO(@fanlv): 参数引用需要修改。
type PluginService interface {
	MGetVersionPlugins(ctx context.Context, req *service.MGetVersionPluginsRequest) (resp *service.MGetVersionPluginsResponse, err error)
	BindAgentTools(ctx context.Context, req *service.BindAgentToolsRequest) (err error)
	MGetAgentTools(ctx context.Context, req *service.MGetAgentToolsRequest) (resp *service.MGetAgentToolsResponse, err error)
	ExecuteTool(ctx context.Context, req *service.ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *service.ExecuteToolResponse, err error)
	PublishAgentTools(ctx context.Context, req *service.PublishAgentToolsRequest) (resp *service.PublishAgentToolsResponse, err error)
}

var defaultSVC PluginService

func DefaultSVC() PluginService {
	return defaultSVC
}

func SetDefaultSVC(svc PluginService) {
	defaultSVC = svc
}
