package plugin

import (
	"context"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"
	"golang.org/x/exp/maps"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	workflow3 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/application/base/pluginutil"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type toolService struct {
	client service.PluginService
	tos    storage.Storage
}

func NewToolService(client service.PluginService, tos storage.Storage) crossplugin.ToolService {
	return &toolService{client: client, tos: tos}
}

func (t *toolService) getPluginsWithTools(ctx context.Context, pluginEntity *crossplugin.PluginEntity, toolIDs []int64, isDraft bool) (*entity.PluginInfo, []*entity.ToolInfo, error) {

	var pluginsInfo []*entity.PluginInfo
	pluginID := pluginEntity.PluginID
	isDraft = isDraft || (pluginEntity.PluginVersion != nil && *pluginEntity.PluginVersion == "0") // application plugin version use 0 for draft
	if isDraft {
		plugins, err := t.client.MGetDraftPlugins(ctx, []int64{pluginID})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins
	} else if pluginEntity.PluginVersion == nil {
		plugins, err := t.client.MGetOnlinePlugins(ctx, []int64{pluginID})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins

	} else {
		plugins, err := t.client.MGetVersionPlugins(ctx, []entity.VersionPlugin{
			{PluginID: pluginID, Version: *pluginEntity.PluginVersion},
		})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins

	}

	var pInfo *entity.PluginInfo
	for _, p := range pluginsInfo {
		if p.ID == pluginID {
			pInfo = p
			break
		}
	}
	if pInfo == nil {
		return nil, nil, fmt.Errorf("plugin id %v not found", pluginID)
	}

	var toolsInfo []*entity.ToolInfo
	if isDraft {
		tools, err := t.client.MGetDraftTools(ctx, toolIDs)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	} else {
		tools, err := t.client.MGetOnlineTools(ctx, toolIDs)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	}

	return pInfo, toolsInfo, nil
}

func (t *toolService) GetPluginInvokableTools(ctx context.Context, req *crossplugin.PluginToolsInvokableRequest) (map[int64]tool.InvokableTool, error) {
	var toolsInfo []*entity.ToolInfo

	pInfo, toolsInfo, err := t.getPluginsWithTools(ctx, &crossplugin.PluginEntity{PluginID: req.PluginEntity.PluginID, PluginVersion: req.PluginEntity.PluginVersion}, maps.Keys(req.ToolsInvokableInfo), req.IsDraft)
	if err != nil {
		return nil, err
	}

	result := make(map[int64]tool.InvokableTool, len(toolsInfo))
	for _, tf := range toolsInfo {
		tl := &pluginInvokeTool{
			pluginEntity: crossplugin.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			},
			client:   t.client,
			toolInfo: tf,
		}
		if r, ok := req.ToolsInvokableInfo[tf.ID]; ok {
			reqPluginCommonAPIParameters := slices.Transform(r.RequestAPIParametersConfig, toPluginCommonAPIParameter)
			respPluginCommonAPIParameters := slices.Transform(r.ResponseAPIParametersConfig, toPluginCommonAPIParameter)
			tl.toolOperation, err = pluginutil.APIParamsToOpenapiOperation(reqPluginCommonAPIParameters, respPluginCommonAPIParameters)
			if err != nil {
				return nil, err
			}
		}

		result[tf.ID] = tl

	}
	return result, nil
}

func (t *toolService) GetPluginToolsInfo(ctx context.Context, req *crossplugin.PluginToolsInfoRequest) (*crossplugin.PluginToolsInfoResponse, error) {
	var toolsInfo []*entity.ToolInfo

	pInfo, toolsInfo, err := t.getPluginsWithTools(ctx, &crossplugin.PluginEntity{PluginID: req.PluginEntity.PluginID, PluginVersion: req.PluginEntity.PluginVersion}, req.ToolIDs, req.IsDraft)
	if err != nil {
		return nil, err
	}

	url, err := t.tos.GetObjectUrl(ctx, pInfo.GetIconURI())
	if err != nil {
		return nil, err
	}
	response := &crossplugin.PluginToolsInfoResponse{
		PluginID:     pInfo.ID,
		SpaceID:      pInfo.SpaceID,
		Version:      pInfo.GetVersion(),
		PluginName:   pInfo.GetName(),
		Description:  pInfo.GetDesc(),
		IconURL:      url,
		PluginType:   int64(pInfo.PluginType),
		ToolInfoList: make(map[int64]crossplugin.ToolInfo),
	}

	for _, tf := range toolsInfo {
		inputs, err := tf.ToReqAPIParameter()
		if err != nil {
			return nil, err
		}
		outputs, err := tf.ToRespAPIParameter()
		if err != nil {
			return nil, err
		}
		toolExample := pInfo.GetToolExample(ctx, tf.GetName())

		var (
			requestExample  string
			responseExample string
		)
		if toolExample != nil {
			requestExample = toolExample.RequestExample
			responseExample = toolExample.RequestExample
		}

		response.ToolInfoList[tf.ID] = crossplugin.ToolInfo{
			ToolID:      tf.ID,
			ToolName:    tf.GetName(),
			Inputs:      slices.Transform(inputs, toWorkflowAPIParameter),
			Outputs:     slices.Transform(outputs, toWorkflowAPIParameter),
			Description: tf.GetDesc(),
			DebugExample: &vo.DebugExample{
				ReqExample:  requestExample,
				RespExample: responseExample,
			},
		}

	}
	return response, nil
}

