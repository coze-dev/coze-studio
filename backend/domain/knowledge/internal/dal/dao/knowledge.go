package dao

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
)

type KnowledgeRepo interface {
	Create(ctx context.Context, knowledge *model.Knowledge) error
	Update(ctx context.Context, knowledge *model.Knowledge) error
	Delete(ctx context.Context, id int64) error
	MGetByID(ctx context.Context, ids []int64) ([]*model.Knowledge, error)
}

func NewKnowledgeDAO(db *gorm.DB) KnowledgeRepo {
	return &knowledgeDAO{db: db, query: query.Use(db)}
}

type knowledgeDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (k *knowledgeDAO) Create(ctx context.Context, knowledge *model.Knowledge) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDAO) Update(ctx context.Context, knowledge *model.Knowledge) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDAO) Delete(ctx context.Context, id int64) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDAO) MGetByID(ctx context.Context, ids []int64) ([]*model.Knowledge, error) {
	//TODO implement me
	panic("implement me")
}
