package crossdomain

import (
	"context"
)

type ExecuteRequest struct {
}

type ExecuteResponse struct {
}

type Workflow interface {
	Execute(ctx context.Context, req *ExecuteRequest) (resp *ExecuteResponse, err error)
}
