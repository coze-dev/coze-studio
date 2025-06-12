package adaptor

import (
	"context"

	userentity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/types/consts"

	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database/databasemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge/knowledgemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin/pluginmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	mockvar "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/database"
	mockWorkflow "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow"
	mockcode "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/internal/testutil"
)

func TestIntentDetectorAndDatabase(t *testing.T) {
	mockey.PatchConvey("intent detector & database custom sql", t, func() {
		data, err := os.ReadFile("../examples/intent_detector_database_custom_sql.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := t.Context()
		ctx, err = execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{}, 123, false, &entity.InterruptEvent{}, vo.ExecuteConfig{
			Mode: vo.ExecuteModeDebug,
		})
		assert.NoError(t, err)
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(_ int, in []*schema.Message) (*schema.Message, error) {
				return &schema.Message{
					Role:    schema.Assistant,
					Content: `{"classificationId":1,"reason":"choice branch 1 "}`,
					ResponseMeta: &schema.ResponseMeta{
						Usage: &schema.TokenUsage{
							PromptTokens:     1,
							CompletionTokens: 2,
							TotalTokens:      3,
						},
					},
				}, nil
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
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
		mockDatabaseOperator.EXPECT().Execute(gomock.Any(), gomock.Any()).Return(resp, nil).AnyTimes()
		mockey.Mock(crossdatabase.GetDatabaseOperator).Return(mockDatabaseOperator).Build()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)

		wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(2))
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"input": "what's your name?",
		})
		assert.NoError(t, err)
		output := response["output"]
		bs, _ := sonic.Marshal(output)
		ret := make([]map[string]interface{}, 0)
		err = sonic.Unmarshal(bs, &ret)
		assert.NoError(t, err)

		assert.Equal(t, ret[0]["v2"], float64(123))
		assert.Equal(t, ret[1]["v2"], float64(345))

		number := response["number"].(*int64)
		assert.Equal(t, int64(2), *number)
		eventChan := make(chan *execute.Event)

		opts := []einoCompose.Option{
			einoCompose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
			einoCompose.WithCallbacks(execute.NewNodeHandler("141102", "intent", eventChan, nil, nil)).DesignateNode("141102"),
		}

		mockRepo := mockWorkflow.NewMockRepository(ctrl)
		mockey.Mock(workflow.GetRepository).Return(mockRepo).Build()
		mockRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
		mockRepo.EXPECT().GetWorkflowCancelFlag(gomock.Any(), gomock.Any()).Return(false, nil).AnyTimes()

		ctx, err = execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{
			WorkflowIdentity: entity.WorkflowIdentity{ID: 2},
			NodeCount:        workflowSC.NodeCount(),
		}, 1, false, nil, vo.ExecuteConfig{})

		wf.AsyncRun(ctx, map[string]any{
			"input": "what's your name?",
		}, opts...)

	outer:
		for {
			event := <-eventChan

			switch event.Type {
			case execute.WorkflowSuccess:
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			case execute.NodeEnd: // TODO: move this test to api layer
				/*				if event.NodeKey == "141102" {
								assert.Equal(t, &execute.TokenInfo{
									InputToken:  1,
									OutputToken: 2,
									TotalToken:  3,
								}, event.Token)
							}*/
			default:
			}
		}
	})
}

func mockUpdate(t *testing.T) func(context.Context, *crossdatabase.UpdateRequest) (*crossdatabase.Response, error) {
	return func(ctx context.Context, req *crossdatabase.UpdateRequest) (*crossdatabase.Response, error) {
		assert.Equal(t, req.ConditionGroup.Conditions[0], &crossdatabase.Condition{
			Left:     "v2",
			Operator: "=",
			Right:    int64(1),
		})

		assert.Equal(t, req.ConditionGroup.Conditions[1], &crossdatabase.Condition{
			Left:     "v1",
			Operator: "=",
			Right:    "abc",
		})
		assert.Equal(t, req.ConditionGroup.Relation, crossdatabase.ClauseRelationAND)
		assert.Equal(t, req.Fields, map[string]interface{}{
			"1783392627713": 123,
		})

		return &crossdatabase.Response{}, nil
	}
}

