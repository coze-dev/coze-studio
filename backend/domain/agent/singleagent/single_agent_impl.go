package singleagent

import (
	"context"

	"gorm.io/gorm"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/common"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type singleAgentImpl struct {
	common.Info
	*dal.SingleAgentDAO
}

type Components struct {
	PluginService crossdomain.PluginService
	IDGen         idgen.IDGenerator
	DB            *gorm.DB
}

func NewService(c *Components) SingleAgent {
	dao := dal.NewSingleAgentDAO(c.DB, c.IDGen)

	return &singleAgentImpl{
		SingleAgentDAO: dao,
		// PluginSVC:      c.PluginService,
	}
}

func (s *singleAgentImpl) Create(ctx context.Context, draft *entity.SingleAgent) (draftID int64, err error) {
	// return s.SingleAgentDAO.Create(ctx, draft.SingleAgent)
	return
}

func (s *singleAgentImpl) Update(ctx context.Context, draft *entity.SingleAgent) (err error) {
	// return s.SingleAgentDAO.Update(ctx, draft.SingleAgent)
	return
}

func (s *singleAgentImpl) Delete(ctx context.Context, agentID int64) (err error) {
	return s.SingleAgentDAO.Delete(ctx, agentID)
}

func (s *singleAgentImpl) Duplicate(ctx context.Context, agentID int64) (draft *entity.SingleAgent, err error) {
	return s.SingleAgentDAO.Duplicate(ctx, agentID)
}

func (s *singleAgentImpl) Publish(ctx context.Context, req *entity.PublishAgentRequest) (resp *entity.PublishAgentResponse, errr error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgentImpl) Query(ctx context.Context, req *entity.QueryAgentRequest) (resp *entity.QueryAgentResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgentImpl) StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (resp *entity.ExecuteResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgentImpl) GetSingleAgentDraft(ctx context.Context, botID int64) (botInfo *entity.SingleAgentDraft, err error) {
	po, err := s.SingleAgentDAO.GetAgentDraft(ctx, botID)
	if err != nil {
		return nil, err
	}

	do := singleAgentPo2Do(po)

	return do, nil
}

func (s *singleAgentImpl) UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgentDraft) (err error) {
	po := singleAgentDo2Po(agentInfo)
	return s.SingleAgentDAO.UpdateSingleAgentDraft(ctx, po)
}

func singleAgentPo2Do(po *model.SingleAgentDraft) *entity.SingleAgentDraft {
	return &entity.SingleAgentDraft{
		ID:             po.ID,
		AgentID:        po.AgentID,
		DeveloperID:    po.DeveloperID,
		SpaceID:        po.SpaceID,
		Name:           po.Name,
		Desc:           po.Desc,
		IconURI:        po.IconURI,
		CreatedAt:      po.CreatedAt,
		UpdatedAt:      po.UpdatedAt,
		DeletedAt:      po.DeletedAt,
		ModelInfo:      po.ModelInfo,
		OnboardingInfo: po.OnboardingInfo,
		Prompt:         po.Prompt,
		Plugin:         po.Plugin,
		Knowledge:      po.Knowledge,
		Workflow:       po.Workflow,
		SuggestReply:   po.SuggestReply,
		JumpConfig:     po.JumpConfig,
	}
}

func singleAgentDo2Po(do *entity.SingleAgentDraft) *model.SingleAgentDraft {
	return &model.SingleAgentDraft{
		ID:             do.ID,
		AgentID:        do.AgentID,
		DeveloperID:    do.DeveloperID,
		SpaceID:        do.SpaceID,
		Name:           do.Name,
		Desc:           do.Desc,
		IconURI:        do.IconURI,
		CreatedAt:      do.CreatedAt,
		UpdatedAt:      do.UpdatedAt,
		DeletedAt:      do.DeletedAt,
		ModelInfo:      do.ModelInfo,
		OnboardingInfo: do.OnboardingInfo,
		Prompt:         do.Prompt,
		Plugin:         do.Plugin,
		Knowledge:      do.Knowledge,
		Workflow:       do.Workflow,
		SuggestReply:   do.SuggestReply,
		JumpConfig:     do.JumpConfig,
	}
}
