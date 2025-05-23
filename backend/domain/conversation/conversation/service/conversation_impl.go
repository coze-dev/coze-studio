package conversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/repository"
)

type conversationImpl struct {
	Components
}
type Components struct {
	ConversationRepo repository.ConversationRepo
}

func NewService(c *Components) Conversation {
	return &conversationImpl{
		Components: *c,
	}
}

func (c *conversationImpl) Create(ctx context.Context, req *entity.CreateMeta) (*entity.Conversation, error) {
	var resp *entity.Conversation

	doData := &entity.Conversation{
		CreatorID:   req.UserID,
		AgentID:     req.AgentID,
		Scene:       req.Scene,
		ConnectorID: req.ConnectorID,
		Ext:         req.Ext,
	}

	resp, err := c.ConversationRepo.Create(ctx, doData)
	if err != nil {
		return resp, err
	}
	return resp, nil
}

func (c *conversationImpl) GetByID(ctx context.Context, id int64) (*entity.Conversation, error) {
	resp := &entity.Conversation{}
	// get conversation
	resp, err := c.ConversationRepo.GetByID(ctx, id)

	if err != nil {
		return resp, err
	}

	return resp, nil
}

func (c *conversationImpl) NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error) {
	resp := &entity.NewConversationCtxResponse{}

	newSectionID, err := c.ConversationRepo.UpdateSection(ctx, req.ID)
	if err != nil {
		return resp, err
	}
	if newSectionID != 0 {
		resp.ID = req.ID
		resp.SectionID = newSectionID
	}
	return resp, nil
}

func (c *conversationImpl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error) {
	// get conversation
	conversation, err := c.ConversationRepo.Get(ctx, req.UserID, req.AgentID, int32(req.Scene), req.ConnectorID)

	if err != nil {
		return nil, err
	}

	// build data
	return conversation, nil
}

func (c *conversationImpl) Delete(ctx context.Context, id int64) error {

	_, err := c.ConversationRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (c *conversationImpl) List(ctx context.Context, req *entity.ListMeta) ([]*entity.Conversation, bool, error) {
	conversationList, hasMore, err := c.ConversationRepo.List(ctx, req.UserID, req.AgentID, req.ConnectorID, int32(req.Scene), req.Limit, req.Page)

	if err != nil {
		return nil, hasMore, err
	}

	return conversationList, hasMore, nil
}
