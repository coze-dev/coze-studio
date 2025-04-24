package plugin

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
)

type Config struct {
	PluginID      int64
	ToolID        int64
	PluginVersion string

	IgnoreException bool
	DefaultOutput   map[string]any
	PluginRunner    plugin.PluginRunner
}

type Plugin struct {
	config *Config
}

func NewPlugin(ctx context.Context, cfg *Config) (*Plugin, error) {
	if cfg == nil {
		return nil, errors.New("config is nil")
	}
	if cfg.PluginID == 0 {
		return nil, errors.New("plugin id is required")
	}
	if cfg.ToolID == 0 {
		return nil, errors.New("tool id is required")
	}
	if cfg.PluginRunner == nil {
		return nil, errors.New("plugin runner is required")
	}
	return &Plugin{config: cfg}, nil
}

func (p *Plugin) Invoke(ctx context.Context, parameters map[string]any) (ret map[string]any, err error) {
	defer func() {
		if p.config.IgnoreException && err != nil {
			ret = p.config.DefaultOutput
			ret["errorBody"] = map[string]interface{}{
				"errorMessage": err.Error(),
				"errorCode":    -1,
			}
			err = nil
		}
	}()
	request := &plugin.PluginRequest{
		PluginID:      p.config.PluginID,
		ToolID:        p.config.ToolID,
		Parameters:    parameters,
		PluginVersion: p.config.PluginVersion,
	}
	response, err := p.config.PluginRunner.Invoke(ctx, request)
	if err != nil {
		return nil, err
	}

	return response.Result, nil

}
