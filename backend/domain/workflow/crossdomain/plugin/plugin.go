package plugin

import "context"

type PluginRequest struct {
	PluginID   int64
	ToolID     int64
	Parameters map[string]any
}

type PluginResponse struct {
	Result map[string]any
}

var PluginRunnerImpl PluginRunner

type PluginRunner interface {
	Invoke(ctx context.Context, request *PluginRequest) (response *PluginResponse, err error)
}
