package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/plugin_service_mock.go --package mock -source plugin.go
type PluginService interface {
	MGetAgentTools(ctx context.Context, req *service.MGetAgentToolsRequest) (resp *service.MGetAgentToolsResponse, err error)
	ExecuteTool(ctx context.Context, req *service.ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *service.ExecuteToolResponse, err error)
	PublishAgentTools(ctx context.Context, req *service.PublishAgentToolsRequest) (resp *service.PublishAgentToolsResponse, err error)
}
