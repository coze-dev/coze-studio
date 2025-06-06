package variableassigner

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type InLoop struct {
	config               *Config
	intermediateVarStore variable.Store
}

func NewVariableAssignerInLoop(_ context.Context, conf *Config) (*InLoop, error) {
	return &InLoop{
		config:               conf,
		intermediateVarStore: &nodes.ParentIntermediateStore{},
	}, nil
}

func (v *InLoop) Assign(ctx context.Context, in map[string]any) (err error) {
	for _, pair := range v.config.Pairs {
		if pair.Left.VariableType == nil || *pair.Left.VariableType != variable.ParentIntermediate {
			panic(fmt.Errorf("dest is %+v in VariableAssignerInloop, invalid", pair.Left))
		}

		right, ok := nodes.TakeMapValue(in, pair.Right)
		if !ok {
			return fmt.Errorf("failed to extract right value for path %s", pair.Right)
		}

		err := v.intermediateVarStore.Set(ctx, pair.Left.FromPath, right)
		if err != nil {
			return err
		}
	}

	return nil
}
