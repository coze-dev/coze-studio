package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
)

type Conversation interface {
	GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error)
}
