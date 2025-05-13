package conversation

import (
	"context"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type conversationImpl struct {
	IDGen idgen.IDGenerator
	*dal.ConversationDAO
}
type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewService(c *Components) Conversation {
	return &conversationImpl{
		ConversationDAO: dal.NewConversationDAO(c.DB, c.IDGen),
		IDGen:           c.IDGen,
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

	resp, err := c.ConversationDAO.Create(ctx, doData)
	if err != nil {
		return resp, err
	}
	return resp, nil
}

func (c *conversationImpl) GetByID(ctx context.Context, id int64) (*entity.Conversation, error) {
	resp := &entity.Conversation{}
	// get conversation
	resp, err := c.ConversationDAO.GetByID(ctx, id)

	if err != nil {
		return resp, err
	}

	return resp, nil
}

func (c *conversationImpl) NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error) {
	resp := &entity.NewConversationCtxResponse{}
	updateColumn := make(map[string]interface{})

	newSectionID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return resp, err
	}
	updateColumn["section_id"] = newSectionID
	updateColumn["updated_at"] = time.Now().UnixMilli()

	affectRows, err := c.ConversationDAO.Edit(ctx, req.ID, updateColumn)
	if err != nil {
		return resp, err
	}
	if affectRows != 0 {
		resp.ID = req.ID
		resp.SectionID = newSectionID
	}
	return resp, nil
}

func (c *conversationImpl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrentRequest) (*entity.Conversation, error) {
	// get conversation
	conversation, err := c.ConversationDAO.Get(ctx, req.UserID, req.AgentID, req.Scene)

	if err != nil {
		return nil, err
	}

	// build data
	return conversation, nil
}

func (c *conversationImpl) Delete(ctx context.Context, req *entity.DeleteRequest) error {

	updateColumn := make(map[string]interface{})
	updateColumn["updated_at"] = time.Now().UnixMilli()
	updateColumn["status"] = entity.ConversationStatusDeleted
	_, err := c.ConversationDAO.Edit(ctx, req.ID, updateColumn)
	if err != nil {
		return err
	}
	return nil
}

func (c *conversationImpl) List(ctx context.Context, req *entity.ListRequest) ([]*entity.Conversation, bool, error) {
	conversationList, hasMore, err := c.ConversationDAO.List(ctx, req.UserID, req.AgentID, req.ConnectorID, int32(req.Scene), req.Limit, req.Page)

	if err != nil {
		return nil, hasMore, err
	}

	return conversationList, hasMore, nil
}
