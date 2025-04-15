package memory

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/entity"
)

type Variables interface {
	GetSysVariableConf(ctx context.Context) entity.VariableInfos
	GetProjectVariableList(ctx context.Context, projectID, version string) (*entity.Variables, error)
	GetProjectVariables(ctx context.Context, projectID, version string) (*entity.ProjectVariable, error)
}
