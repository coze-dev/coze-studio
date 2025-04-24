package plugin

import "context"

type PluginRequest struct {
	PluginID      int64
	ToolID        int64
	PluginVersion string
	Parameters    map[string]any
}

type PluginResponse struct {
	Result map[string]any
}

func GetPluginRunner() PluginRunner {
	return pluginRunnerImpl
}

func SetPluginRunner(p PluginRunner) {
	pluginRunnerImpl = p
}

var pluginRunnerImpl PluginRunner

//go:generate  mockgen -destination pluginmock/plugin_mock.go --package pluginmock -source plugin.go
type PluginRunner interface {
	Invoke(ctx context.Context, request *PluginRequest) (response *PluginResponse, err error)
}
