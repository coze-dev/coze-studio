package agentrun

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
)

type Run interface {
	AgentRun(ctx context.Context, req *entity.AgentRunMeta) (*schema.StreamReader[*entity.AgentRunResponse], error)

	Delete(ctx context.Context, runID []int64) error
}
