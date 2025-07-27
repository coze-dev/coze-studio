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
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	message3 "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
		return nil, errorx.New(errno.ErrConversationNotFound)
	}

	if currentConversation.CreatorID != userID {
		return nil, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "permission denied"))
	}

	msgListMeta := &entity.ListMeta{
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

	mListMessages, err := ConversationSVC.MessageDomainSVC.List(ctx, msgListMeta)
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
	conversationInfo, err := ConversationSVC.ConversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	return conversationInfo, nil
}

func (m *OpenapiMessageApplication) buildMessageListResponse(ctx context.Context, mListMessages *entity.ListResult, currentConversation *convEntity.Conversation) *message.ListMessageApiResponse {
	messagesVO := slices.Transform(mListMessages.Messages, func(dm *entity.Message) *message.OpenMessageApi {

		content := dm.Content

		msg := &message.OpenMessageApi{
			ID:             dm.ID,
			ConversationID: dm.ConversationID,
			BotID:          dm.AgentID,
			Role:           string(dm.Role),
			Type:           string(dm.MessageType),
			Content:        content,
			ContentType:    string(dm.ContentType),
			SectionID:      strconv.FormatInt(dm.SectionID, 10),
			CreatedAt:      dm.CreatedAt / 1000,
			UpdatedAt:      dm.UpdatedAt / 1000,
			ChatID:         dm.RunID,
			MetaData:       dm.Ext,
		}
		if dm.ContentType == message3.ContentTypeMix && dm.DisplayContent != "" {
			msg.Content = dm.DisplayContent
			msg.ContentType = run.ContentTypeMixApi
		}
		return msg
	})

	resp := &message.ListMessageApiResponse{
		Messages: messagesVO,
		HasMore:  ptr.Of(mListMessages.HasMore),
		FirstID:  ptr.Of(mListMessages.PrevCursor),
		LastID:   ptr.Of(mListMessages.NextCursor),
	}

	return resp
}
