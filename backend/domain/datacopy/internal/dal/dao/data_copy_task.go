package dao

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/query"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DataCopyTaskRepo interface {
	UpsertCopyTask(ctx context.Context, task *model.DataCopyTask) error
	UpsertCopyTaskWithTX(ctx context.Context, task *model.DataCopyTask, tx *gorm.DB) error
	GetCopyTaskByTaskID(ctx context.Context, taskID string) (*model.DataCopyTask, error)
}
type dataCopyTaskDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewDataCopyTaskDAO(db *gorm.DB) DataCopyTaskRepo {
	return &dataCopyTaskDAO{db: db, query: query.Use(db)}
}

func (dao *dataCopyTaskDAO) UpsertCopyTask(ctx context.Context, task *model.DataCopyTask) error {
	return dao.query.DataCopyTask.WithContext(ctx).Debug().Clauses(
		clause.OnConflict{
			UpdateAll: true,
		},
	).Create(task)
}

func (dao *dataCopyTaskDAO) GetCopyTaskByTaskID(ctx context.Context, taskID string) (*model.DataCopyTask, error) {
	return dao.query.DataCopyTask.WithContext(ctx).Debug().Where(dao.query.DataCopyTask.MasterTaskID.Eq(taskID)).First()
}

func (dao *dataCopyTaskDAO) UpsertCopyTaskWithTX(ctx context.Context, task *model.DataCopyTask, tx *gorm.DB) error {
	return tx.WithContext(ctx).Model(&model.DataCopyTask{}).Debug().Clauses(
		clause.OnConflict{
			UpdateAll: true,
		},
	).Create(task).Error
}
