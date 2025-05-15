package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewConversationRepo(db *gorm.DB, idGen idgen.IDGenerator) ConversationRepo {
	return dal.NewConversationDAO(db, idGen)
}

type ConversationRepo interface {
	Create(ctx context.Context, msg *entity.Conversation) (*entity.Conversation, error)
	GetByID(ctx context.Context, id int64) (*entity.Conversation, error)
	UpdateSection(ctx context.Context, id int64) (int64, error)
	Get(ctx context.Context, userID int64, agentID int64, scene int32) (*entity.Conversation, error)
	Delete(ctx context.Context, id int64) (int64, error)
	List(ctx context.Context, userID int64, agentID int64, connectorID int64, scene int32, limit int, page int) ([]*entity.Conversation, bool, error)
}
