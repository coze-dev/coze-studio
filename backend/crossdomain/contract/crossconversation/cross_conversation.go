package crossconversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
)

// TODO(@fanlv): 参数引用需要修改。
type Conversation interface {
	GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error)
}

var defaultSVC Conversation

func DefaultSVC() Conversation {
	return defaultSVC
}

func SetDefaultSVC(c Conversation) {
	defaultSVC = c
}
