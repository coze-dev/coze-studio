package message

import (
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/crossdomain"
	message "code.byted.org/flow/opencoze/backend/domain/conversation/message/service"
)

func NewCDMessage(msgDomain message.Message) crossdomain.Message {
	return msgDomain
}
