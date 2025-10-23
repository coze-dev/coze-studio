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

package entity

import (
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type PluginInfo struct {
	*model.PluginInfo
}

func NewPluginInfo(info *model.PluginInfo) *PluginInfo {
	return &PluginInfo{
		PluginInfo: info,
	}
}

func (p PluginInfo) SetName(name string) {
	if p.Manifest == nil || p.OpenapiDoc == nil {
		return
	}
	p.Manifest.NameForModel = name
	p.Manifest.NameForHuman = name
	p.OpenapiDoc.Info.Title = name
}

func (p PluginInfo) GetServerURL() string {
	return ptr.FromOrDefault(p.ServerURL, "")
}

func (p PluginInfo) GetRefProductID() int64 {
	return ptr.FromOrDefault(p.RefProductID, 0)
}

func (p PluginInfo) GetVersionDesc() string {
	return ptr.FromOrDefault(p.VersionDesc, "")
}
