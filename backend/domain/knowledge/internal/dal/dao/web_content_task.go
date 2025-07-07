package dao

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"gorm.io/gorm"
)

type WebCrawlTaskDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *WebCrawlTaskDAO) Create(ctx context.Context, task *model.WebCrawlTask) error {
	return nil
}
func (dao *WebCrawlTaskDAO) GetByID(ctx context.Context, id int64) (*model.WebCrawlTask, error) {
	return nil, nil
}
func (dao *WebCrawlTaskDAO) Update(ctx context.Context, mp map[string]any) error {
	return nil
}
func (dao *WebCrawlTaskDAO) Upsert(ctx context.Context, task *model.WebCrawlTask) error {
	return nil
}
