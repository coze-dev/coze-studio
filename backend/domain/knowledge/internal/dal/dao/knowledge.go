package dao

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

//go:generate mockgen -destination ../../mock/dal/dao/knowledge.go --package dao -source knowledge.go
type KnowledgeRepo interface {
	Create(ctx context.Context, knowledge *model.Knowledge) error
	Upsert(ctx context.Context, knowledge *model.Knowledge) error
	Update(ctx context.Context, knowledge *model.Knowledge) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*model.Knowledge, error)
	MGetByID(ctx context.Context, ids []int64) ([]*model.Knowledge, error)
	FilterEnableKnowledge(ctx context.Context, ids []int64) ([]*model.Knowledge, error)
	InitTx() (tx *gorm.DB, err error)
	UpdateWithTx(ctx context.Context, tx *gorm.DB, knowledgeID int64, updateMap map[string]interface{}) error
	FindKnowledgeByCondition(ctx context.Context, opts *WhereKnowledgeOption) ([]*model.Knowledge, int64, error)
}

func NewKnowledgeDAO(db *gorm.DB) KnowledgeRepo {
	return &knowledgeDAO{db: db, query: query.Use(db)}
}

type knowledgeDAO struct {
	db    *gorm.DB
	query *query.Query
}

type WhereKnowledgeOption struct {
	KnowledgeIDs []int64
	AppID        *int64
	SpaceID      *int64
	Name         *string // 完全匹配
	Status       []int32
	UserID       *int64
	Query        *string // 模糊匹配
	Page         *int
	PageSize     *int
	Order        *Order
	OrderType    *OrderType
	FormatType   *int64
}

type OrderType int32

const (
	OrderTypeAsc  OrderType = 1
	OrderTypeDesc OrderType = 2
)

type Order int32

const (
	OrderCreatedAt Order = 1
	OrderUpdatedAt Order = 2
)

func (dao *knowledgeDAO) Create(ctx context.Context, knowledge *model.Knowledge) error {
	return dao.query.Knowledge.WithContext(ctx).Create(knowledge)
}
func (dao *knowledgeDAO) Upsert(ctx context.Context, knowledge *model.Knowledge) error {
	return dao.query.Knowledge.WithContext(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(knowledge)
}
func (dao *knowledgeDAO) Update(ctx context.Context, knowledge *model.Knowledge) error {
	k := dao.query.Knowledge
	knowledge.UpdatedAt = time.Now().UnixMilli()
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

func (dao *knowledgeDAO) FilterEnableKnowledge(ctx context.Context, knowledgeIDs []int64) ([]*model.Knowledge, error) {
	if len(knowledgeIDs) == 0 {
		return nil, nil
	}
	k := dao.query.Knowledge
	knowledgeModels, err := k.WithContext(ctx).
		Select(k.ID, k.FormatType).
		Where(k.ID.In(knowledgeIDs...)).
		Where(k.Status.Eq(int32(entity.DocumentStatusEnable))).
		Find()

	return knowledgeModels, err
}

func (dao *knowledgeDAO) InitTx() (tx *gorm.DB, err error) {
	tx = dao.db.Begin()
	if tx.Error != nil {
		return nil, err
	}
	return
}

func (dao *knowledgeDAO) UpdateWithTx(ctx context.Context, tx *gorm.DB, knowledgeID int64, updateMap map[string]interface{}) error {
	return tx.WithContext(ctx).Model(&model.Knowledge{}).Where("id = ?", knowledgeID).Updates(updateMap).Error
}

func (dao *knowledgeDAO) FindKnowledgeByCondition(ctx context.Context, opts *WhereKnowledgeOption) (knowledge []*model.Knowledge, total int64, err error) {
	k := dao.query.Knowledge
	do := k.WithContext(ctx).Debug()
	if opts == nil {
		return nil, 0, nil
	}
	if opts.Query != nil && len(*opts.Query) > 0 {
		do = do.Where(k.Name.Like("%" + *opts.Query + "%"))
	}
	if opts.Name != nil && len(*opts.Name) > 0 {
		do = do.Where(k.Name.Eq(*opts.Name))
	}

	if len(opts.KnowledgeIDs) > 0 {
		do = do.Where(k.ID.In(opts.KnowledgeIDs...))
	}
	if ptr.From(opts.AppID) != 0 {
		do = do.Where(k.AppID.Eq(ptr.From(opts.AppID)))
	} else {
		if len(opts.KnowledgeIDs) == 0 {
			do = do.Where(k.AppID.Eq(0))
		}
	}
	if ptr.From(opts.SpaceID) != 0 {
		do = do.Where(k.SpaceID.Eq(*opts.SpaceID))
	}
	if len(opts.Status) > 0 {
		do = do.Where(k.Status.In(opts.Status...))
	}
	if opts.UserID != nil && *opts.UserID != 0 {
		do = do.Where(k.CreatorID.Eq(*opts.UserID))
	}
	if opts.FormatType != nil {
		do = do.Where(k.FormatType.Eq(int32(*opts.FormatType)))
	}
	total, err = do.Count()
	if err != nil {
		return nil, 0, err
	}
	if opts.Order != nil {
		if *opts.Order == OrderCreatedAt {
			if opts.OrderType != nil {
				if *opts.OrderType == OrderTypeAsc {
					do = do.Order(k.CreatedAt.Asc())
				} else {
					do = do.Order(k.CreatedAt.Desc())
				}
			} else {
				do = do.Order(k.CreatedAt.Desc())
			}
		} else if *opts.Order == OrderUpdatedAt {
			if opts.OrderType != nil {
				if *opts.OrderType == OrderTypeAsc {
					do = do.Order(k.UpdatedAt.Asc())
				} else {
					do = do.Order(k.UpdatedAt.Desc())
				}
			} else {
				do = do.Order(k.UpdatedAt.Desc())
			}
		}
	}
	if opts.Page != nil && opts.PageSize != nil {
		offset := (*opts.Page - 1) * (*opts.PageSize)
		do = do.Limit(*opts.PageSize).Offset(offset)
	}
	knowledge, err = do.Find()
	return knowledge, total, err
}

func (dao *knowledgeDAO) GetByID(ctx context.Context, id int64) (*model.Knowledge, error) {
	k := dao.query.Knowledge
	knowledge, err := k.WithContext(ctx).Where(k.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return knowledge, nil
}
