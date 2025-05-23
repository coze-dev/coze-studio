package conversation

import (
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/crossdomain"
	conversation "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
)

func NewCDConversation(convDomain conversation.Conversation) crossdomain.Conversation {
	return convDomain
}
