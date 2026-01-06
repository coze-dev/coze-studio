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
	"fmt"
	"slices"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_common"
	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func (p *PluginApplicationService) GetPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (resp *pluginAPI.GetPlaygroundPluginListResponse, err error) {
	var (
		plugins []*entity.PluginInfo
		total   int64
	)

	var isSaasPlugin bool
	if slices.Contains(req.PluginTypes, int32(product_common.ProductEntityType_SaasPlugin)) {
		isSaasPlugin = true
	}
	if len(req.PluginIds) > 0 {
		if isSaasPlugin {
			plugins, total, err = p.getSaasPluginListByIDs(ctx, req.PluginIds)
		} else {
			plugins, total, err = p.getPlaygroundPluginListByIDs(ctx, req.PluginIds)
		}
	} else {
		plugins, total, err = p.getPlaygroundPluginList(ctx, req)
	}

	if err != nil {
		return nil, errorx.Wrapf(err, "getPlaygroundPluginList failed, req=%v", req)
	}

	pluginList := make([]*common.PluginInfoForPlayground, 0, len(plugins))

	if isSaasPlugin {
		pluginIDs := make([]int64, 0, len(plugins))
		for _, product := range plugins {
			pluginIDs = append(pluginIDs, product.ID)
		}

		tools, err := p.getSaasPluginToolsList(ctx, pluginIDs)
		if err != nil {
			logs.CtxErrorf(ctx, "BatchGetSaasPluginToolsInfo failed: %v", err)
			return nil, err
		}
		pluginList, err = p.convertSaasPluginListToPlayground(ctx, plugins, tools)
		if err != nil {
			return nil, err
		}

	} else {
		for _, pl := range plugins {
			tools, err := p.toolRepo.GetPluginAllOnlineTools(ctx, pl.ID)
			if err != nil {
				return nil, errorx.Wrapf(err, "GetPluginAllOnlineTools failed, pluginID=%d", pl.ID)
			}

			pluginInfo, err := p.toPluginInfoForPlayground(ctx, pl, tools)
			if err != nil {
				return nil, err
			}

			pluginList = append(pluginList, pluginInfo)
		}
	}

	resp = &pluginAPI.GetPlaygroundPluginListResponse{
		Data: &common.GetPlaygroundPluginListData{
			Total:      int32(total),
			PluginList: pluginList,
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) convertSaasPluginListToPlayground(ctx context.Context, plugins []*entity.PluginInfo, tools map[int64][]*entity.ToolInfo) ([]*common.PluginInfoForPlayground, error) {
	products := make([]*common.PluginInfoForPlayground, 0, len(plugins))
	for _, pl := range plugins {
		tools := tools[pl.ID]
		pluginInfo, err := p.toPluginInfoForPlayground(ctx, pl, tools)
		if err != nil {
			return nil, err
		}
		products = append(products, pluginInfo)
	}
	return products, nil
}

func (p *PluginApplicationService) getSaasPluginListByIDs(ctx context.Context, pluginIDs []string) ([]*entity.PluginInfo, int64, error) {
	ids := make([]int64, 0, len(pluginIDs))

	for _, pluginIDStr := range pluginIDs {
		pluginID, err := strconv.ParseInt(pluginIDStr, 10, 64)
		if err != nil {
			return nil, 0, fmt.Errorf("invalid pluginID '%s': %w", pluginIDStr, err)
		}
		ids = append(ids, pluginID)
	}

	plugins, err := p.DomainSVC.GetSaasPluginInfo(ctx, ids)
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "GetSaasPluginInfo failed, pluginIDs=%v", pluginIDs)
	}

	return plugins, int64(len(plugins)), nil
}

func (p *PluginApplicationService) getPlaygroundPluginListByIDs(ctx context.Context, pluginIDs []string) (plugins []*entity.PluginInfo, total int64, err error) {
	ids := make([]int64, 0, len(pluginIDs))
	for _, id := range pluginIDs {
		pluginID, pErr := strconv.ParseInt(id, 10, 64)
		if pErr != nil {
			return nil, 0, fmt.Errorf("invalid pluginID '%s'", id)
		}
		ids = append(ids, pluginID)
	}

	plugins, err = p.pluginRepo.MGetOnlinePlugins(ctx, ids)
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "MGetOnlinePlugins failed, pluginIDs=%v", pluginIDs)
	}

	total = int64(len(plugins))

	return plugins, total, nil
}

