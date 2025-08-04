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

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

func NewSingleAgentRepo(db *gorm.DB, idGen idgen.IDGenerator, cli cache.Cmdable) SingleAgentDraftRepo {
	return dal.NewSingleAgentDraftDAO(db, idGen, cli)
}

func NewSingleAgentVersionRepo(db *gorm.DB, idGen idgen.IDGenerator) SingleAgentVersionRepo {
	return dal.NewSingleAgentVersion(db, idGen)
}

func NewCounterRepo(cli cache.Cmdable) CounterRepository {
	return dal.NewCountRepo(cli)
}

type SingleAgentDraftRepo interface {
	Create(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (draftID int64, err error)
	CreateWithID(ctx context.Context, creatorID, agentID int64, draft *entity.SingleAgent) (draftID int64, err error)
	Get(ctx context.Context, agentID int64) (*entity.SingleAgent, error)
	MGet(ctx context.Context, agentIDs []int64) ([]*entity.SingleAgent, error)
	Delete(ctx context.Context, spaceID, agentID int64) (err error)
	Update(ctx context.Context, agentInfo *entity.SingleAgent) (err error)

	GetDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error)
	UpdateDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error
}

type SingleAgentVersionRepo interface {
	GetLatest(ctx context.Context, agentID int64) (*entity.SingleAgent, error)
	Get(ctx context.Context, agentID int64, version string) (*entity.SingleAgent, error)
	List(ctx context.Context, agentID int64, pageIndex, pageSize int32) ([]*entity.SingleAgentPublish, error)
	SavePublishRecord(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) (err error)
	Create(ctx context.Context, connectorID int64, version string, e *entity.SingleAgent) (int64, error)
}

type CounterRepository interface {
	Get(ctx context.Context, key string) (int64, error)
	IncrBy(ctx context.Context, key string, incr int64) error
	Set(ctx context.Context, key string, value int64) error
	Del(ctx context.Context, key string) error
}
