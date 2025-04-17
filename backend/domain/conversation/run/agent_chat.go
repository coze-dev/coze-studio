package run

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type Chat interface {
	AgentChat(ctx context.Context, req *entity.AgentChatRequest) (*entity.AgentChatResponse, error)
}
