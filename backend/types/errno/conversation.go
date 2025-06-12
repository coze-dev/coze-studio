package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Conversation: 103 000 000 ~ 103 999 999
const (
	ErrConversationInvalidParamCode = 103000000
	ErrConversationPermissionCode   = 103000001
	ErrConversationNotFound         = 103000002
	ErrConversationJsonMarshal      = 103000003

	ErrConversationAgentRunError = 103100001
	ErrAgentNotExists            = 103100002

	ErrReplyUnknowEventType = 103100003
	ErrUnknowInterruptType  = 103100004
	ErrInterruptDataEmpty   = 103100005

	ErrConversationMessageNotFound = 103200001
)

func init() {
	code.Register(
		ErrConversationJsonMarshal,
		"json marshal failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrConversationNotFound,
		"conversation not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConversationPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConversationInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrConversationAgentRunError,
		"agent run error : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrAgentNotExists,
		"agent not exists",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrConversationMessageNotFound,
		"message not found",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrReplyUnknowEventType,
		"unknow event type",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrUnknowInterruptType,
		"unknow interrupt type",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrInterruptDataEmpty,
		"interrupt data is empty",
		code.WithAffectStability(true),
	)

}
