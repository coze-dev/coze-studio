package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type Message interface {
	GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*entity.Message, error)
	Create(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	Edit(ctx context.Context, msg *entity.Message) (*entity.Message, error)
}
