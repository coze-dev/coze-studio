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

import "github.com/coze-dev/coze-studio/backend/pkg/errorx/code"

// Conversation: 103 000 000 ~ 103 999 999
const (
	ErrConversationInvalidParamCode = 103000000
	ErrConversationPermissionCode   = 103000001
	ErrConversationNotFound         = 103000002
	ErrConversationJsonMarshal      = 103000003

	ErrConversationAgentRunError = 103100001
	ErrAgentNotExists            = 103100002

	ErrReplyUnknowEventType = 103100003
	ErrUnknowInterruptType  = 103100004
	ErrInterruptDataEmpty   = 103100005

	ErrConversationMessageNotFound = 103200001

	ErrAgentRun = 103200002
)

func init() {
	code.Register(
		ErrAgentRun,
		"Interal Server Error",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrConversationJsonMarshal,
		"json marshal failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrConversationNotFound,
		"conversation not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConversationPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConversationInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConversationAgentRunError,
		"agent run error : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentNotExists,
		"agent not exists",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrConversationMessageNotFound,
		"message not found",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrReplyUnknowEventType,
		"unknow event type",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrUnknowInterruptType,
		"unknow interrupt type",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrInterruptDataEmpty,
		"interrupt data is empty",
		code.WithAffectStability(true),
	)

}
