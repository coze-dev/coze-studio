package dao

import (
	"context"
	"errors"
	"strconv"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type KnowledgeDocumentDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *KnowledgeDocumentDAO) Create(ctx context.Context, document *model.KnowledgeDocument) error {
	return dao.Query.KnowledgeDocument.WithContext(ctx).Create(document)
}

func (dao *KnowledgeDocumentDAO) Update(ctx context.Context, document *model.KnowledgeDocument) error {
	document.UpdatedAt = time.Now().UnixMilli()
	_, err := dao.Query.KnowledgeDocument.WithContext(ctx).Updates(document)
	return err
}

func (dao *KnowledgeDocumentDAO) Delete(ctx context.Context, id int64) error {
	k := dao.Query.KnowledgeDocument
	_, err := k.WithContext(ctx).Where(k.ID.Eq(id)).Delete()
	return err
}

func (dao *KnowledgeDocumentDAO) List(ctx context.Context, knowledgeID int64, name *string, limit int, cursor *string) (
	pos []*model.KnowledgeDocument, nextCursor *string, hasMore bool, err error) {
	k := dao.Query.KnowledgeDocument

	do := k.WithContext(ctx).
		Where(k.KnowledgeID.Eq(knowledgeID))

	if name != nil {
		do.Where(k.Name.Like(*name))
	}
	// 疑问，document现在还是软删除吗，如果是软删除，这里应该是否应该是只删除未被删除的文档
	do.Where(k.Status.NotIn(int32(entity.DocumentStatusDeleted)))

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

func (dao *KnowledgeDocumentDAO) MGetByID(ctx context.Context, ids []int64) ([]*model.KnowledgeDocument, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	k := dao.Query.KnowledgeDocument
	pos, err := k.WithContext(ctx).Where(k.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}

	return pos, err
}

func (dao *KnowledgeDocumentDAO) fromCursor(cursor string) (id int64, err error) {
	id, err = strconv.ParseInt(cursor, 10, 64)
	return
}

func (dao *KnowledgeDocumentDAO) toCursor(id int64) *string {
	c := strconv.FormatInt(id, 10)
	return &c
}

func (dao *KnowledgeDocumentDAO) FindDocumentByCondition(ctx context.Context, opts *entity.WhereDocumentOpt) ([]*model.KnowledgeDocument, int64, error) {
	k := dao.Query.KnowledgeDocument
	do := k.WithContext(ctx)
	if opts == nil {
		return nil, 0, nil
	}
	if len(opts.IDs) == 0 && len(opts.KnowledgeIDs) == 0 {
		return nil, 0, errors.New("need ids or knowledge_ids")
	}
	if opts.CreatorID > 0 {
		do = do.Where(k.CreatorID.Eq(opts.CreatorID))
	}
	if len(opts.IDs) > 0 {
		do = do.Where(k.ID.In(opts.IDs...))
	}
	if len(opts.KnowledgeIDs) > 0 {
		do = do.Where(k.KnowledgeID.In(opts.KnowledgeIDs...))
	}
	if len(opts.StatusIn) > 0 {
		do = do.Where(k.Status.In(opts.StatusIn...))
	}
	if len(opts.StatusNotIn) > 0 {
		do = do.Where(k.Status.NotIn(opts.StatusNotIn...))
	}
	if opts.SelectAll {
		do = do.Limit(-1)
	} else {
		if opts.Limit != 0 {
			do = do.Limit(opts.Limit)
		}
	}
	if opts.Offset != nil {
		do = do.Offset(ptr.From(opts.Offset))
	}
	if opts.Cursor != nil {
		id, err := dao.fromCursor(ptr.From(opts.Cursor))
		if err != nil {
			return nil, 0, err
		}
		do = do.Where(k.ID.Lt(id)).Order(k.ID.Desc())
	}
	resp, err := do.Find()
	if err != nil {
		return nil, 0, err
	}
	total, err := do.Limit(-1).Count()
	if err != nil {
		return nil, 0, err
	}
	return resp, total, nil
}

func (dao *KnowledgeDocumentDAO) DeleteDocuments(ctx context.Context, ids []int64) error {
	tx := dao.DB.Begin()
	var err error
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()
	// 删除document
	err = tx.WithContext(ctx).Model(&model.KnowledgeDocument{}).Where("id in ?", ids).Delete(&model.KnowledgeDocument{}).Error
	if err != nil {
		return err
	}
	// 删除document_slice
	err = tx.WithContext(ctx).Model(&model.KnowledgeDocumentSlice{}).Where("document_id in?", ids).Delete(&model.KnowledgeDocumentSlice{}).Error
	if err != nil {
		return err
	}
	return nil
}

func (dao *KnowledgeDocumentDAO) SetStatus(ctx context.Context, documentID int64, status int32, reason string) error {
	k := dao.Query.KnowledgeDocument
	if len(reason) > 255 { // TODO: tinytext 换成 text ?
		reason = reason[:255]
	}
	d := &model.KnowledgeDocument{Status: status, FailReason: reason, UpdatedAt: time.Now().UnixMilli()}
	_, err := k.WithContext(ctx).Debug().Where(k.ID.Eq(documentID)).Updates(d)
	return err
}

func (dao *KnowledgeDocumentDAO) CreateWithTx(ctx context.Context, tx *gorm.DB, documents []*model.KnowledgeDocument) error {
	if len(documents) == 0 {
		return nil
	}
	// todo，要不要做限制，行数限制等
	tx = tx.WithContext(ctx).Debug().CreateInBatches(documents, len(documents))
	return tx.Error
}

func (dao *KnowledgeDocumentDAO) GetByID(ctx context.Context, id int64) (*model.KnowledgeDocument, error) {
	k := dao.Query.KnowledgeDocument
	document, err := k.WithContext(ctx).Where(k.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return document, nil
}

func (dao *KnowledgeDocumentDAO) UpdateDocumentSliceInfo(ctx context.Context, documentID int64) error {
	s := dao.Query.KnowledgeDocumentSlice
	var err error
	var sliceCount int64
	var totalSize *int64
	sliceCount, err = s.WithContext(ctx).Debug().Where(s.DocumentID.Eq(documentID)).Count()
	if err != nil {
		return err
	}
	err = dao.DB.Raw("SELECT SUM(CHAR_LENGTH(content)) FROM knowledge_document_slice WHERE document_id = ? AND deleted_at IS NULL", documentID).Scan(&totalSize).Error
	if err != nil {
		return err
	}
	k := dao.Query.KnowledgeDocument
	updates := map[string]any{}
	updates[k.SliceCount.ColumnName().String()] = sliceCount
	if totalSize != nil {
		updates[k.Size.ColumnName().String()] = ptr.From(totalSize)
	}
	updates[k.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()
	_, err = k.WithContext(ctx).Debug().Where(k.ID.Eq(documentID)).Updates(updates)
	return err
}
