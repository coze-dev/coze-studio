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

package singleagent

import (
	"context"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/playground"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	knowledge "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	pluginEntity "github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	shortcutCMDEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	workflowEntity "github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (s *SingleAgentApplicationService) GetAgentBotInfo(ctx context.Context, req *playground.GetDraftBotInfoAgwRequest) (*playground.GetDraftBotInfoAgwResponse, error) {
	agentInfo, err := s.DomainSVC.GetSingleAgent(ctx, req.GetBotID(), req.GetVersion())
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errorx.New(errno.ErrAgentInvalidParamCode, errorx.KVf("msg", "agent %d not found", req.GetBotID()))
	}

	vo, err := s.singleAgentDraftDo2Vo(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	klInfos, err := s.fetchKnowledgeDetails(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	modelInfos, err := s.fetchModelDetails(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	toolInfos, err := s.fetchToolDetails(ctx, agentInfo, req)
	if err != nil {
		return nil, err
	}

	pluginInfos, err := s.fetchPluginDetails(ctx, agentInfo, toolInfos)
	if err != nil {
		return nil, err
	}

	workflowInfos, err := s.fetchWorkflowDetails(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	shortCutCmdResp, err := s.fetchShortcutCMD(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	workflowDetailMap, err := workflowDo2Vo(workflowInfos)
	if err != nil {
		return nil, err
	}

	return &playground.GetDraftBotInfoAgwResponse{
		Data: &playground.GetDraftBotInfoAgwData{
			BotInfo: vo,
			BotOptionData: &playground.BotOptionData{
				ModelDetailMap:      modelInfoDo2Vo(modelInfos),
				KnowledgeDetailMap:  knowledgeInfoDo2Vo(klInfos),
				PluginAPIDetailMap:  toolInfoDo2Vo(toolInfos),
				PluginDetailMap:     s.pluginInfoDo2Vo(ctx, pluginInfos),
				WorkflowDetailMap:   workflowDetailMap,
				ShortcutCommandList: shortCutCmdResp,
			},
			SpaceID:   agentInfo.SpaceID,
			Editable:  ptr.Of(true),
			Deletable: ptr.Of(true),
		},
	}, nil
}

func (s *SingleAgentApplicationService) fetchShortcutCMD(ctx context.Context, agentInfo *entity.SingleAgent) ([]*playground.ShortcutCommand, error) {
	var cmdVOs []*playground.ShortcutCommand
	if len(agentInfo.ShortcutCommand) == 0 {
		return cmdVOs, nil
	}

	cmdDOs, err := s.appContext.ShortcutCMDDomainSVC.ListCMD(ctx, &shortcutCMDEntity.ListMeta{
		SpaceID:  agentInfo.SpaceID,
		ObjectID: agentInfo.AgentID,
		CommandIDs: slices.Transform(agentInfo.ShortcutCommand, func(a string) int64 {
			return conv.StrToInt64D(a, 0)
		}),
	})

	logs.CtxInfof(ctx, "fetchShortcutCMD cmdDOs = %v, err = %v", conv.DebugJsonToStr(cmdDOs), err)

	if err != nil {
		return nil, err
	}
	cmdVOs = s.shortcutCMDDo2Vo(cmdDOs)
	return cmdVOs, nil
}

func (s *SingleAgentApplicationService) shortcutCMDDo2Vo(cmdDOs []*shortcutCMDEntity.ShortcutCmd) []*playground.ShortcutCommand {
	return slices.Transform(cmdDOs, func(cmdDO *shortcutCMDEntity.ShortcutCmd) *playground.ShortcutCommand {
		return &playground.ShortcutCommand{
			ObjectID:        cmdDO.ObjectID,
			CommandID:       cmdDO.CommandID,
			CommandName:     cmdDO.CommandName,
			ShortcutCommand: cmdDO.ShortcutCommand,
			Description:     cmdDO.Description,
			SendType:        playground.SendType(cmdDO.SendType),
			ToolType:        playground.ToolType(cmdDO.ToolType),
			WorkFlowID:      conv.Int64ToStr(cmdDO.WorkFlowID),
			PluginID:        conv.Int64ToStr(cmdDO.PluginID),
			PluginAPIName:   cmdDO.PluginToolName,
			PluginAPIID:     cmdDO.PluginToolID,
			ShortcutIcon:    cmdDO.ShortcutIcon,
			TemplateQuery:   cmdDO.TemplateQuery,
			ComponentsList:  cmdDO.Components,
			CardSchema:      cmdDO.CardSchema,
			ToolInfo:        cmdDO.ToolInfo,
		}
	})
}

func (s *SingleAgentApplicationService) fetchModelDetails(ctx context.Context, agentInfo *entity.SingleAgent) ([]*modelmgr.Model, error) {
	if agentInfo.ModelInfo.ModelId == nil {
		return nil, nil
	}

	modelID := agentInfo.ModelInfo.GetModelId()
	modelInfos, err := s.appContext.ModelMgr.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{modelID},
	})
	if err != nil {
		return nil, fmt.Errorf("fetch model(%d) details failed: %v", modelID, err)
	}

	return modelInfos, nil
}

func (s *SingleAgentApplicationService) fetchKnowledgeDetails(ctx context.Context, agentInfo *entity.SingleAgent) ([]*knowledgeModel.Knowledge, error) {
	knowledgeIDs := make([]int64, 0, len(agentInfo.Knowledge.KnowledgeInfo))
	for _, v := range agentInfo.Knowledge.KnowledgeInfo {
		id, err := conv.StrToInt64(v.GetId())
		if err != nil {
			return nil, fmt.Errorf("invalid knowledge id: %s", v.GetId())
		}
		knowledgeIDs = append(knowledgeIDs, id)
	}

	if len(knowledgeIDs) == 0 {
		return nil, nil
	}

	listResp, err := s.appContext.KnowledgeDomainSVC.ListKnowledge(ctx, &knowledge.ListKnowledgeRequest{
		IDs: knowledgeIDs,
	})
	if err != nil {
		return nil, fmt.Errorf("fetch knowledge details failed: %v", err)
	}

	return listResp.KnowledgeList, err
}

func (s *SingleAgentApplicationService) fetchToolDetails(ctx context.Context, agentInfo *entity.SingleAgent, req *playground.GetDraftBotInfoAgwRequest) ([]*pluginEntity.ToolInfo, error) {
	return s.appContext.PluginDomainSVC.MGetAgentTools(ctx, &service.MGetAgentToolsRequest{
		SpaceID: agentInfo.SpaceID,
		AgentID: req.GetBotID(),
		IsDraft: true,
		VersionAgentTools: slices.Transform(agentInfo.Plugin, func(a *bot_common.PluginInfo) pluginEntity.VersionAgentTool {
			return pluginEntity.VersionAgentTool{
				ToolID: a.GetApiId(),
			}
		}),
	})
}

func (s *SingleAgentApplicationService) fetchPluginDetails(ctx context.Context, agentInfo *entity.SingleAgent, toolInfos []*pluginEntity.ToolInfo) ([]*pluginEntity.PluginInfo, error) {
	vPlugins := make([]pluginEntity.VersionPlugin, 0, len(agentInfo.Plugin))
	vPluginMap := make(map[string]bool, len(agentInfo.Plugin))
	for _, v := range toolInfos {
		k := fmt.Sprintf("%d:%s", v.PluginID, v.GetVersion())
		if vPluginMap[k] {
			continue
		}
		vPluginMap[k] = true
		vPlugins = append(vPlugins, pluginEntity.VersionPlugin{
			PluginID: v.PluginID,
			Version:  v.GetVersion(),
		})
	}
	return s.appContext.PluginDomainSVC.MGetVersionPlugins(ctx, vPlugins)
}

func (s *SingleAgentApplicationService) fetchWorkflowDetails(ctx context.Context, agentInfo *entity.SingleAgent) ([]*workflowEntity.Workflow, error) {
	if len(agentInfo.Workflow) == 0 {
		return nil, nil
	}

	policy := &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			IDs: slices.Transform(agentInfo.Workflow, func(a *bot_common.WorkflowInfo) int64 {
				return a.GetWorkflowId()
			}),
		},
		QType: vo.FromLatestVersion,
	}
	ret, _, err := s.appContext.WorkflowDomainSVC.MGet(ctx, policy)
	if err != nil {
		return nil, fmt.Errorf("fetch workflow details failed: %v", err)
	}
	return ret, nil
}

func modelInfoDo2Vo(modelInfos []*modelmgr.Model) map[int64]*playground.ModelDetail {
	return slices.ToMap(modelInfos, func(e *modelmgr.Model) (int64, *playground.ModelDetail) {
		return e.ID, toModelDetail(e)
	})
}

func toModelDetail(m *modelmgr.Model) *playground.ModelDetail {
	mm := m.Meta

	return &playground.ModelDetail{
		Name:         ptr.Of(m.Name),
		ModelName:    ptr.Of(m.Name),
		ModelID:      ptr.Of(m.ID),
		ModelFamily:  ptr.Of(int64(mm.Protocol.TOModelClass())),
		ModelIconURL: ptr.Of(m.IconURL),
	}
}

func knowledgeInfoDo2Vo(klInfos []*knowledgeModel.Knowledge) map[string]*playground.KnowledgeDetail {
	return slices.ToMap(klInfos, func(e *knowledgeModel.Knowledge) (string, *playground.KnowledgeDetail) {
		return fmt.Sprintf("%v", e.ID), &playground.KnowledgeDetail{
			ID:      ptr.Of(fmt.Sprintf("%d", e.ID)),
			Name:    ptr.Of(e.Name),
			IconURL: ptr.Of(e.IconURL),
			FormatType: func() playground.DataSetType {
				switch e.Type {
				case knowledgeModel.DocumentTypeText:
					return playground.DataSetType_Text
				case knowledgeModel.DocumentTypeTable:
					return playground.DataSetType_Table
				case knowledgeModel.DocumentTypeImage:
					return playground.DataSetType_Image
				}
				return playground.DataSetType_Text
			}(),
		}
	})
}

func toolInfoDo2Vo(toolInfos []*pluginEntity.ToolInfo) map[int64]*playground.PluginAPIDetal {
	return slices.ToMap(toolInfos, func(e *pluginEntity.ToolInfo) (int64, *playground.PluginAPIDetal) {
		return e.ID, &playground.PluginAPIDetal{
			ID:          ptr.Of(e.ID),
			Name:        ptr.Of(e.GetName()),
			Description: ptr.Of(e.GetDesc()),
			PluginID:    ptr.Of(e.PluginID),
			Parameters:  parametersDo2Vo(e.Operation),
		}
	})
}

func (s *SingleAgentApplicationService) pluginInfoDo2Vo(ctx context.Context, pluginInfos []*pluginEntity.PluginInfo) map[int64]*playground.PluginDetal {
	return slices.ToMap(pluginInfos, func(v *pluginEntity.PluginInfo) (int64, *playground.PluginDetal) {
		e := v.PluginInfo

		var iconURL string
		if e.GetIconURI() != "" {
			var err error
			iconURL, err = s.appContext.TosClient.GetObjectUrl(ctx, e.GetIconURI())
			if err != nil {
				logs.CtxErrorf(ctx, "get icon url failed, err = %v", err)
			}
		}

		return e.ID, &playground.PluginDetal{
			ID:           ptr.Of(e.ID),
			Name:         ptr.Of(e.GetName()),
			Description:  ptr.Of(e.GetDesc()),
			PluginType:   (*int64)(&e.PluginType),
			IconURL:      &iconURL,
			PluginStatus: (*int64)(ptr.Of(plugin_develop_common.PluginStatus_PUBLISHED)),
			IsOfficial: func() *bool {
				if e.SpaceID == 0 {
					return ptr.Of(true)
				}
				return ptr.Of(false)
			}(),
		}
	})
}

func parametersDo2Vo(op *plugin.Openapi3Operation) []*playground.PluginParameter {
	var convertReqBody func(paramName string, isRequired bool, sc *openapi3.Schema) *playground.PluginParameter
	convertReqBody = func(paramName string, isRequired bool, sc *openapi3.Schema) *playground.PluginParameter {
		if disabledParam(sc) {
			return nil
		}

		var assistType *int64
		if v, ok := sc.Extensions[plugin.APISchemaExtendAssistType]; ok {
			if _v, ok := v.(string); ok {
				assistType = toParameterAssistType(_v)
			}
		}

		paramInfo := &playground.PluginParameter{
			Name:        ptr.Of(paramName),
			Type:        ptr.Of(sc.Type),
			Description: ptr.Of(sc.Description),
			IsRequired:  ptr.Of(isRequired),
			AssistType:  assistType,
		}

		switch sc.Type {
		case openapi3.TypeObject:
			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})

			subParams := make([]*playground.PluginParameter, 0, len(sc.Properties))
			for subParamName, prop := range sc.Properties {
				subParamInfo := convertReqBody(subParamName, required[subParamName], prop.Value)
				if subParamInfo != nil {
					subParams = append(subParams, subParamInfo)
				}
			}

			paramInfo.SubParameters = subParams

			return paramInfo
		case openapi3.TypeArray:
			paramInfo.SubType = ptr.Of(sc.Items.Value.Type)
			if sc.Items.Value.Type != openapi3.TypeObject {
				return paramInfo
			}

			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})

			subParams := make([]*playground.PluginParameter, 0, len(sc.Items.Value.Properties))
			for subParamName, prop := range sc.Items.Value.Properties {
				subParamInfo := convertReqBody(subParamName, required[subParamName], prop.Value)
				if subParamInfo != nil {
					subParams = append(subParams, subParamInfo)
				}
			}

			paramInfo.SubParameters = subParams

			return paramInfo
		default:
			return paramInfo
		}
	}

	var params []*playground.PluginParameter

	for _, prop := range op.Parameters {
		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value
		if schemaVal.Type == openapi3.TypeObject || schemaVal.Type == openapi3.TypeArray {
			continue
		}

		if disabledParam(prop.Value.Schema.Value) {
			continue
		}

		var assistType *int64
		if v, ok := schemaVal.Extensions[plugin.APISchemaExtendAssistType]; ok {
			if _v, ok := v.(string); ok {
				assistType = toParameterAssistType(_v)
			}
		}

		params = append(params, &playground.PluginParameter{
			Name:        ptr.Of(paramVal.Name),
			Description: ptr.Of(paramVal.Description),
			IsRequired:  ptr.Of(paramVal.Required),
			Type:        ptr.Of(schemaVal.Type),
			AssistType:  assistType,
		})
	}

	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return params
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			paramInfo := convertReqBody(paramName, required[paramName], prop.Value)
			if paramInfo != nil {
				params = append(params, paramInfo)
			}
		}

		break // Take only one MIME.
	}

	return params
}

