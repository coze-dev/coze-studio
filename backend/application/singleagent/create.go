package singleagent

import (
	"context"
	"time"

	modelmgrEntity "code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
	intelligence "code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func (s *SingleAgentApplicationService) CreateSingleAgentDraft(ctx context.Context, req *developer_api.DraftBotCreateRequest) (*developer_api.DraftBotCreateResponse, error) {
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
	modelResp, err := s.appContext.ModelMgrDomainSVC.ListModel(ctx, &modelmgr.ListModelRequest{
		Scenario: ptr.Of(modelmgrEntity.ScenarioSingleReactAgent),
		Status:   []modelmgrEntity.ModelEntityStatus{modelmgrEntity.ModelEntityStatusDefault},
		Limit:    1,
		Cursor:   nil,
	})
	if err != nil {
		return nil, err
	}

	if len(modelResp.ModelList) == 0 {
		return nil, errorx.New(errno.ErrAgentResourceNotFound, errorx.KV("type", "model"), errorx.KV("id", "default"))
	}

	dm := modelResp.ModelList[0]

	var temperature *float64
	if tp, ok := dm.FindParameter(modelmgrEntity.Temperature); ok {
		t, err := tp.GetFloat(modelmgrEntity.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}

		temperature = ptr.Of(t)
	}

	var maxTokens *int32
	if tp, ok := dm.FindParameter(modelmgrEntity.MaxTokens); ok {
		t, err := tp.GetInt(modelmgrEntity.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		maxTokens = ptr.Of(int32(t))
	} else if dm.Meta.ConnConfig.MaxTokens != nil {
		maxTokens = ptr.Of(int32(*dm.Meta.ConnConfig.MaxTokens))
	}

	var topP *float64
	if tp, ok := dm.FindParameter(modelmgrEntity.TopP); ok {
		t, err := tp.GetFloat(modelmgrEntity.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		topP = ptr.Of(t)
	}

	var topK *int32
	if tp, ok := dm.FindParameter(modelmgrEntity.TopK); ok {
		t, err := tp.GetInt(modelmgrEntity.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		topK = ptr.Of(int32(t))
	}

	var frequencyPenalty *float64
	if tp, ok := dm.FindParameter(modelmgrEntity.FrequencyPenalty); ok {
		t, err := tp.GetFloat(modelmgrEntity.DefaultTypeBalance)
		if err != nil {
			return nil, err
		}
		frequencyPenalty = ptr.Of(t)
	}

	var presencePenalty *float64
	if tp, ok := dm.FindParameter(modelmgrEntity.PresencePenalty); ok {
		t, err := tp.GetFloat(modelmgrEntity.DefaultTypeBalance)
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
