package plugin

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type toolService struct {
	client service.PluginService
}

func NewToolService(client service.PluginService) crossplugin.ToolService {
	return &toolService{client: client}
}

func (t *toolService) GetPluginInvokableTools(ctx context.Context, req *crossplugin.PluginToolsInfoRequest) (map[int64]tool.InvokableTool, error) {
	pluginsInfo, err := t.client.MGetOnlinePlugins(ctx, &service.MGetOnlinePluginsRequest{
		PluginIDs: []int64{req.PluginEntity.PluginID},
	})
	if err != nil {
		return nil, err
	}

	var pInfo *entity.PluginInfo
	for _, p := range pluginsInfo.Plugins {
		if p.ID == req.PluginEntity.PluginID {
			pInfo = p
			break
		}
	}

	if pInfo == nil {
		return nil, fmt.Errorf("plugin id %v not found", req.PluginEntity.PluginID)
	}

	toolsInfo, err := t.client.MGetOnlineTools(ctx, &service.MGetOnlineToolsRequest{
		ToolIDs: req.ToolIDs,
	})
	if err != nil {
		return nil, err
	}

	result := make(map[int64]tool.InvokableTool, len(toolsInfo.Tools))
	for _, tf := range toolsInfo.Tools {
		tl := &pluginInvokeTool{
			pluginEntity: crossplugin.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			},
			client:   t.client,
			toolInfo: tf,
		}
		result[tf.ID] = tl

	}
	return result, nil

}

func (t *toolService) GetPluginToolsInfo(ctx context.Context, req *crossplugin.PluginToolsInfoRequest) (*crossplugin.PluginToolsInfoResponse, error) {
	pluginsInfo, err := t.client.MGetOnlinePlugins(ctx, &service.MGetOnlinePluginsRequest{
		PluginIDs: []int64{req.PluginEntity.PluginID},
	})
	if err != nil {
		return nil, err
	}

	var pInfo *entity.PluginInfo
	for _, p := range pluginsInfo.Plugins {
		if p.ID == req.PluginEntity.PluginID {
			pInfo = p
			break
		}
	}

	if pInfo == nil {
		return nil, fmt.Errorf("plugin id %v not found", req.PluginEntity.PluginID)
	}

	response := &crossplugin.PluginToolsInfoResponse{
		PluginID:     pInfo.ID,
		SpaceID:      pInfo.SpaceID,
		Version:      pInfo.GetVersion(),
		PluginName:   pInfo.GetName(),
		Description:  pInfo.GetDesc(),
		IconURI:      pInfo.GetIconURI(),
		PluginType:   int64(pInfo.PluginType),
		ToolInfoList: make(map[int64]crossplugin.ToolInfo),
	}
	toolsInfo, err := t.client.MGetOnlineTools(ctx, &service.MGetOnlineToolsRequest{
		ToolIDs: req.ToolIDs,
	})
	if err != nil {
		return nil, err
	}
	for _, tf := range toolsInfo.Tools {
		inputs, err := tf.ToReqAPIParameter()
		if err != nil {
			return nil, err
		}
		outputs, err := tf.ToRespAPIParameter()
		if err != nil {
			return nil, err
		}

		inputVars, err := toVariables(inputs)
		if err != nil {
			return nil, err
		}

		outputVars, err := toVariables(outputs)
		if err != nil {
			return nil, err
		}

		response.ToolInfoList[tf.ID] = crossplugin.ToolInfo{
			ToolID:   tf.ID,
			ToolName: tf.GetName(),
			Inputs:   inputVars,
			Outputs:  outputVars,
			DebugExample: &vo.DebugExample{
				ReqExample:  pInfo.GetToolExample(ctx, tf.GetName()).RequestExample,
				RespExample: pInfo.GetToolExample(ctx, tf.GetName()).ResponseExample,
			},
		}

	}
	return response, nil
}

func toVariables(ps []*common.APIParameter) ([]*vo.Variable, error) {
	vs := make([]*vo.Variable, 0, len(ps))
	for _, p := range ps {
		v, err := convertAPIParameterToVariable(p)
		if err != nil {
			return nil, err
		}
		vs = append(vs, v)
	}
	return vs, nil
}

type pluginInvokeTool struct {
	pluginEntity crossplugin.PluginEntity
	client       service.PluginService
	toolInfo     *entity.ToolInfo
}

func (p *pluginInvokeTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	parameterInfo, err := p.toolInfo.Operation.ToEinoSchemaParameterInfo()
	if err != nil {
		return nil, err
	}
	return &schema.ToolInfo{
		Name:        p.toolInfo.GetName(),
		Desc:        p.toolInfo.GetDesc(),
		ParamsOneOf: schema.NewParamsOneOfByParams(parameterInfo),
	}, nil
}

func (p *pluginInvokeTool) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	req := &service.ExecuteToolRequest{
		PluginID:        p.pluginEntity.PluginID,
		ToolID:          p.toolInfo.ID,
		ExecScene:       consts.ExecSceneOfWorkflow,
		ArgumentsInJson: argumentsInJSON,
	}

	execOpts := make([]entity.ExecuteToolOpts, 0)
	if p.pluginEntity.PluginVersion != nil {
		execOpts = append(execOpts, entity.WithVersion(*p.pluginEntity.PluginVersion))
	}
	r, err := p.client.ExecuteTool(ctx, req, execOpts...)
	if err != nil {
		return "", err
	}
	return r.TrimmedResp, nil
}

func convertAPIParameterToVariable(p *common.APIParameter) (*vo.Variable, error) {
	v := &vo.Variable{
		Name:        p.Name,
		Description: p.Desc,
		Required:    p.IsRequired,
	}

	switch p.Type {
	case common.ParameterType_String:
		v.Type = vo.VariableTypeString
	case common.ParameterType_Integer:
		v.Type = vo.VariableTypeInteger
	case common.ParameterType_Number:
		v.Type = vo.VariableTypeFloat
	case common.ParameterType_Array:
		v.Type = vo.VariableTypeList
		av := &vo.Variable{
			Type: vo.VariableTypeString,
		}
		switch *p.SubType {
		case common.ParameterType_String:
			av.Type = vo.VariableTypeString
		case common.ParameterType_Integer:
			av.Type = vo.VariableTypeInteger
		case common.ParameterType_Number:
			av.Type = vo.VariableTypeFloat
		case common.ParameterType_Array:
			av.Type = vo.VariableTypeList
		case common.ParameterType_Object:
			av.Type = vo.VariableTypeObject
		}
		v.Schema = av
	case common.ParameterType_Object:
		v.Type = vo.VariableTypeObject
		vs := make([]*vo.Variable, 0)
		for _, v := range p.SubParameters {
			objV, err := convertAPIParameterToVariable(v)
			if err != nil {
				return nil, err
			}
			vs = append(vs, objV)

		}
		v.Schema = vs
	default:
		return nil, fmt.Errorf("unknown parameter type: %v", p.Type)
	}
	return v, nil
}