func toParameterAssistType(assistType string) *int64 {
	if assistType == "" {
		return nil
	}
	switch plugin.APIFileAssistType(assistType) {
	case plugin.AssistTypeFile:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_CODE))
	case plugin.AssistTypeImage:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_IMAGE))
	case plugin.AssistTypeDoc:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_DOC))
	case plugin.AssistTypePPT:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_PPT))
	case plugin.AssistTypeCode:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_CODE))
	case plugin.AssistTypeExcel:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_EXCEL))
	case plugin.AssistTypeZIP:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_ZIP))
	case plugin.AssistTypeVideo:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_VIDEO))
	case plugin.AssistTypeAudio:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_AUDIO))
	case plugin.AssistTypeTXT:
		return ptr.Of(int64(plugin_develop_common.AssistParameterType_TXT))
	default:
		return nil
	}
}

func workflowDo2Vo(wfInfos []*workflowEntity.Workflow) (map[int64]*playground.WorkflowDetail, error) {
	result := make(map[int64]*playground.WorkflowDetail, len(wfInfos))
	for _, e := range wfInfos {
		parameters, err := slices.TransformWithErrorCheck(e.InputParams, toPluginParameter)
		if err != nil {
			return nil, err
		}
		result[e.ID] = &playground.WorkflowDetail{
			ID:          ptr.Of(e.ID),
			Name:        ptr.Of(e.Name),
			Description: ptr.Of(e.Desc),
			IconURL:     ptr.Of(e.IconURL),
			PluginID:    ptr.Of(e.ID),
			APIDetail: &playground.PluginAPIDetal{
				ID:          ptr.Of(e.ID),
				Name:        ptr.Of(e.Name),
				Description: ptr.Of(e.Desc),
				PluginID:    ptr.Of(e.ID),
				Parameters:  parameters,
			},
		}

	}

	return result, nil
}

