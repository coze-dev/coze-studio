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

package model

import (
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	api "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
)

type BindToolInfo struct {
	ToolID   int64
	PluginID int64
	Source   *bot_common.PluginFrom
}
type VersionPlugin struct {
	PluginID int64
	Version  string
}

type MGetPluginLatestVersionResponse struct {
	Versions map[int64]string // pluginID vs version
}

type PluginInfo struct {
	ID           int64
	PluginType   api.PluginType
	SpaceID      int64
	DeveloperID  int64
	APPID        *int64
	RefProductID *int64 // for product plugin
	IconURI      *string
	IconURL      *string
	ServerURL    *string
	Version      *string
	VersionDesc  *string

	CreatedAt int64
	UpdatedAt int64

	Source          *bot_common.PluginFrom
	SaasPluginExtra *SaasPluginExtraInfo
	Extra           map[string]any

	Manifest   *PluginManifest
	OpenapiDoc *Openapi3T
}

type SaasPluginExtraInfo struct {
	IsOfficial  bool
	JumpSaasURL *string
}
type ToolExample struct {
	RequestExample  string
	ResponseExample string
}

type PublishPluginRequest struct {
	PluginID    int64
	Version     string
	VersionDesc string
}

type PublishAPPPluginsRequest struct {
	APPID   int64
	Version string
}

type PublishAPPPluginsResponse struct {
	FailedPlugins   []*PluginInfo
	AllDraftPlugins []*PluginInfo
}

type CheckCanPublishPluginsRequest struct {
	PluginIDs []int64
	Version   string
}

type CheckCanPublishPluginsResponse struct {
	InvalidPlugins []*PluginInfo
}

type ListPluginProductsRequest struct{}

type ListPluginProductsResponse struct {
	Plugins []*PluginInfo
	Total   int64
}
