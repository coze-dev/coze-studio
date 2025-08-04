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

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type SingleAgentDraftDAO struct {
	idGen       idgen.IDGenerator
	dbQuery     *query.Query
	cacheClient cache.Cmdable
}

func NewSingleAgentDraftDAO(db *gorm.DB, idGen idgen.IDGenerator, cli cache.Cmdable) *SingleAgentDraftDAO {
	query.SetDefault(db)

	return &SingleAgentDraftDAO{
		idGen:       idGen,
		dbQuery:     query.Use(db),
		cacheClient: cli,
	}
}

func (sa *SingleAgentDraftDAO) Create(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (draftID int64, err error) {
	id, err := sa.idGen.GenID(ctx)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrAgentIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
	}

	return sa.CreateWithID(ctx, creatorID, id, draft)
}

func (sa *SingleAgentDraftDAO) CreateWithID(ctx context.Context, creatorID, agentID int64, draft *entity.SingleAgent) (draftID int64, err error) {
	po := sa.singleAgentDraftDo2Po(draft)
	po.AgentID = agentID
	po.CreatorID = creatorID

	err = sa.dbQuery.SingleAgentDraft.WithContext(ctx).Create(po)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrAgentCreateDraftCode)
	}

	return agentID, nil
}

func (sa *SingleAgentDraftDAO) Get(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentDraft
	singleAgent, err := sa.dbQuery.SingleAgentDraft.Where(singleAgentDAOModel.AgentID.Eq(agentID)).First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetCode)
	}

	do := sa.singleAgentDraftPo2Do(singleAgent)

	return do, nil
}

func (sa *SingleAgentDraftDAO) MGet(ctx context.Context, agentIDs []int64) ([]*entity.SingleAgent, error) {
	sam := sa.dbQuery.SingleAgentDraft
	singleAgents, err := sam.WithContext(ctx).Where(sam.AgentID.In(agentIDs...)).Find()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetCode)
	}

	dos := make([]*entity.SingleAgent, 0, len(singleAgents))
	for _, singleAgent := range singleAgents {
		dos = append(dos, sa.singleAgentDraftPo2Do(singleAgent))
	}

	return dos, nil
}

func (sa *SingleAgentDraftDAO) Update(ctx context.Context, agentInfo *entity.SingleAgent) (err error) {
	po := sa.singleAgentDraftDo2Po(agentInfo)
	singleAgentDAOModel := sa.dbQuery.SingleAgentDraft

	_, err = singleAgentDAOModel.Where(singleAgentDAOModel.AgentID.Eq(agentInfo.AgentID)).Updates(po)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrAgentUpdateCode)
	}

	return nil
}

func (sa *SingleAgentDraftDAO) Delete(ctx context.Context, spaceID, agentID int64) (err error) {
	po := sa.dbQuery.SingleAgentDraft
	_, err = po.WithContext(ctx).Where(po.AgentID.Eq(agentID), po.SpaceID.Eq(spaceID)).Delete()
	return err
}

func (sa *SingleAgentDraftDAO) singleAgentDraftPo2Do(po *model.SingleAgentDraft) *entity.SingleAgent {
	return &entity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID:                 po.AgentID,
			CreatorID:               po.CreatorID,
			SpaceID:                 po.SpaceID,
			Name:                    po.Name,
			Desc:                    po.Description,
			IconURI:                 po.IconURI,
			CreatedAt:               po.CreatedAt,
			UpdatedAt:               po.UpdatedAt,
			DeletedAt:               po.DeletedAt,
			ModelInfo:               po.ModelInfo,
			OnboardingInfo:          po.OnboardingInfo,
			Prompt:                  po.Prompt,
			Plugin:                  po.Plugin,
			Knowledge:               po.Knowledge,
			Workflow:                po.Workflow,
			SuggestReply:            po.SuggestReply,
			JumpConfig:              po.JumpConfig,
			VariablesMetaID:         po.VariablesMetaID,
			BackgroundImageInfoList: po.BackgroundImageInfoList,
			Database:                po.DatabaseConfig,
			ShortcutCommand:         po.ShortcutCommand,
		},
	}
}

func (sa *SingleAgentDraftDAO) singleAgentDraftDo2Po(do *entity.SingleAgent) *model.SingleAgentDraft {
	return &model.SingleAgentDraft{
		AgentID:                 do.AgentID,
		CreatorID:               do.CreatorID,
		SpaceID:                 do.SpaceID,
		Name:                    do.Name,
		Description:             do.Desc,
		IconURI:                 do.IconURI,
		CreatedAt:               do.CreatedAt,
		UpdatedAt:               do.UpdatedAt,
		DeletedAt:               do.DeletedAt,
		ModelInfo:               do.ModelInfo,
		OnboardingInfo:          do.OnboardingInfo,
		Prompt:                  do.Prompt,
		Plugin:                  do.Plugin,
		Knowledge:               do.Knowledge,
		Workflow:                do.Workflow,
		SuggestReply:            do.SuggestReply,
		JumpConfig:              do.JumpConfig,
		VariablesMetaID:         do.VariablesMetaID,
		BackgroundImageInfoList: do.BackgroundImageInfoList,
		DatabaseConfig:          do.Database,
		ShortcutCommand:         do.ShortcutCommand,
	}
}
