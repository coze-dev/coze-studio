package workflow

import (
	"context"
	"encoding/json"
	"os"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	schema2 "github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/canvas"
	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database/databasemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	mockvar "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
)

func TestEntryExit(t *testing.T) {
	mockey.PatchConvey("test entry exit", t, func() {
		data, err := os.ReadFile("./canvas/examples/entry_exit.json")
		assert.NoError(t, err)

		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)

		ctx := context.Background()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC, compose.WithGraphName("2"))
		assert.NoError(t, err)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
		mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any()).Return(1.0, nil).AnyTimes()

		mockey.Mock(variable.GetVariableHandler).Return(&variable.Handler{
			AppVarStore: mockGlobalAppVarStore,
		}).Build()

		eventChan := make(chan *execute.Event)

		opts := []compose.Option{
			compose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
			compose.WithCallbacks(execute.NewNodeHandler(schema.EntryNodeKey, eventChan)).DesignateNode(schema.EntryNodeKey),
			compose.WithCallbacks(execute.NewNodeHandler(schema.ExitNodeKey, eventChan)).DesignateNode(schema.ExitNodeKey),
		}

		idgen := mock.NewMockIDGenerator(ctrl)
		idgen.EXPECT().GenID(gomock.Any()).Return(int64(100), nil).AnyTimes()

		ctx, err = execute.PrepareExecuteContext(ctx, &execute.Context{
			SpaceID:    1,
			WorkflowID: 2,
		}, idgen)

		wf.Run(ctx, map[string]any{
			"arr": []any{"arr1", "arr2"},
			"obj": map[string]any{
				"field1": []any{"1234", "5678"},
			},
			"input": 3.5,
		}, opts...)

	outer:
		for {
			event := <-eventChan

			switch event.Type {
			case execute.WorkflowSuccess:
				event.OutputStream.Close()
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			case execute.NodeEnd:
				if event.NodeKey == schema.ExitNodeKey {
					assert.Equal(t, int64(100), event.ExecutorID)
					var fullOutput string
					for {
						chunk, err := event.OutputStream.Recv()
						if err != nil {
							event.OutputStream.Close()
							break
						}
						chunkStr, ok := chunk.(string)
						assert.True(t, ok)
						fullOutput += chunkStr
					}
					assert.Equal(t, fullOutput, "1_['1234', '5678']")
				}
			default:
				if event.InputStream != nil {
					event.InputStream.Close()
				} else if event.OutputStream != nil {
					event.OutputStream.Close()
				}
			}
		}
	})
}

