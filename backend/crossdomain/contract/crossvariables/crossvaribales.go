package crossvariables

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/variables"
	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
)

type Variables interface {
	GetVariableInstance(ctx context.Context, e *variables.UserVariableMeta, keywords []string) ([]*kvmemory.KVItem, error)
	SetVariableInstance(ctx context.Context, e *variables.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error)
}

var defaultSVC Variables

func DefaultSVC() Variables {
	return defaultSVC
}

func SetDefaultSVC(svc Variables) {
	defaultSVC = svc
}
