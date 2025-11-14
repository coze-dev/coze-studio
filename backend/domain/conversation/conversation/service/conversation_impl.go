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

	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/repository"
)

type conversationImpl struct {
	Components
}
type Components struct {
	ConversationRepo repository.ConversationRepo
}

func NewService(c *Components) Conversation {
	return &conversationImpl{
		Components: *c,
	}
}

func (c *conversationImpl) Create(ctx context.Context, req *entity.CreateMeta) (*entity.Conversation, error) {
	var resp *entity.Conversation

	doData := &entity.Conversation{
		CreatorID:   req.CreatorID,
		AgentID:     req.AgentID,
		Scene:       req.Scene,
		ConnectorID: req.ConnectorID,
		Ext:         req.Ext,
		UserID:      req.UserID,
	}

	resp, err := c.ConversationRepo.Create(ctx, doData)
	if err != nil {
		return resp, err
	}
	return resp, nil
}

func (c *conversationImpl) GetByID(ctx context.Context, id int64) (*entity.Conversation, error) {
	resp := &entity.Conversation{}
	// get conversation
	resp, err := c.ConversationRepo.GetByID(ctx, id)

	if err != nil {
		return resp, err
	}

	return resp, nil
}

func (c *conversationImpl) NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error) {
	resp := &entity.NewConversationCtxResponse{}

	newSectionID, err := c.ConversationRepo.UpdateSection(ctx, req.ID)
	if err != nil {
		return resp, err
	}
	if newSectionID != 0 {
		resp.ID = req.ID
		resp.SectionID = newSectionID
	}
	return resp, nil
}

func (c *conversationImpl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error) {
	// get conversation
	conversation, err := c.ConversationRepo.Get(ctx, req.UserID, req.AgentID, int32(req.Scene), req.ConnectorID)

	if err != nil {
		return nil, err
	}

	// build data
	return conversation, nil
}

func (c *conversationImpl) Delete(ctx context.Context, id int64) error {

	_, err := c.ConversationRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (c *conversationImpl) Update(ctx context.Context, req *entity.UpdateMeta) (*entity.Conversation, error) {
	// get conversation
	return c.ConversationRepo.Update(ctx, req)
}

func (c *conversationImpl) List(ctx context.Context, req *entity.ListMeta) ([]*entity.Conversation, bool, error) {
	conversationList, hasMore, err := c.ConversationRepo.List(ctx, req)

	if err != nil {
		return nil, hasMore, err
	}

	return conversationList, hasMore, nil
}
