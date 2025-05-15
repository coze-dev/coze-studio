package message

import (
	"context"
	"time"

	runEntity "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type messageImpl struct {
	Components
}

type Components struct {
	MessageRepo repository.MessageRepo
	CdAgentRun  crossdomain.AgentRun
}

func NewService(c *Components) Message {

	return &messageImpl{
		Components: *c,
	}

}

func (m *messageImpl) Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error) {
	resp := &entity.CreateResponse{}

	// create message
	message, err := m.MessageRepo.Create(ctx, req.Message)
	if err != nil {
		return resp, err
	}
	resp.Message = message
	return resp, nil
}

func (m *messageImpl) List(ctx context.Context, req *entity.ListRequest) (*entity.ListResponse, error) {

	resp := &entity.ListResponse{}

	// get message with query
	messageList, hasMore, err := m.MessageRepo.List(ctx, req.ConversationID, req.UserID, req.Limit, req.Cursor, req.Direction, ptr.Of(runEntity.MessageTypeQuestion))
	if err != nil {
		return resp, err
	}
	logs.CtxInfof(ctx, "messageList:%v, hasMore:%v", messageList, hasMore)
	resp.Direction = req.Direction
	resp.HasMore = hasMore

	if len(messageList) > 0 {
		resp.PrevCursor = messageList[len(messageList)-1].CreatedAt
		resp.NextCursor = messageList[0].CreatedAt

		var runIDs []int64
		for _, m := range messageList {
			runIDs = append(runIDs, m.RunID)
		}
		allMessageList, err := m.MessageRepo.GetByRunIDs(ctx, runIDs, "DESC")
		if err != nil {
			return resp, err
		}
		resp.Messages = allMessageList
	}
	return resp, nil
}

func (m *messageImpl) GetByRunIDs(ctx context.Context, req *entity.GetByRunIDsRequest) (*entity.GetByRunIDsResponse, error) {

	resp := &entity.GetByRunIDsResponse{}

	// get message
	messageList, err := m.MessageRepo.GetByRunIDs(ctx, req.RunID, "ASC")
	if err != nil {
		return resp, err
	}
	// build data
	resp.Messages = messageList

	return resp, nil
}

func (m *messageImpl) Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error) {
	resp := &entity.EditResponse{}

	// build update column
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
	if len(req.Message.ModelContent) > 0 {
		updateColumns["model_content"] = req.Message.ModelContent
	}

	updateColumns["updated_at"] = time.Now().UnixMilli()

	updateRes, err := m.MessageRepo.Edit(ctx, req.Message.ID, updateColumns)
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
	err := m.MessageRepo.Delete(ctx, req.MessageIDs, req.RunIDs)

	if err != nil {
		return resp, err
	}
	err = m.CdAgentRun.Delete(ctx, req.RunIDs)

	if err != nil {
		return resp, err
	}

	return resp, nil
}

func (m *messageImpl) GetByID(ctx context.Context, req *entity.GetByIDRequest) (*entity.GetByIDResponse, error) {

	resp := &entity.GetByIDResponse{}
	// get message
	message, err := m.MessageRepo.GetByID(ctx, req.MessageID)
	if err != nil {
		return resp, err
	}
	// build data
	resp.Message = message
	return resp, nil
}

func (m *messageImpl) Broken(ctx context.Context, req *entity.BrokenRequest) (*entity.BrokenResponse, error) {
	resp := &entity.BrokenResponse{}

	// broken message
	updateColumns := make(map[string]interface{})
	updateColumns["status"] = entity.MessageStatusBroken
	updateColumns["position"] = req.Position
	updateColumns["updated_at"] = time.Now().UnixMilli()

	_, err := m.MessageRepo.Edit(ctx, req.ID, updateColumns)
	if err != nil {
		return resp, err
	}
	return resp, nil
}
