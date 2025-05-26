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

	ErrGetPromptResourceNotFoundCode            = 1000004
	errGetPromptResourceNotFoundMessage         = "prompt resource notfound"
	errGetPromptResourceNotFoundAffectStability = false

	ErrUpdatePromptResourceCode            = 1000005
	errUpdatePromptResourceMessage         = "update prompt resource failed"
	errUpdatePromptResourceAffectStability = true

	ErrDeletePromptResourceCode      = 1000023
	errDeletePromptResourceMessage   = "delete prompt resource failed"
	errDeletePromptResourceStability = true

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

	ErrUpdateVariableSchemaCode            = 1000010
	errUpdateVariableSchemaMessage         = "schema is invalid : {msg}"
	errUpdateVariableSchemaAffectStability = false

	ErrGetProjectVariableCode            = 1000011
	errGetProjectVariableMessage         = "get project variable failed "
	errGetProjectVariableAffectStability = true

	ErrCreateProjectVariableCode            = 1000012
	errCreateProjectVariableMessage         = "get project variable failed "
	errCreateProjectVariableAffectStability = true

	ErrUpdateProjectVariableCode            = 1000013
	errUpdateProjectVariableMessage         = "update project variable failed "
	errUpdateProjectVariableAffectStability = true

	ErrGetVariableMetaCode            = 1000014
	errGetVariableMetaMessage         = "get variable meta failed "
	errGetVariableMetaAffectStability = true

	ErrVariableMetaNotFoundCode       = 1000015
	errVariableMetaNotMessage         = "variable meta not found "
	errVariableMetaNotAffectStability = false

	ErrDeleteVariableCode            = 1000016
	errDeleteVariableMessage         = "no variable can be changed "
	errDeleteVariableAffectStability = false

	ErrDeleteVariableInstanceCode            = 1000017
	errDeleteVariableInstanceMessage         = "delete variable instance failed"
	errDeleteVariableInstanceAffectStability = true

	ErrGetSysUUIDInstanceCode            = 1000018
	errGetSysUUIDInstanceMessage         = "get sys uuid instance failed {msg}"
	errGetSysUUIDInstanceAffectStability = false

	ErrGetVariableInstanceCode              = 1000019
	errorGetVariableInstanceMessage         = "get sys uuid instance failed {msg}"
	errorGetVariableInstanceAffectStability = true

	ErrSetKvMemoryItemInstanceCode      = 1000020
	errorSetKvMemoryItemMessage         = "no key can be changed"
	errorSetKvMemoryItemAffectStability = false

	ErrUpdateVariableInstanceCode              = 1000021
	errorUpdateVariableInstanceMessage         = "update variable instance failed"
	errorUpdateVariableInstanceAffectStability = true

	ErrInsertVariableInstanceCode      = 1000022
	errorInsertVariableMessage         = "insert variable instance failed"
	errorInsertVariableAffectStability = true

	ErrorConversationNotFound                = 1000052
	errorConversationNotFoundMessage         = "conversation not found"
	errorConversationNotFoundAffectStability = false

	ErrorJsonMarshal                = 1005000
	errorJsonMarshalMessage         = "json marshal failed"
	errorJsonMarshalAffectStability = true

	ErrorOperateDB                = 1005001
	errorOperateDBMessage         = "operate db failed"
	errorOperateDBAffectStability = true

	ErrorSetDraftBotDisplayInfo                = 1000024
	errorSetDraftBotDisplayInfoMessage         = "set draft bot display info failed"
	errorSetDraftBotDisplayInfoAffectStability = true

	ErrorGetDraftBotDisplayInfoNotFound        = 1000025
	errorGetDraftBotDisplayInfoFoundMessage    = "get draft bot display info failed"
	errorGetDraftBotDisplayInfoAffectStability = true

	ErrPublishSingleAgentCode              = 1000026
	errorPublishSingleAgentMessage         = "publish single agent failed"
	errorPublishSingleAgentAffectStability = true

	ErrGetConnectorCode        = 1000027
	errorGetConnectorMessage   = "get connector failed"
	errorGetConnectorStability = false

	internalErrorCode = 10086
)

