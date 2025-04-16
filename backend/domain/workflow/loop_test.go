package workflow

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
	"code.byted.org/flow/opencoze/backend/domain/workflow/variables"
)

func TestLoop(t *testing.T) {
	t.Run("by iteration", func(t *testing.T) {
		// start-> loop_node_key[innerNode->continue] -> end
		innerNodes := map[nodeKey]*schema.NodeSchema{
			"innerNode": {
				Type: schema.NodeTypeLambda,
				Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
					index := in["index"].(int)
					return map[string]any{"output": index}, nil
				}),
				InputSources: []*nodes.FieldInfo{
					{
						Path: compose.FieldPath{"index"},
						Source: nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "loop_node_key",
								FromPath:    compose.FieldPath{"index"},
							},
						},
					},
				},
			},
			"continueNode": {
				Type: schema.NodeTypeContinue,
			},
		}

		loopNode := &schema.NodeSchema{
			Type: schema.NodeTypeLoop,
			Configs: map[string]any{
				"LoopNodeKey": "loop_node_key",
				"LoopType":    loop.ByIteration,
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{loop.Count},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"count"},
						},
					},
				},
			},
			OutputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](),
			hierarchy: nodeHierarchy{
				"loop_node_key": {},
				"innerNode":     {"loop_node_key"},
				"continueNode":  {"loop_node_key"},
			},
			connections: []*connection{
				{
					FromNode: "loop_node_key",
					ToNode:   "innerNode",
				},
				{
					FromNode: "innerNode",
					ToNode:   "continueNode",
				},
				{
					FromNode: "continueNode",
					ToNode:   "loop_node_key",
				},
				{
					FromNode: compose.START,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   compose.END,
				},
			},
		}

		inner, _, err := wf.composeInnerWorkflow(context.Background(), innerNodes, []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "innerNode",
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		})
		assert.NoError(t, err)
		_, err = wf.AddNode(context.Background(), "loop_node_key", loopNode, &innerWorkflowInfo{
			inner: inner,
		})
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "loop_node_key",
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		})
		assert.NoError(t, err)
		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(context.Background())
		assert.NoError(t, err)
		out, err := r.Invoke(context.Background(), map[string]any{
			"count": 3,
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{0, 1, 2},
		}, out)
	})

	t.Run("infinite", func(t *testing.T) {
		// start-> loop_node_key[innerNode->break] -> end
		innerNodes := map[nodeKey]*schema.NodeSchema{
			"innerNode": {
				Type: schema.NodeTypeLambda,
				Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
					index := in["index"].(int)
					return map[string]any{"output": index}, nil
				}),
				InputSources: []*nodes.FieldInfo{
					{
						Path: compose.FieldPath{"index"},
						Source: nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "loop_node_key",
								FromPath:    compose.FieldPath{"index"},
							},
						},
					},
				},
			},
			"breakNode": {
				Type: schema.NodeTypeBreak,
			},
		}

		loopNode := &schema.NodeSchema{
			Type: schema.NodeTypeLoop,
			Configs: map[string]any{
				"LoopNodeKey": "loop_node_key",
				"LoopType":    loop.Infinite,
			},
			OutputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](),
			hierarchy: nodeHierarchy{
				"loop_node_key": {},
				"innerNode":     {"loop_node_key"},
				"breakNode":     {"loop_node_key"},
			},
			connections: []*connection{
				{
					FromNode: "loop_node_key",
					ToNode:   "innerNode",
				},
				{
					FromNode: "innerNode",
					ToNode:   "breakNode",
				},
				{
					FromNode: "breakNode",
					ToNode:   "loop_node_key",
				},
				{
					FromNode: compose.START,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   compose.END,
				},
			},
		}

		inner, _, err := wf.composeInnerWorkflow(context.Background(), innerNodes, []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "innerNode",
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		})
		assert.NoError(t, err)
		_, err = wf.AddNode(context.Background(), "loop_node_key", loopNode, &innerWorkflowInfo{
			inner: inner,
		})
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "loop_node_key",
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		})
		assert.NoError(t, err)
		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(context.Background())
		assert.NoError(t, err)
		out, err := r.Invoke(context.Background(), map[string]any{})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{0},
		}, out)
	})

	t.Run("by array", func(t *testing.T) {
		// start-> loop_node_key[innerNode->variable_assign] -> end
		innerNodes := map[nodeKey]*schema.NodeSchema{
			"innerNode": {
				Type: schema.NodeTypeLambda,
				Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
					item1 := in["item1"].(string)
					item2 := in["item2"].(string)
					count := in["count"].(int)
					return map[string]any{"total": count + len(item1) + len(item2)}, nil
				}),
				InputSources: []*nodes.FieldInfo{
					{
						Path: compose.FieldPath{"item1"},
						Source: nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "loop_node_key",
								FromPath:    compose.FieldPath{"items1"},
							},
						},
					},
					{
						Path: compose.FieldPath{"item2"},
						Source: nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "loop_node_key",
								FromPath:    compose.FieldPath{"items2"},
							},
						},
					},
					{
						Path: compose.FieldPath{"count"},
						Source: nodes.FieldSource{
							Ref: &nodes.Reference{
								FromPath:     compose.FieldPath{"count"},
								VariableType: ptrOf(variables.ParentIntermediate),
							},
						},
					},
				},
			},
			"assigner": {
				Type: schema.NodeTypeVariableAssigner,
				Configs: []*variableassigner.Pair{
					{
						Left: nodes.Reference{
							FromPath:     compose.FieldPath{"count"},
							VariableType: ptrOf(variables.ParentIntermediate),
						},
						Right: compose.FieldPath{"total"},
					},
				},
				InputSources: []*nodes.FieldInfo{
					{
						Path: compose.FieldPath{"total"},
						Source: nodes.FieldSource{
							Ref: &nodes.Reference{
								FromNodeKey: "innerNode",
								FromPath:    compose.FieldPath{"total"},
							},
						},
					},
				},
			},
		}

		loopNode := &schema.NodeSchema{
			Type: schema.NodeTypeLoop,
			Configs: map[string]any{
				"LoopNodeKey": "loop_node_key",
				"LoopType":    loop.ByArray,
				"InputArrays": []string{"items1", "items2"},
				"IntermediateVars": map[string]*nodes.TypeInfo{
					"count": {
						Type: nodes.DataTypeInteger,
					},
				},
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"items1"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"items1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"items2"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: compose.START,
							FromPath:    compose.FieldPath{"items2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"count"},
					Source: nodes.FieldSource{
						Val: 0,
					},
				},
			},
			OutputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"count"},
						},
					},
				},
			},
		}

		wf := &Workflow{
			workflow: compose.NewWorkflow[map[string]any, map[string]any](),
			hierarchy: nodeHierarchy{
				"loop_node_key": {},
				"innerNode":     {"loop_node_key"},
				"assigner":      {"loop_node_key"},
			},
			connections: []*connection{
				{
					FromNode: "loop_node_key",
					ToNode:   "innerNode",
				},
				{
					FromNode: "innerNode",
					ToNode:   "assigner",
				},
				{
					FromNode: "assigner",
					ToNode:   "loop_node_key",
				},
				{
					FromNode: compose.START,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   compose.END,
				},
			},
		}

		inner, _, err := wf.composeInnerWorkflow(context.Background(), innerNodes, nil)
		assert.NoError(t, err)
		_, err = wf.AddNode(context.Background(), "loop_node_key", loopNode, &innerWorkflowInfo{
			inner: inner,
		})
		assert.NoError(t, err)

		endDeps, err := wf.resolveDependencies(compose.END, []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "loop_node_key",
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		})
		assert.NoError(t, err)
		err = wf.connectEndNode(endDeps)
		assert.NoError(t, err)

		r, err := wf.Compile(context.Background())
		assert.NoError(t, err)
		out, err := r.Invoke(context.Background(), map[string]any{
			"items1": []any{"a", "b"},
			"items2": []any{"a1", "b1", "c1"},
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": 6,
		}, out)
	})
}
