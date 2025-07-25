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

// App: 101 000 000 ~ 101 999 999
const (
	ErrAppInvalidParamCode = 101000000
	ErrAppPermissionCode   = 101000001
	ErrAppRecordNotFound   = 101000002
	ErrAppNoModelInUseCode = 101000003
)

const APPMsgKey = "msg"

func init() {
	code.Register(
		ErrAppNoModelInUseCode,
		"there is no llm model in use, please config a model first",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAppPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAppInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAppRecordNotFound,
		"record not found",
		code.WithAffectStability(false),
	)
}
