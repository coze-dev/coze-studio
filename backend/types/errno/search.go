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

// Search: 111 000 000 ~ 111 999 999
const (
	ErrSearchInvalidParamCode = 111000000
	ErrSearchPermissionCode   = 111000001
)

func init() {
	code.Register(
		ErrSearchPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrSearchInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
