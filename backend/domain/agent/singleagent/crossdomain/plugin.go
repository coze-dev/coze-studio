package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/plugin_service_mock.go --package mock -source plugin.go
type PluginService interface {
	MGetAgentTools(ctx context.Context, req *plugin.MGetAgentToolsRequest) (resp *plugin.MGetAgentToolsResponse, err error)
	ExecuteTool(ctx context.Context, req *plugin.ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *plugin.ExecuteToolResponse, err error)
}
