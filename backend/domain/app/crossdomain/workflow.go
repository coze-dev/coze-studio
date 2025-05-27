package crossdomain

import (
	"context"
)

type WorkflowService interface {
	DeleteWorkflow(ctx context.Context, id int64) error
}
