/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package plugin

import (
	"context"
	"fmt"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"
	"golang.org/x/exp/maps"

	"github.com/cloudwego/eino/compose"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/application/base/pluginutil"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	crossplugin "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin"
	entity2 "github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type pluginService struct {
	client service.PluginService
	tos    storage.Storage
}

func NewPluginService(client service.PluginService, tos storage.Storage) crossplugin.Service {
	return &pluginService{client: client, tos: tos}
}

type pluginInfo struct {
	*entity.PluginInfo
	LatestVersion *string
}

func (t *pluginService) getPluginsWithTools(ctx context.Context, pluginEntity *crossplugin.Entity, toolIDs []int64, isDraft bool) (
	_ *pluginInfo, toolsInfo []*entity.ToolInfo, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var pluginsInfo []*entity.PluginInfo
	var latestPluginInfo *entity.PluginInfo
	pluginID := pluginEntity.PluginID
	if isDraft {
		plugins, err := t.client.MGetDraftPlugins(ctx, []int64{pluginID})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins
	} else if pluginEntity.PluginVersion == nil || (pluginEntity.PluginVersion != nil && *pluginEntity.PluginVersion == "") {
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

		onlinePlugins, err := t.client.MGetOnlinePlugins(ctx, []int64{pluginID})
		if err != nil {
			return nil, nil, err
		}
		for _, pi := range onlinePlugins {
			if pi.ID == pluginID {
				latestPluginInfo = pi
				break
			}
		}
	}

	var pInfo *entity.PluginInfo
	for _, p := range pluginsInfo {
		if p.ID == pluginID {
			pInfo = p
			break
		}
	}
	if pInfo == nil {
		return nil, nil, vo.NewError(errno.ErrPluginIDNotFound, errorx.KV("id", strconv.FormatInt(pluginID, 10)))
	}

	if isDraft {
		tools, err := t.client.MGetDraftTools(ctx, toolIDs)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	} else if pluginEntity.PluginVersion == nil || (pluginEntity.PluginVersion != nil && *pluginEntity.PluginVersion == "") {
		tools, err := t.client.MGetOnlineTools(ctx, toolIDs)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	} else {
		eVersionTools := slices.Transform(toolIDs, func(tid int64) entity.VersionTool {
			return entity.VersionTool{
				ToolID:  tid,
				Version: *pluginEntity.PluginVersion,
			}
		})
		tools, err := t.client.MGetVersionTools(ctx, eVersionTools)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	}

	if latestPluginInfo != nil {
		return &pluginInfo{PluginInfo: pInfo, LatestVersion: latestPluginInfo.Version}, toolsInfo, nil
	}

	return &pluginInfo{PluginInfo: pInfo}, toolsInfo, nil
}

func (t *pluginService) GetPluginToolsInfo(ctx context.Context, req *crossplugin.ToolsInfoRequest) (
	_ *crossplugin.ToolsInfoResponse, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var toolsInfo []*entity.ToolInfo
	isDraft := req.IsDraft || (req.PluginEntity.PluginVersion != nil && *req.PluginEntity.PluginVersion == "0")
	pInfo, toolsInfo, err := t.getPluginsWithTools(ctx, &crossplugin.Entity{PluginID: req.PluginEntity.PluginID, PluginVersion: req.PluginEntity.PluginVersion}, req.ToolIDs, isDraft)
	if err != nil {
		return nil, err
	}

	url, err := t.tos.GetObjectUrl(ctx, pInfo.GetIconURI())
	if err != nil {
		return nil, vo.WrapIfNeeded(errno.ErrTOSError, err)
	}

	response := &crossplugin.ToolsInfoResponse{
		PluginID:      pInfo.ID,
		SpaceID:       pInfo.SpaceID,
		Version:       pInfo.GetVersion(),
		PluginName:    pInfo.GetName(),
		Description:   pInfo.GetDesc(),
		IconURL:       url,
		PluginType:    int64(pInfo.PluginType),
		ToolInfoList:  make(map[int64]crossplugin.ToolInfo),
		LatestVersion: pInfo.LatestVersion,
		IsOfficial:    pInfo.IsOfficial(),
		AppID:         pInfo.GetAPPID(),
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
			responseExample = toolExample.ResponseExample
		}

		response.ToolInfoList[tf.ID] = crossplugin.ToolInfo{
			ToolID:      tf.ID,
			ToolName:    tf.GetName(),
			Inputs:      slices.Transform(inputs, toWorkflowAPIParameter),
			Outputs:     slices.Transform(outputs, toWorkflowAPIParameter),
			Description: tf.GetDesc(),
			DebugExample: &crossplugin.DebugExample{
				ReqExample:  requestExample,
				RespExample: responseExample,
			},
		}

	}
	return response, nil
}

