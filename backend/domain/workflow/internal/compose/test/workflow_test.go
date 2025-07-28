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
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/selector"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/textprocessor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/variableaggregator"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestAddSelector(t *testing.T) {
	// start -> selector, selector.condition1 -> lambda1 -> end, selector.condition2 -> [lambda2, lambda3] -> end, selector default -> end
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
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "lambda1",
						FromPath:    compose.FieldPath{"lambda1"},
					},
				},
				Path: compose.FieldPath{"lambda1"},
			},
			{
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "lambda2",
						FromPath:    compose.FieldPath{"lambda2"},
					},
				},
				Path: compose.FieldPath{"lambda2"},
			},
			{
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "lambda3",
						FromPath:    compose.FieldPath{"lambda3"},
					},
				},
				Path: compose.FieldPath{"lambda3"},
			},
		},
	}

	lambda1 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda1": "v1",
		}, nil
	}

	lambdaNode1 := &schema.NodeSchema{
		Key:    "lambda1",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda1),
	}

	lambda2 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda2": "v2",
		}, nil
	}

	LambdaNode2 := &schema.NodeSchema{
		Key:    "lambda2",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda2),
	}

	lambda3 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda3": "v3",
		}, nil
	}

	lambdaNode3 := &schema.NodeSchema{
		Key:    "lambda3",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda3),
	}

	ns := &schema.NodeSchema{
		Key:  "selector",
		Type: entity.NodeTypeSelector,
		Configs: &selector.Config{Clauses: []*selector.OneClauseSchema{
			{
				Single: ptr.Of(selector.OperatorEqual),
			},
			{
				Multi: &selector.MultiClauseSchema{
					Clauses: []*selector.Operator{
						ptr.Of(selector.OperatorGreater),
						ptr.Of(selector.OperatorIsTrue),
					},
					Relation: selector.ClauseRelationAND,
				},
			},
		}},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"0", selector.LeftKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"key1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"0", selector.RightKey},
				Source: vo.FieldSource{
					Val: "value1",
				},
			},
			{
				Path: compose.FieldPath{"1", "0", selector.LeftKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"key2"},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "0", selector.RightKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"key3"},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "1", selector.LeftKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"key4"},
					},
				},
			},
		},
		InputTypes: map[string]*vo.TypeInfo{
			"0": {
				Type: vo.DataTypeObject,
				Properties: map[string]*vo.TypeInfo{
					selector.LeftKey: {
						Type: vo.DataTypeString,
					},
					selector.RightKey: {
						Type: vo.DataTypeString,
					},
				},
			},
			"1": {
				Type: vo.DataTypeObject,
				Properties: map[string]*vo.TypeInfo{
					"0": {
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							selector.LeftKey: {
								Type: vo.DataTypeInteger,
							},
							selector.RightKey: {
								Type: vo.DataTypeInteger,
							},
						},
					},
					"1": {
						Type: vo.DataTypeObject,
						Properties: map[string]*vo.TypeInfo{
							selector.LeftKey: {
								Type: vo.DataTypeBoolean,
							},
						},
					},
				},
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entryN,
			ns,
			lambdaNode1,
			LambdaNode2,
			lambdaNode3,
			exitN,
		},
		Connections: []*schema.Connection{
			{
				FromNode: entryN.Key,
				ToNode:   "selector",
			},
			{
				FromNode: "selector",
				ToNode:   "lambda1",
				FromPort: ptr.Of("branch_0"),
			},
			{
				FromNode: "selector",
				ToNode:   "lambda2",
				FromPort: ptr.Of("branch_1"),
			},
			{
				FromNode: "selector",
				ToNode:   "lambda3",
				FromPort: ptr.Of("branch_1"),
			},
			{
				FromNode: "selector",
				ToNode:   exitN.Key,
				FromPort: ptr.Of("default"),
			},
			{
				FromNode: "lambda1",
				ToNode:   exitN.Key,
			},
			{
				FromNode: "lambda2",
				ToNode:   exitN.Key,
			},
			{
				FromNode: "lambda3",
				ToNode:   exitN.Key,
			},
		},
	}

	branches, err := schema.BuildBranches(ws.Connections)
	assert.NoError(t, err)
	ws.Branches = branches

	ws.Init()

	ctx := context.Background()
	wf, err := compose2.NewWorkflow(ctx, ws)
	assert.NoError(t, err)

	out, err := wf.Runner.Invoke(ctx, map[string]any{
		"key1": "value1",
		"key2": int64(2),
		"key3": int64(3),
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"lambda1": "v1",
	}, out)

	out, err = wf.Runner.Invoke(ctx, map[string]any{
		"key1": "value2",
		"key2": int64(3),
		"key3": int64(2),
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"lambda2": "v2",
		"lambda3": "v3",
	}, out)

	out, err = wf.Runner.Invoke(ctx, map[string]any{
		"key1": "value2",
		"key2": int64(2),
		"key3": int64(3),
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{}, out)
}

