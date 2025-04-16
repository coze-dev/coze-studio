package singleagent

import (
	"context"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/agentflow"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type singleAgentImpl struct {
	AgentDraft   *dal.SingleAgentDraftDAO
	AgentVersion *dal.SingleAgentVersionDAO

	ToolSvr      crossdomain.ToolService
	KnowledgeSvr crossdomain.Knowledge
	WorkflowSvr  crossdomain.Workflow
	VariablesSvr crossdomain.Variables
	ModelMgrSvr  crossdomain.ModelMgr
	ModelFactory chatmodel.Factory
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB

	ToolSvr      crossdomain.ToolService
	KnowledgeSvr crossdomain.Knowledge
	WorkflowSvr  crossdomain.Workflow
	VariablesSvr crossdomain.Variables
	ModelMgrSvr  crossdomain.ModelMgr
	ModelFactory chatmodel.Factory
}

func NewService(c *Components) SingleAgent {
	dao := dal.NewSingleAgentDAO(c.DB, c.IDGen)
	agentVersion := dal.NewSingleAgentVersion(c.DB, c.IDGen)

	return &singleAgentImpl{
		AgentDraft:   dao,
		AgentVersion: agentVersion,

		ToolSvr:      c.ToolSvr,
		KnowledgeSvr: c.KnowledgeSvr,
		WorkflowSvr:  c.WorkflowSvr,
		VariablesSvr: c.VariablesSvr,
		ModelMgrSvr:  c.ModelMgrSvr,
		ModelFactory: c.ModelFactory,
	}
}

func (s *singleAgentImpl) Update(ctx context.Context, draft *agentEntity.SingleAgent) (err error) {
	// return s.SingleAgentDAO.Update(ctx, draft.SingleAgent)
	return
}

func (s *singleAgentImpl) Delete(ctx context.Context, agentID int64) (err error) {
	return s.AgentDraft.Delete(ctx, agentID)
}

func (s *singleAgentImpl) Duplicate(ctx context.Context, agentID int64) (draft *agentEntity.SingleAgent, err error) {
	return s.AgentDraft.Duplicate(ctx, agentID)
}

func (s *singleAgentImpl) Publish(ctx context.Context, req *agentEntity.PublishAgentRequest) (resp *agentEntity.PublishAgentResponse, errr error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgentImpl) StreamExecute(ctx context.Context, req *agentEntity.ExecuteRequest) (events *schema.StreamReader[*agentEntity.AgentEvent], err error) {

	ae, err := s.queryAgentEntity(ctx, req.Identity)
	if err != nil {
		return nil, err
	}

	conf := &agentflow.Config{
		Agent: ae,

		ToolSvr:      s.ToolSvr,
		KnowledgeSvr: s.KnowledgeSvr,
		WorkflowSvr:  s.WorkflowSvr,
		VariablesSvr: s.VariablesSvr,
		ModelMgrSvr:  s.ModelMgrSvr,
		ModelFactory: s.ModelFactory,
	}
	rn, err := agentflow.BuildAgent(ctx, conf)
	if err != nil {
		return nil, err
	}

	exeReq := &agentflow.AgentRequest{
		Input:   req.Input,
		History: req.History,
	}
	return rn.StreamExecute(ctx, exeReq)
}

func (s *singleAgentImpl) GetSingleAgentDraft(ctx context.Context, botID int64) (botInfo *agentEntity.SingleAgent, err error) {
	po, err := s.AgentDraft.GetAgentDraft(ctx, botID)
	if err != nil {
		return nil, err
	}

	do := singleAgentDraftPo2Do(po)

	return do, nil
}

func (s *singleAgentImpl) UpdateSingleAgentDraft(ctx context.Context, agentInfo *agentEntity.SingleAgent) (err error) {
	po := singleAgentDraftDo2Po(agentInfo)
	return s.AgentDraft.UpdateSingleAgentDraft(ctx, po)
}

func singleAgentDraftPo2Do(po *model.SingleAgentDraft) *agentEntity.SingleAgent {
	return &agentEntity.SingleAgent{
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
		Variable:       po.Variable,
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

func singleAgentVersionPo2Do(po *model.SingleAgentVersion) *agentEntity.SingleAgent {
	return &agentEntity.SingleAgent{
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
		Variable:       po.Variable,
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

func singleAgentDraftDo2Po(do *agentEntity.SingleAgent) *model.SingleAgentDraft {
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
		Variable:       do.Variable,
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

func (s *singleAgentImpl) CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *agentEntity.SingleAgent) (agentID int64, err error) {
	po := singleAgentDraftDo2Po(draft)
	return s.AgentDraft.Create(ctx, creatorID, po)
}

func (s *singleAgentImpl) queryAgentEntity(ctx context.Context, identity *agentEntity.AgentIdentity) (*agentEntity.SingleAgent, error) {
	if identity.State == agentEntity.AgentStateOfPublished {
		if identity.Version != "" {
			sav, err := s.AgentVersion.GetAgentVersion(ctx, identity.AgentID, identity.Version)
			if err != nil {
				return nil, err
			}
			return singleAgentVersionPo2Do(sav), nil
		}

		sav, err := s.AgentVersion.GetAgentLatest(ctx, identity.AgentID)
		if err != nil {
			return nil, err
		}
		return singleAgentVersionPo2Do(sav), nil
	}

	sav, err := s.AgentDraft.GetAgentDraft(ctx, identity.AgentID)
	if err != nil {
		return nil, err
	}
	return singleAgentDraftPo2Do(sav), nil
}
