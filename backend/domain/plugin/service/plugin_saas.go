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
	"strconv"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"

	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	domainDto "github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/saasapi"
)

type CozePlugin struct {
	PluginID        string `json:"plugin_id"`
	Name            string `json:"name"`
	NameForModel    string `json:"name_for_model"`
	Description     string `json:"description"`
	IconURL         string `json:"icon_url"`
	Category        string `json:"category"`
	CreatedAt       int64  `json:"created_at"`
	UpdatedAt       int64  `json:"updated_at"`
	IsCallAvailable bool   `json:"is_call_available"`
}

func (p *pluginServiceImpl) ListSaasPluginProducts(ctx context.Context, req *domainDto.ListSaasPluginProductsRequest) (resp *domainDto.ListPluginProductsResponse, err error) {
	searchReq := &domainDto.SearchSaasPluginRequest{
		PageNum:         ptr.Of(int(*req.PageNum)),
		PageSize:        ptr.Of(int(*req.PageSize)),
		Keyword:         req.Keyword,
		IsOfficial:      req.IsOfficial,
		ProductPaidType: req.ProductPaidType,
	}
	if len(req.CategoryIDs) > 0 {
		searchReq.CategoryIDs = req.CategoryIDs
	}
	plugins, hasMore, err := p.fetchSaasPluginsFromCoze(ctx, searchReq)
	if err != nil {
		return nil, err
	}

	return &domainDto.ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
		HasMore: hasMore,
	}, nil
}
func (p *pluginServiceImpl) BatchGetSaasPluginToolsInfo(ctx context.Context, pluginIDs []int64) (tools map[int64][]*entity.ToolInfo, plugins map[int64]*entity.PluginInfo, err error) {
	return p.toolRepo.BatchGetSaasPluginToolsInfo(ctx, pluginIDs)
}

func (p *pluginServiceImpl) fetchSaasPluginsFromCoze(ctx context.Context, searchReq *domainDto.SearchSaasPluginRequest) ([]*entity.PluginInfo, bool, error) {

	searchResp, err := p.searchSaasPlugin(ctx, searchReq)
	if err != nil {
		return nil, false, err
	}

	if searchResp == nil || searchResp.Data == nil {
		return nil, false, nil
	}

	plugins := make([]*entity.PluginInfo, 0, len(searchResp.Data.Items))
	for _, item := range searchResp.Data.Items {
		plugin := convertSaasPluginItemToEntity(item)
		plugins = append(plugins, plugin)
	}

	return plugins, searchResp.Data.HasMore, nil
}

func convertSaasPluginItemToEntity(item *domainDto.SaasPluginItem) *entity.PluginInfo {
	if item == nil || item.MetaInfo == nil {
		return nil
	}

	metaInfo := item.MetaInfo
	var pluginID int64
	if id, err := strconv.ParseInt(metaInfo.EntityID, 10, 64); err == nil {
		pluginID = id
	}

	// 创建插件清单
	manifest := &model.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        metaInfo.Name,
		NameForHuman:        metaInfo.Name,
		DescriptionForModel: metaInfo.Description,
		DescriptionForHuman: metaInfo.Description,
		LogoURL:             metaInfo.IconURL,
		Auth: &model.AuthV2{
			Type: func() consts.AuthzType {
				if !item.PluginInfo.IsCallAvailable {
					return consts.AuthTypeOfSaasInstalled
				}
				return consts.AuthzTypeOfNone
			}(),
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
		IconURI:     &metaInfo.IconURL,
		ServerURL:   ptr.Of(""),
		CreatedAt:   metaInfo.ListedAt,
		UpdatedAt:   metaInfo.ListedAt,
		Manifest:    manifest,
		Source:      ptr.Of(bot_common.PluginFrom_FromSaas),
		SaasPluginExtra: &model.SaasPluginExtraInfo{
			IsOfficial:  metaInfo.IsOfficial,
			JumpSaasURL: &metaInfo.ProductURL,
		},
		RefProductID: func() *int64 {
			if id, err := strconv.ParseInt(metaInfo.ProductID, 10, 64); err == nil {
				return ptr.Of(id)
			}
			return nil
		}(),
	}

	return entity.NewPluginInfo(pluginInfo)
}

