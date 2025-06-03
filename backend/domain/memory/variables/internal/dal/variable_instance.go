package dal

import (
	"context"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

func (v *VariablesDAO) DeleteVariableInstance(ctx context.Context, do *entity.UserVariableMeta, keywords []string) error {
	table := query.VariableInstance
	condWhere := []gen.Condition{
		table.BizType.Eq(do.BizType),
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
		table.BizType.Eq(do.BizType),
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
		BizType:      po.BizType,
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
		BizType:      po.BizType,
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
