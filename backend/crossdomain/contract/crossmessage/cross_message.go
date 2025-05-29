package crossmessage

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

// TODO(@fanlv): 参数引用需要修改。
type Message interface {
	GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*entity.Message, error)
	Create(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	Edit(ctx context.Context, msg *entity.Message) (*entity.Message, error)
}

var defaultSVC Message

func DefaultSVC() Message {
	return defaultSVC
}

func SetDefaultSVC(c Message) {
	defaultSVC = c
}
