package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

// single agent: 100 000 000 ~ 100 999 999
const (
	ErrAgentInvalidParamCode               = 100000000
	ErrAgentSupportedChatModelProtocol     = 100000001
	ErrAgentResourceNotFound               = 100000002
	ErrAgentPermissionCode                 = 100000003
	ErrAgentIDGenFailCode                  = 100000004
	ErrAgentCreateDraftCode                = 100000005
	ErrAgentGetCode                        = 100000006
	ErrAgentUpdateCode                     = 100000007
	ErrAgentSetDraftBotDisplayInfo         = 100000008
	ErrAgentGetDraftBotDisplayInfoNotFound = 100000009
	ErrAgentPublishSingleAgentCode         = 100000010
)

func init() {
	code.Register(
		ErrAgentPublishSingleAgentCode,
		"publish single agent failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentGetDraftBotDisplayInfoNotFound,
		"get draft bot display info failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentSetDraftBotDisplayInfo,
		"set draft bot display info failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentUpdateCode,
		"update single agent failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentGetCode,
		"get single agent failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentCreateDraftCode,
		"create single agent failed",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrAgentIDGenFailCode,
		"gen id failed : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentResourceNotFound,
		"{type} not found: {id}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentSupportedChatModelProtocol,
		"unsupported chat model protocol : {protocol}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrAgentInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
