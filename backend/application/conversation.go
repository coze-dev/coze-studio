package application

import (
	"context"
	"errors"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation_conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
)

type ConversationApplication struct {
}

var ConversationApplicationService = new(ConversationApplication)

func (c *ConversationApplication) ClearHistory(ctx context.Context, req *conversation_conversation.ClearConversationHistoryRequest) (*entity.Conversation, error) {
	conversationID, _ := strconv.ParseInt(req.ConversationID, 10, 64)

	// get conversation
	currentRes, err := conversationDomainSVC.GetByID(ctx, &entity.GetByIDRequest{
		ID: conversationID,
	})
	if err != nil {
		return nil, err
	}
	if currentRes == nil || currentRes.Conversation == nil {
		return nil, errors.New("conversation not found")
	}
	// check user
	userID := getUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.Conversation.CreatorID {
		return nil, errors.New("user not match")
	}

	//delete conversation
	_, err = conversationDomainSVC.Delete(ctx, &entity.DeleteRequest{
		ID: conversationID,
	})

	if err != nil {
		return nil, err
	}
	// create new conversation
	convRes, err := conversationDomainSVC.Create(ctx, &entity.CreateRequest{
		AgentID: currentRes.Conversation.AgentID,
		UserID:  currentRes.Conversation.CreatorID,
		Scene:   currentRes.Conversation.Scene,
	})
	if err != nil {
		return nil, err
	}

	return convRes.Conversation, nil
}

func (c *ConversationApplication) CreateSection(ctx context.Context, req *conversation_conversation.ClearConversationCtxRequest) (int64, error) {
	conversationID, _ := strconv.ParseInt(req.ConversationID, 10, 64)
	currentRes, err := conversationDomainSVC.GetByID(ctx, &entity.GetByIDRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}
	if currentRes == nil || currentRes.Conversation == nil {
		return 0, errors.New("conversation not found")
	}
	userID := getUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.Conversation.CreatorID {
		return 0, errors.New("user not match")
	}
	//edit conversation
	convRes, err := conversationDomainSVC.NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}
	return convRes.SectionID, nil
}
