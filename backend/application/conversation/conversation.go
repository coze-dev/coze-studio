package conversation

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/common"
	"code.byted.org/flow/opencoze/backend/api/model/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	agentrun "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/service"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	conversationService "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
	message "code.byted.org/flow/opencoze/backend/domain/conversation/message/service"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/service"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type ConversationApplicationService struct {
	appContext *ServiceComponents

	AgentRunDomainSVC     agentrun.Run
	ConversationDomainSVC conversationService.Conversation
	MessageDomainSVC      message.Message

	ShortcutDomainSVC service.ShortcutCmd
}

var ConversationSVC = new(ConversationApplicationService)

type OpenapiAgentRunApplication struct {
	ShortcutDomainSVC service.ShortcutCmd
}

var ConversationOpenAPISVC = new(OpenapiAgentRunApplication)

func (c *ConversationApplicationService) ClearHistory(ctx context.Context, req *conversation.ClearConversationHistoryRequest) (*entity.Conversation, error) {
	conversationID, err := strconv.ParseInt(req.ConversationID, 10, 64)
	if err != nil {
		return nil, err
	}

	// get conversation
	currentRes, err := c.ConversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	if currentRes == nil {
		return nil, errorx.New(errno.ErrConversationNotFound)
	}
	// check user
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.CreatorID {
		return nil, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "user not match"))
	}

	// delete conversation
	err = c.ConversationDomainSVC.Delete(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	// create new conversation
	convRes, err := c.ConversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID: currentRes.AgentID,
		UserID:  currentRes.CreatorID,
		Scene:   currentRes.Scene,
	})
	if err != nil {
		return nil, err
	}

	return convRes, nil
}

func (c *ConversationApplicationService) CreateSection(ctx context.Context, conversationID int64) (int64, error) {
	currentRes, err := c.ConversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return 0, err
	}

	if currentRes == nil {
		return 0, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "conversation not found"))
	}
	var userID int64
	if currentRes.ConnectorID == consts.CozeConnectorID {
		userID = ctxutil.MustGetUIDFromCtx(ctx)
	} else {
		userID = ctxutil.MustGetUIDFromApiAuthCtx(ctx)
	}

	if userID != currentRes.CreatorID {
		return 0, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "user not match"))
	}

	convRes, err := c.ConversationDomainSVC.NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}
	return convRes.SectionID, nil
}

func (c *ConversationApplicationService) CreateConversation(ctx context.Context, agentID int64, connectorID int64) (*conversation.ConversationData, error) {
	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID
	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	conversationData, err := c.ConversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID:     agentID,
		UserID:      userID,
		ConnectorID: connectorID,
		Scene:       common.Scene_SceneOpenApi,
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

func (c *ConversationApplicationService) ListConversation(ctx context.Context, req *conversation.ListConversationsApiRequest) ([]*conversation.ConversationData, bool, error) {
	var hasMore bool

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID
	connectorID := apiKeyInfo.ConnectorID

	if userID == 0 {
		return nil, hasMore, errorx.New(errno.ErrConversationNotFound)
	}
	if ptr.From(req.ConnectorID) == consts.WebSDKConnectorID {
		connectorID = ptr.From(req.ConnectorID)
	}

	conversationDOList, hasMore, err := c.ConversationDomainSVC.List(ctx, &entity.ListMeta{
		UserID:      userID,
		AgentID:     req.GetBotID(),
		ConnectorID: connectorID,
		Scene:       common.Scene_SceneOpenApi,
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
