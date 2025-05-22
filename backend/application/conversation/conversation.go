package conversation

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type ConversationApplication struct{}

var ConversationApplicationService = new(ConversationApplication)

func (c *ConversationApplication) ClearHistory(ctx context.Context, req *conversation.ClearConversationHistoryRequest) (*entity.Conversation, error) {
	conversationID, err := strconv.ParseInt(req.ConversationID, 10, 64)
	if err != nil {
		return nil, err
	}

	// get conversation
	currentRes, err := conversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	if currentRes == nil {
		return nil, errorx.New(errno.ErrorConversationNotFound)
	}
	// check user
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.CreatorID {
		return nil, errorx.New(errno.ErrorConversationNotFound, errorx.KV("msg", "user not match"))
	}

	// delete conversation
	err = conversationDomainSVC.Delete(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	// create new conversation
	convRes, err := conversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID: currentRes.AgentID,
		UserID:  currentRes.CreatorID,
		Scene:   currentRes.Scene,
	})
	if err != nil {
		return nil, err
	}

	return convRes, nil
}

func (c *ConversationApplication) CreateSection(ctx context.Context, conversationID int64) (int64, error) {
	currentRes, err := conversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return 0, err
	}

	if currentRes == nil {
		return 0, errorx.New(errno.ErrorConversationNotFound, errorx.KV("msg", "conversation not found"))
	}
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.CreatorID {
		return 0, errorx.New(errno.ErrorConversationNotFound, errorx.KV("msg", "user not match"))
	}

	convRes, err := conversationDomainSVC.NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}
	return convRes.SectionID, nil
}

func (c *ConversationApplication) CreateConversation(ctx context.Context, agentID int64, connectorID int64) (*conversation.ConversationData, error) {

	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrorConversationNotFound)
	}
	conversationData, err := conversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID:     agentID,
		UserID:      *userID,
		ConnectorID: connectorID,
	})

	if err != nil {
		return nil, err
	}

	return &conversation.ConversationData{
		Id:            conversationData.ID,
		LastSectionID: &conversationData.SectionID,
		ConnectorID:   &conversationData.ConnectorID,
		CreatedAt:     conversationData.CreatedAt,
	}, nil
}

func (c *ConversationApplication) ListConversation(ctx context.Context, req *conversation.ListConversationsApiRequest) ([]*conversation.ConversationData, bool, error) {
	var hasMore bool
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, hasMore, errorx.New(errno.ErrorConversationNotFound)
	}

	conversationDOList, hasMore, err := conversationDomainSVC.List(ctx, &entity.ListMeta{
		UserID:      *userID,
		AgentID:     req.GetBotID(),
		ConnectorID: req.GetConnectorID(),
		Page:        int(req.GetPageNum()),
		Limit:       int(req.GetPageSize()),
	})
	if err != nil {
		return nil, hasMore, err
	}
	conversationData := slices.Transform(conversationDOList, func(conv *entity.Conversation) *conversation.ConversationData {
		return &conversation.ConversationData{
			Id:            conv.ID,
			LastSectionID: &conv.SectionID,
			ConnectorID:   &conv.ConnectorID,
			CreatedAt:     conv.CreatedAt,
		}
	})

	return conversationData, hasMore, nil
}
