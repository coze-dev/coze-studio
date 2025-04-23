package variableassigner

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	nodes2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type VariableAssigner struct {
	config *Config
}

type Config struct {
	Pairs   []*Pair
	Handler *variable.Handler
}

type Pair struct {
	Left  nodes2.Reference
	Right compose.FieldPath
}

func NewVariableAssigner(_ context.Context, conf *Config) (*VariableAssigner, error) {
	return &VariableAssigner{
		config: conf,
	}, nil
}

func (v *VariableAssigner) Assign(ctx context.Context, in map[string]any) error {
	for _, pair := range v.config.Pairs {
		if pair.Left.VariableType == nil {
			return fmt.Errorf("cannot assign to output of nodes in VariableAssigner, ref: %v", pair.Left)
		}

		if *pair.Left.VariableType == variable.GlobalSystem {
			return fmt.Errorf("cannot assign to global system variables in VariableAssigner because they are read-only, ref: %v", pair.Left)
		}

		right, ok := nodes2.TakeMapValue(in, pair.Right)
		if !ok {
			return fmt.Errorf("failed to extract right value for path %s", pair.Right)
		}

		err := v.config.Handler.Set(ctx, *pair.Left.VariableType, pair.Left.FromPath, right)
		if err != nil {
			return err
		}
	}

	return nil
}
