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
	"sync"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	compose2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/batch"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/entry"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/subworkflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type interruptibleConfig struct{}

func (c *interruptibleConfig) RequireCheckpoint() bool { return true }

func TestBatch(t *testing.T) {
	ctx := context.Background()

	lambda1 := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		if in["index"].(int64) > 2 {
			return nil, fmt.Errorf("index= %d is too large", in["index"].(int64))
		}

		out = make(map[string]any)
		out["output_1"] = fmt.Sprintf("%s_%v_%d", in["array_1"].(string), in["from_parent_wf"].(bool), in["index"].(int64))
		return out, nil
	}

	lambda2 := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		return map[string]any{"index": in["index"]}, nil
	}

	lambda3 := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		t.Log(in["consumer_1"].(string), in["array_2"].(int64), in["static_source"].(string))
		return in, nil
	}

	lambdaNode1 := &schema.NodeSchema{
		Key:    "lambda",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda1, compose.WithLambdaType(string(entity.NodeTypeLambda))),
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"index"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"index"},
					},
				},
			},
			{
				Path: compose.FieldPath{"array_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"array_1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"from_parent_wf"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "parent_predecessor_1",
						FromPath:    compose.FieldPath{"success"},
					},
				},
			},
		},
	}
	lambdaNode2 := &schema.NodeSchema{
		Key:    "index",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda2, compose.WithLambdaType(string(entity.NodeTypeLambda))),
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"index"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"index"},
					},
				},
			},
		},
	}

	lambdaNode3 := &schema.NodeSchema{
		Key:    "consumer",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda3, compose.WithLambdaType(string(entity.NodeTypeLambda))),
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"consumer_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "lambda",
						FromPath:    compose.FieldPath{"output_1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"array_2"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"array_2"},
					},
				},
			},
			{
				Path: compose.FieldPath{"static_source"},
				Source: vo.FieldSource{
					Val: "this is a const",
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
		Key:     "batch_node_key",
		Type:    entity.NodeTypeBatch,
		Configs: &batch.Config{},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"array_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"array_1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"array_2"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"array_2"},
					},
				},
			},
			{
				Path: compose.FieldPath{batch.ConcurrentSizeKey},
				Source: vo.FieldSource{
					Val: int64(2),
				},
			},
			{
				Path: compose.FieldPath{batch.MaxBatchSizeKey},
				Source: vo.FieldSource{
					Val: int64(5),
				},
			},
		},
		InputTypes: map[string]*vo.TypeInfo{
			"array_1": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeString,
				},
			},
			"array_2": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeInteger,
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
			{
				Path: compose.FieldPath{"assembled_output_2"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "index",
						FromPath:    compose.FieldPath{"index"},
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
				Path: compose.FieldPath{"assembled_output_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"assembled_output_1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"assembled_output_2"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "batch_node_key",
						FromPath:    compose.FieldPath{"assembled_output_2"},
					},
				},
			},
		},
	}

	parentLambda := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
		return map[string]any{"success": true}, nil
	}

	parentLambdaNode := &schema.NodeSchema{
		Key:    "parent_predecessor_1",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(parentLambda, compose.WithLambdaType(string(entity.NodeTypeLambda))),
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entryN,
			parentLambdaNode,
			ns,
			exitN,
			lambdaNode1,
			lambdaNode2,
			lambdaNode3,
		},
		Hierarchy: map[vo.NodeKey]vo.NodeKey{
			"lambda":   "batch_node_key",
			"index":    "batch_node_key",
			"consumer": "batch_node_key",
		},
		Connections: []*schema.Connection{
			{
				FromNode: entity.EntryNodeKey,
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
				ToNode:   entity.ExitNodeKey,
			},
		},
	}

	ws.Init()

	wf, err := compose2.NewWorkflow(ctx, ws)
	assert.NoError(t, err)

	out, err := wf.Runner.Invoke(ctx, map[string]any{
		"array_1": []any{"a", "b", "c"},
		"array_2": []any{int64(1), int64(2), int64(3), int64(4)},
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"assembled_output_1": []any{"a_true_0", "b_true_1", "c_true_2"},
		"assembled_output_2": []any{int64(0), int64(1), int64(2)},
	}, out)

	// input array is empty
	out, err = wf.Runner.Invoke(ctx, map[string]any{
		"array_1": []any{},
		"array_2": []any{int64(1)},
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"assembled_output_1": []any{},
		"assembled_output_2": []any{},
	}, out)

	// less than concurrency
	out, err = wf.Runner.Invoke(ctx, map[string]any{
		"array_1": []any{"a"},
		"array_2": []any{int64(1), int64(2)},
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"assembled_output_1": []any{"a_true_0"},
		"assembled_output_2": []any{int64(0)},
	}, out)

	// err by inner node
	_, err = wf.Runner.Invoke(ctx, map[string]any{
		"array_1": []any{"a", "b", "c", "d", "e", "f"},
		"array_2": []any{int64(1), int64(2), int64(3), int64(4), int64(5), int64(6), int64(7)},
	})
	assert.ErrorContains(t, err, "is too large")
}

