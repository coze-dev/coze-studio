package message

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type messageImpl struct {
	idgen idgen.IDGenerator
	db    *gorm.DB
}

func NewCDMessage(idgen idgen.IDGenerator, db *gorm.DB) crossdomain.Message {
	return &messageImpl{
		idgen: idgen,
		db:    db,
	}
}

func (m *messageImpl) GetMessageListByRunID(ctx context.Context, conversationID int64, runIDs []int64) ([]*msgEntity.Message, error) {
	msgReq := &msgEntity.GetByRunIDsRequest{
		ConversationID: conversationID,
		RunID:          runIDs,
	}
	components := &message.Components{
		DB:    m.db,
		IDGen: m.idgen,
	}
	resp, err := message.NewService(components).GetByRunIDs(ctx, msgReq)
	if err != nil {
		return nil, err
	}
	return resp.Messages, nil
}

func (m *messageImpl) CreateMessage(ctx context.Context, msg *msgEntity.Message) (*msgEntity.Message, error) {
	components := &message.Components{
		DB:    m.db,
		IDGen: m.idgen,
	}

	msgCreateReq := &msgEntity.CreateRequest{
		Message: msg,
	}

	resp, err := message.NewService(components).Create(ctx, msgCreateReq)
	if err != nil {
		return nil, err
	}
	return resp.Message, err
}

func (m *messageImpl) EditMessage(ctx context.Context, editMsg *msgEntity.Message) (*msgEntity.Message, error) {

	components := &message.Components{
		DB:    m.db,
		IDGen: m.idgen,
	}

	msgEditReq := &msgEntity.EditRequest{
		Message: editMsg,
	}

	resp, err := message.NewService(components).Edit(ctx, msgEditReq)

	if err != nil {
		return nil, err
	}
	return resp.Message, err
}
