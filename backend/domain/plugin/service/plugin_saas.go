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
	"encoding/json"
	"fmt"
	"strconv"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/saasapi"
)

type CozePlugin struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IconURL     string `json:"icon_url"`
	Category    string `json:"category"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}


func (p *pluginServiceImpl) ListSaasPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error) {

	plugins, err := p.fetchSaasPluginsFromCoze(ctx)
	if err != nil {
		return nil, errorx.Wrapf(err, "fetchSaasPluginsFromCoze failed")
	}

	return &ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
	}, nil
}


func (p *pluginServiceImpl) fetchSaasPluginsFromCoze(ctx context.Context) ([]*entity.PluginInfo, error) {
	client := saasapi.NewCozeAPIClient()

	resp, err := client.Get(ctx, "/v1/stores/plugins")
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to call coze.cn API")
	}

	var pluginsData struct {
		Plugins []CozePlugin `json:"plugins"`
		Total   int64        `json:"total"`
	}

	if err := json.Unmarshal(resp.Data, &pluginsData); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn API response")
	}

	plugins := make([]*entity.PluginInfo, 0, len(pluginsData.Plugins))
	for _, cozePlugin := range pluginsData.Plugins {
		plugin := convertCozePluginToEntity(cozePlugin)
		plugins = append(plugins, plugin)
	}

	logs.CtxInfof(ctx, "fetched %d SaaS plugins from coze.cn", len(plugins))

	return plugins, nil
}

func convertCozePluginToEntity(cozePlugin CozePlugin) *entity.PluginInfo {
	var pluginID int64
	if id, err := strconv.ParseInt(cozePlugin.ID, 10, 64); err == nil {
		pluginID = id
	} else {
		// 如果ID不是数字，使用简单的hash算法生成ID
		pluginID = int64(simpleHash(cozePlugin.ID))
	}

	// 创建插件清单
	manifest := &model.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        cozePlugin.Name,
		NameForHuman:        cozePlugin.Name,
		DescriptionForModel: cozePlugin.Description,
		DescriptionForHuman: cozePlugin.Description,
		LogoURL:             cozePlugin.IconURL,
		Auth: &model.AuthV2{
			Type: model.AuthzTypeOfNone,
		},
		API: model.APIDesc{
			Type: "openapi",
		},
	}

	pluginInfo := &model.PluginInfo{
		ID:          pluginID,
		PluginType:  pluginCommon.PluginType_PLUGIN,
		SpaceID:     0,
		DeveloperID: 0,
		APPID:       nil,
		IconURI:     &cozePlugin.IconURL,
		ServerURL:   ptr.Of(""),
		CreatedAt:   cozePlugin.CreatedAt,
		UpdatedAt:   cozePlugin.UpdatedAt,
		Manifest:    manifest,
	}

	return entity.NewPluginInfo(pluginInfo)
}

func simpleHash(s string) uint32 {
	var hash uint32 = 5381
	for _, c := range s {
		hash = ((hash << 5) + hash) + uint32(c)
	}
	return hash
}

func (p *pluginServiceImpl) GetSaasPluginInfo(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	client := saasapi.NewCozeAPIClient()

	path := fmt.Sprintf("/v1/plugins/%d", pluginID)
	resp, err := client.Get(ctx, path)
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to call coze.cn API")
	}

	// 解析响应数据
	var cozePlugin CozePlugin
	if err := json.Unmarshal(resp.Data, &cozePlugin); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn API response")
	}

	plugin = convertCozePluginToEntity(cozePlugin)

	logs.CtxInfof(ctx, "fetched SaaS plugin info from coze.cn, pluginID: %d, name: %s", pluginID, plugin.GetName())

	return plugin, nil
}