func mockInsert(t *testing.T) func(ctx context.Context, request *crossdatabase.InsertRequest) (*crossdatabase.Response, error) {
	return func(ctx context.Context, req *crossdatabase.InsertRequest) (*crossdatabase.Response, error) {
		v := req.Fields["1785960530945"]
		assert.Equal(t, v, int64(123))
		vs := req.Fields["1783122026497"]
		assert.Equal(t, vs, "input for database curd")
		n := int64(10)
		return &crossdatabase.Response{
			RowNumber: &n,
		}, nil
	}
}

func mockQuery(t *testing.T) func(ctx context.Context, request *crossdatabase.QueryRequest) (*crossdatabase.Response, error) {
	return func(ctx context.Context, req *crossdatabase.QueryRequest) (*crossdatabase.Response, error) {
		assert.Equal(t, req.ConditionGroup.Conditions[0], &crossdatabase.Condition{
			Left:     "v1",
			Operator: "=",
			Right:    "abc",
		})

		assert.Equal(t, req.SelectFields, []string{
			"1783122026497", "1784288924673", "1783392627713",
		})
		n := int64(10)
		return &crossdatabase.Response{
			RowNumber: &n,
			Objects: []crossdatabase.Object{
				{"v1": "vv"},
			},
		}, nil
	}
}

func mockDelete(t *testing.T) func(context.Context, *crossdatabase.DeleteRequest) (*crossdatabase.Response, error) {
	return func(ctx context.Context, req *crossdatabase.DeleteRequest) (*crossdatabase.Response, error) {
		nn := int64(10)
		assert.Equal(t, req.ConditionGroup.Conditions[0], &crossdatabase.Condition{
			Left:     "v2",
			Operator: "=",
			Right:    &nn,
		})

		n := int64(1)
		return &crossdatabase.Response{
			RowNumber: &n,
		}, nil
	}
}

func TestDatabaseCURD(t *testing.T) {
	mockey.PatchConvey("database curd", t, func() {
		data, err := os.ReadFile("../examples/database_curd.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()
		_ = ctx
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
		mockey.Mock(crossdatabase.GetDatabaseOperator).Return(mockDatabaseOperator).Build()
		mockDatabaseOperator.EXPECT().Query(gomock.Any(), gomock.Any()).DoAndReturn(mockQuery(t))
		mockDatabaseOperator.EXPECT().Update(gomock.Any(), gomock.Any()).DoAndReturn(mockUpdate(t))
		mockDatabaseOperator.EXPECT().Insert(gomock.Any(), gomock.Any()).DoAndReturn(mockInsert(t))
		mockDatabaseOperator.EXPECT().Delete(gomock.Any(), gomock.Any()).DoAndReturn(mockDelete(t))

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)

		wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(2))
		assert.NoError(t, err)

		eventChan := make(chan *execute.Event)

		opts := []einoCompose.Option{
			einoCompose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
			einoCompose.WithCallbacks(execute.NewNodeHandler("178557", "", eventChan, nil, nil)).DesignateNode("178557"),
			einoCompose.WithCallbacks(execute.NewNodeHandler("169400", "", eventChan, nil, nil)).DesignateNode("169400"),
			einoCompose.WithCallbacks(execute.NewNodeHandler("122439", "", eventChan, nil, nil)).DesignateNode("122439"),
			einoCompose.WithCallbacks(execute.NewNodeHandler("125902", "", eventChan, nil, nil)).DesignateNode("125902"),
		}

		mockRepo := mockWorkflow.NewMockRepository(ctrl)
		mockey.Mock(workflow.GetRepository).Return(mockRepo).Build()
		mockRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
		mockRepo.EXPECT().GetWorkflowCancelFlag(gomock.Any(), gomock.Any()).Return(false, nil).AnyTimes()

		ctx, err = execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{
			WorkflowIdentity: entity.WorkflowIdentity{ID: 2},
			NodeCount:        workflowSC.NodeCount(),
		}, 1, false, nil, vo.ExecuteConfig{})

		wf.AsyncRun(ctx, map[string]any{
			"input": "input for database curd",
			"v2":    123,
		}, opts...)

	outer:
		for {
			event := <-eventChan

			switch event.Type {
			case execute.WorkflowSuccess:
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			case execute.NodeEnd:
				if event.NodeKey == "178557" {
					assert.Contains(t, event.Output["outputList"], map[string]any{
						"v1": "vv",
						"v2": nil,
						"v3": nil,
					})
				}
			case execute.NodeStart:
				if event.NodeKey == "178557" {
					assert.Equal(t, event.Input["selectParam"].(map[string]any)["condition"], &database.Condition{
						ConditionList: []database.ConditionItem{
							{
								Left:      "v1",
								Operation: "EQUAL",
								Right:     "abc",
							},
						},
						Logic: "AND",
					})

				}
				if event.NodeKey == "169400" {
					assert.Equal(t, event.Input["deleteParam"].(map[string]any)["condition"].(*database.Condition).ConditionList[0].Left, "v2")
					assert.Equal(t, event.Input["deleteParam"].(map[string]any)["condition"].(*database.Condition).ConditionList[0].Operation, "EQUAL")
				}
				if event.NodeKey == "122439" {
					assert.Equal(t, database.ConditionItem{
						Left:      "v1",
						Operation: "EQUAL",
						Right:     "abc",
					}, event.Input["updateParam"].(map[string]any)["condition"].(*database.Condition).ConditionList[1])
				}
				if event.NodeKey == "125902" {
					bs, _ := sonic.Marshal(event.Input)
					assert.Contains(t, string(bs), "7478954112676282405", `{"fieldId":"1783122026497","fieldValue":"input for database curd"},{"fieldId":"1785960530945","fieldValue":123}]}`)

				}

			default:
			}
		}
	})
}

