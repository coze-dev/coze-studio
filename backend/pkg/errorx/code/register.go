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

package code

import (
	"github.com/coze-dev/coze-studio/backend/pkg/errorx/internal"
)

type RegisterOptionFn = internal.RegisterOption

// WithAffectStability sets the stability flag, true: it will affect the system stability and is reflected in the interface error rate, false: it will not affect the stability.
func WithAffectStability(affectStability bool) RegisterOptionFn {
	return internal.WithAffectStability(affectStability)
}

// Register the predefined error code information of the registered user, and call the code_gen sub-module corresponding to the PSM service when initializing.
func Register(code int32, msg string, opts ...RegisterOptionFn) {
	internal.Register(code, msg, opts...)
}

// SetDefaultErrorCode Code with PSM information staining Replace the default code.
func SetDefaultErrorCode(code int32) {
	internal.SetDefaultErrorCode(code)
}
