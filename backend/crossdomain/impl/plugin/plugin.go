package plugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
)

var defaultSVC crossplugin.PluginService

type impl struct {
	DomainSVC plugin.PluginService
}

func InitDomainService(c plugin.PluginService) crossplugin.PluginService {
	defaultSVC = &impl{
		DomainSVC: c,
	}

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
	return s.DomainSVC.ExecuteTool(ctx, req, opts...)
}

func (s *impl) PublishAgentTools(ctx context.Context, req *service.PublishAgentToolsRequest) (resp *service.PublishAgentToolsResponse, err error) {
	return s.DomainSVC.PublishAgentTools(ctx, req)
}

func (s *impl) DeleteDraftPlugin(ctx context.Context, req *service.DeleteDraftPluginRequest) (err error) {
	return s.DomainSVC.DeleteDraftPlugin(ctx, req)
}

func (s *impl) PublishPlugin(ctx context.Context, req *service.PublishPluginRequest) (err error) {
	return s.DomainSVC.PublishPlugin(ctx, req)
}

func (s *impl) GetPluginNextVersion(ctx context.Context, req *service.GetPluginNextVersionRequest) (resp *service.GetPluginNextVersionResponse, err error) {
	return s.DomainSVC.GetPluginNextVersion(ctx, req)
}
