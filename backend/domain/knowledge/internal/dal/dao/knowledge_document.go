/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package dao

import (
	"context"
	"errors"
	"strconv"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
	err := dao.Query.KnowledgeDocument.WithContext(ctx).Save(document)
	return err
}

func (dao *KnowledgeDocumentDAO) Delete(ctx context.Context, id int64) error {
	k := dao.Query.KnowledgeDocument
	_, err := k.WithContext(ctx).Where(k.ID.Eq(id)).Delete()
	return err
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
		if opts.Offset != nil {
			do = do.Offset(ptr.From(opts.Offset))
		}
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
	total, err := do.Limit(-1).Offset(-1).Count()
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
	// Delete document
	err = tx.WithContext(ctx).Model(&model.KnowledgeDocument{}).Where("id in ?", ids).Delete(&model.KnowledgeDocument{}).Error
	if err != nil {
		return err
	}
	// Delete document_slice
	err = tx.WithContext(ctx).Model(&model.KnowledgeDocumentSlice{}).Where("document_id in?", ids).Delete(&model.KnowledgeDocumentSlice{}).Error
	if err != nil {
		return err
	}
	return nil
}

func (dao *KnowledgeDocumentDAO) SetStatus(ctx context.Context, documentID int64, status int32, reason string) error {
	k := dao.Query.KnowledgeDocument
	d := &model.KnowledgeDocument{Status: status, FailReason: reason, UpdatedAt: time.Now().UnixMilli()}
	_, err := k.WithContext(ctx).Debug().Where(k.ID.Eq(documentID)).Updates(d)
	return err
}

func (dao *KnowledgeDocumentDAO) CreateWithTx(ctx context.Context, tx *gorm.DB, documents []*model.KnowledgeDocument) error {
	if len(documents) == 0 {
		return nil
	}
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
