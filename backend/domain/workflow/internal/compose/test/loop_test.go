/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package test

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	compose2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/entry"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop"
	_break "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop/break"
	_continue "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop/continue"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/variableassigner"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestLoop(t *testing.T) {
	t.Run("by iteration", func(t *testing.T) {
		// start-> loop_node_key[innerNode->continue] -> end
		innerNode := &schema.NodeSchema{
			Key:  "innerNode",
			Type: entity.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				index := in["index"].(int64)
				return map[string]any{"output": index}, nil
			}),
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"index"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"index"},
						},
					},
				},
			},
		}

		continueNode := &schema.NodeSchema{
			Key:     "continueNode",
			Type:    entity.NodeTypeContinue,
			Configs: &_continue.Config{},
		}

		entryN := &schema.NodeSchema{
			Key:     entity.EntryNodeKey,
			Type:    entity.NodeTypeEntry,
			Configs: &entry.Config{},
		}

		loopNode := &schema.NodeSchema{
			Key:  "loop_node_key",
			Type: entity.NodeTypeLoop,
			Configs: &loop.Config{
				LoopType: loop.ByIteration,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{loop.Count},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"count"},
						},
					},
				},
			},
			OutputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		exitN := &schema.NodeSchema{
			Key:  entity.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: &exit.Config{
				TerminatePlan: vo.ReturnVariables,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entryN,
				loopNode,
				exitN,
				innerNode,
				continueNode,
			},
			Hierarchy: map[vo.NodeKey]vo.NodeKey{
				"innerNode":    "loop_node_key",
				"continueNode": "loop_node_key",
			},
			Connections: []*schema.Connection{
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
					FromNode: entryN.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exitN.Key,
				},
			},
		}

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"count": int64(3),
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{int64(0), int64(1), int64(2)},
		}, out)
	})

	t.Run("infinite", func(t *testing.T) {
		// start-> loop_node_key[innerNode->break] -> end
		innerNode := &schema.NodeSchema{
			Key:  "innerNode",
			Type: entity.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				index := in["index"].(int64)
				return map[string]any{"output": index}, nil
			}),
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"index"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"index"},
						},
					},
				},
			},
		}

		breakNode := &schema.NodeSchema{
			Key:     "breakNode",
			Type:    entity.NodeTypeBreak,
			Configs: &_break.Config{},
		}

		entryN := &schema.NodeSchema{
			Key:     entity.EntryNodeKey,
			Type:    entity.NodeTypeEntry,
			Configs: &entry.Config{},
		}

		loopNode := &schema.NodeSchema{
			Key:  "loop_node_key",
			Type: entity.NodeTypeLoop,
			Configs: &loop.Config{
				LoopType: loop.Infinite,
			},
			OutputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		exitN := &schema.NodeSchema{
			Key:  entity.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: &exit.Config{
				TerminatePlan: vo.ReturnVariables,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entryN,
				loopNode,
				exitN,
				innerNode,
				breakNode,
			},
			Hierarchy: map[vo.NodeKey]vo.NodeKey{
				"innerNode": "loop_node_key",
				"breakNode": "loop_node_key",
			},
			Connections: []*schema.Connection{
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
					FromNode: entryN.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exitN.Key,
				},
			},
		}

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{int64(0)},
		}, out)
	})

	t.Run("by array", func(t *testing.T) {
		// start-> loop_node_key[innerNode->variable_assign] -> end

		innerNode := &schema.NodeSchema{
			Key:  "innerNode",
			Type: entity.NodeTypeLambda,
			Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
				item1 := in["item1"].(string)
				item2 := in["item2"].(string)
				count := in["count"].(int)
				return map[string]any{"total": count + len(item1) + len(item2)}, nil
			}),
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"item1"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"items1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"item2"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"items2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"count"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromPath:     compose.FieldPath{"count"},
							VariableType: ptr.Of(vo.ParentIntermediate),
						},
					},
				},
			},
		}

		assigner := &schema.NodeSchema{
			Key:  "assigner",
			Type: entity.NodeTypeVariableAssignerWithinLoop,
			Configs: &variableassigner.InLoopConfig{
				Pairs: []*variableassigner.Pair{
					{
						Left: vo.Reference{
							FromPath:     compose.FieldPath{"count"},
							VariableType: ptr.Of(vo.ParentIntermediate),
						},
						Right: compose.FieldPath{"total"},
					},
				},
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"total"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "innerNode",
							FromPath:    compose.FieldPath{"total"},
						},
					},
				},
			},
		}

		entryN := &schema.NodeSchema{
			Key:     entity.EntryNodeKey,
			Type:    entity.NodeTypeEntry,
			Configs: &entry.Config{},
		}

		exitN := &schema.NodeSchema{
			Key:  entity.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: &exit.Config{
				TerminatePlan: vo.ReturnVariables,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "loop_node_key",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		loopNode := &schema.NodeSchema{
			Key:  "loop_node_key",
			Type: entity.NodeTypeLoop,
			Configs: &loop.Config{
				LoopType:    loop.ByArray,
				InputArrays: []string{"items1", "items2"},
				IntermediateVars: map[string]*vo.TypeInfo{
					"count": {
						Type: vo.DataTypeInteger,
					},
				},
			},
			InputTypes: map[string]*vo.TypeInfo{
				"items1": {
					Type:         vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString},
				},
				"items2": {
					Type:         vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString},
				},
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"items1"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"items1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"items2"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"items2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"count"},
					Source: vo.FieldSource{
						Val: 0,
					},
				},
			},
			OutputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromPath:     compose.FieldPath{"count"},
							VariableType: ptr.Of(vo.ParentIntermediate),
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entryN,
				loopNode,
				exitN,
				innerNode,
				assigner,
			},
			Hierarchy: map[vo.NodeKey]vo.NodeKey{
				"innerNode": "loop_node_key",
				"assigner":  "loop_node_key",
			},
			Connections: []*schema.Connection{
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
					FromNode: entryN.Key,
					ToNode:   "loop_node_key",
				},
				{
					FromNode: "loop_node_key",
					ToNode:   exitN.Key,
				},
			},
		}

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
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
