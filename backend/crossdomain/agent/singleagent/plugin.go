package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
)

func NewPlugin() crossdomain.PluginService {
	return &pluginImpl{}
}

type pluginImpl struct{}

func (pluginImpl) QueryPluginAPIs(ctx context.Context, req *crossdomain.QueryPluginAPIsRequest) (
	resp *crossdomain.QueryPluginAPIsResponse, err error) {
	// implement me
	panic("implement me")
}
