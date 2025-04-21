package crossdomain

import (
	"context"

	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type Message interface {
	GetMessageListByRunID(ctx context.Context, conversationID int64, RunIDs []int64) ([]*msgEntity.Message, error)
	CreateMessage(ctx context.Context, chatReq *entity.RunCreateMessage) (*msgEntity.Message, error)
	EditMessage(ctx context.Context, chatMsgItem *entity.MessageItem) (*msgEntity.Message, error)
}
