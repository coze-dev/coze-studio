package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewVariableRepo(db *gorm.DB, generator idgen.IDGenerator) VariableRepository {
	return dal.NewDAO(db, generator)
}

type VariableRepository interface {
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
