package test

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	compose2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/receiver"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableaggregator"
	mockWorkflow "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestAddSelector(t *testing.T) {
	// start -> selector, selector.condition1 -> lambda1 -> end, selector.condition2 -> [lambda2, lambda3] -> end, selector default -> end
	entry := &compose2.NodeSchema{
		Key:  compose2.EntryNodeKey,
		Type: entity.NodeTypeEntry,
	}

	exit := &compose2.NodeSchema{
		Key:  compose2.ExitNodeKey,
		Type: entity.NodeTypeExit,
		Configs: map[string]any{
			"TerminalPlan": vo.ReturnVariables,
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

	lambdaNode1 := &compose2.NodeSchema{
		Key:    "lambda1",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda1),
	}

	lambda2 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda2": "v2",
		}, nil
	}

	LambdaNode2 := &compose2.NodeSchema{
		Key:    "lambda2",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda2),
	}

	lambda3 := func(ctx context.Context, in map[string]any) (map[string]any, error) {
		return map[string]any{
			"lambda3": "v3",
		}, nil
	}

	lambdaNode3 := &compose2.NodeSchema{
		Key:    "lambda3",
		Type:   entity.NodeTypeLambda,
		Lambda: compose.InvokableLambda(lambda3),
	}

	ns := &compose2.NodeSchema{
		Key:  "selector",
		Type: entity.NodeTypeSelector,
		Configs: []*selector.OneClauseSchema{
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
		},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"0", selector.LeftKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
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
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"key2"},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "0", selector.RightKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"key3"},
					},
				},
			},
			{
				Path: compose.FieldPath{"1", "1", selector.LeftKey},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
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
						Type: vo.DataTypeInteger,
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

	ws := &compose2.WorkflowSchema{
		Nodes: []*compose2.NodeSchema{
			entry,
			ns,
			lambdaNode1,
			LambdaNode2,
			lambdaNode3,
			exit,
		},
		Connections: []*compose2.Connection{
			{
				FromNode: entry.Key,
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
				ToNode:   exit.Key,
				FromPort: ptr.Of("default"),
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
	entry := &compose2.NodeSchema{
		Key:  compose2.EntryNodeKey,
		Type: entity.NodeTypeEntry,
	}

	exit := &compose2.NodeSchema{
		Key:  compose2.ExitNodeKey,
		Type: entity.NodeTypeExit,
		Configs: map[string]any{
			"TerminalPlan": vo.ReturnVariables,
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

	ns := &compose2.NodeSchema{
		Key:  "va",
		Type: entity.NodeTypeVariableAggregator,
		Configs: map[string]any{
			"MergeStrategy": variableaggregator.FirstNotNullValue,
			"GroupToLen": map[string]int{
				"Group1": 1,
				"Group2": 1,
			},
		},
		InputSources: []*vo.FieldInfo{
			{
				Path: compose.FieldPath{"Group1", "0"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"Str1"},
					},
				},
			},
			{
				Path: compose.FieldPath{"Group2", "0"},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: entry.Key,
						FromPath:    compose.FieldPath{"Int1"},
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

	ws := &compose2.WorkflowSchema{
		Nodes: []*compose2.NodeSchema{
			entry,
			ns,
			exit,
		},
		Connections: []*compose2.Connection{
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
		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		exit := &compose2.NodeSchema{
			Key:  compose2.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: map[string]any{
				"TerminalPlan": vo.ReturnVariables,
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

		ns := &compose2.NodeSchema{
			Key:  "tp",
			Type: entity.NodeTypeTextProcessor,
			Configs: map[string]any{
				"Type":       textprocessor.SplitText,
				"Separators": []string{"|"},
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"String"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str"},
						},
					},
				},
			},
		}

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				ns,
				entry,
				exit,
			},
			Connections: []*compose2.Connection{
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
		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		exit := &compose2.NodeSchema{
			Key:  compose2.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: map[string]any{
				"TerminalPlan": vo.ReturnVariables,
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

		ns := &compose2.NodeSchema{
			Key:  "tp",
			Type: entity.NodeTypeTextProcessor,
			Configs: map[string]any{
				"Type":       textprocessor.ConcatText,
				"Tpl":        "{{String1}}_{{String2.f1}}_{{String3.f2[1]}}",
				"ConcatChar": "\t",
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"String1"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str1"},
						},
					},
				},
				{
					Path: compose.FieldPath{"String2"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str2"},
						},
					},
				},
				{
					Path: compose.FieldPath{"String3"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: entry.Key,
							FromPath:    compose.FieldPath{"Str3"},
						},
					},
				},
			},
		}

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				ns,
				entry,
				exit,
			},
			Connections: []*compose2.Connection{
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

		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		exit := &compose2.NodeSchema{
			Key:  compose2.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: map[string]any{
				"TerminalPlan": vo.ReturnVariables,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"body"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: "hr",
							FromPath:    compose.FieldPath{"body"},
						},
					},
				},
			},
		}

		ns := &compose2.NodeSchema{
			Key:  "hr",
			Type: entity.NodeTypeHTTPRequester,
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

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				entry,
				ns,
				exit,
			},
			Connections: []*compose2.Connection{
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

		ws.Init()

		ctx := context.Background()
		wf, err := compose2.NewWorkflow(ctx, ws)
		assert.NoError(t, err)

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{
			"post_text_plain": "post_text_plain",
			"v1":              "v1",
			"v2":              "v2",
		})
		assert.NoError(t, err)

		assert.Equal(t, `{"message":"success"}`, out["body"])
	})
}