func TestHttpRequester(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:8080") // 指定IP和端口
	assert.NoError(t, err)
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/http_error" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
		}
		if r.URL.Path == "/file" {
			_, _ = w.Write([]byte(strings.Repeat("A", 1024*2)))
		}

		if r.URL.Path == "/no_auth_no_body" {
			assert.Equal(t, "h_v1", r.Header.Get("h1"))
			assert.Equal(t, "h_v2", r.Header.Get("h2"))
			assert.Equal(t, "abc", r.Header.Get("h3"))
			assert.Equal(t, "v1", r.URL.Query().Get("query_v1"))
			assert.Equal(t, "v2", r.URL.Query().Get("query_v2"))
			response := map[string]string{
				"message": "no_auth_no_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)
		}

		if r.URL.Path == "/bear_auth_no_body" {
			assert.Equal(t, "Bearer bear_token", r.Header.Get("Authorization"))
			response := map[string]string{
				"message": "bear_auth_no_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)

		}

		if r.URL.Path == "/custom_auth_no_body" {
			assert.Equal(t, "authValue", r.URL.Query().Get("authKey"))
			response := map[string]string{
				"message": "custom_auth_no_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)

		}

		if r.URL.Path == "/custom_auth_json_body" {

			body, err := io.ReadAll(r.Body)
			if err != nil {
				t.Fatal(err)
				return
			}
			jsonRet := make(map[string]string)
			err = sonic.Unmarshal(body, &jsonRet)
			assert.NoError(t, err)
			assert.Equal(t, jsonRet["v1"], "1")
			assert.Equal(t, jsonRet["v2"], "json_body")

			response := map[string]string{
				"message": "custom_auth_json_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)
		}

		if r.URL.Path == "/custom_auth_form_data_body" {
			file, _, err := r.FormFile("file_v1")
			assert.NoError(t, err)

			fileBs, err := io.ReadAll(file)
			assert.NoError(t, err)

			assert.Equal(t, fileBs, []byte(strings.Repeat("A", 1024*2)))
			response := map[string]string{
				"message": "custom_auth_form_data_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)
		}

		if r.URL.Path == "/custom_auth_form_url_body" {
			err := r.ParseForm()
			assert.NoError(t, err)
			assert.Equal(t, "formUrlV1", r.Form.Get("v1"))
			assert.Equal(t, "formUrlV2", r.Form.Get("v2"))

			response := map[string]string{
				"message": "custom_auth_form_url_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)
		}

		if r.URL.Path == "/custom_auth_file_body" {
			body, err := io.ReadAll(r.Body)
			assert.NoError(t, err)
			defer func() {
				_ = r.Body.Close()
			}()
			assert.Equal(t, strings.TrimSpace(strings.Repeat("A", 1024*2)), string(body))
			response := map[string]string{
				"message": "custom_auth_file_body",
			}
			bs, _ := sonic.Marshal(response)
			_, _ = w.Write(bs)
		}
		if r.URL.Path == "/http_error" {
			w.WriteHeader(http.StatusInternalServerError)
		}
	}))
	ts.Listener = listener // TODO@zhuangjie: data race
	defer ts.Close()
	defer func() {
		_ = listener.Close()
	}()
	mockey.PatchConvey("http requester no auth and no body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/no_auth_no_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()
		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(3))
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":   "v1",
			"v2":   "v2",
			"h_v1": "h_v1",
			"h_v2": "h_v2",
		})
		assert.NoError(t, err)
		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"no_auth_no_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")
	})
	mockey.PatchConvey("http requester has bear auth and no body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/bear_auth_no_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(2))
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":    "v1",
			"v2":    "v2",
			"h_v1":  "h_v1",
			"h_v2":  "h_v2",
			"token": "bear_token",
		})
		assert.NoError(t, err)

		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"bear_auth_no_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")

		eventChan := make(chan *execute.Event)

		opts := []einoCompose.Option{
			einoCompose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
			einoCompose.WithCallbacks(execute.NewNodeHandler("117004", "http", eventChan, nil, nil)).DesignateNode("117004"),
		}

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockRepo := mockWorkflow.NewMockRepository(ctrl)
		mockey.Mock(workflow.GetRepository).Return(mockRepo).Build()
		mockRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
		mockRepo.EXPECT().GetWorkflowCancelFlag(gomock.Any(), gomock.Any()).Return(false, nil).AnyTimes()

		ctx, err = execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{
			WorkflowIdentity: entity.WorkflowIdentity{ID: 2},
			NodeCount:        workflowSC.NodeCount(),
		}, 1, false, nil, vo.ExecuteConfig{})

		wf.AsyncRun(ctx, map[string]any{
			"v1":    "v1",
			"v2":    "v2",
			"h_v1":  "h_v1",
			"h_v2":  "h_v2",
			"token": "bear_token",
		}, opts...)

	outer:
		for {
			event := <-eventChan

			switch event.Type {
			case execute.WorkflowSuccess:
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			case execute.NodeEnd:
				if event.NodeKey == "117004" {
					bs, _ := sonic.Marshal(event.Output)
					assert.Contains(t, string(bs), "bear_auth_no_body")
				}
			case execute.NodeStart:
				if event.NodeKey == "117004" {
					assert.Equal(t, "GET", event.Input["method"].(string))
					assert.Equal(t, "http://127.0.0.1:8080/bear_auth_no_body", event.Input["url"].(string))
					assert.Equal(t, map[string]any{
						"token": "bear_token",
					}, event.Input["auth"].(map[string]any))

				}
			default:
			}
		}
	})
	mockey.PatchConvey("http requester custom auth and no body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/custom_auth_no_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":         "v1",
			"v2":         "v2",
			"h_v1":       "h_v1",
			"h_v2":       "h_v2",
			"auth_key":   "authKey",
			"auth_value": "authValue",
		})
		assert.NoError(t, err)

		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"custom_auth_no_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")
	})
	mockey.PatchConvey("http requester custom auth and json body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/custom_auth_json_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(2))

		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":         "v1",
			"v2":         "v2",
			"h_v1":       "h_v1",
			"h_v2":       "h_v2",
			"auth_key":   "authKey",
			"auth_value": "authValue",
			"json_key":   "json_body",
		})
		assert.NoError(t, err)

		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"custom_auth_json_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")

		eventChan := make(chan *execute.Event)

		opts := []einoCompose.Option{
			einoCompose.WithCallbacks(execute.NewWorkflowHandler(2, eventChan)),
			einoCompose.WithCallbacks(execute.NewNodeHandler("117004", "http", eventChan, nil, nil)).DesignateNode("117004"),
		}

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockRepo := mockWorkflow.NewMockRepository(ctrl)
		mockey.Mock(workflow.GetRepository).Return(mockRepo).Build()
		mockRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
		mockRepo.EXPECT().GetWorkflowCancelFlag(gomock.Any(), gomock.Any()).Return(false, nil).AnyTimes()

		ctx, err = execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{
			WorkflowIdentity: entity.WorkflowIdentity{ID: 2},
			NodeCount:        workflowSC.NodeCount(),
		}, 1, false, nil, vo.ExecuteConfig{})

		wf.AsyncRun(ctx, map[string]any{
			"v1":         "v1",
			"v2":         "v2",
			"h_v1":       "h_v1",
			"h_v2":       "h_v2",
			"auth_key":   "authKey",
			"auth_value": "authValue",
			"json_key":   "json_body",
		}, opts...)

	outer:
		for {
			event := <-eventChan
			switch event.Type {
			case execute.WorkflowSuccess:
				break outer
			case execute.WorkflowFailed:
				t.Fatal(event.Err)
			case execute.NodeEnd:
				if event.NodeKey == "117004" {
					bs, _ := sonic.Marshal(event.Output)
					assert.Contains(t, string(bs), `custom_auth_json_body`)
				}
			case execute.NodeStart:
				if event.NodeKey == "117004" {

					assert.Equal(t, event.Input["body"], map[string]any{
						"v1": "1",
						"v2": "json_body",
					})
					assert.Equal(t, event.Input["auth"], map[string]any{
						"Key":   "authKey",
						"Value": "authValue",
					})

				}
			default:
			}
		}
	})
	mockey.PatchConvey("http requester custom auth and form data body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/custom_auth_form_data_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":          "v1",
			"v2":          "v2",
			"h_v1":        "h_v1",
			"h_v2":        "h_v2",
			"auth_key":    "authKey",
			"auth_value":  "authValue",
			"form_key_v1": "value1",
			"form_key_v2": "http://127.0.0.1:8080/file",
		})
		assert.NoError(t, err)
		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"custom_auth_form_data_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")
	})
	mockey.PatchConvey("http requester custom auth and form url body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/custom_auth_form_url_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()
		workflowSC, err := CanvasToWorkflowSchema(ctx, c)

		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":          "v1",
			"v2":          "v2",
			"h_v1":        "h_v1",
			"h_v2":        "h_v2",
			"auth_key":    "authKey",
			"auth_value":  "authValue",
			"form_url_v1": "formUrlV1",
			"form_url_v2": "formUrlV2",
		})
		assert.NoError(t, err)
		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"custom_auth_form_url_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")
	})
	mockey.PatchConvey("http requester custom auth and file body", t, func() {
		data, err := os.ReadFile("../examples/httprequester/custom_auth_file_body.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()
		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":         "v1",
			"v2":         "v2",
			"h_v1":       "h_v1",
			"h_v2":       "h_v2",
			"auth_key":   "authKey",
			"auth_value": "authValue",
			"file":       "http://127.0.0.1:8080/file",
		})
		assert.NoError(t, err)
		body := response["body"].(string)
		assert.Equal(t, body, `{"message":"custom_auth_file_body"}`)
		assert.Equal(t, response["h2_v2"], "h_v2")
	})
	mockey.PatchConvey("http requester error", t, func() {
		data, err := os.ReadFile("../examples/httprequester/http_error.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)

		assert.NoError(t, err)
		ctx := t.Context()
		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v1":         "v1",
			"v2":         "v2",
			"h_v1":       "h_v1",
			"h_v2":       "h_v2",
			"auth_key":   "authKey",
			"auth_value": "authValue",
		})
		assert.NoError(t, err)
		body := response["body"].(string)
		assert.Equal(t, body, "v1")
	})
}

