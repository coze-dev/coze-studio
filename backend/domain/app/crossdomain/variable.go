package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
)

type VariablesService interface {
	DeleteVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string) error
}
