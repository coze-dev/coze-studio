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
	"github.com/coze-dev/coze-studio/backend/pkg/errorx/code"
)

// single agent: 100 000 000 ~ 100 999 999
const (
	ErrAgentInvalidParamCode               = 100000000
	ErrAgentSupportedChatModelProtocol     = 100000001
	ErrAgentResourceNotFound               = 100000002
	ErrAgentPermissionCode                 = 100000003
	ErrAgentIDGenFailCode                  = 100000004
	ErrAgentCreateDraftCode                = 100000005
	ErrAgentGetCode                        = 100000006
	ErrAgentUpdateCode                     = 100000007
	ErrAgentSetDraftBotDisplayInfo         = 100000008
	ErrAgentGetDraftBotDisplayInfoNotFound = 100000009
	ErrAgentPublishSingleAgentCode         = 100000010
	ErrAgentAlreadyBindDatabaseCode        = 100000011
	ErrAgentExecuteErrCode                 = 100000012
)

func init() {
	code.Register(
		ErrAgentPublishSingleAgentCode,
		"publish single agent failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentGetDraftBotDisplayInfoNotFound,
		"get draft bot display info failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentSetDraftBotDisplayInfo,
		"set draft bot display info failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentUpdateCode,
		"update single agent failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentGetCode,
		"get single agent failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentCreateDraftCode,
		"create single agent failed",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrAgentIDGenFailCode,
		"gen id failed : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentResourceNotFound,
		"{type} not found: {id}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentSupportedChatModelProtocol,
		"unsupported chat model protocol : {protocol}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentAlreadyBindDatabaseCode,
		"already bind database : {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrAgentExecuteErrCode,
		"systemt error",
		code.WithAffectStability(true),
	)
}
