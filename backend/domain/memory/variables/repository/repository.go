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

	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func NewVariableRepo(db *gorm.DB, generator idgen.IDGenerator) VariableRepository {
	return dal.NewDAO(db, generator)
}

type VariableRepository interface {
	DeleteAllVariableData(ctx context.Context, bizType project_memory.VariableConnector, bizID string) (err error)
	DeleteVariableInstance(ctx context.Context, do *entity.UserVariableMeta, keywords []string) error
	GetVariableInstances(ctx context.Context, do *entity.UserVariableMeta, keywords []string) ([]*entity.VariableInstance, error)
	UpdateVariableInstance(ctx context.Context, KVs []*entity.VariableInstance) error
	InsertVariableInstance(ctx context.Context, KVs []*entity.VariableInstance) error
	GetProjectVariable(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error)
	GetAgentVariable(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error)
	CreateProjectVariable(ctx context.Context, do *entity.VariablesMeta) (int64, error)
	CreateVariableMeta(ctx context.Context, do *entity.VariablesMeta, bizType project_memory.VariableConnector) (int64, error)
	UpdateProjectVariable(ctx context.Context, do *entity.VariablesMeta, bizType project_memory.VariableConnector) error
	GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.VariablesMeta, error)
	GetVariableMetaByID(ctx context.Context, id int64) (*entity.VariablesMeta, error)
}
