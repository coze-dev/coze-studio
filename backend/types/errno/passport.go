package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

// single agent: 101 000 0 ~ 101 999 0
const (
	ErrAuthenticationFailed          = 700012006
	errAuthenticationFailedMessage   = "authentication failed: {reason}"
	errAuthenticationFailedStability = false
)

func init() {
	code.Register(
		ErrAuthenticationFailed,
		errAuthenticationFailedMessage,
		code.WithAffectStability(errAuthenticationFailedStability),
	)
}
