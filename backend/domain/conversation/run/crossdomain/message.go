package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type Message interface {
	GetMessageListByRunID(ctx context.Context, conversationID int64, RunIDs []int64) ([]*entity.Message, error)
	CreateMessage(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	EditMessage(ctx context.Context, msg *entity.Message) (*entity.Message, error)
}
