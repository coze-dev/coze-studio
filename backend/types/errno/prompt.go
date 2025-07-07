package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Prompt: 110 000 000 ~ 110 999 999
const (
	ErrPromptInvalidParamCode = 110000000
	ErrPromptPermissionCode   = 110000001
	ErrPromptIDGenFailCode    = 110000002
	ErrPromptCreateCode       = 110000003
	ErrPromptGetCode          = 110000004
	ErrPromptDataNotFoundCode = 110000005
	ErrPromptUpdateCode       = 110000006
	ErrPromptDeleteCode       = 110000007
)

func init() {
	code.Register(
		ErrPromptDeleteCode,
		"delete prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptUpdateCode,
		"update prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptDataNotFoundCode,
		"prompt resource not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPromptGetCode,
		"get prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptCreateCode,
		"create prompt resource failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptIDGenFailCode,
		"gen id failed : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrPromptPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPromptInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
