package dao

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/internal/dal/query"
	"gorm.io/gorm"
)

type DataCopyTaskRepo interface {
	CreateCopyTask(ctx context.Context, task *model.DataCopyTask) error
	UpdateCopyTaskStatus(ctx context.Context, ID int64, status int32, errMsg string, ext string) error
	GetCopyTaskByTaskID(ctx context.Context, taskID string) (*model.DataCopyTask, error)
}
type dataCopyTaskDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewDataCopyTaskDAO(db *gorm.DB) DataCopyTaskRepo {
	return &dataCopyTaskDAO{db: db, query: query.Use(db)}
}

func (dao *dataCopyTaskDAO) CreateCopyTask(ctx context.Context, task *model.DataCopyTask) error {
	return dao.query.DataCopyTask.WithContext(ctx).Debug().Create(task)
}

func (dao *dataCopyTaskDAO) UpdateCopyTaskStatus(ctx context.Context, ID int64, status int32, errMsg string, ext string) error {
	_, err := dao.query.DataCopyTask.WithContext(ctx).Debug().Where(dao.query.DataCopyTask.ID.Eq(ID)).Updates(map[string]interface{}{
		"status":    status,
		"error_msg": errMsg,
		"ext_info":  ext,
	})
	return err
}

func (dao *dataCopyTaskDAO) GetCopyTaskByTaskID(ctx context.Context, taskID string) (*model.DataCopyTask, error) {
	return dao.query.DataCopyTask.WithContext(ctx).Debug().Where(dao.query.DataCopyTask.MasterTaskID.Eq(taskID)).First()
}
