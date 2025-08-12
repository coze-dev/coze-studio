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
	"fmt"
	"math/rand"

	"github.com/jinzhu/copier"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/agentflow"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/jsoncache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type singleAgentImpl struct {
	Components
}

type Components struct {
	ModelMgr     modelmgr.Manager
	ModelFactory chatmodel.Factory

	AgentDraftRepo   repository.SingleAgentDraftRepo
	AgentVersionRepo repository.SingleAgentVersionRepo
	PublishInfoRepo  *jsoncache.JsonCache[entity.PublishInfo]
	CounterRepo      repository.CounterRepository

	CPStore compose.CheckPointStore
}

func NewService(c *Components) SingleAgent {
	s := &singleAgentImpl{
		Components: *c,
	}

	return s
}

func (s *singleAgentImpl) DeleteAgentDraft(ctx context.Context, spaceID, agentID int64) (err error) {
	return s.AgentDraftRepo.Delete(ctx, spaceID, agentID)
}

func (s *singleAgentImpl) DuplicateInMemory(ctx context.Context, req *entity.DuplicateInfo) (newAgent *entity.SingleAgent, err error) {
	srcAgent := req.DraftAgent
	if srcAgent == nil {
		return nil, errorx.New(errno.ErrAgentInvalidParamCode,
			errorx.KVf("msg", "srcAgent is nil"))
	}

	newAgent = &entity.SingleAgent{}
	err = copier.CopyWithOption(newAgent, srcAgent, copier.Option{DeepCopy: true, IgnoreEmpty: true})
	if err != nil {
		return nil, err
	}

	copySuffixNum := rand.Intn(1000)
	newAgent.Name = fmt.Sprintf("%v%03d", srcAgent.Name, copySuffixNum)
	newAgent.SpaceID = req.SpaceID
	newAgent.CreatorID = req.UserID
	newAgent.AgentID = req.NewAgentID

	return newAgent, nil
}

func (s *singleAgentImpl) MGetSingleAgentDraft(ctx context.Context, agentIDs []int64) (agents []*entity.SingleAgent, err error) {
	return s.AgentDraftRepo.MGet(ctx, agentIDs)
}

func (s *singleAgentImpl) StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (events *schema.StreamReader[*entity.AgentEvent], err error) {
	ae, err := s.ObtainAgentByIdentity(ctx, req.Identity)
	if err != nil {
		return nil, err
	}

	if req.Identity.Version == "" {
		req.Identity.Version = ae.Version
	}

	conf := &agentflow.Config{
		Agent:        ae,
		UserID:       req.UserID,
		Identity:     req.Identity,
		ModelMgr:     s.ModelMgr,
		ModelFactory: s.ModelFactory,
		CPStore:      s.CPStore,
	}
	rn, err := agentflow.BuildAgent(ctx, conf)
	if err != nil {
		return nil, err
	}

	exeReq := &agentflow.AgentRequest{
		UserID:   req.UserID,
		Input:    req.Input,
		History:  req.History,
		Identity: req.Identity,

		ResumeInfo:   req.ResumeInfo,
		PreCallTools: req.PreCallTools,
	}
	return rn.StreamExecute(ctx, rn.PreHandlerReq(ctx, exeReq))
}

func (s *singleAgentImpl) GetSingleAgent(ctx context.Context, agentID int64, version string) (botInfo *entity.SingleAgent, err error) {
	if len(version) == 0 {
		return s.GetSingleAgentDraft(ctx, agentID)
	}

	agentInfo, err := s.AgentVersionRepo.Get(ctx, agentID, version)
	if err != nil {
		return nil, err
	}

	return agentInfo, nil
}

func (s *singleAgentImpl) UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error) {
	if agentInfo.Plugin != nil {
		toolIDs := slices.Transform(agentInfo.Plugin, func(item *bot_common.PluginInfo) int64 {
			return item.GetApiId()
		})
		err = crossplugin.DefaultSVC().BindAgentTools(ctx, agentInfo.AgentID, toolIDs)
		if err != nil {
			return fmt.Errorf("bind agent tools failed, err=%v", err)
		}
	}

	return s.AgentDraftRepo.Update(ctx, agentInfo)
}

func (s *singleAgentImpl) CreateSingleAgentDraftWithID(ctx context.Context, creatorID, agentID int64, draft *entity.SingleAgent) (int64, error) {
	return s.AgentDraftRepo.CreateWithID(ctx, creatorID, agentID, draft)
}

func (s *singleAgentImpl) CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (agentID int64, err error) {
	return s.AgentDraftRepo.Create(ctx, creatorID, draft)
}

func (s *singleAgentImpl) GetSingleAgentDraft(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	return s.AgentDraftRepo.Get(ctx, agentID)
}

