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

package dal

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type SingleAgentVersionDAO struct {
	IDGen   idgen.IDGenerator
	dbQuery *query.Query
}

func NewSingleAgentVersion(db *gorm.DB, idGen idgen.IDGenerator) *SingleAgentVersionDAO {
	query.SetDefault(db)
	return &SingleAgentVersionDAO{
		IDGen:   idGen,
		dbQuery: query.Use(db),
	}
}

func (sa *SingleAgentVersionDAO) GetLatest(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentVersion
	singleAgent, err := singleAgentDAOModel.
		Where(singleAgentDAOModel.AgentID.Eq(agentID)).
		Order(singleAgentDAOModel.CreatedAt.Desc()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetCode)
	}

	do := sa.singleAgentVersionPo2Do(singleAgent)

	return do, nil
}

func (sa *SingleAgentVersionDAO) Get(ctx context.Context, agentID int64, version string) (*entity.SingleAgent, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentVersion
	singleAgent, err := singleAgentDAOModel.
		Where(singleAgentDAOModel.AgentID.Eq(agentID), singleAgentDAOModel.Version.Eq(version)).
		First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetCode)
	}

	do := sa.singleAgentVersionPo2Do(singleAgent)

	return do, nil
}

func (sa *SingleAgentVersionDAO) singleAgentVersionPo2Do(po *model.SingleAgentVersion) *entity.SingleAgent {
	return &entity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID:         po.AgentID,
			CreatorID:       po.CreatorID,
			SpaceID:         po.SpaceID,
			Name:            po.Name,
			Desc:            po.Description,
			IconURI:         po.IconURI,
			CreatedAt:       po.CreatedAt,
			UpdatedAt:       po.UpdatedAt,
			DeletedAt:       po.DeletedAt,
			ModelInfo:       po.ModelInfo,
			OnboardingInfo:  po.OnboardingInfo,
			Prompt:          po.Prompt,
			Plugin:          po.Plugin,
			Knowledge:       po.Knowledge,
			Workflow:        po.Workflow,
			SuggestReply:    po.SuggestReply,
			JumpConfig:      po.JumpConfig,
			VariablesMetaID: po.VariablesMetaID,
			Database:        po.DatabaseConfig,
			ShortcutCommand: po.ShortcutCommand,
			Version:         po.Version,
			BotMode:         bot_common.BotMode(po.BotMode),
			LayoutInfo:      po.LayoutInfo,
		},
	}
}

func (sa *SingleAgentVersionDAO) singleAgentVersionDo2Po(do *entity.SingleAgent) *model.SingleAgentVersion {
	return &model.SingleAgentVersion{
		AgentID:         do.AgentID,
		CreatorID:       do.CreatorID,
		SpaceID:         do.SpaceID,
		Name:            do.Name,
		Description:     do.Desc,
		IconURI:         do.IconURI,
		CreatedAt:       do.CreatedAt,
		UpdatedAt:       do.UpdatedAt,
		DeletedAt:       do.DeletedAt,
		ModelInfo:       do.ModelInfo,
		OnboardingInfo:  do.OnboardingInfo,
		Prompt:          do.Prompt,
		Plugin:          do.Plugin,
		Knowledge:       do.Knowledge,
		Workflow:        do.Workflow,
		SuggestReply:    do.SuggestReply,
		JumpConfig:      do.JumpConfig,
		VariablesMetaID: do.VariablesMetaID,
		DatabaseConfig:  do.Database,
		ShortcutCommand: do.ShortcutCommand,
		BotMode:         int32(do.BotMode),
		LayoutInfo:      do.LayoutInfo,
	}
}
