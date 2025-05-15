package crossdomain

import "context"

type AgentRun interface {
	Delete(ctx context.Context, runID []int64) error
}
