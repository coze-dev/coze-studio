package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

// single agent: 101 000 0 ~ 101 999 0
const (
	ErrSupportedChatModelProtocol          = 1014001
	errSupportedChatModelProtocolMessage   = "unsupported chat model protocol : {protocol}"
	errSupportedChatModelProtocolStability = true
)

func init() {
	code.Register(
		ErrSupportedChatModelProtocol,
		errSupportedChatModelProtocolMessage,
		code.WithAffectStability(errSupportedChatModelProtocolStability),
	)
}
