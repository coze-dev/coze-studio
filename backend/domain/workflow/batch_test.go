package workflow

import (
	"context"
	"fmt"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func TestBatch(t *testing.T) {
	ctx := context.Background()

	wf := &Workflow{
		workflow: compose.NewWorkflow[map[string]any, map[string]any](),
		hierarchy: map[nodeKey][]nodeKey{
			"lambda":               {"batch_node_key"},
			"index":                {"batch_node_key"},
			"consumer":             {"batch_node_key"},
			"batch_node_key":       {},
			"parent_predecessor_1": {},
		},
		connections: []*connection{
			{
				FromNode: compose.START,
				ToNode:   "parent_predecessor_1",
			},
			{
				FromNode: "parent_predecessor_1",
				ToNode:   "batch_node_key",
			},
			{
				FromNode: "batch_node_key",
				ToNode:   "lambda",
			},
			{
				FromNode: "lambda",
				ToNode:   "index",
			},
			{
				FromNode: "lambda",
				ToNode:   "consumer",
			},
			{
				FromNode: "index",
				ToNode:   "batch_node_key",
			},
			{
				FromNode: "consumer",
				ToNode:   "batch_node_key",
			},
			{
				FromNode: "batch_node_key",
				ToNode:   compose.END,
			},
		},
	}

	lambda1 := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		if in["index"].(int) > 2 {
			return nil, fmt.Errorf("index= %d is too large", in["index"].(int))
		}

		out = make(map[string]any)
		out["output_1"] = fmt.Sprintf("%s_%v_%d", in["array_1"].(string), in["from_parent_wf"].(bool), in["index"].(int))
		return out, nil
	}

	lambda2 := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		return map[string]any{"index": in["index"]}, nil
	}

	lambda3 := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		t.Log(in["consumer_1"].(string), in["array_2"].(int), in["static_source"].(string))
		return in, nil
	}

	innerNodes := map[nodeKey]*schema.NodeSchema{
		"lambda": {
			Type:   schema.NodeTypeLambda,
			Lambda: compose.InvokableLambda(lambda1),
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"index"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "batch_node_key",
								FromPath:    compose.FieldPath{"index"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"array_1"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "batch_node_key",
								FromPath:    compose.FieldPath{"array_1"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"from_parent_wf"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "parent_predecessor_1",
								FromPath:    compose.FieldPath{"success"},
							},
						},
					},
				},
			},
		},
		"index": {
			Type:   schema.NodeTypeLambda,
			Lambda: compose.InvokableLambda(lambda2),
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"index"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "batch_node_key",
								FromPath:    compose.FieldPath{"index"},
							},
						},
					},
				},
			},
		},
		"consumer": {
			Type:   schema.NodeTypeLambda,
			Lambda: compose.InvokableLambda(lambda3),
			Inputs: []*nodes.InputField{
				{
					Path: compose.FieldPath{"consumer_1"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "lambda",
								FromPath:    compose.FieldPath{"output_1"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"array_2"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "batch_node_key",
								FromPath:    compose.FieldPath{"array_2"},
							},
						},
					},
				},
				{
					Path: compose.FieldPath{"static_source"},
					Info: nodes.FieldInfo{
						Source: &nodes.FieldSource{
							Val: "this is a const",
						},
					},
				},
			},
		},
	}

	innerRun, parentInfo, err := wf.composeInnerWorkflow(ctx, innerNodes, []*nodes.InputField{
		{
			Path: compose.FieldPath{"lambda", "output_1"},
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "lambda",
						FromPath:    compose.FieldPath{"output_1"},
					},
				},
			},
		},
		{
			Path: compose.FieldPath{"index", "index"},
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "index",
						FromPath:    compose.FieldPath{"index"},
					},
				},
			},
		},
	})
	assert.NoError(t, err)

	ns := &schema.NodeSchema{
		Type: schema.NodeTypeBatch,
		Configs: map[string]any{
			"BatchNodeKey": "batch_node_key",
		},
		Inputs: []*nodes.InputField{
			{
				Path: compose.FieldPath{"array_1"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"array_1"},
						},
					},
					Type: nodes.TypeInfo{
						Type:     nodes.DataTypeArray,
						ElemType: ptrOf(nodes.DataTypeString),
					},
				},
			},
			{
				Path: compose.FieldPath{"array_2"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"array_2"},
						},
					},
					Type: nodes.TypeInfo{
						Type:     nodes.DataTypeArray,
						ElemType: ptrOf(nodes.DataTypeString),
					},
				},
			},
			{
				Path: compose.FieldPath{"Concurrency"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Val: 2,
					},
				},
			},
			{
				Path: compose.FieldPath{"MaxIter"},
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Val: 5,
					},
				},
			},
		},
		Outputs: map[string]*schema.LayeredFieldInfo{
			"assembled_output_1": {
				Info: &nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "lambda",
							FromPath:    compose.FieldPath{"output_1"},
						},
					},
					Type: nodes.TypeInfo{
						Type:     nodes.DataTypeArray,
						ElemType: ptrOf(nodes.DataTypeString),
					},
				},
			},
			"assembled_output_2": {
				Info: &nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "index",
							FromPath:    compose.FieldPath{"index"},
						},
					},
					Type: nodes.TypeInfo{
						Type:     nodes.DataTypeArray,
						ElemType: ptrOf(nodes.DataTypeInteger),
					},
				},
			},
		},
	}

	parentLambda := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		return map[string]any{"success": true}, nil
	}
	_, err = wf.AddNode(ctx, "parent_predecessor_1", &schema.NodeSchema{
		Type:   schema.NodeTypeLambda,
		Lambda: compose.InvokableLambda(parentLambda),
	}, nil)
	assert.NoError(t, err)

	_, err = wf.AddNode(ctx, "batch_node_key", ns, &innerWorkflowInfo{
		inner:      innerRun,
		carryOvers: parentInfo.carryOvers,
	})
	assert.NoError(t, err)

	endDeps, err := wf.resolveDependencies(compose.END, []*nodes.InputField{
		{
			Path: compose.FieldPath{"assembled_output_1"},
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"assembled_output_1"},
					},
				},
			},
		},
		{
			Path: compose.FieldPath{"assembled_output_2"},
			Info: nodes.FieldInfo{
				Source: &nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"assembled_output_2"},
					},
				},
			},
		},
	})
	assert.NoError(t, err)

	err = wf.connectEndNode(endDeps)
	assert.NoError(t, err)

	outerRun, err := wf.Compile(ctx)
	assert.NoError(t, err)

	out, err := outerRun.Invoke(ctx, map[string]any{
		"array_1": []any{"a", "b", "c"},
		"array_2": []any{1, 2, 3, 4},
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"assembled_output_1": []any{"a_true_0", "b_true_1", "c_true_2"},
		"assembled_output_2": []any{0, 1, 2},
	}, out)

	// input array is empty
	out, err = outerRun.Invoke(ctx, map[string]any{
		"array_1": []any{},
		"array_2": []any{1},
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"assembled_output_1": []any{},
		"assembled_output_2": []any{},
	}, out)

	// less than concurrency
	out, err = outerRun.Invoke(ctx, map[string]any{
		"array_1": []any{"a"},
		"array_2": []any{1, 2},
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"assembled_output_1": []any{"a_true_0"},
		"assembled_output_2": []any{0},
	}, out)

	// err by inner node
	_, err = outerRun.Invoke(ctx, map[string]any{
		"array_1": []any{"a", "b", "c", "d", "e", "f"},
		"array_2": []any{1, 2, 3, 4, 5, 6, 7},
	})
	assert.ErrorContains(t, err, "is too large")
}
