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

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/conversation"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	agentrun "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/service"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	conversationService "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/service"
	message "github.com/coze-dev/coze-studio/backend/domain/conversation/message/service"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type ConversationApplicationService struct {
	appContext *ServiceComponents

	AgentRunDomainSVC     agentrun.Run
	ConversationDomainSVC conversationService.Conversation
	MessageDomainSVC      message.Message

	ShortcutDomainSVC service.ShortcutCmd
}

var ConversationSVC = new(ConversationApplicationService)

type OpenapiAgentRunApplication struct {
	ShortcutDomainSVC service.ShortcutCmd
}

var ConversationOpenAPISVC = new(OpenapiAgentRunApplication)

func (c *ConversationApplicationService) ClearHistory(ctx context.Context, req *conversation.ClearConversationHistoryRequest) (*conversation.ClearConversationHistoryResponse, error) {
	resp := new(conversation.ClearConversationHistoryResponse)

	conversationID := req.ConversationID

	// get conversation
	currentRes, err := c.ConversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return resp, err
	}
	if currentRes == nil {
		return resp, errorx.New(errno.ErrConversationNotFound)
	}
	// check user
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil || *userID != currentRes.CreatorID {
		return resp, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "user not match"))
	}

	// delete conversation
	err = c.ConversationDomainSVC.Delete(ctx, conversationID)
	if err != nil {
		return resp, err
	}
	// create new conversation
	convRes, err := c.ConversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID:     currentRes.AgentID,
		UserID:      currentRes.CreatorID,
		Scene:       currentRes.Scene,
		ConnectorID: consts.CozeConnectorID,
	})
	if err != nil {
		return resp, err
	}
	resp.NewSectionID = convRes.SectionID
	return resp, nil
}

func (c *ConversationApplicationService) CreateSection(ctx context.Context, conversationID int64) (int64, error) {
	currentRes, err := c.ConversationDomainSVC.GetByID(ctx, conversationID)
	if err != nil {
		return 0, err
	}

	if currentRes == nil {
		return 0, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "conversation not found"))
	}
	var userID int64
	if currentRes.ConnectorID == consts.CozeConnectorID {
		userID = ctxutil.MustGetUIDFromCtx(ctx)
	} else {
		userID = ctxutil.MustGetUIDFromApiAuthCtx(ctx)
	}

	if userID != currentRes.CreatorID {
		return 0, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "user not match"))
	}

	convRes, err := c.ConversationDomainSVC.NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: conversationID,
	})
	if err != nil {
		return 0, err
	}
	return convRes.SectionID, nil
}

func (c *ConversationApplicationService) CreateConversation(ctx context.Context, agentID int64, connectorID int64) (*conversation.CreateConversationResponse, error) {
	resp := new(conversation.CreateConversationResponse)
	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID
	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	conversationData, err := c.ConversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID:     agentID,
		UserID:      userID,
		ConnectorID: connectorID,
		Scene:       common.Scene_SceneOpenApi,
	})
	if err != nil {
		return nil, err
	}
	resp.ConversationData = &conversation.ConversationData{
		Id:            conversationData.ID,
		LastSectionID: &conversationData.SectionID,
		ConnectorID:   &conversationData.ConnectorID,
		CreatedAt:     conversationData.CreatedAt,
	}
	return resp, nil
}

func (c *ConversationApplicationService) ListConversation(ctx context.Context, req *conversation.ListConversationsApiRequest) (*conversation.ListConversationsApiResponse, error) {

	resp := new(conversation.ListConversationsApiResponse)

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID
	connectorID := apiKeyInfo.ConnectorID

	if userID == 0 {
		return resp, errorx.New(errno.ErrConversationNotFound)
	}
	if ptr.From(req.ConnectorID) == consts.WebSDKConnectorID {
		connectorID = ptr.From(req.ConnectorID)
	}

	conversationDOList, hasMore, err := c.ConversationDomainSVC.List(ctx, &entity.ListMeta{
		UserID:      userID,
		AgentID:     req.GetBotID(),
		ConnectorID: connectorID,
		Scene:       common.Scene_SceneOpenApi,
		Page:        int(req.GetPageNum()),
		Limit:       int(req.GetPageSize()),
	})
	if err != nil {
		return resp, err
	}
	conversationData := slices.Transform(conversationDOList, func(conv *entity.Conversation) *conversation.ConversationData {
		return &conversation.ConversationData{
			Id:            conv.ID,
			LastSectionID: &conv.SectionID,
			ConnectorID:   &conv.ConnectorID,
			CreatedAt:     conv.CreatedAt,
		}
	})

	resp.Data = &conversation.ListConversationData{
		Conversations: conversationData,
		HasMore:       hasMore,
	}
	return resp, nil
}
