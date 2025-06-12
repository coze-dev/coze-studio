package message

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type messageImpl struct {
	Components
}

type Components struct {
	MessageRepo repository.MessageRepo
}

func NewService(c *Components) Message {
	return &messageImpl{
		Components: *c,
	}
}

func (m *messageImpl) Create(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	// create message
	msg, err := m.MessageRepo.Create(ctx, msg)
	if err != nil {
		return nil, err
	}
	return msg, nil
}

func (m *messageImpl) List(ctx context.Context, req *entity.ListMeta) (*entity.ListResult, error) {
	resp := &entity.ListResult{}

	// get message with query
	messageList, hasMore, err := m.MessageRepo.List(ctx, req.ConversationID, req.UserID, req.Limit, req.Cursor, req.Direction, ptr.Of(message.MessageTypeQuestion))
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
	_, err := m.MessageRepo.Edit(ctx, req.ID, req)
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

	return nil
}

func (m *messageImpl) GetByID(ctx context.Context, id int64) (*entity.Message, error) {
	msg, err := m.MessageRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return msg, nil
}

func (m *messageImpl) Broken(ctx context.Context, req *entity.BrokenMeta) error {

	_, err := m.MessageRepo.Edit(ctx, req.ID, &message.Message{
		Status:   message.MessageStatusBroken,
		Position: ptr.From(req.Position),
	})
	if err != nil {
		return err
	}
	return nil
}
