package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

const (
	ErrPermissionCode            = 1000000 // TODO : 错误吗划分
	errPermissionMessage         = "unauthorized access : {msg}"
	errPermissionAffectStability = false

	ErrInvalidParamCode            = 1000001
	errInvalidParamMessage         = "invalid parameter : {msg}"
	errInvalidParamAffectStability = false

	ErrIDGenFailCode            = 1000002
	errIDGenFailMessage         = "gen id failed : {msg}"
	errIDGenFailAffectStability = true

	ErrCreatePromptResourceCode            = 1000003
	errCreatePromptResourceMessage         = "create prompt resource failed"
	errCreatePromptResourceAffectStability = true

	ErrGetPromptResourceCode            = 1000004
	errGetPromptResourceMessage         = "get prompt resource failed"
	errGetPromptResourceAffectStability = true

	ErrUpdatePromptResourceCode            = 1000005
	errUpdatePromptResourceMessage         = "update prompt resource failed"
	errUpdatePromptResourceAffectStability = true

	ErrCheckPermissionCode            = 1000006 // TODO : 错误吗划分
	errCheckPermissionMessage         = "check permission error"
	errCheckPermissionAffectStability = true

	ErrCreateSingleAgentCode            = 1000007
	errCreateSingleAgentMessage         = "create prompt resource failed"
	errCreateSingleAgentAffectStability = true

	ErrGetSingleAgentCode            = 1000008
	errGetSingleAgentMessage         = "get prompt resource failed"
	errGetSingleAgentAffectStability = true

	ErrUpdateSingleAgentCode            = 1000009
	errUpdateSingleAgentMessage         = "update prompt resource failed"
	errUpdateSingleAgentAffectStability = true

	ErrGetProjectVariableCode            = 1000010
	errGetProjectVariableMessage         = "get project variable failed "
	errGetProjectVariableAffectStability = true

	internalErrorCode = 10086
)

func init() { // nolint: byted_s_too_many_lines_in_func
	code.Register(
		ErrUpdateSingleAgentCode,
		errUpdateSingleAgentMessage,
		code.WithAffectStability(errUpdateSingleAgentAffectStability),
	)

	code.Register(
		ErrGetProjectVariableCode,
		errGetProjectVariableMessage,
		code.WithAffectStability(errGetProjectVariableAffectStability),
	)

	code.Register(
		ErrGetSingleAgentCode,
		errGetSingleAgentMessage,
		code.WithAffectStability(errGetSingleAgentAffectStability),
	)

	code.Register(
		ErrCreateSingleAgentCode,
		errCreateSingleAgentMessage,
		code.WithAffectStability(errCreateSingleAgentAffectStability),
	)

	code.Register(
		ErrCheckPermissionCode,
		errCheckPermissionMessage,
		code.WithAffectStability(errCheckPermissionAffectStability),
	)

	code.Register(
		ErrPermissionCode,
		errPermissionMessage,
		code.WithAffectStability(errPermissionAffectStability),
	)

	code.Register(
		ErrInvalidParamCode,
		errInvalidParamMessage,
		code.WithAffectStability(errInvalidParamAffectStability),
	)

	code.Register(
		ErrIDGenFailCode,
		errCreatePromptResourceMessage,
		code.WithAffectStability(errIDGenFailAffectStability),
	)

	code.Register(
		ErrCreatePromptResourceCode,
		errIDGenFailMessage,
		code.WithAffectStability(errCreatePromptResourceAffectStability),
	)

	code.Register(
		ErrGetPromptResourceCode,
		errGetPromptResourceMessage,
		code.WithAffectStability(errGetPromptResourceAffectStability),
	)

	code.Register(
		ErrUpdatePromptResourceCode,
		errUpdatePromptResourceMessage,
		code.WithAffectStability(errUpdatePromptResourceAffectStability),
	)

	code.SetDefaultErrorCode(internalErrorCode)
}
