package conversation

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
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
	currentRes, err := conversationDomainSVC.GetByID(ctx, &entity.GetByIDRequest{
		ID: conversationID,
	})
	if err != nil {
		return nil, err
	}
	if currentRes == nil || currentRes.Conversation == nil {
		return nil, errorx.New(errno.ErrorConversationNotFound)
	}
	// check user
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.Conversation.CreatorID {
		return nil, errorx.New(errno.ErrorConversationNotFound, errorx.KV("msg", "user not match"))
	}

	// delete conversation
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

func (c *ConversationApplication) CreateSection(ctx context.Context, req *conversation.ClearConversationCtxRequest) (int64, error) {
	conversationID, err := strconv.ParseInt(req.ConversationID, 10, 64)
	if err != nil {
		return 0, err
	}
	currentRes, err := conversationDomainSVC.GetByID(ctx, &entity.GetByIDRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}

	if currentRes == nil || currentRes.Conversation == nil {
		return 0, errorx.New(errno.ErrorConversationNotFound, errorx.KV("msg", "conversation not found"))
	}
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.Conversation.CreatorID {
		return 0, errorx.New(errno.ErrorConversationNotFound, errorx.KV("msg", "user not match"))
	}
	// edit conversation
	convRes, err := conversationDomainSVC.NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}
	return convRes.SectionID, nil
}
