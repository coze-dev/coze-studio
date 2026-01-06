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
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
	Mode      consts.AuthzSubType
	OAuthInfo *OAuthInfo
}

type PluginAuthInfo struct {
	AuthzType    *consts.AuthzType
	Location     *consts.HTTPParamLocation
	Key          *string
	ServiceToken *string
	OAuthInfo    *string
	AuthzSubType *consts.AuthzSubType
	AuthzPayload *string
}

type OAuthInfo struct {
	OAuthMode         consts.AuthzSubType
	AuthorizationCode *AuthorizationCodeInfo
}

type OAuthState struct {
	ClientName OAuthProvider `json:"client_name"`
	UserID     string        `json:"user_id"`
	PluginID   int64         `json:"plugin_id"`
	IsDraft    bool          `json:"is_draft"`
}

type AuthorizationCodeMeta struct {
	UserID   string
	PluginID int64
	IsDraft  bool
}

type AuthorizationCodeInfo struct {
	RecordID             int64
	Meta                 *AuthorizationCodeMeta
	Config               *model.OAuthAuthorizationCodeConfig
	AccessToken          string
	RefreshToken         string
	TokenExpiredAtMS     int64
	NextTokenRefreshAtMS *int64
	LastActiveAtMS       int64
}

func (a *AuthorizationCodeInfo) GetNextTokenRefreshAtMS() int64 {
	if a == nil {
		return 0
	}
	return ptr.FromOrDefault(a.NextTokenRefreshAtMS, 0)
}
