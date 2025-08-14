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

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agentrun"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/contract/message"
	agententity "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	msgentity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type ConversationRepository struct {
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
	lr, err := crossmessage.DefaultSVC().List(ctx, lm)
	if err != nil {
		return nil, err
	}

	response := &conversation.MessageListResponse{}

	if lr.PrevCursor > 0 {
		response.FirstID = strconv.FormatInt(lr.PrevCursor, 10)
	}
	if lr.NextCursor > 0 {
		response.LastID = strconv.FormatInt(lr.NextCursor, 10)
	}
	if len(lr.Messages) == 0 {
		return response, nil
	}
	messages, err := convertMessage(lr.Messages)
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

	messages, err := crossmessage.DefaultSVC().GetByRunIDs(ctx, req.ConversationID, req.RunIDs)
	if err != nil {
		return nil, err
	}

	msgs, err := convertMessage(messages)
	if err != nil {
		return nil, err
	}

	return &conversation.GetMessagesByRunIDsResponse{
		Messages: msgs,
	}, nil
}

func convertMessage(msgs []*msgentity.Message) ([]*conversation.Message, error) {
	messages := make([]*conversation.Message, 0, len(msgs))
	for _, m := range msgs {
		msg := &conversation.Message{
			ID:          m.ID,
			Role:        m.Role,
			ContentType: string(m.ContentType)}

		if m.MultiContent != nil {
			var mcs []*conversation.Content
			for _, c := range m.MultiContent {
				if c.FileData != nil {
					for _, fd := range c.FileData {
						mcs = append(mcs, &conversation.Content{
							Type: c.Type,
							Uri:  ptr.Of(fd.URI),
						})
					}
				} else {
					mcs = append(mcs, &conversation.Content{
						Type: c.Type,
						Text: ptr.Of(c.Text),
					})
				}
			}
			msg.MultiContent = mcs
		} else {
			msg.Text = ptr.Of(m.Content)
		}
		messages = append(messages, msg)
	}
	return messages, nil
}
