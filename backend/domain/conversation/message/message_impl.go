package message

import (
	"context"
	"encoding/json"
	"time"

	chatEntity "code.byted.org/flow/opencoze/backend/domain/conversation/chat/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"gorm.io/gorm"
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

	cursorID := int64(0)
	if req.PreCursor > 0 {
		cursorID = req.PreCursor
	}
	if req.NextCursor > 0 {
		cursorID = req.NextCursor
	}

	preCursorCreatedAt := int64(0)
	nextCursorCreatedAt := int64(0)

	if cursorID > 0 {
		//get cursor create time
		cursorMsg, err := m.MessageDAO.GetByID(ctx, cursorID)
		if err != nil {
			return nil, err
		}
		if cursorMsg != nil {
			if req.PreCursor > 0 {
				preCursorCreatedAt = cursorMsg.CreatedAt
			} else {
				nextCursorCreatedAt = cursorMsg.CreatedAt
			}
		}
	}
	//get message
	messageList, err := m.MessageDAO.List(ctx, req.ConversationID, req.UserID, req.Limit, preCursorCreatedAt, nextCursorCreatedAt)
	if err != nil {
		return resp, err
	}

	//build data
	builderMsgData := m.buildPoData2Message(messageList)
	resp.Messages = builderMsgData

	//count message
	count, err := m.MessageDAO.Count(ctx, req.ConversationID, req.UserID, preCursorCreatedAt, nextCursorCreatedAt)
	if err != nil {
		return resp, err
	}
	if count > int64(req.Limit) {
		resp.HasMore = true
	}

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
			ChatID:         message[i].ChatID,
			DisplayContent: message[i].DisplayContent,
			Ext:            message[i].Ext,
			CreatedAt:      message[i].CreatedAt,
			UpdatedAt:      message[i].UpdatedAt,
		}
	}
	return msgData
}

func (m *messageImpl) GetByChatID(ctx context.Context, req *entity.GetByChatIDRequest) (*entity.GetByChatIDResponse, error) {

	resp := &entity.GetByChatIDResponse{}

	//get message
	messageList, err := m.MessageDAO.GetByChatIDs(ctx, req.ChatID)
	if err != nil {
		return resp, err
	}
	//build data
	resp.Messages = m.buildPoData2Message(messageList)

	return &entity.GetByChatIDResponse{}, nil
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
