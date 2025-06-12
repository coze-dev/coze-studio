package plugin

import (
	"context"
	"errors"
	"fmt"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
)

type Config struct {
	PluginID      int64
	ToolID        int64
	PluginVersion string

	IgnoreException bool
	DefaultOutput   map[string]any
	ToolService     plugin.ToolService
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
	if cfg.ToolService == nil {
		return nil, errors.New("tool service is required")
	}
	return &Plugin{config: cfg}, nil
}

func (p *Plugin) Invoke(ctx context.Context, parameters map[string]any) (ret map[string]any, err error) {
	invokeMap, err := p.config.ToolService.GetPluginInvokableTools(ctx, &plugin.PluginToolsInvokableRequest{
		PluginEntity: plugin.PluginEntity{
			PluginID: p.config.PluginID,
			// if the plugin version is equal to '', set the plugin version = nil to be considered online, otherwise it is considered for the version
			PluginVersion: ternary.IFElse(p.config.PluginVersion == "", nil, &p.config.PluginVersion),
		},
		ToolsInvokableInfo: map[int64]*plugin.ToolsInvokableInfo{
			p.config.ToolID: &plugin.ToolsInvokableInfo{
				ToolID: p.config.ToolID,
			},
		},
		IsDraft: p.config.PluginVersion == "0", // if the version is 0, it is considered draft
	})

	var (
		invokeTool tool.InvokableTool
		ok         bool
	)

	if invokeTool, ok = invokeMap[p.config.ToolID]; !ok {
		return nil, fmt.Errorf("tool not found, tool id=%v", p.config.ToolID)
	}

	argumentsInJSON, err := sonic.MarshalString(parameters)
	if err != nil {
		return nil, err
	}

	data, err := invokeTool.InvokableRun(ctx, argumentsInJSON)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	err = sonic.UnmarshalString(data, &result)
	if err != nil {
		return nil, err
	}

	return result, nil

}
