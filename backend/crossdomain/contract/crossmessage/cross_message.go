package crossmessage

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
)

type Message interface {
	GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*message.Message, error)
	Create(ctx context.Context, msg *message.Message) (*message.Message, error)
	Edit(ctx context.Context, msg *message.Message) (*message.Message, error)
}

var defaultSVC Message

type MessageMeta = message.Message

func DefaultSVC() Message {
	return defaultSVC
}

func SetDefaultSVC(c Message) {
	defaultSVC = c
}