func toPluginParameter(info *vo.NamedTypeInfo) (*playground.PluginParameter, error) {
	if info == nil {
		return nil, fmt.Errorf("named type info is nil")
	}
	p := &playground.PluginParameter{
		Name:        ptr.Of(info.Name),
		Description: ptr.Of(info.Desc),
		IsRequired:  ptr.Of(info.Required),
	}

	switch info.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		p.Type = ptr.Of("string")
		if info.Type == vo.DataTypeFile {
			p.AssistType = toWorkflowParameterAssistType(string(*info.FileType))
		}

	case vo.DataTypeInteger:
		p.Type = ptr.Of("integer")
	case vo.DataTypeNumber:
		p.Type = ptr.Of("number")
	case vo.DataTypeBoolean:
		p.Type = ptr.Of("boolean")
	case vo.DataTypeObject:
		p.Type = ptr.Of("object")
		p.SubParameters = make([]*playground.PluginParameter, 0, len(info.Properties))
		for _, sub := range info.Properties {
			subParameter, err := toPluginParameter(sub)
			if err != nil {
				return nil, err
			}
			p.SubParameters = append(p.SubParameters, subParameter)
		}
	case vo.DataTypeArray:
		p.Type = ptr.Of("array")
		eleParameter, err := toPluginParameter(info.ElemTypeInfo)
		if err != nil {
			return nil, err
		}
		p.SubType = eleParameter.Type
		p.SubParameters = []*playground.PluginParameter{eleParameter}
	default:
		return nil, fmt.Errorf("unknown named type info type: %s", info.Type)
	}

	return p, nil
}

