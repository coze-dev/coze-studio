package message

import (
	"context"
	"encoding/json"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/model"
	chatEntity "code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type messageImpl struct {
	IDGen idgen.IDGenerator
	*dal.MessageDAO
}
type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewService(c *Components) Message {

	return &messageImpl{
		MessageDAO: dal.NewMessageDAO(c.DB),
		IDGen:      c.IDGen,
	}

}

func (m *messageImpl) Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error) {
	resp := &entity.CreateResponse{}

	createData, err := m.buildMessageData2Po(ctx, []*entity.Message{req.Message})

	if err != nil {
		return nil, err
	}

	//create message
	err = m.MessageDAO.Create(ctx, createData[0])

	if err != nil {
		return resp, err
	}

	return resp, nil
}

func (m *messageImpl) buildMessageData2Po(ctx context.Context, msg []*entity.Message) ([]*model.Message, error) {

	timeNow := time.Now().UnixMilli()

	//build data
	createData := make([]*model.Message, len(msg))

	for _, one := range msg {
		contentString, err := json.Marshal(one.Content)

		//Gen Message ID
		msgID, err := m.IDGen.GenID(ctx) //todo :: need batch gen
		if err != nil {
			return nil, err
		}

		createDataOne := &model.Message{
			ID:             msgID,
			ConversationID: one.ConversationID,
			UserID:         one.UserID,
			AgentID:        one.AgentID,
			Content:        string(contentString),
			Ext:            one.Ext,
			Role:           string(one.Role),
			MessageType:    string(one.MessageType),
			ContentType:    string(one.ContentType),
			SectionID:      one.SectionID,
			DisplayContent: string(contentString),
			CreatedAt:      timeNow,
			UpdatedAt:      timeNow,
		}
		createData = append(createData, createDataOne)
	}

	return createData, nil
}

func (m *messageImpl) BatchCreate(ctx context.Context, req *entity.BatchCreateRequest) (*entity.BatchCreateResponse, error) {

	resp := &entity.BatchCreateResponse{}

	createData, err := m.buildMessageData2Po(ctx, req.Messages)

	if err != nil {
		return nil, err
	}

	//create message
	err = m.MessageDAO.BatchCreate(ctx, createData)

	if err != nil {
		return resp, err
	}

	return &entity.BatchCreateResponse{}, nil
}

func (m *messageImpl) List(ctx context.Context, req *entity.ListRequest) (*entity.ListResponse, error) {

	resp := &entity.ListResponse{}

	//get message
	messageList, hasMore, err := m.MessageDAO.List(ctx, req.ConversationID, req.UserID, req.Limit, req.Cursor, req.Direction)
	if err != nil {
		return resp, err
	}

	//build data
	builderMsgData := m.buildPoData2Message(messageList)
	resp.Messages = builderMsgData
	resp.HasMore = hasMore

	return resp, nil
}
func (m *messageImpl) buildPoData2Message(message []*model.Message) []*entity.Message {

	msgData := make([]*entity.Message, len(message))

	for i := range message {
		msgData[i] = &entity.Message{
			ID:             message[i].ID,
			ConversationID: message[i].ConversationID,
			AgentID:        message[i].AgentID,
			Content:        message[i].Content,
			Role:           chatEntity.RoleType(message[i].Role),
			MessageType:    chatEntity.MessageType(message[i].MessageType),
			ContentType:    chatEntity.ContentType(message[i].ContentType),
			RunID:          message[i].RunID,
			DisplayContent: message[i].DisplayContent,
			Ext:            message[i].Ext,
			CreatedAt:      message[i].CreatedAt,
			UpdatedAt:      message[i].UpdatedAt,
		}
	}
	return msgData
}

func (m *messageImpl) GetByRunID(ctx context.Context, req *entity.GetByRunIDRequest) (*entity.GetByRunIDResponse, error) {

	resp := &entity.GetByRunIDResponse{}

	//get message
	messageList, err := m.MessageDAO.GetByRunIDs(ctx, req.RunID)
	if err != nil {
		return resp, err
	}
	//build data
	resp.Messages = m.buildPoData2Message(messageList)

	return &entity.GetByRunIDResponse{}, nil
}

func (m *messageImpl) Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error) {
	resp := &entity.EditResponse{}

	//build update column
	updateColumns := make(map[string]interface{})

	if len(req.Message.Content) > 0 {
		updateColumns["content"] = req.Message.Content
	}

	if len(req.Message.MessageType) > 0 {
		updateColumns["message_type"] = req.Message.MessageType
	}

	if len(req.Message.ContentType) > 0 {
		updateColumns["content_type"] = req.Message.ContentType
	}

	updateColumns["updated_at"] = time.Now().UnixMilli()

	updateRes, err := m.MessageDAO.Edit(ctx, req.Message.ID, updateColumns)
	if err != nil {
		return resp, err
	}
	if updateRes > 0 {
		resp.Message = req.Message
	}
	return resp, nil
}
