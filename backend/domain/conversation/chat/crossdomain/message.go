package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/chat/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type Message interface {
	GetMessageListByChatID(ctx context.Context, conversationID int64, chatIDs []int64) ([]*msgEntity.Message, error)
	CreateMessage(ctx context.Context, chatReq *entity.ChatCreateMessage) (*msgEntity.Message, error)
	EditMessage(ctx context.Context, chatMsgItem *entity.MessageItem) (*msgEntity.Message, error)
}
