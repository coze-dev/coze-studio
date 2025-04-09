package dao

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
)

type KnowledgeDocumentSliceRepo interface {
	Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error

	List(ctx context.Context, documentID int64, limit int, cursor *string) (
		resp []*model.KnowledgeDocumentSlice, nextCursor *string, hasMore bool, err error)

	ListStatus(ctx context.Context, documentID int64, limit int, cursor *string) (
		resp []*model.SliceProgress, nextCursor *string, hasMore bool, err error)
}

func NewKnowledgeDocumentSliceDAO(db *gorm.DB) KnowledgeDocumentSliceRepo {
	return &knowledgeDocumentSliceDAO{db: db, query: query.Use(db)}

}

type knowledgeDocumentSliceDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (k *knowledgeDocumentSliceDAO) Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentSliceDAO) Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentSliceDAO) Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentSliceDAO) List(ctx context.Context, documentID int64, limit int, cursor *string) (resp []*model.KnowledgeDocumentSlice, nextCursor *string, hasMore bool, err error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeDocumentSliceDAO) ListStatus(ctx context.Context, documentID int64, limit int, cursor *string) (resp []*model.SliceProgress, nextCursor *string, hasMore bool, err error) {
	//TODO implement me
	panic("implement me")
}
