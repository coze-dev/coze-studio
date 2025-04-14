package dao

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
)

type KnowledgeRepo interface {
	Create(ctx context.Context, knowledge *model.Knowledge) error
	Update(ctx context.Context, knowledge *model.Knowledge) error
	Delete(ctx context.Context, id int64) error
	MGetByID(ctx context.Context, ids []int64) ([]*model.Knowledge, error)
	FilterEnableDataset(ctx context.Context, ids []int64) ([]int64, error)
}

func NewKnowledgeDAO(db *gorm.DB) KnowledgeRepo {
	return &knowledgeDAO{db: db, query: query.Use(db)}
}

type knowledgeDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (dao *knowledgeDAO) Create(ctx context.Context, knowledge *model.Knowledge) error {
	return dao.query.Knowledge.WithContext(ctx).Create(knowledge)
}

func (dao *knowledgeDAO) Update(ctx context.Context, knowledge *model.Knowledge) error {
	k := dao.query.Knowledge
	_, err := k.WithContext(ctx).Where(k.ID.Eq(knowledge.ID)).Updates(knowledge)
	return err
}

func (dao *knowledgeDAO) Delete(ctx context.Context, id int64) error {
	k := dao.query.Knowledge
	_, err := k.WithContext(ctx).Where(k.ID.Eq(id)).Delete()
	return err
}

func (dao *knowledgeDAO) MGetByID(ctx context.Context, ids []int64) ([]*model.Knowledge, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	k := dao.query.Knowledge
	pos, err := k.WithContext(ctx).Where(k.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}

	return pos, nil
}

func (dao *knowledgeDAO) FilterEnableDataset(ctx context.Context, knowledgeIDs []int64) ([]int64, error) {
	if len(knowledgeIDs) == 0 {
		return nil, nil
	}
	var enableIDs []int64
	k := dao.query.Knowledge
	err := k.WithContext(ctx).Select(k.ID).Where(k.ID.In(knowledgeIDs...)).Where(k.Status.Eq(int32(entity.DocumentStatusEnable))).Scan(&enableIDs)
	return enableIDs, err
}
