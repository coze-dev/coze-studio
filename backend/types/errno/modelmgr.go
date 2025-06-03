package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// ModelMgr: 107 000 000 ~ 107 999 999
const (
	ErrModelMgrInvalidParamCode = 107000000
	ErrModelMgrPermissionCode   = 107000001
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
}
