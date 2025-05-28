package crossplugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
)

// TODO(@fanlv): 参数引用需要修改。
type PluginService interface {
	MGetVersionPlugins(ctx context.Context, req *service.MGetVersionPluginsRequest) (resp *service.MGetVersionPluginsResponse, err error)
	BindAgentTools(ctx context.Context, req *service.BindAgentToolsRequest) (err error)
	MGetAgentTools(ctx context.Context, req *service.MGetAgentToolsRequest) (resp *service.MGetAgentToolsResponse, err error)
	ExecuteTool(ctx context.Context, req *service.ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *service.ExecuteToolResponse, err error)
	PublishAgentTools(ctx context.Context, req *service.PublishAgentToolsRequest) (resp *service.PublishAgentToolsResponse, err error)
}

var defaultSVC *impl

type impl struct {
	DomainSVC plugin.PluginService
}

func InitDomainService(c plugin.PluginService) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() PluginService {
	return defaultSVC
}

func (s *impl) MGetVersionPlugins(ctx context.Context, req *service.MGetVersionPluginsRequest) (resp *service.MGetVersionPluginsResponse, err error) {
	return s.DomainSVC.MGetVersionPlugins(ctx, req)
}

func (s *impl) BindAgentTools(ctx context.Context, req *service.BindAgentToolsRequest) (err error) {
	return s.DomainSVC.BindAgentTools(ctx, req)
}

func (s *impl) MGetAgentTools(ctx context.Context, req *service.MGetAgentToolsRequest) (resp *service.MGetAgentToolsResponse, err error) {
	return s.DomainSVC.MGetAgentTools(ctx, req)
}

func (s *impl) ExecuteTool(ctx context.Context, req *service.ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *service.ExecuteToolResponse, err error) {
	return s.DomainSVC.ExecuteTool(ctx, req)
}

func (s *impl) PublishAgentTools(ctx context.Context, req *service.PublishAgentToolsRequest) (resp *service.PublishAgentToolsResponse, err error) {
	return s.DomainSVC.PublishAgentTools(ctx, req)
}
