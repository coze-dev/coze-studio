package conversation

import (
	"context"
	"errors"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	singleAgent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	runEntity "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/common"
	convEntity "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type MessageApplication struct{}

var MessageApplicationService = new(MessageApplication)

func (m *MessageApplication) GetMessageList(ctx context.Context, mr *message.GetMessageListRequest) (*message.GetMessageListResponse, error) {
	// Get Conversation ID by agent id & userID & scene
	userID := ctxutil.GetUIDFromCtx(ctx)

	agentID, err := strconv.ParseInt(mr.BotID, 10, 64)
	if err != nil {
		return nil, err
	}

	currentConversation, isNewCreate, err := getCurrentConversation(ctx, *userID, agentID, common.Scene(*mr.Scene), nil)
	if err != nil {
		return nil, err
	}

	if currentConversation == nil {
		return nil, errors.New("conversation data is nil")
	}

	if isNewCreate {
		return &message.GetMessageListResponse{
			MessageList:    []*message.ChatMessage{},
			Cursor:         mr.Cursor,
			NextCursor:     "0",
			NextHasMore:    false,
			ConversationID: strconv.FormatInt(currentConversation.ID, 10),
			LastSectionID:  ptr.Of(strconv.FormatInt(currentConversation.SectionID, 10)),
		}, nil
	}

	cursor, err := strconv.ParseInt(mr.Cursor, 10, 64)
	if err != nil {
		return nil, err
	}

	mListMessages, err := messageDomainSVC.List(ctx, &entity.ListMeta{
		UserID:         *userID,
		ConversationID: currentConversation.ID,
		AgentID:        agentID,
		Limit:          int(mr.Count),
		Cursor:         cursor,
		Direction:      loadDirectionToScrollDirection(mr.LoadDirection),
	})

	if err != nil {
		return nil, err
	}

	// get agent id
	var agentIDs []int64
	for _, mOne := range mListMessages.Messages {
		agentIDs = append(agentIDs, mOne.AgentID)
	}

	agentInfo, err := buildAgentInfo(ctx, agentIDs)
	if err != nil {
		return nil, err
	}
	resp := m.buildMessageListResponse(ctx, mListMessages, currentConversation)

	resp.ParticipantInfoMap = map[string]*message.MsgParticipantInfo{}
	for _, aOne := range agentInfo {
		resp.ParticipantInfoMap[aOne.ID] = aOne
	}
	return resp, err
}

func buildAgentInfo(ctx context.Context, agentIDs []int64) ([]*message.MsgParticipantInfo, error) {

	var result []*message.MsgParticipantInfo
	if len(agentIDs) > 0 {
		agentInfos, err := singleAgentDomainSVC.MGetSingleAgentDraft(ctx, agentIDs)
		if err != nil {
			return nil, err
		}

		result = slices.Transform(agentInfos, func(a *singleAgent.SingleAgent) *message.MsgParticipantInfo {
			return &message.MsgParticipantInfo{
				ID:        strconv.FormatInt(a.AgentID, 10),
				Name:      a.Name,
				UserID:    strconv.FormatInt(a.CreatorID, 10),
				Desc:      a.Desc,
				AvatarURL: a.IconURI,
			}
		})
	}

	return result, nil

}

func getCurrentConversation(ctx context.Context, userID int64, agentID int64, scene common.Scene, connectorID *int64) (*convEntity.Conversation, bool, error) {
	var currentConversation *convEntity.Conversation
	var isNewCreate bool

	if connectorID == nil && scene == common.ScenePlayground {
		connectorID = ptr.Of(consts.CozeConnectorID)
	}

	currentConversation, err := conversationDomainSVC.GetCurrentConversation(ctx, &convEntity.GetCurrent{
		UserID:      userID,
		Scene:       scene,
		AgentID:     agentID,
		ConnectorID: ptr.From(connectorID),
	})
	if err != nil {
		return nil, isNewCreate, err
	}

	if currentConversation == nil { // new conversation
		// create conversation
		ccNew, err := conversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
			AgentID:     agentID,
			UserID:      userID,
			Scene:       scene,
			ConnectorID: ptr.From(connectorID),
		})
		if err != nil {
			return nil, isNewCreate, err
		}
		if ccNew == nil {
			return nil, isNewCreate, errors.New("conversation data is nil")
		}
		isNewCreate = true
		currentConversation = ccNew
	}

	return currentConversation, isNewCreate, nil
}

