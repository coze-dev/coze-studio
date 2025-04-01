package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/anticorruption"
)

func NewPlugin() anticorruption.PluginService {
	return &PluginImp{}
}

type PluginImp struct{}

func (PluginImp) QueryPluginAPIs(ctx context.Context, req *anticorruption.QueryPluginAPIsRequest) (resp *anticorruption.QueryPluginAPIsResponse, err error) {
	// implement me
	panic("implement me")
	return
}
