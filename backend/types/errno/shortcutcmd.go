package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// ShortCmd: 112 000 000 ~ 112 999 999
const (
	ErrShortCmdInvalidParamCode = 112000000
	ErrShortCmdPermissionCode   = 112000002
)

func init() {
	code.Register(
		ErrShortCmdPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrShortCmdInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
