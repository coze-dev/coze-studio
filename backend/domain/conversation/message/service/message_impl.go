package message

import (
	"context"
	"time"

	runEntity "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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

func (m *messageImpl) Create(ctx context.Context, msg *entity.Message) (*entity.Message, error) {

	// create message
	message, err := m.MessageRepo.Create(ctx, msg)
	if err != nil {
		return nil, err
	}
	return message, nil
}

func (m *messageImpl) List(ctx context.Context, req *entity.ListMeta) (*entity.ListResult, error) {

	resp := &entity.ListResult{}

	// get message with query
	messageList, hasMore, err := m.MessageRepo.List(ctx, req.ConversationID, req.UserID, req.Limit, req.Cursor, req.Direction, ptr.Of(runEntity.MessageTypeQuestion))
	if err != nil {
		return resp, err
	}

	resp.Direction = req.Direction
	resp.HasMore = hasMore

	if len(messageList) > 0 {
		resp.PrevCursor = messageList[len(messageList)-1].CreatedAt
		resp.NextCursor = messageList[0].CreatedAt

		var runIDs []int64
		for _, m := range messageList {
			runIDs = append(runIDs, m.RunID)
		}
		orderBy := "DESC"
		if req.OrderBy != nil {
			orderBy = *req.OrderBy
		}
		allMessageList, err := m.MessageRepo.GetByRunIDs(ctx, runIDs, orderBy)
		if err != nil {
			return resp, err
		}
		resp.Messages = allMessageList
	}
	return resp, nil
}

func (m *messageImpl) GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*entity.Message, error) {

	messageList, err := m.MessageRepo.GetByRunIDs(ctx, runIDs, "ASC")
	if err != nil {
		return nil, err
	}

	return messageList, nil
}

func (m *messageImpl) Edit(ctx context.Context, req *entity.Message) (*entity.Message, error) {

	// build update column
	updateColumns := make(map[string]interface{})

	if len(req.Content) > 0 {
		updateColumns["content"] = req.Content
	}

	if len(req.MessageType) > 0 {
		updateColumns["message_type"] = req.MessageType
	}

	if len(req.ContentType) > 0 {
		updateColumns["content_type"] = req.ContentType
	}
	if len(req.ModelContent) > 0 {
		updateColumns["model_content"] = req.ModelContent
	}

	updateColumns["updated_at"] = time.Now().UnixMilli()

	_, err := m.MessageRepo.Edit(ctx, req.ID, updateColumns)
	if err != nil {
		return nil, err
	}

	return req, nil
}

func (m *messageImpl) Delete(ctx context.Context, req *entity.DeleteMeta) error {

	err := m.MessageRepo.Delete(ctx, req.MessageIDs, req.RunIDs)

	if err != nil {
		return err
	}
	err = m.CdAgentRun.Delete(ctx, req.RunIDs)

	if err != nil {
		return err
	}

	return nil
}

func (m *messageImpl) GetByID(ctx context.Context, id int64) (*entity.Message, error) {

	message, err := m.MessageRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return message, nil
}

func (m *messageImpl) Broken(ctx context.Context, req *entity.BrokenMeta) error {

	// broken message
	updateColumns := make(map[string]interface{})
	updateColumns["status"] = entity.MessageStatusBroken
	updateColumns["broken_position"] = req.Position
	updateColumns["updated_at"] = time.Now().UnixMilli()

	_, err := m.MessageRepo.Edit(ctx, req.ID, updateColumns)
	if err != nil {
		return err
	}
	return nil
}
