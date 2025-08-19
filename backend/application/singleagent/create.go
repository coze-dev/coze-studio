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
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	intelligence "github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *developer_api.DraftBotCreateRequest) (*developer_api.DraftBotCreateResponse, error) {
	resp, err := s.appContext.ModelMgr.ListInUseModel(ctx, 1, nil)
	if err != nil {
		return nil, err
	}

	if len(resp.ModelList) == 0 {
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
	sa, err := s.newDefaultSingleAgentWithSpace(ctx, req.SpaceID)
	if err != nil {
		return nil, err
	}

	sa.SpaceID = req.SpaceID
	sa.Name = req.GetName()
	sa.Desc = req.GetDescription()
	sa.IconURI = req.GetIconURI()

	return sa, nil
}

// newDefaultSingleAgentWithSpace 根据空间ID创建默认智能体，使用该空间下模型ID最小的模型
func (s *SingleAgentApplicationService) newDefaultSingleAgentWithSpace(ctx context.Context, spaceID int64) (*entity.SingleAgent, error) {
	// 查询该空间下模型ID最小的模型
	mi, err := s.getSpaceDefaultModelInfoForCreate(ctx, spaceID)
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
	modelResp, err := s.appContext.ModelMgr.ListModel(ctx, &modelmgr.ListModelRequest{
		Status: []modelmgr.ModelStatus{modelmgr.StatusInUse},
		Limit:  1,
		Cursor: nil,
	})
	if err != nil {
		return nil, err
	}

	if len(modelResp.ModelList) == 0 {
		return nil, errorx.New(errno.ErrAgentResourceNotFound, errorx.KV("type", "model"), errorx.KV("id", "default"))
	}

	dm := modelResp.ModelList[0]

	var temperature *float64
	if tp, ok := dm.FindParameter(modelmgr.Temperature); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}

		temperature = ptr.Of(t)
	}

	var maxTokens *int32
	if tp, ok := dm.FindParameter(modelmgr.MaxTokens); ok {
		t, err := tp.GetInt(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		maxTokens = ptr.Of(int32(t))
	} else if dm.Meta.ConnConfig.MaxTokens != nil {
		maxTokens = ptr.Of(int32(*dm.Meta.ConnConfig.MaxTokens))
	}

	var topP *float64
	if tp, ok := dm.FindParameter(modelmgr.TopP); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		topP = ptr.Of(t)
	}

	var topK *int32
	if tp, ok := dm.FindParameter(modelmgr.TopK); ok {
		t, err := tp.GetInt(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		topK = ptr.Of(int32(t))
	}

	var frequencyPenalty *float64
	if tp, ok := dm.FindParameter(modelmgr.FrequencyPenalty); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		frequencyPenalty = ptr.Of(t)
	}

	var presencePenalty *float64
	if tp, ok := dm.FindParameter(modelmgr.PresencePenalty); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		presencePenalty = ptr.Of(t)
	}

	return &bot_common.ModelInfo{
		ModelId:          ptr.Of(dm.ID),
		Temperature:      temperature,
		MaxTokens:        maxTokens,
		TopP:             topP,
		FrequencyPenalty: frequencyPenalty,
		PresencePenalty:  presencePenalty,
		TopK:             topK,
		ModelStyle:       bot_common.ModelStylePtr(bot_common.ModelStyle_Balance),
		ShortMemoryPolicy: &bot_common.ShortMemoryPolicy{
			ContextMode:  bot_common.ContextModePtr(bot_common.ContextMode_FunctionCall_2),
			HistoryRound: ptr.Of[int32](3),
		},
	}, nil
}

// getSpaceDefaultModelInfoForCreate 根据空间ID获取该空间下模型ID最小的模型信息（用于创建时）
func (s *SingleAgentApplicationService) getSpaceDefaultModelInfoForCreate(ctx context.Context, spaceID int64) (*bot_common.ModelInfo, error) {
	// 查询指定空间下的模型列表，按模型ID排序，取第一个
	modelResp, err := s.appContext.ModelMgr.ListModel(ctx, &modelmgr.ListModelRequest{
		SpaceID: ptr.Of(uint64(spaceID)),
		Status:  []modelmgr.ModelStatus{modelmgr.StatusInUse},
		Limit:   1,
		Cursor:  nil,
	})
	if err != nil {
		return nil, err
	}

	if len(modelResp.ModelList) == 0 {
		return nil, errorx.New(errno.ErrAgentResourceNotFound, errorx.KV("type", "model"), errorx.KV("space_id", strconv.FormatInt(spaceID, 10)))
	}

	// 取第一个模型（ID最小的）
	dm := modelResp.ModelList[0]

	// 构建模型信息，使用与 defaultModelInfo 相同的逻辑
	var temperature *float64
	if tp, ok := dm.FindParameter(modelmgr.Temperature); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		temperature = ptr.Of(t)
	}

	var maxTokens *int32
	if tp, ok := dm.FindParameter(modelmgr.MaxTokens); ok {
		t, err := tp.GetInt(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		maxTokens = ptr.Of(int32(t))
	} else if dm.Meta.ConnConfig.MaxTokens != nil {
		maxTokens = ptr.Of(int32(*dm.Meta.ConnConfig.MaxTokens))
	}

	var topP *float64
	if tp, ok := dm.FindParameter(modelmgr.TopP); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		topP = ptr.Of(t)
	}

	var topK *int32
	if tp, ok := dm.FindParameter(modelmgr.TopK); ok {
		t, err := tp.GetInt(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		topK = ptr.Of(int32(t))
	}

	var frequencyPenalty *float64
	if tp, ok := dm.FindParameter(modelmgr.FrequencyPenalty); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		frequencyPenalty = ptr.Of(t)
	}

	var presencePenalty *float64
	if tp, ok := dm.FindParameter(modelmgr.PresencePenalty); ok {
		t, err := tp.GetFloat(modelmgr.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		presencePenalty = ptr.Of(t)
	}

	return &bot_common.ModelInfo{
		ModelId:          ptr.Of(dm.ID),
		Temperature:      temperature,
		MaxTokens:        maxTokens,
		TopP:             topP,
		FrequencyPenalty: frequencyPenalty,
		PresencePenalty:  presencePenalty,
		TopK:             topK,
		ModelStyle:       bot_common.ModelStylePtr(bot_common.ModelStyle_Balance),
		ShortMemoryPolicy: &bot_common.ShortMemoryPolicy{
			ContextMode:  bot_common.ContextModePtr(bot_common.ContextMode_FunctionCall_2),
			HistoryRound: ptr.Of[int32](3),
		},
	}, nil
}
