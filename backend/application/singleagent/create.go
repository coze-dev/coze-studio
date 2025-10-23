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

package singleagent

import (
	"context"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	intelligence "github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *developer_api.DraftBotCreateRequest) (*developer_api.DraftBotCreateResponse, error) {
	modelList, err := config.ModelConf().GetOnlineModelListWithLimit(ctx, 1)
	if err != nil {
		return nil, err
	}

	if len(modelList) == 0 {
		return nil, errorx.New(errno.ErrAgentNoModelInUseCode)
	}

	do, err := s.draftBotCreateRequestToSingleAgent(ctx, req)
	if err != nil {
		return nil, err
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	agentID, err := s.DomainSVC.CreateSingleAgentDraft(ctx, userID, do)
	if err != nil {
		return nil, err
	}

	err = s.appContext.EventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Created,
		Project: &searchEntity.ProjectDocument{
			Status:  intelligence.IntelligenceStatus_Using,
			Type:    intelligence.IntelligenceType_Bot,
			ID:      agentID,
			SpaceID: &req.SpaceID,
			OwnerID: &userID,
			Name:    &do.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	return &developer_api.DraftBotCreateResponse{Data: &developer_api.DraftBotCreateData{
		BotID: agentID,
	}}, nil
}

func (s *SingleAgentApplicationService) draftBotCreateRequestToSingleAgent(ctx context.Context, req *developer_api.DraftBotCreateRequest) (*entity.SingleAgent, error) {
	sa, err := s.newDefaultSingleAgent(ctx)
	if err != nil {
		return nil, err
	}

	sa.SpaceID = req.SpaceID
	sa.Name = req.GetName()
	sa.Desc = req.GetDescription()
	sa.IconURI = req.GetIconURI()

	return sa, nil
}

func (s *SingleAgentApplicationService) newDefaultSingleAgent(ctx context.Context) (*entity.SingleAgent, error) {
	mi, err := s.defaultModelInfo(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
	return &entity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			OnboardingInfo: &bot_common.OnboardingInfo{},
			ModelInfo:      mi,
			Prompt:         &bot_common.PromptInfo{},
			Plugin:         []*bot_common.PluginInfo{},
			Knowledge: &bot_common.Knowledge{
				TopK:           ptr.Of(int64(1)),
				MinScore:       ptr.Of(0.01),
				SearchStrategy: ptr.Of(bot_common.SearchStrategy_SemanticSearch),
				RecallStrategy: &bot_common.RecallStrategy{
					UseNl2sql:  ptr.Of(true),
					UseRerank:  ptr.Of(true),
					UseRewrite: ptr.Of(true),
				},
			},
			Workflow:     []*bot_common.WorkflowInfo{},
			SuggestReply: &bot_common.SuggestReplyInfo{},
			JumpConfig:   &bot_common.JumpConfig{},
			Database:     []*bot_common.Database{},

			CreatedAt: now,
			UpdatedAt: now,
		},
	}, nil
}

func (s *SingleAgentApplicationService) defaultModelInfo(ctx context.Context) (*bot_common.ModelInfo, error) {
	modelList, err := config.ModelConf().GetOnlineModelListWithLimit(ctx, 1)
	if err != nil {
		return nil, err
	}

	if len(modelList) == 0 {
		return nil, errorx.New(errno.ErrAgentResourceNotFound, errorx.KV("type", "model"), errorx.KV("id", "default"))
	}

	dm := modelList[0]

	return &bot_common.ModelInfo{
		ModelId:          ptr.Of(dm.ID),
		Temperature:      dm.GetDefaultTemperature(),
		MaxTokens:        dm.GetDefaultMaxTokens(),
		TopP:             dm.GetDefaultTopP(),
		FrequencyPenalty: dm.GetDefaultFrequencyPenalty(),
		PresencePenalty:  dm.GetDefaultPresencePenalty(),
		TopK:             dm.GetDefaultTopK(),
		ModelStyle:       bot_common.ModelStylePtr(bot_common.ModelStyle_Balance),
		ShortMemoryPolicy: &bot_common.ShortMemoryPolicy{
			ContextMode:  bot_common.ContextModePtr(bot_common.ContextMode_FunctionCall_2),
			HistoryRound: ptr.Of[int32](3),
		},
	}, nil
}
