/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package conversation

import (
	"context"
	"encoding/json"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	singleAgentEntity "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (c *ConversationApplicationService) GetMessageList(ctx context.Context, mr *message.GetMessageListRequest) (*message.GetMessageListResponse, error) {
	// Get Conversation ID by agent id & userID & scene
	userID := ctxutil.GetUIDFromCtx(ctx)

	agentID, err := strconv.ParseInt(mr.BotID, 10, 64)
	if err != nil {
		return nil, err
	}

	currentConversation, isNewCreate, err := c.getCurrentConversation(ctx, *userID, agentID, *mr.Scene, nil)
	if err != nil {
		return nil, err
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

	mListMessages, err := c.MessageDomainSVC.List(ctx, &entity.ListMeta{
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

	agentInfo, err := c.buildAgentInfo(ctx, agentIDs)
	if err != nil {
		return nil, err
	}
	resp := c.buildMessageListResponse(ctx, mListMessages, currentConversation)

	resp.ParticipantInfoMap = map[string]*message.MsgParticipantInfo{}
	for _, aOne := range agentInfo {
		resp.ParticipantInfoMap[aOne.ID] = aOne
	}
	return resp, err
}

func (c *ConversationApplicationService) buildAgentInfo(ctx context.Context, agentIDs []int64) ([]*message.MsgParticipantInfo, error) {
	var result []*message.MsgParticipantInfo
	if len(agentIDs) > 0 {
		agentInfos, err := c.appContext.SingleAgentDomainSVC.MGetSingleAgentDraft(ctx, agentIDs)
		if err != nil {
			return nil, err
		}

		result = slices.Transform(agentInfos, func(a *singleAgentEntity.SingleAgent) *message.MsgParticipantInfo {
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

func (c *ConversationApplicationService) getCurrentConversation(ctx context.Context, userID int64, agentID int64, scene common.Scene, connectorID *int64) (*convEntity.Conversation, bool, error) {
	var currentConversation *convEntity.Conversation
	var isNewCreate bool

	if connectorID == nil && scene == common.Scene_Playground {
		connectorID = ptr.Of(consts.CozeConnectorID)
	}

	currentConversation, err := c.ConversationDomainSVC.GetCurrentConversation(ctx, &convEntity.GetCurrent{
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
		ccNew, err := c.ConversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
			AgentID:     agentID,
			UserID:      userID,
			Scene:       scene,
			ConnectorID: ptr.From(connectorID),
		})
		if err != nil {
			return nil, isNewCreate, err
		}
		if ccNew == nil {
			return nil, isNewCreate,
				errorx.New(errno.ErrConversationNotFound)
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

func (c *ConversationApplicationService) buildMessageListResponse(ctx context.Context, mListMessages *entity.ListResult, currentConversation *convEntity.Conversation) *message.GetMessageListResponse {
	var messages []*message.ChatMessage
	runToQuestionIDMap := make(map[int64]int64)

	for _, mMessage := range mListMessages.Messages {
		if mMessage.MessageType == model.MessageTypeQuestion {
			runToQuestionIDMap[mMessage.RunID] = mMessage.ID
		}
	}

	for _, mMessage := range mListMessages.Messages {
		messages = append(messages, c.buildDomainMsg2VOMessage(ctx, mMessage, runToQuestionIDMap))
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

func (c *ConversationApplicationService) buildDomainMsg2VOMessage(ctx context.Context, dm *entity.Message, runToQuestionIDMap map[int64]int64) *message.ChatMessage {
	cm := &message.ChatMessage{
		MessageID:        strconv.FormatInt(dm.ID, 10),
		Role:             string(dm.Role),
		Type:             string(dm.MessageType),
		Content:          dm.Content,
		ContentType:      string(dm.ContentType),
		ReplyID:          "0",
		SectionID:        strconv.FormatInt(dm.SectionID, 10),
		ExtraInfo:        buildDExt2ApiExt(dm.Ext),
		ContentTime:      dm.CreatedAt,
		Status:           "available",
		Source:           0,
		ReasoningContent: ptr.Of(dm.ReasoningContent),
	}

	if dm.Status == model.MessageStatusBroken {
		cm.BrokenPos = ptr.Of(dm.Position)
	}

	if dm.ContentType == model.ContentTypeMix && dm.DisplayContent != "" {
		cm.Content = c.buildParseMessageURI(ctx, dm.DisplayContent)
	}

	if dm.MessageType != model.MessageTypeQuestion {
		cm.ReplyID = strconv.FormatInt(runToQuestionIDMap[dm.RunID], 10)
		cm.SenderID = ptr.Of(strconv.FormatInt(dm.AgentID, 10))
	}
	return cm
}

func (c *ConversationApplicationService) buildParseMessageURI(ctx context.Context, msgContent string) string {

	if msgContent == "" {
		return msgContent
	}

	var mc *run.MixContentModel
	err := json.Unmarshal([]byte(msgContent), &mc)
	if err != nil {
		return msgContent
	}
	for k, item := range mc.ItemList {
		switch item.Type {
		case run.ContentTypeImage:

			url, pErr := c.appContext.ImageX.GetResourceURL(ctx, item.Image.Key)
			if pErr == nil {
				mc.ItemList[k].Image.ImageThumb.URL = url.URL
				mc.ItemList[k].Image.ImageOri.URL = url.URL
			}

		case run.ContentTypeFile, run.ContentTypeAudio, run.ContentTypeVideo:
			url, pErr := c.appContext.ImageX.GetResourceURL(ctx, item.File.FileKey)
			if pErr == nil {
				mc.ItemList[k].File.FileURL = url.URL

			}

		default:

		}
	}
	jsonMsg, err := json.Marshal(mc)
	if err != nil {
		return msgContent
	}

	return string(jsonMsg)
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

func (c *ConversationApplicationService) DeleteMessage(ctx context.Context, mr *message.DeleteMessageRequest) (*message.DeleteMessageResponse, error) {
	resp := new(message.DeleteMessageResponse)
	messageInfo, err := c.MessageDomainSVC.GetByID(ctx, mr.MessageID)
	if err != nil {
		return resp, err
	}
	if messageInfo == nil {
		return resp, errorx.New(errno.ErrConversationMessageNotFound)
	}

	userID := ctxutil.GetUIDFromCtx(ctx)
	if messageInfo.UserID != conv.Int64ToStr(*userID) {
		return resp, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "permission denied"))
	}

	err = c.AgentRunDomainSVC.Delete(ctx, []int64{messageInfo.RunID})
	if err != nil {
		return resp, err
	}

	err = c.MessageDomainSVC.Delete(ctx, &entity.DeleteMeta{
		RunIDs: []int64{messageInfo.RunID},
	})
	if err != nil {
		return resp, nil
	}

	return resp, nil
}

func (c *ConversationApplicationService) BreakMessage(ctx context.Context, mr *message.BreakMessageRequest) (*message.BreakMessageResponse, error) {
	resp := new(message.BreakMessageResponse)

	err := c.MessageDomainSVC.Broken(ctx, &entity.BrokenMeta{
		ID:       *mr.AnswerMessageID,
		Position: mr.BrokenPos,
	})
	if err != nil {
		return resp, err
	}

	return resp, nil
}
