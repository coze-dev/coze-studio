package singleagent

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
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
