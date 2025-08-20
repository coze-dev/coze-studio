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
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/conversation"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	conversation "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/service"
)

var defaultSVC crossconversation.Conversation

type impl struct {
	DomainSVC conversation.Conversation
}

func InitDomainService(c conversation.Conversation) crossconversation.Conversation {
	defaultSVC = &impl{
		DomainSVC: c,
	}
	return defaultSVC
}

func (s *impl) CreateConversation(ctx context.Context, req *crossconversation.CreateConversationRequest) (int64, int64, error) {
	ret, err := s.DomainSVC.Create(ctx, &entity.CreateMeta{
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

func (s *impl) ClearConversationHistory(ctx context.Context, req *crossconversation.ClearConversationHistoryReq) (int64, error) {
	resp, err := s.DomainSVC.NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: req.ConversationID,
	})
	if err != nil {
		return 0, err
	}
	return resp.SectionID, nil

}

func (s *impl) GetCurrentConversation(ctx context.Context, req *model.GetCurrent) (*model.Conversation, error) {
	return s.DomainSVC.GetCurrentConversation(ctx, req)
}

func (s *impl) GetByID(ctx context.Context, id int64) (*entity.Conversation, error) {
	return s.DomainSVC.GetByID(ctx, id)
}
