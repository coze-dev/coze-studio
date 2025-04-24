package conversation

import (
	"context"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/common"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/internal/model"
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
		IDGen:           c.IDGen,
		ConversationDAO: dal.NewConversationDAO(c.DB),
	}
}

func (c *conversationImpl) Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error) {
	resp := &entity.CreateResponse{}

	createData, err := c.buildData2Po(ctx, req)
	if err != nil {
		return nil, err
	}

	//create conversation
	err = c.ConversationDAO.Create(ctx, createData)
	if err != nil {
		return resp, err
	}
	cd := c.buildPo2Data(ctx, createData)
	resp.Conversation = cd
	return resp, nil
}

func (c *conversationImpl) buildData2Po(ctx context.Context, req *entity.CreateRequest) (*model.Conversation, error) {
	//gen two IDs
	conversationID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	sectionID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	now := time.Now().UnixMilli()

	return &model.Conversation{
		ID:          conversationID,
		AgentID:     req.AgentID,
		SectionID:   sectionID,
		ConnectorID: req.ConnectorID,
		Scene:       int32(req.Scene),
		Ext:         req.Ext,
		CreatorID:   req.UserID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (c *conversationImpl) GetByID(ctx context.Context, req *entity.GetByIDRequest) (*entity.GetByIDResponse, error) {
	resp := &entity.GetByIDResponse{}
	//get conversation
	conversation, err := c.ConversationDAO.GetByID(ctx, req.ID)

	if err != nil {
		return resp, err
	}
	//build data
	resp.Conversation = c.buildPo2Data(ctx, conversation)

	return resp, nil
}

func (c *conversationImpl) buildPo2Data(ctx context.Context, po *model.Conversation) *entity.Conversation {

	return &entity.Conversation{
		ID:          po.ID,
		AgentID:     po.AgentID,
		SectionID:   po.SectionID,
		ConnectorID: po.ConnectorID,
		Scene:       common.Scene(po.Scene),
		Ext:         po.Ext,
		Status:      entity.ConversationStatus(po.Status),
		CreatorID:   po.CreatorID,
		CreatedAt:   po.CreatedAt,
		UpdatedAt:   po.UpdatedAt,
	}
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

func (c *conversationImpl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrentRequest) (*entity.GetCurrentResponse, error) {
	resp := &entity.GetCurrentResponse{}
	//get conversation
	conversation, err := c.ConversationDAO.Get(ctx, req.UserID, req.AgentID, req.Scene)
	if err != nil {
		return resp, err
	}
	if conversation != nil {
		resp.Conversation = c.buildPo2Data(ctx, conversation)
	}
	//build data
	return resp, nil
}

func (c *conversationImpl) Delete(ctx context.Context, req *entity.DeleteRequest) (*entity.DeleteResponse, error) {
	resp := &entity.DeleteResponse{}

	updateColumn := make(map[string]interface{})
	updateColumn["updated_at"] = time.Now().UnixMilli()
	updateColumn["status"] = entity.ConversationStatusDeleted
	_, err := c.ConversationDAO.Edit(ctx, req.ID, updateColumn)
	if err != nil {
		return resp, err
	}
	return resp, nil
}
