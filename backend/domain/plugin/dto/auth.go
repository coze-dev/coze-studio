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

type GetOAuthStatusResponse struct {
	IsOauth  bool
	Status   common.OAuthStatus
	OAuthURL string
}

type AgentPluginOAuthStatus struct {
	PluginID      int64
	PluginName    string
	PluginIconURL string
	Status        common.OAuthStatus
}

type GetAccessTokenRequest struct {
	UserID    string
	PluginID  *int64
	Mode      model.AuthzSubType
	OAuthInfo *entity.OAuthInfo
}
