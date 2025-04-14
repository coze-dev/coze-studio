package dal

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/chat/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/chat/internal/query"
	"gorm.io/gorm"
)

type ChatRepo interface {
	Create(ctx context.Context, msg *model.Chat) error
	GetByID(ctx context.Context, id int64) (*model.Chat, error)
	List(ctx context.Context, conversationID int64, limit int64) ([]*model.Chat, error)
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

func (dao *ChatDAO) Create(ctx context.Context, chat *model.Chat) error {
	return dao.query.Chat.WithContext(ctx).Create(chat)
}

func (dao *ChatDAO) GetByID(ctx context.Context, id int64) (*model.Chat, error) {
	return dao.query.Chat.WithContext(ctx).Where(dao.query.Chat.ID.Eq(id)).First()
}

func (dao *ChatDAO) UpdateByID(ctx context.Context, id int64, columns map[string]interface{}) error {
	_, err := dao.query.Chat.WithContext(ctx).Where(dao.query.Chat.ID.Eq(id)).UpdateColumns(columns)
	return err
}

func (dao *ChatDAO) List(ctx context.Context, conversationID int64, limit int64) ([]*model.Chat, error) {
	m := dao.query.Chat
	do := m.WithContext(ctx).Where(m.ConversationID.Eq(conversationID))

	if limit > 0 {
		do = m.Limit(int(limit))
	}

	chats, err := do.Order(m.CreatedAt.Desc()).Find()
	return chats, err
}
