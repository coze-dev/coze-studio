package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewRunRecordRepo(db *gorm.DB, idGen idgen.IDGenerator) RunRecordRepo {

	return dal.NewRunRecordDAO(db, idGen)
}

type RunRecordRepo interface {
	Create(ctx context.Context, runMeta *entity.AgentRunMeta) (*entity.RunRecordMeta, error)
	GetByID(ctx context.Context, id int64) (*model.RunRecord, error)
	Delete(ctx context.Context, id []int64) error
	UpdateByID(ctx context.Context, id int64, columns map[string]interface{}) error
	List(ctx context.Context, conversationID int64, sectionID int64, limit int64) ([]*model.RunRecord, error)
}
