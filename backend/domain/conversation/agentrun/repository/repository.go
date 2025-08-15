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

	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

func NewRunRecordRepo(db *gorm.DB, idGen idgen.IDGenerator) RunRecordRepo {

	return dal.NewRunRecordDAO(db, idGen)
}

type RunRecordRepo interface {
	Create(ctx context.Context, runMeta *entity.AgentRunMeta) (*entity.RunRecordMeta, error)
	GetByID(ctx context.Context, id int64) (*entity.RunRecord, error)
	Delete(ctx context.Context, id []int64) error
	UpdateByID(ctx context.Context, id int64, update *entity.UpdateMeta) error
	List(ctx context.Context, meta *entity.ListRunRecordMeta) ([]*entity.RunRecordMeta, error)
}
