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

import (
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
)

type CreateDraftPluginRequest struct {
	PluginType   common.PluginType
	IconURI      string
	SpaceID      int64
	DeveloperID  int64
	ProjectID    *int64
	Name         string
	Desc         string
	ServerURL    string
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type UpdateDraftPluginWithCodeRequest struct {
	UserID     int64
	PluginID   int64
	OpenapiDoc *model.Openapi3T
	Manifest   *entity.PluginManifest
}

type UpdateDraftPluginRequest struct {
	PluginID     int64
	Name         *string
	Desc         *string
	URL          *string
	Icon         *common.PluginIcon
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type ListDraftPluginsRequest struct {
	SpaceID  int64
	APPID    int64
	PageInfo entity.PageInfo
}

type ListDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type CreateDraftPluginWithCodeRequest struct {
	SpaceID     int64
	DeveloperID int64
	ProjectID   *int64
	Manifest    *entity.PluginManifest
	OpenapiDoc  *model.Openapi3T
}

type CreateDraftPluginWithCodeResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}

type ListPluginProductsRequest struct{}

type ListPluginProductsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type CopyPluginRequest struct {
	UserID    int64
	PluginID  int64
	CopyScene model.CopyScene

	TargetAPPID *int64
}

type CopyPluginResponse struct {
	Plugin *entity.PluginInfo
	Tools  map[int64]*entity.ToolInfo // old tool id -> new tool
}
