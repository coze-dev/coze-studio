package agentflow

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type toolConfig struct {
	ToolConf []*agent_common.PluginInfo

	svr crossdomain.ToolService
}

func newPluginTools(ctx context.Context, conf *toolConfig) ([]tool.InvokableTool, error) {
	return nil, nil
}

type pluginInvokableTool struct {
	toolInfo *pluginEntity.ToolInfo
	svr      crossdomain.ToolService
}

func (p *pluginInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	if len(p.toolInfo.ReqParameters) == 0 {
		return &schema.ToolInfo{
			Name:        p.toolInfo.Name,
			Desc:        p.toolInfo.Desc,
			ParamsOneOf: nil,
		}, nil
	}

	paramInfos, err := convertParameterInfo(ctx, p.toolInfo.ReqParameters)
	if err != nil {
		return nil, err
	}

	return &schema.ToolInfo{
		Name:        p.toolInfo.Name,
		Desc:        p.toolInfo.Desc,
		ParamsOneOf: schema.NewParamsOneOfByParams(paramInfos),
	}, nil
}

func (p *pluginInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	req := &plugin.ExecuteRequest{
		ToolIdentity: &pluginEntity.ToolIdentity{
			ToolID:   p.toolInfo.ID,
			PluginID: p.toolInfo.PluginID,
		},
		ArgumentsInJson: argumentsInJSON,
	}
	resp, err := p.svr.Execute(ctx, req)
	if err != nil {
		return "", err
	}
	return resp.Result, nil
}

var paramTypeToSchemaDataType = map[plugin_common.ParameterType]schema.DataType{
	plugin_common.ParameterType_String:  schema.String,
	plugin_common.ParameterType_Integer: schema.Integer,
	plugin_common.ParameterType_Number:  schema.Number,
	plugin_common.ParameterType_Object:  schema.Object,
	plugin_common.ParameterType_Array:   schema.Array,
	plugin_common.ParameterType_Bool:    schema.Boolean,
}

func convertParameterInfo(_ context.Context, params []*plugin_common.APIParameter) (map[string]*schema.ParameterInfo, error) {
	if len(params) == 0 {
		return nil, nil
	}

	result := make(map[string]*schema.ParameterInfo)
	for _, p := range params {
		if p.GlobalDisable && p.GlobalDefault == nil {
			continue
		}
		if p.LocalDisable && p.LocalDefault == nil {
			continue
		}

		desc := p.Desc
		if p.GetLocalDefault() != "" {
			desc += fmt.Sprintf(" default:%s", p.GetLocalDefault())
		} else if p.GetGlobalDefault() != "" {
			desc += fmt.Sprintf(" default:%s", p.GetGlobalDefault())
		}

		paramInfo := &schema.ParameterInfo{
			Type:     paramTypeToSchemaDataType[p.Type],
			Desc:     desc,
			Required: p.IsRequired,
		}

		// 处理子参数
		if len(p.SubParameters) > 0 {
			subParams, err := convertParameterInfo(nil, p.SubParameters)
			if err != nil {
				return nil, err
			}
			paramInfo.SubParams = subParams
		}

		result[p.Name] = paramInfo
	}

	return result, nil
}
