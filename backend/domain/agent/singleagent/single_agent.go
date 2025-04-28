package singleagent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type SingleAgent interface {
	Delete(ctx context.Context, spaceID, agentID int64) (err error)
	Duplicate(ctx context.Context, req *entity.DuplicateAgentRequest) (draft *entity.SingleAgent, err error)

	Publish(ctx context.Context, req *entity.PublishAgentRequest) (resp *entity.PublishAgentResponse, err error)

	StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (events *schema.StreamReader[*entity.AgentEvent], err error)

	GetSingleAgent(ctx context.Context, agentID int64, version string) (botInfo *entity.SingleAgent, err error)

	CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (agentID int64, err error)
	UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error)
	MGetSingleAgentDraft(ctx context.Context, agentIDs []int64) (agents []*entity.SingleAgent, err error)
}