type mockRepo struct {
	workflow.Repository
	mu     sync.Mutex
	events []*entity.InterruptEvent
	cp     map[string][]byte
}

func (m *mockRepo) GenID(ctx context.Context) (int64, error) {
	return 10001, nil
}

func (m *mockRepo) ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.events, nil
}

func (m *mockRepo) SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.events = append(m.events, events...)
	return nil
}

func (m *mockRepo) CreateWorkflowExecution(ctx context.Context, exe *entity.WorkflowExecution) error {
	return nil
}

func (m *mockRepo) UpdateWorkflowExecution(ctx context.Context, exe *entity.WorkflowExecution, statuses []entity.WorkflowExecuteStatus) (int64, entity.WorkflowExecuteStatus, error) {
	return 1, 0, nil
}

func (m *mockRepo) TryLockWorkflowExecution(ctx context.Context, executeID int64, eventID int64) (bool, entity.WorkflowExecuteStatus, error) {
	return true, 0, nil
}

func (m *mockRepo) CreateNodeExecution(ctx context.Context, exe *entity.NodeExecution) error {
	return nil
}

func (m *mockRepo) UpdateNodeExecution(ctx context.Context, exe *entity.NodeExecution) error {
	return nil
}

func (m *mockRepo) GetFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.events) > 0 {
		return m.events[0], true, nil
	}
	return nil, false, nil
}

func (m *mockRepo) PopFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.events) > 0 {
		e := m.events[0]
		m.events = m.events[1:]
		return e, true, nil
	}
	return nil, false, nil
}

func (m *mockRepo) UpdateFirstInterruptEvent(ctx context.Context, wfExeID int64, event *entity.InterruptEvent) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.events) > 0 {
		m.events[0] = event
	}
	return nil
}

func (m *mockRepo) GetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (bool, error) {
	return false, nil
}

func (m *mockRepo) Get(ctx context.Context, executeID string) ([]byte, bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.cp == nil {
		return nil, false, nil
	}
	cp, ok := m.cp[executeID]
	return cp, ok, nil
}

func (m *mockRepo) Set(ctx context.Context, executeID string, cp []byte) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.cp == nil {
		m.cp = make(map[string][]byte)
	}
	m.cp[executeID] = cp
	return nil
}

