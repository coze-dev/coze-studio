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
	"fmt"
	"sync/atomic"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	compose2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/entry"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop"
	_break "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop/break"
	_continue "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop/continue"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/subworkflow"
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
			}, compose.WithLambdaType(string(entity.NodeTypeLambda))),
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
			}, compose.WithLambdaType(string(entity.NodeTypeLambda))),
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
			}, compose.WithLambdaType(string(entity.NodeTypeLambda))),
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

type dummyNodeWOptLoop struct {
	callCount *int
}

func (d *dummyNodeWOptLoop) Invoke(ctx context.Context, in map[string]any, opts ...nodes.NodeOption) (out map[string]any, err error) {
	*d.callCount++
	index := in["index"].(int64)
	if in["resume_data"] == nil {
		return nil, compose.NewInterruptAndRerunErr(fmt.Errorf("interrupt at %d", index))
	}

	out = make(map[string]any)
	out["output_1"] = fmt.Sprintf("resumed_%d_%s", index, in["resume_data"])
	return out, nil
}

type dummyConfigLoop struct {
	callCount *int
}

func (c *dummyConfigLoop) Build(ctx context.Context, ns *schema.NodeSchema, opts ...schema.BuildOption) (any, error) {
	return &dummyNodeWOptLoop{callCount: c.callCount}, nil
}

func (c *dummyConfigLoop) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	return nil, nil
}

func (c *dummyConfigLoop) RequireCheckpoint() bool { return true }

func TestLoop_Interrupt(t *testing.T) {
	ctx := context.Background()

	var callCount int

	lambdaNode1 := &schema.NodeSchema{
		Key:     "lambda",
		Type:    entity.NodeTypePlugin, // use a node type that uses Configs.Build
		Configs: &dummyConfigLoop{callCount: &callCount},
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
			{
				Path: compose.FieldPath{"resume_data"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entity.EntryNodeKey,
						FromPath:    compose.FieldPath{"resume_data"},
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

	ns := &schema.NodeSchema{
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
			{
				Path: compose.FieldPath{"resume_data"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"resume_data"},
					},
				},
			},
		},
		OutputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"assembled_output_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "lambda",
						FromPath:    compose.FieldPath{"output_1"},
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

	exitN := &schema.NodeSchema{
		Key:  entity.ExitNodeKey,
		Type: entity.NodeTypeExit,
		Configs: &exit.Config{
			TerminatePlan: vo.ReturnVariables,
		},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"assembled_output_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "loop_node_key",
						FromPath:    compose.FieldPath{"assembled_output_1"},
					},
				},
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entryN,
			ns,
			exitN,
			lambdaNode1,
			continueNode,
		},
		Hierarchy: map[vo.NodeKey]vo.NodeKey{
			"lambda":       "loop_node_key",
			"continueNode": "loop_node_key",
		},
		Connections: []*schema.Connection{
			{
				FromNode: entity.EntryNodeKey,
				ToNode:   "loop_node_key",
			},
			{
				FromNode: "loop_node_key",
				ToNode:   "lambda",
			},
			{
				FromNode: "lambda",
				ToNode:   "continueNode",
			},
			{
				FromNode: "continueNode",
				ToNode:   "loop_node_key",
			},
			{
				FromNode: "loop_node_key",
				ToNode:   entity.ExitNodeKey,
			},
		},
	}

	ws.Init()

	wf, err := compose2.NewWorkflow(ctx, ws)
	assert.NoError(t, err)

	// Initial run
	_, err = wf.Runner.Invoke(ctx, map[string]any{
		"count":       int64(2),
		"resume_data": nil,
	})

	assert.Error(t, err)
	info, existed := compose.ExtractInterruptInfo(err)
	assert.True(t, existed)
	assert.NotNil(t, info)
	assert.Equal(t, 1, callCount) // Loop runs sequentially, so it interrupts at index 0 first.

	// Resume index 0
	stateModifier0 := func(ctx context.Context, path compose.NodePath, state any) error {
		return nil
	}

	innerOpt := compose.WithLambdaOption(
		nodes.WithResumeIndex(0, stateModifier0),
	).DesignateNode("lambda")

	stateOpt := compose2.WrapOptWithIndex(innerOpt, "loop_node_key", 0)

	// Mock the state retrieval in Loop node to simulate existing interruption at index 0
	mockPatch := mockey.Mock((*compose2.State).GetNestedWorkflowState).To(func(s *compose2.State, key vo.NodeKey) (*nodes.NestedWorkflowState, bool, error) {
		if key == "loop_node_key" {
			return &nodes.NestedWorkflowState{
				Index2Done: make(map[int]bool),
				Index2InterruptInfo: map[int]*compose.InterruptInfo{
					0: {}, // Index 0 was interrupted
				},
				FullOutput: map[string]any{
					"assembled_output_1": []any{},
				},
				IntermediateVars: make(map[string]any),
			}, true, nil
		}
		return nil, false, nil
	}).Build()
	defer mockPatch.UnPatch()

	// Resume with modified input for index 0
	_, err = wf.Runner.Invoke(ctx, map[string]any{
		"count":       int64(2),
		"resume_data": "data_for_0",
	}, stateOpt)

	// Index 0 resumes and succeeds. Index 1 runs fresh and also succeeds (resume_data is non-nil).
	assert.NoError(t, err)

	// callCount should be 3:
	// 1 from initial run (index 0 interrupted)
	// 1 from resuming index 0
	// 1 from running index 1 fresh
	assert.Equal(t, 3, callCount)
}

