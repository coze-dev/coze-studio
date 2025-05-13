package plugin

import (
	"context"
	"encoding/json"

	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
)

type Plugin struct {
	client service.PluginService
}

func NewPluginRunner(client service.PluginService) *Plugin {
	return &Plugin{
		client: client,
	}
}

func (p *Plugin) Invoke(ctx context.Context, request *crossplugin.PluginRequest) (response *crossplugin.PluginResponse, err error) {

	argsJson, _ := json.Marshal(request.Parameters)

	req := &service.ExecuteToolRequest{
		PluginID:        request.PluginID,
		ToolID:          request.ToolID,
		ExecScene:       consts.ExecSceneOfWorkflow,
		ArgumentsInJson: string(argsJson),
	}

	opts := make([]entity.ExecuteToolOpts, 0)
	if request.PluginVersion != "" {
		opts = append(opts, entity.WithVersion(request.PluginVersion))
	}
	r, err := p.client.ExecuteTool(ctx, req, opts...)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	err = json.Unmarshal([]byte(r.TrimmedResp), &result)
	if err != nil {
		return nil, err
	}
	return &crossplugin.PluginResponse{Result: result}, nil

}
