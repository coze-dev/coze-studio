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
	ProjectID    *string
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

func (dao *knowledgeDAO) FilterEnableKnowledge(ctx context.Context, knowledgeIDs []int64) ([]*model.Knowledge, error) {
	if len(knowledgeIDs) == 0 {
		return nil, nil
	}
	k := dao.query.Knowledge
	knowledges, err := k.WithContext(ctx).Select(k.ID).Where(k.ID.In(knowledgeIDs...)).Where(k.Status.Eq(int32(entity.DocumentStatusEnable))).Find()
	return knowledges, err
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
	do := k.WithContext(ctx)
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
	if opts.ProjectID != nil {
		do = do.Where(k.ProjectID.Eq(*opts.ProjectID))
	}
	if opts.SpaceID != nil && *opts.SpaceID != 0 {
		do = do.Where(k.SpaceID.Eq(*opts.SpaceID))
	}
	if len(opts.Status) > 0 {
		do = do.Where(k.Status.In(opts.Status...))
	} else {
		do = do.Where(k.Status.Neq(int32(entity.DocumentStatusDeleted))) // 不查询已经删除的文档
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
		do = do.Limit(int(*opts.PageSize)).Offset(int(offset))
	}
	knowledge, err = do.Find()
	return knowledge, total, err
}
