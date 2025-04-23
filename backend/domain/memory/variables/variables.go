package variables

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
)

type Variables interface {
	GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.VariablesMeta, error)
	GetVariableMetaByID(ctx context.Context, id int64) (*entity.VariablesMeta, error)
	GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.VariablesMeta, error)
	GetProjectVariablesMeta(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error)
	GetSysVariableConf(ctx context.Context) entity.SysConfVariables
	UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.VariablesMeta) (int64, error)
	UpsertBotMeta(ctx context.Context, agentID int64, version string, userID int64, e *entity.VariablesMeta) (int64, error)

	SetVariableInstance(ctx context.Context, e *entity.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error)
	GetVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string, varChannel *project_memory.VariableChannel) ([]*kvmemory.KVItem, error)
	DeleteVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string) error
}
