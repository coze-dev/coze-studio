package conversation

import (
	"context"
	"time"

	"gorm.io/gorm"

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
	resp.ID = createData.ID
	return resp, nil
}

func (c *conversationImpl) buildData2Po(ctx context.Context, req *entity.CreateRequest) (*model.Conversation, error) {
	//gen conversationID
	conversationID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	//gen sectionID
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
		Ext:         req.Ext,
		CreatorID:   req.CreatorID,
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
		Ext:         po.Ext,
		CreatorID:   po.CreatorID,
		CreatedAt:   po.CreatedAt,
		UpdatedAt:   po.UpdatedAt,
	}
}

func (c *conversationImpl) Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error) {
	resp := &entity.EditResponse{}
	updateColumn := make(map[string]interface{})
	if req.Ext != "" {
		updateColumn["ext"] = req.Ext
	}
	if req.SectionID != 0 {
		updateColumn["section_id"] = req.SectionID
	}
	_, err := c.ConversationDAO.Edit(ctx, req.ID, updateColumn)
	if err != nil {
		return resp, err
	}
	return resp, nil
}
