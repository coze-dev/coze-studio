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
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agentrun"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/contract/message"
	agententity "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	msgentity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type ConversationRepository struct {
}

// ClearMessage clears messages in a conversation
func (c *ConversationRepository) ClearMessage(ctx context.Context, req *conversation.ClearMessageRequest) (*conversation.ClearMessageResponse, error) {
	// Implementation would typically interact with the actual message service
	// For now, return a placeholder implementation
	return &conversation.ClearMessageResponse{}, nil
}

func NewConversationRepository() *ConversationRepository {
	return &ConversationRepository{}
}

func (c *ConversationRepository) CreateConversation(ctx context.Context, req *conversation.CreateConversationRequest) (int64, int64, error) {
	ret, err := crossconversation.DefaultSVC().Create(ctx, &entity.CreateMeta{
		AgentID:     req.AppID,
		UserID:      req.UserID,
		ConnectorID: req.ConnectorID,
		Scene:       common.Scene_SceneWorkflow,
	})
	if err != nil {
		return 0, 0, err
	}

	return ret.ID, ret.SectionID, nil
}

func (c *ConversationRepository) GetByID(ctx context.Context, id int64) (*entity.Conversation, error) {
	return crossconversation.DefaultSVC().GetByID(ctx, id)
}

func (c *ConversationRepository) CreateMessage(ctx context.Context, req *conversation.CreateMessageRequest) (int64, error) {
	msg := &message.Message{
		ConversationID: req.ConversationID,
		Role:           schema.RoleType(req.Role),
		Content:        req.Content,
		ContentType:    message.ContentType(req.ContentType),
		UserID:         strconv.FormatInt(req.UserID, 10),
		AgentID:        req.AppID,
		RunID:          req.RunID,
		SectionID:      req.SectionID,
	}
	if msg.Role == schema.User {
		msg.MessageType = message.MessageTypeQuestion
	} else {
		msg.MessageType = message.MessageTypeAnswer
	}
	ret, err := crossmessage.DefaultSVC().Create(ctx, msg)
	if err != nil {
		return 0, err
	}

	return ret.ID, nil
}

func (c *ConversationRepository) MessageList(ctx context.Context, req *conversation.MessageListRequest) (*conversation.MessageListResponse, error) {
	lm := &msgentity.ListMeta{
		ConversationID: req.ConversationID,
		Limit:          int(req.Limit), // Since the value of limit is checked inside the node, the type cast here is safe
		UserID:         strconv.FormatInt(req.UserID, 10),
		AgentID:        req.AppID,
		OrderBy:        req.OrderBy,
	}
	if req.BeforeID != nil {
		lm.Cursor, _ = strconv.ParseInt(*req.BeforeID, 10, 64)
		lm.Direction = msgentity.ScrollPageDirectionNext
	}
	if req.AfterID != nil {
		lm.Cursor, _ = strconv.ParseInt(*req.AfterID, 10, 64)
		lm.Direction = msgentity.ScrollPageDirectionPrev
	}
	lm.MessageType = []*message.MessageType{ptr.Of(message.MessageTypeQuestion), ptr.Of(message.MessageTypeAnswer)}

	lr, err := crossmessage.DefaultSVC().ListWithoutPair(ctx, lm)
	if err != nil {
		return nil, err
	}

	response := &conversation.MessageListResponse{
		HasMore: lr.HasMore,
	}

	if lr.PrevCursor > 0 {
		response.FirstID = strconv.FormatInt(lr.PrevCursor, 10)
	}
	if lr.NextCursor > 0 {
		response.LastID = strconv.FormatInt(lr.NextCursor, 10)
	}
	if len(lr.Messages) == 0 {
		return response, nil
	}
	messages, _, err := convertToConvAndSchemaMessage(ctx, lr.Messages)
	if err != nil {
		return nil, err
	}
	response.Messages = messages
	return response, nil
}

func (c *ConversationRepository) ClearConversationHistory(ctx context.Context, req *conversation.ClearConversationHistoryReq) (int64, error) {
	resp, err := crossconversation.DefaultSVC().NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: req.ConversationID,
	})
	if err != nil {
		return 0, err
	}
	return resp.SectionID, nil

}

func (c *ConversationRepository) DeleteMessage(ctx context.Context, req *conversation.DeleteMessageRequest) error {
	return crossmessage.DefaultSVC().Delete(ctx, &msgentity.DeleteMeta{
		MessageIDs: []int64{req.MessageID},
	})
}

func (c *ConversationRepository) EditMessage(ctx context.Context, req *conversation.EditMessageRequest) error {
	_, err := crossmessage.DefaultSVC().Edit(ctx, &msgentity.Message{
		ID:             req.MessageID,
		ConversationID: req.ConversationID,
		Content:        req.Content,
	})
	if err != nil {
		return err
	}
	return nil
}

