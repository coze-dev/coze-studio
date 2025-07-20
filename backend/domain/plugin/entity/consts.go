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
	"strings"
)

const (
	larkPluginOAuthHostName = "open.larkoffice.com"
	larkOAuthHostName       = "open.feishu.cn"
)

func GetOAuthProvider(tokenURL string) OAuthProvider {
	if strings.Contains(tokenURL, larkPluginOAuthHostName) {
		return OAuthProviderOfLarkPlugin
	}
	if strings.Contains(tokenURL, larkOAuthHostName) {
		return OAuthProviderOfLark
	}
	return OAuthProviderOfStandard
}

type SortField string

const (
	SortByCreatedAt SortField = "created_at"
	SortByUpdatedAt SortField = "updated_at"
)

type OAuthProvider string

const (
	OAuthProviderOfLarkPlugin OAuthProvider = "lark_plugin"
	OAuthProviderOfLark       OAuthProvider = "lark"
	OAuthProviderOfStandard   OAuthProvider = "standard"
)
