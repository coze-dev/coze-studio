package variableassigner

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type VariableAssignerInLoop struct {
	config               *Config
	intermediateVarStore variable.Store
}

func NewVariableAssignerInLoop(_ context.Context, conf *Config) (*VariableAssignerInLoop, error) {
	return &VariableAssignerInLoop{
		config:               conf,
		intermediateVarStore: &nodes.ParentIntermediateStore{},
	}, nil
}

func (v *VariableAssignerInLoop) Assign(ctx context.Context, in map[string]any) error {
	for _, pair := range v.config.Pairs {
		if pair.Left.VariableType == nil {
			return fmt.Errorf("cannot assign to output of nodes in VariableAssignerInloop, ref: %v", pair.Left)
		}

		if *pair.Left.VariableType == variable.GlobalUser {
			return fmt.Errorf("cannot assign to global user variables in VariableAssignerInloop because they are not supported to set value, ref: %v", pair.Left)
		}

		if *pair.Left.VariableType == variable.GlobalAPP {
			return fmt.Errorf("cannot assign to global app variables in VariableAssignerInloop because they are not supported to set value, ref: %v", pair.Left)
		}

		if *pair.Left.VariableType == variable.GlobalSystem {
			return fmt.Errorf("cannot assign to global system variables in VariableAssignerInloop because they are read-only, ref: %v", pair.Left)
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