func init() { // nolint: byted_s_too_many_lines_in_func

	code.Register(
		ErrGetPromptResourceNotFoundCode,
		errGetPromptResourceNotFoundMessage,
		code.WithAffectStability(errGetPromptResourceNotFoundAffectStability),
	)

	code.Register(
		ErrGetConnectorCode,
		errorGetConnectorMessage,
		code.WithAffectStability(errorGetConnectorStability),
	)

	code.Register(
		ErrPublishSingleAgentCode,
		errorPublishSingleAgentMessage,
		code.WithAffectStability(errorPublishSingleAgentAffectStability),
	)

	code.Register(
		ErrorGetDraftBotDisplayInfoNotFound,
		errorGetDraftBotDisplayInfoFoundMessage,
		code.WithAffectStability(errorGetDraftBotDisplayInfoAffectStability),
	)

	code.Register(
		ErrorJsonMarshal,
		errorJsonMarshalMessage,
		code.WithAffectStability(errorJsonMarshalAffectStability),
	)
	code.Register(
		ErrorOperateDB,
		errorOperateDBMessage,
		code.WithAffectStability(errorOperateDBAffectStability),
	)

	code.Register(
		ErrorSetDraftBotDisplayInfo,
		errorSetDraftBotDisplayInfoMessage,
		code.WithAffectStability(errorSetDraftBotDisplayInfoAffectStability),
	)

	code.Register(
		ErrInsertVariableInstanceCode,
		errorInsertVariableMessage,
		code.WithAffectStability(errorInsertVariableAffectStability),
	)

	code.Register(
		ErrUpdateVariableInstanceCode,
		errorUpdateVariableInstanceMessage,
		code.WithAffectStability(errorUpdateVariableInstanceAffectStability),
	)

	code.Register(
		ErrSetKvMemoryItemInstanceCode,
		errorSetKvMemoryItemMessage,
		code.WithAffectStability(errorSetKvMemoryItemAffectStability),
	)

	code.Register(
		ErrGetVariableInstanceCode,
		errorGetVariableInstanceMessage,
		code.WithAffectStability(errorGetVariableInstanceAffectStability),
	)

	code.Register(
		ErrGetSysUUIDInstanceCode,
		errGetSysUUIDInstanceMessage,
		code.WithAffectStability(errGetSysUUIDInstanceAffectStability),
	)

	code.Register(
		ErrDeleteVariableInstanceCode,
		errDeleteVariableInstanceMessage,
		code.WithAffectStability(errDeleteVariableInstanceAffectStability),
	)

	code.Register(
		ErrDeleteVariableCode,
		errDeleteVariableMessage,
		code.WithAffectStability(errDeleteVariableAffectStability),
	)

	code.Register(
		ErrVariableMetaNotFoundCode,
		errVariableMetaNotMessage,
		code.WithAffectStability(errVariableMetaNotAffectStability),
	)

	code.Register(
		ErrGetVariableMetaCode,
		errGetVariableMetaMessage,
		code.WithAffectStability(errGetVariableMetaAffectStability),
	)

	code.Register(
		ErrUpdateProjectVariableCode,
		errUpdateProjectVariableMessage,
		code.WithAffectStability(errUpdateProjectVariableAffectStability),
	)

	code.Register(
		ErrCreateProjectVariableCode,
		errCreateProjectVariableMessage,
		code.WithAffectStability(errCreateProjectVariableAffectStability),
	)

	code.Register(
		ErrUpdateVariableSchemaCode,
		errUpdateVariableSchemaMessage,
		code.WithAffectStability(errUpdateVariableSchemaAffectStability),
	)

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
	code.Register(
		ErrorConversationNotFound,
		errorConversationNotFoundMessage,
		code.WithAffectStability(errorConversationNotFoundAffectStability),
	)

	code.Register(
		ErrDeletePromptResourceCode,
		errDeletePromptResourceMessage,
		code.WithAffectStability(errDeletePromptResourceStability),
	)

	code.SetDefaultErrorCode(internalErrorCode)
}
