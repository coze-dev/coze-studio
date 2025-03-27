package workflow

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/selector"
)

func TestSelector(t *testing.T) {
	t.Run("multiple predecessors", func(t *testing.T) {
		ctx := context.Background()

		wf := NewWorkflow()
		wf.AddLambdaNode("1", compose.InvokableLambda(func(ctx context.Context, in map[string]any) (output map[string]any, err error) {
			return map[string]any{"k1": "v1"}, nil
		})).AddDependency(compose.START)
		wf.AddLambdaNode("2", compose.InvokableLambda(func(ctx context.Context, in map[string]any) (output map[string]any, err error) {
			return map[string]any{"k2": "v2"}, nil
		})).AddDependency(compose.START)
		wf.AddLambdaNode("3", compose.InvokableLambda(func(ctx context.Context, in map[string]any) (output map[string]any, err error) {
			return map[string]any{"k3": "v3"}, nil
		}))
		wf.AddLambdaNode("4", compose.InvokableLambda(func(ctx context.Context, in map[string]any) (output map[string]any, err error) {
			return map[string]any{"k4": "v4"}, nil
		}))

		s, err := selector.NewSelector(ctx, &selector.Config{
			Predecessors: []string{"1", "2"},
			Clauses: []selector.Clause{
				{
					LeftOperant: selector.Operant{
						FromNodeKey: "1",
						Path:        compose.FieldPath{"k1"},
					},
					Op: selector.OperatorEqual,
					RightOperant: &selector.Operant{
						FromNodeKey: compose.START,
						Path:        compose.FieldPath{"k_start"},
					},
					Choices: []string{"3"},
				},
				{
					LeftOperant: selector.Operant{
						FromNodeKey: "1",
						Path:        compose.FieldPath{"k1"},
					},
					Op:         selector.OperatorLengthGreater,
					RightValue: 3,
					Choices:    []string{"4"},
				},
			},
			DefaultChoice: []string{compose.END},
		})

		wf.AddSelectorNode("selector", s)
		wf.End().AddInputWithOptions("1", []*compose.FieldMapping{compose.MapFields("k1", "k1")}, compose.WithNoDirectDependency()).
			AddInputWithOptions("2", []*compose.FieldMapping{compose.MapFields("k2", "k2")}, compose.WithNoDirectDependency()).
			AddInput("3", compose.MapFields("k3", "k3")).
			AddInput("4", compose.MapFields("k4", "k4"))
		r, err := wf.Compile(ctx)
		assert.NoError(t, err)
		out, err := r.Invoke(ctx, map[string]any{"k_start": "v_k_start"})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"k1": "v1",
			"k2": "v2",
		}, out)
	})
}
