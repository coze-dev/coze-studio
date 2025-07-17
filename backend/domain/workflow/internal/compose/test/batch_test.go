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
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	compose2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/batch"
)

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

	lambdaNode1 := &compose2.NodeSchema{
		Key:    "lambda",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda1),
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
	lambdaNode2 := &compose2.NodeSchema{
		Key:    "index",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda2),
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

	lambdaNode3 := &compose2.NodeSchema{
		Key:    "consumer",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda3),
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

	entry := &compose2.NodeSchema{
		Key:  entity.EntryNodeKey,
		Type: entity.NodeTypeEntry,
		Configs: map[string]any{
			"DefaultValues": map[string]any{},
		},
	}

	ns := &compose2.NodeSchema{
		Key:  "batch_node_key",
		Type: entity.NodeTypeBatch,
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"array_1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"array_1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"array_2"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
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

	exit := &compose2.NodeSchema{
		Key:  entity.ExitNodeKey,
		Type: entity.NodeTypeExit,
		Configs: map[string]any{
			"TerminalPlan": vo.ReturnVariables,
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

	parentLambdaNode := &compose2.NodeSchema{
		Key:    "parent_predecessor_1",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(parentLambda),
	}

	ws := &compose2.WorkflowSchema{
		Nodes: []*compose2.NodeSchema{
			entry,
			parentLambdaNode,
			ns,
			exit,
			lambdaNode1,
			lambdaNode2,
			lambdaNode3,
		},
		Hierarchy: map[vo.NodeKey]vo.NodeKey{
			"lambda":   "batch_node_key",
			"index":    "batch_node_key",
			"consumer": "batch_node_key",
		},
		Connections: []*compose2.Connection{
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
