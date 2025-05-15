package conversation

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type crossConversationImpl struct {
	idgen              idgen.IDGenerator
	db                 *gorm.DB
	conversationDomain conversation.Conversation
}

func NewCDConversation(idgen idgen.IDGenerator, db *gorm.DB) crossdomain.Conversation {
	return &crossConversationImpl{
		conversationDomain: conversation.NewService(&conversation.Components{
			DB:    db,
			IDGen: idgen,
		}),
	}
}

func (c *crossConversationImpl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrentRequest) (*entity.Conversation, error) {

	conv, err := c.conversationDomain.GetCurrentConversation(ctx, req)
	if err != nil {
		return nil, err
	}

	return conv, nil
}
