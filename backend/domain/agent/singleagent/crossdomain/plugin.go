package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type ToolService interface {
	MGetAgentTools(ctx context.Context, req *plugin.MGetAgentToolsRequest) (resp *plugin.MGetAgentToolsResponse, err error)
	Execute(ctx context.Context, req *plugin.ExecuteRequest, opts ...entity.ExecuteOpts) (resp *plugin.ExecuteResponse, err error)
}
