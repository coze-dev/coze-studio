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

package message

import (
	"context"
	"sort"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type messageImpl struct {
	Components
}

type Components struct {
	MessageRepo repository.MessageRepo
}

func NewService(c *Components) Message {
	return &messageImpl{
		Components: *c,
	}
}

func (m *messageImpl) PreCreate(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	// create message
	return m.MessageRepo.PreCreate(ctx, msg)
}

func (m *messageImpl) Create(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	// create message
	return m.MessageRepo.Create(ctx, msg)
}

func (m *messageImpl) List(ctx context.Context, req *entity.ListMeta) (*entity.ListResult, error) {
	resp := &entity.ListResult{}

	// get message with query
	messageList, hasMore, err := m.MessageRepo.List(ctx, req.ConversationID, req.Limit, req.Cursor, req.Direction, ptr.Of(message.MessageTypeQuestion))
	if err != nil {
		return resp, err
	}

	resp.Direction = req.Direction
	resp.HasMore = hasMore

	if len(messageList) > 0 {
		sort.Slice(messageList, func(i, j int) bool {
			return messageList[i].CreatedAt > messageList[j].CreatedAt
		})
		resp.PrevCursor = messageList[len(messageList)-1].ID
		resp.NextCursor = messageList[0].ID

		var runIDs []int64
		for _, m := range messageList {
			runIDs = append(runIDs, m.RunID)
		}
		orderBy := "DESC"
		if req.OrderBy != nil {
			orderBy = *req.OrderBy
		}
		allMessageList, err := m.MessageRepo.GetByRunIDs(ctx, runIDs, orderBy)
		if err != nil {
			return resp, err
		}
		resp.Messages = allMessageList
	}
	return resp, nil
}

func (m *messageImpl) GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*entity.Message, error) {
	return m.MessageRepo.GetByRunIDs(ctx, runIDs, "ASC")
}

func (m *messageImpl) Edit(ctx context.Context, req *entity.Message) (*entity.Message, error) {
	_, err := m.MessageRepo.Edit(ctx, req.ID, req)
	if err != nil {
		return nil, err
	}

	return req, nil
}

func (m *messageImpl) Delete(ctx context.Context, req *entity.DeleteMeta) error {
	return m.MessageRepo.Delete(ctx, req.MessageIDs, req.RunIDs)
}

func (m *messageImpl) GetByID(ctx context.Context, id int64) (*entity.Message, error) {
	return m.MessageRepo.GetByID(ctx, id)
}

func (m *messageImpl) Broken(ctx context.Context, req *entity.BrokenMeta) error {

	_, err := m.MessageRepo.Edit(ctx, req.ID, &message.Message{
		Status:   message.MessageStatusBroken,
		Position: ptr.From(req.Position),
	})
	if err != nil {
		return err
	}
	return nil
}
