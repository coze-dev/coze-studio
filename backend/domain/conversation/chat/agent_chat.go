package chat

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/chat/entity"
)

type Chat interface {
	AgentChat(ctx context.Context, req *entity.AgentChatRequest) (*entity.AgentChatResponse, error)
}
