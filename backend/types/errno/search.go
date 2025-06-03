package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

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
