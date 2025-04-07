package application

import (
	"context"
	"errors"

	api "code.byted.org/flow/opencoze/backend/api/model/agent"
	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type SingleAgentApplicationService struct{}

var SingleAgentSVC = SingleAgentApplicationService{}

func (s *SingleAgentApplicationService) UpdateDraftBotInfo(ctx context.Context, req *api.UpdateDraftBotInfoRequest) (*api.UpdateDraftBotInfoResponse, error) {
	botID := req.BotInfo.GetBotId()
	currentAgentInfo, err := singleAgentDomainSVC.GetSingleAgentDraft(ctx, botID)
	if err != nil {
		return nil, err
	}

	if currentAgentInfo == nil {
		// TODO(fanlv) : 这里错误要加上 error code 。后面统一看下 错误怎么处理
		return nil, errors.New("no permission to operate")
	}

	allow, err := permissionDomainSVC.CheckSingleAgentOperatePermission(ctx, botID, currentAgentInfo.SpaceID)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errors.New("permission denied")
	}

	botInfo, err := s.toUpdateBotInfo(ctx, currentAgentInfo, req.BotInfo)
	if err != nil {
		return nil, err
	}

	err = singleAgentDomainSVC.UpdateSingleAgentDraft(ctx, botInfo)
	if err != nil {
		return nil, err
	}

	// TODO: 确认data中的数据在开源场景是否有用
	return &api.UpdateDraftBotInfoResponse{}, nil
	// bot.BusinessType == int32(bot_common.BusinessType_DouyinAvatar) 忽略
}

func (s *SingleAgentApplicationService) toUpdateBotInfo(ctx context.Context, current *entity.SingleAgentDraft, update *agent_common.BotInfoForUpdate) (*entity.SingleAgentDraft, error) {
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
