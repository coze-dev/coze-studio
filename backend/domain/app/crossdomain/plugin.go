package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
)

type PluginService interface {
	DeleteDraftPlugin(ctx context.Context, req *service.DeleteDraftPluginRequest) (err error)
}
