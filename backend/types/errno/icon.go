package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Icon: 104 000 000 ~ 104 999 999
const (
	ErrIconInvalidParamCode = 104000000
	ErrIconPermissionCode   = 104000001
	ErrIconInvalidType      = 104000002
)

func init() {
	code.Register(
		ErrIconInvalidType,
		"invalid icon type : {type}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrIconPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrIconInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
