package application

import (
	"context"
	"errors"
	"fmt"

	agentAPI "code.byted.org/flow/opencoze/backend/api/model/agent"
	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	knowledgeEntity "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	variableEntity "code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentApplicationService struct{}

var SingleAgentSVC = SingleAgentApplicationService{}

func (s *SingleAgentApplicationService) UpdateSingleAgentDraft(ctx context.Context, req *agentAPI.UpdateDraftBotInfoRequest) (*agentAPI.UpdateDraftBotInfoResponse, error) {
	// TODO： 这个一上来就查询？ 要做个简单鉴权吧？
	botID := req.BotInfo.GetBotId()
	currentAgentInfo, err := singleAgentDomainSVC.GetSingleAgent(ctx, botID, "")
	if err != nil {
		return nil, err
	}

	if currentAgentInfo == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "bot_id invalidate"))
	}

	allow, err := permissionDomainSVC.CheckSingleAgentOperatePermission(ctx, botID, currentAgentInfo.SpaceID)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errors.New("permission denied")
	}

	userID := getUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	// TODO: 权限校验

	agentInfo, err := s.toSingleAgentInfo(ctx, currentAgentInfo, req.BotInfo)
	if err != nil {
		return nil, err
	}

	if req.BotInfo.VariableList != nil {
		botID = req.BotInfo.GetBotId()
		varsMetaID, err := s.upsertVariableList(ctx, botID, *userID, "", req.BotInfo.VariableList)
		if err != nil {
			return nil, err
		}

		agentInfo.VariablesMetaID = &varsMetaID
	}

	err = singleAgentDomainSVC.UpdateSingleAgentDraft(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	// TODO: 确认data中的数据在开源场景是否有用
	return &agentAPI.UpdateDraftBotInfoResponse{}, nil
	// bot.BusinessType == int32(bot_common.BusinessType_DouyinAvatar) 忽略
}

func (s *SingleAgentApplicationService) upsertVariableList(ctx context.Context, agentID, userID int64, version string, update []*agent_common.Variable) (int64, error) {
	vars := variableEntity.NewVariablesWithAgentVariables(update)

	return variablesDomainSVC.UpsertBotMeta(ctx, agentID, version, userID, vars)
}

func (s *SingleAgentApplicationService) toSingleAgentInfo(ctx context.Context, current *agentEntity.SingleAgent, update *agent_common.BotInfoForUpdate) (*agentEntity.SingleAgent, error) {
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

	if len(update.Agents) > 0 && update.Agents[0].JumpConfig != nil {
		current.JumpConfig = update.Agents[0].JumpConfig
	}

	return current, nil
}

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *agentAPI.DraftBotCreateRequest) (*agentAPI.DraftBotCreateResponse, error) {
	ticket := getRequestTicketFromCtx(ctx)
	if ticket == "" {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "ticket required"))
	}

	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userId := *uid

	fullPath := getRequestFullPathFromCtx(ctx)
	if fullPath == "" {
		return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", "full path required"))
	}

	// TODO(@fanlv): 确认是否需要 CheckSpaceOperatePermission 和 UserSpaceCheck 两次 check
	allow, err := permissionDomainSVC.CheckSpaceOperatePermission(ctx, req.SpaceID, fullPath, ticket)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "permission denied"))
	}

	allow, err = permissionDomainSVC.UserSpaceCheck(ctx, req.SpaceID, userId)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "user not in space"))
	}

	do := s.draftBotCreateRequestToSingleAgent(req)

	agentID, err := singleAgentDomainSVC.CreateSingleAgentDraft(ctx, userId, do)
	if err != nil {
		return nil, err
	}

	return &agentAPI.DraftBotCreateResponse{Data: &agentAPI.DraftBotCreateData{
		BotID: fmt.Sprintf("%d", agentID),
	}}, nil
}

func (s *SingleAgentApplicationService) draftBotCreateRequestToSingleAgent(req *agentAPI.DraftBotCreateRequest) *agentEntity.SingleAgent {
	sa := s.newDefaultSingleAgent()
	sa.SpaceID = req.SpaceID
	sa.Name = req.Name
	sa.Desc = req.Description
	sa.IconURI = req.IconURI
	return sa
}