func TestVariableAggregator(t *testing.T) {
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
				Path: compose.FieldPath{"Group1"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "va",
						FromPath:    compose.FieldPath{"Group1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"Group2"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: "va",
						FromPath:    compose.FieldPath{"Group2"},
					},
				},
			},
		},
	}

	ns := &schema.NodeSchema{
		Key:  "va",
		Type: entity.NodeTypeVariableAggregator,
		Configs: &variableaggregator.Config{
			MergeStrategy: variableaggregator.FirstNotNullValue,
			GroupLen: map[string]int{
				"Group1": 1,
				"Group2": 1,
			},
			GroupOrder: []string{
				"Group1",
				"Group2",
			},
		},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"Group1", "0"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"Str1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"Group2", "0"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entryN.Key,
						FromPath:    compose.FieldPath{"Int1"},
					},
				},
			},
		},
		InputTypes: map[string]*vo.TypeInfo{
			"Group1": {
				Type: vo.DataTypeObject,
				Properties: map[string]*vo.TypeInfo{
					"0": {
						Type: vo.DataTypeString,
					},
				},
			},
			"Group2": {
				Type: vo.DataTypeObject,
				Properties: map[string]*vo.TypeInfo{
					"0": {
						Type: vo.DataTypeInteger,
					},
				},
			},
		},
		OutputTypes: map[string]*vo.TypeInfo{
			"Group1": {
				Type: vo.DataTypeString,
			},
			"Group2": {
				Type: vo.DataTypeInteger,
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entryN,
			ns,
			exitN,
		},
		Connections: []*schema.Connection{
			{
				FromNode: entryN.Key,
				ToNode:   "va",
			},
			{
				FromNode: "va",
				ToNode:   exitN.Key,
			},
		},
	}

	ws.Init()

	ctx := context.Background()
	wf, err := compose2.NewWorkflow(ctx, ws)
	assert.NoError(t, err)

	out, err := wf.Runner.Invoke(context.Background(), map[string]any{
		"Str1": "str_v1",
		"Int1": int64(1),
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"Group1": "str_v1",
		"Group2": int64(1),
	}, out)

	out, err = wf.Runner.Invoke(context.Background(), map[string]any{
		"Str1": "str_v1",
		"Int1": nil,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"Group1": "str_v1",
		"Group2": nil,
	}, out)
}

func TestTextProcessor(t *testing.T) {
	t.Run("split", func(t *testing.T) {
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
							FromNodeKey: "tp",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ns := &schema.NodeSchema{
			Key:  "tp",
			Type: entity.NodeTypeTextProcessor,
			Configs: &textprocessor.Config{
				Type:       textprocessor.SplitText,
				Separators: []string{"|"},
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"String"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"Str"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				ns,
				entryN,
				exitN,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entryN.Key,
					ToNode:   "tp",
				},
				{
					FromNode: "tp",
					ToNode:   exitN.Key,
				},
			},
		}

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"Str": "a|b|c",
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{"a", "b", "c"},
		}, out)
	})

	t.Run("concat", func(t *testing.T) {
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
							FromNodeKey: "tp",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ns := &schema.NodeSchema{
			Key:  "tp",
			Type: entity.NodeTypeTextProcessor,
			Configs: &textprocessor.Config{
				Type:       textprocessor.ConcatText,
				Tpl:        "{{String1}}_{{String2.f1}}_{{String3.f2[1]}}",
				ConcatChar: "\t",
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"String1"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"Str1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"String2"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"Str2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"String3"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entryN.Key,
							FromPath:    compose.FieldPath{"Str3"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				ns,
				entryN,
				exitN,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entryN.Key,
					ToNode:   "tp",
				},
				{
					FromNode: "tp",
					ToNode:   exitN.Key,
				},
			},
		}

		ws.Init()

		ctx := context.Background()
		wf, err := compose2.NewWorkflow(ctx, ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"Str1": true,
			"Str2": map[string]any{
				"f1": 1.0,
			},
			"Str3": map[string]any{
				"f2": []any{1, "a"},
			},
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": "true_1_a",
		}, out)
	})
}
