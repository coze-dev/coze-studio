package repository

import (
	"context"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewSingleAgentRepo(db *gorm.DB, idGen idgen.IDGenerator, cli *redis.Client) SingleAgentDraftRepo {
	repo := dal.NewSingleAgentDraftDAO(db, idGen, cli)
	return repo
}

func NewSingleAgentVersionRepo(db *gorm.DB, idGen idgen.IDGenerator) SingleAgentVersionRepo {
	repo := dal.NewSingleAgentVersion(db, idGen)
	return repo
}

type SingleAgentDraftRepo interface {
	Create(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (draftID int64, err error)
	Get(ctx context.Context, agentID int64) (*entity.SingleAgent, error)
	MGet(ctx context.Context, agentIDs []int64) ([]*entity.SingleAgent, error)
	Delete(ctx context.Context, spaceID, agentID int64) (err error)
	Update(ctx context.Context, agentInfo *entity.SingleAgent) (err error)

	GetDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error)
	UpdateDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error
}

type SingleAgentVersionRepo interface {
	Create(ctx context.Context, e *entity.SingleAgentPublish) (int64, error)
	GetLatest(ctx context.Context, agentID int64) (*entity.SingleAgent, error)
	Get(ctx context.Context, agentID int64, version string) (*entity.SingleAgent, error)
	List(ctx context.Context, agentID int64, pageIndex, pageSize int32) ([]*entity.SingleAgentPublish, error)
	PublishAgent(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) (err error)
	GetConnectorInfos(ctx context.Context, connectorIDs []int64) ([]*entity.ConnectorInfo, error)
}
