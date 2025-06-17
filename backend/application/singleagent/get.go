package singleagent

import (
	"context"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"

	knowledgeModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	knowledge "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	shortcutCMDEntity "code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

	return &playground.GetDraftBotInfoAgwResponse{
		Data: &playground.GetDraftBotInfoAgwData{
			BotInfo: vo,
			BotOptionData: &playground.BotOptionData{
				ModelDetailMap:      modelInfoDo2Vo(modelInfos),
				KnowledgeDetailMap:  knowledgeInfoDo2Vo(klInfos),
				PluginAPIDetailMap:  toolInfoDo2Vo(toolInfos),
				PluginDetailMap:     s.pluginInfoDo2Vo(ctx, pluginInfos),
				WorkflowDetailMap:   workflowDo2Vo(workflowInfos),
				ShortcutCommandList: shortCutCmdResp,
			},
			SpaceID:   agentInfo.SpaceID,
			Editable:  ptr.Of(true),
			Deletable: ptr.Of(true),
		},
	}, nil
}

func (s *SingleAgentApplicationService) fetchShortcutCMD(ctx context.Context, agentInfo *entity.SingleAgent) ([]*playground.ShortcutCommand, error) {
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
	cmdVOs := s.shortcutCMDDo2Vo(cmdDOs)
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

func (s *SingleAgentApplicationService) fetchModelDetails(ctx context.Context, agentInfo *entity.SingleAgent) ([]*modelEntity.Model, error) {
	if agentInfo.ModelInfo.ModelId == nil {
		return nil, nil
	}

	modelID := agentInfo.ModelInfo.GetModelId()
	modelInfos, err := s.appContext.ModelMgrDomainSVC.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
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
	policy := &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			IDs: slices.Transform(agentInfo.Workflow, func(a *bot_common.WorkflowInfo) int64 {
				return a.GetWorkflowId()
			}),
		},
		QType: vo.FromLatestVersion,
	}

	return s.appContext.WorkflowDomainSVC.MGet(ctx, policy)
}

func modelInfoDo2Vo(modelInfos []*modelEntity.Model) map[int64]*playground.ModelDetail {
	return slices.ToMap(modelInfos, func(e *modelEntity.Model) (int64, *playground.ModelDetail) {
		return e.ID, toModelDetail(e)
	})
}

func toModelDetail(m *modelEntity.Model) *playground.ModelDetail {
	mm := m.Meta

	return &playground.ModelDetail{
		Name:         ptr.Of(m.Name),
		ModelName:    ptr.Of(m.Meta.Name),
		ModelID:      ptr.Of(m.ID),
		ModelFamily:  ptr.Of(int64(mm.Protocol.TOModelClass())),
		ModelIconURL: ptr.Of(mm.IconURL),
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

		break // 只取一种 MIME
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

func workflowDo2Vo(wfInfos []*workflowEntity.Workflow) map[int64]*playground.WorkflowDetail {
	return slices.ToMap(wfInfos, func(e *workflowEntity.Workflow) (int64, *playground.WorkflowDetail) {
		return e.ID, &playground.WorkflowDetail{
			ID:          ptr.Of(e.ID),
			Name:        ptr.Of(e.Name),
			Description: ptr.Of(e.Desc),
			IconURL:     ptr.Of(e.IconURL),
			APIDetail: &playground.PluginAPIDetal{
				ID:          ptr.Of(e.ID),
				Name:        ptr.Of(e.Name),
				Description: ptr.Of(e.Desc),
				Parameters:  nil, // TODO(@shentong): convert from []NamedTypeInfo
			},
		}
	})
}
