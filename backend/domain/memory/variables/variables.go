package variables

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
)

type Variables interface {
	GetSysVariableConf(ctx context.Context) entity.SysConfVariables
	GetProjectVariableList(ctx context.Context, projectID, version string) (*entity.Variables, error)
	UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.Variables) (int64, error)
	GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.Variables, error)
	GetVariableMetaByID(ctx context.Context, id int64) (*entity.Variables, error)
	GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.Variables, error)
	UpsertBotMeta(ctx context.Context, agentID int64, version string, userID int64, e *entity.Variables) (int64, error)
}
