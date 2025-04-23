package dal

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/internal/query"
)

type ConversationRepo interface {
	Create(ctx context.Context, msg *model.Conversation) error
	GetByID(ctx context.Context, id int64) (*model.Conversation, error)
	Edit(ctx context.Context, id int64, updateColumn map[string]interface{}) (int64, error)
	Get(ctx context.Context, userID int64, agentID int64) (*model.Conversation, error)
}
type ConversationDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewConversationDAO(db *gorm.DB) *ConversationDAO {
	return &ConversationDAO{
		db:    db,
		query: query.Use(db),
	}
}

func (dao *ConversationDAO) Create(ctx context.Context, msg *model.Conversation) error {
	return dao.query.Conversation.WithContext(ctx).Create(msg)
}

func (dao *ConversationDAO) GetByID(ctx context.Context, id int64) (*model.Conversation, error) {
	return dao.query.Conversation.WithContext(ctx).Where(dao.query.Conversation.ID.Eq(id)).First()
}

func (dao *ConversationDAO) Edit(ctx context.Context, id int64, updateColumn map[string]interface{}) (int64, error) {
	updateRes, err := dao.query.Conversation.WithContext(ctx).Where(dao.query.Conversation.ID.Eq(id)).UpdateColumns(updateColumn)
	if err != nil {
		return 0, err
	}
	return updateRes.RowsAffected, nil
}

func (dao *ConversationDAO) Get(ctx context.Context, userID int64, agentID int64, scene int32) (*model.Conversation, error) {
	return dao.query.Conversation.WithContext(ctx).
		Where(dao.query.Conversation.CreatorID.Eq(userID)).
		Where(dao.query.Conversation.AgentID.Eq(agentID)).
		Where(dao.query.Conversation.Scene.Eq(scene)).
		First()
}
