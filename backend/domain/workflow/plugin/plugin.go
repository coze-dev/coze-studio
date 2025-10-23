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

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/getkin/kin-openapi/openapi3"
	"golang.org/x/exp/maps"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert/api"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	entity2 "github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var oss storage.Storage

func SetOSS(s storage.Storage) {
	oss = s
}

type pluginInfo struct {
	*model.PluginInfo
	LatestVersion *string
}

func getSaasPluginWithTools(ctx context.Context, pluginEntity *vo.PluginEntity, toolIDs []int64) (*pluginInfo, []*entity.ToolInfo, error) {
	tools, plugin, err := crossplugin.DefaultSVC().BatchGetSaasPluginToolsInfo(ctx, []int64{pluginEntity.PluginID})
	if err != nil {
		return nil, nil, err
	}
	if len(tools) == 0 {
		return nil, nil, vo.NewError(errno.ErrPluginIDNotFound, errorx.KV("id", strconv.FormatInt(pluginEntity.PluginID, 10)))
	}
	toolsInfo := make([]*entity.ToolInfo, 0, len(toolIDs))
	for _, t := range tools[pluginEntity.PluginID] {
		if slices.Contains(toolIDs, t.ID) {
			toolsInfo = append(toolsInfo, t)
		}
	}
	return &pluginInfo{PluginInfo: plugin[pluginEntity.PluginID]}, toolsInfo, nil
}