func (s *SingleAgentApplicationService) newDefaultSingleAgent() *agentEntity.SingleAgent {
	// TODO(@lipandeng)： 默认配置
	return &agentEntity.SingleAgent{
		OnboardingInfo: &agent_common.OnboardingInfo{},
		ModelInfo:      &agent_common.ModelInfo{},
		Prompt:         &agent_common.PromptInfo{},
		Plugin:         []*agent_common.PluginInfo{},
		Knowledge:      &agent_common.Knowledge{},
		Workflow:       []*agent_common.WorkflowInfo{},
		SuggestReply:   &agent_common.SuggestReplyInfo{},
		JumpConfig:     &agent_common.JumpConfig{},
	}
}

func (s *SingleAgentApplicationService) GetDraftBotInfo(ctx context.Context, req *agentAPI.GetDraftBotInfoRequest) (*agentAPI.GetDraftBotInfoResponse, error) {
	agentInfo, err := singleAgentDomainSVC.GetSingleAgent(ctx, req.GetBotID(), req.GetVersion())
	if err != nil {
		return nil, err
	}

	vo := s.singleAgentDraftDo2Vo(agentInfo)

	if agentInfo.VariablesMetaID != nil {
		vars, err := variablesDomainSVC.GetVariableMetaByID(ctx, *agentInfo.VariablesMetaID)
		if err != nil {
			return nil, err
		}

		if vars != nil {
			vo.VariableList = vars.ToAgentVariables()
		}
	}

	klInfos, _, err := knowledgeDomainSVC.MGetKnowledge(ctx, &knowledge.MGetKnowledgeRequest{
		IDs: slices.Transform(agentInfo.Knowledge.KnowledgeInfo, func(a *agent_common.KnowledgeInfo) int64 {
			return a.GetID()
		}),
	})
	if err != nil {
		return nil, err
	}

	modelInfos, err := modelMgrDomainSVC.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{agentInfo.ModelInfo.GetModelId()},
	})
	if err != nil {
		return nil, err
	}

	toolResp, err := pluginDomainSVC.MGetAgentTools(ctx, &plugin.MGetAgentToolsRequest{
		// TODO@lipandeng: 填入用户 ID
		// UserID:  ,
		AgentID: req.GetBotID(),
		IsDraft: true,
		VersionAgentTools: slices.Transform(agentInfo.Plugin, func(a *agent_common.PluginInfo) pluginEntity.VersionAgentTool {
			return pluginEntity.VersionAgentTool{
				ToolID: a.GetApiId(),
				// TODO@lipandeng: 填入版本号
				// VersionMs : ptr.Of(),
			}
		}),
	})
	if err != nil {
		return nil, err
	}

	workflowInfos, err := workflowDomainSVC.MGetWorkflows(ctx, slices.Transform(agentInfo.Workflow, func(a *agent_common.WorkflowInfo) *workflowEntity.WorkflowIdentity {
		return &workflowEntity.WorkflowIdentity{
			ID:      a.GetWorkflowId(),
			Version: "",
		}
	}))
	if err != nil {
		return nil, err
	}

	return &agentAPI.GetDraftBotInfoResponse{
		Data: &agentAPI.GetDraftBotInfoData{
			BotInfo: vo,
			BotOptionData: &agentAPI.BotOptionData{
				ModelDetailMap:     modelInfoDo2Vo(modelInfos),
				KnowledgeDetailMap: knowledgeInfoDo2Vo(klInfos),
				PluginAPIDetailMap: toolInfoDo2Vo(toolResp.Tools),
				PluginDetailMap:    nil,
				WorkflowDetailMap:  workflowDo2Vo(workflowInfos),
			},
		},
	}, nil
}

