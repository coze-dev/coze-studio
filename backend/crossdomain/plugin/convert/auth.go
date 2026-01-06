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

package convert

import (
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
)

var authTypes = map[common.AuthorizationType]consts.AuthzType{
	common.AuthorizationType_None:     consts.AuthzTypeOfNone,
	common.AuthorizationType_Service:  consts.AuthzTypeOfService,
	common.AuthorizationType_OAuth:    consts.AuthzTypeOfOAuth,
	common.AuthorizationType_Standard: consts.AuthzTypeOfOAuth, // deprecated, the same as OAuth
}

func ToAuthType(typ common.AuthorizationType) (consts.AuthzType, bool) {
	_type, ok := authTypes[typ]
	return _type, ok
}

var thriftAuthTypes = func() map[consts.AuthzType]common.AuthorizationType {
	types := make(map[consts.AuthzType]common.AuthorizationType, len(authTypes))
	for k, v := range authTypes {
		if v == consts.AuthzTypeOfOAuth {
			types[v] = common.AuthorizationType_OAuth
		} else {
			types[v] = k
		}
	}
	return types
}()

func ToThriftAuthType(typ consts.AuthzType) (common.AuthorizationType, bool) {
	_type, ok := thriftAuthTypes[typ]
	return _type, ok
}

var subAuthTypes = map[int32]consts.AuthzSubType{
	int32(common.ServiceAuthSubType_ApiKey):                 consts.AuthzSubTypeOfServiceAPIToken,
	int32(common.ServiceAuthSubType_OAuthAuthorizationCode): consts.AuthzSubTypeOfOAuthAuthorizationCode,
}

func ToAuthSubType(typ int32) (consts.AuthzSubType, bool) {
	_type, ok := subAuthTypes[typ]
	return _type, ok
}

var thriftSubAuthTypes = func() map[consts.AuthzSubType]int32 {
	types := make(map[consts.AuthzSubType]int32, len(subAuthTypes))
	for k, v := range subAuthTypes {
		types[v] = int32(k)
	}
	return types
}()

func ToThriftAuthSubType(typ consts.AuthzSubType) (int32, bool) {
	_type, ok := thriftSubAuthTypes[typ]
	return _type, ok
}

var apiAuthModes = map[common.PluginToolAuthType]consts.ToolAuthMode{
	common.PluginToolAuthType_Required:  consts.ToolAuthModeOfRequired,
	common.PluginToolAuthType_Supported: consts.ToolAuthModeOfSupported,
	common.PluginToolAuthType_Disable:   consts.ToolAuthModeOfDisabled,
}

func ToAPIAuthMode(mode common.PluginToolAuthType) (consts.ToolAuthMode, bool) {
	_mode, ok := apiAuthModes[mode]
	return _mode, ok
}

var thriftAPIAuthModes = func() map[consts.ToolAuthMode]common.PluginToolAuthType {
	modes := make(map[consts.ToolAuthMode]common.PluginToolAuthType, len(apiAuthModes))
	for k, v := range apiAuthModes {
		modes[v] = k
	}
	return modes
}()

func ToThriftAPIAuthMode(mode consts.ToolAuthMode) (common.PluginToolAuthType, bool) {
	_mode, ok := thriftAPIAuthModes[mode]
	return _mode, ok
}
