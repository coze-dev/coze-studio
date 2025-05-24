package conversation

import (
	"context"
	"errors"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	convEntity "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type OpenapiMessageApplication struct{}

var OpenapiMessageApplicationService = new(OpenapiMessageApplication)

func (m *OpenapiMessageApplication) GetApiMessageList(ctx context.Context, mr *message.ListMessageApiRequest) (*message.ListMessageApiResponse, error) {
	// Get Conversation ID by agent id & userID & scene
	userID := ctxutil.MustGetUIDFromApiAuthCtx(ctx)

	currentConversation, err := getConversation(ctx, mr.ConversationID)
	if err != nil {
		return nil, err
	}

	if currentConversation == nil {
		return nil, errors.New("conversation data is nil")
	}

	msgListMeta := &entity.ListMeta{
		UserID:         userID,
		ConversationID: currentConversation.ID,
		AgentID:        currentConversation.AgentID,
		Limit:          int(ptr.From(mr.Limit)),
	}

	if mr.BeforeID != nil {
		msgListMeta.Direction = entity.ScrollPageDirectionPrev
		msgListMeta.Cursor = *mr.BeforeID
	} else {
		msgListMeta.Direction = entity.ScrollPageDirectionNext
		msgListMeta.Cursor = ptr.From(mr.AfterID)
	}
	if mr.Order == nil {
		msgListMeta.OrderBy = ptr.Of(message.OrderByDesc)
	} else {
		msgListMeta.OrderBy = mr.Order
	}

	mListMessages, err := messageDomainSVC.List(ctx, msgListMeta)

	if err != nil {
		return nil, err
	}

	// get agent id
	var agentIDs []int64
	for _, mOne := range mListMessages.Messages {
		agentIDs = append(agentIDs, mOne.AgentID)
	}

	resp := m.buildMessageListResponse(ctx, mListMessages, currentConversation)

	return resp, err
}

func getConversation(ctx context.Context, conversationID int64) (*convEntity.Conversation, error) {

	conversationInfo, err := conversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	return conversationInfo, nil
}

func (m *OpenapiMessageApplication) buildMessageListResponse(ctx context.Context, mListMessages *entity.ListResult, currentConversation *convEntity.Conversation) *message.ListMessageApiResponse {

	messagesVO := slices.Transform(mListMessages.Messages, func(dm *entity.Message) *message.OpenMessageApi {
		return &message.OpenMessageApi{
			ID:             dm.ID,
			ConversationID: dm.ConversationID,
			BotID:          dm.AgentID,
			Role:           string(dm.Role),
			Type:           string(dm.MessageType),
			Content:        dm.Content,
			ContentType:    string(dm.ContentType),
			SectionID:      strconv.FormatInt(dm.SectionID, 10),
			CreatedAt:      dm.CreatedAt,
			UpdatedAt:      dm.UpdatedAt,
			ChatID:         dm.RunID,
			MetaData:       dm.Ext,
		}
	})

	resp := &message.ListMessageApiResponse{
		Messages: messagesVO,
		HasMore:  ptr.Of(mListMessages.HasMore),
		FirstID:  ptr.Of(mListMessages.PrevCursor),
		LastID:   ptr.Of(mListMessages.NextCursor),
	}

	return resp
}
