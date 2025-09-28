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

package dto

// SearchSaasPluginRequest represents the request parameters for searching SaaS plugins
type SearchSaasPluginRequest struct {
	Keyword    *string `json:"keyword,omitempty"`
	PageNum    *int    `json:"page_num,omitempty"`
	PageSize   *int    `json:"page_size,omitempty"`
	SortType   *string `json:"sort_type,omitempty"`
	CategoryID *string `json:"category_id,omitempty"`
	IsOfficial *bool   `json:"is_official,omitempty"`
}

// SearchSaasPluginResponse represents the response from coze.cn search API
type SearchSaasPluginResponse struct {
	Code   int                   `json:"code"`
	Msg    string                `json:"msg"`
	Detail *ResponseDetail       `json:"detail,omitempty"`
	Data   *SearchSaasPluginData `json:"data"`
}

// ResponseDetail represents the detail section of API response
type ResponseDetail struct {
	LogID string `json:"logid"`
}

// SearchSaasPluginData represents the data section of search response
type SearchSaasPluginData struct {
	Items   []*SaasPluginItem `json:"items"`
	HasMore bool              `json:"has_more"`
}

// SaasPluginItem represents a single plugin item in search results
type SaasPluginItem struct {
	MetaInfo   *SaasPluginMetaInfo `json:"metainfo"`
	PluginInfo *SaasPluginInfo     `json:"plugin_info"`
}

// SaasPluginMetaInfo represents the metadata of a SaaS plugin
type SaasPluginMetaInfo struct {
	ProductID     string              `json:"product_id"`
	EntityID      string              `json:"entity_id"`
	EntityVersion string              `json:"entity_version"`
	EntityType    string              `json:"entity_type"`
	Name          string              `json:"name"`
	Description   string              `json:"description"`
	UserInfo      *SaasPluginUserInfo `json:"user_info"`
	Category      *SaasPluginCategory `json:"category"`
	IconURL       string              `json:"icon_url"`
	ProductURL    string              `json:"product_url"`
	ListedAt      int64               `json:"listed_at"`
	PaidType      string              `json:"paid_type"`
	IsOfficial    bool                `json:"is_official"`
}

// SaasPluginUserInfo represents the user information of a SaaS plugin
type SaasPluginUserInfo struct {
	UserID    string `json:"user_id"`
	UserName  string `json:"user_name"`
	NickName  string `json:"nick_name"`
	AvatarURL string `json:"avatar_url"`
}

// SaasPluginCategory represents the category information of a SaaS plugin
type SaasPluginCategory struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// SaasPluginInfo represents the plugin statistics and information
type SaasPluginInfo struct {
	Description            string  `json:"description"`
	TotalToolsCount        int     `json:"total_tools_count"`
	FavoriteCount          int     `json:"favorite_count"`
	Heat                   int     `json:"heat"`
	SuccessRate            float64 `json:"success_rate"`
	AvgExecDurationMs      float64 `json:"avg_exec_duration_ms"`
	BotsUseCount           int64   `json:"bots_use_count"`
	AssociatedBotsUseCount int64   `json:"associated_bots_use_count"`
	CallCount              int64   `json:"call_count"`
}

type ListPluginCategoriesRequest struct {
	PageNum    *int    `json:"page_num,omitempty"`
	PageSize   *int    `json:"page_size,omitempty"`
	EntityType *string `json:"entity_type,omitempty"`
}

type ListPluginCategoriesResponse struct {
	Code int                       `json:"code"`
	Msg  string                    `json:"msg"`
	Data *ListPluginCategoriesData `json:"data"`
}

type ListPluginCategoriesData struct {
	Items   []*PluginCategoryItem `json:"items"`
	HasMore bool                  `json:"has_more"`
}

type PluginCategoryItem struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GetSaasPluginCallInfoRequest struct {
	PluginID int64 `json:"plugin_id"`
}

type GetSaasPluginCallInfoResponse struct {
	Code int                        `json:"code"`
	Msg  string                     `json:"msg"`
	Data *GetSaasPluginCallInfoData `json:"data"`
}

type GetSaasPluginCallInfoData struct {
}
