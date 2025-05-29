package crossconversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/conversation"
)

type Conversation interface {
	GetCurrentConversation(ctx context.Context, req *conversation.GetCurrent) (*conversation.Conversation, error)
}

var defaultSVC Conversation

func DefaultSVC() Conversation {
	return defaultSVC
}

func SetDefaultSVC(c Conversation) {
	defaultSVC = c
}
