package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/tool_service_mock.go --package mock -source plugin.go
type ToolService interface {
	MGetAgentTools(ctx context.Context, req *plugin.MGetAgentToolsRequest) (resp *plugin.MGetAgentToolsResponse, err error)
	Execute(ctx context.Context, req *plugin.ExecuteRequest, opts ...entity.ExecuteOpts) (resp *plugin.ExecuteResponse, err error)
}
