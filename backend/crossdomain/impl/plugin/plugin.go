/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package plugin

import (
	"context"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	plugin "github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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

func (s *impl) MGetVersionPlugins(ctx context.Context, versionPlugins []model.VersionPlugin) (mPlugins []*model.PluginInfo, err error) {
	plugins, err := s.DomainSVC.MGetVersionPlugins(ctx, versionPlugins)
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

func (s *impl) DuplicateDraftAgentTools(ctx context.Context, fromAgentID, toAgentID int64) (err error) {
	return s.DomainSVC.DuplicateDraftAgentTools(ctx, fromAgentID, toAgentID)
}

func (s *impl) MGetAgentTools(ctx context.Context, req *model.MGetAgentToolsRequest) (tools []*model.ToolInfo, err error) {
	return s.DomainSVC.MGetAgentTools(ctx, req)
}

func (s *impl) ExecuteTool(ctx context.Context, req *model.ExecuteToolRequest, opts ...model.ExecuteToolOpt) (resp *model.ExecuteToolResponse, err error) {
	return s.DomainSVC.ExecuteTool(ctx, req, opts...)
}

func (s *impl) PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error) {
	return s.DomainSVC.PublishAgentTools(ctx, agentID, agentVersion)
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

func (s *impl) MGetVersionTools(ctx context.Context, versionTools []model.VersionTool) (tools []*model.ToolInfo, err error) {
	return s.DomainSVC.MGetVersionTools(ctx, versionTools)
}

func (s *impl) GetAPPAllPlugins(ctx context.Context, appID int64) (plugins []*model.PluginInfo, err error) {
	_plugins, err := s.DomainSVC.GetAPPAllPlugins(ctx, appID)
	if err != nil {
		return nil, err
	}

	plugins = slices.Transform(_plugins, func(e *entity.PluginInfo) *model.PluginInfo {
		return e.PluginInfo
	})

	return plugins, nil
}
