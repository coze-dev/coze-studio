package dal

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/query"
)

type MessageRepo interface {
	Create(ctx context.Context, msg *model.Message) error
	BatchCreate(ctx context.Context, msg []*model.Message) error
	List(ctx context.Context, conversationID int64, userID int64, limit int, cursor int64, direction entity.ScrollPageDirection) ([]*model.Message, bool, error)
	GetByRunIDs(ctx context.Context, runIDs []int64) ([]*model.Message, error)
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

func (dao *MessageDAO) List(ctx context.Context, conversationID int64, userID int64, limit int, cursor int64, direction entity.ScrollPageDirection) ([]*model.Message, bool, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.ConversationID.Eq(conversationID)).Where(m.UserID.Eq(userID))
	do = do.Order(m.CreatedAt.Desc())
	if limit > 0 {
		do = do.Limit(int(limit) + 1)
	}

	if direction == entity.ScrollPageDirectionPrev {
		do = do.Where(m.CreatedAt.Lt(cursor))
	} else {
		do = do.Where(m.CreatedAt.Gt(cursor))
	}

	do = do.Order(m.CreatedAt.Desc()) // todo:: when scroll down, confirm logic
	messageList, err := do.Find()

	var hasMore bool

	if err != nil {
		return nil, hasMore, err
	}

	if len(messageList) > limit {
		hasMore = true
		messageList = messageList[:limit]
	}

	return messageList, hasMore, nil

}

func (dao *MessageDAO) GetByRunIDs(ctx context.Context, runIDs []int64) ([]*model.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.RunID.In(runIDs...)).Order(m.CreatedAt.Desc())
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
