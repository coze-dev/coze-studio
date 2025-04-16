package agentflow

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type toolConfig struct {
	spaceID int64
	agentID int64
	isDraft bool

	toolConf []*agent_common.PluginInfo

	svr crossdomain.ToolService
}

func newPluginTools(ctx context.Context, conf *toolConfig) ([]tool.InvokableTool, error) {

	req := &plugin.MGetAgentToolsRequest{
		AgentID: conf.agentID,
		IsDraft: conf.isDraft,
		ToolIDs: slices.Transform(conf.toolConf, func(a *agent_common.PluginInfo) int64 {
			return a.GetApiId()
		}),
	}
	resp, err := conf.svr.MGetAgentTools(ctx, req)
	if err != nil {
		return nil, err
	}

	tools := make([]tool.InvokableTool, 0, len(resp.Tools))
	for _, ti := range resp.Tools {
		tools = append(tools, &pluginInvokableTool{
			toolInfo: ti,
			svr:      conf.svr,
		})
	}

	return tools, nil
}

type pluginInvokableTool struct {
	isDraft  bool
	agentID  int64
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

func (p *pluginInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, _ ...tool.Option) (string, error) {
	req := &plugin.ExecuteRequest{
		ExecScene: func() pluginEntity.ExecuteScene {
			if p.isDraft {
				return pluginEntity.ExecSceneOfAgentDraft
			}
			return pluginEntity.ExecSceneOfAgentOnline
		}(),
		PluginID:        p.toolInfo.PluginID,
		ToolID:          p.toolInfo.ID,
		ArgumentsInJson: argumentsInJSON,
	}
	resp, err := p.svr.Execute(ctx, req, pluginEntity.WithAgentID(p.agentID))
	if err != nil {
		return "", err
	}
	return resp.Result, nil
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
			Type: func() schema.DataType {
				switch p.Type {
				case plugin_common.ParameterType_String:
					return schema.String
				case plugin_common.ParameterType_Integer:
					return schema.Integer
				case plugin_common.ParameterType_Object:
					return schema.Object
				case plugin_common.ParameterType_Array:
					return schema.Array
				case plugin_common.ParameterType_Bool:
					return schema.Boolean
				case plugin_common.ParameterType_Number:
					return schema.Number
				default:
					return schema.Null
				}
			}(),
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
