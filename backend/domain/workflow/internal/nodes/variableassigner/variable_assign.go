package variableassigner

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type AppVariableStore interface {
	GetAppVariableValue(key string) (any, bool)
	SetAppVariableValue(key string, value any)
}

type VariableAssigner struct {
	config *Config
}

type Config struct {
	Pairs   []*Pair
	Handler *variable.Handler
}

type Pair struct {
	Left  vo.Reference
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

		right, ok := nodes.TakeMapValue(in, pair.Right)
		if !ok {
			return fmt.Errorf("failed to extract right value for path %s", pair.Right)
		}

		vType := *pair.Left.VariableType
		switch vType {
		case variable.GlobalAPP:
			return compose.ProcessState(ctx, func(ctx context.Context, appVarsStore AppVariableStore) error {
				if len(pair.Left.FromPath) != 1 {
					return fmt.Errorf("invalid path: %v", pair.Left.FromPath)
				}
				appVarsStore.SetAppVariableValue(pair.Left.FromPath[0], right)
				return nil
			})
		case variable.GlobalUser:
			return v.config.Handler.Set(ctx, *pair.Left.VariableType, pair.Left.FromPath, right)
		default:
			return fmt.Errorf("cannot assign to variable type %s in VariableAssigner", vType)
		}
	}

	return nil
}
