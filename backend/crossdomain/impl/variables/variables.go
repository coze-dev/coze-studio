package variables

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/variables"
	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossvariables"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
)

var defaultSVC crossvariables.Variables

type impl struct {
	DomainSVC variables.Variables
}

func InitDomainService(c variables.Variables) crossvariables.Variables {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (s *impl) GetVariableInstance(ctx context.Context, e *model.UserVariableMeta, keywords []string) ([]*kvmemory.KVItem, error) {
	m := entity.NewUserVariableMeta(e)
	return s.DomainSVC.GetVariableInstance(ctx, m, keywords)
}

func (s *impl) SetVariableInstance(ctx context.Context, e *model.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error) {
	m := entity.NewUserVariableMeta(e)
	return s.DomainSVC.SetVariableInstance(ctx, m, items)
}
