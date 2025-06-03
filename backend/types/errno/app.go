package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// App: 101 000 000 ~ 101 999 999
const (
	ErrAppInvalidParamCode = 101000000
	ErrAppPermissionCode   = 101000001
)

func init() {
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
}
