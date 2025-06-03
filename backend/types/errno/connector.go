package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Connector: 102 000 000 ~ 102 999 999
const (
	ErrConnectorInvalidParamCode = 102000000
	ErrConnectorPermissionCode   = 102000001
	ErrConnectorNotFound         = 102000002
)

func init() {
	code.Register(
		ErrConnectorNotFound,
		"connector not found : {id}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConnectorPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConnectorInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
