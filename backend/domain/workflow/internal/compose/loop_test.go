package compose

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestLoop(t *testing.T) {
	t.Run("by iteration", func(t *testing.T) {
		// start-> loop_node_key[innerNode->continue] -> end
		innerNode := &NodeSchema{
			Key:  "innerNode",
			Type: nodes.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				index := in["index"].(int64)
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
		}

		continueNode := &NodeSchema{
			Key:  "continueNode",
			Type: nodes.NodeTypeContinue,
		}

		entry := &NodeSchema{
			Key:  EntryNodeKey,
			Type: nodes.NodeTypeEntry,
		}

		loopNode := &NodeSchema{
			Key:  "loop_node_key",
			Type: nodes.NodeTypeLoop,
			Configs: map[string]any{
				"LoopType": loop.ByIteration,
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{loop.Count},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
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

		exit := &NodeSchema{
			Key:  ExitNodeKey,
			Type: nodes.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ws := &WorkflowSchema{
			Nodes: []*NodeSchema{
				entry,
				loopNode,
				exit,
				innerNode,
				continueNode,
			},
			Hierarchy: map[nodes.NodeKey]nodes.NodeKey{
				"innerNode":    "loop_node_key",
				"continueNode": "loop_node_key",
			},
			Connections: []*Connection{
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
					FromNode: entry.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"count": 3,
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{int64(0), int64(1), int64(2)},
		}, out)
	})

	t.Run("infinite", func(t *testing.T) {
		// start-> loop_node_key[innerNode->break] -> end
		innerNode := &NodeSchema{
			Key:  "innerNode",
			Type: nodes.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				index := in["index"].(int64)
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
		}

		breakNode := &NodeSchema{
			Key:  "breakNode",
			Type: nodes.NodeTypeBreak,
		}

		entry := &NodeSchema{
			Key:  EntryNodeKey,
			Type: nodes.NodeTypeEntry,
		}

		loopNode := &NodeSchema{
			Key:  "loop_node_key",
			Type: nodes.NodeTypeLoop,
			Configs: map[string]any{
				"LoopType": loop.Infinite,
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

		exit := &NodeSchema{
			Key:  ExitNodeKey,
			Type: nodes.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ws := &WorkflowSchema{
			Nodes: []*NodeSchema{
				entry,
				loopNode,
				exit,
				innerNode,
				breakNode,
			},
			Hierarchy: map[nodes.NodeKey]nodes.NodeKey{
				"innerNode": "loop_node_key",
				"breakNode": "loop_node_key",
			},
			Connections: []*Connection{
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
					FromNode: entry.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{int64(0)},
		}, out)
	})

	t.Run("by array", func(t *testing.T) {
		// start-> loop_node_key[innerNode->variable_assign] -> end

		innerNode := &NodeSchema{
			Key:  "innerNode",
			Type: nodes.NodeTypeLambda,
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
							VariableType: ptr.Of(variable.ParentIntermediate),
						},
					},
				},
			},
		}

		assigner := &NodeSchema{
			Key:  "assigner",
			Type: nodes.NodeTypeVariableAssigner,
			Configs: []*variableassigner.Pair{
				{
					Left: nodes.Reference{
						FromPath:     compose.FieldPath{"count"},
						VariableType: ptr.Of(variable.ParentIntermediate),
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
		}

		entry := &NodeSchema{
			Key:  EntryNodeKey,
			Type: nodes.NodeTypeEntry,
		}

		exit := &NodeSchema{
			Key:  ExitNodeKey,
			Type: nodes.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		loopNode := &NodeSchema{
			Key:  "loop_node_key",
			Type: nodes.NodeTypeLoop,
			Configs: map[string]any{
				"LoopType": loop.ByArray,
				"IntermediateVars": map[string]*nodes.TypeInfo{
					"count": {
						Type: nodes.DataTypeInteger,
					},
				},
			},
			InputTypes: map[string]*nodes.TypeInfo{
				"items1": {
					Type:         nodes.DataTypeArray,
					ElemTypeInfo: &nodes.TypeInfo{Type: nodes.DataTypeString},
				},
				"items2": {
					Type:         nodes.DataTypeArray,
					ElemTypeInfo: &nodes.TypeInfo{Type: nodes.DataTypeString},
				},
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"items1"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"items1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"items2"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
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

		ws := &WorkflowSchema{
			Nodes: []*NodeSchema{
				entry,
				loopNode,
				exit,
				innerNode,
				assigner,
			},
			Hierarchy: map[nodes.NodeKey]nodes.NodeKey{
				"innerNode": "loop_node_key",
				"assigner":  "loop_node_key",
			},
			Connections: []*Connection{
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
					FromNode: entry.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"items1": []any{"a", "b"},
			"items2": []any{"a1", "b1", "c1"},
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": 6,
		}, out)
	})
}
