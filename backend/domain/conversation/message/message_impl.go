package message

import (
	"context"
	"encoding/json"
	"time"

	"github.com/cloudwego/eino/schema"
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

	// create message
	err = m.MessageDAO.Create(ctx, createData[0])

	if err != nil {
		return resp, err
	}
	resp.Message = m.buildPoData2Message(createData)[0]
	return resp, nil
}

func (m *messageImpl) buildMessageData2Po(ctx context.Context, msg []*entity.Message) ([]*model.Message, error) {

	timeNow := time.Now().UnixMilli()

	// build data
	createData := make([]*model.Message, 0, len(msg))
	// Gen Message ID
	//msgIDs, err := m.IDGen.GenMultiIDs(ctx, len(msg)) // todo :: need batch gen
	//if err != nil {
	//	return nil, err
	//}

	for _, one := range msg {
		msgID, err := m.IDGen.GenID(ctx) // todo :: need batch gen
		if err != nil {
			return nil, err
		}

		extString := ""
		extByte, err := json.Marshal(one.Ext)
		if err == nil {
			extString = string(extByte)
		}

		createDataOne := &model.Message{
			ID:             msgID,
			ConversationID: one.ConversationID,
			UserID:         one.UserID,
			AgentID:        one.AgentID,
			RunID:          one.RunID,
			Ext:            extString,
			Role:           string(one.Role),
			MessageType:    string(one.MessageType),
			ContentType:    string(one.ContentType),
			SectionID:      one.SectionID,
			DisplayContent: one.DisplayContent,
			CreatedAt:      timeNow,
			UpdatedAt:      timeNow,
		}
		content, err := json.Marshal(one.Content)
		if err == nil {
			createDataOne.Content = string(content)
		}

		if one.ModelContent != nil {
			createDataOne.ModelContent = *one.ModelContent
		} else {
			modelContent := m.buildModelContent(ctx, one)
			if modelContent != nil {
				modelContentByte, err := json.Marshal(modelContent)
				if err != nil {
					continue
				}
				createDataOne.ModelContent = string(modelContentByte)
			}
		}

		createData = append(createData, createDataOne)
	}
	return createData, nil
}

func (m *messageImpl) buildModelContent(ctx context.Context, em *entity.Message) *schema.Message {
	// build

	modelContent := &schema.Message{
		Role: schema.RoleType(em.Role),
		Name: em.Name,
	}

	var multiContent []schema.ChatMessagePart
	for _, contentData := range em.Content {
		one := schema.ChatMessagePart{}
		switch contentData.Type {
		case chatEntity.InputTypeText:
			one.Type = schema.ChatMessagePartTypeText
			one.Text = contentData.Text
		case chatEntity.InputTypeImage:
			one.Type = schema.ChatMessagePartTypeImageURL
			one.ImageURL = &schema.ChatMessageImageURL{
				URL: contentData.FileData[0].Url,
			}
		case chatEntity.InputTypeFile:
			one.Type = schema.ChatMessagePartTypeFileURL
			one.FileURL = &schema.ChatMessageFileURL{
				URL: contentData.FileData[0].Url,
			}
		}
		multiContent = append(multiContent, one)
	}

	modelContent.MultiContent = multiContent

	return modelContent
}

func (m *messageImpl) BatchCreate(ctx context.Context, req *entity.BatchCreateRequest) (*entity.BatchCreateResponse, error) {

	resp := &entity.BatchCreateResponse{}

	createData, err := m.buildMessageData2Po(ctx, req.Messages)

	if err != nil {
		return nil, err
	}

	// create message
	err = m.MessageDAO.BatchCreate(ctx, createData)

	if err != nil {
		return resp, err
	}

	return &entity.BatchCreateResponse{}, nil
}

func (m *messageImpl) List(ctx context.Context, req *entity.ListRequest) (*entity.ListResponse, error) {

	resp := &entity.ListResponse{}

	// get message
	messageList, hasMore, err := m.MessageDAO.List(ctx, req.ConversationID, req.UserID, req.Limit, req.Cursor, req.Direction)
	if err != nil {
		return resp, err
	}

	// build data
	builderMsgData := m.buildPoData2Message(messageList)
	resp.Messages = builderMsgData
	resp.HasMore = hasMore
	if hasMore {
		resp.Cursor = messageList[len(messageList)-1].CreatedAt
	}

	return resp, nil
}
func (m *messageImpl) buildPoData2Message(message []*model.Message) []*entity.Message {

	msgData := make([]*entity.Message, len(message))

	for i := range message {
		var content []*chatEntity.InputMetaData

		msgData[i] = &entity.Message{
			ID:             message[i].ID,
			ConversationID: message[i].ConversationID,
			AgentID:        message[i].AgentID,
			Role:           chatEntity.RoleType(message[i].Role),
			MessageType:    chatEntity.MessageType(message[i].MessageType),
			ContentType:    chatEntity.ContentType(message[i].ContentType),
			RunID:          message[i].RunID,
			DisplayContent: message[i].DisplayContent,
			ModelContent:   &message[i].ModelContent,
			CreatedAt:      message[i].CreatedAt,
			UpdatedAt:      message[i].UpdatedAt,
			UserID:         message[i].UserID,
		}
		err := json.Unmarshal([]byte(message[i].Content), &content)
		if err == nil {
			msgData[i].Content = content
		}

		var extMap map[string]string
		if message[i].Ext != "" {
			err = json.Unmarshal([]byte(message[i].Ext), &extMap)
			if err == nil {
				msgData[i].Ext = extMap
			}
		}
	}
	return msgData
}

func (m *messageImpl) GetByRunIDs(ctx context.Context, req *entity.GetByRunIDsRequest) (*entity.GetByRunIDsResponse, error) {

	resp := &entity.GetByRunIDsResponse{}

	// get message
	messageList, err := m.MessageDAO.GetByRunIDs(ctx, req.RunID)
	if err != nil {
		return resp, err
	}
	// build data
	resp.Messages = m.buildPoData2Message(messageList)

	return resp, nil
}

func (m *messageImpl) Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error) {
	resp := &entity.EditResponse{}

	// build update column
	updateColumns := make(map[string]interface{})

	//if len(req.Message.Content) > 0 {
	//	updateColumns["content"] = req.Message.Content
	//}

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

func (m *messageImpl) Delete(ctx context.Context, req *entity.DeleteRequest) (*entity.DeleteResponse, error) {
	resp := &entity.DeleteResponse{}
	// delete message
	err := m.MessageDAO.Delete(ctx, req.MessageIDs, req.RunIDs)

	if err != nil {
		return resp, err
	}
	return resp, nil
}

func (m *messageImpl) GetByID(ctx context.Context, req *entity.GetByIDRequest) (*entity.GetByIDResponse, error) {

	resp := &entity.GetByIDResponse{}
	// get message
	message, err := m.MessageDAO.GetByID(ctx, req.MessageID)
	if err != nil {
		return resp, err
	}
	// build data
	resp.Message = m.buildPoData2Message([]*model.Message{message})[0]
	return resp, nil
}

func (m *messageImpl) Broken(ctx context.Context, req *entity.BrokenRequest) (*entity.BrokenResponse, error) {
	resp := &entity.BrokenResponse{}
	// broken message
	updateColumns := make(map[string]interface{})
	updateColumns["status"] = entity.MessageStatusBroken
	updateColumns["position"] = req.Position
	updateColumns["updated_at"] = time.Now().UnixMilli()

	_, err := m.MessageDAO.Edit(ctx, req.ID, updateColumns)
	if err != nil {
		return resp, err
	}
	return resp, nil
}
