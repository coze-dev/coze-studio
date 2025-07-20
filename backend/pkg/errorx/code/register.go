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

// WithAffectStability 设置稳定性标识, true:会影响系统稳定性, 并体现在接口错误率中, false:不影响稳定性.
func WithAffectStability(affectStability bool) RegisterOptionFn {
	return internal.WithAffectStability(affectStability)
}

// Register 注册用户预定义的错误码信息, PSM服务对应的code_gen子module初始化时调用.
func Register(code int32, msg string, opts ...RegisterOptionFn) {
	internal.Register(code, msg, opts...)
}

// SetDefaultErrorCode 带有PSM信息染色的code替换默认code.
func SetDefaultErrorCode(code int32) {
	internal.SetDefaultErrorCode(code)
}