func TestLLMFromCanvas(t *testing.T) {
	mockey.PatchConvey("test llm from canvas", t, func() {
		data, err := os.ReadFile("./canvas/examples/llm.json")
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := context.Background()

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &utChatModel{
			streamResultProvider: func() (*schema2.StreamReader[*schema2.Message], error) {
				return schema2.StreamReaderFromArray([]*schema2.Message{
					{
						Role:    schema2.Assistant,
						Content: "I ",
						ResponseMeta: &schema2.ResponseMeta{
							Usage: &schema2.TokenUsage{
								PromptTokens:     1,
								CompletionTokens: 2,
								TotalTokens:      3,
							},
						},
					},
					{
						Role:    schema2.Assistant,
						Content: "don't know.",
						ResponseMeta: &schema2.ResponseMeta{
							Usage: &schema2.TokenUsage{
								PromptTokens:     1,
								CompletionTokens: 2,
								TotalTokens:      3,
							},
						},
					},
				}), nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC, compose.WithGraphName("2"))
		assert.NoError(t, err)

		eventChan := make(chan *execute.Event)

		opts := []compose.Option{
			compose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
			compose.WithCallbacks(execute.NewNodeHandler("159921", eventChan)).DesignateNode("159921"),
		}

		ctx, err = execute.PrepareExecuteContext(ctx, &execute.Context{
			SpaceID:    1,
			WorkflowID: 2,
			ExecuteID:  100,
		}, nil)

		wf.Run(ctx, map[string]any{
			"input": "what's your name?",
		}, opts...)

	outer:
		for {
			event := <-eventChan

			if event.InputStream != nil {
				event.InputStream.Close()
			} else if event.OutputStream != nil {
				event.OutputStream.Close()
			}

			switch event.Type {
			case execute.WorkflowSuccess:
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			case execute.NodeEnd:
				if event.NodeKey == "159921" {
					assert.Equal(t, &execute.TokenInfo{
						InputToken:  2,
						OutputToken: 4,
						TotalToken:  6,
					}, event.Token)
				}
			default:
			}
		}
	})
}

func TestLoopSelectorFromCanvas(t *testing.T) {
	mockey.PatchConvey("test loop selector from canvas", t, func() {
		data, err := os.ReadFile("./canvas/examples/loop_selector_variable_assign_text_processor.json")
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := context.Background()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC, compose.WithGraphName("2"))
		assert.NoError(t, err)

		eventChan := make(chan *execute.Event)

		opts := []compose.Option{
			compose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
		}

		for key := range workflowSC.GetAllNodes() {
			if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
				opts = append(opts, compose.WithCallbacks(execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))
			} else {
				parent := workflowSC.GetAllNodes()[parent]
				if parent.Type == schema.NodeTypeLoop {
					opts = append(opts, compose.WithLambdaOption(
						loop.WithOptsForInner(
							compose.WithCallbacks(
								execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))).
						DesignateNode(string(parent.Key)))
				}
			}
		}

		ctx, err = execute.PrepareExecuteContext(ctx, &execute.Context{
			SpaceID:    1,
			WorkflowID: 2,
			ExecuteID:  100,
		}, nil)
		assert.NoError(t, err)

		wf.Run(ctx, map[string]any{
			"query1": []any{"a", "bb", "ccc", "dddd"},
		}, opts...)

	outer:
		for {
			event := <-eventChan

			switch event.Type {
			case execute.WorkflowSuccess:
				assert.Equal(t, map[string]any{
					"converted": []any{
						"new_a",
						"new_ccc",
					},
					"output": "dddd",
				}, event.Output)
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			default:
			}
		}
	})
}

func TestIntentDetectorAndDatabase(t *testing.T) {

	mockey.PatchConvey("intent detector & database custom sql", t, func() {
		data, err := os.ReadFile("./canvas/examples/intent_detector_database_custom_sql.json")
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := t.Context()

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &utChatModel{
			invokeResultProvider: func() (*schema2.Message, error) {
				return &schema2.Message{
					Content: `{"classificationId":1,"reason":"choice branch 1 "}`,
				}, nil
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		mockCustomSQL := databasemock.NewMockCustomSQLExecutor(ctrl)
		n := int64(2)
		resp := &crossdatabase.Response{
			Objects: []crossdatabase.Object{
				{
					"v2": "123",
				},
				{
					"v2": "345",
				},
			},
			RowNumber: &n,
		}
		mockCustomSQL.EXPECT().Execute(gomock.Any(), gomock.Any()).Return(resp, nil).AnyTimes()
		mockey.Mock(crossdatabase.GetCustomSQLExecutor).Return(mockCustomSQL).Build()

		workflowSC, err := c.ToWorkflowSchema()
		assert.NoError(t, err)
		wf, err := NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.runner.Invoke(ctx, map[string]any{
			"input": "what's your name?",
		})
		output := response["output"]
		bs, _ := json.Marshal(output)
		ret := make([]map[string]interface{}, 0)
		err = json.Unmarshal(bs, &ret)
		assert.NoError(t, err)

		assert.Equal(t, ret[0]["v2"], float64(123))
		assert.Equal(t, ret[1]["v2"], float64(345))

		number := response["number"].(*int64)
		assert.Equal(t, int64(2), *number)

	})
}
