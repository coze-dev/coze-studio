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

package errno

import (
	"fmt"

	"github.com/coze-dev/coze-studio/backend/pkg/errorx/code"
)

// Plugin: 109 000 000 ~ 109 999 999
const (
	ErrPluginInvalidParamCode             = 109000000
	ErrPluginPermissionCode               = 109000001
	ErrPluginInvalidClientCredentialsCode = 109000002
	ErrPluginInvalidOpenapi3Doc           = 109000003
	ErrPluginInvalidManifest              = 109000004
	ErrPluginRecordNotFound               = 109000005
	ErrPluginDeactivatedTool              = 109000006
	ErrPluginDuplicatedTool               = 109000007
	ErrPluginInvalidThirdPartyCode        = 109000008
	ErrPluginExecuteToolFailed            = 109000009
	ErrPluginConvertProtocolFailed        = 109000010
	ErrPluginToolsCheckFailed             = 109000011
	ErrPluginParseToolRespFailed          = 109000012
	ErrPluginOAuthFailed                  = 109000013
	ErrPluginIDExist                      = 109000014
	ErrToolIDExist                        = 109000015
)

const (
	PluginMsgKey = "msg"
)

func init() {

	code.Register(
		ErrPluginIDExist,
		"Plugin ID already exists : {plugin_id}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrToolIDExist,
		"Tool ID already exists : {tool_id}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPluginPermissionCode,
		fmt.Sprintf("unauthorized access : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidParamCode,
		fmt.Sprintf("invalid parameter : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidClientCredentialsCode,
		"invalid client credentials",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidOpenapi3Doc,
		fmt.Sprintf("invalid plugin openapi3 document : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidManifest,
		fmt.Sprintf("invalid plugin manifest : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginRecordNotFound,
		"record not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginDeactivatedTool,
		fmt.Sprintf("tool is deactivated : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginDuplicatedTool,
		fmt.Sprintf("duplicated tool : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginExecuteToolFailed,
		fmt.Sprintf("execute tool failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginConvertProtocolFailed,
		fmt.Sprintf("convert protocol failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginToolsCheckFailed,
		fmt.Sprintf("tools check failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginParseToolRespFailed,
		fmt.Sprintf("parse tool response failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginOAuthFailed,
		fmt.Sprintf("oauth failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)
}
