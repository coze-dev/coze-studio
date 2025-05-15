package conversation

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	conversation "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type crossConversationImpl struct {
	idgen              idgen.IDGenerator
	db                 *gorm.DB
	conversationDomain conversation.Conversation
}

func NewCDConversation(convDomain conversation.Conversation) crossdomain.Conversation {
	return &crossConversationImpl{
		conversationDomain: convDomain,
	}
}

func (c *crossConversationImpl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrentRequest) (*entity.Conversation, error) {

	conv, err := c.conversationDomain.GetCurrentConversation(ctx, req)
	if err != nil {
		return nil, err
	}

	return conv, nil
}
