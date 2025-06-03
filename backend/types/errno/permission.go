package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

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