func (s *singleAgentImpl) ObtainAgentByIdentity(ctx context.Context, identity *entity.AgentIdentity) (*entity.SingleAgent, error) {
	if identity.IsDraft {
		return s.GetSingleAgentDraft(ctx, identity.AgentID)
	}

	agentID := identity.AgentID
	connectorID := identity.ConnectorID
	version := identity.Version

	if connectorID == 0 {
		return s.GetSingleAgent(ctx, identity.AgentID, identity.Version)
	}

	if version == "" {
		singleAgentPublish, err := s.ListAgentPublishHistory(ctx, agentID, 1, 1, &connectorID)
		if err != nil {
			return nil, err
		}
		if len(singleAgentPublish) == 0 {
			return nil, errorx.New(errno.ErrAgentInvalidParamCode,
				errorx.KVf("msg", "agent not published, agentID=%d connectorID=%d", agentID, connectorID))
		}

		version = singleAgentPublish[0].Version
	}

	return s.AgentVersionRepo.Get(ctx, agentID, version)
}

func (s *singleAgentImpl) UpdateAgentDraftDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error {
	do, err := s.AgentDraftRepo.GetDisplayInfo(ctx, userID, e.AgentID)
	if err != nil {
		return err
	}

	do.SpaceID = e.SpaceID
	if e.DisplayInfo != nil && e.DisplayInfo.TabDisplayInfo != nil {
		if e.DisplayInfo.TabDisplayInfo.PluginTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.PluginTabStatus = e.DisplayInfo.TabDisplayInfo.PluginTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.WorkflowTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.WorkflowTabStatus = e.DisplayInfo.TabDisplayInfo.WorkflowTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgeTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgeTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgeTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.DatabaseTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.DatabaseTabStatus = e.DisplayInfo.TabDisplayInfo.DatabaseTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.VariableTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.VariableTabStatus = e.DisplayInfo.TabDisplayInfo.VariableTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.OpeningDialogTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.OpeningDialogTabStatus = e.DisplayInfo.TabDisplayInfo.OpeningDialogTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.ScheduledTaskTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.ScheduledTaskTabStatus = e.DisplayInfo.TabDisplayInfo.ScheduledTaskTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.SuggestionTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.SuggestionTabStatus = e.DisplayInfo.TabDisplayInfo.SuggestionTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.TtsTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.TtsTabStatus = e.DisplayInfo.TabDisplayInfo.TtsTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.FileboxTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.FileboxTabStatus = e.DisplayInfo.TabDisplayInfo.FileboxTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.LongTermMemoryTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.LongTermMemoryTabStatus = e.DisplayInfo.TabDisplayInfo.LongTermMemoryTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.AnswerActionTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.AnswerActionTabStatus = e.DisplayInfo.TabDisplayInfo.AnswerActionTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.ImageflowTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.ImageflowTabStatus = e.DisplayInfo.TabDisplayInfo.ImageflowTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.BackgroundImageTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.BackgroundImageTabStatus = e.DisplayInfo.TabDisplayInfo.BackgroundImageTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.ShortcutTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.ShortcutTabStatus = e.DisplayInfo.TabDisplayInfo.ShortcutTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgeTableTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgeTableTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgeTableTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgeTextTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgeTextTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgeTextTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgePhotoTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgePhotoTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgePhotoTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.HookInfoTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.HookInfoTabStatus = e.DisplayInfo.TabDisplayInfo.HookInfoTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.DefaultUserInputTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.DefaultUserInputTabStatus = e.DisplayInfo.TabDisplayInfo.DefaultUserInputTabStatus
		}
	}

	return s.AgentDraftRepo.UpdateDisplayInfo(ctx, userID, do)
}

func (s *singleAgentImpl) GetAgentDraftDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error) {
	return s.AgentDraftRepo.GetDisplayInfo(ctx, userID, agentID)
}

func (s *singleAgentImpl) ListAgentPublishHistory(ctx context.Context, agentID int64, pageIndex, pageSize int32, connectorID *int64) ([]*entity.SingleAgentPublish, error) {
	if connectorID == nil {
		return s.AgentVersionRepo.List(ctx, agentID, pageIndex, pageSize)
	}

	logs.CtxInfof(ctx, "ListAgentPublishHistory, agentID=%v, pageIndex=%v, pageSize=%v, connectorID=%v",
		agentID, pageIndex, pageSize, *connectorID)

	var (
		allResults  []*entity.SingleAgentPublish
		currentPage int32 = 1
		maxCount          = pageSize * pageIndex
	)

	// Pull all eligible records
	for {
		pageData, err := s.AgentVersionRepo.List(ctx, agentID, currentPage, 50)
		if err != nil {
			return nil, err
		}
		if len(pageData) == 0 {
			break
		}

		// Filter current page data
		for _, item := range pageData {
			for _, cID := range item.ConnectorIds {
				if cID == *connectorID {
					allResults = append(allResults, item)
					break
				}
			}
		}

		if len(allResults) > int(maxCount) {
			break
		}

		currentPage++
	}

	start := (pageIndex - 1) * pageSize
	if start >= int32(len(allResults)) {
		return []*entity.SingleAgentPublish{}, nil
	}

	end := start + pageSize
	if end > int32(len(allResults)) {
		end = int32(len(allResults))
	}

	return allResults[start:end], nil
}
