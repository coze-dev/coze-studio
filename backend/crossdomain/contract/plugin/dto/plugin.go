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
	"github.com/getkin/kin-openapi/openapi3"

	api "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
)

type VersionPlugin struct {
	PluginID int64
	Version  string
}

type VersionTool struct {
	ToolID  int64
	Version string
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
	ServerURL    *string
	Version      *string
	VersionDesc  *string

	CreatedAt int64
	UpdatedAt int64

	Manifest   *PluginManifest
	OpenapiDoc *Openapi3T
}

func (p PluginInfo) SetName(name string) {
	if p.Manifest == nil || p.OpenapiDoc == nil {
		return
	}
	p.Manifest.NameForModel = name
	p.Manifest.NameForHuman = name
	p.OpenapiDoc.Info.Title = name
}

func (p PluginInfo) GetName() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.NameForHuman
}

func (p PluginInfo) GetDesc() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.DescriptionForHuman
}

func (p PluginInfo) GetAuthInfo() *AuthV2 {
	if p.Manifest == nil {
		return nil
	}
	return p.Manifest.Auth
}

func (p PluginInfo) IsOfficial() bool {
	return p.RefProductID != nil
}

func (p PluginInfo) GetIconURI() string {
	if p.IconURI == nil {
		return ""
	}
	return *p.IconURI
}

func (p PluginInfo) Published() bool {
	return p.Version != nil
}

type VersionAgentTool struct {
	ToolName *string
	ToolID   int64

	AgentVersion *string
}

type MGetAgentToolsRequest struct {
	AgentID int64
	SpaceID int64
	IsDraft bool

	VersionAgentTools []VersionAgentTool
}

type ExecuteToolRequest struct {
	UserID        string
	PluginID      int64
	ToolID        int64
	ExecDraftTool bool // if true, execute draft tool
	ExecScene     ExecuteScene

	ArgumentsInJson string
}

type ExecuteToolResponse struct {
	Tool        *ToolInfo
	Request     string
	TrimmedResp string
	RawResp     string

	RespSchema openapi3.Responses
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

type ToolInterruptEvent struct {
	Event         InterruptEventType
	ToolNeedOAuth *ToolNeedOAuthInterruptEvent
}

type ToolNeedOAuthInterruptEvent struct {
	Message string
}
