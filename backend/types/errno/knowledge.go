package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Knowledge: 105 000 000 ~ 105 999 999
const (
	ErrKnowledgeInvalidParamCode = 105000000
	ErrKnowledgePermissionCode   = 105000001
	ErrKnowledgeNonRetryableCode = 105000002
)

func init() {
	code.Register(
		ErrKnowledgeNonRetryableCode,
		"non-retryable error",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgePermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
}
