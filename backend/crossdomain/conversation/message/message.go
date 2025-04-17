package message

import (
	"context"
	"encoding/json"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type messageImpl struct {
}

func NewCDMessage() crossdomain.Message {
	return &messageImpl{}
}

func (m *messageImpl) GetMessageListByRunID(ctx context.Context, conversationID int64, runIDs []int64) ([]*msgEntity.Message, error) {
	msgReq := &msgEntity.GetByRunIDRequest{
		ConversationID: conversationID,
		RunID:          runIDs,
	}
	components := &message.Components{}
	resp, err := message.NewService(components).GetByRunID(ctx, msgReq)
	if err != nil {
		return nil, err
	}
	return resp.Messages, nil
}

func (m *messageImpl) CreateMessage(ctx context.Context, chatMessage *entity.ChatCreateMessage) (*msgEntity.Message, error) {
	components := &message.Components{}

	contentString, _ := json.Marshal(chatMessage.Content)
	msgCreateReq := &msgEntity.CreateRequest{
		Message: &msgEntity.Message{
			ConversationID: chatMessage.ConversationID,
			AgentID:        chatMessage.AgentID,
			SectionID:      chatMessage.SectionID,
			Content:        string(contentString),
			Role:           chatMessage.RoleType,
			MessageType:    chatMessage.MessageType,
		},
	}

	resp, err := message.NewService(components).Create(ctx, msgCreateReq)
	if err != nil {
		return nil, err
	}
	return resp.Message, err
}

func (m *messageImpl) EditMessage(ctx context.Context, chatMsgItem *entity.MessageItem) (*msgEntity.Message, error) {
	//components := &message.Components{}
	//msgEditReq := &msgEntity.EditRequest{
	//	Message: &msgEntity.Message{
	//		ID:          chatMsgItem.ID,
	//		Content:     chatMsgItem.Content,
	//		ContentType: chatMsgItem.Content,
	//		MessageType: string(chatMsgItem.Type),
	//	},
	//}
	//
	//resp, err := message.NewService(components).Edit(ctx, msgEditReq)
	//
	//if err != nil {
	//	return nil, err
	//}
	//return resp.Message, err
	return &msgEntity.Message{}, nil
}