func (p *PluginApplicationService) getPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (plugins []*entity.PluginInfo, total int64, err error) {
	pageInfo := dto.PageInfo{
		Name: req.Name,
		Page: int(req.GetPage()),
		Size: int(req.GetSize()),
		SortBy: func() *dto.SortField {
			if req.GetOrderBy() == 0 {
				return ptr.Of(dto.SortByUpdatedAt)
			}
			return ptr.Of(dto.SortByCreatedAt)
		}(),
		OrderByACS: ptr.Of(false),
	}
	plugins, total, err = p.DomainSVC.ListCustomOnlinePlugins(ctx, req.GetSpaceID(), pageInfo)
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "ListCustomOnlinePlugins failed, spaceID=%d", req.GetSpaceID())
	}

	return plugins, total, nil
}

func (p *PluginApplicationService) toPluginInfoForPlayground(ctx context.Context, pl *entity.PluginInfo, tools []*entity.ToolInfo) (*common.PluginInfoForPlayground, error) {
	pluginAPIs := make([]*common.PluginApi, 0, len(tools))
	for _, tl := range tools {
		params, err := tl.ToPluginParameters()
		if err != nil {
			return nil, err
		}

		pluginAPIs = append(pluginAPIs, &common.PluginApi{
			APIID:      strconv.FormatInt(tl.ID, 10),
			Name:       tl.GetName(),
			Desc:       tl.GetDesc(),
			PluginID:   strconv.FormatInt(pl.ID, 10),
			PluginName: pl.GetName(),
			RunMode:    common.RunMode_Sync,
			Parameters: params,
		})
	}

	var creator *common.Creator
	if pl.Source != ptr.Of(bot_common.PluginFrom_FromSaas) {
		userInfo, err := p.userSVC.GetUserInfo(ctx, pl.DeveloperID)
		if err != nil {
			logs.CtxErrorf(ctx, "get user info failed, err=%v", err)
			creator = common.NewCreator()
		} else {
			creator = &common.Creator{
				ID:             strconv.FormatInt(pl.DeveloperID, 10),
				Name:           userInfo.Name,
				AvatarURL:      userInfo.IconURL,
				UserUniqueName: userInfo.UniqueName,
			}
		}
	}

	iconURL, err := p.oss.GetObjectUrl(ctx, pl.GetIconURI())
	if err != nil {
		logs.Errorf("get plugin icon url failed, err=%v", err)
	}

	authType, ok := convert.ToThriftAuthType(pl.GetAuthInfo().Type)
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%s'", pl.GetAuthInfo().Type)
	}

	pluginInfo := &common.PluginInfoForPlayground{
		Auth:           int32(authType),
		CreateTime:     strconv.FormatInt(pl.CreatedAt/1000, 10),
		CreationMethod: common.CreationMethod_COZE,
		Creator:        creator,
		DescForHuman:   pl.GetDesc(),
		ID:             strconv.FormatInt(pl.ID, 10),
		IsOfficial:     pl.IsOfficial(),
		MaterialID:     strconv.FormatInt(pl.ID, 10),
		Name:           pl.GetName(),
		PluginIcon:     iconURL,
		PluginType:     pl.PluginType,
		SpaceID:        strconv.FormatInt(pl.SpaceID, 10),
		StatisticData:  common.NewPluginStatisticData(),
		Status:         common.PluginStatus_SUBMITTED,
		UpdateTime:     strconv.FormatInt(pl.UpdatedAt/1000, 10),
		ProjectID:      strconv.FormatInt(pl.GetAPPID(), 10),
		VersionName:    pl.GetVersion(),
		VersionTs:      pl.GetVersion(), // Compatible with front-end logic, in theory VersionName should be used
		PluginApis:     pluginAPIs,
	}

	return pluginInfo, nil
}
