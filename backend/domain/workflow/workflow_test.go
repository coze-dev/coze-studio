package workflow

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableaggregator"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func ptrOf[T any](v T) *T {
	return &v
}

func TestAddSelector(t *testing.T) {
	// start -> selector, selector.condition1 -> lambda1 -> end, selector.condition2 -> [lambda2, lambda3] -> end, selector default -> end
	entry := &schema.NodeSchema{
		Key:  schema.EntryNodeKey,
		Type: schema.NodeTypeEntry,
	}

	exit := &schema.NodeSchema{
		Key:  schema.ExitNodeKey,
		Type: schema.NodeTypeExit,
		InputSources: []*nodes.FieldInfo{
			{
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "lambda1",
						FromPath:    compose.FieldPath{"lambda1"},
					},
				},
				Path: compose.FieldPath{"lambda1"},
			},
			{
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "lambda2",
						FromPath:    compose.FieldPath{"lambda2"},
					},
				},
				Path: compose.FieldPath{"lambda2"},
			},
			{
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
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
		Type:   schema.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda1),
	}

	lambda2 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda2": "v2",
		}, nil
	}

	LambdaNode2 := &schema.NodeSchema{
		Key:    "lambda2",
		Type:   schema.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda2),
	}

	lambda3 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda3": "v3",
		}, nil
	}

	lambdaNode3 := &schema.NodeSchema{
		Key:    "lambda3",
		Type:   schema.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda3),
	}

	ns := &schema.NodeSchema{
		Key:  "selector",
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
		InputSources: []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"0", selector.LeftKey},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"key1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"0", selector.RightKey},
				Source: nodes.FieldSource{
					Val: "value1",
				},
			},
			{
				Path: compose.FieldPath{"1", "0", selector.LeftKey},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"key2"},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "0", selector.RightKey},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"key3"},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "1", selector.LeftKey},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"key4"},
					},
				},
			},
		},
		InputTypes: map[string]*nodes.TypeInfo{
			"0": {
				Type: nodes.DataTypeObject,
				Properties: map[string]*nodes.TypeInfo{
					selector.LeftKey: {
						Type: nodes.DataTypeString,
					},
					selector.RightKey: {
						Type: nodes.DataTypeInteger,
					},
				},
			},
			"1": {
				Type: nodes.DataTypeObject,
				Properties: map[string]*nodes.TypeInfo{
					"0": {
						Type: nodes.DataTypeObject,
						Properties: map[string]*nodes.TypeInfo{
							selector.LeftKey: {
								Type: nodes.DataTypeInteger,
							},
							selector.RightKey: {
								Type: nodes.DataTypeInteger,
							},
						},
					},
					"1": {
						Type: nodes.DataTypeObject,
						Properties: map[string]*nodes.TypeInfo{
							selector.LeftKey: {
								Type: nodes.DataTypeBoolean,
							},
						},
					},
				},
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entry,
			ns,
			lambdaNode1,
			LambdaNode2,
			lambdaNode3,
			exit,
		},
		Connections: []*schema.Connection{
			{
				FromNode: entry.Key,
				ToNode:   "selector",
			},
			{
				FromNode:   "selector",
				ToNode:     "lambda1",
				FromPort:   ptrOf("branch_0"),
				FromBranch: true,
			},
			{
				FromNode:   "selector",
				ToNode:     "lambda2",
				FromPort:   ptrOf("branch_1"),
				FromBranch: true,
			},
			{
				FromNode:   "selector",
				ToNode:     "lambda3",
				FromPort:   ptrOf("branch_1"),
				FromBranch: true,
			},
			{
				FromNode: "selector",
				ToNode:   exit.Key,
				FromPort: ptrOf("default"),
			},
			{
				FromNode: "lambda1",
				ToNode:   exit.Key,
			},
			{
				FromNode: "lambda2",
				ToNode:   exit.Key,
			},
			{
				FromNode: "lambda3",
				ToNode:   exit.Key,
			},
		},
	}

	ctx := context.Background()
	wf, err := NewWorkflow(ctx, ws)
	assert.NoError(t, err)

	out, err := wf.runner.Invoke(ctx, map[string]any{
		"key1": "value1",
		"key2": int64(2),
		"key3": int64(3),
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"lambda1": "v1",
	}, out)

	out, err = wf.runner.Invoke(ctx, map[string]any{
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

	out, err = wf.runner.Invoke(ctx, map[string]any{
		"key1": "value2",
		"key2": int64(2),
		"key3": int64(3),
		"key4": true,
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{}, out)
}

func TestVariableAggregator(t *testing.T) {
	entry := &schema.NodeSchema{
		Key:  schema.EntryNodeKey,
		Type: schema.NodeTypeEntry,
	}

	exit := &schema.NodeSchema{
		Key:  schema.ExitNodeKey,
		Type: schema.NodeTypeExit,
		InputSources: []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"Group1"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "va",
						FromPath:    compose.FieldPath{"Group1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"Group2"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: "va",
						FromPath:    compose.FieldPath{"Group2"},
					},
				},
			},
		},
	}

	ns := &schema.NodeSchema{
		Key:  "va",
		Type: schema.NodeTypeVariableAggregator,
		Configs: map[string]any{
			"MergeStrategy": variableaggregator.FirstNotNullValue,
		},
		InputSources: []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"Group1", "0"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"Str1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"Group2", "0"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"Int1"},
					},
				},
			},
		},
		OutputTypes: map[string]*nodes.TypeInfo{
			"Group1": {
				Type: nodes.DataTypeString,
			},
			"Group2": {
				Type: nodes.DataTypeInteger,
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entry,
			ns,
			exit,
		},
		Connections: []*schema.Connection{
			{
				FromNode: entry.Key,
				ToNode:   "va",
			},
			{
				FromNode: "va",
				ToNode:   exit.Key,
			},
		},
	}

	ctx := context.Background()
	wf, err := NewWorkflow(ctx, ws)
	assert.NoError(t, err)

	out, err := wf.runner.Invoke(context.Background(), map[string]any{
		"Str1": "str_v1",
		"Int1": int64(1),
	})
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"Group1": "str_v1",
		"Group2": int64(1),
	}, out)

	out, err = wf.runner.Invoke(context.Background(), map[string]any{
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
		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "tp",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ns := &schema.NodeSchema{
			Key:  "tp",
			Type: schema.NodeTypeTextProcessor,
			Configs: map[string]any{
				"Type":       textprocessor.SplitText,
				"Separators": []string{"|"},
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"String"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				ns,
				entry,
				exit,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "tp",
				},
				{
					FromNode: "tp",
					ToNode:   exit.Key,
				},
			},
		}

		wf, err := NewWorkflow(context.Background(), ws)

		out, err := wf.runner.Invoke(context.Background(), map[string]any{
			"Str": "a|b|c",
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{"a", "b", "c"},
		}, out)
	})

	t.Run("concat", func(t *testing.T) {
		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"output"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "tp",
							FromPath:    compose.FieldPath{"output"},
						},
					},
				},
			},
		}

		ns := &schema.NodeSchema{
			Key:  "tp",
			Type: schema.NodeTypeTextProcessor,
			Configs: map[string]any{
				"Type":       textprocessor.ConcatText,
				"Tpl":        "{{String1}}_{{String2.f1}}_{{String3.f2[1]}}",
				"ConcatChar": "\t",
			},
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"String1"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"String2"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"String3"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str3"},
						},
					},
				},
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				ns,
				entry,
				exit,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "tp",
				},
				{
					FromNode: "tp",
					ToNode:   exit.Key,
				},
			},
		}

		ctx := context.Background()
		wf, err := NewWorkflow(ctx, ws)
		assert.NoError(t, err)

		out, err := wf.runner.Invoke(context.Background(), map[string]any{
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
			"output": "True_1.0_a",
		}, out)
	})
}

