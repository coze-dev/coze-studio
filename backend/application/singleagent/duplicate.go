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

	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	intelligence "github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	shortcutCMDEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type duplicateAgentResourceFn func(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error)

func (s *SingleAgentApplicationService) DuplicateDraftBot(ctx context.Context, req *developer_api.DuplicateDraftBotRequest) (*developer_api.DuplicateDraftBotResponse, error) {
	draftAgent, err := s.ValidateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	newAgentID, err := s.appContext.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	duplicateInfo := &entity.DuplicateInfo{
		NewAgentID: newAgentID,
		SpaceID:    req.GetSpaceID(),
		UserID:     userID,
		DraftAgent: draftAgent,
	}

	newAgent, err := s.DomainSVC.DuplicateInMemory(ctx, duplicateInfo)
	if err != nil {
		return nil, err
	}

	duplicateFns := []duplicateAgentResourceFn{
		duplicateVariables,
		duplicatePlugin,
		duplicateShortCommand,
	}

	for _, fn := range duplicateFns {
		newAgent, err = fn(ctx, s.appContext, draftAgent, newAgent)
		if err != nil {
			return nil, err
		}
	}

	_, err = s.DomainSVC.CreateSingleAgentDraftWithID(ctx, userID, newAgentID, newAgent)
	if err != nil {
		return nil, err
	}

	userInfo, err := s.appContext.UserDomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = s.appContext.EventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Created,
		Project: &searchEntity.ProjectDocument{
			Status:  intelligence.IntelligenceStatus_Using,
			Type:    intelligence.IntelligenceType_Bot,
			ID:      newAgent.AgentID,
			SpaceID: &req.SpaceID,
			OwnerID: &userID,
			Name:    &newAgent.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	return &developer_api.DuplicateDraftBotResponse{
		Data: &developer_api.DuplicateDraftBotData{
			BotID: newAgent.AgentID,
			Name:  newAgent.Name,
			UserInfo: &developer_api.Creator{
				ID:             userID,
				Name:           userInfo.Name,
				AvatarURL:      userInfo.IconURL,
				Self:           userID == draftAgent.CreatorID,
				UserUniqueName: userInfo.UniqueName,
				UserLabel:      nil,
			},
		},
		Code: 0,
	}, nil
}

func duplicateVariables(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	if oldAgent.VariablesMetaID == nil || *oldAgent.VariablesMetaID <= 0 {
		return newAgent, nil
	}

	vars, err := appContext.VariablesDomainSVC.GetVariableMetaByID(ctx, *oldAgent.VariablesMetaID)
	if err != nil {
		return nil, err
	}

	vars.ID = 0
	vars.BizID = conv.Int64ToStr(newAgent.AgentID)
	vars.BizType = project_memory.VariableConnector_Bot
	vars.Version = ""
	vars.CreatorID = newAgent.CreatorID

	varMetaID, err := appContext.VariablesDomainSVC.UpsertMeta(ctx, vars)
	if err != nil {
		return nil, err
	}

	newAgent.VariablesMetaID = &varMetaID

	return newAgent, nil
}

func duplicatePlugin(ctx context.Context, _ *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	err := crossplugin.DefaultSVC().DuplicateDraftAgentTools(ctx, oldAgent.AgentID, newAgent.AgentID)
	if err != nil {
		return nil, err
	}
	return newAgent, nil
}

func duplicateShortCommand(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	metas, err := appContext.ShortcutCMDDomainSVC.ListCMD(ctx, &shortcutCMDEntity.ListMeta{
		SpaceID:  oldAgent.SpaceID,
		ObjectID: oldAgent.AgentID,
		IsOnline: 0,
		CommandIDs: slices.Transform(oldAgent.ShortcutCommand, func(a string) int64 {
			return conv.StrToInt64D(a, 0)
		}),
	})
	if err != nil {
		return nil, err
	}

	shortcutCommandIDs := make([]string, 0, len(metas))
	for _, meta := range metas {
		meta.ObjectID = newAgent.AgentID
		meta.CreatorID = newAgent.CreatorID
		do, err := appContext.ShortcutCMDDomainSVC.CreateCMD(ctx, meta)
		if err != nil {
			return nil, err
		}

		shortcutCommandIDs = append(shortcutCommandIDs, conv.Int64ToStr(do.CommandID))
	}

	newAgent.ShortcutCommand = shortcutCommandIDs

	return newAgent, nil
}
