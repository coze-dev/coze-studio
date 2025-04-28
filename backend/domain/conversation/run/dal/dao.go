package dal

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/query"
)

type ChatRepo interface {
	Create(ctx context.Context, msg *model.RunRecord) error
	GetByID(ctx context.Context, id int64) (*model.RunRecord, error)
	List(ctx context.Context, conversationID int64, limit int64) ([]*model.RunRecord, error)
	UpdateByID(ctx context.Context, id int64, columns map[string]interface{}) error
}

type ChatDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewChatDAO(db *gorm.DB) *ChatDAO {
	return &ChatDAO{
		db:    db,
		query: query.Use(db),
	}
}

func (dao *ChatDAO) Create(ctx context.Context, chat *model.RunRecord) error {
	return dao.query.RunRecord.WithContext(ctx).Create(chat)
}

func (dao *ChatDAO) GetByID(ctx context.Context, id int64) (*model.RunRecord, error) {
	return dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).First()
}

func (dao *ChatDAO) UpdateByID(ctx context.Context, id int64, columns map[string]interface{}) error {
	_, err := dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).UpdateColumns(columns)
	return err
}

func (dao *ChatDAO) List(ctx context.Context, conversationID int64, limit int64) ([]*model.RunRecord, error) {
	m := dao.query.RunRecord
	do := m.WithContext(ctx).Debug().Where(m.ConversationID.Eq(conversationID))

	if limit > 0 {
		do = m.Limit(int(limit))
	}

	chats, err := do.Order(m.CreatedAt.Desc()).Find()
	return chats, err
}
