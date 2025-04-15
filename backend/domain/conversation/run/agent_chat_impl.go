package run

import (
	"context"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/crossdomain/conversation/message"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type chatImpl struct {
	IDGen idgen.IDGenerator
	*dal.ChatDAO
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewService(c *Components) Chat {
	return &chatImpl{
		IDGen:   c.IDGen,
		ChatDAO: dal.NewChatDAO(c.DB),
	}
}
func (c *chatImpl) AgentChat(ctx context.Context, req *entity.AgentChatRequest) (*entity.AgentChatResponse, error) {

	//get history
	//history, err := c.getHistory(ctx, req.ChatMessage)
	//if err != nil {
	//	//todo:: get history error, without blocking?
	//	return nil, err
	//}
	//
	////create run
	//chatPoData, err := c.buildChat2Po(ctx, req.ChatMessage)
	//if err != nil {
	//	return nil, err
	//}
	//err = c.ChatDAO.Create(ctx, chatPoData)
	//if err != nil {
	//	return nil, err
	//}
	//
	////save input -> create message
	//msgCreateRes, err := message.NewCDMessage().CreateMessage(ctx, c.buildChat2MessageCreate(ctx, req.ChatMessage, entity.RoleTypeUser, entity.MessageTypeQuery))
	//if err != nil {
	//	return nil, err
	//}
	//

	//build run model request

	//call model
	//reply
	//save output
	return nil, nil
}

func (c *chatImpl) buildChat2MessageCreate(ctx context.Context, req *entity.ChatMessage, role entity.RoleType, messageType entity.MessageType) *entity.ChatCreateMessage {

	return &entity.ChatCreateMessage{
		ConversationID: req.ConversationID,
		SectionID:      req.SectionID,
		UserID:         req.UserID,
		RoleType:       role,
		MessageType:    messageType,
		Content:        req.Content,
		Ext:            req.Ext,
	}

}

func (c *chatImpl) buildChat2Po(ctx context.Context, chat *entity.ChatMessage) (*model.RunRecord, error) {

	RunID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	timeNow := time.Now().UnixMilli()
	return &model.RunRecord{
		ID:             RunID,
		ConversationID: chat.ConversationID,
		SectionID:      chat.SectionID,
		AgentID:        chat.AgentID,
		Status:         string(entity.ChatStatusCreated),
		CreatedAt:      timeNow,
		UpdatedAt:      timeNow,
	}, nil
}

func (c *chatImpl) getHistory(ctx context.Context, req *entity.ChatMessage) ([]*msgEntity.Message, error) {
	// query run record
	conversationTurns := int64(entity.ConversationTurnsDefault) //todo::需要替换成agent上配置的会话论述
	chatList, err := c.ChatDAO.List(ctx, req.ConversationID, conversationTurns)
	if err != nil {
		return nil, err
	}

	if len(chatList) == 0 {
		return nil, nil
	}
	// query message by run ids
	RunIDS := getRunID(chatList)

	//query message
	history, err := message.NewCDMessage().GetMessageListByRunID(ctx, req.ConversationID, RunIDS)
	if err != nil {
		return nil, err
	}

	// return history
	return history, nil
}

func getRunID(chat []*model.RunRecord) []int64 {

	ids := make([]int64, len(chat))
	for i, c := range chat {
		ids[i] = c.ID
	}

	return ids
}

func (c *chatImpl) createChat(ctx context.Context, req *entity.AgentChatRequest) (*entity.ChatItem, error) {
	return nil, nil
}

func (c *chatImpl) saveInput(ctx context.Context, req *entity.AgentChatRequest) error {

	//createMsgRes, err := crossdomain.CreateMessage(ctx)
	return nil
}
func (c *chatImpl) saveOutput() {

}
func (c *chatImpl) Reply() {

}
func (c *chatImpl) buildChatReqData() {

}
