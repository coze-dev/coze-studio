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

// Permission: 108 000 000 ~ 108 999 999
const (
	ErrPermissionInvalidParamCode = 108000000
)

func init() {
	code.Register(
		ErrPermissionInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