func getPluginsWithTools(ctx context.Context, pluginEntity *vo.PluginEntity, toolIDs []int64, isDraft bool) (
	_ *pluginInfo, toolsInfo []*entity.ToolInfo, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var pluginsInfo []*model.PluginInfo
	var latestPluginInfo *model.PluginInfo
	pluginID := pluginEntity.PluginID

	if ptr.From(pluginEntity.PluginFrom) == bot_common.PluginFrom_FromSaas {
		return getSaasPluginWithTools(ctx, pluginEntity, toolIDs)
	}

	if isDraft {
		plugins, err := crossplugin.DefaultSVC().MGetDraftPlugins(ctx, []int64{pluginID})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins
	} else if pluginEntity.PluginVersion == nil || (pluginEntity.PluginVersion != nil && *pluginEntity.PluginVersion == "") {
		plugins, err := crossplugin.DefaultSVC().MGetOnlinePlugins(ctx, []int64{pluginID})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins

	} else {
		plugins, err := crossplugin.DefaultSVC().MGetVersionPlugins(ctx, []model.VersionPlugin{
			{PluginID: pluginID, Version: *pluginEntity.PluginVersion},
		})
		if err != nil {
			return nil, nil, err
		}
		pluginsInfo = plugins

		onlinePlugins, err := crossplugin.DefaultSVC().MGetOnlinePlugins(ctx, []int64{pluginID})
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

	var pInfo *model.PluginInfo
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
		tools, err := crossplugin.DefaultSVC().MGetDraftTools(ctx, toolIDs)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	} else if pluginEntity.PluginVersion == nil || (pluginEntity.PluginVersion != nil && *pluginEntity.PluginVersion == "") {
		tools, err := crossplugin.DefaultSVC().MGetOnlineTools(ctx, toolIDs)
		if err != nil {
			return nil, nil, err
		}
		toolsInfo = tools
	} else {
		eVersionTools := slices.Transform(toolIDs, func(tid int64) model.VersionTool {
			return model.VersionTool{
				ToolID:  tid,
				Version: *pluginEntity.PluginVersion,
			}
		})
		tools, err := crossplugin.DefaultSVC().MGetVersionTools(ctx, eVersionTools)
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

func GetPluginToolsInfo(ctx context.Context, req *ToolsInfoRequest) (_ *ToolsInfoResponse, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var toolsInfo []*entity.ToolInfo
	var pInfo *pluginInfo
	var url string
	if ptr.From(req.PluginEntity.PluginFrom) == bot_common.PluginFrom_FromSaas {
		pInfo, toolsInfo, err = getSaasPluginWithTools(ctx, &vo.PluginEntity{PluginID: req.PluginEntity.PluginID, PluginVersion: req.PluginEntity.PluginVersion}, req.ToolIDs)
		if err != nil {
			return nil, err
		}

		if pInfo.IconURL != nil {
			url = *pInfo.IconURL
		}

	} else {
		isDraft := req.IsDraft || (req.PluginEntity.PluginVersion != nil && *req.PluginEntity.PluginVersion == "0")
		pInfo, toolsInfo, err = getPluginsWithTools(ctx, &vo.PluginEntity{PluginID: req.PluginEntity.PluginID, PluginVersion: req.PluginEntity.PluginVersion}, req.ToolIDs, isDraft)
		if err != nil {
			return nil, err
		}

		if oss == nil {
			return nil, vo.NewError(errno.ErrTOSError, errorx.KV("msg", "oss is nil"))
		}

		url, err = oss.GetObjectUrl(ctx, pInfo.GetIconURI())
		if err != nil {
			return nil, vo.WrapIfNeeded(errno.ErrTOSError, err)
		}
	}

	response := &ToolsInfoResponse{
		PluginID:      pInfo.ID,
		SpaceID:       pInfo.SpaceID,
		Version:       pInfo.GetVersion(),
		PluginName:    pInfo.GetName(),
		Description:   pInfo.GetDesc(),
		IconURL:       url,
		PluginType:    int64(pInfo.PluginType),
		ToolInfoList:  make(map[int64]ToolInfoW),
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

		response.ToolInfoList[tf.ID] = ToolInfoW{
			ToolID:      tf.ID,
			ToolName:    tf.GetName(),
			Inputs:      slices.Transform(inputs, toWorkflowAPIParameter),
			Outputs:     slices.Transform(outputs, toWorkflowAPIParameter),
			Description: tf.GetDesc(),
			DebugExample: &DebugExample{
				ReqExample:  requestExample,
				RespExample: responseExample,
			},
		}

	}
	return response, nil
}

func GetPluginInvokableTools(ctx context.Context, req *ToolsInvokableRequest) (
	_ map[int64]crossplugin.InvokableTool, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrPluginAPIErr, err)
		}
	}()

	var toolsInfo []*entity.ToolInfo
	isDraft := req.IsDraft || (req.PluginEntity.PluginVersion != nil && *req.PluginEntity.PluginVersion == "0")
	pInfo, toolsInfo, err := getPluginsWithTools(ctx, &vo.PluginEntity{
		PluginID:      req.PluginEntity.PluginID,
		PluginVersion: req.PluginEntity.PluginVersion,
		PluginFrom:    req.PluginEntity.PluginFrom,
	}, maps.Keys(req.ToolsInvokableInfo), isDraft)
	if err != nil {
		return nil, err
	}

	result := map[int64]crossplugin.InvokableTool{}
	for _, tf := range toolsInfo {
		tl := &pluginInvokeTool{
			pluginEntity: vo.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
				PluginFrom:    pInfo.Source,
			},
			toolInfo: tf,
			IsDraft:  isDraft,
		}

		if r, ok := req.ToolsInvokableInfo[tf.ID]; ok && (r.RequestAPIParametersConfig != nil && r.ResponseAPIParametersConfig != nil) {
			reqPluginCommonAPIParameters := slices.Transform(r.RequestAPIParametersConfig, toPluginCommonAPIParameter)
			respPluginCommonAPIParameters := slices.Transform(r.ResponseAPIParametersConfig, toPluginCommonAPIParameter)

			tl.toolOperation, err = api.APIParamsToOpenapiOperation(reqPluginCommonAPIParameters, respPluginCommonAPIParameters)
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

type pluginInvokeTool struct {
	pluginEntity  vo.PluginEntity
	toolInfo      *model.ToolInfo
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
		parameterInfo, err = model.NewOpenapi3Operation(p.toolOperation).ToEinoSchemaParameterInfo(ctx)
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

func (p *pluginInvokeTool) PluginInvoke(ctx context.Context, argumentsInJSON string, cfg workflowModel.ExecuteConfig) (string, error) {
	req := &model.ExecuteToolRequest{
		UserID:          conv.Int64ToStr(cfg.Operator),
		PluginID:        p.pluginEntity.PluginID,
		ToolID:          p.toolInfo.ID,
		ExecScene:       consts.ExecSceneOfWorkflow,
		ArgumentsInJson: argumentsInJSON,
		ExecDraftTool:   p.IsDraft,
		PluginFrom:      p.pluginEntity.PluginFrom,
	}
	execOpts := []model.ExecuteToolOpt{
		model.WithInvalidRespProcessStrategy(consts.InvalidResponseProcessStrategyOfReturnDefault),
	}

	if p.pluginEntity.PluginVersion != nil {
		execOpts = append(execOpts, model.WithToolVersion(*p.pluginEntity.PluginVersion))
	}

	if p.toolOperation != nil {
		execOpts = append(execOpts, model.WithOpenapiOperation(model.NewOpenapi3Operation(p.toolOperation)))
	}

	r, err := crossplugin.DefaultSVC().ExecuteTool(ctx, req, execOpts...)
	if err != nil {
		if extra, ok := compose.IsInterruptRerunError(err); ok {
			pluginTIE, ok := extra.(*model.ToolInterruptEvent)
			if !ok {
				return "", vo.WrapError(errno.ErrPluginAPIErr, fmt.Errorf("expects ToolInterruptEvent, got %T", extra))
			}

			var eventType workflow3.EventType
			switch pluginTIE.Event {
			case consts.InterruptEventTypeOfToolNeedOAuth:
				eventType = workflow3.EventType_WorkflowOauthPlugin
			default:
				return "", vo.WrapError(errno.ErrPluginAPIErr,
					fmt.Errorf("unsupported interrupt event type: %s", pluginTIE.Event))
			}

			id, eErr := workflow.GetRepository().GenID(ctx)
			if eErr != nil {
				return "", vo.WrapError(errno.ErrIDGenError, eErr)
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

	// Check if it's a specially wrapped array that needs unwrapping.
	if parameter.Type == common.ParameterType_Array && len(parameter.SubParameters) == 1 && parameter.SubParameters[0].Name == "[Array Item]" {
		arrayItem := parameter.SubParameters[0]
		// The actual type of array elements is the type of the "[Array Item]".
		p.SubType = ptr.Of(workflow3.ParameterType(arrayItem.Type))
		// If the array elements are objects, their sub-parameters (fields) are lifted up.
		if arrayItem.Type == common.ParameterType_Object {
			p.SubParameters = make([]*workflow3.APIParameter, 0, len(arrayItem.SubParameters))
			for _, subParam := range arrayItem.SubParameters {
				p.SubParameters = append(p.SubParameters, toWorkflowAPIParameter(subParam))
			}
		} else {
			p.SubParameters = make([]*workflow3.APIParameter, 0, 1)
			p.SubParameters = append(p.SubParameters, toWorkflowAPIParameter(arrayItem))
		}
	} else if len(parameter.SubParameters) > 0 {
		p.SubParameters = make([]*workflow3.APIParameter, 0, len(parameter.SubParameters))
		for _, subParam := range parameter.SubParameters {
			p.SubParameters = append(p.SubParameters, toWorkflowAPIParameter(subParam))
		}
	}

	return p
}
