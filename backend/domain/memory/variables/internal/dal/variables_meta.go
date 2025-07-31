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

	"gorm.io/gen"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/project_memory"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (m *VariablesDAO) GetProjectVariable(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error) {
	return m.GetVariableMeta(ctx, projectID, project_memory.VariableConnector_Project, version)
}

func (m *VariablesDAO) GetAgentVariable(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error) {
	return m.GetVariableMeta(ctx, projectID, project_memory.VariableConnector_Bot, version)
}

func (m *VariablesDAO) CreateProjectVariable(ctx context.Context, do *entity.VariablesMeta) (int64, error) {
	return m.CreateVariableMeta(ctx, do, project_memory.VariableConnector_Project)
}

func (m *VariablesDAO) CreateVariableMeta(ctx context.Context, do *entity.VariablesMeta, bizType project_memory.VariableConnector) (int64, error) {
	table := query.VariablesMeta

	id, err := m.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrMemoryIDGenFailCode, errorx.KV("msg", "CreateProjectVariable"))
	}

	po := m.variablesMetaDO2PO(do)
	po.ID = id
	po.BizType = int32(bizType)

	err = table.WithContext(ctx).Create(po)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrMemoryCreateAppVariableCode)
	}

	return id, nil
}

func (m *VariablesDAO) UpdateProjectVariable(ctx context.Context, do *entity.VariablesMeta, bizType project_memory.VariableConnector) error {
	table := query.VariablesMeta
	condWhere := []gen.Condition{
		table.ID.Eq(do.ID),
		table.BizType.Eq(int32(bizType)),
	}

	po := m.variablesMetaDO2PO(do)

	_, err := table.WithContext(ctx).Where(condWhere...).Updates(po)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrMemoryUpdateAppVariableCode)
	}

	return nil
}

// GetVariableMeta Gets variable metadata, returns nil if it does not exist
func (m *VariablesDAO) GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.VariablesMeta, error) {
	table := query.VariablesMeta
	condWhere := []gen.Condition{
		table.BizID.Eq(bizID),
		table.BizType.Eq(int32(bizType)),
		table.Version.Eq(version),
	}

	data, err := table.WithContext(ctx).Where(condWhere...).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrMemoryGetVariableMetaCode)
	}

	do := m.variablesMetaPO2DO(data)

	return do, nil
}

// GetVariableMetaByID Gets variable metadata, returns nil if there is no such thing
func (m *VariablesDAO) GetVariableMetaByID(ctx context.Context, id int64) (*entity.VariablesMeta, error) {
	table := query.VariablesMeta
	condWhere := []gen.Condition{
		table.ID.Eq(id),
	}

	data, err := table.WithContext(ctx).Where(condWhere...).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrMemoryGetVariableMetaCode)
	}

	do := m.variablesMetaPO2DO(data)

	return do, nil
}

func (m *VariablesDAO) variablesMetaPO2DO(po *model.VariablesMeta) *entity.VariablesMeta {
	if po == nil {
		return nil
	}

	return &entity.VariablesMeta{
		ID:        po.ID,
		CreatorID: po.CreatorID,
		BizType:   project_memory.VariableConnector(po.BizType),
		BizID:     po.BizID,
		Variables: po.VariableList,
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
		Version:   po.Version,
	}
}

func (m *VariablesDAO) variablesMetaDO2PO(do *entity.VariablesMeta) *model.VariablesMeta {
	if do == nil {
		return nil
	}

	return &model.VariablesMeta{
		ID:           do.ID,
		CreatorID:    do.CreatorID,
		BizType:      int32(do.BizType),
		BizID:        do.BizID,
		VariableList: do.Variables,
		CreatedAt:    do.CreatedAt,
		UpdatedAt:    do.UpdatedAt,
		Version:      do.Version,
	}
}
