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
	"time"

	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func (p *PluginApplicationService) PublishPlugin(ctx context.Context, req *pluginAPI.PublishPluginRequest) (resp *pluginAPI.PublishPluginResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validatePublishPluginRequest failed")
	}

	err = p.DomainSVC.PublishPlugin(ctx, &model.PublishPluginRequest{
		PluginID:    req.PluginID,
		Version:     req.VersionName,
		VersionDesc: req.VersionDesc,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "PublishPlugin failed, pluginID=%d", req.PluginID)
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResID:         req.PluginID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_Published),
			PublishTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource '%d' failed, err=%v", req.PluginID, err)
	}

	resp = &pluginAPI.PublishPluginResponse{}

	return resp, nil
}

func (p *PluginApplicationService) DelPlugin(ctx context.Context, req *pluginAPI.DelPluginRequest) (resp *pluginAPI.DelPluginResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateDelPluginRequest failed")
	}

	err = p.DomainSVC.DeleteDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "DeleteDraftPlugin failed, pluginID=%d", req.PluginID)
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Deleted,
		Resource: &searchEntity.ResourceDocument{
			ResType:      resCommon.ResType_Plugin,
			ResID:        req.PluginID,
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish resource '%d' failed", req.PluginID)
	}

	resp = &pluginAPI.DelPluginResponse{}

	return resp, nil
}

func (p *PluginApplicationService) GetPluginNextVersion(ctx context.Context, req *pluginAPI.GetPluginNextVersionRequest) (resp *pluginAPI.GetPluginNextVersionResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateGetPluginNextVersionRequest failed")
	}

	nextVersion, err := p.DomainSVC.GetPluginNextVersion(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginNextVersion failed, pluginID=%d", req.PluginID)
	}
	resp = &pluginAPI.GetPluginNextVersionResponse{
		NextVersionName: nextVersion,
	}
	return resp, nil
}

func (p *PluginApplicationService) GetDevPluginList(ctx context.Context, req *pluginAPI.GetDevPluginListRequest) (resp *pluginAPI.GetDevPluginListResponse, err error) {
	pageInfo := dto.PageInfo{
		Name:       req.Name,
		Page:       int(req.GetPage()),
		Size:       int(req.GetSize()),
		OrderByACS: ptr.Of(false),
	}
	if req.GetOrderBy() == common.OrderBy_UpdateTime {
		pageInfo.SortBy = ptr.Of(dto.SortByUpdatedAt)
	} else {
		pageInfo.SortBy = ptr.Of(dto.SortByCreatedAt)
	}

	res, err := p.DomainSVC.ListDraftPlugins(ctx, &dto.ListDraftPluginsRequest{
		SpaceID:  req.SpaceID,
		APPID:    req.ProjectID,
		PageInfo: pageInfo,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "ListDraftPlugins failed, spaceID=%d, appID=%d", req.SpaceID, req.ProjectID)
	}

	pluginList := make([]*common.PluginInfoForPlayground, 0, len(res.Plugins))
	for _, pl := range res.Plugins {
		tools, err := p.toolRepo.GetPluginAllDraftTools(ctx, pl.ID)
		if err != nil {
			return nil, errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", pl.ID)
		}

		pluginInfo, err := p.toPluginInfoForPlayground(ctx, pl, tools)
		if err != nil {
			return nil, err
		}

		pluginInfo.VersionTs = "0" // when you get the plugin information in the project, version ts is set to 0 by default
		pluginList = append(pluginList, pluginInfo)
	}

	resp = &pluginAPI.GetDevPluginListResponse{
		PluginList: pluginList,
		Total:      res.Total,
	}

	return resp, nil
}

func (p *PluginApplicationService) DeleteAPPAllPlugins(ctx context.Context, appID int64) (err error) {
	pluginIDs, err := p.DomainSVC.DeleteAPPAllPlugins(ctx, appID)
	if err != nil {
		return errorx.Wrapf(err, "DeleteAPPAllPlugins failed, appID=%d", appID)
	}

	for _, id := range pluginIDs {
		err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
			OpType: searchEntity.Deleted,
			Resource: &searchEntity.ResourceDocument{
				ResType: resCommon.ResType_Plugin,
				ResID:   id,
			},
		})
		if err != nil {
			return errorx.Wrapf(err, "publish resource '%d' failed", id)
		}
	}

	return nil
}

func (p *PluginApplicationService) CopyPlugin(ctx context.Context, req *dto.CopyPluginRequest) (resp *dto.CopyPluginResponse, err error) {
	res, err := p.DomainSVC.CopyPlugin(ctx, &dto.CopyPluginRequest{
		UserID:      req.UserID,
		PluginID:    req.PluginID,
		CopyScene:   req.CopyScene,
		TargetAPPID: req.TargetAPPID,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CopyPlugin failed, pluginID=%d", req.PluginID)
	}

	plugin := res.Plugin

	now := time.Now().UnixMilli()
	resDoc := &searchEntity.ResourceDocument{
		ResType:       resCommon.ResType_Plugin,
		ResSubType:    ptr.Of(int32(plugin.PluginType)),
		ResID:         plugin.ID,
		Name:          ptr.Of(plugin.GetName()),
		SpaceID:       &plugin.SpaceID,
		APPID:         plugin.APPID,
		OwnerID:       &req.UserID,
		PublishStatus: ptr.Of(resCommon.PublishStatus_UnPublished),
		CreateTimeMS:  ptr.Of(now),
	}
	if plugin.Published() {
		resDoc.PublishStatus = ptr.Of(resCommon.PublishStatus_Published)
		resDoc.PublishTimeMS = ptr.Of(now)
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType:   searchEntity.Created,
		Resource: resDoc,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish resource '%d' failed", plugin.ID)
	}

	resp = &dto.CopyPluginResponse{
		Plugin: res.Plugin,
		Tools:  res.Tools,
	}

	return resp, nil
}

func (p *PluginApplicationService) MoveAPPPluginToLibrary(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	plugin, err = p.DomainSVC.MoveAPPPluginToLibrary(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "MoveAPPPluginToLibrary failed, pluginID=%d", pluginID)
	}

	now := time.Now().UnixMilli()

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResID:         pluginID,
			APPID:         ptr.Of(int64(0)),
			PublishStatus: ptr.Of(resCommon.PublishStatus_Published),
			PublishTimeMS: ptr.Of(now),
			UpdateTimeMS:  ptr.Of(now),
		},
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish resource '%d' failed", pluginID)
	}

	return plugin, nil
}