func toWorkflowParameterAssistType(assistType string) *int64 {
	if assistType == "" {
		return nil
	}
	switch vo.FileSubType(assistType) {
	case vo.FileTypeDefault:
		return ptr.Of(int64(workflow.AssistParameterType_DEFAULT))
	case vo.FileTypeImage:
		return ptr.Of(int64(workflow.AssistParameterType_IMAGE))
	case vo.FileTypeDocument:
		return ptr.Of(int64(workflow.AssistParameterType_DOC))
	case vo.FileTypePPT:
		return ptr.Of(int64(workflow.AssistParameterType_PPT))
	case vo.FileTypeCode:
		return ptr.Of(int64(workflow.AssistParameterType_CODE))
	case vo.FileTypeExcel:
		return ptr.Of(int64(workflow.AssistParameterType_EXCEL))
	case vo.FileTypeZip:
		return ptr.Of(int64(workflow.AssistParameterType_ZIP))
	case vo.FileTypeVideo:
		return ptr.Of(int64(workflow.AssistParameterType_VIDEO))
	case vo.FileTypeAudio:
		return ptr.Of(int64(workflow.AssistParameterType_AUDIO))
	case vo.FileTypeTxt:
		return ptr.Of(int64(workflow.AssistParameterType_TXT))
	default:
		return nil
	}
}
