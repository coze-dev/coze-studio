package plugin

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
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

func (s *impl) MGetVersionPlugins(ctx context.Context, req *model.MGetVersionPluginsRequest) (mPlugins []*model.PluginInfo, err error) {
	plugins, err := s.DomainSVC.MGetVersionPlugins(ctx, req)
	if err != nil {
		return nil, err
	}

	mPlugins = slices.Transform(plugins, func(e *entity.PluginInfo) *model.PluginInfo {
		return e.PluginInfo
	})

	return mPlugins, nil
}

func (s *impl) BindAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error) {
	return s.DomainSVC.BindAgentTools(ctx, agentID, toolIDs)
}

func (s *impl) MGetAgentTools(ctx context.Context, req *model.MGetAgentToolsRequest) (tools []*model.ToolInfo, err error) {
	return s.DomainSVC.MGetAgentTools(ctx, req)
}

func (s *impl) ExecuteTool(ctx context.Context, req *model.ExecuteToolRequest, opts ...model.ExecuteToolOpts) (resp *model.ExecuteToolResponse, err error) {
	return s.DomainSVC.ExecuteTool(ctx, req, opts...)
}

func (s *impl) PublishAgentTools(ctx context.Context, agentID int64) (resp *model.PublishAgentToolsResponse, err error) {
	return s.DomainSVC.PublishAgentTools(ctx, agentID)
}

func (s *impl) DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error) {
	return s.DomainSVC.DeleteDraftPlugin(ctx, pluginID)
}

func (s *impl) PublishPlugin(ctx context.Context, req *model.PublishPluginRequest) (err error) {
	return s.DomainSVC.PublishPlugin(ctx, req)
}

func (s *impl) PublishAPPPlugins(ctx context.Context, req *model.PublishAPPPluginsRequest) (resp *model.PublishAPPPluginsResponse, err error) {
	return s.DomainSVC.PublishAPPPlugins(ctx, req)
}

func (s *impl) MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *model.MGetPluginLatestVersionResponse, err error) {
	return s.DomainSVC.MGetPluginLatestVersion(ctx, pluginIDs)
}
