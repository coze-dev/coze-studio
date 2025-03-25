package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/orm"
)

type Config struct {
	IDGen idgen.IDGenerator
	DB    *orm.DB
}

func New(ctx context.Context, conf *Config) (SingleAgent, error) {
	return &singleAgent{
		idGen:   conf.IDGen,
		dbQuery: query.Use(conf.DB),
	}, nil
}

type singleAgent struct {
	idGen idgen.IDGenerator
	db    *orm.DB

	dbQuery *query.Query
}

func (s *singleAgent) Create(ctx context.Context, req *CreateAgentRequest) (resp *CreateAgentResponse, err error) {

	// TODO implement me
	panic("implement me")
}

func (s *singleAgent) Update(ctx context.Context, req *UpdateAgentRequest) (resp *UpdateAgentResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgent) Delete(ctx context.Context, req *DeleteAgentRequest) (resp *DeleteAgentResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgent) Duplicate(ctx context.Context, req *DuplicateAgentRequest) (resp *DuplicateAgentResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (s *singleAgent) Execute(ctx context.Context, req *ChatRequest) (resp *ChatResponse, err error) {
	// TODO implement me
	panic("implement me")
}