type pluginInvokeTool struct {
	pluginEntity  crossplugin.PluginEntity
	client        service.PluginService
	toolInfo      *entity.ToolInfo
	toolOperation *openapi3.Operation
}

func (p *pluginInvokeTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	var (
		err           error
		parameterInfo map[string]*schema.ParameterInfo
	)

	if p.toolOperation != nil {
		parameterInfo, err = plugin.Openapi3Operation(*p.toolOperation).ToEinoSchemaParameterInfo()
	} else {
		parameterInfo, err = p.toolInfo.Operation.ToEinoSchemaParameterInfo()
	}

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
		ExecScene:       plugin.ExecSceneOfWorkflow,
		ArgumentsInJson: argumentsInJSON,
	}

	execOpts := []entity.ExecuteToolOpt{
		plugin.WithInvalidRespProcessStrategy(plugin.InvalidResponseProcessStrategyOfReturnDefault),
	}
	if p.pluginEntity.PluginVersion != nil {
		execOpts = append(execOpts, plugin.WithToolVersion(*p.pluginEntity.PluginVersion))
	}

	if p.toolOperation != nil {
		execOpts = append(execOpts, plugin.WithOpenapiOperation(ptr.Of(plugin.Openapi3Operation(*p.toolOperation))))
	}
	r, err := p.client.ExecuteTool(ctx, req, execOpts...)
	if err != nil {
		return "", err
	}
	return r.TrimmedResp, nil
}

func toPluginCommonAPIParameter(parameter *workflow3.APIParameter) *common.APIParameter {
	if parameter == nil {
		return nil
	}
	p := &common.APIParameter{
		ID:            parameter.ID,
		Name:          parameter.Name,
		Desc:          parameter.Desc,
		Type:          common.ParameterType(parameter.Type),
		Location:      common.ParameterLocation(parameter.Location),
		IsRequired:    parameter.IsRequired,
		GlobalDefault: parameter.GlobalDefault,
		GlobalDisable: parameter.GlobalDisable,
		LocalDefault:  parameter.LocalDefault,
		LocalDisable:  parameter.LocalDisable,
		VariableRef:   parameter.VariableRef,
	}
	if parameter.SubType != nil {
		p.SubType = ptr.Of(common.ParameterType(*parameter.SubType))
	}

	if parameter.DefaultParamSource != nil {
		p.DefaultParamSource = ptr.Of(common.DefaultParamSource(*parameter.DefaultParamSource))
	}
	if parameter.AssistType != nil {
		p.AssistType = ptr.Of(common.AssistParameterType(*parameter.AssistType))
	}

	if len(parameter.SubParameters) > 0 {
		p.SubParameters = make([]*common.APIParameter, 0, len(parameter.SubParameters))
		for _, subParam := range parameter.SubParameters {
			p.SubParameters = append(p.SubParameters, toPluginCommonAPIParameter(subParam))
		}
	}

	return p
}

func toWorkflowAPIParameter(parameter *common.APIParameter) *workflow3.APIParameter {
	if parameter == nil {
		return nil
	}
	p := &workflow3.APIParameter{
		ID:            parameter.ID,
		Name:          parameter.Name,
		Desc:          parameter.Desc,
		Type:          workflow3.ParameterType(parameter.Type),
		Location:      workflow3.ParameterLocation(parameter.Location),
		IsRequired:    parameter.IsRequired,
		GlobalDefault: parameter.GlobalDefault,
		GlobalDisable: parameter.GlobalDisable,
		LocalDefault:  parameter.LocalDefault,
		LocalDisable:  parameter.LocalDisable,
		VariableRef:   parameter.VariableRef,
	}
	if parameter.SubType != nil {
		p.SubType = ptr.Of(workflow3.ParameterType(*parameter.SubType))
	}

	if parameter.DefaultParamSource != nil {
		p.DefaultParamSource = ptr.Of(workflow3.DefaultParamSource(*parameter.DefaultParamSource))
	}
	if parameter.AssistType != nil {
		p.AssistType = ptr.Of(workflow3.AssistParameterType(*parameter.AssistType))
	}

	if len(parameter.SubParameters) > 0 {
		p.SubParameters = make([]*workflow3.APIParameter, 0, len(parameter.SubParameters))
		for _, subParam := range parameter.SubParameters {
			p.SubParameters = append(p.SubParameters, toWorkflowAPIParameter(subParam))
		}
	}

	return p
}
