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

package service

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
)

//go:generate mockgen -destination ../../../internal/mock/domain/plugin/interface.go --package mockPlugin -source service.go
type PluginService interface {
	// Draft Plugin
	CreateDraftPlugin(ctx context.Context, req *dto.CreateDraftPluginRequest) (pluginID int64, err error)
	CreateDraftPluginWithCode(ctx context.Context, req *dto.CreateDraftPluginWithCodeRequest) (resp *dto.CreateDraftPluginWithCodeResponse, err error)
	GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGetDraftPlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	ListDraftPlugins(ctx context.Context, req *dto.ListDraftPluginsRequest) (resp *dto.ListDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *dto.UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithCode(ctx context.Context, req *dto.UpdateDraftPluginWithCodeRequest) (err error)
	DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error)
	DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error)
	GetAPPAllPlugins(ctx context.Context, appID int64) (plugins []*entity.PluginInfo, err error)

	// Online Plugin
	PublishPlugin(ctx context.Context, req *model.PublishPluginRequest) (err error)
	PublishAPPPlugins(ctx context.Context, req *model.PublishAPPPluginsRequest) (resp *model.PublishAPPPluginsResponse, err error)
	GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *model.MGetPluginLatestVersionResponse, err error)
	GetPluginNextVersion(ctx context.Context, pluginID int64) (version string, err error)
	MGetVersionPlugins(ctx context.Context, versionPlugins []model.VersionPlugin) (plugins []*entity.PluginInfo, err error)
	ListCustomOnlinePlugins(ctx context.Context, spaceID int64, pageInfo dto.PageInfo) (plugins []*entity.PluginInfo, total int64, err error)

	// Draft Tool
	MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	UpdateDraftTool(ctx context.Context, req *dto.UpdateDraftToolRequest) (err error)
	ConvertToOpenapi3Doc(ctx context.Context, req *dto.ConvertToOpenapi3DocRequest) (resp *dto.ConvertToOpenapi3DocResponse)
	CreateDraftToolsWithCode(ctx context.Context, req *dto.CreateDraftToolsWithCodeRequest) (resp *dto.CreateDraftToolsWithCodeResponse, err error)
	CheckPluginToolsDebugStatus(ctx context.Context, pluginID int64) (err error)

	// Online Tool
	GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error)
	MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	MGetVersionTools(ctx context.Context, versionTools []model.VersionTool) (tools []*entity.ToolInfo, err error)
	CopyPlugin(ctx context.Context, req *dto.CopyPluginRequest) (resp *dto.CopyPluginResponse, err error)
	MoveAPPPluginToLibrary(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)

	// Agent Tool
	BindAgentTools(ctx context.Context, agentID int64, bindTools []*model.BindToolInfo) (err error)
	DuplicateDraftAgentTools(ctx context.Context, fromAgentID, toAgentID int64) (err error)
	GetDraftAgentToolByName(ctx context.Context, agentID int64, pluginID int64, toolName string) (tool *entity.ToolInfo, err error)
	MGetAgentTools(ctx context.Context, req *model.MGetAgentToolsRequest) (tools []*entity.ToolInfo, err error)
	UpdateBotDefaultParams(ctx context.Context, req *dto.UpdateBotDefaultParamsRequest) (err error)

	PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error)

	ExecuteTool(ctx context.Context, req *model.ExecuteToolRequest, opts ...model.ExecuteToolOpt) (resp *model.ExecuteToolResponse, err error)

	// Product
	ListPluginProducts(ctx context.Context, req *dto.ListPluginProductsRequest) (resp *dto.ListPluginProductsResponse, err error)
	GetPluginProductAllTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)

	GetOAuthStatus(ctx context.Context, userID, pluginID int64) (resp *dto.GetOAuthStatusResponse, err error)
	GetAgentPluginsOAuthStatus(ctx context.Context, userID, agentID int64) (status []*dto.AgentPluginOAuthStatus, err error)
	//Saas Plugin Product
	ListSaasPluginProducts(ctx context.Context, req *dto.ListSaasPluginProductsRequest) (resp *dto.ListPluginProductsResponse, err error)
	BatchGetSaasPluginToolsInfo(ctx context.Context, pluginIDs []int64) (tools map[int64][]*entity.ToolInfo, plugins map[int64]*entity.PluginInfo, err error)
	GetSaasPluginInfo(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	ListSaasPluginCategories(ctx context.Context, req *dto.ListPluginCategoriesRequest) (resp *dto.ListPluginCategoriesResponse, err error)

	OAuthCode(ctx context.Context, code string, state *dto.OAuthState) (err error)
	GetAccessToken(ctx context.Context, oa *dto.OAuthInfo) (accessToken string, err error)
	RevokeAccessToken(ctx context.Context, meta *dto.AuthorizationCodeMeta) (err error)
}
