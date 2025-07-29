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
	"fmt"
	"sync"
	"time"

	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type KnowledgeDocumentSliceDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *KnowledgeDocumentSliceDAO) Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	return dao.Query.KnowledgeDocumentSlice.WithContext(ctx).Create(slice)
}

func (dao *KnowledgeDocumentSliceDAO) Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	s := dao.Query.KnowledgeDocumentSlice
	slice.UpdatedAt = time.Now().UnixMilli()
	err := s.WithContext(ctx).Save(slice)
	return err
}

func (dao *KnowledgeDocumentSliceDAO) BatchCreate(ctx context.Context, slices []*model.KnowledgeDocumentSlice) error {
	return dao.Query.KnowledgeDocumentSlice.WithContext(ctx).CreateInBatches(slices, 100)
}

func (dao *KnowledgeDocumentSliceDAO) BatchSetStatus(ctx context.Context, ids []int64, status int32, reason string) error {
	s := dao.Query.KnowledgeDocumentSlice
	updates := map[string]any{s.Status.ColumnName().String(): status}
	updates[s.FailReason.ColumnName().String()] = reason
	updates[s.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()
	_, err := s.WithContext(ctx).Where(s.ID.In(ids...)).Updates(updates)
	return err
}

func (dao *KnowledgeDocumentSliceDAO) Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	s := dao.Query.KnowledgeDocumentSlice
	_, err := s.WithContext(ctx).Where(s.ID.Eq(slice.ID)).Delete()
	return err
}

func (dao *KnowledgeDocumentSliceDAO) DeleteByDocument(ctx context.Context, documentID int64) error {
	s := dao.Query.KnowledgeDocumentSlice
	_, err := s.WithContext(ctx).Where(s.DocumentID.Eq(documentID)).Delete()
	return err
}

func (dao *KnowledgeDocumentSliceDAO) List(ctx context.Context, knowledgeID int64, documentID int64, limit int) (
	pos []*model.KnowledgeDocumentSlice, hasMore bool, err error) {

	do, err := dao.listDo(ctx, knowledgeID, documentID)
	if err != nil {
		return nil, false, err
	}
	if limit == -1 {
		var (
			lastID    int64 = 0
			batchSize       = 100
		)
		for {
			sliceArr, _, err := dao.listBatch(ctx, knowledgeID, documentID, batchSize, lastID)
			if err != nil {
				return nil, false, err
			}
			if len(sliceArr) == 0 {
				break
			}
			pos = append(pos, sliceArr...)
			lastID = sliceArr[len(sliceArr)-1].ID
		}
		return pos, false, nil
	} else {
		pos, err = do.Limit(limit).Find()
		if err != nil {
			return nil, false, err
		}

		if len(pos) == 0 {
			return nil, false, nil
		}

		hasMore = len(pos) == limit

		return pos, hasMore, err
	}
}

func (dao *KnowledgeDocumentSliceDAO) listBatch(ctx context.Context, knowledgeID int64, documentID int64, batchSize int, lastID int64) (
	pos []*model.KnowledgeDocumentSlice, hasMore bool, err error) {

	if batchSize <= 0 {
		batchSize = 100 // 默认批量大小
	}

	do, err := dao.listDo(ctx, knowledgeID, documentID)
	if err != nil {
		return nil, false, err
	}

	if lastID > 0 {
		do = do.Where(dao.Query.KnowledgeDocumentSlice.ID.Gt(lastID))
	}

	pos, err = do.Debug().Limit(batchSize).Order(dao.Query.KnowledgeDocumentSlice.ID.Asc()).Find()
	if err != nil {
		return nil, false, err
	}

	hasMore = len(pos) == batchSize

	return pos, hasMore, nil
}

func (dao *KnowledgeDocumentSliceDAO) listDo(ctx context.Context, knowledgeID int64, documentID int64) (
	query.IKnowledgeDocumentSliceDo, error) {

	s := dao.Query.KnowledgeDocumentSlice
	do := s.WithContext(ctx)
	if documentID != 0 {
		do = do.Where(s.DocumentID.Eq(documentID))
	}
	if knowledgeID != 0 {
		do = do.Where(s.KnowledgeID.Eq(knowledgeID))
	}

	return do, nil
}

func (dao *KnowledgeDocumentSliceDAO) GetDocumentSliceIDs(ctx context.Context, docIDs []int64) (sliceIDs []int64, err error) {
	if len(docIDs) == 0 {
		return nil, errors.New("empty document ids")
	}
	// doc可能会有很多slice，所以批量处理
	sliceIDs = make([]int64, 0)
	var mu sync.Mutex
	errGroup, ctx := errgroup.WithContext(ctx)
	errGroup.SetLimit(10)
	for i := range docIDs {
		docID := docIDs[i]
		errGroup.Go(func() (err error) {
			defer func() {
				if panicErr := recover(); panicErr != nil {
					logs.CtxErrorf(ctx, "[getDocSliceIDs] routine error recover:%+v", panicErr)
				}
			}()

			select {
			case <-ctx.Done():
				logs.CtxErrorf(ctx, "[getDocSliceIDs] doc_id:%d canceled", docID)
				return ctx.Err()
			default:
			}

			slices, _, dbErr := dao.List(ctx, 0, docID, -1)
			if dbErr != nil {
				logs.CtxErrorf(ctx, "[getDocSliceIDs] get deleted slice id err:%+v, doc_id:%v", dbErr, docID)
				return dbErr
			}
			mu.Lock()
			for _, slice := range slices {
				sliceIDs = append(sliceIDs, slice.ID)
			}
			mu.Unlock()
			return nil
		})
	}
	if err = errGroup.Wait(); err != nil {
		return nil, err
	}
	return sliceIDs, nil
}

