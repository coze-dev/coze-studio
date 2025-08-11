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
	"fmt"
	"sort"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	searchModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/search"
	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	crosssearch "github.com/coze-dev/coze-studio/backend/crossdomain/contract/search"
	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *pluginServiceImpl) GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	pl, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", pluginID)
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	return pl, nil
}

func (p *pluginServiceImpl) MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins, err = p.pluginRepo.MGetOnlinePlugins(ctx, pluginIDs)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlinePlugins failed, pluginIDs=%v", pluginIDs)
	}

	res := make([]*model.PluginInfo, 0, len(plugins))
	for _, pl := range plugins {
		res = append(res, pl.PluginInfo)
	}

	return plugins, nil
}

func (p *pluginServiceImpl) GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error) {
	tool, exist, err := p.toolRepo.GetOnlineTool(ctx, toolID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOnlineTool failed, toolID=%d", toolID)
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	return tool, nil
}

func (p *pluginServiceImpl) MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools, err = p.toolRepo.MGetOnlineTools(ctx, toolIDs)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlineTools failed, toolIDs=%v", toolIDs)
	}

	return tools, nil
}

func (p *pluginServiceImpl) MGetVersionTools(ctx context.Context, versionTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools, err = p.toolRepo.MGetVersionTools(ctx, versionTools)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetVersionTools failed, versionTools=%v", versionTools)
	}

	return tools, nil
}

func (p *pluginServiceImpl) ListPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error) {
	plugins := slices.Transform(pluginConf.GetAllPluginProducts(), func(p *pluginConf.PluginInfo) *entity.PluginInfo {
		return entity.NewPluginInfo(p.Info)
	})
	sort.Slice(plugins, func(i, j int) bool {
		return plugins[i].GetRefProductID() < plugins[j].GetRefProductID()
	})

	return &ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
	}, nil
}

func (p *pluginServiceImpl) GetPluginProductAllTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	res, err := p.toolRepo.GetPluginAllOnlineTools(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginAllOnlineTools failed, pluginID=%d", pluginID)
	}

	return res, nil
}

func (p *pluginServiceImpl) DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error) {
	return p.pluginRepo.DeleteAPPAllPlugins(ctx, appID)
}

func (p *pluginServiceImpl) GetAPPAllPlugins(ctx context.Context, appID int64) (plugins []*entity.PluginInfo, err error) {
	plugins, err = p.pluginRepo.GetAPPAllDraftPlugins(ctx, appID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAPPAllDraftPlugins failed, appID=%d", appID)
	}

	return plugins, nil
}

func (p *pluginServiceImpl) MGetVersionPlugins(ctx context.Context, versionPlugins []entity.VersionPlugin) (plugins []*entity.PluginInfo, err error) {
	plugins, err = p.pluginRepo.MGetVersionPlugins(ctx, versionPlugins)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetVersionPlugins failed, versionPlugins=%v", versionPlugins)
	}

	return plugins, nil
}

func (p *pluginServiceImpl) ListCustomOnlinePlugins(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	if pageInfo.Name == nil || *pageInfo.Name == "" {
		plugins, total, err = p.pluginRepo.ListCustomOnlinePlugins(ctx, spaceID, pageInfo)
		if err != nil {
			return nil, 0, errorx.Wrapf(err, "ListCustomOnlinePlugins failed, spaceID=%d", spaceID)
		}
		return plugins, total, nil
	}

	res, err := crosssearch.DefaultSVC().SearchResources(ctx, &searchModel.SearchResourcesRequest{
		SpaceID:  spaceID,
		Name:     *pageInfo.Name,
		OrderAsc: false,
		ResTypeFilter: []resCommon.ResType{
			resCommon.ResType_Plugin,
		},
		OrderFiledName: func() string {
			if pageInfo.SortBy == nil || *pageInfo.SortBy != entity.SortByCreatedAt {
				return searchModel.FieldOfUpdateTime
			}
			return searchModel.FieldOfCreateTime
		}(),
		Page:  ptr.Of(int32(pageInfo.Page)),
		Limit: int32(pageInfo.Size),
	})
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "SearchResources failed, spaceID=%d", spaceID)
	}

	plugins = make([]*entity.PluginInfo, 0, len(res.Data))
	for _, pl := range res.Data {
		draftPlugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pl.ResID)
		if err != nil {
			return nil, 0, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", pl.ResID)
		}
		if !exist {
			logs.CtxWarnf(ctx, "online plugin not exist, pluginID=%d", pl.ResID)
			continue
		}
		plugins = append(plugins, draftPlugin)
	}

	if res.TotalHits != nil {
		total = *res.TotalHits
	}

	return plugins, total, nil
}

func (p *pluginServiceImpl) MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *MGetPluginLatestVersionResponse, err error) {
	plugins, err := p.pluginRepo.MGetOnlinePlugins(ctx, pluginIDs,
		repository.WithPluginID(),
		repository.WithPluginVersion())
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlinePlugins failed, pluginIDs=%v", pluginIDs)
	}

	versions := make(map[int64]string, len(plugins))
	for _, pl := range plugins {
		versions[pl.ID] = pl.GetVersion()
	}

	resp = &MGetPluginLatestVersionResponse{
		Versions: versions,
	}

	return resp, nil
}

