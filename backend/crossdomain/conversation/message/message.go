package message

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/crossdomain"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	message "code.byted.org/flow/opencoze/backend/domain/conversation/message/service"
)

type messageImpl struct {
	messageDomain message.Message
}

func NewCDMessage(msgDomain message.Message) crossdomain.Message {
	return &messageImpl{
		messageDomain: msgDomain,
	}
}

func (m *messageImpl) GetMessageListByRunID(ctx context.Context, conversationID int64, runIDs []int64) ([]*msgEntity.Message, error) {
	msgReq := &msgEntity.GetByRunIDsRequest{
		ConversationID: conversationID,
		RunID:          runIDs,
	}

	resp, err := m.messageDomain.GetByRunIDs(ctx, msgReq)
	if err != nil {
		return nil, err
	}
	return resp.Messages, nil
}

func (m *messageImpl) CreateMessage(ctx context.Context, msg *msgEntity.Message) (*msgEntity.Message, error) {
	msgCreateReq := &msgEntity.CreateRequest{
		Message: msg,
	}

	resp, err := m.messageDomain.Create(ctx, msgCreateReq)
	if err != nil {
		return nil, err
	}
	return resp.Message, err
}

func (m *messageImpl) EditMessage(ctx context.Context, editMsg *msgEntity.Message) (*msgEntity.Message, error) {

	msgEditReq := &msgEntity.EditRequest{
		Message: editMsg,
	}

	resp, err := m.messageDomain.Edit(ctx, msgEditReq)

	if err != nil {
		return nil, err
	}
	return resp.Message, err
}