func loadDirectionToScrollDirection(direction *message.LoadDirection) entity.ScrollPageDirection {
	if direction != nil && *direction == message.LoadDirection_Next {
		return entity.ScrollPageDirectionNext
	}
	return entity.ScrollPageDirectionPrev
}

func (m *MessageApplication) buildMessageListResponse(ctx context.Context, mListMessages *entity.ListResult, currentConversation *convEntity.Conversation) *message.GetMessageListResponse {
	var messages []*message.ChatMessage
	runToQuestionIDMap := make(map[int64]int64)

	for _, mMessage := range mListMessages.Messages {
		if mMessage.MessageType == runEntity.MessageTypeQuestion {
			runToQuestionIDMap[mMessage.RunID] = mMessage.ID
		}
	}

	for _, mMessage := range mListMessages.Messages {
		messages = append(messages, m.buildDomainMsg2VOMessage(ctx, mMessage, runToQuestionIDMap))
	}

	resp := &message.GetMessageListResponse{
		MessageList:             messages,
		Cursor:                  strconv.FormatInt(mListMessages.PrevCursor, 10),
		NextCursor:              strconv.FormatInt(mListMessages.NextCursor, 10),
		ConversationID:          strconv.FormatInt(currentConversation.ID, 10),
		LastSectionID:           ptr.Of(strconv.FormatInt(currentConversation.SectionID, 10)),
		ConnectorConversationID: strconv.FormatInt(currentConversation.ID, 10),
	}

	if mListMessages.Direction == entity.ScrollPageDirectionPrev {
		resp.Hasmore = mListMessages.HasMore
	} else {
		resp.NextHasMore = mListMessages.HasMore
	}

	return resp
}

func (m *MessageApplication) buildDomainMsg2VOMessage(ctx context.Context, dm *entity.Message, runToQuestionIDMap map[int64]int64) *message.ChatMessage {
	cm := &message.ChatMessage{
		MessageID:   strconv.FormatInt(dm.ID, 10),
		Role:        string(dm.Role),
		Type:        string(dm.MessageType),
		Content:     dm.Content,
		ContentType: string(dm.ContentType),
		ReplyID:     "0",
		SectionID:   strconv.FormatInt(dm.SectionID, 10),
		ExtraInfo:   buildDExt2ApiExt(dm.Ext),
		ContentTime: dm.CreatedAt,
		Status:      "available",
		Source:      0,
	}

	if dm.Status == entity.MessageStatusBroken {
		cm.BrokenPos = ptr.Of(dm.Position)
	}

	if dm.ContentType == runEntity.ContentTypeMix && dm.DisplayContent != "" {
		cm.Content = dm.DisplayContent
	}

	if dm.MessageType != runEntity.MessageTypeQuestion {
		cm.ReplyID = strconv.FormatInt(runToQuestionIDMap[dm.RunID], 10)
		cm.SenderID = ptr.Of(strconv.FormatInt(dm.AgentID, 10))
	}
	return cm
}

func buildDExt2ApiExt(extra map[string]string) *message.ExtraInfo {
	return &message.ExtraInfo{
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

func (m *MessageApplication) DeleteMessage(ctx context.Context, mr *message.DeleteMessageRequest) error {
	// get message id
	messageID, err := strconv.ParseInt(mr.MessageID, 10, 64)
	if err != nil {
		return err
	}
	messageInfo, err := messageDomainSVC.GetByID(ctx, messageID)
	if err != nil {
		return err
	}
	if messageInfo == nil {
		return errors.New("message not found")
	}
	userID := ctxutil.GetUIDFromCtx(ctx)
	if messageInfo.UserID != *userID {
		return errors.New("permission denied")
	}

	return messageDomainSVC.Delete(ctx, &entity.DeleteMeta{
		RunIDs: []int64{messageInfo.RunID},
	})
}

func (m *MessageApplication) BreakMessage(ctx context.Context, mr *message.BreakMessageRequest) error {
	aMID, err := strconv.ParseInt(*mr.AnswerMessageID, 10, 64)
	if err != nil {
		return err
	}

	return messageDomainSVC.Broken(ctx, &entity.BrokenMeta{
		ID:       aMID,
		Position: mr.BrokenPos,
	})
}