func (dao *KnowledgeDocumentSliceDAO) MGetSlices(ctx context.Context, sliceIDs []int64) ([]*model.KnowledgeDocumentSlice, error) {
	if len(sliceIDs) == 0 {
		return nil, nil
	}
	s := dao.Query.KnowledgeDocumentSlice
	pos, err := s.WithContext(ctx).Where(s.ID.In(sliceIDs...)).Find()
	if err != nil {
		return nil, err
	}
	return pos, nil
}

func (dao *KnowledgeDocumentSliceDAO) FindSliceByCondition(ctx context.Context, opts *entity.WhereSliceOpt) (
	[]*model.KnowledgeDocumentSlice, int64, error) {

	s := dao.Query.KnowledgeDocumentSlice
	do := s.WithContext(ctx)
	if opts.DocumentID != 0 {
		do = do.Where(s.DocumentID.Eq(opts.DocumentID))
	}
	if len(opts.DocumentIDs) != 0 {
		do = do.Where(s.DocumentID.In(opts.DocumentIDs...))
	}
	if opts.KnowledgeID != 0 {
		do = do.Where(s.KnowledgeID.Eq(opts.KnowledgeID))
	}
	if opts.DocumentID == 0 && opts.KnowledgeID == 0 && len(opts.DocumentIDs) == 0 {
		return nil, 0, errors.New("documentID and knowledgeID cannot be empty at the same time")
	}
	if opts.Keyword != nil && len(*opts.Keyword) != 0 {
		do = do.Where(s.Content.Like(*opts.Keyword))
	}

	if opts.PageSize != 0 {
		do = do.Limit(int(opts.PageSize))
		do = do.Offset(int(opts.Sequence)).Order(s.Sequence.Asc())
	}
	if opts.NotEmpty != nil {
		if ptr.From(opts.NotEmpty) {
			do = do.Where(s.Content.Neq(""))
		} else {
			do = do.Where(s.Content.Eq(""))
		}
	}
	pos, err := do.Find()
	if err != nil {
		return nil, 0, err
	}
	total, err := do.Limit(-1).Offset(-1).Count()
	if err != nil {
		return nil, 0, err
	}
	return pos, total, nil
}

func (dao *KnowledgeDocumentSliceDAO) GetSliceBySequence(ctx context.Context, documentID, sequence int64) ([]*model.KnowledgeDocumentSlice, error) {
	if documentID == 0 {
		return nil, errors.New("documentID cannot be empty")
	}
	s := dao.Query.KnowledgeDocumentSlice
	var offset int
	if sequence >= 2 {
		offset = int(sequence - 2)
	}
	pos, err := s.WithContext(ctx).Where(s.DocumentID.Eq(documentID)).Offset(offset).Order(s.Sequence.Asc()).Limit(2).Find()
	if err != nil {
		return nil, err
	}
	return pos, nil
}

func (dao *KnowledgeDocumentSliceDAO) IncrementHitCount(ctx context.Context, sliceIDs []int64) error {
	if len(sliceIDs) == 0 {
		return nil
	}
	s := dao.Query.KnowledgeDocumentSlice
	_, err := s.WithContext(ctx).Debug().Where(s.ID.In(sliceIDs...)).Updates(map[string]interface{}{
		s.Hit.ColumnName().String():       gorm.Expr("hit +?", 1),
		s.UpdatedAt.ColumnName().String(): time.Now().UnixMilli(),
	})
	return err
}

func (dao *KnowledgeDocumentSliceDAO) GetSliceHitByKnowledgeID(ctx context.Context, knowledgeID int64) (int64, error) {
	if knowledgeID == 0 {
		return 0, errors.New("knowledgeID cannot be empty")
	}
	s := dao.Query.KnowledgeDocumentSlice
	var totalSliceHit *int64
	err := s.WithContext(ctx).Debug().Select(s.Hit.Sum()).Where(s.KnowledgeID.Eq(knowledgeID)).Scan(&totalSliceHit)
	if err != nil {
		return 0, err
	}
	return ptr.From(totalSliceHit), nil
}

func (dao *KnowledgeDocumentSliceDAO) GetLastSequence(ctx context.Context, documentID int64) (float64, error) {
	if documentID == 0 {
		return 0, errors.New("[GetLastSequence] documentID cannot be empty")
	}
	s := dao.Query.KnowledgeDocumentSlice
	resp, err := s.WithContext(ctx).Debug().
		Select(s.Sequence).
		Where(s.DocumentID.Eq(documentID)).
		Order(s.Sequence.Desc()).
		First()
	if err == gorm.ErrRecordNotFound {
		return 0, nil
	}
	if err != nil {
		return 0, fmt.Errorf("[GetLastSequence] db exec err, document_id=%v, %w", documentID, err)
	}
	if resp == nil {
		return 0, errorx.New(errno.ErrKnowledgeNonRetryableCode,
			errorx.KVf("reason", "[GetLastSequence] resp is nil, document_id=%v", documentID))
	}
	return resp.Sequence, nil
}
