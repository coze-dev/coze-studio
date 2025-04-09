package agentflow

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type pluginConfig struct {
	PluginConf []*agent_common.PluginInfo

	svr crossdomain.PluginService
}

func newPluginTools(ctx context.Context, conf *pluginConfig) ([]tool.InvokableTool, error) {
	return nil, nil
}

type pluginInvokableTool struct {
	apiInfo *pluginEntity.PluginAPI
	svr     crossdomain.PluginService
}

func (p *pluginInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	if len(p.apiInfo.RespParameters) == 0 {
		return &schema.ToolInfo{
			Name:        p.apiInfo.Name,
			Desc:        p.apiInfo.Description,
			ParamsOneOf: nil,
		}, nil
	}

	paramInfos, err := convertParameterInfo(ctx, p.apiInfo.ReqParameters)
	if err != nil {
		return nil, err
	}

	return &schema.ToolInfo{
		Name:        p.apiInfo.Name,
		Desc:        p.apiInfo.Description,
		ParamsOneOf: schema.NewParamsOneOfByParams(paramInfos),
	}, nil
}

func (p *pluginInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {

	req := &plugin.ExecuteRequest{
		ApiID:     p.apiInfo.ID,
		PluginID:  p.apiInfo.PluginID,
		Arguments: argumentsInJSON,
	}
	resp, err := p.svr.Execute(ctx, req)
	if err != nil {
		return "", err
	}
	return resp.Result, nil
}

func convertParameterInfo(_ context.Context, pi []*pluginEntity.ParameterInfo) (map[string]*schema.ParameterInfo, error) {
	if pi == nil {
		return nil, nil
	}

	result := make(map[string]*schema.ParameterInfo)
	for _, p := range pi {
		if p.NotVisibleToModel {
			continue
		}

		desc := p.Desc
		if p.Default != "" {
			desc += fmt.Sprintf(" default:%s", p.Default)
		}

		paramInfo := &schema.ParameterInfo{
			Type:     schema.DataType(p.Type),
			Desc:     desc,
			Required: p.Required,
		}

		if len(p.Enum) > 0 {
			paramInfo.Enum = p.Enum
		}

		// 处理子参数
		if len(p.SubParams) > 0 {
			subParams, err := convertParameterInfo(nil, p.SubParams)
			if err != nil {
				return nil, err
			}
			paramInfo.SubParams = subParams
		}

		result[p.Name] = paramInfo
	}

	return result, nil
}
