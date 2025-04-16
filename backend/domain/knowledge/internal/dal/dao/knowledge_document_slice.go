package dao

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type KnowledgeDocumentSliceRepo interface {
	Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error

	BatchCreate(ctx context.Context, slices []*model.KnowledgeDocumentSlice) error
	DeleteByDocument(ctx context.Context, documentID int64) error

	List(ctx context.Context, documentID int64, limit int, cursor *string) (
		resp []*model.KnowledgeDocumentSlice, nextCursor *string, hasMore bool, err error)
	ListStatus(ctx context.Context, documentID int64, limit int, cursor *string) (
		resp []*model.SliceProgress, nextCursor *string, hasMore bool, err error)
	GetDocumentSliceIDs(ctx context.Context, docIDs []int64) (sliceIDs []int64, err error)
}

func NewKnowledgeDocumentSliceDAO(db *gorm.DB) KnowledgeDocumentSliceRepo {
	return &knowledgeDocumentSliceDAO{db: db, query: query.Use(db)}

}

type knowledgeDocumentSliceDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (dao *knowledgeDocumentSliceDAO) Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	return dao.query.KnowledgeDocumentSlice.WithContext(ctx).Create(slice)
}

func (dao *knowledgeDocumentSliceDAO) Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	s := dao.query.KnowledgeDocumentSlice
	_, err := s.WithContext(ctx).Updates(slice)
	return err
}

func (dao *knowledgeDocumentSliceDAO) BatchCreate(ctx context.Context, slices []*model.KnowledgeDocumentSlice) error {
	return dao.query.KnowledgeDocumentSlice.WithContext(ctx).CreateInBatches(slices, 100)
}

func (dao *knowledgeDocumentSliceDAO) Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error {
	s := dao.query.KnowledgeDocumentSlice
	_, err := s.WithContext(ctx).Where(s.ID.Eq(slice.ID)).Delete()
	return err
}

func (dao *knowledgeDocumentSliceDAO) DeleteByDocument(ctx context.Context, documentID int64) error {
	s := dao.query.KnowledgeDocumentSlice
	_, err := s.WithContext(ctx).Where(s.DocumentID.Eq(documentID)).Delete()
	return err
}

func (dao *knowledgeDocumentSliceDAO) List(ctx context.Context, documentID int64, limit int, cursor *string) (
	pos []*model.KnowledgeDocumentSlice, nextCursor *string, hasMore bool, err error) {

	do, err := dao.listDo(ctx, documentID, limit, cursor)
	if err != nil {
		return nil, nil, false, err
	}

	pos, err = do.Limit(limit).Find()
	if err != nil {
		return nil, nil, false, err
	}

	if len(pos) == 0 {
		return nil, nil, false, nil
	}

	hasMore = len(pos) == limit
	last := pos[len(pos)-1]
	cursor = dao.toCursor(int64(last.Sequence), last.ID)

	return pos, nextCursor, hasMore, err
}

func (dao *knowledgeDocumentSliceDAO) ListStatus(ctx context.Context, documentID int64, limit int, cursor *string) (
	resp []*model.SliceProgress, nextCursor *string, hasMore bool, err error) {

	s := dao.query.KnowledgeDocumentSlice
	do, err := dao.listDo(ctx, documentID, limit, cursor)
	if err != nil {
		return nil, nil, false, err
	}

	pos, err := do.Select(s.ID, s.Status, s.FailReason, s.UpdatedAt).Limit(limit).Find()
	if err != nil {
		return nil, nil, false, err
	}

	if len(pos) == 0 {
		return nil, nil, false, nil
	}

	hasMore = len(pos) == limit
	last := pos[len(pos)-1]
	cursor = dao.toCursor(int64(last.Sequence), last.ID)
	resp = make([]*model.SliceProgress, 0, len(pos))
	for _, po := range pos {
		resp = append(resp, &model.SliceProgress{
			Status:    model.SliceStatus(po.Status),
			StatusMsg: po.FailReason,
		})
	}

	return resp, nextCursor, hasMore, nil
}

func (dao *knowledgeDocumentSliceDAO) listDo(ctx context.Context, documentID int64, limit int, cursor *string) (
	query.IKnowledgeDocumentSliceDo, error) {

	s := dao.query.KnowledgeDocumentSlice
	do := s.WithContext(ctx).Where(s.DocumentID.Eq(documentID))
	if cursor != nil {
		seq, id, err := dao.fromCursor(*cursor)
		if err != nil {
			return nil, err
		}

		do.Where(
			do.Where(s.Sequence.Eq(int32(seq))).Where(s.ID.Gt(id)),
		).Or(
			do.Where(s.Sequence.Gt(int32(seq))),
		)
	}

	return do, nil
}

func (dao *knowledgeDocumentSliceDAO) fromCursor(cursor string) (seq, id int64, err error) {
	parts := strings.Split(cursor, ",")
	if len(parts) != 2 {
		return 0, 0, fmt.Errorf("invalid cursor string")
	}

	seq, err = strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return 0, 0, fmt.Errorf("invalid cursor part 0")
	}

	id, err = strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return 0, 0, fmt.Errorf("invalid cursor part 1")
	}

	return seq, id, nil
}

func (dao *knowledgeDocumentSliceDAO) toCursor(seq, id int64) *string {
	c := fmt.Sprintf("%d,%d", seq, id)
	return &c
}

func (dao *knowledgeDocumentSliceDAO) GetDocumentSliceIDs(ctx context.Context, docIDs []int64) (sliceIDs []int64, err error) {
	if len(docIDs) == 0 {
		return nil, errors.New("empty document ids")
	}
	// doc可能会有很多slice，所以批量处理
	sliceIDs = make([]int64, 0)
	var mu sync.Mutex
	errGroup, ctx := errgroup.WithContext(ctx)
	errGroup.SetLimit(10)
	for _, docID := range docIDs {
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

			slices, _, _, dbErr := dao.List(ctx, docID, -1, nil)
			if dbErr != nil {
				logs.CtxErrorf(ctx, "[getDocSliceIDs] get deleted slice id err:%+v, doc_id:%v", dbErr, docID)
				return dbErr
			}
			mu.Lock()
			for _, slice := range slices {
				sliceIDs = append(sliceIDs, slice.ID)
			}
			sliceIDs = append(sliceIDs, sliceIDs...)
			mu.Unlock()
			return nil
		})
	}
	if err = errGroup.Wait(); err != nil {
		return nil, err
	}
	return sliceIDs, nil
}