func (t *pluginService) UnwrapArrayItemFieldsInVariable(v *vo.Variable) error {
	if v == nil {
		return nil
	}

	if v.Type == vo.VariableTypeObject {
		subVars, ok := v.Schema.([]*vo.Variable)
		if !ok {
			return nil
		}

		newSubVars := make([]*vo.Variable, 0, len(subVars))
		for _, subVar := range subVars {
			if subVar.Name == "[Array Item]" {
				if err := t.UnwrapArrayItemFieldsInVariable(subVar); err != nil {
					return err
				}
				// If the array item is an object, append its children
				if subVar.Type == vo.VariableTypeObject {
					if innerSubVars, ok := subVar.Schema.([]*vo.Variable); ok {
						newSubVars = append(newSubVars, innerSubVars...)
					}
				} else {
					// If the array item is a primitive type, clear its name and append it
					subVar.Name = ""
					newSubVars = append(newSubVars, subVar)
				}
			} else {
				// For other sub-variables, recursively unwrap and append
				if err := t.UnwrapArrayItemFieldsInVariable(subVar); err != nil {
					return err
				}
				newSubVars = append(newSubVars, subVar)
			}
		}
		v.Schema = newSubVars

	} else if v.Type == vo.VariableTypeList {
		if v.Schema != nil {
			subVar, ok := v.Schema.(*vo.Variable)
			if !ok {
				return nil
			}

			if err := t.UnwrapArrayItemFieldsInVariable(subVar); err != nil {
				return err
			}
			// If the array item definition itself has "[Array Item]" name, clear it
			if subVar.Name == "[Array Item]" {
				subVar.Name = ""
			}
			v.Schema = subVar
		}
	}
	return nil
}

func (t *pluginService) GetPluginInvokableTools(ctx context.Context, req *crossplugin.ToolsInvokableRequest) (
	_ map[int64]crossplugin.InvokableTool, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var toolsInfo []*entity.ToolInfo
	isDraft := req.IsDraft || (req.PluginEntity.PluginVersion != nil && *req.PluginEntity.PluginVersion == "0")
	pInfo, toolsInfo, err := t.getPluginsWithTools(ctx, &crossplugin.Entity{
		PluginID:      req.PluginEntity.PluginID,
		PluginVersion: req.PluginEntity.PluginVersion,
	}, maps.Keys(req.ToolsInvokableInfo), isDraft)
	if err != nil {
		return nil, err
	}

	result := map[int64]crossplugin.InvokableTool{}
	for _, tf := range toolsInfo {
		tl := &pluginInvokeTool{
			pluginEntity: crossplugin.Entity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			},
			client:   t.client,
			toolInfo: tf,
			IsDraft:  isDraft,
		}

		if r, ok := req.ToolsInvokableInfo[tf.ID]; ok && (r.RequestAPIParametersConfig != nil && r.ResponseAPIParametersConfig != nil) {
			reqPluginCommonAPIParameters := slices.Transform(r.RequestAPIParametersConfig, toPluginCommonAPIParameter)
			respPluginCommonAPIParameters := slices.Transform(r.ResponseAPIParametersConfig, toPluginCommonAPIParameter)

			tl.toolOperation, err = pluginutil.APIParamsToOpenapiOperation(reqPluginCommonAPIParameters, respPluginCommonAPIParameters)
			if err != nil {
				return nil, err
			}

			tl.toolOperation.OperationID = tf.Operation.OperationID
			tl.toolOperation.Summary = tf.Operation.Summary
		}

		result[tf.ID] = tl
	}
	return result, nil
}

