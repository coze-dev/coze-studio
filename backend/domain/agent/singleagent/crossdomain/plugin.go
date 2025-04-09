package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin"
)

type ToolService interface {
	MGet(ctx context.Context, req *plugin.MGetToolsRequest) (resp *plugin.MGetToolsResponse, err error)
	Execute(ctx context.Context, req *plugin.ExecuteRequest) (resp *plugin.ExecuteResponse, err error)
}
