package dao

import (
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/query"
)

type DataCopyTaskRepo interface {
	UpsertCopyTask(ctx context.Context, task *model.DataCopyTask) error
	UpsertCopyTaskWithTX(ctx context.Context, task *model.DataCopyTask, tx *gorm.DB) error
	GetCopyTask(ctx context.Context, taskID string, originDataID int64, dataType int32) (*model.DataCopyTask, error)
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

func (dao *dataCopyTaskDAO) GetCopyTask(ctx context.Context, taskID string, originDataID int64, dataType int32) (*model.DataCopyTask, error) {
	q := dao.query.DataCopyTask
	return q.WithContext(ctx).Debug().Where(q.MasterTaskID.Eq(taskID)).Where(q.OriginDataID.Eq(originDataID)).Where(q.DataType.Eq(dataType)).First()
}

func (dao *dataCopyTaskDAO) UpsertCopyTaskWithTX(ctx context.Context, task *model.DataCopyTask, tx *gorm.DB) error {
	return tx.WithContext(ctx).Model(&model.DataCopyTask{}).Debug().Clauses(
		clause.OnConflict{
			// UpdateAll: true,
			Columns: []clause.Column{},
		},
	).Create(task).Error
}
