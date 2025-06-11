package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewMessageRepo(db *gorm.DB, idGen idgen.IDGenerator) MessageRepo {
	return dal.NewMessageDAO(db, idGen)
}

type MessageRepo interface {
	Create(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	List(ctx context.Context, conversationID int64, userID int64, limit int, cursor int64,
		direction entity.ScrollPageDirection, messageType *message.MessageType) ([]*entity.Message, bool, error)
	GetByRunIDs(ctx context.Context, runIDs []int64, orderBy string) ([]*entity.Message, error)
	Edit(ctx context.Context, msgID int64, message *message.Message) (int64, error)
	GetByID(ctx context.Context, msgID int64) (*entity.Message, error)
	Delete(ctx context.Context, msgIDs []int64, runIDs []int64) error
}