func (t *pluginService) ExecutePlugin(ctx context.Context, input map[string]any, pe *crossplugin.Entity,
	toolID int64, cfg crossplugin.ExecConfig) (map[string]any, error) {
	args, err := sonic.MarshalString(input)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	req := &service.ExecuteToolRequest{
		UserID:          conv.Int64ToStr(cfg.Operator),
		PluginID:        pe.PluginID,
		ToolID:          toolID,
		ExecScene:       plugin.ExecSceneOfWorkflow,
		ArgumentsInJson: args,
		ExecDraftTool:   pe.PluginVersion == nil || *pe.PluginVersion == "0",
	}
	execOpts := []entity.ExecuteToolOpt{
		plugin.WithInvalidRespProcessStrategy(plugin.InvalidResponseProcessStrategyOfReturnDefault),
	}

	if pe.PluginVersion != nil {
		execOpts = append(execOpts, plugin.WithToolVersion(*pe.PluginVersion))
	}

	r, err := t.client.ExecuteTool(ctx, req, execOpts...)
	if err != nil {
		if extra, ok := compose.IsInterruptRerunError(err); ok {
			pluginTIE, ok := extra.(*plugin.ToolInterruptEvent)
			if !ok {
				return nil, vo.WrapError(errno.ErrPluginAPIErr, fmt.Errorf("expects ToolInterruptEvent, got %T", extra))
			}

			var eventType workflow3.EventType
			switch pluginTIE.Event {
			case plugin.InterruptEventTypeOfToolNeedOAuth:
				eventType = workflow3.EventType_WorkflowOauthPlugin
			default:
				return nil, vo.WrapError(errno.ErrPluginAPIErr,
					fmt.Errorf("unsupported interrupt event type: %s", pluginTIE.Event))
			}

			id, err := workflow.GetRepository().GenID(ctx)
			if err != nil {
				return nil, vo.WrapError(errno.ErrIDGenError, err)
			}

			ie := &entity2.InterruptEvent{
				ID:            id,
				InterruptData: pluginTIE.ToolNeedOAuth.Message,
				EventType:     eventType,
			}

			// temporarily replace interrupt with real error, until frontend can handle plugin oauth interrupt
			interruptData := ie.InterruptData
			return nil, vo.NewError(errno.ErrAuthorizationRequired, errorx.KV("extra", interruptData))
		}
		return nil, err
	}

	var output map[string]any
	err = sonic.UnmarshalString(r.TrimmedResp, &output)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	return output, nil
}

type pluginInvokeTool struct {
	pluginEntity  crossplugin.Entity
	client        service.PluginService
	toolInfo      *entity.ToolInfo
	toolOperation *openapi3.Operation
	IsDraft       bool
}

func (p *pluginInvokeTool) Info(ctx context.Context) (_ *schema.ToolInfo, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var parameterInfo map[string]*schema.ParameterInfo
	if p.toolOperation != nil {
		parameterInfo, err = plugin.NewOpenapi3Operation(p.toolOperation).ToEinoSchemaParameterInfo(ctx)
	} else {
		parameterInfo, err = p.toolInfo.Operation.ToEinoSchemaParameterInfo(ctx)
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

func (p *pluginInvokeTool) PluginInvoke(ctx context.Context, argumentsInJSON string, cfg crossplugin.ExecConfig) (string, error) {
	req := &service.ExecuteToolRequest{
		UserID:          conv.Int64ToStr(cfg.Operator),
		PluginID:        p.pluginEntity.PluginID,
		ToolID:          p.toolInfo.ID,
		ExecScene:       plugin.ExecSceneOfWorkflow,
		ArgumentsInJson: argumentsInJSON,
		ExecDraftTool:   p.IsDraft,
	}
	execOpts := []entity.ExecuteToolOpt{
		plugin.WithInvalidRespProcessStrategy(plugin.InvalidResponseProcessStrategyOfReturnDefault),
	}

	if p.pluginEntity.PluginVersion != nil {
		execOpts = append(execOpts, plugin.WithToolVersion(*p.pluginEntity.PluginVersion))
	}

	if p.toolOperation != nil {
		execOpts = append(execOpts, plugin.WithOpenapiOperation(plugin.NewOpenapi3Operation(p.toolOperation)))
	}

	r, err := p.client.ExecuteTool(ctx, req, execOpts...)
	if err != nil {
		if extra, ok := compose.IsInterruptRerunError(err); ok {
			pluginTIE, ok := extra.(*plugin.ToolInterruptEvent)
			if !ok {
				return "", vo.WrapError(errno.ErrPluginAPIErr, fmt.Errorf("expects ToolInterruptEvent, got %T", extra))
			}

			var eventType workflow3.EventType
			switch pluginTIE.Event {
			case plugin.InterruptEventTypeOfToolNeedOAuth:
				eventType = workflow3.EventType_WorkflowOauthPlugin
			default:
				return "", vo.WrapError(errno.ErrPluginAPIErr,
					fmt.Errorf("unsupported interrupt event type: %s", pluginTIE.Event))
			}

			id, err := workflow.GetRepository().GenID(ctx)
			if err != nil {
				return "", vo.WrapError(errno.ErrIDGenError, err)
			}

			ie := &entity2.InterruptEvent{
				ID:            id,
				InterruptData: pluginTIE.ToolNeedOAuth.Message,
				EventType:     eventType,
			}

			tie := &entity2.ToolInterruptEvent{
				ToolCallID:     compose.GetToolCallID(ctx),
				ToolName:       p.toolInfo.GetName(),
				InterruptEvent: ie,
			}

			// temporarily replace interrupt with real error, until frontend can handle plugin oauth interrupt
			_ = tie
			interruptData := ie.InterruptData
			return "", vo.NewError(errno.ErrAuthorizationRequired, errorx.KV("extra", interruptData))
		}
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