func TestLoop_SubWorkflow_Nested_Interrupt(t *testing.T) {
	ctx := context.Background()

	var callCount atomic.Int64

	lambdaNode := &schema.NodeSchema{
		Key:     "lambda",
		Type:    entity.NodeTypeLambda,
		Configs: &interruptibleConfig{},
		Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (map[string]any, error) {
			n := callCount.Add(1)
			t.Logf("lambda invoked (call #%d)", n)

			if n == 1 {
				interruptEvent := &entity.InterruptEvent{
					ID:            n,
					NodeKey:       "lambda",
					EventType:     entity.InterruptEventInput,
					InterruptData: "{}",
				}
				return nil, compose.NewInterruptAndRerunErr(interruptEvent)
			}
			return map[string]any{"output": "done"}, nil
		}, compose.WithLambdaType(string(entity.NodeTypeLambda))),
	}

	innerSubWfSchema := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			{Key: entity.EntryNodeKey, Type: entity.NodeTypeEntry, Configs: &entry.Config{}},
			lambdaNode,
			{Key: entity.ExitNodeKey, Type: entity.NodeTypeExit, Configs: &exit.Config{TerminatePlan: vo.ReturnVariables},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{FromNodeKey: "lambda", FromPath: compose.FieldPath{"output"}},
						},
					},
				},
			},
		},
		Connections: []*schema.Connection{
			{FromNode: entity.EntryNodeKey, ToNode: "lambda"},
			{FromNode: "lambda", ToNode: entity.ExitNodeKey},
		},
	}
	innerSubWfSchema.Init()

	innerSubWfNode := &schema.NodeSchema{
		Key:               "inner_sub_wf",
		Type:              entity.NodeTypeSubWorkflow,
		Configs:           &subworkflow.Config{WorkflowID: 200},
		SubWorkflowSchema: innerSubWfSchema,
		SubWorkflowBasic:  &entity.WorkflowBasic{ID: 200, Version: "1"},
		OutputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{FromNodeKey: entity.ExitNodeKey, FromPath: compose.FieldPath{"output"}},
				},
			},
		},
	}

	outerSubWfSchema := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			{Key: entity.EntryNodeKey, Type: entity.NodeTypeEntry, Configs: &entry.Config{}},
			innerSubWfNode,
			{Key: entity.ExitNodeKey, Type: entity.NodeTypeExit, Configs: &exit.Config{TerminatePlan: vo.ReturnVariables},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{FromNodeKey: "inner_sub_wf", FromPath: compose.FieldPath{"output"}},
						},
					},
				},
			},
		},
		Connections: []*schema.Connection{
			{FromNode: entity.EntryNodeKey, ToNode: "inner_sub_wf"},
			{FromNode: "inner_sub_wf", ToNode: entity.ExitNodeKey},
		},
	}
	outerSubWfSchema.Init()

	outerSubWfNode := &schema.NodeSchema{
		Key:               "outer_sub_wf",
		Type:              entity.NodeTypeSubWorkflow,
		Configs:           &subworkflow.Config{WorkflowID: 100},
		SubWorkflowSchema: outerSubWfSchema,
		SubWorkflowBasic:  &entity.WorkflowBasic{ID: 100, Version: "1"},
		OutputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"output"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{FromNodeKey: entity.ExitNodeKey, FromPath: compose.FieldPath{"output"}},
				},
			},
		},
	}

	continueNode := &schema.NodeSchema{
		Key:     "continueNode",
		Type:    entity.NodeTypeContinue,
		Configs: &_continue.Config{},
	}

	loopNode := &schema.NodeSchema{
		Key:  "loop_node",
		Type: entity.NodeTypeLoop,
		Configs: &loop.Config{
			LoopType: loop.ByIteration,
		},
		InputSources: []*vo.FieldInfo{
			{
				Path:   compose.FieldPath{loop.Count},
				Source: vo.FieldSource{Ref: &vo.Reference{FromNodeKey: entity.EntryNodeKey, FromPath: compose.FieldPath{"count"}}},
			},
		},
		OutputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"loop_output"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{FromNodeKey: "outer_sub_wf", FromPath: compose.FieldPath{"output"}},
				},
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			{Key: entity.EntryNodeKey, Type: entity.NodeTypeEntry, Configs: &entry.Config{}},
			loopNode,
			outerSubWfNode,
			continueNode,
			{Key: entity.ExitNodeKey, Type: entity.NodeTypeExit, Configs: &exit.Config{TerminatePlan: vo.ReturnVariables},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"loop_output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{FromNodeKey: "loop_node", FromPath: compose.FieldPath{"loop_output"}},
						},
					},
				},
			},
		},
		Hierarchy: map[vo.NodeKey]vo.NodeKey{
			"outer_sub_wf": "loop_node",
			"continueNode": "loop_node",
		},
		Connections: []*schema.Connection{
			{FromNode: entity.EntryNodeKey, ToNode: "loop_node"},
			{FromNode: "loop_node", ToNode: "outer_sub_wf"},
			{FromNode: "outer_sub_wf", ToNode: "continueNode"},
			{FromNode: "continueNode", ToNode: "loop_node"},
			{FromNode: "loop_node", ToNode: entity.ExitNodeKey},
		},
	}
	ws.Init()

	basic := &entity.WorkflowBasic{ID: 1, Version: "1"}

	myRepo := &mockRepo{}
	mockPatch := mockey.Mock(workflow.GetRepository).To(func() workflow.Repository {
		return myRepo
	}).Build()
	defer mockPatch.UnPatch()

	initialRunner := compose2.NewWorkflowRunner(basic, ws, model.ExecuteConfig{})
	initialCtx, executeID, opts, _, err := initialRunner.Prepare(ctx)
	assert.NoError(t, err)

	wf, err := compose2.NewWorkflow(initialCtx, ws, compose2.WithIDAsName(basic.ID))
	assert.NoError(t, err)

	_, err = wf.Runner.Invoke(initialCtx, map[string]any{
		"count": int64(1),
	}, opts...)

	assert.Error(t, err)
	info, existed := compose.ExtractInterruptInfo(err)
	assert.True(t, existed)
	assert.NotNil(t, info)
	assert.Equal(t, int64(1), callCount.Load(),
		"Lambda should have been called exactly once (loop has 1 item, interrupted on first call)")

	repo := workflow.GetRepository()
	event0, found, _ := repo.GetFirstInterruptEvent(ctx, executeID)
	assert.True(t, found)
	assert.NotNil(t, event0)
	if event0 == nil {
		t.Fatal("interrupt event is nil, cannot proceed with resume")
	}

	t.Logf("Interrupt event NodePath: %v", event0.NodePath)

	resumeRunner := compose2.NewWorkflowRunner(basic, ws, model.ExecuteConfig{},
		compose2.WithResumeReq(&entity.ResumeRequest{
			ExecuteID:  executeID,
			EventID:    event0.ID,
			ResumeData: "resumed",
		}))

	resumeCtx, _, resumeOpts, _, err := resumeRunner.Prepare(ctx)
	assert.NoError(t, err)

	var wrongPrepareSubExeCtxCalled atomic.Bool
	var prepareSubExePatch *mockey.Mocker
	prepareSubExePatch = mockey.Mock(execute.PrepareSubExeCtx).To(
		func(ctx context.Context, wb *entity.WorkflowBasic, requireCheckpoint bool) (context.Context, error) {
			if wb != nil && wb.ID == 200 {
				wrongPrepareSubExeCtxCalled.Store(true)
				t.Logf("BUG: PrepareSubExeCtx called for inner_sub_wf (ID=200) during resume — this generates a new sub-execute-ID")
			}
			prepareSubExePatch.UnPatch()
			defer prepareSubExePatch.Patch()
			return execute.PrepareSubExeCtx(ctx, wb, requireCheckpoint)
		}).Build()
	defer prepareSubExePatch.UnPatch()

	_, err = wf.Runner.Invoke(resumeCtx, map[string]any{
		"count": int64(1),
	}, resumeOpts...)

	assert.NoError(t, err)

	assert.Equal(t, int64(2), callCount.Load(),
		"Lambda should have been called exactly twice: once for initial interrupt, once for resume")

	assert.False(t, wrongPrepareSubExeCtxCalled.Load(),
		"PrepareSubExeCtx should NOT be called for inner_sub_wf (ID=200) during resume — it should use restoreWorkflowCtx instead")
}
