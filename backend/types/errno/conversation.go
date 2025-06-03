package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Conversation: 103 000 000 ~ 103 999 999
const (
	ErrConversationInvalidParamCode = 103000000
	ErrConversationPermissionCode   = 103000001
	ErrConversationNotFound         = 103000002
	ErrConversationJsonMarshal      = 103000002
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
}
