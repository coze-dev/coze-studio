package dao

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
)

type KnowledgeDocumentRepo interface {
	Create(ctx context.Context, document *model.KnowledgeDocument) error
	Update(ctx context.Context, document *model.KnowledgeDocument) error
	Delete(ctx context.Context, id int64) error
	MGetByID(ctx context.Context, ids []int64) ([]*model.KnowledgeDocument, error)
}

func NewKnowledgeDocumentDAO(db *gorm.DB) KnowledgeDocumentRepo {
	return &knowledgeDocumentDAO{db: db, query: query.Use(db)}
}

type knowledgeDocumentDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (k *knowledgeDocumentDAO) Create(ctx context.Context, document *model.KnowledgeDocument) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentDAO) Update(ctx context.Context, document *model.KnowledgeDocument) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentDAO) Delete(ctx context.Context, id int64) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentDAO) MGetByID(ctx context.Context, ids []int64) ([]*model.KnowledgeDocument, error) {
	//TODO implement me
	panic("implement me")
}
