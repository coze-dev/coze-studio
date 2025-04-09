package application

import (
	"context"
	"errors"
	"fmt"

	api "code.byted.org/flow/opencoze/backend/api/model/agent"
	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentApplicationService struct{}

var SingleAgentSVC = SingleAgentApplicationService{}

func (s *SingleAgentApplicationService) UpdateSingleAgentDraft(ctx context.Context, req *api.UpdateDraftBotInfoRequest) (*api.UpdateDraftBotInfoResponse, error) {
	// TODO： 这个一上来就查询？ 要做个简单鉴权吧？
	botID := req.BotInfo.GetBotId()
	currentAgentInfo, err := singleAgentDomainSVC.GetSingleAgentDraft(ctx, botID)
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
	return &api.UpdateDraftBotInfoResponse{}, nil
	// bot.BusinessType == int32(bot_common.BusinessType_DouyinAvatar) 忽略
}

func (s *SingleAgentApplicationService) toSingleAgentInfo(ctx context.Context, current *entity.SingleAgent, update *agent_common.BotInfoForUpdate) (*entity.SingleAgent, error) {
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

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *api.DraftBotCreateRequest) (*api.DraftBotCreateResponse, error) {
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

	return &api.DraftBotCreateResponse{Data: &api.DraftBotCreateData{
		BotID: fmt.Sprintf("%d", agentID),
	}}, nil
}

func (s *SingleAgentApplicationService) draftBotCreateRequestToSingleAgent(req *api.DraftBotCreateRequest) *entity.SingleAgent {
	sa := s.newDefaultSingleAgent()
	sa.SpaceID = req.SpaceID
	sa.Name = req.Name
	sa.Desc = req.Description
	sa.IconURI = req.IconURI
	return sa
}

func (s *SingleAgentApplicationService) newDefaultSingleAgent() *entity.SingleAgent {
	// TODO(@lipandeng)： 默认配置
	return &entity.SingleAgent{
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
