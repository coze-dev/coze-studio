package dao

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
)

type WebCrawlTaskDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *WebCrawlTaskDAO) BatchCreate(ctx context.Context, tasks []*model.WebCrawlTask) error {
	return dao.Query.WebCrawlTask.WithContext(ctx).CreateInBatches(tasks, len(tasks))
}

func (dao *WebCrawlTaskDAO) Create(ctx context.Context, task *model.WebCrawlTask) error {
	return dao.Query.WebCrawlTask.WithContext(ctx).Create(task)
}
func (dao *WebCrawlTaskDAO) GetByID(ctx context.Context, id int64) (*model.WebCrawlTask, error) {
	task, err := dao.Query.WebCrawlTask.WithContext(ctx).Where(dao.Query.WebCrawlTask.ID.Eq(id)).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return task, nil
}
func (dao *WebCrawlTaskDAO) Update(ctx context.Context, id int64, mp map[string]any) error {
	_, err := dao.Query.WebCrawlTask.WithContext(ctx).Where(dao.Query.WebCrawlTask.ID.Eq(id)).Updates(mp)
	return err
}
func (dao *WebCrawlTaskDAO) Upsert(ctx context.Context, task *model.WebCrawlTask) error {
	return dao.Query.WebCrawlTask.WithContext(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(task)
}

func (dao *WebCrawlTaskDAO) BatchGetByID(ctx context.Context, ids []int64) ([]*model.WebCrawlTask, error) {
	tasks, err := dao.Query.WebCrawlTask.WithContext(ctx).Where(dao.Query.WebCrawlTask.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}
	return tasks, nil
}

func (dao *WebCrawlTaskDAO) DeleteByID(ctx context.Context, id int64) error {
	_, err := dao.Query.WebCrawlTask.WithContext(ctx).Where(dao.Query.WebCrawlTask.ID.Eq(id)).Delete()
	return err
}

func (dao *WebCrawlTaskDAO) BatchUpdate(ctx context.Context, ids []int64, mp map[string]any) error {
	_, err := dao.Query.WebCrawlTask.WithContext(ctx).Where(dao.Query.WebCrawlTask.ID.In(ids...)).Updates(mp)
	return err
}
