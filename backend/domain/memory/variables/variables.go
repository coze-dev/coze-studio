package variables

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
)

type Variables interface {
	GetSysVariableConf(ctx context.Context) entity.VariableInfos
	GetProjectVariableList(ctx context.Context, projectID, version string) (*entity.Variables, error)
	GetProjectVariables(ctx context.Context, projectID, version string) (*entity.ProjectVariable, error)
	UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.Variables) error
}