func (p *pluginServiceImpl) CopyPlugin(ctx context.Context, req *CopyPluginRequest) (resp *CopyPluginResponse, err error) {
	err = p.checkCanCopyPlugin(ctx, req.PluginID, req.CopyScene)
	if err != nil {
		return nil, err
	}

	plugin, tools, err := p.getCopySourcePluginAndTools(ctx, req.PluginID, req.CopyScene)
	if err != nil {
		return nil, err
	}

	p.changePluginAndToolsInfoForCopy(req, plugin, tools)

	toolMap := make(map[int64]*entity.ToolInfo, len(tools))
	for _, tool := range tools {
		toolMap[tool.ID] = tool
	}

	plugin, tools, err = p.pluginRepo.CopyPlugin(ctx, &repository.CopyPluginRequest{
		Plugin: plugin,
		Tools:  tools,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CopyPlugin failed, pluginID=%d", req.PluginID)
	}

	resp = &CopyPluginResponse{
		Plugin: plugin,
		Tools:  toolMap,
	}

	return resp, nil
}

func (p *pluginServiceImpl) changePluginAndToolsInfoForCopy(req *CopyPluginRequest, plugin *entity.PluginInfo, tools []*entity.ToolInfo) {
	plugin.Version = nil
	plugin.VersionDesc = nil

	plugin.DeveloperID = req.UserID

	if req.CopyScene != model.CopySceneOfAPPDuplicate {
		plugin.SetName(fmt.Sprintf("%s_copy", plugin.GetName()))
	}

	if req.CopyScene == model.CopySceneOfToLibrary {
		const (
			defaultVersion     = "v0.0.1"
			defaultVersionDesc = "copy to library"
		)

		plugin.APPID = nil
		plugin.Version = ptr.Of(defaultVersion)
		plugin.VersionDesc = ptr.Of(defaultVersionDesc)

		for _, tool := range tools {
			tool.Version = ptr.Of(defaultVersion)
		}
	}

	if req.CopyScene == model.CopySceneOfToAPP {
		plugin.APPID = req.TargetAPPID

		for _, tool := range tools {
			tool.DebugStatus = ptr.Of(pluginCommon.APIDebugStatus_DebugPassed)
		}
	}

	if req.CopyScene == model.CopySceneOfAPPDuplicate {
		plugin.APPID = req.TargetAPPID
	}
}

func (p *pluginServiceImpl) checkCanCopyPlugin(ctx context.Context, pluginID int64, scene model.CopyScene) (err error) {
	switch scene {
	case model.CopySceneOfToAPP, model.CopySceneOfDuplicate, model.CopySceneOfAPPDuplicate:
		return nil
	case model.CopySceneOfToLibrary:
		return p.checkToolsDebugStatus(ctx, pluginID)
	default:
		return fmt.Errorf("unsupported copy scene '%s'", scene)
	}
}

func (p *pluginServiceImpl) getCopySourcePluginAndTools(ctx context.Context, pluginID int64, scene model.CopyScene) (plugin *entity.PluginInfo, tools []*entity.ToolInfo, err error) {
	switch scene {
	case model.CopySceneOfToAPP:
		return p.getOnlinePluginAndTools(ctx, pluginID)
	case model.CopySceneOfToLibrary, model.CopySceneOfDuplicate, model.CopySceneOfAPPDuplicate:
		return p.getDraftPluginAndTools(ctx, pluginID)
	default:
		return nil, nil, fmt.Errorf("unsupported copy scene '%s'", scene)
	}
}

func (p *pluginServiceImpl) getOnlinePluginAndTools(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, tools []*entity.ToolInfo, err error) {
	onlinePlugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pluginID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	onlineTools, err := p.toolRepo.GetPluginAllOnlineTools(ctx, pluginID)
	if err != nil {
		return nil, nil, err
	}

	return onlinePlugin, onlineTools, nil
}

func (p *pluginServiceImpl) getDraftPluginAndTools(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, tools []*entity.ToolInfo, err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	draftTools, err := p.toolRepo.GetPluginAllDraftTools(ctx, pluginID)
	if err != nil {
		return nil, nil, err
	}

	return draftPlugin, draftTools, nil
}

func (p *pluginServiceImpl) MoveAPPPluginToLibrary(ctx context.Context, pluginID int64) (draftPlugin *entity.PluginInfo, err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	err = p.checkToolsDebugStatus(ctx, pluginID)
	if err != nil {
		return nil, err
	}

	draftTools, err := p.toolRepo.GetPluginAllDraftTools(ctx, pluginID)
	if err != nil {
		return nil, err
	}

	p.changePluginAndToolsInfoForMove(draftPlugin, draftTools)

	err = p.pluginRepo.MoveAPPPluginToLibrary(ctx, draftPlugin, draftTools)
	if err != nil {
		return nil, errorx.Wrapf(err, "MoveAPPPluginToLibrary failed, pluginID=%d", pluginID)
	}

	return draftPlugin, nil
}

func (p *pluginServiceImpl) changePluginAndToolsInfoForMove(plugin *entity.PluginInfo,
	tools []*entity.ToolInfo) {

	const (
		defaultVersion     = "v0.0.1"
		defaultVersionDesc = "move to library"
	)

	plugin.Version = ptr.Of(defaultVersion)
	plugin.VersionDesc = ptr.Of(defaultVersionDesc)

	for _, tool := range tools {
		tool.Version = ptr.Of(defaultVersion)
	}

	plugin.APPID = nil
}
