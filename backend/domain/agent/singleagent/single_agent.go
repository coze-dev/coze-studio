package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type SingleAgent interface {
	Create(ctx context.Context, draft *entity.SingleAgent) (draftID int64, err error)
	Update(ctx context.Context, draft *entity.SingleAgent) (err error)
	Delete(ctx context.Context, agentID int64) (err error)
	Duplicate(ctx context.Context, agentID int64) (draft *entity.SingleAgent, err error)
	Publish(ctx context.Context, req *entity.PublishAgentRequest) (resp *entity.PublishAgentResponse, err error)
	Query(ctx context.Context, req *entity.QueryAgentRequest) (resp *entity.QueryAgentResponse, err error)
	StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (resp *entity.ExecuteResponse, err error)
}
