package loop

import (
	"context"
	"fmt"
	"reflect"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type VariableAssigner struct {
	config *VariableAssignerConfig
}

type VariableAssignerConfig struct {
	Pairs []*Pair
}

type Pair struct {
	Left  compose.FieldPath
	Right compose.FieldPath
}

func NewVariableAssigner(_ context.Context, conf *VariableAssignerConfig) (*VariableAssigner, error) {
	return &VariableAssigner{
		config: conf,
	}, nil
}

func (v *VariableAssigner) Assign(_ context.Context, in map[string]any) error {
	for _, pair := range v.config.Pairs {
		left, ok := nodes.TakeMapValue(in, pair.Left)
		if !ok {
			return fmt.Errorf("failed to extract left value for path %s", pair.Left)
		}

		right, ok := nodes.TakeMapValue(in, pair.Right)
		if !ok {
			return fmt.Errorf("failed to extract right value for path %s", pair.Right)
		}

		leftV := reflect.ValueOf(left)
		if leftV.Type().Kind() != reflect.Ptr {
			return fmt.Errorf("left value should be a pointer, path= %s, actual type= %v", pair.Left, leftV.Type())
		}

		rightV := reflect.ValueOf(right)
		if !rightV.Type().AssignableTo(leftV.Type().Elem()) {
			return fmt.Errorf("right value's type should be assignable to left value's element type, path= %s, left type= %v, right type= %v", pair.Left, leftV.Type().Elem(), rightV.Type())
		}

		leftV.Elem().Set(rightV)
	}

	return nil
}
