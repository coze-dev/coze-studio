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

	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin/dto"
	domainDto "github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
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

func (p *pluginServiceImpl) ListSaasPluginProducts(ctx context.Context, req *domainDto.ListPluginProductsRequest) (resp *domainDto.ListPluginProductsResponse, err error) {

	plugins, err := p.fetchSaasPluginsFromCoze(ctx)
	if err != nil {
		return nil, errorx.Wrapf(err, "fetchSaasPluginsFromCoze failed")
	}

	return &domainDto.ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
	}, nil
}

func (p *pluginServiceImpl) fetchSaasPluginsFromCoze(ctx context.Context) ([]*entity.PluginInfo, error) {
	searchReq := &domainDto.SearchSaasPluginRequest{}
	searchResp, err := p.searchSaasPlugin(ctx, searchReq)
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to search SaaS plugins")
	}

	plugins := make([]*entity.PluginInfo, 0, len(searchResp.Data.Items))
	for _, item := range searchResp.Data.Items {
		plugin := convertSaasPluginItemToEntity(item)
		plugins = append(plugins, plugin)
	}

	logs.CtxInfof(ctx, "fetched %d SaaS plugins from coze.cn", len(plugins))

	return plugins, nil
}

func convertSaasPluginItemToEntity(item *domainDto.SaasPluginItem) *entity.PluginInfo {
	if item == nil || item.MetaInfo == nil {
		return nil
	}

	metaInfo := item.MetaInfo
	var pluginID int64
	if id, err := strconv.ParseInt(metaInfo.ProductID, 10, 64); err == nil {
		pluginID = id
	} else {
		// 如果ID不是数字，使用简单的hash算法生成ID
		pluginID = int64(simpleHash(metaInfo.ProductID))
	}

	// 创建插件清单
	manifest := &dto.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        metaInfo.Name,
		NameForHuman:        metaInfo.Name,
		DescriptionForModel: metaInfo.Description,
		DescriptionForHuman: metaInfo.Description,
		LogoURL:             metaInfo.IconURL,
		Auth: &dto.AuthV2{
			Type: dto.AuthzTypeOfNone,
		},
		API: dto.APIDesc{
			Type: "openapi",
		},
	}

	pluginInfo := &dto.PluginInfo{
		ID:          pluginID,
		PluginType:  pluginCommon.PluginType_PLUGIN,
		SpaceID:     0,
		DeveloperID: 0,
		APPID:       nil,
		IconURI:     &metaInfo.IconURL,
		ServerURL:   ptr.Of(""),
		CreatedAt:   metaInfo.ListedAt,
		UpdatedAt:   metaInfo.ListedAt,
		Manifest:    manifest,
	}

	return entity.NewPluginInfo(pluginInfo)
}

func convertCozePluginToEntity(cozePlugin CozePlugin) *entity.PluginInfo {
	var pluginID int64
	if id, err := strconv.ParseInt(cozePlugin.ID, 10, 64); err == nil {
		pluginID = id
	} else {
		pluginID = int64(simpleHash(cozePlugin.ID))
	}

	manifest := &dto.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        cozePlugin.Name,
		NameForHuman:        cozePlugin.Name,
		DescriptionForModel: cozePlugin.Description,
		DescriptionForHuman: cozePlugin.Description,
		LogoURL:             cozePlugin.IconURL,
		Auth: &dto.AuthV2{
			Type: dto.AuthzTypeOfNone,
		},
		API: dto.APIDesc{
			Type: "openapi",
		},
	}

	pluginInfo := &dto.PluginInfo{
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

	var cozePlugin CozePlugin
	if err := json.Unmarshal(resp.Data, &cozePlugin); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn API response")
	}

	plugin = convertCozePluginToEntity(cozePlugin)

	logs.CtxInfof(ctx, "fetched SaaS plugin info from coze.cn, pluginID: %d, name: %s", pluginID, plugin.GetName())

	return plugin, nil
}

func (p *pluginServiceImpl) searchSaasPlugin(ctx context.Context, req *domainDto.SearchSaasPluginRequest) (resp *domainDto.SearchSaasPluginResponse, err error) {
	client := saasapi.NewCozeAPIClient()

	// 构建查询参数
	queryParams := make(map[string]any)
	if req.Keyword != nil {
		queryParams["keyword"] = req.Keyword
	}
	if req.PageNum != nil {
		queryParams["page_num"] = req.PageNum
	}
	if req.PageSize != nil {
		queryParams["page_size"] = req.PageSize
	}
	if req.SortType != nil {
		queryParams["sort_type"] = req.SortType
	}
	if req.CategoryID != nil {
		queryParams["category_id"] = req.CategoryID
	}
	if req.IsOfficial != nil {
		queryParams["is_official"] = req.IsOfficial
	}

	apiResp, err := client.GetWithQuery(ctx, "/v1/stores/plugins", queryParams)
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to call coze.cn search API")
	}

	var searchResp domainDto.SearchSaasPluginResponse
	if err := json.Unmarshal(apiResp.Data, &searchResp.Data); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn search API response")
	}

	searchResp.Code = apiResp.Code
	searchResp.Msg = apiResp.Msg

	logs.CtxInfof(ctx, "searched SaaS plugins from coze.cn, found %d items", len(searchResp.Data.Items))

	return &searchResp, nil
}

func (p *pluginServiceImpl) ListSaasPluginCategories(ctx context.Context, req *domainDto.ListPluginCategoriesRequest) (resp *domainDto.ListPluginCategoriesResponse, err error) {
	client := saasapi.NewCozeAPIClient()

	queryParams := make(map[string]any)
	if req.PageNum != nil {
		queryParams["page_num"] = req.PageNum
	}
	if req.PageSize != nil {
		queryParams["page_size"] = req.PageSize
	}
	if req.EntityType != nil {
		queryParams["entity_type"] = req.EntityType
	}

	apiResp, err := client.GetWithQuery(ctx, "/v1/stores/categories", queryParams)
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to call coze.cn categories API")
	}

	var categoriesResp domainDto.ListPluginCategoriesResponse
	if err := json.Unmarshal(apiResp.Data, &categoriesResp.Data); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn categories API response")
	}

	categoriesResp.Code = apiResp.Code
	categoriesResp.Msg = apiResp.Msg

	itemCount := 0
	if categoriesResp.Data != nil && categoriesResp.Data.Items != nil {
		itemCount = len(categoriesResp.Data.Items)
	}
	logs.CtxInfof(ctx, "fetched SaaS plugin categories from coze.cn, found %d items", itemCount)

	return &categoriesResp, nil
}
