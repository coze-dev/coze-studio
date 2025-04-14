package dal

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/query"
	"gorm.io/gorm"
)

type MessageRepo interface {
	Create(ctx context.Context, msg *model.Message) error
	BatchCreate(ctx context.Context, msg []*model.Message) error
	List(ctx context.Context, conversationID int64, userID int64, limit int32, preCursorCreatedAt int64, nextCursorCreatedAt int64) ([]*model.Message, error)
	Count(ctx context.Context, conversationID int64, userID int64) (int64, error)
	GetByChatIDs(ctx context.Context, chatID []int64) ([]*model.Message, error)
	Edit(ctx context.Context, msgID int64, columns map[string]interface{}) (int64, error)
	GetByID(ctx context.Context, msgID int64) (*model.Message, error)
}
type MessageDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewMessageDAO(db *gorm.DB) *MessageDAO {
	return &MessageDAO{
		db:    db,
		query: query.Use(db),
	}
}

func (dao *MessageDAO) Create(ctx context.Context, msg *model.Message) error {
	return dao.query.Message.WithContext(ctx).Create(msg)
}

func (dao *MessageDAO) BatchCreate(ctx context.Context, msg []*model.Message) error {
	return dao.query.Message.WithContext(ctx).CreateInBatches(msg, len(msg))
}

func (dao *MessageDAO) List(ctx context.Context, conversationID int64, userID int64, limit int32, preCursorCreatedAt int64, nextCursorCreatedAt int64) ([]*model.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.ConversationID.Eq(conversationID)).Where(m.UserID.Eq(userID))
	do = do.Order(m.CreatedAt.Desc())
	if limit > 0 {
		do = do.Limit(int(limit))
	}

	if preCursorCreatedAt > 0 {
		do = do.Where(m.CreatedAt.Lt(preCursorCreatedAt))
	}
	if nextCursorCreatedAt > 0 {
		do = do.Where(m.CreatedAt.Gt(nextCursorCreatedAt))
	}
	do = do.Order(m.CreatedAt.Desc())
	return do.Find()
}
func (dao *MessageDAO) Count(ctx context.Context, conversationID int64, userID int64, preCursorCreatedAt int64, nextCursorCreatedAt int64) (int64, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.ConversationID.Eq(conversationID)).Where(m.UserID.Eq(userID))

	if preCursorCreatedAt > 0 {
		do = do.Where(m.CreatedAt.Lt(preCursorCreatedAt))
	}
	if nextCursorCreatedAt > 0 {
		do = do.Where(m.CreatedAt.Gt(nextCursorCreatedAt))
	}

	return do.Count()
}
func (dao *MessageDAO) GetByChatIDs(ctx context.Context, chatID []int64) ([]*model.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.ChatID.In(chatID...)).Order(m.CreatedAt.Desc())
	return do.Find()
}

func (dao *MessageDAO) Edit(ctx context.Context, msgID int64, columns map[string]interface{}) (int64, error) {
	m := dao.query.Message
	do, err := m.WithContext(ctx).Where(m.ID.Eq(msgID)).UpdateColumns(columns)
	if err != nil {
		return 0, err
	}
	return do.RowsAffected, nil
}

func (dao *MessageDAO) GetByID(ctx context.Context, msgID int64) (*model.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.ID.Eq(msgID))
	return do.First()
}
