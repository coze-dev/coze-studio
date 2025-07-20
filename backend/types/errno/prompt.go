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

// Prompt: 110 000 000 ~ 110 999 999
const (
	ErrPromptInvalidParamCode = 110000000
	ErrPromptPermissionCode   = 110000001
	ErrPromptIDGenFailCode    = 110000002
	ErrPromptCreateCode       = 110000003
	ErrPromptGetCode          = 110000004
	ErrPromptDataNotFoundCode = 110000005
	ErrPromptUpdateCode       = 110000006
	ErrPromptDeleteCode       = 110000007
)

func init() {
	code.Register(
		ErrPromptDeleteCode,
		"delete prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptUpdateCode,
		"update prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptDataNotFoundCode,
		"prompt resource not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPromptGetCode,
		"get prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptCreateCode,
		"create prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptIDGenFailCode,
		"gen id failed : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPromptInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
