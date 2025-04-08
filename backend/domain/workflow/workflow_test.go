package workflow

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableaggregator"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func ptrOf[T any](v T) *T {
	return &v
}

func TestAddSelector(t *testing.T) {
	// start -> selector, selector.condition1 -> lambda1 -> end, selector.condition2 -> [lambda2, lambda3] -> end, selector default -> end
	wf := &Workflow{
		workflow: compose.NewWorkflow[map[string]any, map[string]any](),
		hierarchy: map[nodeKey][]nodeKey{
			compose.START: {},
			compose.END:   {},
			"lambda1":     {},
			"lambda2":     {},
			"lambda3":     {},
			"selector":    {},
		},
		connections: []*connection{
			{
				FromNode: compose.START,
				ToNode:   "selector",
			},
			{
				FromNode:   "selector",
				ToNode:     "lambda1",
				FromPort:   ptrOf("true"),
				FromBranch: true,
			},
			{
				FromNode:   "selector",
				ToNode:     "lambda2",
				FromPort:   ptrOf("true_1"),
				FromBranch: true,
			},
			{
				FromNode:   "selector",
				ToNode:     "lambda3",
				FromPort:   ptrOf("true_1"),
				FromBranch: true,
			},
			{
				FromNode: "selector",
				ToNode:   compose.END,
				FromPort: ptrOf("false"),
			},
			{
				FromNode: "lambda1",
				ToNode:   compose.END,
			},
			{
				FromNode: "lambda2",
				ToNode:   compose.END,
			},
			{
				FromNode: "lambda3",
				ToNode:   compose.END,
			},
		},
	}

	lambda1 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda1": "v1",
		}, nil
	}

	lambda2 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda2": "v2",
		}, nil
	}

	lambda3 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda3": "v3",
		}, nil
	}

	ns := &schema.NodeSchema{
		Type: schema.NodeTypeSelector,
		Configs: []*selector.OneClauseSchema{
			{
				Single: ptrOf(selector.OperatorEqual),
			},
			{
				Multi: &selector.MultiClauseSchema{
					Clauses: []*selector.Operator{
						ptrOf(selector.OperatorGreater),
						ptrOf(selector.OperatorIsTrue),
					},
					Relation: selector.ClauseRelationAND,
				},
			},
		},
		Inputs: []*nodes.InputField{
			{
				Path: compose.FieldPath{"0", "Left"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"key1"},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"0", "Right"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Val: "value1",
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "0", "Left"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"key2"},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "0", "Right"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"key3"},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "1", "Left"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"key4"},
						},
					},
				},
			},
		},
	}

	ctx := context.Background()

	sc, err := ns.ToSelectorConfig()
	assert.NoError(t, err)

	s, err := selector.NewSelector(ctx, sc)
	assert.NoError(t, err)
	assert.Equal(t, 2, s.ConditionCount())

	_, err = wf.AddNode(ctx, "selector", ns, nil)
	assert.NoError(t, err)

	wf.AddLambdaNode("lambda1", compose.InvokableLambda(lambda1))
	wf.AddLambdaNode("lambda2", compose.InvokableLambda(lambda2))
	wf.AddLambdaNode("lambda3", compose.InvokableLambda(lambda3))

	endDeps, err := wf.resolveDependencies(compose.END, []*nodes.InputField{
		{
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "lambda1",
						FromPath:    compose.FieldPath{"lambda1"},
					},
				},
			},
			Path: compose.FieldPath{"lambda1"},
		},
		{
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "lambda2",
						FromPath:    compose.FieldPath{"lambda2"},
					},
				},
			},
			Path: compose.FieldPath{"lambda2"},
		},
		{
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "lambda3",
						FromPath:    compose.FieldPath{"lambda3"},
					},
				},
			},
			Path: compose.FieldPath{"lambda3"},
		},
	})
	assert.NoError(t, err)

	err = wf.connectEndNode(endDeps)

	r, err := wf.Compile(ctx)
	assert.NoError(t, err)

	out, err := r.Invoke(ctx, map[string]any{
		"key1": "value1",
		"key2": 2,
		"key3": 3,
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"lambda1": "v1",
	}, out)

	out, err = r.Invoke(ctx, map[string]any{
		"key1": "value2",
		"key2": 3,
		"key3": 2,
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"lambda2": "v2",
		"lambda3": "v3",
	}, out)

	out, err = r.Invoke(ctx, map[string]any{
		"key1": "value2",
		"key2": 2,
		"key3": 3,
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{}, out)
}

func TestVariableAggregator(t *testing.T) {
	wf := &Workflow{
		workflow: compose.NewWorkflow[map[string]any, map[string]any](),
		hierarchy: map[nodeKey][]nodeKey{
			compose.START: {},
			compose.END:   {},
			"va":          {},
		},
		connections: []*connection{
			{
				FromNode: compose.START,
				ToNode:   "va",
			},
			{
				FromNode: "va",
				ToNode:   compose.END,
			},
		},
	}

	ns := &schema.NodeSchema{
		Type: schema.NodeTypeVariableAggregator,
		Configs: map[string]any{
			"MergeStrategy": variableaggregator.FirstNotNullValue,
		},
		Inputs: []*nodes.InputField{
			{
				Path: compose.FieldPath{"Group1", "0"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"Str1"},
						},
					},
				},
			},
			{
				Path: compose.FieldPath{"Group2", "0"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"Int1"},
						},
					},
				},
			},
		},
	}

	endInputs := []*nodes.InputField{
		{
			Path: compose.FieldPath{"Group1"},
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "va",
						FromPath:    compose.FieldPath{"Group1"},
					},
				},
			},
		},
		{
			Path: compose.FieldPath{"Group2"},
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "va",
						FromPath:    compose.FieldPath{"Group2"},
					},
				},
			},
		},
	}

	_, err := wf.AddNode(context.Background(), "va", ns, nil)
	assert.NoError(t, err)

	endDeps, err := wf.resolveDependencies(compose.END, endInputs)
	assert.NoError(t, err)
	err = wf.connectEndNode(endDeps)
	assert.NoError(t, err)

	r, err := wf.Compile(context.Background())
	assert.NoError(t, err)

	out, err := r.Invoke(context.Background(), map[string]any{
		"Str1": "str_v1",
		"Int1": 1,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"Group1": "str_v1",
		"Group2": 1,
	}, out)

	out, err = r.Invoke(context.Background(), map[string]any{
		"Str1": "str_v1",
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"Group1": "str_v1",
	}, out)
}