func TestInputReceiver(t *testing.T) {
	mockey.PatchConvey("test input receiver", t, func() {
		entry := &compose2.NodeSchema{
			Key:  compose2.EntryNodeKey,
			Type: entity.NodeTypeEntry,
		}

		ns := &compose2.NodeSchema{
			Key:  "input_receiver_node",
			Type: entity.NodeTypeInputReceiver,
			Configs: map[string]any{
				"OutputSchema": "{}",
			},
		}

		exit := &compose2.NodeSchema{
			Key:  compose2.ExitNodeKey,
			Type: entity.NodeTypeExit,
			Configs: map[string]any{
				"TerminalPlan": vo.ReturnVariables,
			},
			InputSources: []*vo.FieldInfo{
				{
					Path: compose.FieldPath{"input"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: ns.Key,
							FromPath:    compose.FieldPath{"input"},
						},
					},
				},
				{
					Path: compose.FieldPath{"obj"},
					Source: vo.FieldSource{
						Ref: &vo.Reference{
							FromNodeKey: ns.Key,
							FromPath:    compose.FieldPath{"obj"},
						},
					},
				},
			},
		}

		ws := &compose2.WorkflowSchema{
			Nodes: []*compose2.NodeSchema{
				entry,
				ns,
				exit,
			},
			Connections: []*compose2.Connection{
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

		ws.Init()

		wf, err := compose2.NewWorkflow(context.Background(), ws)
		assert.NoError(t, err)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockRepo := mockWorkflow.NewMockRepository(ctrl)
		mockey.Mock(workflow.GetRepository).Return(mockRepo).Build()
		mockRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()

		checkPointID := fmt.Sprintf("%d", time.Now().Nanosecond())
		_, err = wf.Runner.Invoke(context.Background(), map[string]any{}, compose.WithCheckPointID(checkPointID))
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
			input := map[string]any{
				receiver.ReceivedDataKey: userInputStr,
			}
			state.(*compose2.State).Inputs[ns.Key] = input
			return nil
		}

		out, err := wf.Runner.Invoke(context.Background(), map[string]any{},
			compose.WithCheckPointID(checkPointID), compose.WithStateModifier(stateModifier))
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"input": "user input",
			"obj": map[string]any{
				"field1": []any{"1", "2"},
			},
		}, out)
	})
}