func TestHTTPRequester(t *testing.T) {
	t.Run("post method text/plain", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				t.Fatal(err)
				return
			}
			defer func() {
				_ = r.Body.Close()
			}()
			assert.Equal(t, "text v1 v2", string(body))
			w.WriteHeader(http.StatusOK)
			response := map[string]string{
				"message": "success",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)

		}))
		defer ts.Close()
		urlTpl := ts.URL + "/{{block_output_start.post_text_plain}}"

		entry := &schema.NodeSchema{
			Key:  schema.EntryNodeKey,
			Type: schema.NodeTypeEntry,
		}

		exit := &schema.NodeSchema{
			Key:  schema.ExitNodeKey,
			Type: schema.NodeTypeExit,
			InputSources: []*nodes.FieldInfo{
				{
					Path: compose.FieldPath{"body"},
					Source: nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: "hr",
							FromPath:    compose.FieldPath{"body"},
						},
					},
				},
			},
		}

		ns := &schema.NodeSchema{
			Key:  "hr",
			Type: schema.NodeTypeHTTPRequester,
			Configs: map[string]any{
				"URLConfig": httprequester.URLConfig{
					Tpl: urlTpl,
				},
				"BodyConfig": httprequester.BodyConfig{
					BodyType: httprequester.BodyTypeRawText,
					TextPlainConfig: &httprequester.TextPlainConfig{
						Tpl: "text {{block_output_start.v1}} {{block_output_start.v2}}",
					},
				},
				"Method":     http.MethodPost,
				"RetryTimes": uint64(1),
				"Timeout":    2 * time.Second,
			},
		}

		ws := &schema.WorkflowSchema{
			Nodes: []*schema.NodeSchema{
				entry,
				ns,
				exit,
			},
			Connections: []*schema.Connection{
				{
					FromNode: entry.Key,
					ToNode:   "hr",
				},
				{
					FromNode: "hr",
					ToNode:   exit.Key,
				},
			},
		}

		ctx := context.Background()
		wf, err := NewWorkflow(ctx, ws)
		assert.NoError(t, err)

		out, err := wf.runner.Invoke(context.Background(), map[string]any{
			"post_text_plain": "post_text_plain",
			"v1":              "v1",
			"v2":              "v2",
		})
		assert.NoError(t, err)

		assert.Equal(t, `{"message":"success"}`, out["body"])
	})
}

