package dal

import (
	"context"
	"errors"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

const (
	ProjectVariableBizType = 0
)

func (m *VariablesDAO) GetProjectVariable(ctx context.Context, projectID, version string) (*model.VariablesMeta, error) {
	table := query.VariablesMeta
	condWhere := []gen.Condition{
		table.BizID.Eq(projectID),
		table.BizType.Eq(ProjectVariableBizType),
		table.Version.Eq(version),
	}

	data, err := table.WithContext(ctx).Where(condWhere...).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.New(errno.ErrGetProjectVariableCode)
	}

	return data, nil
}

func (m *VariablesDAO) CreateProjectVariable(ctx context.Context, po *model.VariablesMeta) (int64, error) {
	table := query.VariablesMeta

	id, err := m.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.New(errno.ErrIDGenFailCode, errorx.KV("msg", "CreateProjectVariable"))
	}

	po.ID = id
	po.BizType = ProjectVariableBizType

	err = table.WithContext(ctx).Create(po)
	if err != nil {
		return 0, errorx.New(errno.ErrCreateProjectVariableCode)
	}

	return id, nil
}

func (m *VariablesDAO) UpdateProjectVariable(ctx context.Context, po *model.VariablesMeta) error {
	table := query.VariablesMeta
	condWhere := []gen.Condition{
		table.ID.Eq(po.ID),
	}

	_, err := table.WithContext(ctx).Where(condWhere...).Updates(po)
	if err != nil {
		return errorx.New(errno.ErrCreateProjectVariableCode)
	}

	return nil
}