func TestBatch_Nested_Interrupt(t *testing.T) {
	ctx := context.Background()

	var callCount int
	var mu sync.Mutex

	// The innermost node that will interrupt inside the SubWorkflow
	lambdaNode := &schema.NodeSchema{
		Key:     "lambda",
		Type:    entity.NodeTypeLambda,
		Configs: &interruptibleConfig{},
		Lambda: compose.InvokableLambda(func(ctx context.Context, in map[string]any) (map[string]any, error) {
			mu.Lock()
			callCount++
			currentCount := callCount
			mu.Unlock()

			if in["resume_data"] == "a" || in["resume_data"] == "b" {
				interruptEvent := &entity.InterruptEvent{
					ID:            int64(currentCount),
					NodeKey:       "lambda",
					EventType:     entity.InterruptEventInput,
					InterruptData: "{}",
				}
				return nil, compose.NewInterruptAndRerunErr(interruptEvent)
			}
			return map[string]any{"output": "ok"}, nil
		}, compose.WithLambdaType(string(entity.NodeTypeLambda))),
		InputSources: []*vo.FieldInfo{
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

	subWfSchema := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			{Key: entity.EntryNodeKey, Type: entity.NodeTypeEntry, Configs: &entry.Config{}},
			lambdaNode,
			{Key: entity.ExitNodeKey, Type: entity.NodeTypeExit, Configs: &exit.Config{TerminatePlan: vo.ReturnVariables},
				InputSources: []*vo.FieldInfo{
					{
						Path: compose.FieldPath{"output"},
						Source: vo.FieldSource{
							Ref: &vo.Reference{
								FromNodeKey: "lambda",
								FromPath:    compose.FieldPath{"output"},
							},
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
	subWfSchema.Init()

	subWfNode := &schema.NodeSchema{
		Key:               "sub_workflow",
		Type:              entity.NodeTypeSubWorkflow,
		Configs:           &subworkflow.Config{WorkflowID: 100},
		SubWorkflowSchema: subWfSchema,
		SubWorkflowBasic:  &entity.WorkflowBasic{ID: 100, Version: "1"},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"resume_data"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "outer_batch",
						FromPath:    compose.FieldPath{"outer_array"},
					},
				},
			},
		},
		OutputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"inner_output"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entity.ExitNodeKey, // SubWorkflow's exit node
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		},
	}

	outerBatch := &schema.NodeSchema{
		Key:     "outer_batch",
		Type:    entity.NodeTypeBatch,
		Configs: &batch.Config{},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"outer_array"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entity.EntryNodeKey,
						FromPath:    compose.FieldPath{"outer_array"},
					},
				},
			},
			{
				Path:   compose.FieldPath{batch.ConcurrentSizeKey},
				Source: vo.FieldSource{Val: int64(2)},
			},
			{
				Path:   compose.FieldPath{batch.MaxBatchSizeKey},
				Source: vo.FieldSource{Val: int64(2)},
			},
		},
		InputTypes: map[string]*vo.TypeInfo{
			"outer_array": {
				Type:         vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeString},
			},
		},
		OutputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"final_output"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "sub_workflow",
						FromPath:    compose.FieldPath{"output"},
					},
				},
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			{Key: entity.EntryNodeKey, Type: entity.NodeTypeEntry, Configs: &entry.Config{}},
			outerBatch,
			subWfNode,
			{Key: entity.ExitNodeKey, Type: entity.NodeTypeExit, Configs: &exit.Config{TerminatePlan: vo.ReturnVariables}},
		},
		Hierarchy: map[vo.NodeKey]vo.NodeKey{
			"sub_workflow": "outer_batch",
		},
		Connections: []*schema.Connection{
			{FromNode: entity.EntryNodeKey, ToNode: "outer_batch"},
			{FromNode: "outer_batch", ToNode: "sub_workflow"},
			{FromNode: "sub_workflow", ToNode: "outer_batch"},
			{FromNode: "outer_batch", ToNode: entity.ExitNodeKey},
		},
	}

	ws.Init()
	basic := &entity.WorkflowBasic{ID: 1, Version: "1"}

	// MOCK Repository globally
	myRepo := &mockRepo{}
	mockPatch := mockey.Mock(workflow.GetRepository).To(func() workflow.Repository {
		return myRepo
	}).Build()
	defer mockPatch.UnPatch()

	// 1. Initial run: 2 items in outer array, both should interrupt
	initialRunner := compose2.NewWorkflowRunner(basic, ws, model.ExecuteConfig{})
	initialCtx, executeID, opts, _, err := initialRunner.Prepare(ctx)
	assert.NoError(t, err)

	wf, err := compose2.NewWorkflow(initialCtx, ws, compose2.WithIDAsName(basic.ID))
	assert.NoError(t, err)

	_, err = wf.Runner.Invoke(initialCtx, map[string]any{
		"outer_array": []any{"a", "b"},
		"resume_data": nil,
	}, opts...)

	t.Logf("Initial run error: %v", err)
	assert.Error(t, err)
	if callCount != 2 {
		t.Fatalf("Expected callCount 2, got %d. Error was: %v", callCount, err)
	}

	// 2. Resume the first event returned by GetFirstInterruptEvent
	repo := workflow.GetRepository()
	event0, _, _ := repo.GetFirstInterruptEvent(ctx, executeID)
	assert.NotNil(t, event0, "Event 0 should not be nil")
	if event0 == nil {
		t.Fatal("Event0 is nil, cannot proceed")
	}

	// Create a new runner for resumption
	resumeRunner := compose2.NewWorkflowRunner(basic, ws, model.ExecuteConfig{},
		compose2.WithResumeReq(&entity.ResumeRequest{
			ExecuteID:  executeID,
			EventID:    event0.ID,
			ResumeData: "resumed",
		}))

	resumeCtx, _, resumeOpts, _, err := resumeRunner.Prepare(ctx)
	assert.NoError(t, err)

	// Invoke resumption
	_, err = wf.Runner.Invoke(resumeCtx, map[string]any{
		"outer_array": []any{nil, nil},
		"resume_data": "resumed",
	}, resumeOpts...)

	assert.Error(t, err) // Should still be interrupted at index 1

	// CRITICAL ASSERTION:
	// If the fix works, callCount should be 3 (2 from initial + 1 from resumed index 0).
	// If index 1 was NOT skipped (the bug), callCount would be 4.
	assert.Equal(t, 3, callCount, "Index 1 of the outer batch should have been skipped")
}
