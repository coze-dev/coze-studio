package message

import (
	"context"
	"encoding/json"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
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

func (m *messageImpl) CreateMessage(ctx context.Context, chatMessage *entity.RunCreateMessage) (*msgEntity.Message, error) {
	components := &message.Components{
		DB:    m.db,
		IDGen: m.idgen,
	}

	contentString, _ := json.Marshal(chatMessage.Content)
	msgCreateReq := &msgEntity.CreateRequest{
		Message: &msgEntity.Message{
			ConversationID: chatMessage.ConversationID,
			AgentID:        chatMessage.AgentID,
			RunID:          chatMessage.RunID,
			UserID:         chatMessage.UserID,
			SectionID:      chatMessage.SectionID,
			Content:        chatMessage.Content,
			ContentType:    chatMessage.ContentType,
			DisplayContent: string(contentString),
			Ext:            chatMessage.Ext,
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

func (m *messageImpl) EditMessage(ctx context.Context, runMsgItem *entity.MessageItem) (*msgEntity.Message, error) {

	components := &message.Components{
		DB:    m.db,
		IDGen: m.idgen,
	}
	content := []*entity.InputMetaData{
		{
			Type: entity.InputTypeText,
			Text: runMsgItem.Content,
		},
	}
	msgEditReq := &msgEntity.EditRequest{
		Message: &msgEntity.Message{
			ID:          runMsgItem.ID,
			Content:     content,
			ContentType: runMsgItem.ContentType,
			MessageType: runMsgItem.Type,
		},
	}

	resp, err := message.NewService(components).Edit(ctx, msgEditReq)

	if err != nil {
		return nil, err
	}
	return resp.Message, err
}
