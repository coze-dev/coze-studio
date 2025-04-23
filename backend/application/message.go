package application

import (
	"context"
	"errors"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation_message"
	"code.byted.org/flow/opencoze/backend/domain/common"
	convEntity "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	runEntity "code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type MessageApplication struct{}

var MessageApplicationService = new(MessageApplication)

func (m *MessageApplication) GetMessageList(ctx context.Context, mr *conversation_message.GetMessageListRequest) (*conversation_message.GetMessageListResponse, error) {

	// Get Conversation ID by agent id & userID & scene
	userID := getUIDFromCtx(ctx)

	agentID, _ := strconv.ParseInt(mr.BotID, 10, 64)

	currentConversation, isNewCreate, err := getCurrentConversation(ctx, *userID, agentID, int32(*mr.Scene))
	if err != nil {
		return nil, err
	}

	if currentConversation == nil {
		return nil, errors.New("conversation data is nil")
	}

	if isNewCreate {
		return &conversation_message.GetMessageListResponse{
			MessageList:    []*conversation_message.ChatMessage{},
			Cursor:         mr.Cursor,
			NextCursor:     "0",
			NextHasMore:    false,
			ConversationID: strconv.FormatInt(currentConversation.ID, 10),
			LastSectionID:  ptr.Of(strconv.FormatInt(currentConversation.SectionID, 10)),
		}, nil
	}

	cursor, _ := strconv.ParseInt(mr.Cursor, 10, 64)

	mListMessages, err := messageDomainSVC.List(ctx, &entity.ListRequest{
		ConversationID: currentConversation.ID,
		AgentID:        agentID,
		Limit:          int(mr.Count),
		Cursor:         cursor,
		Direction:      loadDirectionToScrollDirection(mr.LoadDirection),
	})

	return m.buildMessageListResponse(ctx, mListMessages, currentConversation), err
}

func getCurrentConversation(ctx context.Context, userID int64, agentID int64, scene int32) (*convEntity.Conversation, bool, error) {

	var currentConversation *convEntity.Conversation
	var isNewCreate bool
	cc, err := conversationDomainSVC.GetCurrentConversation(ctx, &convEntity.GetCurrentRequest{
		UserID:  userID,
		Scene:   scene,
		AgentID: agentID,
	})

	if err != nil {
		return nil, isNewCreate, err
	}

	if cc == nil || cc.Conversation != nil { //new conversation
		//create conversation
		ccNew, err := conversationDomainSVC.Create(ctx, &convEntity.CreateRequest{
			AgentID: agentID,
			UserID:  userID,
			Scene:   common.Scene(scene),
		})
		if err != nil {
			return nil, isNewCreate, err
		}
		if ccNew == nil {
			return nil, isNewCreate, errors.New("conversation data is nil")
		}
		isNewCreate = true
		currentConversation = ccNew.Conversation
	}

	return currentConversation, isNewCreate, nil
}

func loadDirectionToScrollDirection(direction *conversation_message.LoadDirection) entity.ScrollPageDirection {
	if direction != nil && *direction == conversation_message.LoadDirection_Prev {
		return entity.ScrollPageDirectionPrev
	}
	return entity.ScrollPageDirectionNext
}

func (m *MessageApplication) buildMessageListResponse(ctx context.Context, mListMessages *entity.ListResponse, currentConversation *convEntity.Conversation) *conversation_message.GetMessageListResponse {

	var messages []*conversation_message.ChatMessage
	for _, mMessage := range mListMessages.Messages {
		messages = append(messages, m.buildDomainMsg2ApiMessage(ctx, mMessage))
	}
	return &conversation_message.GetMessageListResponse{
		MessageList:    messages,
		Cursor:         strconv.FormatInt(mListMessages.Cursor, 10),
		NextCursor:     strconv.FormatInt(mListMessages.Cursor, 10),
		NextHasMore:    mListMessages.HasMore,
		ConversationID: strconv.FormatInt(currentConversation.ID, 10),
		LastSectionID:  ptr.Of(strconv.FormatInt(currentConversation.SectionID, 10)),
	}
}

func (m *MessageApplication) buildDomainMsg2ApiMessage(ctx context.Context, dm *entity.Message) *conversation_message.ChatMessage {
	var content string

	for _, c := range dm.Content {
		if c.Type == runEntity.InputTypeText && c.Text != "" {
			content = c.Text
			break
		}
	}
	return &conversation_message.ChatMessage{
		MessageID:   strconv.FormatInt(dm.ID, 10),
		Role:        string(dm.Role),
		Type:        string(dm.MessageType),
		Content:     content,
		ContentType: string(dm.ContentType),
		ReplyID:     strconv.FormatInt(dm.ReplyID, 10),
		SectionID:   strconv.FormatInt(dm.SectionID, 10),
		ExtraInfo:   buildDExt2ApiExt(dm.Ext),
		ContentTime: dm.CreatedAt,
	}
}

func buildDExt2ApiExt(extra map[string]string) *conversation_message.ExtraInfo {

	return &conversation_message.ExtraInfo{
		InputTokens:         extra["input_tokens"],
		OutputTokens:        extra["output_tokens"],
		Token:               extra["token"],
		PluginStatus:        extra["plugin_status"],
		TimeCost:            extra["time_cost"],
		WorkflowTokens:      extra["workflow_tokens"],
		BotState:            extra["bot_state"],
		PluginRequest:       extra["plugin_request"],
		ToolName:            extra["tool_name"],
		Plugin:              extra["plugin"],
		MockHitInfo:         extra["mock_hit_info"],
		MessageTitle:        extra["message_title"],
		StreamPluginRunning: extra["stream_plugin_running"],
		ExecuteDisplayName:  extra["execute_display_name"],
		TaskType:            extra["task_type"],
		ReferFormat:         extra["refer_format"],
	}
}

func (m *MessageApplication) DeleteMessage(ctx context.Context, mr *conversation_message.DeleteMessageRequest) {

}

func (m *MessageApplication) BreakMessage(ctx context.Context, mr *conversation_message.BreakMessageRequest) {

}