func (s *SingleAgentApplicationService) singleAgentDraftDo2Vo(do *agentEntity.SingleAgent) *agent_common.BotInfo {
	return &agent_common.BotInfo{
		BotId:          do.AgentID,
		Name:           do.Name,
		Description:    do.Desc,
		IconUri:        do.IconURI,
		OnboardingInfo: do.OnboardingInfo,
		// VariableList:     do.Variable,
		ModelInfo:        do.ModelInfo,
		PromptInfo:       do.Prompt,
		PluginInfoList:   do.Plugin,
		Knowledge:        do.Knowledge,
		WorkflowInfoList: do.Workflow,
		SuggestReplyInfo: do.SuggestReply,
	}
}

func knowledgeInfoDo2Vo(klInfos []*knowledgeEntity.Knowledge) map[int64]*agentAPI.KnowledgeDetail {
	return slices.ToMap(klInfos, func(e *knowledgeEntity.Knowledge) (int64, *agentAPI.KnowledgeDetail) {
		return e.ID, &agentAPI.KnowledgeDetail{
			ID:      ptr.Of(e.ID),
			Name:    ptr.Of(e.Name),
			IconURL: ptr.Of(e.IconURI),
			FormatType: func() agentAPI.DataSetType {
				switch e.Type {
				case knowledgeEntity.DocumentTypeText:
					return agentAPI.DataSetType_Text
				case knowledgeEntity.DocumentTypeTable:
					return agentAPI.DataSetType_Table
				case knowledgeEntity.DocumentTypeImage:
					return agentAPI.DataSetType_Image
				}
				return agentAPI.DataSetType_Text
			}(),
		}
	})
}

func modelInfoDo2Vo(modelInfos []*modelEntity.Model) map[int64]*agentAPI.ModelDetail {
	return slices.ToMap(modelInfos, func(e *modelEntity.Model) (int64, *agentAPI.ModelDetail) {
		return e.ID, &agentAPI.ModelDetail{
			Name:         ptr.Of(e.Name),
			ModelName:    ptr.Of(e.Meta.Name),
			ModelID:      ptr.Of(e.ID),
			ModelFamily:  nil,
			ModelIconURL: nil,
		}
	})
}

func toolInfoDo2Vo(toolInfos []*pluginEntity.ToolInfo) map[int64]*agentAPI.PluginAPIDetal {
	return slices.ToMap(toolInfos, func(e *pluginEntity.ToolInfo) (int64, *agentAPI.PluginAPIDetal) {
		return e.ID, &agentAPI.PluginAPIDetal{
			ID:          ptr.Of(e.ID),
			Name:        e.Name,
			Description: e.Desc,
			PluginID:    ptr.Of(e.PluginID),
			Parameters:  parametersDo2Vo(e.ReqParameters),
		}
	})
}

func workflowDo2Vo(wfInfos []*workflowEntity.Workflow) map[int64]*agentAPI.WorkflowDetail {
	return slices.ToMap(wfInfos, func(e *workflowEntity.Workflow) (int64, *agentAPI.WorkflowDetail) {
		return e.ID, &agentAPI.WorkflowDetail{
			ID:          ptr.Of(e.ID),
			Name:        ptr.Of(e.Name),
			Description: ptr.Of(e.Desc),
			IconURL:     ptr.Of(e.IconURI),
			APIDetail: &agentAPI.PluginAPIDetal{
				ID:          ptr.Of(e.ID),
				Name:        ptr.Of(e.Name),
				Description: ptr.Of(e.Desc),
				Parameters:  parametersDo2Vo(e.ReqParameters),
			},
		}
	})
}

func parametersDo2Vo(params []*plugin_common.APIParameter) []*agentAPI.PluginParameter {
	if params == nil {
		return nil
	}

	result := make([]*agentAPI.PluginParameter, 0, len(params))
	for _, param := range params {
		pp := &agentAPI.PluginParameter{
			Name:        ptr.Of(param.Name),
			Description: ptr.Of(param.Desc),
			IsRequired:  ptr.Of(param.IsRequired),
			Type:        ptr.Of(param.Type.String()),
		}

		if param.SubType != nil {
			pp.SubType = ptr.Of(param.SubType.String())
		}

		if len(param.SubParameters) > 0 {
			pp.SubParameters = parametersDo2Vo(param.SubParameters)
		}

		result = append(result, pp)
	}

	return result
}
