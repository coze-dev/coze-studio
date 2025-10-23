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
	"strconv"
	"strings"

	"golang.org/x/mod/semver"

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *pluginServiceImpl) GetPluginNextVersion(ctx context.Context, pluginID int64) (version string, err error) {
	const defaultVersion = "v1.0.0"

	pl, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pluginID)
	if err != nil {
		return "", errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", pluginID)
	}
	if !exist {
		return defaultVersion, nil
	}

	parts := strings.Split(pl.GetVersion(), ".") // Remove the 'v' and split
	if len(parts) < 3 {
		logs.CtxWarnf(ctx, "invalid version format '%s'", pl.GetVersion())
		return defaultVersion, nil
	}

	patch, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil {
		logs.CtxWarnf(ctx, "invalid version format '%s'", pl.GetVersion())
		return defaultVersion, nil
	}

	parts[2] = strconv.FormatInt(patch+1, 10)
	nextVersion := strings.Join(parts, ".")

	return nextVersion, nil
}

func (p *pluginServiceImpl) PublishPlugin(ctx context.Context, req *model.PublishPluginRequest) (err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", req.PluginID)
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	err = p.checkToolsDebugStatus(ctx, req.PluginID)
	if err != nil {
		return err
	}

	onlinePlugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
	}
	if exist && onlinePlugin.Version != nil {
		if semver.Compare(req.Version, *onlinePlugin.Version) != 1 {
			return errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "version must be greater than the online version '%s' and format like 'v1.0.0'",
					*onlinePlugin.Version))
		}
	}

	draftPlugin.Version = &req.Version
	draftPlugin.VersionDesc = &req.VersionDesc

	err = p.pluginRepo.PublishPlugin(ctx, draftPlugin)
	if err != nil {
		return errorx.Wrapf(err, "PublishPlugin failed, pluginID=%d", req.PluginID)
	}

	return nil
}

func (p *pluginServiceImpl) PublishAPPPlugins(ctx context.Context, req *model.PublishAPPPluginsRequest) (resp *model.PublishAPPPluginsResponse, err error) {
	resp = &model.PublishAPPPluginsResponse{}

	draftPlugins, err := p.pluginRepo.GetAPPAllDraftPlugins(ctx, req.APPID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAPPAllDraftPlugins failed, appID=%d", req.APPID)
	}

	failedPluginIDs, err := p.checkCanPublishAPPPlugins(ctx, req.Version, draftPlugins)
	if err != nil {
		return nil, errorx.Wrapf(err, "checkCanPublishAPPPlugins failed, appID=%d, appVerion=%s", req.APPID, req.Version)
	}

	for _, draftPlugin := range draftPlugins {
		draftPlugin.Version = &req.Version
		draftPlugin.VersionDesc = ptr.Of(fmt.Sprintf("publish %s", req.Version))
		resp.AllDraftPlugins = append(resp.AllDraftPlugins, draftPlugin.PluginInfo)
	}

	if len(failedPluginIDs) > 0 {
		draftPluginMap := slices.ToMap(draftPlugins, func(plugin *entity.PluginInfo) (int64, *entity.PluginInfo) {
			return plugin.ID, plugin
		})

		failedPlugins := make([]*entity.PluginInfo, 0, len(failedPluginIDs))
		for _, failedPluginID := range failedPluginIDs {
			failedPlugins = append(failedPlugins, draftPluginMap[failedPluginID])
		}
		for _, failedPlugin := range failedPlugins {
			resp.FailedPlugins = append(resp.FailedPlugins, failedPlugin.PluginInfo)
		}

		return resp, nil
	}

	err = p.pluginRepo.PublishPlugins(ctx, draftPlugins)
	if err != nil {
		return nil, errorx.Wrapf(err, "PublishPlugins failed, appID=%d", req.APPID)
	}

	return resp, nil
}

func (p *pluginServiceImpl) checkCanPublishAPPPlugins(ctx context.Context, version string, draftPlugins []*entity.PluginInfo) (failedPluginIDs []int64, err error) {
	failedPluginIDs = make([]int64, 0, len(draftPlugins))

	draftPluginIDs := slices.Transform(draftPlugins, func(plugin *entity.PluginInfo) int64 {
		return plugin.ID
	})

	// 1. check version
	onlinePlugins, err := p.pluginRepo.MGetOnlinePlugins(ctx, draftPluginIDs,
		repository.WithPluginID(),
		repository.WithPluginVersion())
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlinePlugins failed, pluginIDs=%v", draftPluginIDs)
	}

	if len(onlinePlugins) > 0 {
		for _, onlinePlugin := range onlinePlugins {
			if onlinePlugin.Version == nil {
				continue
			}
			if semver.Compare(version, *onlinePlugin.Version) != 1 {
				failedPluginIDs = append(failedPluginIDs, onlinePlugin.ID)
			}
		}
		if len(failedPluginIDs) > 0 {
			logs.CtxErrorf(ctx, "invalid version of plugins '%v'", failedPluginIDs)
			return failedPluginIDs, nil
		}
	}

	// 2. check debug status
	for _, draftPlugin := range draftPlugins {
		err = p.checkToolsDebugStatus(ctx, draftPlugin.ID)
		if err != nil {
			failedPluginIDs = append(failedPluginIDs, draftPlugin.ID)
			logs.CtxErrorf(ctx, "checkToolsDebugStatus failed, pluginID=%d, err=%s", draftPlugin.ID, err)
		}
	}

	if len(failedPluginIDs) > 0 {
		return failedPluginIDs, nil
	}

	return failedPluginIDs, nil
}

func (p *pluginServiceImpl) checkToolsDebugStatus(ctx context.Context, pluginID int64) (err error) {
	res, err := p.toolRepo.GetPluginAllDraftTools(ctx, pluginID,
		repository.WithToolID(),
		repository.WithToolDebugStatus(),
		repository.WithToolActivatedStatus(),
	)
	if err != nil {
		return errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", pluginID)
	}

	if len(res) == 0 {
		return errorx.New(errno.ErrPluginToolsCheckFailed, errorx.KVf(errno.PluginMsgKey,
			"at least one activated tool is required in plugin"))
	}

	activatedTools := make([]*entity.ToolInfo, 0, len(res))
	for _, tool := range res {
		if tool.IsDeactivated() {
			continue
		}
		activatedTools = append(activatedTools, tool)
	}

	if len(activatedTools) == 0 {
		return errorx.New(errno.ErrPluginToolsCheckFailed, errorx.KVf(errno.PluginMsgKey,
			"at least one activated tool is required in plugin"))
	}

	for _, tool := range activatedTools {
		if tool.GetDebugStatus() != common.APIDebugStatus_DebugWaiting {
			continue
		}
		return errorx.New(errno.ErrPluginToolsCheckFailed, errorx.KVf(errno.PluginMsgKey,
			"tools in plugin have not debugged yet"))
	}

	return nil
}

func (p *pluginServiceImpl) CheckPluginToolsDebugStatus(ctx context.Context, pluginID int64) (err error) {
	return p.checkToolsDebugStatus(ctx, pluginID)
}
