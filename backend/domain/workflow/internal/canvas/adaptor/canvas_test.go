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

package adaptor

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"

	userentity "github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/code"
	crossdatabase "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database/databasemock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge/knowledgemock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
	mockmodel "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model/modelmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin/pluginmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	mockvar "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable/varmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	mockWorkflow "github.com/coze-dev/coze-studio/backend/internal/mock/domain/workflow"
	mockcode "github.com/coze-dev/coze-studio/backend/internal/mock/domain/workflow/crossdomain/code"
	"github.com/coze-dev/coze-studio/backend/internal/testutil"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func TestIntentDetectorAndDatabase(t *testing.T) {
	mockey.PatchConvey("intent detector & database custom sql", t, func() {
		data, err := os.ReadFile("../examples/intent_detector_database_custom_sql.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctx := t.Context()
		assert.NoError(t, err)
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockey.Mock(execute.GetExeCtx).Return(&execute.Context{
			RootCtx: execute.RootCtx{
				ExeCfg: vo.ExecuteConfig{
					Mode:     vo.ExecuteModeDebug,
					Operator: 123,
					BizType:  vo.BizTypeWorkflow,
				},
			},
		}).Build()

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
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil, nil).AnyTimes()

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

		assert.Equal(t, ret[0]["v2"], int64(123))
		assert.Equal(t, ret[1]["v2"], int64(345))

		number := response["number"].(int64)
		assert.Equal(t, int64(2), number)
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
			"1783392627713": int64(123),
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
			Right:    nn,
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

		mockey.Mock(execute.GetExeCtx).Return(&execute.Context{
			RootCtx: execute.RootCtx{
				ExeCfg: vo.ExecuteConfig{
					Mode:     vo.ExecuteModeDebug,
					Operator: 123,
					BizType:  vo.BizTypeWorkflow,
				},
			},
		}).Build()

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)

		wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(2))
		assert.NoError(t, err)

		mockRepo := mockWorkflow.NewMockRepository(ctrl)
		mockey.Mock(workflow.GetRepository).Return(mockRepo).Build()
		mockRepo.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
		mockRepo.EXPECT().GetWorkflowCancelFlag(gomock.Any(), gomock.Any()).Return(false, nil).AnyTimes()

		output, err := wf.SyncRun(ctx, map[string]any{
			"input": "input for database curd",
			"v2":    int64(123),
		})

		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": int64(1),
		}, output)
	})
}

func TestHttpRequester(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:8080") // Specify IP and port
	assert.NoError(t, err)
	ts := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
	ts.Listener = listener
	ts.Start()
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

	mockey.PatchConvey("http requester with url template", t, func() {
		data, err := os.ReadFile("../examples/httprequester/http_with_url_template.json")
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
			"input": "input",
			"m": map[string]any{
				"m1": "m1_v1",
			},
		})
		assert.NoError(t, err)
		output := response["output"].(string)

		result := make(map[string]any)
		err = sonic.UnmarshalString(output, &result)
		assert.NoError(t, err)

		assert.Equal(t, result["data"].(string), `input`)
		assert.Equal(t, result["args"], map[string]any{
			"var":  "input",
			"var2": "m1_v1",
		})
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

		variable.SetVariableHandler(&variable.Handler{AppVarStore: mockGlobalAppVarStore})

		mockey.Mock(execute.GetAppVarStore).Return(&execute.AppVariables{Vars: map[string]any{}}).Build()

		ctx := t.Context()
		ctx = ctxcache.Init(ctx)
		ctxcache.Store(ctx, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)

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

func TestKnowledgeDeleter(t *testing.T) {
	mockey.PatchConvey("knowledge deleter", t, func() {
		data, err := os.ReadFile("../examples/knowledge_delete.json")
		assert.NoError(t, err)
		c := &vo.Canvas{}
		err = sonic.Unmarshal(data, c)
		assert.NoError(t, err)
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockKnowledgeOperator := knowledgemock.NewMockKnowledgeOperator(ctrl)
		mockey.Mock(knowledge.GetKnowledgeOperator).Return(mockKnowledgeOperator).Build()

		storeResponse := &knowledge.CreateDocumentResponse{
			DocumentID: int64(1),
			FileName:   "1706.03762v7.pdf",
			FileURL:    "https://p26-bot-workflow-sign.byteimg.com/tos-cn-i-mdko3gqilj/5264fa1295da4a6483cd236b1316c454.pdf~tplv-mdko3gqilj-image.image?rk3s=81d4c505&x-expires=1782379180&x-signature=mlaXPIk9VJjOXu87xGaRmNRg9%2BA%3D&x-wf-file_name=1706.03762v7.pdf",
		}
		mockKnowledgeOperator.EXPECT().Store(gomock.Any(), gomock.Any()).Return(storeResponse, nil)

		deleteResponse := &knowledge.DeleteDocumentResponse{
			IsSuccess: true,
		}
		mockKnowledgeOperator.EXPECT().Delete(gomock.Any(), gomock.Any()).Return(deleteResponse, nil)

		ctx := t.Context()
		ctx = ctxcache.Init(ctx)
		ctxcache.Store(ctx, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})

		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)

		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)

		resp, err := wf.Runner.Invoke(ctx, map[string]any{})
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{"output": true}, resp)
	})
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
		mockCodeRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(&coderunner.RunResponse{
			Result: map[string]any{
				"key0":  "value0",
				"key1":  []string{"value1", "value2"},
				"key11": "value11",
			},
		}, nil)

		mockToolService := pluginmock.NewMockService(ctrl)
		mockey.Mock(plugin.GetPluginService).Return(mockToolService).Build()
		mockToolService.EXPECT().ExecutePlugin(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(),
			gomock.Any()).Return(map[string]any{
			"log_id": "20240617191637796DF3F4453E16AF3615",
			"msg":    "success",
			"code":   0,
			"data": map[string]interface{}{
				"image_url": "image_url",
				"prompt":    "小狗在草地上",
			},
		}, nil).AnyTimes()

		ctx := t.Context()
		ctx = ctxcache.Init(ctx)
		workflowSC, err := CanvasToWorkflowSchema(ctx, c)
		assert.NoError(t, err)

		wf, err := compose.NewWorkflow(ctx, workflowSC)
		assert.NoError(t, err)

		resp, err := wf.Runner.Invoke(ctx, map[string]any{
			"code_input":   "v1",
			"code_input_2": "v2",
			"model_type":   int64(123),
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
