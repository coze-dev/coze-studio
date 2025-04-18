package plugin

import (
	"context"
	"encoding/json"

	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
)

type Plugin struct {
	client plugin.PluginService
}

func NewPluginRunner() (*Plugin, error) {
	return &Plugin{}, nil
}

func (p *Plugin) Invoke(ctx context.Context, request *crossplugin.PluginRequest) (response *crossplugin.PluginResponse, err error) {

	argsJson, _ := json.Marshal(request.Parameters)

	req := &plugin.ExecuteToolRequest{
		PluginID:        request.PluginID,
		ToolID:          request.ToolID,
		ExecScene:       entity.ExecSceneOfWorkflow,
		ArgumentsInJson: string(argsJson),
	}

	r, err := p.client.ExecuteTool(ctx, req)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	err = json.Unmarshal([]byte(r.Result), &result)
	if err != nil {
		return nil, err
	}
	return &crossplugin.PluginResponse{Result: result}, nil

}
