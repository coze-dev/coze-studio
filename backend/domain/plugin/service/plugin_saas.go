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
	"os"
	"strconv"

	"github.com/bytedance/sonic"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// CozePluginResponse 定义coze.cn API返回的插件数据结构
type CozePluginResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data struct {
		Plugins []CozePlugin `json:"plugins"`
		Total   int64        `json:"total"`
	} `json:"data"`
}

type CozeSinglePluginResponse struct {
	Code int        `json:"code"`
	Msg  string     `json:"msg"`
	Data CozePlugin `json:"data"`
}

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

	baseURL := getCozeAPIBaseURL()
	token := getCozeAPIToken()

	if baseURL == "" {
		return nil, errorx.New(errno.ErrPluginAPIErr, errorx.KV(errno.PluginMsgKey, "COZE_API_BASE_URL not configured"))
	}

	url := baseURL + "/v1/stores/plugins"

	req := p.httpCli.R().
		SetContext(ctx).
		SetHeader("Content-Type", "application/json").
		SetHeader("User-Agent", "Coze-Studio/1.0")

	// 如果有token，添加认证头
	if token != "" {
		req.SetHeader("Authorization", "Bearer "+token)
	}

	resp, err := req.Get(url)
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to call coze.cn API")
	}

	if resp.StatusCode() != 200 {
		return nil, errorx.New(errno.ErrPluginAPIErr,
			errorx.KVf(errno.PluginMsgKey, "coze.cn API returned status %d: %s", resp.StatusCode(), resp.String()))
	}

	var cozeResp CozePluginResponse
	if err := sonic.Unmarshal(resp.Body(), &cozeResp); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn API response")
	}

	// 检查业务状态码
	if cozeResp.Code != 0 {
		return nil, errorx.New(errno.ErrPluginAPIErr,
			errorx.KVf(errno.PluginMsgKey, "coze.cn API returned error: %s", cozeResp.Msg))
	}

	// 转换为内部数据结构
	plugins := make([]*entity.PluginInfo, 0, len(cozeResp.Data.Plugins))
	for _, cozePlugin := range cozeResp.Data.Plugins {
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
		ServerURL:   ptr.Of("https://www.coze.cn"), 
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

func getCozeAPIBaseURL() string {
	if url := os.Getenv("COZE_API_BASE_URL"); url != "" {
		return url
	}
	return "https://www.coze.cn/api"
}

func getCozeAPIToken() string {
	return os.Getenv("COZE_API_TOKEN")
}

func (p *pluginServiceImpl) GetSaasPluginInfo(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	baseURL := getCozeAPIBaseURL()
	token := getCozeAPIToken()

	if baseURL == "" {
		return nil, errorx.New(errno.ErrPluginAPIErr, errorx.KV(errno.PluginMsgKey, "COZE_API_BASE_URL not configured"))
	}

	url := fmt.Sprintf("%s/v1/plugins/%d", baseURL, pluginID)

	req := p.httpCli.R().
		SetContext(ctx).
		SetHeader("Content-Type", "application/json").
		SetHeader("User-Agent", "Coze-Studio/1.0")

	if token != "" {
		req.SetHeader("Authorization", "Bearer "+token)
	}

	resp, err := req.Get(url)
	if err != nil {
		return nil, errorx.Wrapf(err, "failed to call coze.cn API")
	}

	if resp.StatusCode() != 200 {
		return nil, errorx.New(errno.ErrPluginAPIErr,
			errorx.KVf(errno.PluginMsgKey, "coze.cn API returned status %d: %s", resp.StatusCode(), resp.String()))
	}

	var cozeResp CozeSinglePluginResponse
	if err := sonic.Unmarshal(resp.Body(), &cozeResp); err != nil {
		return nil, errorx.Wrapf(err, "failed to parse coze.cn API response")
	}

	if cozeResp.Code != 0 {
		return nil, errorx.New(errno.ErrPluginAPIErr,
			errorx.KVf(errno.PluginMsgKey, "coze.cn API returned error: %s", cozeResp.Msg))
	}

	plugin = convertCozePluginToEntity(cozeResp.Data)

	logs.CtxInfof(ctx, "fetched SaaS plugin info from coze.cn, pluginID: %d, name: %s", pluginID, plugin.GetName())

	return plugin, nil
}