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

// ModelMgr: 107 000 000 ~ 107 999 999
const (
	ErrModelMgrInvalidParamCode = 107000000
	ErrModelMgrPermissionCode   = 107000001
	ErrModelMgrDatabaseCode     = 107000002
	ErrModelMgrNotFoundCode     = 107000003
	ErrModelMgrCacheCode        = 107000004
)

func init() {
	code.Register(
		ErrModelMgrPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrModelMgrInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrModelMgrDatabaseCode,
		"database error : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrModelMgrNotFoundCode,
		"model not found : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrModelMgrCacheCode,
		"cache error : {msg}",
		code.WithAffectStability(false),
	)
}
