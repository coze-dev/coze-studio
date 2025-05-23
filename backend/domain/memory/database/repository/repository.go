package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewAgentToDatabaseDAO(db *gorm.DB, idGen idgen.IDGenerator) AgentToDatabaseDAO {
	return dal.NewAgentToDatabaseDAO(db, idGen)
}

type AgentToDatabaseDAO interface {
	BatchCreate(ctx context.Context, relations []*entity.AgentToDatabase) ([]int64, error)
	BatchDelete(ctx context.Context, basicRelations []*entity.AgentToDatabaseBasic) error
	ListByAgentID(ctx context.Context, agentID int64, tableType entity.TableType) ([]*entity.AgentToDatabase, error)
}

func NewDraftDatabaseDAO(db *gorm.DB, idGen idgen.IDGenerator) DraftDAO {
	return dal.NewDraftDatabaseDAO(db, idGen)
}

type DraftDAO interface {
	Get(ctx context.Context, id int64) (*entity.Database, error)
	List(ctx context.Context, filter *entity.DatabaseFilter, page *entity.Pagination, orderBy []*entity.OrderBy) ([]*entity.Database, int64, error)
	MGet(ctx context.Context, ids []int64) ([]*entity.Database, error)

	CreateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database, draftID, onlineID int64, physicalTableName string) (*entity.Database, error)
	UpdateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database) (*entity.Database, error)
	DeleteWithTX(ctx context.Context, tx *query.QueryTx, id int64) error
}

func NewOnlineDatabaseDAO(db *gorm.DB, idGen idgen.IDGenerator) OnlineDAO {
	return dal.NewOnlineDatabaseDAO(db, idGen)
}

type OnlineDAO interface {
	Get(ctx context.Context, id int64) (*entity.Database, error)
	MGet(ctx context.Context, ids []int64) ([]*entity.Database, error)
	List(ctx context.Context, filter *entity.DatabaseFilter, page *entity.Pagination, orderBy []*entity.OrderBy) ([]*entity.Database, int64, error)

	UpdateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database) (*entity.Database, error)
	CreateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database, draftID, onlineID int64, physicalTableName string) (*entity.Database, error)
	DeleteWithTX(ctx context.Context, tx *query.QueryTx, id int64) error
}
