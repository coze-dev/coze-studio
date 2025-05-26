package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

// single agent: 101 000 0 ~ 101 999 0
const (
	ErrAuthenticationFailed          = 700012006
	errAuthenticationFailedMessage   = "authentication failed: {reason}"
	errAuthenticationFailedStability = false

	ErrEmailAlreadyExistCode        = 700000001
	errorEmailAlreadyExistMessage   = "email already exist : {email}"
	errorEmailAlreadyExistStability = false

	ErrUniqueNameAlreadyExistCode        = 700000002
	errorUniqueNameAlreadyExistMessage   = "unique name already exist : {name}"
	errorUniqueNameAlreadyExistStability = false

	ErrUserInfoInvalidateCode        = 700000003
	errorUserInfoInvalidateMessage   = "Invalid email or password, please try again."
	errorUserInfoInvalidateStability = false

	ErrSessionInvalidateCode        = 700000004
	errorSessionInvalidateMessage   = "session invalidate : {msg}"
	errorSessionInvalidateStability = false
)

func init() {
	code.Register(
		ErrUserInfoInvalidateCode,
		errorUserInfoInvalidateMessage,
		code.WithAffectStability(errorUserInfoInvalidateStability),
	)

	code.Register(
		ErrUniqueNameAlreadyExistCode,
		errorUniqueNameAlreadyExistMessage,
		code.WithAffectStability(errorUniqueNameAlreadyExistStability),
	)

	code.Register(
		ErrEmailAlreadyExistCode,
		errorEmailAlreadyExistMessage,
		code.WithAffectStability(errorEmailAlreadyExistStability),
	)

	code.Register(
		ErrAuthenticationFailed,
		errAuthenticationFailedMessage,
		code.WithAffectStability(errAuthenticationFailedStability),
	)
}
