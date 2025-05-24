package singleagent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type SingleAgent interface {
	CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (agentID int64, err error)
	MGetSingleAgentDraft(ctx context.Context, agentIDs []int64) (agents []*entity.SingleAgent, err error)
	GetSingleAgentDraft(ctx context.Context, agentID int64) (agentInfo *entity.SingleAgent, err error)
	UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error)
	DeleteAgentDraft(ctx context.Context, spaceID, agentID int64) (err error)
	UpdateAgentDraftDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error
	GetAgentDraftDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error)

	Duplicate(ctx context.Context, req *entity.DuplicateAgentRequest) (draft *entity.SingleAgent, err error)
	StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (events *schema.StreamReader[*entity.AgentEvent], err error)
	GetSingleAgent(ctx context.Context, agentID int64, version string) (botInfo *entity.SingleAgent, err error)
	ListAgentPublishHistory(ctx context.Context, agentID int64, pageIndex, pageSize int32, connectorID *int64) ([]*entity.SingleAgentPublish, error)
	// ObtainAgentByIdentity support obtain agent by connectorID and agentID
	ObtainAgentByIdentity(ctx context.Context, identity *entity.AgentIdentity) (*entity.SingleAgent, error)

	// Publish
	GetPublishedTime(ctx context.Context, agentID int64) (int64, error)
	GetPublishedInfo(ctx context.Context, agentID int64) (*entity.PublishInfo, error)
	PublishAgent(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) error
	GetPublishConnectorList(ctx context.Context, agentID int64) (*entity.PublishConnectorData, error)
}
