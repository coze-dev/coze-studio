package plugin

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"

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

func (s *impl) MGetVersionPlugins(ctx context.Context, req *model.MGetVersionPluginsRequest) (resp *model.MGetVersionPluginsResponse, err error) {
	return s.DomainSVC.MGetVersionPlugins(ctx, req)
}

func (s *impl) BindAgentTools(ctx context.Context, req *model.BindAgentToolsRequest) (err error) {
	return s.DomainSVC.BindAgentTools(ctx, req)
}

func (s *impl) MGetAgentTools(ctx context.Context, req *model.MGetAgentToolsRequest) (resp *model.MGetAgentToolsResponse, err error) {
	return s.DomainSVC.MGetAgentTools(ctx, req)
}

func (s *impl) ExecuteTool(ctx context.Context, req *model.ExecuteToolRequest, opts ...model.ExecuteToolOpts) (resp *model.ExecuteToolResponse, err error) {
	return s.DomainSVC.ExecuteTool(ctx, req, opts...)
}

func (s *impl) PublishAgentTools(ctx context.Context, req *model.PublishAgentToolsRequest) (resp *model.PublishAgentToolsResponse, err error) {
	return s.DomainSVC.PublishAgentTools(ctx, req)
}

func (s *impl) DeleteDraftPlugin(ctx context.Context, req *model.DeleteDraftPluginRequest) (err error) {
	return s.DomainSVC.DeleteDraftPlugin(ctx, req)
}

func (s *impl) PublishPlugin(ctx context.Context, req *model.PublishPluginRequest) (err error) {
	return s.DomainSVC.PublishPlugin(ctx, req)
}

func (s *impl) GetPluginNextVersion(ctx context.Context, req *model.GetPluginNextVersionRequest) (resp *model.GetPluginNextVersionResponse, err error) {
	return s.DomainSVC.GetPluginNextVersion(ctx, req)
}
