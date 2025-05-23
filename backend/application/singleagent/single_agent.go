package singleagent

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	knowledgeEntity "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	variableEntity "code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"

	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentApplicationService struct {
	appContext *ServiceComponents
	DomainSVC  singleagent.SingleAgent
}

func newApplicationService(s *ServiceComponents, domain singleagent.SingleAgent) *SingleAgentApplicationService {
	return &SingleAgentApplicationService{
		appContext: s,
		DomainSVC:  domain,
	}
}

const onboardingInfoMaxLength = 65535

func (s *SingleAgentApplicationService) generateOnboardingStr(onboardingInfo *bot_common.OnboardingInfo) (string, error) {
	onboarding := playground.OnboardingContent{}
	if onboardingInfo != nil {
		onboarding.Prologue = ptr.Of(onboardingInfo.GetPrologue())
		onboarding.SuggestedQuestions = onboardingInfo.GetSuggestedQuestions()
		onboarding.SuggestedQuestionsShowMode = onboardingInfo.SuggestedQuestionsShowMode
	}

	onboardingInfoStr, err := sonic.MarshalString(onboarding)
	if err != nil {
		return "", err
	}

	return onboardingInfoStr, nil
}

func (s *SingleAgentApplicationService) UpdateSingleAgentDraft(ctx context.Context, req *playground.UpdateDraftBotInfoAgwRequest) (*playground.UpdateDraftBotInfoAgwResponse, error) {
	if req.BotInfo.OnboardingInfo != nil {
		infoStr, err := s.generateOnboardingStr(req.BotInfo.OnboardingInfo)
		if err != nil {
			return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "onboarding_info invalidate"))
		}

		if len(infoStr) > onboardingInfoMaxLength {
			return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "onboarding_info is too long"))
		}
	}

	agentID := req.BotInfo.GetBotId()
	currentAgentInfo, err := s.validateAgentDraftAccess(ctx, agentID)
	if err != nil {
		return nil, err
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)

	updateAgentInfo, err := s.applyAgentUpdates(currentAgentInfo, req.BotInfo)
	if err != nil {
		return nil, err
	}

	if req.BotInfo.VariableList != nil {
		var varsMetaID int64
		varsMetaID, err = s.upsertVariableList(ctx, agentID, userID, "", req.BotInfo.VariableList)
		if err != nil {
			return nil, err
		}

		updateAgentInfo.VariablesMetaID = &varsMetaID
	}

	err = s.DomainSVC.UpdateSingleAgentDraft(ctx, updateAgentInfo)
	if err != nil {
		return nil, err
	}

	err = s.appContext.Eventbus.PublishApps(ctx, &searchEntity.AppDomainEvent{
		DomainName: searchEntity.SingleAgent,
		OpType:     searchEntity.Updated,
		Agent: &searchEntity.Agent{
			ID:   agentID,
			Name: &updateAgentInfo.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	// TODO(@fanlv): 这几个字段确认下有没有用
	return &playground.UpdateDraftBotInfoAgwResponse{
		Data: &playground.UpdateDraftBotInfoAgwData{
			HasChange:    ptr.Of(true),
			CheckNotPass: false,
			Branch:       playground.BranchPtr(playground.Branch_PersonalDraft),
			// SameWithOnline: false,
		},
	}, nil
}

func (s *SingleAgentApplicationService) upsertVariableList(ctx context.Context, agentID, userID int64, version string, update []*bot_common.Variable) (int64, error) {
	vars := variableEntity.NewVariablesWithAgentVariables(update)

	return s.appContext.VariablesDomainSVC.UpsertBotMeta(ctx, agentID, version, userID, vars)
}

func (s *SingleAgentApplicationService) applyAgentUpdates(target *agentEntity.SingleAgent, patch *bot_common.BotInfoForUpdate) (*agentEntity.SingleAgent, error) {
	if patch.Name != nil {
		target.Name = *patch.Name
	}

	if patch.Description != nil {
		target.Desc = *patch.Description
	}

	if patch.IconUri != nil {
		target.IconURI = *patch.IconUri
	}

	if patch.OnboardingInfo != nil {
		target.OnboardingInfo = patch.OnboardingInfo
	}

	if patch.ModelInfo != nil {
		target.ModelInfo = patch.ModelInfo
	}

	if patch.PromptInfo != nil {
		target.Prompt = patch.PromptInfo
	}

	if patch.WorkflowInfoList != nil {
		target.Workflow = patch.WorkflowInfoList
	}

	if patch.PluginInfoList != nil {
		target.Plugin = patch.PluginInfoList
	}

	if patch.Knowledge != nil {
		target.Knowledge = patch.Knowledge
	}

	if patch.SuggestReplyInfo != nil {
		target.SuggestReply = patch.SuggestReplyInfo
	}

	if patch.BackgroundImageInfoList != nil {
		target.BackgroundImageInfoList = patch.BackgroundImageInfoList
	}

	if patch.Agents != nil && len(patch.Agents) > 0 && patch.Agents[0].JumpConfig != nil {
		target.JumpConfig = patch.Agents[0].JumpConfig
	}

	if patch.DatabaseList != nil {
		target.Database = patch.DatabaseList
	}

	return target, nil
}

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *developer_api.DraftBotCreateRequest) (*developer_api.DraftBotCreateResponse, error) {
	spaceID := req.GetSpaceID()

	ticket := ctxutil.GetRequestTicketFromCtx(ctx)
	if ticket == "" {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "ticket required"))
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *uid

	fullPath := ctxutil.GetRequestFullPathFromCtx(ctx)
	if fullPath == "" {
		return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", "full path required"))
	}

	// TODO： 鉴权

	do, err := s.draftBotCreateRequestToSingleAgent(req)
	if err != nil {
		return nil, err
	}

	agentID, err := s.DomainSVC.CreateSingleAgentDraft(ctx, userID, do)
	if err != nil {
		return nil, err
	}

	err = s.appContext.Eventbus.PublishApps(ctx, &searchEntity.AppDomainEvent{
		DomainName: searchEntity.SingleAgent,
		OpType:     searchEntity.Created,
		Agent: &searchEntity.Agent{
			ID:      agentID,
			SpaceID: &spaceID,
			OwnerID: &userID,
			Name:    &do.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	return &developer_api.DraftBotCreateResponse{Data: &developer_api.DraftBotCreateData{
		BotID: agentID,
	}}, nil
}

func (s *SingleAgentApplicationService) draftBotCreateRequestToSingleAgent(req *developer_api.DraftBotCreateRequest) (*agentEntity.SingleAgent, error) {
	spaceID := req.SpaceID

	sa := s.newDefaultSingleAgent()
	sa.SpaceID = spaceID
	sa.Name = req.GetName()
	sa.Desc = req.GetDescription()
	sa.IconURI = req.GetIconURI()
	return sa, nil
}

func (s *SingleAgentApplicationService) defaultModelInfo() *bot_common.ModelInfo {
	return &bot_common.ModelInfo{
		MaxTokens:  ptr.Of[int32](4096),
		ModelId:    ptr.Of[int64](1737521813),
		ModelStyle: bot_common.ModelStylePtr(bot_common.ModelStyle_Balance),
		ShortMemoryPolicy: &bot_common.ShortMemoryPolicy{
			ContextMode:  bot_common.ContextModePtr(bot_common.ContextMode_FunctionCall_2),
			HistoryRound: ptr.Of[int32](3),
		},
	}
}

func (s *SingleAgentApplicationService) newDefaultSingleAgent() *agentEntity.SingleAgent {
	// TODO(@lipandeng)： 默认配置

	now := time.Now().UnixMilli()
	return &agentEntity.SingleAgent{
		OnboardingInfo: &bot_common.OnboardingInfo{},
		ModelInfo:      s.defaultModelInfo(),
		Prompt:         &bot_common.PromptInfo{},
		Plugin:         []*bot_common.PluginInfo{},
		Knowledge:      &bot_common.Knowledge{},
		Workflow:       []*bot_common.WorkflowInfo{},
		SuggestReply:   &bot_common.SuggestReplyInfo{},
		JumpConfig:     &bot_common.JumpConfig{},
		Database:       []*bot_common.Database{},

		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (s *SingleAgentApplicationService) GetAgentBotInfo(ctx context.Context, req *playground.GetDraftBotInfoAgwRequest) (*playground.GetDraftBotInfoAgwResponse, error) {
	agentInfo, err := s.DomainSVC.GetSingleAgent(ctx, req.GetBotID(), req.GetVersion())
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, nil
	}

	vo, err := s.singleAgentDraftDo2Vo(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	var klInfos []*knowledgeEntity.Knowledge
	if klInfos, err = s.fetchKnowledgeDetails(ctx, agentInfo); err != nil {
		return nil, err
	}

	var modelInfos []*modelEntity.Model
	if modelInfos, err = s.fetchModelDetails(ctx, agentInfo); err != nil {
		return nil, err
	}

	toolResp, err := s.fetchToolDetails(ctx, agentInfo, req)
	if err != nil {
		return nil, err
	}

	vPlugins := make([]pluginEntity.VersionPlugin, 0, len(agentInfo.Plugin))
	vPluginMap := make(map[string]bool, len(agentInfo.Plugin))
	for _, v := range toolResp.Tools {
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
	pluginResp, err := s.fetchPluginDetails(ctx, vPlugins)
	if err != nil {
		return nil, err
	}

	workflowInfos, err := s.fetchWorkflowDetails(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	// TODO: 确认剩下字段是否需要
	// "commit_time": "1747116741",
	// "commit_version": "7503808916724564008",
	// "committer_name": "fanlv",
	// "connectors": [],
	// "deletable": true,
	// "editable": true,
	// "has_publish": false,
	// "has_unpublished_change": false,
	// "in_collaboration": false,
	// "publish_time": "-62135596800",
	// "same_with_online": false,
	// "space_id": "7350235204910563380"

	return &playground.GetDraftBotInfoAgwResponse{
		Data: &playground.GetDraftBotInfoAgwData{
			BotInfo: vo,
			BotOptionData: &playground.BotOptionData{
				ModelDetailMap:     modelInfoDo2Vo(modelInfos),
				KnowledgeDetailMap: knowledgeInfoDo2Vo(klInfos),
				PluginAPIDetailMap: toolInfoDo2Vo(toolResp.Tools),
				PluginDetailMap:    pluginInfoDo2Vo(pluginResp.Plugins),
				WorkflowDetailMap:  workflowDo2Vo(workflowInfos),
			},
			SpaceID:   agentInfo.SpaceID,
			Editable:  ptr.Of(true),
			Deletable: ptr.Of(true),
			// Connectors: ,
			// TODO: 确认剩下字段是否需要
		},
	}, nil
}

func (s *SingleAgentApplicationService) fetchModelDetails(ctx context.Context, agentInfo *agentEntity.SingleAgent) ([]*modelEntity.Model, error) {
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

func (s *SingleAgentApplicationService) fetchKnowledgeDetails(ctx context.Context, agentInfo *agentEntity.SingleAgent) ([]*knowledgeEntity.Knowledge, error) {
	// 提取知识库ID列表
	knowledgeIDs := make([]int64, 0, len(agentInfo.Knowledge.KnowledgeInfo))
	for _, v := range agentInfo.Knowledge.KnowledgeInfo {
		id, err := conv.StrToInt64(v.GetId())
		if err != nil {
			return nil, fmt.Errorf("invalid knowledge id: %s", v.GetId())
		}
		knowledgeIDs = append(knowledgeIDs, id)
	}

	// 批量获取知识库详情
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

func (s *SingleAgentApplicationService) fetchToolDetails(ctx context.Context, agentInfo *agentEntity.SingleAgent, req *playground.GetDraftBotInfoAgwRequest) (*service.MGetAgentToolsResponse, error) {
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

func (s *SingleAgentApplicationService) fetchPluginDetails(ctx context.Context, vPlugins []pluginEntity.VersionPlugin) (*service.MGetVersionPluginsResponse, error) {
	return s.appContext.PluginDomainSVC.MGetVersionPlugins(ctx, &service.MGetVersionPluginsRequest{
		VersionPlugins: vPlugins,
	})
}

// 新增工作流信息获取函数
func (s *SingleAgentApplicationService) fetchWorkflowDetails(ctx context.Context, agentInfo *agentEntity.SingleAgent) ([]*workflowEntity.Workflow, error) {
	return s.appContext.WorkflowDomainSVC.MGetWorkflows(ctx, slices.Transform(agentInfo.Workflow, func(a *bot_common.WorkflowInfo) *workflowEntity.WorkflowIdentity {
		return &workflowEntity.WorkflowIdentity{
			ID:      a.GetWorkflowId(),
			Version: "",
		}
	}))
}

func (s *SingleAgentApplicationService) DeleteAgentDraft(ctx context.Context, req *developer_api.DeleteDraftBotRequest) (*developer_api.DeleteDraftBotResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	err := s.DomainSVC.DeleteAgentDraft(ctx, req.GetSpaceID(), req.GetBotID())
	if err != nil {
		return nil, err
	}

	err = s.appContext.Eventbus.PublishApps(ctx, &searchEntity.AppDomainEvent{
		DomainName: searchEntity.SingleAgent,
		OpType:     searchEntity.Deleted,
		Agent: &searchEntity.Agent{
			ID: req.GetBotID(),
		},
	})
	if err != nil {
		return nil, err
	}

	return &developer_api.DeleteDraftBotResponse{
		Data: &developer_api.DeleteDraftBotData{},
		Code: 0,
	}, nil
}

func (s *SingleAgentApplicationService) DuplicateDraftBot(ctx context.Context, req *developer_api.DuplicateDraftBotRequest) (*developer_api.DuplicateDraftBotResponse, error) {
	userIDPtr := ctxutil.GetUIDFromCtx(ctx)
	if userIDPtr == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *userIDPtr

	copiedAgent, err := s.DomainSVC.Duplicate(ctx, &agentEntity.DuplicateAgentRequest{
		SpaceID: req.GetSpaceID(),
		AgentID: req.GetBotID(),
		UserID:  userID,
	})
	if err != nil {
		return nil, err
	}

	userInfos, err := s.appContext.UserDomainSVC.MGetUserProfiles(ctx, []int64{userID})
	if err != nil {
		return nil, err
	}

	if len(userInfos) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", "user"),
			errorx.KV("id", strconv.FormatInt(userID, 10)))
	}

	return &developer_api.DuplicateDraftBotResponse{
		Data: &developer_api.DuplicateDraftBotData{
			BotID: copiedAgent.AgentID,
			Name:  copiedAgent.Name,
			UserInfo: &developer_api.Creator{
				ID:             userID,
				Name:           userInfos[0].Name,
				AvatarURL:      userInfos[0].IconURL,
				Self:           false,
				UserUniqueName: userInfos[0].UniqueName,
				UserLabel:      nil,
			},
		},
		Code: 0,
	}, nil
}

func (s *SingleAgentApplicationService) singleAgentDraftDo2Vo(ctx context.Context, do *agentEntity.SingleAgent) (*bot_common.BotInfo, error) {
	vo := &bot_common.BotInfo{
		BotId:                   do.AgentID,
		Name:                    do.Name,
		Description:             do.Desc,
		IconUri:                 do.IconURI,
		OnboardingInfo:          do.OnboardingInfo,
		ModelInfo:               do.ModelInfo,
		PromptInfo:              do.Prompt,
		PluginInfoList:          do.Plugin,
		Knowledge:               do.Knowledge,
		WorkflowInfoList:        do.Workflow,
		SuggestReplyInfo:        do.SuggestReply,
		CreatorId:               do.CreatorID,
		TaskInfo:                &bot_common.TaskInfo{},
		CreateTime:              do.CreatedAt / 1000,
		UpdateTime:              do.UpdatedAt / 1000,
		BotMode:                 bot_common.BotMode_SingleMode,
		BackgroundImageInfoList: do.BackgroundImageInfoList,
		Status:                  bot_common.BotStatus_Using, // TODO: 确认其他场景有没有其他状态
		// TODO: 确认这些字段要不要？
		// VoicesInfo:       do.v,
		// UserQueryCollectConf: u,
		// LayoutInfo
		DatabaseList: do.Database,
	}

	if do.VariablesMetaID != nil {
		vars, err := s.appContext.VariablesDomainSVC.GetVariableMetaByID(ctx, *do.VariablesMetaID)
		if err != nil {
			return nil, err
		}

		if vars != nil {
			vo.VariableList = vars.ToAgentVariables()
		}
	}

	if vo.IconUri != "" {
		url, err := s.appContext.TosClient.GetObjectUrl(ctx, vo.IconUri)
		if err != nil {
			return nil, err
		}
		vo.IconUrl = url
	}

	if vo.ModelInfo == nil || vo.ModelInfo.ModelId == nil {
		vo.ModelInfo = s.defaultModelInfo()
	}

	return vo, nil
}

func knowledgeInfoDo2Vo(klInfos []*knowledgeEntity.Knowledge) map[string]*playground.KnowledgeDetail {
	return slices.ToMap(klInfos, func(e *knowledgeEntity.Knowledge) (string, *playground.KnowledgeDetail) {
		return fmt.Sprintf("%v", e.ID), &playground.KnowledgeDetail{
			ID:      ptr.Of(fmt.Sprintf("%d", e.ID)),
			Name:    ptr.Of(e.Name),
			IconURL: ptr.Of(e.IconURI),
			FormatType: func() playground.DataSetType {
				switch e.Type {
				case knowledgeEntity.DocumentTypeText:
					return playground.DataSetType_Text
				case knowledgeEntity.DocumentTypeTable:
					return playground.DataSetType_Table
				case knowledgeEntity.DocumentTypeImage:
					return playground.DataSetType_Image
				}
				return playground.DataSetType_Text
			}(),
		}
	})
}

func modelInfoDo2Vo(modelInfos []*modelEntity.Model) map[int64]*playground.ModelDetail {
	return slices.ToMap(modelInfos, func(e *modelEntity.Model) (int64, *playground.ModelDetail) {
		return e.ID, &playground.ModelDetail{
			Name:         ptr.Of(e.Name),
			ModelName:    ptr.Of(e.Meta.Name),
			ModelID:      ptr.Of(e.ID),
			ModelFamily:  nil,
			ModelIconURL: nil,
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

func pluginInfoDo2Vo(pluginInfos []*pluginEntity.PluginInfo) map[int64]*playground.PluginDetal {
	return slices.ToMap(pluginInfos, func(e *pluginEntity.PluginInfo) (int64, *playground.PluginDetal) {
		return e.ID, &playground.PluginDetal{
			ID:           ptr.Of(e.ID),
			Name:         ptr.Of(e.GetName()),
			Description:  ptr.Of(e.GetDesc()),
			PluginType:   (*int64)(&e.PluginType),
			PluginStatus: (*int64)(ptr.Of(common.PluginStatus_PUBLISHED)),
			IsOfficial: func() *bool {
				if e.SpaceID == 0 {
					return ptr.Of(true)
				}
				return ptr.Of(false)
			}(),
		}
	})
}

func workflowDo2Vo(wfInfos []*workflowEntity.Workflow) map[int64]*playground.WorkflowDetail {
	return slices.ToMap(wfInfos, func(e *workflowEntity.Workflow) (int64, *playground.WorkflowDetail) {
		return e.ID, &playground.WorkflowDetail{
			ID:          ptr.Of(e.ID),
			Name:        ptr.Of(e.Name),
			Description: ptr.Of(e.Desc),
			IconURL:     ptr.Of(e.IconURI),
			APIDetail: &playground.PluginAPIDetal{
				ID:          ptr.Of(e.ID),
				Name:        ptr.Of(e.Name),
				Description: ptr.Of(e.Desc),
				Parameters:  parametersDo2Vo(ptr.Of(pluginEntity.Openapi3Operation(*e.Operation))), // TODO(@shentong): 改成 json schema ？
			},
		}
	})
}

func parametersDo2Vo(op *pluginEntity.Openapi3Operation) []*playground.PluginParameter {
	var convertReqBody func(paramName string, isRequired bool, sc *openapi3.Schema) *playground.PluginParameter
	convertReqBody = func(paramName string, isRequired bool, sc *openapi3.Schema) *playground.PluginParameter {
		if disabledParam(sc) {
			return nil
		}

		var assistType *int64
		if v, ok := sc.Extensions[consts.APISchemaExtendAssistType]; ok {
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
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendAssistType]; ok {
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
	switch consts.APIFileAssistType(assistType) {
	case consts.AssistTypeFile:
		return ptr.Of(int64(common.AssistParameterType_CODE))
	case consts.AssistTypeImage:
		return ptr.Of(int64(common.AssistParameterType_IMAGE))
	case consts.AssistTypeDoc:
		return ptr.Of(int64(common.AssistParameterType_DOC))
	case consts.AssistTypePPT:
		return ptr.Of(int64(common.AssistParameterType_PPT))
	case consts.AssistTypeCode:
		return ptr.Of(int64(common.AssistParameterType_CODE))
	case consts.AssistTypeExcel:
		return ptr.Of(int64(common.AssistParameterType_EXCEL))
	case consts.AssistTypeZIP:
		return ptr.Of(int64(common.AssistParameterType_ZIP))
	case consts.AssistTypeVideo:
		return ptr.Of(int64(common.AssistParameterType_VIDEO))
	case consts.AssistTypeAudio:
		return ptr.Of(int64(common.AssistParameterType_AUDIO))
	case consts.AssistTypeTXT:
		return ptr.Of(int64(common.AssistParameterType_TXT))
	default:
		return nil
	}
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}

func (s *SingleAgentApplicationService) UpdateAgentDraftDisplayInfo(ctx context.Context, req *developer_api.UpdateDraftBotDisplayInfoRequest) (*developer_api.UpdateDraftBotDisplayInfoResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	_, err := s.validateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	draftInfoDo := &entity.AgentDraftDisplayInfo{
		AgentID:     req.BotID,
		DisplayInfo: req.DisplayInfo,
		SpaceID:     req.SpaceID,
	}

	err = s.DomainSVC.UpdateAgentDraftDisplayInfo(ctx, *uid, draftInfoDo)
	if err != nil {
		return nil, err
	}

	return &developer_api.UpdateDraftBotDisplayInfoResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (s *SingleAgentApplicationService) GetAgentDraftDisplayInfo(ctx context.Context, req *developer_api.GetDraftBotDisplayInfoRequest) (*developer_api.GetDraftBotDisplayInfoResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	_, err := s.validateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	draftInfoDo, err := s.DomainSVC.GetAgentDraftDisplayInfo(ctx, *uid, req.BotID)
	if err != nil {
		return nil, err
	}

	return &developer_api.GetDraftBotDisplayInfoResponse{
		Code: 0,
		Msg:  "success",
		Data: draftInfoDo.DisplayInfo,
	}, nil
}

func (s *SingleAgentApplicationService) validateAgentDraftAccess(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session uid not found"))
	}

	do, err := s.DomainSVC.GetSingleAgentDraft(ctx, agentID)
	if err != nil {
		return nil, err
	}

	if do == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KVf("msg", "No agent draft(%d) found for the given agent ID", agentID))
	}

	if do.CreatorID != *uid {
		logs.CtxErrorf(ctx, "User(%d) is not the creator(%d) of the draft", *uid, do.CreatorID)
		return do, errorx.New(errno.ErrPermissionCode, errorx.KV("detail", "User is not the creator of the draft"))
	}

	return do, nil
}

// 新增 ListDraftBotHistory 方法
func (s *SingleAgentApplicationService) ListAgentPublishHistory(ctx context.Context, req *developer_api.ListDraftBotHistoryRequest) (*developer_api.ListDraftBotHistoryResponse, error) {
	resp := &developer_api.ListDraftBotHistoryResponse{}
	draftAgent, err := s.validateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	var connectorID *int64
	if req.GetConnectorID() != "" {
		var id int64
		id, err = conv.StrToInt64(req.GetConnectorID())
		if err != nil {
			return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", fmt.Sprintf("ConnectorID %v invalidate", *req.ConnectorID)))
		}

		connectorID = ptr.Of(id)
	}

	historyList, err := s.DomainSVC.ListAgentPublishHistory(ctx, draftAgent.AgentID, req.PageIndex, req.PageSize, connectorID)
	if err != nil {
		return nil, err
	}

	uid := ctxutil.MustGetUIDFromCtx(ctx)
	resp.Data = &developer_api.ListDraftBotHistoryData{}

	for _, v := range historyList {

		connectorInfos := make([]*developer_api.ConnectorInfo, 0, len(v.ConnectorIds))

		infos, err := s.appContext.Connector.GetByIDs(ctx, v.ConnectorIds)
		if err != nil {
			return nil, err
		}
		for _, info := range infos {
			v := info.ToVO()
			v.ConnectorStatus = developer_api.ConnectorDynamicStatus_Normal
			connectorInfos = append(connectorInfos, v)
		}

		creator, err := s.appContext.UserDomainSVC.GetUserProfiles(ctx, v.CreatorID)
		if err != nil {
			return nil, err
		}

		info := ""
		if v.PublishInfo != nil {
			info = *v.PublishInfo
		}

		historyInfo := &developer_api.HistoryInfo{
			HistoryType:    developer_api.HistoryType_FLAG,
			Version:        v.Version,
			Info:           info,
			CreateTime:     conv.Int64ToStr(v.CreatedAt / 1000),
			ConnectorInfos: connectorInfos,
			Creator: &developer_api.Creator{
				ID:        v.CreatorID,
				Name:      creator.Name,
				AvatarURL: creator.IconURL,
				Self:      uid == v.CreatorID,
				// UserUniqueName: creator.UserUniqueName, // TODO(@fanlv) : user domain 补完以后再改
				// UserLabel TODO
			},
			PublishID: &v.PublishID,
		}

		resp.Data.HistoryInfos = append(resp.Data.HistoryInfos, historyInfo)
	}

	return resp, nil
}
