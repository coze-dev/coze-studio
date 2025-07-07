package dao

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"gorm.io/gorm"
)

type KnowledgeDocumentUpdateConfigDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *KnowledgeDocumentUpdateConfigDAO) Create(ctx context.Context, config *model.KnowledgeDocumentUpdateConfig) error {

	return nil
}
func (dao *KnowledgeDocumentUpdateConfigDAO) GetByDocumentID(ctx context.Context, documentID int64) (*model.KnowledgeDocumentUpdateConfig, error) {
	return nil, nil
}
func (dao *KnowledgeDocumentUpdateConfigDAO) Update(ctx context.Context, mp map[string]any) error {
	return nil
}
func (dao *KnowledgeDocumentUpdateConfigDAO) Upsert(ctx context.Context, config *model.KnowledgeDocumentUpdateConfig) error {
	return nil
}
func (dao *KnowledgeDocumentUpdateConfigDAO) DeleteByDocumentID(ctx context.Context, documentID int64) error {
	return nil
}
func (dao *KnowledgeDocumentUpdateConfigDAO) DeleteByID(ctx context.Context, id int64) error {
	return nil
}
