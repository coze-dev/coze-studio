package run

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type Run interface {
	AgentRun(ctx context.Context, req *entity.AgentRunRequest) (*schema.StreamReader[*entity.AgentRunResponse], error)
}
