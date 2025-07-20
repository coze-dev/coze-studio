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

// Passport: 700 000 000 ~ 700 999 999
const (
	ErrUserAuthenticationFailed = 700012006 // Don't change this code. It is used in the frontend.

	ErrUserEmailAlreadyExistCode      = 700000001
	ErrUserUniqueNameAlreadyExistCode = 700000002
	ErrUserInfoInvalidateCode         = 700000003
	ErrUserSessionInvalidateCode      = 700000004
	ErrUserResourceNotFound           = 700000005
	ErrUserInvalidParamCode           = 700000006
	ErrUserPermissionCode             = 700000007
)

func init() {
	code.Register(
		ErrUserPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUserInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrUserResourceNotFound,
		"{type} not found: {id}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUserInfoInvalidateCode,
		"invalid email or password, please try again.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUserUniqueNameAlreadyExistCode,
		"unique name already exist : {name}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUserEmailAlreadyExistCode,
		"email already exist : {email}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUserAuthenticationFailed,
		"authentication failed: {reason}",
		code.WithAffectStability(false),
	)
}
