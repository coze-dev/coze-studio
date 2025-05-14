package singleagent

import (
	"context"
	"fmt"
	"strconv"

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
	typesConsts "code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentApplicationService struct {
	appServiceContext *ServiceComponents
	domainSVC         singleagent.SingleAgent
}

func newApplicationService(s *ServiceComponents, domain singleagent.SingleAgent) SingleAgentApplicationService {
	return SingleAgentApplicationService{
		appServiceContext: s,
		domainSVC:         domain,
	}
}

func (s *SingleAgentApplicationService) UpdateSingleAgentDraft(ctx context.Context, req *playground.UpdateDraftBotInfoAgwRequest) (*playground.UpdateDraftBotInfoAgwResponse, error) {
	// TODO： 这个一上来就查询？ 要做个简单鉴权吧？
	agentID := req.BotInfo.GetBotId()
	currentAgentInfo, err := s.domainSVC.GetSingleAgent(ctx, agentID, "")
	if err != nil {
		return nil, err
	}

	if currentAgentInfo == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "bot_id invalidate"))
	}

	allow, err := s.appServiceContext.PermissionDomainSVC.CheckSingleAgentOperatePermission(ctx, agentID, currentAgentInfo.SpaceID)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "permission denied"))
	}

	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	// TODO: 权限校验

	agentInfo, err := s.toSingleAgentInfo(ctx, currentAgentInfo, req.BotInfo)
	if err != nil {
		return nil, err
	}

	if req.BotInfo.VariableList != nil {
		agentID = req.BotInfo.GetBotId()
		var varsMetaID int64
		varsMetaID, err = s.upsertVariableList(ctx, agentID, *userID, "", req.BotInfo.VariableList)
		if err != nil {
			return nil, err
		}

		agentInfo.VariablesMetaID = &varsMetaID
	}

	err = s.domainSVC.UpdateSingleAgentDraft(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	err = s.appServiceContext.DomainNotifier.PublishApps(ctx, &searchEntity.AppDomainEvent{
		DomainName: searchEntity.SingleAgent,
		OpType:     searchEntity.Updated,
		Agent: &searchEntity.Agent{
			ID: agentID,
			// SpaceID:      spaceID,
			OwnerID:      *userID,
			Name:         req.BotInfo.GetName(),
			HasPublished: false,
		},
	})
	if err != nil {
		return nil, err
	}

	// TODO: 确认data中的数据在开源场景是否有用
	return &playground.UpdateDraftBotInfoAgwResponse{
		Data: &playground.UpdateDraftBotInfoAgwData{},
	}, nil
	// bot.BusinessType == int32(bot_common.BusinessType_DouyinAvatar) 忽略
}

func (s *SingleAgentApplicationService) upsertVariableList(ctx context.Context, agentID, userID int64, version string, update []*bot_common.Variable) (int64, error) {
	vars := variableEntity.NewVariablesWithAgentVariables(update)

	return s.appServiceContext.VariablesDomainSVC.UpsertBotMeta(ctx, agentID, version, userID, vars)
}

