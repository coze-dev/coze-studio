package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Memory: 106 000 000 ~ 106 999 999
const (
	ErrMemoryInvalidParamCode            = 106000000
	ErrMemoryPermissionCode              = 106000001
	ErrMemoryIDGenFailCode               = 106000002
	ErrMemorySchemeInvalidCode           = 106000003
	ErrMemoryGetAppVariableCode          = 106000004
	ErrMemoryCreateAppVariableCode       = 106000005
	ErrMemoryUpdateAppVariableCode       = 106000006
	ErrMemoryGetVariableMetaCode         = 106000007
	ErrMemoryVariableMetaNotFoundCode    = 106000008
	ErrMemoryNoVariableCanBeChangedCode  = 106000009
	ErrMemoryDeleteVariableInstanceCode  = 106000010
	ErrMemoryGetSysUUIDInstanceCode      = 106000011
	ErrMemoryGetVariableInstanceCode     = 106000012
	ErrMemorySetKvMemoryItemInstanceCode = 106000013
	ErrMemoryUpdateVariableInstanceCode  = 106000014
	ErrMemoryInsertVariableInstanceCode  = 106000015
)

func init() {
	code.Register(
		ErrMemorySchemeInvalidCode,
		"schema is invalid : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryGetAppVariableCode,
		"get project variable failed ",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryCreateAppVariableCode,
		"get project variable failed ",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryUpdateAppVariableCode,
		"update project variable failed ",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrMemoryGetVariableMetaCode,
		"get variable meta failed ",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryVariableMetaNotFoundCode,
		"variable meta not found ",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryNoVariableCanBeChangedCode,
		"no variable can be changed ",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDeleteVariableInstanceCode,
		"delete variable instance failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryGetSysUUIDInstanceCode,
		"get sys uuid instance failed {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryGetVariableInstanceCode,
		"get sys uuid instance failed {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemorySetKvMemoryItemInstanceCode,
		"no key can be changed",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryUpdateVariableInstanceCode,
		"update variable instance failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryInsertVariableInstanceCode,
		"insert variable instance failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryIDGenFailCode,
		"gen id failed : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
