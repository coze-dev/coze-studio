package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Plugin: 109 000 000 ~ 109 999 999
const (
	ErrPluginInvalidParamCode = 109000000
	ErrPluginPermissionCode   = 109000001
)

func init() {
	code.Register(
		ErrPluginPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