func TestKnowledgeNodes(t *testing.T) {
	mockey.PatchConvey("knowledge indexer & retriever", t, func() {
		data, err := os.ReadFile("../examples/knowledge.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockKnowledgeOperator := knowledgemock.NewMockKnowledgeOperator(ctrl)
		mockey.Mock(knowledge.GetKnowledgeOperator).Return(mockKnowledgeOperator).Build()

		response := &knowledge.CreateDocumentResponse{
			DocumentID: int64(1),
		}
		mockKnowledgeOperator.EXPECT().Store(gomock.Any(), gomock.Any()).Return(response, nil)

		rResponse := &knowledge.RetrieveResponse{
			Slices: []*knowledge.Slice{
				{
					DocumentID: "v1",
					Output:     "v1",
				},
				{
					DocumentID: "v2",
					Output:     "v2",
				},
			},
		}

		mockKnowledgeOperator.EXPECT().Retrieve(gomock.Any(), gomock.Any()).Return(rResponse, nil)
		mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
		mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any()).Return("v1", nil).AnyTimes()
		mockGlobalAppVarStore.EXPECT().Set(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

		variable.SetVariableHandler(&variable.Handler{
			AppVarStore: mockGlobalAppVarStore,
		})

		ctx := t.Context()
		ctx = ctxcache.Init(ctx)
		ctxcache.Store(ctx, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)

		ctx, err = execute.PrepareRootExeCtx(ctx, &entity.WorkflowBasic{
			WorkflowIdentity: entity.WorkflowIdentity{ID: 2},
			NodeCount:        workflowSC.NodeCount(),
		}, 1, false, nil, vo.ExecuteConfig{})

		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		resp, err := wf.Runner.Invoke(ctx, map[string]any{
			"file": "http://127.0.0.1:8080/file?x-wf-file_name=file_v1.docx",
			"v1":   "v1",
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"success": []any{
				map[string]any{
					"documentId": "v1",
					"output":     "v1",
				},

				map[string]any{
					"documentId": "v2",
					"output":     "v2",
				},
			},
			"v1": "v1",
		}, resp)
	})
}

type mockInvokableTool struct{}

func (m *mockInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	return &schema.ToolInfo{}, nil
}

func (m *mockInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	r := map[string]any{
		"log_id": "20240617191637796DF3F4453E16AF3615",
		"msg":    "success",
		"code":   0,
		"data": map[string]interface{}{
			"image_url": "image_url",
			"prompt":    "小狗在草地上",
		},
	}
	return sonic.MarshalString(r)

}

func TestCodeAndPluginNodes(t *testing.T) {
	mockey.PatchConvey("code & plugin ", t, func() {
		data, err := os.ReadFile("../examples/code_plugin.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockCodeRunner := mockcode.NewMockRunner(ctrl)
		mockey.Mock(code.GetCodeRunner).Return(mockCodeRunner).Build()
		mockCodeRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(&code.RunResponse{
			Result: map[string]any{
				"key0":  "value0",
				"key1":  []string{"value1", "value2"},
				"key11": "value11",
			},
		}, nil)

		mockToolService := pluginmock.NewMockToolService(ctrl)
		mockey.Mock(plugin.GetToolService).Return(mockToolService).Build()
		mockToolService.EXPECT().GetPluginInvokableTools(gomock.Any(), gomock.Any()).Return(map[int64]tool.InvokableTool{
			7348853341923016714: &mockInvokableTool{},
		}, nil)

		ctx := t.Context()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)

		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)

		resp, err := wf.Runner.Invoke(ctx, map[string]any{
			"code_input":   "v1",
			"code_input_2": "v2",
			"model_type":   123,
		})
		assert.NoError(t, err)

		assert.Equal(t, map[string]any{
			"output":  "value0",
			"output2": "20240617191637796DF3F4453E16AF3615",
		}, resp)
	})
}

func TestVariableAggregatorNode(t *testing.T) {
	mockey.PatchConvey("Variable aggregator ", t, func() {
		data, err := os.ReadFile("../examples/variable_aggregate/variable_aggregator.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := t.Context()
		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)
		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)
		response, err := wf.Runner.Invoke(ctx, map[string]any{
			"v11": "v11",
		})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"g1": "v11",
			"g2": int64(100),
		}, response)
	})
}

func TestPruneIsolatedNodes(t *testing.T) {
	data, err := os.ReadFile("../examples/validate/workflow_of_prune_isolate.json")
	assert.NoError(t, err)
	c := &vo.Canvas{}
	err = sonic.Unmarshal(data, c)
	assert.NoError(t, err)
	c.Nodes, c.Edges = PruneIsolatedNodes(c.Nodes, c.Edges, nil)
	qaNodeID := "147187"
	blockTextProcessNodeID := "102623"
	for _, n := range c.Nodes {
		if n.ID == qaNodeID {
			t.Fatal("qa node id should not exist")
		}
		if len(n.Blocks) > 0 {
			for _, b := range n.Blocks {
				if b.ID == blockTextProcessNodeID {
					t.Fatal("text process node id should not exist")
				}
			}
		}
	}

}
