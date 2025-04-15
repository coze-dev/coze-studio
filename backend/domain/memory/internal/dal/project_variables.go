package dal

import (
	"context"
	"errors"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func (m *MemoryDAO) GetProjectVariables(ctx context.Context, projectID, version string) (*model.ProjectVariable, error) {
	table := query.ProjectVariable
	promptWhere := []gen.Condition{
		table.ProjectID.Eq(projectID),
		table.Version.Eq(version),
	}

	data, err := table.WithContext(ctx).Where(promptWhere...).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.New(errno.ErrGetProjectVariableCode)
	}

	return data, nil
}
