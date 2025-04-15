package application

import (
	"context"
	"errors"
	"fmt"

	agentAPI "code.byted.org/flow/opencoze/backend/api/model/agent"
	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	knowledgeEntity "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	modelEntity "code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
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

	agentInfo, err := s.toSingleAgentInfo(ctx, currentAgentInfo, req.BotInfo)
	if err != nil {
		return nil, err
	}

	err = singleAgentDomainSVC.UpdateSingleAgentDraft(ctx, agentInfo)
	if err != nil {
		return nil, err
	}

	// TODO: 确认data中的数据在开源场景是否有用
	return &agentAPI.UpdateDraftBotInfoResponse{}, nil
	// bot.BusinessType == int32(bot_common.BusinessType_DouyinAvatar) 忽略
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

	if update.VariableList != nil {
		current.Variable = update.VariableList
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
		Variable:       []*agent_common.Variable{},
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
	// TODO:  BotOptionData 打包

	klInfos, err := knowledgeDomainSVC.MGetKnowledge(ctx, slices.Transform(agentInfo.Knowledge.KnowledgeInfo, func(a *agent_common.KnowledgeInfo) int64 {
		return a.GetID()
	}))
	if err != nil {
		return nil, err
	}

	modelInfos, err := modelMgrDomainSVR.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{agentInfo.ModelInfo.GetModelId()},
	})
	if err != nil {
		return nil, err
	}

	return &agentAPI.GetDraftBotInfoResponse{
		Data: &agentAPI.GetDraftBotInfoData{
			BotInfo: vo,
			BotOptionData: &agentAPI.BotOptionData{
				ModelDetailMap:     modelInfoDo2Vo(modelInfos),
				KnowledgeDetailMap: knowledgeInfoDo2Vo(klInfos),
			},
		},
	}, nil
}

func (s *SingleAgentApplicationService) singleAgentDraftDo2Vo(do *agentEntity.SingleAgent) *agent_common.BotInfo {
	return &agent_common.BotInfo{
		BotId:            do.AgentID,
		Name:             do.Name,
		Description:      do.Desc,
		IconUri:          do.IconURI,
		OnboardingInfo:   do.OnboardingInfo,
		VariableList:     do.Variable,
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