func (c *ConversationRepository) GetLatestRunIDs(ctx context.Context, req *conversation.GetLatestRunIDsRequest) ([]int64, error) {
	listMeta := &agententity.ListRunRecordMeta{
		ConversationID: req.ConversationID,
		AgentID:        req.AppID,
		Limit:          int32(req.Rounds),
		SectionID:      req.SectionID,
	}

	if req.InitRunID != nil {
		listMeta.BeforeID = *req.InitRunID
	}

	runRecords, err := crossagentrun.DefaultSVC().List(ctx, listMeta)
	if err != nil {
		return nil, err
	}
	runIDs := make([]int64, 0, len(runRecords))
	for _, record := range runRecords {
		runIDs = append(runIDs, record.ID)
	}
	return runIDs, nil
}

func (c *ConversationRepository) GetMessagesByRunIDs(ctx context.Context, req *conversation.GetMessagesByRunIDsRequest) (*conversation.GetMessagesByRunIDsResponse, error) {
	responseMessages, err := crossmessage.DefaultSVC().GetByRunIDs(ctx, req.ConversationID, req.RunIDs)
	if err != nil {
		return nil, err
	}
	// only returns messages of type user/assistant/system role type
	messages := make([]*message.Message, 0, len(responseMessages))
	for _, m := range responseMessages {
		if m.Role == schema.User || m.Role == schema.System || m.Role == schema.Assistant {
			messages = append(messages, m)
		}
	}

	convMessages, scMessages, err := convertToConvAndSchemaMessage(ctx, messages)
	if err != nil {
		return nil, err
	}
	return &conversation.GetMessagesByRunIDsResponse{
		Messages:       convMessages,
		SchemaMessages: scMessages,
	}, nil
}

func convertToConvAndSchemaMessage(ctx context.Context, msgs []*msgentity.Message) ([]*conversation.Message, []*schema.Message, error) {
	messages := make([]*schema.Message, 0)
	convMessages := make([]*conversation.Message, 0)
	for _, m := range msgs {
		msg := &schema.Message{}
		err := sonic.UnmarshalString(m.ModelContent, msg)
		if err != nil {
			return nil, nil, err
		}
		// Only use database role if ModelContent doesn't have a role
		if msg.Role == "" {
			msg.Role = m.Role
		}

		covMsg := &conversation.Message{
			ID:          m.ID,
			Role:        msg.Role, // Use the corrected role from schema.Message
			ContentType: string(m.ContentType),
			SectionID:   m.SectionID,
		}

		if len(msg.MultiContent) == 0 {
			covMsg.Text = ptr.Of(msg.Content)
		} else {
			covMsg.MultiContent = make([]*conversation.Content, 0, len(msg.MultiContent))
			for _, part := range msg.MultiContent {
				switch part.Type {
				case schema.ChatMessagePartTypeText:
					covMsg.MultiContent = append(covMsg.MultiContent, &conversation.Content{
						Type: message.InputTypeText,
						Text: ptr.Of(part.Text),
					})

				case schema.ChatMessagePartTypeImageURL:
					if part.ImageURL != nil {
						part.ImageURL.URL, err = workflow.GetRepository().GetObjectUrl(ctx, part.ImageURL.URI)
						if err != nil {
							return nil, nil, err
						}
						covMsg.MultiContent = append(covMsg.MultiContent, &conversation.Content{
							Uri:  ptr.Of(part.ImageURL.URI),
							Type: message.InputTypeImage,
							Url:  ptr.Of(part.ImageURL.URL),
						})
					}

				case schema.ChatMessagePartTypeFileURL:

					if part.FileURL != nil {
						part.FileURL.URL, err = workflow.GetRepository().GetObjectUrl(ctx, part.FileURL.URI)
						if err != nil {
							return nil, nil, err
						}

						covMsg.MultiContent = append(covMsg.MultiContent, &conversation.Content{
							Uri:  ptr.Of(part.FileURL.URI),
							Type: message.InputTypeFile,
							Url:  ptr.Of(part.FileURL.URL),
						})

					}

				case schema.ChatMessagePartTypeAudioURL:
					if part.AudioURL != nil {
						part.AudioURL.URL, err = workflow.GetRepository().GetObjectUrl(ctx, part.AudioURL.URI)
						if err != nil {
							return nil, nil, err
						}
						covMsg.MultiContent = append(covMsg.MultiContent, &conversation.Content{
							Uri:  ptr.Of(part.AudioURL.URI),
							Type: message.InputTypeAudio,
							Url:  ptr.Of(part.AudioURL.URL),
						})

					}
				case schema.ChatMessagePartTypeVideoURL:
					if part.VideoURL != nil {
						part.VideoURL.URL, err = workflow.GetRepository().GetObjectUrl(ctx, part.VideoURL.URI)
						if err != nil {
							return nil, nil, err
						}
						covMsg.MultiContent = append(covMsg.MultiContent, &conversation.Content{
							Uri:  ptr.Of(part.VideoURL.URI),
							Type: message.InputTypeVideo,
							Url:  ptr.Of(part.VideoURL.URL),
						})
					}
				default:
					return nil, nil, fmt.Errorf("unknown part type: %s", part.Type)
				}
			}
		}

		messages = append(messages, msg)
		convMessages = append(convMessages, covMsg)
	}
	return convMessages, messages, nil
}
