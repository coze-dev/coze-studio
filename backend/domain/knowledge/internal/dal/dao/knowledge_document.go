package dao

import (
	"context"
	"strconv"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
)

type KnowledgeDocumentRepo interface {
	Create(ctx context.Context, document *model.KnowledgeDocument) error
	Update(ctx context.Context, document *model.KnowledgeDocument) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, knowledgeID int64, name *string, limit int, cursor *string) (
		resp []*model.KnowledgeDocument, nextCursor *string, hasMore bool, err error)
	MGetByID(ctx context.Context, ids []int64) ([]*model.KnowledgeDocument, error)
}

func NewKnowledgeDocumentDAO(db *gorm.DB) KnowledgeDocumentRepo {
	return &knowledgeDocumentDAO{db: db, query: query.Use(db)}
}

type knowledgeDocumentDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (dao *knowledgeDocumentDAO) Create(ctx context.Context, document *model.KnowledgeDocument) error {
	return dao.query.KnowledgeDocument.WithContext(ctx).Create(document)
}

func (dao *knowledgeDocumentDAO) Update(ctx context.Context, document *model.KnowledgeDocument) error {
	_, err := dao.query.KnowledgeDocument.WithContext(ctx).Updates(document)
	return err
}

func (dao *knowledgeDocumentDAO) Delete(ctx context.Context, id int64) error {
	k := dao.query.KnowledgeDocument
	_, err := k.WithContext(ctx).Where(k.ID.Eq(id)).Delete()
	return err
}

func (dao *knowledgeDocumentDAO) List(ctx context.Context, knowledgeID int64, name *string, limit int, cursor *string) (
	pos []*model.KnowledgeDocument, nextCursor *string, hasMore bool, err error) {
	k := dao.query.KnowledgeDocument

	do := k.WithContext(ctx).
		Where(k.KnowledgeID.Eq(knowledgeID))

	if name != nil {
		do.Where(k.Name.Like(*name))
	}

	// 目前未按 updated_at 排序
	if cursor != nil {
		id, err := dao.fromCursor(*cursor)
		if err != nil {
			return nil, nil, false, err
		}
		do.Where(k.ID.Lt(id))
	}

	pos, err = do.Limit(limit).Order(k.ID.Desc()).Find()
	if err != nil {
		return nil, nil, false, err
	}

	if len(pos) == 0 {
		return nil, nil, false, nil
	}

	hasMore = len(pos) == limit
	nextCursor = dao.toCursor(pos[len(pos)-1].ID)

	return pos, nextCursor, hasMore, err
}

func (dao *knowledgeDocumentDAO) MGetByID(ctx context.Context, ids []int64) ([]*model.KnowledgeDocument, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	k := dao.query.KnowledgeDocument
	pos, err := k.WithContext(ctx).Where(k.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}

	return pos, err
}

func (dao *knowledgeDocumentDAO) fromCursor(cursor string) (id int64, err error) {
	id, err = strconv.ParseInt(cursor, 10, 64)
	return
}

func (dao *knowledgeDocumentDAO) toCursor(id int64) *string {
	c := strconv.FormatInt(id, 10)
	return &c
}
