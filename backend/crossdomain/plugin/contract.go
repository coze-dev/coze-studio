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

	"github.com/cloudwego/eino/schema"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	workflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
)

//go:generate  mockgen -destination pluginmock/plugin_mock.go --package pluginmock -source plugin.go
type PluginService interface {
	BindAgentTools(ctx context.Context, agentID int64, bindTools []*model.BindToolInfo) (err error)
	MGetAgentTools(ctx context.Context, req *model.MGetAgentToolsRequest) (tools []*model.ToolInfo, err error)
	ExecuteTool(ctx context.Context, req *model.ExecuteToolRequest, opts ...model.ExecuteToolOpt) (resp *model.ExecuteToolResponse, err error)
	PublishAPPPlugins(ctx context.Context, req *model.PublishAPPPluginsRequest) (resp *model.PublishAPPPluginsResponse, err error)
	GetAPPAllPlugins(ctx context.Context, appID int64) (plugins []*model.PluginInfo, err error)
	MGetDraftPlugins(ctx context.Context, pluginIDs []int64) (plugins []*model.PluginInfo, err error)
	MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*model.PluginInfo, err error)
	MGetVersionPlugins(ctx context.Context, versionPlugins []model.VersionPlugin) (plugins []*model.PluginInfo, err error)
	MGetDraftTools(ctx context.Context, pluginIDs []int64) (tools []*model.ToolInfo, err error)
	MGetOnlineTools(ctx context.Context, pluginIDs []int64) (tools []*model.ToolInfo, err error)
	MGetVersionTools(ctx context.Context, versionTools []model.VersionTool) (tools []*model.ToolInfo, err error)

	BatchGetSaasPluginToolsInfo(ctx context.Context, pluginIDs []int64) (tools map[int64][]*entity.ToolInfo, plugins map[int64]*model.PluginInfo, err error)
}

type InvokableTool interface {
	Info(ctx context.Context) (*schema.ToolInfo, error)
	PluginInvoke(ctx context.Context, argumentsInJSON string, cfg workflow.ExecuteConfig) (string, error)
}

var defaultSVC PluginService

func DefaultSVC() PluginService {
	return defaultSVC
}

func SetDefaultSVC(svc PluginService) {
	defaultSVC = svc
}
