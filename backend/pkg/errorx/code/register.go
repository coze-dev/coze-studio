package code

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx/internal"
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