func TestInputReceiver(t *testing.T) {
	entry := &schema.NodeSchema{
		Key:  schema.EntryNodeKey,
		Type: schema.NodeTypeEntry,
	}

	ns := &schema.NodeSchema{
		Key:  "input_receiver_node",
		Type: schema.NodeTypeInputReceiver,
	}

	exit := &schema.NodeSchema{
		Key:  schema.ExitNodeKey,
		Type: schema.NodeTypeExit,
		InputSources: []*nodes.FieldInfo{
			{
				Path: compose.FieldPath{"input"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: ns.Key,
						FromPath:    compose.FieldPath{"input"},
					},
				},
			},
			{
				Path: compose.FieldPath{"obj"},
				Source: nodes.FieldSource{
					Ref: &nodes.Reference{
						FromNodeKey: ns.Key,
						FromPath:    compose.FieldPath{"obj"},
					},
				},
			},
		},
	}

	ws := &schema.WorkflowSchema{
		Nodes: []*schema.NodeSchema{
			entry,
			ns,
			exit,
		},
		Connections: []*schema.Connection{
			{
				FromNode: entry.Key,
				ToNode:   ns.Key,
			},
			{
				FromNode: ns.Key,
				ToNode:   exit.Key,
			},
		},
	}

	wf, err := NewWorkflow(context.Background(), ws)
	assert.NoError(t, err)

	checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
	_, err = wf.runner.Invoke(context.Background(), map[string]any{}, compose.WithCheckPointID(checkPointID))
	assert.Error(t, err)

	_, existed := compose.ExtractInterruptInfo(err)
	assert.True(t, existed)

	userInput := map[string]any{
		"input": "user input",
		"obj": map[string]any{
			"field1": []string{"1", "2"},
		},
	}
	userInputStr, err := sonic.MarshalString(userInput)
	assert.NoError(t, err)

	stateModifier := func(ctx context.Context, path compose.NodePath, state any) error {
		input := make(map[string]any)
		e := sonic.UnmarshalString(userInputStr, &input)
		if e != nil {
			return e
		}
		state.(*schema.State).Inputs[ns.Key] = input
		return nil
	}

	out, err := wf.runner.Invoke(context.Background(), map[string]any{},
		compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"input": "user input",
		"obj": map[string]any{
			"field1": []any{"1", "2"},
		},
	}, out)
}