func convertCozePluginToEntity(cozePlugin *dto.SaasPluginToolsList) *entity.PluginInfo {
	var pluginID int64
	if id, err := strconv.ParseInt(cozePlugin.PluginID, 10, 64); err == nil {
		pluginID = id
	}

	manifest := &model.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        cozePlugin.Name,
		NameForHuman:        cozePlugin.Name,
		DescriptionForModel: cozePlugin.Description,
		DescriptionForHuman: cozePlugin.Description,
		LogoURL:             cozePlugin.IconURL,
		Auth: &model.AuthV2{
			Type: func() consts.AuthzType {
				if !cozePlugin.IsCallAvailable {
					return consts.AuthTypeOfSaasInstalled
				}
				return consts.AuthzTypeOfNone
			}(),
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
		IconURL:     &cozePlugin.IconURL,
		ServerURL:   ptr.Of("https://api.coze.cn"),
		CreatedAt:   cozePlugin.CreatedAt,
		UpdatedAt:   cozePlugin.UpdatedAt,
		Manifest:    manifest,
		Source:      ptr.Of(bot_common.PluginFrom_FromSaas),
	}

	return entity.NewPluginInfo(pluginInfo)
}

func (p *pluginServiceImpl) GetSaasPluginInfo(ctx context.Context, pluginIDs []int64) (plugin []*entity.PluginInfo, err error) {
	client := saasapi.NewCozeAPIClient()

	var idStrings []string
	for _, id := range pluginIDs {
		idStrings = append(idStrings, strconv.FormatInt(id, 10))
	}
	idsStr := strings.Join(idStrings, ",")

	queryParams := map[string]interface{}{
		"ids": idsStr,
	}

	resp, err := client.GetWithQuery(ctx, "/v1/plugins/mget", queryParams)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginCallCozeAPIFailed)
	}

	var apiResp dto.SaasPluginToolsListResponse

	if err := json.Unmarshal(resp.Data, &apiResp); err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginParseCozeAPIResponseFailed)
	}

	plugins := make([]*entity.PluginInfo, 0, len(idStrings))
	for _, cozePlugin := range apiResp.Items {
		plugin := convertCozePluginToEntity(&cozePlugin)
		plugins = append(plugins, plugin)
	}

	return plugins, nil
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
	if len(req.CategoryIDs) > 0 {
		var categoryIDStrs []string
		for _, id := range req.CategoryIDs {
			categoryIDStrs = append(categoryIDStrs, strconv.FormatInt(id, 10))
		}
		queryParams["category_ids"] = strings.Join(categoryIDStrs, ",")
	}
	if req.IsOfficial != nil {
		queryParams["is_official"] = req.IsOfficial
	}

	apiResp, err := client.GetWithQuery(ctx, "/v1/stores/plugins", queryParams)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginCallCozeSearchAPIFailed)
	}

	var searchResp domainDto.SearchSaasPluginResponse
	if err := json.Unmarshal(apiResp.Data, &searchResp.Data); err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginParseCozeSearchAPIResponseFailed)
	}

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
		return nil, errorx.WrapByCode(err, errno.ErrPluginCallCozeCategoriesAPIFailed)
	}

	var categoriesResp domainDto.ListPluginCategoriesResponse
	if err := json.Unmarshal(apiResp.Data, &categoriesResp.Data); err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginParseCozeCategoriesAPIResponseFailed)
	}

	categoriesResp.Code = apiResp.Code
	categoriesResp.Msg = apiResp.Msg

	return &categoriesResp, nil
}
