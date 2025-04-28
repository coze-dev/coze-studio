package singleagent

import (
	"context"
	"fmt"
	"math/rand"
	"strconv"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/agentflow"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type singleAgentImpl struct {
	AgentDraftDAO   *dal.SingleAgentDraftDAO
	AgentVersionDAO *dal.SingleAgentVersionDAO

	ToolSvr           crossdomain.PluginService
	KnowledgeSvr      crossdomain.Knowledge
	WorkflowSvr       crossdomain.Workflow
	VariablesSvr      crossdomain.Variables
	DomainNotifierSvr crossdomain.DomainNotifier
	ModelMgrSvr       crossdomain.ModelMgr
	ModelFactory      chatmodel.Factory
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB

	ToolSvr           crossdomain.PluginService
	KnowledgeSvr      crossdomain.Knowledge
	WorkflowSvr       crossdomain.Workflow
	VariablesSvr      crossdomain.Variables
	DomainNotifierSvr crossdomain.DomainNotifier
	ModelMgrSvr       crossdomain.ModelMgr
	ModelFactory      chatmodel.Factory
}

func NewService(c *Components) SingleAgent {
	dao := dal.NewSingleAgentDAO(c.DB, c.IDGen)
	agentVersion := dal.NewSingleAgentVersion(c.DB, c.IDGen)

	return &singleAgentImpl{
		AgentDraftDAO:   dao,
		AgentVersionDAO: agentVersion,

		ToolSvr:           c.ToolSvr,
		KnowledgeSvr:      c.KnowledgeSvr,
		WorkflowSvr:       c.WorkflowSvr,
		VariablesSvr:      c.VariablesSvr,
		DomainNotifierSvr: c.DomainNotifierSvr,
		ModelMgrSvr:       c.ModelMgrSvr,
		ModelFactory:      c.ModelFactory,
	}
}

func (s *singleAgentImpl) Update(ctx context.Context, draft *agentEntity.SingleAgent) (err error) {
	// return s.SingleAgentDAO.Update(ctx, draft.SingleAgent)
	return
}

func (s *singleAgentImpl) Delete(ctx context.Context, spaceID, agentID int64) (err error) {
	return s.AgentDraftDAO.Delete(ctx, spaceID, agentID)
}

func (s *singleAgentImpl) Duplicate(ctx context.Context, req *agentEntity.DuplicateAgentRequest) (draft *agentEntity.SingleAgent, err error) {

	srcAgents, err := s.MGetSingleAgentDraft(ctx, []int64{req.AgentID})
	if err != nil {
		return nil, err
	}

	if len(srcAgents) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound,
			errorx.KV("type", "agent"), errorx.KV("id", strconv.FormatInt(req.AgentID, 10)))
	}

	srcAgent := srcAgents[0]

	copySuffixNum := rand.Intn(1000)
	srcAgent.ID = 0
	srcAgent.Name = fmt.Sprintf("%v%03d", srcAgent.Name, copySuffixNum)
	srcAgent.SpaceID = req.SpaceID
	srcAgent.DeveloperID = req.UserID

	agentID, err := s.CreateSingleAgentDraft(ctx, req.UserID, srcAgent)
	if err != nil {
		return nil, err
	}

	srcAgent.AgentID = agentID

	return srcAgent, nil
}

func (s *singleAgentImpl) Publish(ctx context.Context, req *agentEntity.PublishAgentRequest) (resp *agentEntity.PublishAgentResponse, errr error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgentImpl) MGetSingleAgentDraft(ctx context.Context, agentIDs []int64) (agents []*agentEntity.SingleAgent, err error) {
	return s.AgentDraftDAO.MGetAgentDraft(ctx, agentIDs)
}

func (s *singleAgentImpl) StreamExecute(ctx context.Context, req *agentEntity.ExecuteRequest) (events *schema.StreamReader[*agentEntity.AgentEvent], err error) {
	ae, err := s.queryAgentEntity(ctx, req.Identity)
	if err != nil {
		return nil, err
	}

	conf := &agentflow.Config{
		Agent: ae,

		PluginSvr:    s.ToolSvr,
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

func (s *singleAgentImpl) GetSingleAgent(ctx context.Context, agentID int64, version string) (botInfo *agentEntity.SingleAgent, err error) {
	id := &agentEntity.AgentIdentity{
		AgentID: agentID,
		Version: version,
	}
	agentInfo, err := s.queryAgentEntity(ctx, id)
	if err != nil {
		return nil, err
	}

	return agentInfo, nil
}

func (s *singleAgentImpl) UpdateSingleAgentDraft(ctx context.Context, agentInfo *agentEntity.SingleAgent) (err error) {
	return s.AgentDraftDAO.UpdateSingleAgentDraft(ctx, agentInfo)
}

func (s *singleAgentImpl) CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *agentEntity.SingleAgent) (
	agentID int64, err error) {
	return s.AgentDraftDAO.Create(ctx, creatorID, draft)
}

func (s *singleAgentImpl) queryAgentEntity(ctx context.Context, identity *agentEntity.AgentIdentity) (*agentEntity.SingleAgent, error) {
	if !identity.IsDraft() {
		return s.AgentVersionDAO.GetAgentVersion(ctx, identity.AgentID, identity.Version)
	}

	return s.AgentDraftDAO.GetAgentDraft(ctx, identity.AgentID)
}
