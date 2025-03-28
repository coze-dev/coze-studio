package plugin

import (
	"context"

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

type ExecuteRequest struct {
	API *entity.PluginAPI

	Arguments string
}

type ExecuteResponse struct {
	Result string
}

type Plugin interface {
	QueryPluginAPIs(ctx context.Context, req *QueryPluginAPIsRequest) (resp *QueryPluginAPIsResponse, err error)
	Execute(ctx context.Context, req *ExecuteRequest) (resp *ExecuteResponse, err error)
}
