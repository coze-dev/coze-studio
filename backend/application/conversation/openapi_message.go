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

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	"github.com/coze-dev/coze-studio/backend/crossdomain/message/model"

	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	uploadService "github.com/coze-dev/coze-studio/backend/domain/upload/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type OpenapiMessageApplication struct {
	UploaodDomainSVC uploadService.UploadService
}

var OpenapiMessageSVC = new(OpenapiMessageApplication)

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

	if mr.Limit == nil {
		mr.Limit = ptr.Of(int64(50))
	}

	msgListMeta := &entity.ListMeta{
		ConversationID: currentConversation.ID,
		AgentID:        currentConversation.AgentID,
		Limit:          int(ptr.From(mr.Limit)),

		MessageType: []*model.MessageType{
			ptr.Of(model.MessageTypeQuestion),
			ptr.Of(model.MessageTypeAnswer),
		},
	}
	if mr.ChatID != nil {
		msgListMeta.RunID = []*int64{mr.ChatID}
	}

	if mr.BeforeID != nil {
		msgListMeta.Direction = entity.ScrollPageDirectionNext
		msgListMeta.Cursor = *mr.BeforeID
	} else {
		msgListMeta.Direction = entity.ScrollPageDirectionPrev
		msgListMeta.Cursor = ptr.From(mr.AfterID)
	}
	if mr.Order == nil {
		msgListMeta.OrderBy = ptr.Of(message.OrderByDesc)
	} else {
		msgListMeta.OrderBy = mr.Order
	}

	mListMessages, err := ConversationSVC.MessageDomainSVC.ListWithoutPair(ctx, msgListMeta)
	if err != nil {
		return nil, err
	}

	resp := m.buildMessageListResponse(ctx, mListMessages, currentConversation)

	return resp, nil
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
			ID:               dm.ID,
			ConversationID:   dm.ConversationID,
			BotID:            dm.AgentID,
			Role:             string(dm.Role),
			Type:             string(dm.MessageType),
			Content:          content,
			ContentType:      string(dm.ContentType),
			SectionID:        strconv.FormatInt(dm.SectionID, 10),
			CreatedAt:        dm.CreatedAt / 1000,
			UpdatedAt:        dm.UpdatedAt / 1000,
			ChatID:           dm.RunID,
			MetaData:         dm.Ext,
			ReasoningContent: ptr.Of(dm.ReasoningContent),
		}
		if dm.ContentType == model.ContentTypeMix {
			msg.ContentType = run.ContentTypeMixApi
			if dm.DisplayContent != "" {
				msg.Content = m.parseDisplayContent(ctx, dm)
			}
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

func (m *OpenapiMessageApplication) parseDisplayContent(ctx context.Context, dm *entity.Message) string {

	var inputs []*run.AdditionalContent
	err := json.Unmarshal([]byte(dm.DisplayContent), &inputs)

	if err != nil {
		return dm.DisplayContent
	}
	for k, one := range inputs {
		if one == nil {
			continue
		}
		switch model.InputType(one.Type) {
		case model.InputTypeText:
			continue
		case model.InputTypeImage, model.InputTypeFile:
			if one.GetFileID() != 0 {
				fileInfo, err := m.UploaodDomainSVC.GetFile(ctx, &uploadService.GetFileRequest{
					ID: one.GetFileID(),
				})
				if err == nil {
					inputs[k].FileURL = ptr.Of(fileInfo.File.Url)
					inputs[k].Name = ptr.Of(fileInfo.File.Name)
					inputs[k].Size = ptr.Of(fileInfo.File.FileSize)
				}
			}
		default:
			continue
		}
	}
	content, err := json.Marshal(inputs)
	if err == nil {
		dm.DisplayContent = string(content)
	}
	return dm.DisplayContent
}
