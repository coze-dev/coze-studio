package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type SingleAgent interface {
	Delete(ctx context.Context, agentID int64) (err error)
	Duplicate(ctx context.Context, agentID int64) (draft *entity.SingleAgent, err error)
	Publish(ctx context.Context, req *entity.PublishAgentRequest) (resp *entity.PublishAgentResponse, err error)
	Query(ctx context.Context, req *entity.QueryAgentRequest) (resp *entity.QueryAgentResponse, err error)
	StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (resp *entity.ExecuteResponse, err error)

	CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (agentID int64, err error)
	GetSingleAgentDraft(ctx context.Context, botID int64) (botInfo *entity.SingleAgent, err error)
	UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error)
}
