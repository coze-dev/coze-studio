package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type QueryPluginAPIsRequest struct {
	User userEntity.UserIdentity

	ApiIDs []*entity.PluginAPIIdentity
}

type QueryPluginAPIsResponse struct {
	PluginAPIs []*entity.PluginAPI
}

type PluginService interface {
	QueryPluginAPIs(ctx context.Context, req *plugin.QueryPluginAPIsRequest) (resp *plugin.QueryPluginAPIsResponse, err error)
	Execute(ctx context.Context, req *plugin.ExecuteRequest) (resp *plugin.ExecuteResponse, err error)
}