func (s *SingleAgentApplicationService) toSingleAgentInfo(ctx context.Context, current *agentEntity.SingleAgent, update *bot_common.BotInfoForUpdate) (*agentEntity.SingleAgent, error) {
	// baseCommitBotDraft, err := service.DefaultBotDraftService().CalBaseCommitBotDraft
	// oldReplica, err := dao.DefaultDraftReplicaRepo().GetDraftBotReplica

	if update.Name != nil {
		current.Name = *update.Name
	}

	if update.Description != nil {
		current.Desc = *update.Description
	}

	if update.IconUri != nil {
		current.IconURI = *update.IconUri
	}

	if update.OnboardingInfo != nil {
		current.OnboardingInfo = update.OnboardingInfo
	}

	if update.ModelInfo != nil {
		current.ModelInfo = update.ModelInfo
	}

	if update.PromptInfo != nil {
		current.Prompt = update.PromptInfo
	}

	if update.WorkflowInfoList != nil {
		current.Workflow = update.WorkflowInfoList
	}

	if update.PluginInfoList != nil {
		current.Plugin = update.PluginInfoList
	}

	if update.Knowledge != nil {
		current.Knowledge = update.Knowledge
	}

	if update.SuggestReplyInfo != nil {
		current.SuggestReply = update.SuggestReplyInfo
	}

	if update.BackgroundImageInfoList != nil {
		current.BackgroundImageInfoList = update.BackgroundImageInfoList
	}

	if len(update.Agents) > 0 && update.Agents[0].JumpConfig != nil {
		current.JumpConfig = update.Agents[0].JumpConfig
	}

	return current, nil
}

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *developer_api.DraftBotCreateRequest) (*developer_api.DraftBotCreateResponse, error) {
	spaceID := req.SpaceID

	ticket := ctxutil.GetRequestTicketFromCtx(ctx)
	if ticket == "" {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "ticket required"))
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userId := *uid

	fullPath := ctxutil.GetRequestFullPathFromCtx(ctx)
	if fullPath == "" {
		return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", "full path required"))
	}

	// TODO(@fanlv): 确认是否需要 CheckSpaceOperatePermission 和 UserSpaceCheck 两次 check
	allow, err := s.appServiceContext.PermissionDomainSVC.CheckSpaceOperatePermission(ctx, spaceID, fullPath, ticket)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "permission denied"))
	}

	allow, err = s.appServiceContext.PermissionDomainSVC.UserSpaceCheck(ctx, spaceID, userId)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "user not in space"))
	}

	do, err := s.draftBotCreateRequestToSingleAgent(req)
	if err != nil {
		return nil, err
	}

	agentID, err := s.domainSVC.CreateSingleAgentDraft(ctx, userId, do)
	if err != nil {
		return nil, err
	}

	err = s.appServiceContext.DomainNotifier.PublishApps(ctx, &searchEntity.AppDomainEvent{
		DomainName: searchEntity.SingleAgent,
		OpType:     searchEntity.Created,
		Agent: &searchEntity.Agent{
			ID:           agentID,
			SpaceID:      spaceID,
			OwnerID:      userId,
			Name:         do.Name,
			HasPublished: false,
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
	sa.Name = req.Name
	sa.Desc = req.Description
	sa.IconURI = req.IconURI
	return sa, nil
}

func (s *SingleAgentApplicationService) newDefaultSingleAgent() *agentEntity.SingleAgent {
	// TODO(@lipandeng)： 默认配置
	return &agentEntity.SingleAgent{
		OnboardingInfo: &bot_common.OnboardingInfo{},
		ModelInfo:      &bot_common.ModelInfo{},
		Prompt:         &bot_common.PromptInfo{},
		Plugin:         []*bot_common.PluginInfo{},
		Knowledge:      &bot_common.Knowledge{},
		Workflow:       []*bot_common.WorkflowInfo{},
		SuggestReply:   &bot_common.SuggestReplyInfo{},
		JumpConfig:     &bot_common.JumpConfig{},
	}
}

func (s *SingleAgentApplicationService) GetDraftBotInfo(ctx context.Context, req *playground.GetDraftBotInfoAgwRequest) (*playground.GetDraftBotInfoAgwResponse, error) {
	agentInfo, err := s.domainSVC.GetSingleAgent(ctx, req.GetBotID(), req.GetVersion())
	if err != nil {
		return nil, err
	}

	vo, err := s.singleAgentDraftDo2Vo(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	knowledgeIDs := make([]int64, 0, len(agentInfo.Knowledge.KnowledgeInfo))
	for _, v := range agentInfo.Knowledge.KnowledgeInfo {
		id, err := strconv.ParseInt(v.GetId(), 10, 64)
		if err != nil {
			return nil, err
		}
		knowledgeIDs = append(knowledgeIDs, id)
	}

	var klInfos []*knowledgeEntity.Knowledge
	if len(knowledgeIDs) > 0 {
		klInfos, _, err = s.appServiceContext.KnowledgeDomainSVC.MGetKnowledge(ctx, &knowledge.MGetKnowledgeRequest{
			IDs: knowledgeIDs,
		})
		if err != nil {
			return nil, err
		}
	}

	var modelInfos []*modelEntity.Model
	if agentInfo.ModelInfo.ModelId != nil {
		modelInfos, err = s.appServiceContext.ModelMgrDomainSVC.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
			IDs: []int64{agentInfo.ModelInfo.GetModelId()},
		})
		if err != nil {
			return nil, err
		}
	}

	toolResp, err := s.appServiceContext.PluginDomainSVC.MGetAgentTools(ctx, &service.MGetAgentToolsRequest{
		SpaceID: agentInfo.SpaceID,
		AgentID: req.GetBotID(),
		IsDraft: true,
		VersionAgentTools: slices.Transform(agentInfo.Plugin, func(a *bot_common.PluginInfo) pluginEntity.VersionAgentTool {
			return pluginEntity.VersionAgentTool{
				ToolID: a.GetApiId(),
			}
		}),
	})
	if err != nil {
		return nil, err
	}

	workflowInfos, err := s.appServiceContext.WorkflowDomainSVC.MGetWorkflows(ctx, slices.Transform(agentInfo.Workflow, func(a *bot_common.WorkflowInfo) *workflowEntity.WorkflowIdentity {
		return &workflowEntity.WorkflowIdentity{
			ID:      a.GetWorkflowId(),
			Version: "",
		}
	}))
	if err != nil {
		return nil, err
	}

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
				PluginDetailMap:    nil,
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

func (s *SingleAgentApplicationService) DeleteAgentDraft(ctx context.Context, req *developer_api.DeleteDraftBotRequest) (*developer_api.DeleteDraftBotResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	err := s.domainSVC.DeleteAgentDraft(ctx, req.GetSpaceID(), req.GetBotID())
	if err != nil {
		return nil, err
	}

	err = s.appServiceContext.DomainNotifier.PublishApps(ctx, &searchEntity.AppDomainEvent{
		DomainName: searchEntity.SingleAgent,
		OpType:     searchEntity.Created,
		Agent: &searchEntity.Agent{
			ID:           req.GetBotID(),
			SpaceID:      req.GetSpaceID(),
			OwnerID:      *uid,
			HasPublished: false,
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

	copiedAgent, err := s.domainSVC.Duplicate(ctx, &agentEntity.DuplicateAgentRequest{
		SpaceID: req.GetSpaceID(),
		AgentID: req.GetBotID(),
		UserID:  userID,
	})
	if err != nil {
		return nil, err
	}

	userInfos, err := s.appServiceContext.UserDomainSVC.MGetUserProfiles(ctx, []int64{userID})
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

// type SingleAgent struct {
// 	AgentID   int64
// 	CreatorID int64
// 	SpaceID   int64
// 	Name      string
// 	Desc      string
// 	IconURI   string
// 	CreatedAt int64
// 	UpdatedAt int64
// 	DeletedAt gorm.DeletedAt

// 	State           AgentState
// 	VariablesMetaID *int64
// 	OnboardingInfo  *bot_common.OnboardingInfo
// 	ModelInfo       *bot_common.ModelInfo
// 	Prompt          *bot_common.PromptInfo
// 	Plugin          []*bot_common.PluginInfo
// 	Knowledge       *bot_common.Knowledge
// 	Workflow        []*bot_common.WorkflowInfo
// 	SuggestReply    *bot_common.SuggestReplyInfo
// 	JumpConfig      *bot_common.JumpConfig
// }

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
		Status:                  bot_common.BotStatus_Using,
		// TODO: 确认这些字段要不要？
		// VoicesInfo:       do.v,
		// UserQueryCollectConf: u,
		// LayoutInfo
	}

	if do.VariablesMetaID != nil {
		vars, err := s.appServiceContext.VariablesDomainSVC.GetVariableMetaByID(ctx, *do.VariablesMetaID)
		if err != nil {
			return nil, err
		}

		if vars != nil {
			vo.VariableList = vars.ToAgentVariables()
		}
	}

	if vo.IconUri != "" {
		url, err := s.appServiceContext.TosClient.GetObjectUrl(ctx, vo.IconUri)
		if err != nil {
			return nil, err
		}
		vo.IconUrl = url
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
				Parameters:  parametersDo2Vo(e.Operation), // TODO(@shentong): 改成 json schema ？
			},
		}
	})
}

func parametersDo2Vo(op *openapi3.Operation) []*playground.PluginParameter {
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

	_, err := s.authUserAgent(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	draftInfoDo := &entity.AgentDraftDisplayInfo{
		AgentID:     req.BotID,
		DisplayInfo: req.DisplayInfo,
		SpaceID:     req.SpaceID,
	}

	err = s.domainSVC.UpdateAgentDraftDisplayInfo(ctx, *uid, draftInfoDo)
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

	_, err := s.authUserAgent(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	draftInfoDo, err := s.domainSVC.GetAgentDraftDisplayInfo(ctx, *uid, req.BotID)
	if err != nil {
		return nil, err
	}

	return &developer_api.GetDraftBotDisplayInfoResponse{
		Code: 0,
		Msg:  "success",
		Data: draftInfoDo.DisplayInfo,
	}, nil
}

func (s *SingleAgentApplicationService) PublishAgent(ctx context.Context, req *developer_api.PublishDraftBotRequest) (*developer_api.PublishDraftBotResponse, error) {
	draftAgent, err := s.authUserAgent(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	version := req.GetCommitVersion()
	if version == "" {
		v, err := s.appServiceContext.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		version = fmt.Sprintf("%v", v)
	}

	if draftAgent.VariablesMetaID != nil && *draftAgent.VariablesMetaID != 0 {
		newVariableMetaID, err := s.appServiceContext.VariablesDomainSVC.PublishMeta(ctx, *draftAgent.VariablesMetaID, version)
		if err != nil {
			return nil, err
		}

		draftAgent.VariablesMetaID = ptr.Of(newVariableMetaID)
	}

	connectorIDs := make([]int64, 0, len(req.Connectors))
	for v := range req.Connectors {
		id, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			return nil, err
		}

		if typesConsts.PublishConnectorIDWhiteList[id] {
			return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", fmt.Sprintf("connector %d not allowed", id)))
		}

		connectorIDs = append(connectorIDs, id)
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	draftAgent.CreatorID = *uid

	p := &entity.SingleAgentPublish{
		ConnectorIds: connectorIDs,
		Version:      version,
		PublishID:    req.GetPublishID(),
		PublishInfo:  req.HistoryInfo,
	}

	err = s.domainSVC.PublishAgent(ctx, p, draftAgent)
	if err != nil {
		return nil, err
	}

	resp := &developer_api.PublishDraftBotResponse{
		Code: 0,
		Msg:  "success",
	}

	resp.Data = &developer_api.PublishDraftBotData{
		CheckNotPass: false,
	}

	for k := range req.Connectors {
		resp.Data.PublishResult[k] = &developer_api.ConnectorBindResult{
			Code:                0,
			Msg:                 "success",
			PublishResultStatus: ptr.Of(developer_api.PublishResultStatus_Success),
		}
	}

	return resp, nil
}

func (s *SingleAgentApplicationService) authUserAgent(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	do, err := s.domainSVC.GetSingleAgentDraft(ctx, agentID)
	if err != nil {
		return nil, err
	}

	if do == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", fmt.Sprintf("draft bot %v not found", agentID)))
	}

	if do.CreatorID != *uid {
		return do, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "permission denied"))
	}

	return do, nil
}

// 新增 ListDraftBotHistory 方法
func (s *SingleAgentApplicationService) ListAgentPublishHistory(ctx context.Context, req *developer_api.ListDraftBotHistoryRequest) (*developer_api.ListDraftBotHistoryResponse, error) {
	resp := &developer_api.ListDraftBotHistoryResponse{}
	draftAgent, err := s.authUserAgent(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	var connectorID *int64
	if req.GetConnectorID() != "" {
		id, err := conv.StrToInt64(req.GetConnectorID())
		if err != nil {
			return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", fmt.Sprintf("ConnectorID %v invalidate", *req.ConnectorID)))
		}

		connectorID = ptr.Of(id)
	}

	historyList, err := s.domainSVC.ListAgentPublishHistory(ctx, draftAgent.AgentID, req.PageIndex, req.PageSize, connectorID)
	if err != nil {
		return nil, err
	}

	uid := ctxutil.MustGetUIDFromCtx(ctx)
	resp.Data = &developer_api.ListDraftBotHistoryData{}

	for _, v := range historyList {

		connectorInfos := make([]*developer_api.ConnectorInfo, 0, len(v.ConnectorIds))

		infos, err := s.domainSVC.GetConnectorInfos(ctx, v.ConnectorIds)
		if err != nil {
			return nil, err
		}
		for _, info := range infos {
			connectorInfos = append(connectorInfos, info.ToVO())
		}

		creator, err := s.appServiceContext.UserDomainSVC.GetUserProfiles(ctx, v.CreatorID)
		if err != nil {
			return nil, err
		}

		historyInfo := &developer_api.HistoryInfo{
			HistoryType:    developer_api.HistoryType_FLAG,
			Version:        v.Version,
			Info:           *v.PublishInfo,
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
