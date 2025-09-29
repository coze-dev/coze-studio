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

	"gorm.io/gen"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type VariablesDAO struct {
	IDGen idgen.IDGenerator
}

func NewDAO(db *gorm.DB, generator idgen.IDGenerator) *VariablesDAO {
	query.SetDefault(db)
	return &VariablesDAO{
		IDGen: generator,
	}
}

func (v *VariablesDAO) DeleteAllVariableData(ctx context.Context, bizType project_memory.VariableConnector, bizID string) (err error) {
	tx := query.Q.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	varInstanceTable := tx.VariableInstance
	varInsWhere := []gen.Condition{
		varInstanceTable.BizType.Eq(int32(bizType)),
		varInstanceTable.BizID.Eq(bizID),
	}

	_, err = varInstanceTable.WithContext(ctx).Where(varInsWhere...).Delete()
	if err != nil {
		return tx.Error
	}

	varMetaTable := tx.VariablesMeta
	varMetaWhere := []gen.Condition{
		varMetaTable.BizType.Eq(int32(bizType)),
		varMetaTable.BizID.Eq(bizID),
	}

	_, err = varMetaTable.WithContext(ctx).Where(varMetaWhere...).Delete()
	if err != nil {
		return tx.Error
	}

	err = tx.Commit()

	return err
}

func (v *VariablesDAO) DeleteVariableInstance(ctx context.Context, do *entity.UserVariableMeta, keywords []string) error {
	table := query.VariableInstance
	condWhere := []gen.Condition{
		table.BizType.Eq(int32(do.BizType)),
		table.BizID.Eq(do.BizID),
		table.Version.Eq(do.Version),
		table.ConnectorUID.Eq(do.ConnectorUID),
		table.ConnectorID.Eq(do.ConnectorID),
	}

	if len(keywords) > 0 {
		condWhere = append(condWhere, table.Keyword.In(keywords...))
	}

	_, err := table.WithContext(ctx).Where(condWhere...).Delete(&model.VariableInstance{})
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrMemoryDeleteVariableInstanceCode)
	}

	return nil
}

func (v *VariablesDAO) GetVariableInstances(ctx context.Context, do *entity.UserVariableMeta, keywords []string) ([]*entity.VariableInstance, error) {
	table := query.VariableInstance
	condWhere := []gen.Condition{
		table.BizType.Eq(int32(do.BizType)),
		table.BizID.Eq(do.BizID),
		table.Version.Eq(do.Version),
		table.ConnectorUID.Eq(do.ConnectorUID),
		table.ConnectorID.Eq(do.ConnectorID),
	}

	if len(keywords) > 0 {
		condWhere = append(condWhere, table.Keyword.In(keywords...))
	}

	res, err := table.WithContext(ctx).Where(condWhere...).Find()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrMemoryGetVariableInstanceCode)
	}

	dos := make([]*entity.VariableInstance, 0, len(res))
	for _, vv := range res {
		dos = append(dos, v.variableInstanceToDO(vv))
	}

	return dos, nil
}

func (v *VariablesDAO) variableInstanceToDO(po *model.VariableInstance) *entity.VariableInstance {
	return &entity.VariableInstance{
		ID:           po.ID,
		BizType:      project_memory.VariableConnector(po.BizType),
		BizID:        po.BizID,
		Version:      po.Version,
		ConnectorUID: po.ConnectorUID,
		ConnectorID:  po.ConnectorID,
		Keyword:      po.Keyword,
		Type:         po.Type,
		Content:      po.Content,
		CreatedAt:    po.CreatedAt,
		UpdatedAt:    po.UpdatedAt,
	}
}

func (v *VariablesDAO) variableInstanceToPO(po *entity.VariableInstance) *model.VariableInstance {
	return &model.VariableInstance{
		ID:           po.ID,
		BizType:      int32(po.BizType),
		BizID:        po.BizID,
		Version:      po.Version,
		ConnectorUID: po.ConnectorUID,
		ConnectorID:  po.ConnectorID,
		Keyword:      po.Keyword,
		Type:         po.Type,
		Content:      po.Content,
		CreatedAt:    po.CreatedAt,
		UpdatedAt:    po.UpdatedAt,
	}
}

func (m *VariablesDAO) UpdateVariableInstance(ctx context.Context, KVs []*entity.VariableInstance) error {
	if len(KVs) == 0 {
		return nil
	}

	table := query.VariableInstance

	for _, v := range KVs {
		p := m.variableInstanceToPO(v)
		_, err := table.WithContext(ctx).
			Where(
				table.ID.Eq(p.ID),
			).
			Updates(p)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrMemoryUpdateVariableInstanceCode)
		}
	}

	return nil
}

func (m *VariablesDAO) InsertVariableInstance(ctx context.Context, KVs []*entity.VariableInstance) error {
	if len(KVs) == 0 {
		return nil
	}

	table := query.VariableInstance

	ids, err := m.IDGen.GenMultiIDs(ctx, len(KVs))
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrMemoryIDGenFailCode, errorx.KV("msg", "InsertVariableInstance"))
	}

	pos := make([]*model.VariableInstance, 0, len(KVs))
	for i, v := range KVs {
		p := m.variableInstanceToPO(v)
		p.ID = ids[i]
		pos = append(pos, p)
	}

	err = table.WithContext(ctx).CreateInBatches(pos, 10)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrMemoryInsertVariableInstanceCode)
	}

	return nil
}
