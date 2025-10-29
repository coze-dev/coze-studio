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
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/conversation"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	agentrun "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/service"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	conversationService "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/service"
	message "github.com/coze-dev/coze-studio/backend/domain/conversation/message/service"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/service"
	uploadService "github.com/coze-dev/coze-studio/backend/domain/upload/service"
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
	UploaodDomainSVC  uploadService.UploadService
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

func (c *ConversationApplicationService) CreateConversation(ctx context.Context, req *conversation.CreateConversationRequest) (*conversation.CreateConversationResponse, error) {
	resp := new(conversation.CreateConversationResponse)
	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID
	connectorID := req.GetConnectorId()
	agentID := req.GetBotId()
	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	conversationData, err := c.ConversationDomainSVC.Create(ctx, &entity.CreateMeta{
		AgentID:     agentID,
		UserID:      userID,
		ConnectorID: connectorID,
		Scene:       common.Scene_SceneOpenApi,
		Ext:         parseMetaData(req.MetaData),
	})
	if err != nil {
		return nil, err
	}
	resp.ConversationData = &conversation.ConversationData{
		Id:            conversationData.ID,
		LastSectionID: &conversationData.SectionID,
		ConnectorID:   &conversationData.ConnectorID,
		CreatedAt:     conversationData.CreatedAt / 1000,
		MetaData:      parseExt(conversationData.Ext),
	}
	return resp, nil
}

func parseMetaData(metaData map[string]string) string {
	if metaData == nil {
		return ""
	}
	j, err := json.Marshal(metaData)
	if err != nil {
		return ""
	}
	return string(j)
}

func parseExt(ext string) map[string]string {
	if ext == "" {
		return nil
	}
	var metaData map[string]string
	err := json.Unmarshal([]byte(ext), &metaData)
	if err != nil {
		return nil
	}
	return metaData
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
		OrderBy: func() *string {
			if strings.ToLower(req.GetSortOrder()) == "asc" {
				return ptr.Of("asc")
			}
			return nil
		}(),
	})
	if err != nil {
		return resp, err
	}
	conversationData := slices.Transform(conversationDOList, func(conv *entity.Conversation) *conversation.ConversationData {
		return &conversation.ConversationData{
			Id:            conv.ID,
			LastSectionID: &conv.SectionID,
			ConnectorID:   &conv.ConnectorID,
			CreatedAt:     conv.CreatedAt / 1000,
			Name:          ptr.Of(conv.Name),
			MetaData:      parseExt(conv.Ext),
		}
	})

	resp.Data = &conversation.ListConversationData{
		Conversations: conversationData,
		HasMore:       hasMore,
	}
	return resp, nil
}

func (c *ConversationApplicationService) DeleteConversation(ctx context.Context, req *conversation.DeleteConversationApiRequest) (*conversation.DeleteConversationApiResponse, error) {
	resp := new(conversation.DeleteConversationApiResponse)
	convID := req.GetConversationID()

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	if userID == 0 {
		return resp, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "permission check failed"))
	}

	conversationDO, err := c.ConversationDomainSVC.GetByID(ctx, convID)
	if err != nil {
		return resp, err
	}
	if conversationDO == nil {
		return resp, errorx.New(errno.ErrConversationNotFound)
	}
	if conversationDO.CreatorID != userID {
		return resp, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "user not match"))
	}
	err = c.ConversationDomainSVC.Delete(ctx, convID)
	if err != nil {
		return resp, err
	}
	return resp, nil
}

func (c *ConversationApplicationService) UpdateConversation(ctx context.Context, req *conversation.UpdateConversationApiRequest) (*conversation.UpdateConversationApiResponse, error) {
	resp := new(conversation.UpdateConversationApiResponse)
	convID := req.GetConversationID()

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	if userID == 0 {
		return resp, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "permission check failed"))
	}

	conversationDO, err := c.ConversationDomainSVC.GetByID(ctx, convID)
	if err != nil {
		return resp, err
	}
	if conversationDO == nil {
		return resp, errorx.New(errno.ErrConversationNotFound)
	}
	if conversationDO.CreatorID != userID {
		return resp, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "user not match"))
	}

	updateResult, err := c.ConversationDomainSVC.Update(ctx, &entity.UpdateMeta{
		ID:   convID,
		Name: req.GetName(),
	})
	if err != nil {
		return resp, err
	}
	resp.ConversationData = &conversation.ConversationData{
		Id:            updateResult.ID,
		LastSectionID: &updateResult.SectionID,
		ConnectorID:   &updateResult.ConnectorID,
		CreatedAt:     updateResult.CreatedAt / 1000,
		Name:          ptr.Of(updateResult.Name),
	}
	return resp, nil
}

func (c *ConversationApplicationService) RetrieveConversation(ctx context.Context, req *conversation.RetrieveConversationApiRequest) (*conversation.RetrieveConversationApiResponse, error) {
	resp := new(conversation.RetrieveConversationApiResponse)
	convID := req.GetConversationID()

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	if userID == 0 {
		return resp, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "permission check failed"))
	}

	conversationDO, err := c.ConversationDomainSVC.GetByID(ctx, convID)
	if err != nil {
		return resp, err
	}
	if conversationDO == nil {
		return resp, errorx.New(errno.ErrConversationNotFound)
	}
	if conversationDO.CreatorID != userID {
		return resp, errorx.New(errno.ErrConversationNotFound, errorx.KV("msg", "user not match"))
	}

	resp.ConversationData = &conversation.ConversationData{
		Id:            conversationDO.ID,
		LastSectionID: &conversationDO.SectionID,
		ConnectorID:   &conversationDO.ConnectorID,
		CreatedAt:     conversationDO.CreatedAt / 1000,
		Name:          ptr.Of(conversationDO.Name),
		CreatorID:     &conversationDO.CreatorID,
		MetaData:      parseExt(conversationDO.Ext),
	}
	return resp, nil
}
