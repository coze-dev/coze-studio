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

//go:generate mockgen -destination ../../mock/dal/dao/knowledge_document_slice.go --package dao -source knowledge_document_slice.go
type KnowledgeDocumentSliceRepo interface {
	Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error

	BatchCreate(ctx context.Context, slices []*model.KnowledgeDocumentSlice) error
	BatchSetStatus(ctx context.Context, ids []int64, status int32, reason string) error
	DeleteByDocument(ctx context.Context, documentID int64) error
	MGetSlices(ctx context.Context, sliceIDs []int64) ([]*model.KnowledgeDocumentSlice, error)

	List(ctx context.Context, knowledgeID, documentID int64, limit int, cursor *string) (
		resp []*model.KnowledgeDocumentSlice, nextCursor *string, hasMore bool, err error)
	ListStatus(ctx context.Context, documentID int64, limit int, cursor *string) (
		resp []*model.SliceProgress, nextCursor *string, hasMore bool, err error)
	FindSliceByCondition(ctx context.Context, opts *WhereSliceOpt) (
		[]*model.KnowledgeDocumentSlice, int64, error)
	GetDocumentSliceIDs(ctx context.Context, docIDs []int64) (sliceIDs []int64, err error)
	GetSliceBySequence(ctx context.Context, documentID int64, sequence int64) (
		[]*model.KnowledgeDocumentSlice, error)
}

func NewKnowledgeDocumentSliceDAO(db *gorm.DB) KnowledgeDocumentSliceRepo {
	return &knowledgeDocumentSliceDAO{db: db, query: query.Use(db)}

}

type WhereSliceOpt struct {
	KnowledgeID int64
	DocumentID  int64
	Keyword     *string
	Sequence    int64
	PageSize    int64
	Offset      int64
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

func (dao *knowledgeDocumentSliceDAO) BatchSetStatus(ctx context.Context, ids []int64, status int32, reason string) error {
	s := dao.query.KnowledgeDocumentSlice
	updates := map[string]any{s.Status.ColumnName().String(): status}
	if reason != "" {
		updates[s.FailReason.ColumnName().String()] = reason
	}

	_, err := s.WithContext(ctx).Where(s.ID.In(ids...)).Updates(updates)
	return err
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

func (dao *knowledgeDocumentSliceDAO) List(ctx context.Context, knowledgeID int64, documentID int64, limit int, cursor *string) (
	pos []*model.KnowledgeDocumentSlice, nextCursor *string, hasMore bool, err error) {

	do, err := dao.listDo(ctx, knowledgeID, documentID, limit, cursor)
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
	do, err := dao.listDo(ctx, 0, documentID, limit, cursor)
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

func (dao *knowledgeDocumentSliceDAO) listDo(ctx context.Context, knowledgeID int64, documentID int64, limit int, cursor *string) (
	query.IKnowledgeDocumentSliceDo, error) {

	s := dao.query.KnowledgeDocumentSlice
	do := s.WithContext(ctx)
	if documentID != 0 {
		do = do.Where(s.DocumentID.Eq(documentID))
	}
	if knowledgeID != 0 {
		do = do.Where(s.KnowledgeID.Eq(knowledgeID))
	}
	if cursor != nil {
		//todo，因sequence逻辑更新，这里逻辑可能要改动下
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

			slices, _, _, dbErr := dao.List(ctx, 0, docID, -1, nil)
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

func (dao *knowledgeDocumentSliceDAO) MGetSlices(ctx context.Context, sliceIDs []int64) ([]*model.KnowledgeDocumentSlice, error) {
	if len(sliceIDs) == 0 {
		return nil, nil
	}
	s := dao.query.KnowledgeDocumentSlice
	pos, err := s.WithContext(ctx).Where(s.ID.In(sliceIDs...)).Find()
	if err != nil {
		return nil, err
	}
	return pos, nil
}

func (dao *knowledgeDocumentSliceDAO) FindSliceByCondition(ctx context.Context, opts *WhereSliceOpt) (
	[]*model.KnowledgeDocumentSlice, int64, error) {

	s := dao.query.KnowledgeDocumentSlice
	do := s.WithContext(ctx)
	if opts.DocumentID != 0 {
		do = do.Where(s.DocumentID.Eq(opts.DocumentID))
	}
	if opts.KnowledgeID != 0 {
		do = do.Where(s.KnowledgeID.Eq(opts.KnowledgeID))
	}
	if opts.DocumentID == 0 && opts.KnowledgeID == 0 {
		return nil, 0, errors.New("documentID and knowledgeID cannot be empty at the same time")
	}
	if opts.Keyword != nil {
		do = do.Where(s.Content.Like(*opts.Keyword))
	}
	do = do.Offset(int(opts.Sequence)).Order(s.Sequence.Asc())

	if opts.PageSize != 0 {
		do = do.Limit(int(opts.PageSize))
	} else {
		do = do.Limit(50)
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

func (dao *knowledgeDocumentSliceDAO) GetSliceBySequence(ctx context.Context, documentID, sequence int64) ([]*model.KnowledgeDocumentSlice, error) {
	if documentID == 0 {
		return nil, errors.New("documentID cannot be empty")
	}
	s := dao.query.KnowledgeDocumentSlice
	pos, err := s.WithContext(ctx).Where(s.DocumentID.Eq(documentID)).Offset(int(sequence - 1)).Order(s.Sequence.Asc()).Limit(2).Find()
	if err != nil {
		return nil, err
	}
	return pos, nil
}
