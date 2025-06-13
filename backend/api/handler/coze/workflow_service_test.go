package coze

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"reflect"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/client"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/cloudwego/hertz/pkg/protocol"
	"github.com/cloudwego/hertz/pkg/protocol/sse"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossuser"
	entity2 "code.byted.org/flow/opencoze/backend/domain/openauth/openapiauth/entity"
	mockCrossUser "code.byted.org/flow/opencoze/backend/internal/mock/crossdomain/crossuser"

	pluginModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	appworkflow "code.byted.org/flow/opencoze/backend/application/workflow"
	crossplugin "code.byted.org/flow/opencoze/backend/crossdomain/workflow/plugin"
	pluginentity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	pluginservice "code.byted.org/flow/opencoze/backend/domain/plugin/service"
	userentity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	workflow2 "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge/knowledgemock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	crosssearch "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search/searchmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	mockvar "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/infra/impl/checkpoint"
	"code.byted.org/flow/opencoze/backend/infra/impl/coderunner"
	mockPlugin "code.byted.org/flow/opencoze/backend/internal/mock/domain/plugin"
	mockWorkflow "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow"
	mockcode "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow/crossdomain/code"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	storageMock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/internal/testutil"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func prepareWorkflowIntegration(t *testing.T, needMockIDGen bool) (*server.Hertz, *gomock.Controller, *mock.MockIDGenerator, func()) {
	h := server.Default()

	h.Use(func(c context.Context, ctx *app.RequestContext) {
		c = ctxcache.Init(c)
		ctxcache.Store(c, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})
		ctx.Next(c)
	})
	h.POST("/api/workflow_api/node_template_list", NodeTemplateList)
	h.POST("/api/workflow_api/create", CreateWorkflow)
	h.POST("/api/workflow_api/save", SaveWorkflow)
	h.POST("/api/workflow_api/delete", DeleteWorkflow)
	h.POST("/api/workflow_api/canvas", GetCanvasInfo)
	h.POST("/api/workflow_api/test_run", WorkFlowTestRun)
	h.GET("/api/workflow_api/get_process", GetWorkFlowProcess)
	h.POST("/api/workflow_api/validate_tree", ValidateTree)
	h.POST("/api/workflow_api/test_resume", WorkFlowTestResume)
	h.POST("/api/workflow_api/publish", PublishWorkflow)
	h.POST("/api/workflow_api/update_meta", UpdateWorkflowMeta)
	h.POST("/api/workflow_api/cancel", CancelWorkFlow)
	h.POST("/api/workflow_api/workflow_list", GetWorkFlowList)
	h.POST("/api/workflow_api/workflow_detail", GetWorkflowDetail)
	h.POST("/api/workflow_api/workflow_detail_info", GetWorkflowDetailInfo)
	h.POST("/api/workflow_api/llm_fc_setting_detail", GetLLMNodeFCSettingDetail)
	h.POST("/api/workflow_api/llm_fc_setting_merged", GetLLMNodeFCSettingsMerged)
	h.POST("/v1/workflow/run", OpenAPIRunFlow)
	h.POST("/v1/workflow/stream_run", OpenAPIStreamRunFlow)
	h.POST("/v1/workflow/stream_resume", OpenAPIStreamResumeFlow)
	h.POST("/api/workflow_api/nodeDebug", WorkflowNodeDebugV2)
	h.GET("/api/workflow_api/get_node_execute_history", GetNodeExecuteHistory)
	h.POST("/api/workflow_api/copy", CopyWorkflow)
	h.POST("/api/workflow_api/batch_delete", BatchDeleteWorkflow)
	h.POST("/api/workflow_api/node_type", QueryWorkflowNodeTypes)
	h.GET("/v1/workflow/get_run_history", OpenAPIGetWorkflowRunHistory)

	ctrl := gomock.NewController(t)
	mockIDGen := mock.NewMockIDGenerator(ctrl)

	var previousID atomic.Int64
	if needMockIDGen {
		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			newID := time.Now().UnixNano()
			if newID == previousID.Load() {
				newID = previousID.Add(1)
			}
			return newID, nil
		}).AnyTimes()
	}

	dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
	if os.Getenv("CI_JOB_NAME") != "" {
		dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
	}
	db, err := gorm.Open(mysql.Open(dsn))
	assert.NoError(t, err)

	s, err := miniredis.Run()
	if err != nil {
		t.Fatalf("Failed to start miniredis: %v", err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr: s.Addr(),
	})

	cpStore := checkpoint.NewRedisStore(redisClient)

	mockTos := storageMock.NewMockStorage(ctrl)
	mockTos.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any(), gomock.Any()).Return("", nil).AnyTimes()
	workflowRepo := service.NewWorkflowRepository(mockIDGen, db, redisClient, mockTos, cpStore)
	mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(service.NewWorkflowService(workflowRepo)).Build()
	mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build()

	mockSearchNotify := searchmock.NewMockNotifier(ctrl)
	mockey.Mock(crosssearch.GetNotifier).Return(mockSearchNotify).Build()
	mockSearchNotify.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

	mockCU := mockCrossUser.NewMockUser(ctrl)
	mockCU.EXPECT().GetUserSpaceList(gomock.Any(), gomock.Any()).Return([]*crossuser.EntitySpace{
		{
			ID: 123,
		},
	}, nil).AnyTimes()

	m := mockey.Mock(crossuser.DefaultSVC).Return(mockCU).Build()

	f := func() {
		m.UnPatch()
		ctrl.Finish()
		_ = h.Close()
	}

	return h, ctrl, mockIDGen, f
}

func post[T any](t *testing.T, h *server.Hertz, req any, url string) *T {
	m, err := sonic.Marshal(req)
	assert.NoError(t, err)
	w := ut.PerformRequest(h.Engine, "POST", url, &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	if res.StatusCode() != http.StatusOK {
		t.Errorf("unexpected status code: %d, body: %s", res.StatusCode(), string(res.Body()))
	}
	rBody := res.Body()
	var resp T
	err = sonic.Unmarshal(rBody, &resp)
	if err != nil {
		t.Errorf("failed to unmarshal response body: %v", err)
	}
	return &resp
}

func postWithError(t *testing.T, h *server.Hertz, req any, url string) string {
	m, err := sonic.Marshal(req)
	assert.NoError(t, err)
	w := ut.PerformRequest(h.Engine, "POST", url, &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	if res.StatusCode() == http.StatusOK {
		t.Errorf("unexpected error")
	}
	return string(res.Body())
}

func postSSE(t *testing.T, req any, url string) *sse.Reader {
	m, err := sonic.Marshal(req)
	assert.NoError(t, err)

	c, _ := client.NewClient()
	hReq, hResp := protocol.AcquireRequest(), protocol.AcquireResponse()
	hReq.SetRequestURI("http://localhost:8888" + url)
	hReq.SetMethod("POST")
	hReq.SetBody(m)
	hReq.SetHeader("Content-Type", "application/json")
	err = c.Do(context.Background(), hReq, hResp)
	assert.NoError(t, err)

	if hResp.StatusCode() != http.StatusOK {
		t.Errorf("unexpected status code: %d, body: %s", hResp.StatusCode(), string(hResp.Body()))
	}

	r, err := sse.NewReader(hResp)
	assert.NoError(t, err)

	return r
}

func loadWorkflow(t *testing.T, h *server.Hertz, schemaFile string) string {
	createReq := &workflow.CreateWorkflowRequest{
		Name:     "test_wf",
		Desc:     "this is a test wf",
		IconURI:  "icon/uri",
		SpaceID:  "123",
		FlowMode: ptr.Of(workflow.WorkflowMode_Workflow),
	}

	resp := post[workflow.CreateWorkflowResponse](t, h, createReq, "/api/workflow_api/create")

	idStr := resp.Data.WorkflowID
	_, err := strconv.ParseInt(idStr, 10, 64)
	assert.NoError(t, err)

	data, err := os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", schemaFile))
	assert.NoError(t, err)

	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: idStr,
		Schema:     ptr.Of(string(data)),
		SpaceID:    ptr.Of("123"),
	}

	_ = post[workflow.SaveWorkflowResponse](t, h, saveReq, "/api/workflow_api/save")

	return idStr
}

func loadWorkflowWithWorkflowName(t *testing.T, h *server.Hertz, name, schemaFile string) string {
	createReq := &workflow.CreateWorkflowRequest{
		Name:     name,
		Desc:     "this is a test wf",
		IconURI:  "icon/uri",
		SpaceID:  "123",
		FlowMode: ptr.Of(workflow.WorkflowMode_Workflow),
	}

	resp := post[workflow.CreateWorkflowResponse](t, h, createReq, "/api/workflow_api/create")

	idStr := resp.Data.WorkflowID
	_, err := strconv.ParseInt(idStr, 10, 64)
	assert.NoError(t, err)

	data, err := os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", schemaFile))
	assert.NoError(t, err)

	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: idStr,
		Schema:     ptr.Of(string(data)),
		SpaceID:    ptr.Of("123"),
	}

	_ = post[workflow.SaveWorkflowResponse](t, h, saveReq, "/api/workflow_api/save")

	return idStr
}

func loadWorkflowWithCreateReq(t *testing.T, h *server.Hertz, createReq *workflow.CreateWorkflowRequest, schemaFile string) string {
	resp := post[workflow.CreateWorkflowResponse](t, h, createReq, "/api/workflow_api/create")

	idStr := resp.Data.WorkflowID
	_, err := strconv.ParseInt(idStr, 10, 64)
	assert.NoError(t, err)

	data, err := os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", schemaFile))
	assert.NoError(t, err)

	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: idStr,
		Schema:     ptr.Of(string(data)),
		SpaceID:    ptr.Of("123"),
	}

	_ = post[workflow.SaveWorkflowResponse](t, h, saveReq, "/api/workflow_api/save")

	return idStr
}

func getProcess(t *testing.T, h *server.Hertz, idStr string, exeID string) *workflow.GetWorkflowProcessResponse {
	getProcessReq := &workflow.GetWorkflowProcessRequest{
		WorkflowID: idStr,
		SpaceID:    "123",
		ExecuteID:  ptr.Of(exeID),
	}

	w := ut.PerformRequest(h.Engine, "GET", fmt.Sprintf("/api/workflow_api/get_process?workflow_id=%s&space_id=%s&execute_id=%s", getProcessReq.WorkflowID, getProcessReq.SpaceID, *getProcessReq.ExecuteID), nil,
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	assert.Equal(t, http.StatusOK, res.StatusCode())
	getProcessResp := &workflow.GetWorkflowProcessResponse{}
	err := sonic.Unmarshal(res.Body(), getProcessResp)
	assert.NoError(t, err)

	time.Sleep(50 * time.Millisecond)

	return getProcessResp
}

func getNodeExeHistory(t *testing.T, h *server.Hertz, idStr string, exeID string, nodeID string, scene *workflow.NodeHistoryScene) *workflow.NodeResult {
	getNodeExeHistoryReq := &workflow.GetNodeExecuteHistoryRequest{
		WorkflowID:       idStr,
		SpaceID:          "123",
		ExecuteID:        exeID,
		NodeID:           nodeID,
		NodeHistoryScene: scene,
	}

	w := ut.PerformRequest(h.Engine, "GET", fmt.Sprintf("/api/workflow_api/get_node_execute_history?workflow_id=%s&space_id=%s&execute_id=%s"+
		"&node_id=%s&node_type=3&node_history_scene=%d", getNodeExeHistoryReq.WorkflowID, getNodeExeHistoryReq.SpaceID, getNodeExeHistoryReq.ExecuteID,
		getNodeExeHistoryReq.NodeID, getNodeExeHistoryReq.GetNodeHistoryScene()), nil,
		ut.Header{Key: "Content-Type", Value: "application/json"})

	res := w.Result()
	assert.Equal(t, http.StatusOK, res.StatusCode())
	getNodeResultResp := &workflow.GetNodeExecuteHistoryResponse{}
	err := sonic.Unmarshal(res.Body(), getNodeResultResp)
	assert.NoError(t, err)

	return getNodeResultResp.Data
}

func getOpenAPIProcess(t *testing.T, h *server.Hertz, idStr string, exeID string) *workflow.GetWorkflowRunHistoryResponse {
	w := ut.PerformRequest(h.Engine, "GET", fmt.Sprintf("/v1/workflow/get_run_history?workflow_id=%s&execute_id=%s", idStr, exeID), nil,
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	assert.Equal(t, http.StatusOK, res.StatusCode())
	getProcessResp := &workflow.GetWorkflowRunHistoryResponse{}
	err := sonic.Unmarshal(res.Body(), getProcessResp)
	assert.NoError(t, err)

	return getProcessResp
}

func mustUnmarshalToMap(t *testing.T, s string) map[string]any {
	r := make(map[string]any)
	err := sonic.UnmarshalString(s, &r)
	if err != nil {
		t.Fatal(err)
	}

	return r
}

func mustMarshalToString(t *testing.T, m any) string {
	b, err := sonic.MarshalString(m)
	if err != nil {
		t.Fatal(err)
	}

	return b
}

func ensureWorkflowVersion(t *testing.T, h *server.Hertz, id int64, version string, schemaFile string, mockIDGen *mock.MockIDGenerator) {
	// query workflow draft, if not exists, load file to create the workflow
	// query workflow version, if not exists, publish the version
	_, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), id)
	if err != nil {
		mockIDGen.EXPECT().GenID(gomock.Any()).Return(id, nil).Times(1)
		_ = loadWorkflow(t, h, schemaFile)
	}

	_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowVersion(context.Background(), &entity.WorkflowIdentity{
		ID:      id,
		Version: version,
	})
	if err != nil {
		err = appworkflow.GetWorkflowDomainSVC().PublishWorkflow(context.Background(), id, version, "", true)
		if err != nil {
			t.Fatal(err)
		}
	}
}

func getSuccessStringResult(t *testing.T, h *server.Hertz, idStr string, exeID string) string {
	workflowStatus := workflow.WorkflowExeStatus_Running
	var output string
	for {
		if workflowStatus != workflow.WorkflowExeStatus_Running {
			break
		}

		getProcessResp := getProcess(t, h, idStr, exeID)
		if len(getProcessResp.Data.NodeResults) > 0 {
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
		}

		workflowStatus = getProcessResp.Data.ExecuteStatus
	}

	assert.Equal(t, workflow.WorkflowExeStatus_Success, workflowStatus)
	return output
}

func TestNodeTemplateList(t *testing.T) {
	mockey.PatchConvey("test node template list", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		req := &workflow.NodeTemplateListRequest{
			NodeTypes: []string{"1", "5", "18"},
		}

		resp := post[workflow.NodeTemplateListResponse](t, h, req, "/api/workflow_api/node_template_list")
		assert.Equal(t, 3, len(resp.Data.TemplateList))
		assert.Equal(t, 3, len(resp.Data.CateList))
	})
}

func TestCRUD(t *testing.T) {
	mockey.PatchConvey("test CRUD", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		createReq := &workflow.CreateWorkflowRequest{
			Name:     "test_wf",
			Desc:     "this is a test wf",
			IconURI:  "icon/uri",
			SpaceID:  "123",
			FlowMode: ptr.Of(workflow.WorkflowMode_Workflow),
		}

		resp := post[workflow.CreateWorkflowResponse](t, h, createReq, "/api/workflow_api/create")

		idStr := resp.Data.WorkflowID
		_, err := strconv.ParseInt(idStr, 10, 64)
		assert.NoError(t, err)

		data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/entry_exit.json")
		assert.NoError(t, err)

		saveReq := &workflow.SaveWorkflowRequest{
			WorkflowID: idStr,
			Schema:     ptr.Of(string(data)),
			SpaceID:    ptr.Of("123"),
		}

		_ = post[workflow.SaveWorkflowResponse](t, h, saveReq, "/api/workflow_api/save")

		canvasReq := &workflow.GetCanvasInfoRequest{
			WorkflowID: &idStr,
			SpaceID:    "123",
		}

		canvasResp := post[workflow.GetCanvasInfoResponse](t, h, canvasReq, "/api/workflow_api/canvas")

		assert.Equal(t, canvasResp.Data.Workflow.WorkflowID, idStr)
		assert.Equal(t, *canvasResp.Data.Workflow.SchemaJSON, string(data))

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: idStr,
			SpaceID:    "123",
		}

		_ = post[workflow.DeleteWorkflowResponse](t, h, deleteReq, "/api/workflow_api/delete")

		m, err := sonic.Marshal(canvasReq)
		assert.NoError(t, err)
		w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/canvas", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res := w.Result()
		assert.Equal(t, http.StatusInternalServerError, res.StatusCode())
	})
}

func TestTestRunAndGetProcess(t *testing.T) {
	mockey.PatchConvey("test test_run and get_process", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
		mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any()).Return(1.0, nil).AnyTimes()
		mockey.Mock(variable.GetVariableHandler).Return(&variable.Handler{
			AppVarStore: mockGlobalAppVarStore,
		}).Build()

		idStr := loadWorkflow(t, h, "entry_exit.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"arr":   "[\"arr1\", \"arr2\"]",
				"obj":   "{\"field1\": [\"1234\", \"5678\"]}",
				"input": "3.5",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		cancelReq := &workflow.CancelWorkFlowRequest{
			WorkflowID: &idStr,
			SpaceID:    "123",
			ExecuteID:  testRunResp.Data.ExecuteID,
		}

		_ = post[workflow.CancelWorkFlowResponse](t, h, cancelReq, "/api/workflow_api/cancel")

		workflowStatus := workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("first run workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		// maybe cancel or success, whichever comes first
		if workflowStatus != workflow.WorkflowExeStatus_Success &&
			workflowStatus != workflow.WorkflowExeStatus_Cancel {
			t.Errorf("workflow status is %s, wfExeStatus is %s", workflowStatus, workflowStatus)
		}

		testRunResp = post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		output := getSuccessStringResult(t, h, idStr, testRunResp.Data.ExecuteID)
		t.Log(output)

		// cancel after success, nothing happens
		_ = post[workflow.CancelWorkFlowResponse](t, h, cancelReq, "/api/workflow_api/cancel")

		_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			SpaceID:            "123",
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("desc"),
		}, "/api/workflow_api/publish")

		mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
			UserID:      123,
			ConnectorID: consts.APIConnectorID,
		}).Build()

		runReq := &workflow.OpenAPIRunFlowRequest{
			WorkflowID: idStr,
			Parameters: ptr.Of(mustMarshalToString(t, testRunReq.Input)),
			IsAsync:    ptr.Of(true),
		}

		runResp := post[workflow.OpenAPIRunFlowResponse](t, h, runReq, "/v1/workflow/run")
		output = getSuccessStringResult(t, h, idStr, runResp.GetExecuteID())
		assert.Equal(t, "1.0_['1234', '5678']", output)

		syncRunReq := &workflow.OpenAPIRunFlowRequest{
			WorkflowID: idStr,
			Parameters: ptr.Of(mustMarshalToString(t, testRunReq.Input)),
			IsAsync:    ptr.Of(false),
		}

		runResp = post[workflow.OpenAPIRunFlowResponse](t, h, syncRunReq, "/v1/workflow/run")

		output = runResp.GetData()
		var m map[string]any
		err := sonic.UnmarshalString(output, &m)
		assert.NoError(t, err)
		assert.Equal(t, "1.0_['1234', '5678']", m["data"])

		his := getOpenAPIProcess(t, h, idStr, runResp.GetExecuteID())
		assert.Equal(t, runResp.GetExecuteID(), fmt.Sprintf("%d", *his.Data[0].ExecuteID))
		assert.Equal(t, workflow.WorkflowRunMode_Sync, *his.Data[0].RunMode)

		his = getOpenAPIProcess(t, h, idStr, testRunResp.Data.ExecuteID)
		assert.Equal(t, testRunResp.Data.ExecuteID, fmt.Sprintf("%d", *his.Data[0].ExecuteID))
		assert.Equal(t, workflow.WorkflowRunMode_Async, *his.Data[0].RunMode)
	})
}

func TestValidateTree(t *testing.T) {
	mockey.PatchConvey("test validate tree", t, func() {
		h := server.Default()
		h.POST("/api/workflow_api/validate_tree", ValidateTree)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		workflowRepo := mockWorkflow.NewMockRepository(ctrl)
		srv := service.NewWorkflowService(workflowRepo)
		mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(srv).Build()

		mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build()

		vars := make([]*variable.VarMeta, 0)

		vars = append(vars, &variable.VarMeta{
			Name: "app_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeArray,
				ElemTypeInfo: &variable.VarTypeInfo{
					Type: variable.VarTypeString,
				},
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v2",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})

		mockVarGetter := mockvar.NewMockVariablesMetaGetter(ctrl)
		mockey.Mock(variable.GetVariablesMetaGetter).Return(mockVarGetter).Build()
		mockVarGetter.EXPECT().GetProjectVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

		canvasMapByte := []byte(`{"130338": {"nodes": [{"id": "","type": "2","data": {"inputs": {"content": null,"terminatePlan": "useAnswerContent"}}},{"id": "","type": "1","data": {"inputs": {"content": null,"terminatePlan": "useAnswerContent"}}}],"edges": null}}`)
		cs := make(map[int64]*vo.Canvas)
		err := json.Unmarshal(canvasMapByte, &cs)
		assert.NoError(t, err)

		workflowRepo.EXPECT().MGetWorkflowCanvas(gomock.Any(), gomock.Any()).Return(cs, nil).AnyTimes()

		t.Run("workflow_has_loop", func(t *testing.T) {
			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/workflow_has_loop.json")
			assert.NoError(t, err)

			req := new(workflow.ValidateTreeRequest)

			req.WorkflowID = "1"
			req.Schema = ptr.Of(string(data))

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/validate_tree", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.ValidateTreeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)
			paths := map[string]string{
				"161668": "101917",
				"101917": "177387",
				"177387": "161668",
				"166209": "102541",
				"102541": "109507",
				"109507": "166209",
			}

			for _, i := range response.Data[0].GetErrors() {
				assert.Equal(t, paths[i.PathError.Start], i.PathError.End)
			}
		})

		t.Run("workflow_has_no_connected_nodes", func(t *testing.T) {
			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/workflow_has_no_connected_nodes.json")
			assert.NoError(t, err)

			req := new(workflow.ValidateTreeRequest)

			req.WorkflowID = "1"
			req.Schema = ptr.Of(string(data))

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/validate_tree", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.ValidateTreeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)

			for _, i := range response.Data[0].GetErrors() {
				if i.NodeError != nil {
					if i.NodeError.NodeID == "108984" {
						assert.Equal(t, i.Message, `node "代码_1" not connected`)
					}
					if i.NodeError.NodeID == "160892" {
						assert.Contains(t, i.Message, `node "意图识别"'s port "branch_1" not connected`, `node "意图识别"'s port "default" not connected;`)
					}

				}
			}
		})

		t.Run("workflow_ref_variable", func(t *testing.T) {
			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/workflow_ref_variable.json")
			assert.NoError(t, err)

			req := new(workflow.ValidateTreeRequest)

			req.WorkflowID = "1"
			req.Schema = ptr.Of(string(data))

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/validate_tree", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.ValidateTreeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)

			for _, i := range response.Data[0].GetErrors() {
				if i.NodeError != nil {
					if i.NodeError.NodeID == "118685" {
						assert.Equal(t, i.Message, `the node id "118685" on which node id "165568" depends does not exist`)
					}

					if i.NodeError.NodeID == "128176" {
						assert.Equal(t, i.Message, `the node id "128176" on which node id "11384000" depends does not exist`)
					}
				}
			}
		})

		t.Run("workflow_nested_has_loop_or_batch", func(t *testing.T) {
			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/workflow_nested_has_loop_or_batch.json")
			assert.NoError(t, err)

			req := new(workflow.ValidateTreeRequest)

			req.WorkflowID = "1"
			req.Schema = ptr.Of(string(data))

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/validate_tree", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.ValidateTreeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)

			assert.Equal(t, response.Data[0].GetErrors()[0].Message, `nested nodes do not support batch/loop`)
		})

		t.Run("workflow_variable_assigner", func(t *testing.T) {
			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/workflow_variable_assigner.json")
			assert.NoError(t, err)

			req := new(workflow.ValidateTreeRequest)

			req.WorkflowID = "1"
			req.BindProjectID = "1"
			req.Schema = ptr.Of(string(data))

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/validate_tree", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.ValidateTreeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)
			assert.Equal(t, response.Data[0].GetErrors()[0].Message, `node name 变量赋值,param [app_list_v2] is updated, please update the param`)
		})

		t.Run("sub_workflow_terminate_plan_type", func(t *testing.T) {
			metas := map[int64]*entity.Workflow{
				7498321598097768457: {
					WorkflowIdentity: entity.WorkflowIdentity{
						ID: 7498321598097768457,
					},
					Name: "sub_workflow_v1",
				},
			}

			subWorkFlowData, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/workflow_has_no_connected_nodes.json")
			assert.NoError(t, err)

			workflowRepo.EXPECT().MGetWorkflowMeta(gomock.Any(), gomock.Any()).Return(metas, nil).AnyTimes()
			in := make([]*vo.NamedTypeInfo, 0)

			inStr, _ := sonic.MarshalString(in)
			vInfo := &vo.DraftInfo{
				Canvas:       string(subWorkFlowData),
				InputParams:  inStr,
				OutputParams: inStr,
			}
			workflowRepo.EXPECT().GetWorkflowDraft(gomock.Any(), gomock.Any()).Return(vInfo, nil).AnyTimes()

			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/validate/sub_workflow_terminate_plan_type.json")
			assert.NoError(t, err)

			req := new(workflow.ValidateTreeRequest)

			req.WorkflowID = "1"
			req.BindProjectID = "1"

			req.Schema = ptr.Of(string(data))

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/validate_tree", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.ValidateTreeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)

			assert.Equal(t, len(response.Data), 2)
			assert.Equal(t, response.Data[0].GetErrors()[0].Message, `node name 变量赋值,param [app_list_v2] is updated, please update the param`)

			for _, i := range response.Data[1].GetErrors() {
				if i.NodeError != nil {
					if i.NodeError.NodeID == "108984" {
						assert.Equal(t, i.Message, `node "代码_1" not connected`)
					}
					if i.NodeError.NodeID == "160892" {
						assert.Contains(t, i.Message, `node "意图识别"'s port "branch_1" not connected`, `node "意图识别"'s port "default" not connected;`)
					}

				}
			}
		})
	})
}

func TestTestResumeWithInputNode(t *testing.T) {
	mockey.PatchConvey("test test_resume with input node", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflow(t, h, "input_receiver.json")

		userInput := map[string]any{
			"input": "user input",
			"obj": map[string]any{
				"field1": []string{"1", "2"},
			},
		}
		userInputStr, err := sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "unused initial input",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		t.Logf("first test run exeID: %s", testRunResp.Data.ExecuteID)

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(*getProcessResp.Data.Reason)
			}

			t.Logf("workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		cancelReq := &workflow.CancelWorkFlowRequest{
			WorkflowID: &idStr,
			SpaceID:    "123",
			ExecuteID:  testRunResp.Data.ExecuteID,
		}

		// cancel after interruption. Won't be able to resume
		_ = post[workflow.CancelWorkFlowResponse](t, h, cancelReq, "/api/workflow_api/cancel")

		getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)
		assert.Equal(t, entity.WorkflowCancel, entity.WorkflowExecuteStatus(getProcessResp.Data.ExecuteStatus))

		t.Logf("start second test run")

		testRunResp = post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("second workflow run: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		testResumeReq.ExecuteID = testRunResp.Data.ExecuteID
		testResumeReq.EventID = interruptEvents[0].ID

		t.Logf("prepare second resume, exeID: %s", testRunResp.Data.ExecuteID)

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		cancelReq = &workflow.CancelWorkFlowRequest{
			WorkflowID: &idStr,
			SpaceID:    "123",
			ExecuteID:  testRunResp.Data.ExecuteID,
		}

		// cancel immediately after resume. Probably will cancel.
		_ = post[workflow.CancelWorkFlowResponse](t, h, cancelReq, "/api/workflow_api/cancel")

		workflowStatus = workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("second workflow cancel after resume. workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		// maybe cancel or success, whichever comes first
		if workflowStatus != workflow.WorkflowExeStatus_Success &&
			workflowStatus != workflow.WorkflowExeStatus_Cancel {
			t.Errorf("workflow status is %s, wfExeStatus is %s", workflowStatus, workflowStatus)
		}

		t.Logf("start third test run")

		testRunResp = post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("third workflow run: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		testResumeReq.ExecuteID = testRunResp.Data.ExecuteID
		testResumeReq.EventID = interruptEvents[0].ID

		t.Logf("prepare third resume, exeID: %s", testRunResp.Data.ExecuteID)

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		var lastResult *workflow.GetWorkFlowProcessData
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			lastResult = getProcessResp.Data
			t.Logf("third workflow resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
		}

		outputMap := map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"input":    "user input",
			"inputArr": nil,
			"field1":   []any{"1", "2"},
		}, outputMap)

		wfID, _ := strconv.ParseInt(idStr, 10, 64)
		sr, err := appworkflow.GetWorkflowDomainSVC().StreamExecuteWorkflow(context.Background(), &entity.WorkflowIdentity{
			ID: wfID,
		}, map[string]any{
			"input": "unused initial input",
		}, vo.ExecuteConfig{})
		assert.NoError(t, err)

		for {
			msg, err := sr.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				t.Error(err)
			}

			t.Log(msg)
		}

		mockey.PatchConvey("node debug the input node", func() {
			nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
				WorkflowID: idStr,
				NodeID:     "154951",
				SpaceID:    ptr.Of("123"),
			}

			nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
			executeID := nodeDebugResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var interruptEvents []*workflow.NodeEvent
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				interruptEvents = getProcessResp.Data.NodeEvents

				workflowStatus = getProcessResp.Data.ExecuteStatus
				t.Logf("node debug input node status: %s, success rate: %s, executeID: %v", workflowStatus, getProcessResp.Data.Rate, executeID)
			}

			testResumeReq := &workflow.WorkflowTestResumeRequest{
				WorkflowID: idStr,
				SpaceID:    ptr.Of("123"),
				ExecuteID:  nodeDebugResp.Data.ExecuteID,
				EventID:    interruptEvents[0].ID,
				Data:       userInputStr,
			}

			_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

			workflowStatus = workflow.WorkflowExeStatus_Running
			interruptEvents = []*workflow.NodeEvent{}
			var output string
			var lastResult *workflow.GetWorkFlowProcessData
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, nodeDebugResp.Data.ExecuteID)

				workflowStatus = getProcessResp.Data.ExecuteStatus
				interruptEvents = getProcessResp.Data.NodeEvents
				output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				lastResult = getProcessResp.Data
				t.Logf("node resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
			}

			outputMap := map[string]any{}
			err = sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"input":    "user input",
				"inputArr": nil,
				"obj": map[string]any{
					"field1": []any{"1", "2"},
				},
			}, outputMap)

			result := getNodeExeHistory(t, h, idStr, executeID, "154951", nil)
			assert.Equal(t, outputMap, mustUnmarshalToMap(t, result.Output))
		})

		mockey.PatchConvey("sync run", func() {
			_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
				WorkflowID:         idStr,
				SpaceID:            "123",
				WorkflowVersion:    ptr.Of("v1.0.0"),
				VersionDescription: ptr.Of("test"),
			}, "api/workflow_api/publish")

			mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
				UserID:      123,
				ConnectorID: consts.APIConnectorID,
			}).Build()

			syncRunReq := &workflow.OpenAPIRunFlowRequest{
				WorkflowID: idStr,
				Parameters: ptr.Of(mustMarshalToString(t, testRunReq.Input)),
				IsAsync:    ptr.Of(false),
			}

			errStr := postWithError(t, h, syncRunReq, "/v1/workflow/run")
			assert.Equal(t, "sync run workflow does not support interrupt/resume", errStr)
		})
	})
}

func TestQueryTypes(t *testing.T) {
	mockey.PatchConvey("test workflow node types", t, func() {
		h, _, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		t.Run("not sub workflow", func(t *testing.T) {
			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			idStr := loadWorkflow(t, h, "query_types/llm_intent_http_nodes.json")

			req := &workflow.QueryWorkflowNodeTypeRequest{
				SpaceID:    "123",
				WorkflowID: idStr,
			}

			response := post[workflow.QueryWorkflowNodeTypeResponse](t, h, req, "/api/workflow_api/node_type")
			assert.Contains(t, response.Data.NodeTypes, "1")
			assert.Contains(t, response.Data.NodeTypes, "2")
			assert.Contains(t, response.Data.NodeTypes, "5")
			assert.Contains(t, response.Data.NodeTypes, "22")
			assert.Contains(t, response.Data.NodeTypes, "45")

			for _, prop := range response.Data.NodesProperties {
				if prop.ID == "100001" {
					assert.False(t, prop.IsEnableChatHistory)
					assert.False(t, prop.IsEnableUserQuery)
					assert.False(t, prop.IsRefGlobalVariable)
				}
				if prop.ID == "900001" || prop.ID == "117367" || prop.ID == "133234" || prop.ID == "163493" {
					assert.False(t, prop.IsEnableChatHistory)
					assert.False(t, prop.IsEnableUserQuery)
					assert.True(t, prop.IsRefGlobalVariable)
				}

			}
		})

		t.Run("loop conditions", func(t *testing.T) {
			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			idStr := loadWorkflow(t, h, "query_types/loop_condition.json")

			req := &workflow.QueryWorkflowNodeTypeRequest{
				SpaceID:    "123",
				WorkflowID: idStr,
			}

			response := post[workflow.QueryWorkflowNodeTypeResponse](t, h, req, "/api/workflow_api/node_type")
			assert.Contains(t, response.Data.NodeTypes, "1")
			assert.Contains(t, response.Data.NodeTypes, "2")
			assert.Contains(t, response.Data.NodeTypes, "21")
			assert.Contains(t, response.Data.NodeTypes, "5")
			assert.Contains(t, response.Data.NodeTypes, "8")

			for _, prop := range response.Data.NodesProperties {
				if prop.ID == "100001" || prop.ID == "900001" || prop.ID == "114884" || prop.ID == "143932" {
					assert.False(t, prop.IsEnableChatHistory)
					assert.False(t, prop.IsEnableUserQuery)
					assert.False(t, prop.IsRefGlobalVariable)
				}
				if prop.ID == "119585" || prop.ID == "170824" {
					assert.False(t, prop.IsEnableChatHistory)
					assert.False(t, prop.IsEnableUserQuery)
					assert.True(t, prop.IsRefGlobalVariable)
				}

			}
		})

		t.Run("has sub workflow", func(t *testing.T) {
			ensureWorkflowVersion(t, h, 7498668117704163337, "v0.0.1",
				"query_types/wf2.json", mockIDGen)

			ensureWorkflowVersion(t, h, 7498674832255615002, "v0.0.1", "query_types/wf2child.json", mockIDGen)

			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			idStr := loadWorkflow(t, h, "query_types/subworkflows.json")

			req := &workflow.QueryWorkflowNodeTypeRequest{
				SpaceID:    "123",
				WorkflowID: idStr,
			}

			response := post[workflow.QueryWorkflowNodeTypeResponse](t, h, req, "/api/workflow_api/node_type")

			assert.Contains(t, response.Data.NodeTypes, "1")
			assert.Contains(t, response.Data.NodeTypes, "2")
			assert.Contains(t, response.Data.NodeTypes, "9")

			assert.Contains(t, response.Data.SubWorkflowNodeTypes, "5")
			assert.Contains(t, response.Data.SubWorkflowNodeTypes, "1")
			assert.Contains(t, response.Data.SubWorkflowNodeTypes, "2")

			for _, prop := range response.Data.NodesProperties {
				if prop.ID == "143310" {
					assert.True(t, prop.IsRefGlobalVariable)
				}
			}

			for _, prop := range response.Data.SubWorkflowNodesProperties {
				if prop.ID == "116972" {
					assert.True(t, prop.IsRefGlobalVariable)
				}
				if prop.ID == "124342" {
					assert.False(t, prop.IsRefGlobalVariable)
				}
			}
		})
	})
}

func TestResumeWithQANode(t *testing.T) {
	mockey.PatchConvey("test test_resume with qa node", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your age?"}`,
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"fields": {"name": "eino", "age": 1}}`,
					}, nil
				}
				return nil, errors.New("not found")
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "qa_with_structured_output.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "what's your name and age?",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		userInput := "my name is eino"

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		previousInterruptEventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != previousInterruptEventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("first resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		userInput = "1 year old"

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		interruptEventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		var lastResult *workflow.GetWorkFlowProcessData
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || (len(interruptEvents) > 0 && interruptEvents[0].ID != interruptEventID) {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			lastResult = getProcessResp.Data
			t.Logf("after second resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
		}

		outputMap := map[string]any{}
		err := sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"USER_RESPONSE": "1 year old",
			"name":          "eino",
			"age":           float64(1),
		}, outputMap)

		chatModel.Reset()

		wfID, _ := strconv.ParseInt(idStr, 10, 64)
		sr, err := appworkflow.GetWorkflowDomainSVC().StreamExecuteWorkflow(context.Background(), &entity.WorkflowIdentity{
			ID: wfID,
		}, map[string]any{
			"input": "what's your name and age?",
		}, vo.ExecuteConfig{})
		assert.NoError(t, err)

		var exeID, eventID int64

		for {
			msg, err := sr.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				t.Error(err)
			}

			if msg.StateMessage != nil {
				exeID = msg.StateMessage.ExecuteID
				if msg.InterruptEvent != nil {
					eventID = msg.InterruptEvent.ID
				}
			}

			t.Log(msg)
		}

		sr, err = appworkflow.GetWorkflowDomainSVC().StreamResumeWorkflow(context.Background(), &entity.ResumeRequest{
			ExecuteID:  exeID,
			EventID:    eventID,
			ResumeData: "my name is eino",
		}, vo.ExecuteConfig{})
		assert.NoError(t, err)

		for {
			msg, err := sr.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				t.Error(err)
			}

			if msg.StateMessage != nil {
				exeID = msg.StateMessage.ExecuteID
				if msg.InterruptEvent != nil {
					eventID = msg.InterruptEvent.ID
				}
			}

			t.Log(msg)
		}

		sr, err = appworkflow.GetWorkflowDomainSVC().StreamResumeWorkflow(context.Background(), &entity.ResumeRequest{
			ExecuteID:  exeID,
			EventID:    eventID,
			ResumeData: "1 year old",
		}, vo.ExecuteConfig{})
		assert.NoError(t, err)

		for {
			msg, err := sr.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				t.Error(err)
			}

			t.Log(msg)
		}
	})
}

func TestNestedSubWorkflowWithInterrupt(t *testing.T) {
	mockey.PatchConvey("test nested sub workflow with interrupt", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel1 := &testutil.UTChatModel{
			StreamResultProvider: func(_ int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				sr := schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
					},
					{
						Role:    schema.Assistant,
						Content: "don't know.",
					},
				})
				return sr, nil
			},
		}

		chatModel2 := &testutil.UTChatModel{
			StreamResultProvider: func(_ int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				sr := schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
					},
					{
						Role:    schema.Assistant,
						Content: "don't know too.",
					},
				})
				return sr, nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1737521813 {
				return chatModel1, nil
			} else {
				return chatModel2, nil
			}
		}).AnyTimes()

		mockIDGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).Times(3)
		topIDStr := loadWorkflow(t, h, "subworkflow/top_workflow.json")

		midIDStr := "7494849202016272435"
		_, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7494849202016272435)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7494849202016272435), nil).Times(3)
			_ = loadWorkflow(t, h, "subworkflow/middle_workflow.json")
		}

		bottomIDStr := "7468899413567684634"
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7468899413567684634)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7468899413567684634), nil).Times(3)
			_ = loadWorkflow(t, h, "subworkflow/bottom_workflow.json")
		}

		inputIDStr := "7469607842648457243"
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7469607842648457243)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7469607842648457243), nil).Times(3)
			_ = loadWorkflow(t, h, "input_receiver.json")
		}

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		t.Logf("topID: %s, midID: %s, bottomID: %s, inputID: %s", topIDStr, midIDStr, bottomIDStr, inputIDStr)

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: topIDStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "hello",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, topIDStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("workflow status: %s, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		userInput := map[string]any{
			"input": "more info 1",
		}
		userInputStr, err := sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: topIDStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, topIDStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("first resume. workflow status: %s, success rate: %s, interruptEvents: %v, nodeKey2Output= %v, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output, getProcessResp.Data.WorkflowExeCost)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		userInput = map[string]any{
			"input": "more info 2",
		}
		userInputStr, err = sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: topIDStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, topIDStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("second resume. workflow status: %s, success rate: %s, interruptEvents: %v, nodeKey2Output= %v, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output, getProcessResp.Data.WorkflowExeCost)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, "I don't know.\nI don't know too.\nb\n['new_a_more info 1', 'new_b_more info 2']", output)
	})
}

func TestInterruptWithinBatch(t *testing.T) {
	mockey.PatchConvey("test interrupt within batch", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(nil, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "batch/batch_with_inner_interrupt.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input_array":       `["a","b"]`,
				"batch_concurrency": "2",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("first execute. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_InputNode, interruptEvents[0].Type)

		exeID, _ := strconv.ParseInt(testRunResp.Data.ExecuteID, 0, 64)
		storeIEs, _ := workflow2.GetRepository().ListInterruptEvents(t.Context(), exeID)
		assert.Equal(t, 2, len(storeIEs))

		userInput := map[string]any{
			"input": "input 1",
		}
		userInputStr, err := sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("first resume. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_InputNode, interruptEvents[0].Type)

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeID)
		assert.Equal(t, 2, len(storeIEs))

		userInput = map[string]any{
			"input": "input 2",
		}
		userInputStr, err = sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("second resume. workflow status: %v, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_Question, interruptEvents[0].Type)

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeID)
		assert.Equal(t, 2, len(storeIEs))

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       "answer 1",
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("third resume. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_Question, interruptEvents[0].Type)

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeID)
		assert.Equal(t, 1, len(storeIEs))

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       "answer 2",
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			for _, nr := range getProcessResp.Data.NodeResults {
				if nr.NodeId == "900001" {
					output = nr.Output
				}
			}

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("third resume. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeID)
		assert.Equal(t, 0, len(storeIEs))

		outputMap := map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)

		if !reflect.DeepEqual(outputMap, map[string]any{
			"output": []any{"answer 1", "answer 2"},
		}) && !reflect.DeepEqual(outputMap, map[string]any{
			"output": []any{"answer 2", "answer 1"},
		}) {
			t.Errorf("output map not equal: %v", outputMap)
		}
	})
}

func TestPublishWorkflow(t *testing.T) {
	mockey.PatchConvey("publish work flow", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflowWithWorkflowName(t, h, "pb_wa", "publish/publish_workflow.json")

		listResponse := post[workflow.GetWorkFlowListResponse](t, h, &workflow.GetWorkFlowListRequest{
			Page:    ptr.Of(int32(1)),
			Size:    ptr.Of(int32(10)),
			Type:    ptr.Of(workflow.WorkFlowType_User),
			Status:  ptr.Of(workflow.WorkFlowListStatus_UnPublished),
			Name:    ptr.Of("pb_wa"),
			SpaceID: ptr.Of("123"),
		}, "/api/workflow_api/workflow_list")

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))

		publishReq := &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			SpaceID:            "123",
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("version v0.1.1"),
		}
		response := post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")
		assert.Equal(t, response.Data.WorkflowID, idStr)

		listResponse = post[workflow.GetWorkFlowListResponse](t, h, &workflow.GetWorkFlowListRequest{
			Page:    ptr.Of(int32(1)),
			Size:    ptr.Of(int32(10)),
			SpaceID: ptr.Of("123"),
			Type:    ptr.Of(workflow.WorkFlowType_User),
			Status:  ptr.Of(workflow.WorkFlowListStatus_HadPublished),
			Name:    ptr.Of("pb_w"),
		}, "/api/workflow_api/workflow_list")

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))

		publishReq = &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			SpaceID:            "123",
			WorkflowVersion:    ptr.Of("v0.0.2"),
			VersionDescription: ptr.Of("version v0.1.1"),
		}
		response = post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")
		assert.Equal(t, response.Data.WorkflowID, idStr)

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: idStr,
			SpaceID:    "123",
		}
		_ = post[workflow.DeleteWorkflowResponse](t, h, deleteReq, "/api/workflow_api/delete")
	})
}

func TestGetCanvasInfo(t *testing.T) {
	mockey.PatchConvey("test get canvas info", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflow(t, h, "get_canvas/get_canvas.json")

		getCanvas := &workflow.GetCanvasInfoRequest{
			SpaceID:    "123",
			WorkflowID: ptr.Of(idStr),
		}

		response := post[workflow.GetCanvasInfoResponse](t, h, getCanvas, "/api/workflow_api/canvas")

		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanNotSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "input_v1",
				"e":     "e",
			},
		}

		testRunResponse := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")
		workflowStatus := workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}
			getProcessResp := getProcess(t, h, idStr, testRunResponse.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		getCanvas = &workflow.GetCanvasInfoRequest{
			SpaceID:    "123",
			WorkflowID: ptr.Of(idStr),
		}

		time.Sleep(time.Second)

		response = post[workflow.GetCanvasInfoResponse](t, h, getCanvas, "/api/workflow_api/canvas")

		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)

		publishReq := &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("version v0.1.1"),
			SpaceID:            "123",
		}
		_ = post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")

		response = post[workflow.GetCanvasInfoResponse](t, h, getCanvas, "/api/workflow_api/canvas")

		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_HadSubmit)

		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Publish)

		data, err := os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", "get_canvas/get_canvas.json"))
		assert.NoError(t, err)

		saveReq := &workflow.SaveWorkflowRequest{
			WorkflowID: idStr,
			Schema:     ptr.Of(string(data)),
			SpaceID:    ptr.Of("123"),
		}

		_ = post[workflow.SaveWorkflowResponse](t, h, saveReq, "/api/workflow_api/save")
		response = post[workflow.GetCanvasInfoResponse](t, h, getCanvas, "/api/workflow_api/canvas")
		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)

		data, err = os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", "get_canvas/get_canvas_modify.json"))
		assert.NoError(t, err)

		saveReq = &workflow.SaveWorkflowRequest{
			WorkflowID: idStr,
			Schema:     ptr.Of(string(data)),
			SpaceID:    ptr.Of("123"),
		}

		_ = post[workflow.SaveWorkflowResponse](t, h, saveReq, "/api/workflow_api/save")

		response = post[workflow.GetCanvasInfoResponse](t, h, getCanvas, "/api/workflow_api/canvas")

		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanNotSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)
	})
}

func TestUpdateWorkflowMeta(t *testing.T) {
	mockey.PatchConvey("update workflow meta", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflow(t, h, "entry_exit.json")

		updateMetaReq := &workflow.UpdateWorkflowMetaRequest{
			WorkflowID: idStr,
			Name:       ptr.Of("modify_name"),
			SpaceID:    "123",
			Desc:       ptr.Of("modify_desc"),
			IconURI:    ptr.Of("modify_icon_uri"),
		}

		_ = post[workflow.UpdateWorkflowMetaResponse](t, h, updateMetaReq, "/api/workflow_api/update_meta")

		getCanvas := &workflow.GetCanvasInfoRequest{
			SpaceID:    "123",
			WorkflowID: ptr.Of(idStr),
		}

		response := post[workflow.GetCanvasInfoResponse](t, h, getCanvas, "/api/workflow_api/canvas")
		assert.Equal(t, response.Data.Workflow.Name, "modify_name")
		assert.Equal(t, response.Data.Workflow.Desc, "modify_desc")
		assert.Equal(t, response.Data.Workflow.IconURI, "modify_icon_uri")
	})
}

func TestSimpleInvokableToolWithReturnVariables(t *testing.T) {
	mockey.PatchConvey("simple invokable tool with return variables", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		ensureWorkflowVersion(t, h, 7492075279843737651, "v0.0.1", "function_call/tool_workflow_1.json", mockIDGen)

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role: schema.Assistant,
						ToolCalls: []schema.ToolCall{
							{
								ID: "1",
								Function: schema.FunctionCall{
									Name:      "ts_test_wf_test_wf",
									Arguments: "{}",
								},
							},
						},
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     10,
								CompletionTokens: 11,
								TotalTokens:      21,
							},
						},
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "final_answer",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     5,
								CompletionTokens: 6,
								TotalTokens:      11,
							},
						},
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "function_call/llm_with_workflow_as_tool.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "this is the user input",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var output string
		var lastResult *workflow.GetWorkflowProcessResponse
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			if len(getProcessResp.Data.NodeResults) > 0 {
				output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				lastResult = getProcessResp
			}
			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		outputMap := map[string]any{}
		err := sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": "final_answer",
		}, outputMap)

		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)

		assert.NotNil(t, lastResult.Data.TokenAndCost)
		assert.Equal(t, "15 Tokens", lastResult.Data.TokenAndCost.GetInputTokens())
		assert.Equal(t, "17 Tokens", lastResult.Data.TokenAndCost.GetOutputTokens())
		assert.Equal(t, "32 Tokens", lastResult.Data.TokenAndCost.GetTotalTokens())

		chatModel.Reset()

		defer func() {
			_ = h.Close()
		}()

		go func() {
			_ = h.Run()
		}()

		input := map[string]any{
			"input": "hello",
		}
		inputStr, _ := sonic.MarshalString(input)

		_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v1.0.0"),
			VersionDescription: ptr.Of("desc"),
			SpaceID:            "123",
		}, "api/workflow_api/publish")

		streamRunReq := &workflow.OpenAPIRunFlowRequest{
			WorkflowID: idStr,
			Parameters: ptr.Of(inputStr),
		}

		mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
			UserID:      123,
			ConnectorID: consts.APIConnectorID,
		}).Build()
		sseReader := postSSE(t, streamRunReq, "/v1/workflow/stream_run")
		err = sseReader.ForEach(t.Context(), func(e *sse.Event) error {
			t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
			return nil
		})
		assert.NoError(t, err)
	})
}

func TestReturnDirectlyStreamableTool(t *testing.T) {
	mockey.PatchConvey("return directly streamable tool", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		outerModel := &testutil.UTChatModel{
			StreamResultProvider: func(index int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				if index == 0 {
					return schema.StreamReaderFromArray([]*schema.Message{
						{
							Role: schema.Assistant,
							ToolCalls: []schema.ToolCall{
								{
									ID: "1",
									Function: schema.FunctionCall{
										Name:      "ts_test_wf_test_wf",
										Arguments: `{"input": "input for inner model"}`,
									},
								},
							},
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									PromptTokens:     10,
									CompletionTokens: 11,
									TotalTokens:      21,
								},
							},
						},
					}), nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}

		innerModel := &testutil.UTChatModel{
			StreamResultProvider: func(index int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				if index == 0 {
					return schema.StreamReaderFromArray([]*schema.Message{
						{
							Role:    schema.Assistant,
							Content: "I ",
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									PromptTokens:     5,
									CompletionTokens: 6,
									TotalTokens:      11,
								},
							},
						},
						{
							Role:    schema.Assistant,
							Content: "don't know",
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									CompletionTokens: 8,
									TotalTokens:      8,
								},
							},
						},
						{
							Role:    schema.Assistant,
							Content: ".",
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									CompletionTokens: 2,
									TotalTokens:      2,
								},
							},
						},
					}), nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1706077826 {
				innerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return innerModel, nil
			} else {
				outerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return outerModel, nil
			}
		}).AnyTimes()

		ensureWorkflowVersion(t, h, 7492615435881709608, "v0.0.1", "function_call/tool_workflow_2.json", mockIDGen)

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		idStr := loadWorkflow(t, h, "function_call/llm_workflow_stream_tool.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "this is the user input",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			if len(getProcessResp.Data.NodeResults) > 0 {
				output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			}

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(getProcessResp.Data.Reason)
			}
			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, "this is the streaming output I don't know.", output)
		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)

		outerModel.Reset()
		innerModel.Reset()

		defer func() {
			_ = h.Close()
		}()

		go func() {
			_ = h.Run()
		}()

		input := map[string]any{
			"input": "hello",
		}
		inputStr, _ := sonic.MarshalString(input)

		_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v1.0.0"),
			VersionDescription: ptr.Of("desc"),
			SpaceID:            "123",
		}, "api/workflow_api/publish")

		streamRunReq := &workflow.OpenAPIRunFlowRequest{
			WorkflowID: idStr,
			Parameters: ptr.Of(inputStr),
		}

		mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
			UserID:      123,
			ConnectorID: consts.APIConnectorID,
		}).Build()
		sseReader := postSSE(t, streamRunReq, "/v1/workflow/stream_run")
		err := sseReader.ForEach(t.Context(), func(e *sse.Event) error {
			t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
			return nil
		})
		assert.NoError(t, err)
	})
}

func TestSimpleInterruptibleTool(t *testing.T) {
	mockey.PatchConvey("test simple interruptible tool", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		ensureWorkflowVersion(t, h, 7492075279843737652, "v0.0.1", "input_receiver.json", mockIDGen)

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role: schema.Assistant,
						ToolCalls: []schema.ToolCall{
							{
								ID: "1",
								Function: schema.FunctionCall{
									Name:      "ts_test_wf_test_wf",
									Arguments: "{}",
								},
							},
						},
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "final_answer",
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "function_call/llm_with_workflow_as_tool_1.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "this is the user input",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)
			interruptEvents = getProcessResp.Data.NodeEvents

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		userInput := map[string]any{
			"input": "user input",
			"obj": map[string]any{
				"field1": []string{"1", "2"},
			},
		}
		userInputStr, err := sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		var lastResult *workflow.GetWorkFlowProcessData
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			lastResult = getProcessResp.Data

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(*getProcessResp.Data.Reason)
			}

			t.Logf("workflow resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
		}

		outputMap := map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": "final_answer",
		}, outputMap)

		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)
	})
}

func TestStreamableToolWithMultipleInterrupts(t *testing.T) {
	mockey.PatchConvey("return directly streamable tool with multiple interrupts", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		outerModel := &testutil.UTChatModel{
			StreamResultProvider: func(index int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				if index == 0 {
					return schema.StreamReaderFromArray([]*schema.Message{
						{
							Role: schema.Assistant,
							ToolCalls: []schema.ToolCall{
								{
									ID: "1",
									Function: schema.FunctionCall{
										Name:      "ts_test_wf_test_wf",
										Arguments: `{"input": "what's your name and age"}`,
									},
								},
							},
						},
					}), nil
				} else if index == 1 {
					return schema.StreamReaderFromArray([]*schema.Message{
						{
							Role:    schema.Assistant,
							Content: "I now know your ",
						},
						{
							Role:    schema.Assistant,
							Content: "name is Eino and age is 1.",
						},
					}), nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}

		innerModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your age?"}`,
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"fields": {"name": "eino", "age": 1}}`,
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1706077827 {
				outerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return outerModel, nil
			} else {
				innerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return innerModel, nil
			}
		}).AnyTimes()

		ensureWorkflowVersion(t, h, 7492615435881709611, "v0.0.1", "function_call/tool_workflow_3.json", mockIDGen)

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		idStr := loadWorkflow(t, h, "function_call/llm_workflow_stream_tool_1.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "this is the user input",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		userInput := "my name is eino"

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("first resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		userInput = "1 year old"

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		interruptEventID := interruptEvents[0].ID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		var lastResult *workflow.GetWorkFlowProcessData
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || (len(interruptEvents) > 0 && interruptEvents[0].ID != interruptEventID) {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			lastResult = getProcessResp.Data
			t.Logf("after second resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
		}

		assert.Equal(t, "the name is eino, age is 1", output)
		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)
	})
}

func TestNodeWithBatchEnabled(t *testing.T) {
	mockey.PatchConvey("test node with batch enabled", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		ensureWorkflowVersion(t, h, 7469707607914217512, "v0.0.1", "batch/sub_workflow_as_batch.json", mockIDGen)

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "answer。for index 0",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     5,
								CompletionTokens: 6,
								TotalTokens:      11,
							},
						},
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "answer，for index 1",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     5,
								CompletionTokens: 6,
								TotalTokens:      11,
							},
						},
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "batch/node_batches.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": `["first input", "second input"]`,
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var output string
		// TODO: verify the tokens
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			for _, nr := range getProcessResp.Data.NodeResults {
				if nr.NodeId == "900001" {
					output = nr.Output
				}
			}

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Fatal(*getProcessResp.Data.Reason)
			}

			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		outputMap := map[string]any{}
		err := sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": []any{
				map[string]any{
					"output": []any{
						"answer",
						"for index 0",
					},
					"input": "answer。for index 0",
				},
				map[string]any{
					"output": []any{
						"answer",
						"for index 1",
					},
					"input": "answer，for index 1",
				},
			},
		}, outputMap)

		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)

		result := getNodeExeHistory(t, h, idStr, "", "100001", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.True(t, len(result.Output) > 0)

		mockey.PatchConvey("test node debug with batch mode", func() {
			nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
				WorkflowID: idStr,
				NodeID:     "178876", // this is the sub workflow node
				Batch:      map[string]string{"item1": `[{"output":"output_1"},{"output":"output_2"}]`},
				SpaceID:    ptr.Of("123"),
			}

			nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
			executeID := nodeDebugResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string
			var lastResp *workflow.GetWorkFlowProcessData
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}

				workflowStatus = getProcessResp.Data.ExecuteStatus
				if workflowStatus == workflow.WorkflowExeStatus_Fail {
					t.Fatal(*getProcessResp.Data.Reason)
				} else if workflowStatus == workflow.WorkflowExeStatus_Success {
					lastResp = getProcessResp.Data
				}
				t.Logf("run sub-workflow node in batch mode status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

			_ = lastResp

			outputMap := map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"outputList": []any{
					map[string]any{
						"input":  "output_1",
						"output": []any{"output_1"},
					},
					map[string]any{
						"input":  "output_2",
						"output": []any{"output_2"},
					},
				},
			}, outputMap)

			result := getNodeExeHistory(t, h, idStr, executeID, "178876", nil)
			assert.Equal(t, outputMap, mustUnmarshalToMap(t, result.Output))

			result = getNodeExeHistory(t, h, idStr, testRunResp.Data.ExecuteID, "178876", nil)
			assert.True(t, len(result.Output) > 0)

			result = getNodeExeHistory(t, h, idStr, "", "178876", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
			assert.Equal(t, outputMap, mustUnmarshalToMap(t, result.Output))
		})
	})
}

func TestAggregateStreamVariables(t *testing.T) {
	mockey.PatchConvey("test aggregate stream variables", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		cm1 := &testutil.UTChatModel{
			StreamResultProvider: func(index int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				return schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     5,
								CompletionTokens: 6,
								TotalTokens:      11,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: "won't tell",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								CompletionTokens: 8,
								TotalTokens:      8,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: " you.",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								CompletionTokens: 2,
								TotalTokens:      2,
							},
						},
					},
				}), nil
			},
		}

		cm2 := &testutil.UTChatModel{
			StreamResultProvider: func(index int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				return schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     5,
								CompletionTokens: 6,
								TotalTokens:      11,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: "don't know",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								CompletionTokens: 8,
								TotalTokens:      8,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: ".",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								CompletionTokens: 2,
								TotalTokens:      2,
							},
						},
					},
				}), nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1737521813 {
				cm1.ModelType = strconv.FormatInt(params.ModelType, 10)
				return cm1, nil
			} else {
				cm2.ModelType = strconv.FormatInt(params.ModelType, 10)
				return cm2, nil
			}
		}).AnyTimes()

		mockUserVarStore := mockvar.NewMockStore(ctrl)
		mockUserVarStore.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil).AnyTimes()
		mockey.Mock(variable.GetVariableHandler).Return(&variable.Handler{
			UserVarStore: mockUserVarStore,
		}).Build()

		idStr := loadWorkflow(t, h, "variable_aggregate/aggregate_streams.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"input": "I've got an important question",
			},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			if len(getProcessResp.Data.NodeResults) > 0 {
				output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			}

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(*getProcessResp.Data.Reason)
			}
			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, "I won't tell you.\nI won't tell you.\n{'Group1': 'I won't tell you.', 'input': 'I've got an important question'}", output)
		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)

		wfID, _ := strconv.ParseInt(idStr, 10, 64)
		ctx := t.Context()
		sr, err := appworkflow.GetWorkflowDomainSVC().StreamExecuteWorkflow(ctx, &entity.WorkflowIdentity{
			ID: wfID,
		}, map[string]any{
			"input": "I've got an important question",
		}, vo.ExecuteConfig{})
		assert.NoError(t, err)

		for {
			msg, err := sr.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				t.Error(err)
			}

			t.Log(msg)
		}
	})
}

func TestListWorkflowAsToolData(t *testing.T) {
	mockey.PatchConvey("publish list workflow & list workflow as tool data", t, func() {
		h, _, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		id := time.Now().UnixMilli()
		idStr := strconv.FormatInt(id, 10)

		mockIDGen.EXPECT().GenID(gomock.Any()).Return(id, nil).Times(3)

		loadWorkflowWithWorkflowName(t, h, "pb_wf"+idStr, "publish/publish_workflow.json")

		listResponse := post[workflow.GetWorkFlowListResponse](t, h, &workflow.GetWorkFlowListRequest{
			Page:    ptr.Of(int32(1)),
			Size:    ptr.Of(int32(10)),
			Type:    ptr.Of(workflow.WorkFlowType_User),
			Status:  ptr.Of(workflow.WorkFlowListStatus_UnPublished),
			Name:    ptr.Of("pb_wf" + idStr),
			SpaceID: ptr.Of("123"),
		}, "/api/workflow_api/workflow_list")

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))
		//
		publishReq := &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("version v0.1.1"),
			SpaceID:            "123",
		}

		_ = post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")

		toolInfoList, err := appworkflow.GetWorkflowDomainSVC().ListWorkflowAsToolData(context.Background(), int64(123), &vo.QueryToolInfoOption{
			IDs: []int64{id},
		})

		assert.NoError(t, err)
		assert.Equal(t, 1, len(toolInfoList))
		assert.Equal(t, "v0.0.1", toolInfoList[0].VersionName)
		assert.Equal(t, "input", toolInfoList[0].InputParams[0].Name)
		assert.Equal(t, "obj", toolInfoList[0].InputParams[1].Name)
		assert.Equal(t, "field1", toolInfoList[0].InputParams[1].Properties[0].Name)
		assert.Equal(t, "arr", toolInfoList[0].InputParams[2].Name)
		assert.Equal(t, vo.DataTypeString, toolInfoList[0].InputParams[2].ElemTypeInfo.Type)

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: idStr,
			SpaceID:    "123",
		}
		_ = post[workflow.DeleteWorkflowResponse](t, h, deleteReq, "/api/workflow_api/delete")
	})
}

func TestWorkflowDetailAndDetailInfo(t *testing.T) {
	mockey.PatchConvey("workflow detail & detail info", t, func() {
		h, _, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		id := time.Now().UnixMilli()
		idStr := strconv.FormatInt(id, 10)

		mockIDGen.EXPECT().GenID(gomock.Any()).Return(id, nil).Times(3)

		loadWorkflowWithWorkflowName(t, h, "pb_wf"+idStr, "publish/publish_workflow.json")

		detailReq := &workflow.GetWorkflowDetailRequest{
			WorkflowIds: []string{idStr},
			SpaceID:     ptr.Of("123"),
		}

		response := post[map[string]any](t, h, detailReq, "/api/workflow_api/workflow_detail")
		assert.Equal(t, 1, len((*response)["data"].([]any)))

		publishReq := &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("version v0.1.1"),
			SpaceID:            "123",
		}

		_ = post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")

		publishReq = &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v0.0.2"),
			VersionDescription: ptr.Of("version v0.0.2"),
			SpaceID:            "123",
		}

		_ = post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")

		detailInfoReq := &workflow.GetWorkflowDetailInfoRequest{
			WorkflowFilterList: []*workflow.WorkflowFilter{
				{WorkflowID: idStr},
			},
			SpaceID: ptr.Of("123"),
		}

		detailInfoResponse := post[map[string]any](t, h, detailInfoReq, "/api/workflow_api/workflow_detail_info")

		assert.Equal(t, 1, len((*detailInfoResponse)["data"].([]any)))
		assert.Equal(t, "v0.0.2", (*detailInfoResponse)["data"].([]any)[0].(map[string]any)["latest_flow_version"].(string))
		assert.Equal(t, "version v0.0.2", (*detailInfoResponse)["data"].([]any)[0].(map[string]any)["latest_flow_version_desc"].(string))
		assert.Equal(t, float64(1), (*detailInfoResponse)["data"].([]any)[0].(map[string]any)["end_type"].(float64))

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: idStr,
			SpaceID:    "123",
		}
		_ = post[workflow.DeleteWorkflowResponse](t, h, deleteReq, "/api/workflow_api/delete")
	})
}

func TestParallelInterrupts(t *testing.T) {
	mockey.PatchConvey("test parallel interrupts", t, func() {
		defer time.Sleep(time.Second)
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()
		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel1 := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your age?"}`,
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"fields": {"user_name": "eino", "user_age": 1}}`,
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}
		chatModel2 := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your gender?"}`,
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"fields": {"nationality": "China", "gender": "prefer not to say"}}`,
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1737521813 {
				return chatModel1, nil
			} else {
				return chatModel2, nil
			}
		}).AnyTimes()

		idStr := loadWorkflow(t, h, "parallel_interrupt.json")

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input:      map[string]string{},
		}

		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		inputNodeUserInput := map[string]any{
			"input": "this is the user input",
		}

		inputStr, _ := sonic.MarshalString(inputNodeUserInput)

		qa1NodeID := "107234"
		qa2NodeID := "157915"
		inputNodeID := "162226"
		_ = inputNodeID
		interruptedNode := interruptEvents[0].NodeID
		var qa1, qa2, inputN bool
		qa1 = interruptedNode == qa1NodeID
		qa2 = interruptedNode == qa2NodeID
		if !qa1 && !qa2 {
			t.Fatal("interrupted node neither qa1 or qa2, nodeID: ", interruptedNode)
		}

		qa1Answer := "my name is eino."
		qa2Answer := "I'm from China."

		userInput := ternary.IFElse(qa1, qa1Answer, qa2Answer)

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID := testResumeReq.EventID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("first resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		var qa1Count, qa2Count, inputCount int
		if qa1 {
			qa1Count++
		} else {
			qa2Count++
		}

		interruptedNode = interruptEvents[0].NodeID
		qa1 = interruptedNode == qa1NodeID
		qa2 = interruptedNode == qa2NodeID
		if !qa1 && !qa2 {
			t.Fatal("interrupted node neither qa1 or qa2, nodeID: ", interruptedNode)
		}

		if qa1 {
			if qa1Count == 0 {
				t.Fatal("previously resumed qa1, but now resuming qa2")
			} else {
				userInput = "my age is 1"
			}
		} else {
			if qa2Count == 0 {
				t.Fatal("previously resumed qa2, but not resuming qa1 ")
			} else {
				userInput = "I prefer not to say my gender"
			}
		}

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = testResumeReq.EventID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("second resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		if qa1 {
			qa1Count++
		} else {
			qa2Count++
		}

		interruptedNode = interruptEvents[0].NodeID
		qa1 = interruptedNode == qa1NodeID
		qa2 = interruptedNode == qa2NodeID
		inputN = interruptedNode == inputNodeID

		if qa1 {
			if qa1Count == 0 {
				userInput = "my name is eino"
			} else {
				t.Fatal("qa1 should already been resumed twice and done")
			}
		} else if qa2 {
			if qa2Count == 0 {
				userInput = "I'm from China"
			} else {
				t.Fatal("qa2 should already been resumed twice and done")
			}
		} else if inputN {
			userInput = inputStr
		}

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = testResumeReq.EventID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("third resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		if qa1 {
			qa1Count++
		} else if qa2 {
			qa2Count++
		} else {
			inputCount++
		}

		interruptedNode = interruptEvents[0].NodeID
		qa1 = interruptedNode == qa1NodeID
		qa2 = interruptedNode == qa2NodeID
		inputN = interruptedNode == inputNodeID

		if qa1 {
			if qa1Count == 1 {
				userInput = "my age is 1"
			} else {
				t.Fatal("we should be resuming from previously resumed qa1")
			}
		} else if qa2 {
			if qa2Count == 1 {
				userInput = "I prefer not to say my gender"
			} else {
				t.Fatal("we should be resuming from previously resumed qa2")
			}
		} else if inputN {
			t.Fatal("we should either resume input node previously, or during next resume")
		}

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = testResumeReq.EventID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("fourth resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		if qa1 {
			qa1Count++
		} else if qa2 {
			qa2Count++
		} else {
			inputCount++
		}

		interruptedNode = interruptEvents[0].NodeID
		qa1 = interruptedNode == qa1NodeID
		qa2 = interruptedNode == qa2NodeID
		inputN = interruptedNode == inputNodeID

		if qa1 {
			if qa1Count == 1 {
				userInput = "my age is 1"
			} else {
				t.Fatal("we should be resuming from previously resumed qa1")
			}
		} else if qa2 {
			if qa2Count == 1 {
				userInput = "I prefer not to say my gender"
			} else {
				t.Fatal("we should be resuming from previously resumed qa2")
			}
		} else if inputN {
			if inputCount > 0 {
				t.Fatal("input node resumed more than once")
			}
			userInput = inputStr
		}

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		eventID = testResumeReq.EventID
		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 && interruptEvents[0].ID != eventID {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(*getProcessResp.Data.Reason)
			}

			t.Logf("fifth resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		outputMap := map[string]any{}
		err := sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"gender":      "prefer not to say",
			"user_input":  "this is the user input",
			"user_name":   "eino",
			"user_age":    float64(1),
			"nationality": "China",
		}, outputMap)
	})
}

func TestInputComplex(t *testing.T) {
	mockey.PatchConvey("test input complex", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflow(t, h, "input_complex.json")
		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input:      map[string]string{},
		}
		testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

		workflowStatus := workflow.WorkflowExeStatus_Running
		var interruptEvents []*workflow.NodeEvent
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(*getProcessResp.Data.Reason)
			}

			t.Logf("first run, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		userInput := map[string]any{
			"input":      `{"name": "eino", "age": 1}`,
			"input_list": `[{"name":"user_1"},{"age":2}]`,
		}
		userInputStr, err := sonic.MarshalString(userInput)
		assert.NoError(t, err)

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInputStr,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		workflowStatus = workflow.WorkflowExeStatus_Running
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Error(*getProcessResp.Data.Reason)
			}

			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			t.Logf("after resume. workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, workflow.WorkflowExeStatus_Success, workflowStatus)
		outputMap := map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": map[string]any{
				"name": "eino",
				"age":  float64(1),
			},
			"output_list": []any{
				map[string]any{
					"name": "user_1",
					"age":  float64(0), // TODO: this is different to online behavior which is nil
				},
				map[string]any{
					"name": "", // TODO: this is different to online behavior which is nil
					"age":  float64(2),
				},
			},
		}, outputMap)
	})
}

func TestLLMWithSkills(t *testing.T) {
	mockey.PatchConvey("workflow llm node with plugin", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		utChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					inputs := map[string]any{
						"title":        "梦到蛇",
						"object_input": map[string]any{"t1": "value"},
						"string_input": "input_string",
					}
					args, _ := sonic.MarshalString(inputs)
					return &schema.Message{
						Role: schema.Assistant,
						ToolCalls: []schema.ToolCall{
							{
								ID: "1",
								Function: schema.FunctionCall{
									Name:      "xz_zgjm",
									Arguments: args,
								},
							},
						},
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     10,
								CompletionTokens: 11,
								TotalTokens:      21,
							},
						},
					}, nil

				} else if index == 1 {
					toolResult := map[string]any{}
					err := sonic.UnmarshalString(in[len(in)-1].Content, &toolResult)
					assert.NoError(t, err)
					assert.Equal(t, "ok", toolResult["data"])

					return &schema.Message{
						Role:    schema.Assistant,
						Content: `黑色通常关联着负面、消极`,
					}, nil
				}
				return nil, fmt.Errorf("unexpected index: %d", index)
			},
		}

		mockModelMgr := mockmodel.NewMockManager(ctrl)
		mockModelMgr.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(utChatModel, nil).AnyTimes()

		mPlugin := mockPlugin.NewMockPluginService(ctrl)

		mPlugin.EXPECT().ExecuteTool(gomock.Any(), gomock.Any(), gomock.Any()).Return(&pluginservice.ExecuteToolResponse{
			TrimmedResp: `{"data":"ok","err_msg":"error","data_structural":{"content":"ok","title":"title","weburl":"weburl"}}`,
		}, nil).AnyTimes()

		mPlugin.EXPECT().MGetOnlinePlugins(gomock.Any(), gomock.Any()).Return([]*pluginentity.PluginInfo{
			{PluginInfo: &pluginModel.PluginInfo{ID: 7509353177339133952}},
		}, nil).AnyTimes()

		mPlugin.EXPECT().MGetDraftPlugins(gomock.Any(), gomock.Any()).Return([]*pluginentity.PluginInfo{{
			PluginInfo: &pluginModel.PluginInfo{ID: 7509353177339133952},
		}}, nil).AnyTimes()

		operationString := `{
  "summary" : "根据输入的解梦标题给出相关对应的解梦内容，如果返回的内容为空，给用户返回固定的话术：如果想了解自己梦境的详细解析，需要给我详细的梦见信息，例如： 梦见XXX",
  "operationId" : "xz_zgjm",
  "parameters" : [ {
    "description" : "查询解梦标题，例如：梦见蛇",
    "in" : "query",
    "name" : "title",
    "required" : true,
    "schema" : {
      "description" : "查询解梦标题，例如：梦见蛇",
      "type" : "string"
    }
  } ],
  "requestBody" : {
    "content" : {
      "application/json" : {
        "schema" : {
          "type" : "object"
        }
      }
    }
  },
  "responses" : {
    "200" : {
      "content" : {
        "application/json" : {
          "schema" : {
            "properties" : {
              "data" : {
                "description" : "返回数据",
                "type" : "string"
              },
              "data_structural" : {
                "description" : "返回数据结构",
                "properties" : {
                  "content" : {
                    "description" : "解梦内容",
                    "type" : "string"
                  },
                  "title" : {
                    "description" : "解梦标题",
                    "type" : "string"
                  },
                  "weburl" : {
                    "description" : "当前内容关联的页面地址",
                    "type" : "string"
                  }
                },
                "type" : "object"
              },
              "err_msg" : {
                "description" : "错误提示",
                "type" : "string"
              }
            },
            "required" : [ "data", "data_structural" ],
            "type" : "object"
          }
        }
      },
      "description" : "new desc"
    },
    "default" : {
      "description" : ""
    }
  }
}`

		operation := &pluginModel.Openapi3Operation{}
		_ = sonic.UnmarshalString(operationString, operation)

		mPlugin.EXPECT().MGetOnlineTools(gomock.Any(), gomock.Any()).Return([]*pluginentity.ToolInfo{
			{ID: int64(7509353598782816256), Operation: operation},
		}, nil).AnyTimes()

		mPlugin.EXPECT().MGetDraftTools(gomock.Any(), gomock.Any()).Return([]*pluginentity.ToolInfo{
			{ID: int64(7509353598782816256), Operation: operation},
		}, nil).AnyTimes()

		mockTos := storageMock.NewMockStorage(ctrl)
		mockTos.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any(), gomock.Any()).Return("", nil).AnyTimes()
		toolSrv := crossplugin.NewToolService(mPlugin, mockTos)

		plugin.SetToolService(toolSrv)
		model.SetManager(mockModelMgr)

		t.Run("llm with plugin tool", func(t *testing.T) {
			idStr := loadWorkflow(t, h, "llm_node_with_skills/llm_node_with_plugin_tool.json")

			testRunReq := &workflow.WorkFlowTestRunRequest{
				WorkflowID: idStr,
				SpaceID:    ptr.Of("123"),
				Input: map[string]string{
					"e": "mmmm",
				},
			}

			testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string

			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}
				getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

				bs, _ := sonic.MarshalString(getProcessResp)
				fmt.Println("getProcessResp", bs)

				workflowStatus = getProcessResp.Data.ExecuteStatus
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}
				t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}
			assert.Equal(t, `{"output":"mmmm"}`, output)
		})
	})

	mockey.PatchConvey("workflow llm node with workflow as tool", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()
		utChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					inputs := map[string]any{
						"input_string": "input_string",
						"input_object": map[string]any{"t1": "value"},
						"input_number": 123,
					}
					args, _ := sonic.MarshalString(inputs)
					return &schema.Message{
						Role: schema.Assistant,
						ToolCalls: []schema.ToolCall{
							{
								ID: "1",
								Function: schema.FunctionCall{
									Name:      fmt.Sprintf("ts_%s_%s", "test_wf", "test_wf"),
									Arguments: args,
								},
							},
						},
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     10,
								CompletionTokens: 11,
								TotalTokens:      21,
							},
						},
					}, nil

				} else if index == 1 {
					result := make(map[string]any)
					err := sonic.UnmarshalString(in[len(in)-1].Content, &result)
					assert.Nil(t, err)
					assert.Equal(t, nil, result["output_object"])
					assert.Equal(t, "input_string", result["output_string"])
					assert.Equal(t, float64(123), result["output_number"])
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `output_data`,
					}, nil
				}
				return nil, fmt.Errorf("unexpected index: %d", index)
			},
		}

		mockModelMgr := mockmodel.NewMockManager(ctrl)
		mockModelMgr.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(utChatModel, nil).AnyTimes()

		model.SetManager(mockModelMgr)

		t.Run("llm with workflow tool", func(t *testing.T) {
			ensureWorkflowVersion(t, h, 7509120431183544356, "v0.0.1", "llm_node_with_skills/llm_workflow_as_tool.json", mockIDGen)

			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			idStr := loadWorkflow(t, h, "llm_node_with_skills/llm_node_with_workflow_tool.json")

			testRunReq := &workflow.WorkFlowTestRunRequest{
				WorkflowID: idStr,
				SpaceID:    ptr.Of("123"),
				Input: map[string]string{
					"input_string": "ok_input_string",
				},
			}

			testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string

			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}
				getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

				bs, _ := sonic.MarshalString(getProcessResp)
				fmt.Println("getProcessResp", bs)

				workflowStatus = getProcessResp.Data.ExecuteStatus
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}
				t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, `{"output":"output_data"}`, output)
		})
	})

	mockey.PatchConvey("workflow llm node with knowledge skill", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()
		utChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					assert.Equal(t, 1, len(in))
					assert.Contains(t, in[0].Content, "7512369185624686592", "你是一个知识库意图识别AI Agent", "北京有哪些著名的景点")
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "7512369185624686592",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     10,
								CompletionTokens: 11,
								TotalTokens:      21,
							},
						},
					}, nil

				} else if index == 1 {
					assert.Equal(t, 2, len(in))
					for _, message := range in {
						if message.Role == schema.System {
							assert.Equal(t, "你是一个旅游推荐专家，通过用户提出的问题，推荐用户具体城市的旅游景点", message.Content)
						}
						if message.Role == schema.User {
							assert.Contains(t, message.Content, "天安门广场 ‌：中国政治文化中心，见证了近现代重大历史事件‌", "八达岭长城 ‌：明代长城的精华段，被誉为“不到长城非好汉")
						}
					}
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `八达岭长城 ‌：明代长城的精华段，被誉为“不到长城非好汉‌`,
					}, nil
				}
				return nil, fmt.Errorf("unexpected index: %d", index)
			},
		}

		mockModelMgr := mockmodel.NewMockManager(ctrl)
		mockModelMgr.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(utChatModel, nil).AnyTimes()

		model.SetManager(mockModelMgr)

		mockKwOperator := knowledgemock.NewMockKnowledgeOperator(ctrl)
		knowledge.SetKnowledgeOperator(mockKwOperator)

		mockKwOperator.EXPECT().ListKnowledgeDetail(gomock.Any(), gomock.Any()).Return(&knowledge.ListKnowledgeDetailResponse{
			KnowledgeDetails: []*knowledge.KnowledgeDetail{
				{ID: 7512369185624686592, Name: "旅游景点", Description: "旅游景点介绍"},
			},
		}, nil).AnyTimes()

		mockKwOperator.EXPECT().Retrieve(gomock.Any(), gomock.Any()).Return(&knowledge.RetrieveResponse{
			Slices: []*knowledge.Slice{
				{DocumentID: "1", Output: "天安门广场 ‌：中国政治文化中心，见证了近现代重大历史事件‌"},
				{DocumentID: "2", Output: "八达岭长城 ‌：明代长城的精华段，被誉为“不到长城非好汉"},
			},
		}, nil).AnyTimes()

		t.Run("llm node with knowledge skill", func(t *testing.T) {

			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			idStr := loadWorkflow(t, h, "llm_node_with_skills/llm_with_knowledge_skill.json")

			testRunReq := &workflow.WorkFlowTestRunRequest{
				WorkflowID: idStr,
				SpaceID:    ptr.Of("123"),
				Input: map[string]string{
					"input": "北京有哪些著名的景点",
				},
			}

			testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string

			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}
				getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

				bs, _ := sonic.MarshalString(getProcessResp)
				fmt.Println("getProcessResp", bs)

				workflowStatus = getProcessResp.Data.ExecuteStatus
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}
				t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}
			assert.Equal(t, `{"output":"八达岭长城 ‌：明代长城的精华段，被誉为“不到长城非好汉‌"}`, output)
		})
	})
}

func TestStreamRun(t *testing.T) {
	mockey.PatchConvey("test stream run", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		go func() {
			_ = h.Run()
		}()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel1 := &testutil.UTChatModel{
			StreamResultProvider: func(_ int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				sr := schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
					},
					{
						Role:    schema.Assistant,
						Content: "don't know.",
					},
				})
				return sr, nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel1, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "sse/llm_emitter.json")
		input := map[string]any{
			"input": "hello",
		}
		inputStr, _ := sonic.MarshalString(input)

		type expectedE struct {
			ID    string
			Event appworkflow.StreamRunEventType
			Data  *streamRunData
		}

		expectedEvents := []expectedE{
			{
				ID:    "0",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("198540"),
					NodeType:     ptr.Of("Message"),
					NodeTitle:    ptr.Of("输出"),
					NodeSeqID:    ptr.Of("0"),
					NodeIsFinish: ptr.Of(false),
					Content:      ptr.Of("emitter: "),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "1",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("198540"),
					NodeType:     ptr.Of("Message"),
					NodeTitle:    ptr.Of("输出"),
					NodeSeqID:    ptr.Of("1"),
					NodeIsFinish: ptr.Of(false),
					Content:      ptr.Of("I "),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "2",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("198540"),
					NodeType:     ptr.Of("Message"),
					NodeTitle:    ptr.Of("输出"),
					NodeSeqID:    ptr.Of("2"),
					NodeIsFinish: ptr.Of(true),
					Content:      ptr.Of("don't know."),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "3",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("900001"),
					NodeType:     ptr.Of("End"),
					NodeTitle:    ptr.Of("结束"),
					NodeSeqID:    ptr.Of("0"),
					NodeIsFinish: ptr.Of(false),
					Content:      ptr.Of("pure_output_for_subworkflow exit: "),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "4",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("900001"),
					NodeType:     ptr.Of("End"),
					NodeTitle:    ptr.Of("结束"),
					NodeSeqID:    ptr.Of("1"),
					NodeIsFinish: ptr.Of(false),
					Content:      ptr.Of("I "),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "5",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("900001"),
					NodeType:     ptr.Of("End"),
					NodeTitle:    ptr.Of("结束"),
					NodeSeqID:    ptr.Of("2"),
					NodeIsFinish: ptr.Of(true),
					Content:      ptr.Of("don't know."),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "6",
				Event: appworkflow.DoneEvent,
				Data: &streamRunData{
					DebugURL: ptr.Of(fmt.Sprintf("https://www.coze.cn/work_flow?execute_id={{exeID}}&space_id=123&workflow_id=%s&execute_mode=2", idStr)),
				},
			},
		}

		index := 0

		streamRunReq := &workflow.OpenAPIRunFlowRequest{
			WorkflowID: idStr,
			Parameters: ptr.Of(inputStr),
		}

		mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
			UserID:      123,
			ConnectorID: consts.APIConnectorID,
		}).Build()

		_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			SpaceID:            "123",
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("desc"),
		}, "/api/workflow_api/publish")

		sseReader := postSSE(t, streamRunReq, "/v1/workflow/stream_run")
		err := sseReader.ForEach(t.Context(), func(e *sse.Event) error {
			t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
			var streamE streamRunData
			err := sonic.Unmarshal(e.Data, &streamE)
			assert.NoError(t, err)
			debugURL := streamE.DebugURL
			if debugURL != nil {
				exeID := strings.TrimPrefix(strings.Split(*debugURL, "&")[0], "https://www.coze.cn/work_flow?execute_id=")
				expectedEvents[index].Data.DebugURL = ptr.Of(strings.ReplaceAll(*debugURL, "{{exeID}}", exeID))
			}
			assert.Equal(t, expectedEvents[index], expectedE{
				ID:    e.ID,
				Event: appworkflow.StreamRunEventType(e.Type),
				Data:  &streamE,
			})
			index++
			return nil
		})
		assert.NoError(t, err)

		mockey.PatchConvey("test llm node debug", func() {
			chatModel1.Reset()
			chatModel1.InvokeResultProvider = func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "I don't know.",
					}, nil
				}
				return nil, fmt.Errorf("unexpected index: %d", index)
			}

			nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
				WorkflowID: idStr,
				NodeID:     "156549",
				Input:      map[string]string{"input": "hello"},
				SpaceID:    ptr.Of("123"),
			}

			nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
			executeID := nodeDebugResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}

				workflowStatus = getProcessResp.Data.ExecuteStatus
				t.Logf("run llm node status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

			outputMap := map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"output": "I don't know.",
			}, outputMap)

			result := getNodeExeHistory(t, h, idStr, executeID, "156549", nil)
			assert.Equal(t, outputMap, mustUnmarshalToMap(t, result.Output))
		})
	})
}

func TestStreamResume(t *testing.T) {
	mockey.PatchConvey("test stream resume", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		go func() {
			_ = h.Run()
		}()

		idStr := loadWorkflow(t, h, "input_complex.json")
		input := map[string]any{}
		inputStr, _ := sonic.MarshalString(input)

		type expectedE struct {
			ID    string
			Event appworkflow.StreamRunEventType
			Data  *streamRunData
		}

		expectedEvents := []expectedE{
			{
				ID:    "0",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("191011"),
					NodeType:     ptr.Of("Input"),
					NodeTitle:    ptr.Of("输入"),
					NodeSeqID:    ptr.Of("0"),
					NodeIsFinish: ptr.Of(true),
					Content:      ptr.Of("{\"content\":\"[{\\\"type\\\":\\\"object\\\",\\\"name\\\":\\\"input\\\",\\\"schema\\\":[{\\\"type\\\":\\\"string\\\",\\\"name\\\":\\\"name\\\",\\\"required\\\":false},{\\\"type\\\":\\\"integer\\\",\\\"name\\\":\\\"age\\\",\\\"required\\\":false}],\\\"required\\\":false},{\\\"type\\\":\\\"list\\\",\\\"name\\\":\\\"input_list\\\",\\\"schema\\\":{\\\"type\\\":\\\"object\\\",\\\"schema\\\":[{\\\"type\\\":\\\"string\\\",\\\"name\\\":\\\"name\\\",\\\"required\\\":false},{\\\"type\\\":\\\"integer\\\",\\\"name\\\":\\\"age\\\",\\\"required\\\":false}]},\\\"required\\\":false}]\",\"content_type\":\"form_schema\"}"),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "1",
				Event: appworkflow.InterruptEvent,
				Data: &streamRunData{
					DebugURL: ptr.Of(fmt.Sprintf("https://www.coze.cn/work_flow?execute_id={{exeID}}&space_id=123&workflow_id=%s&execute_mode=2", idStr)),
					InterruptData: &interruptData{
						EventID: "%s/%s",
						Type:    5,
						Data:    "{\"content\":\"[{\\\"type\\\":\\\"object\\\",\\\"name\\\":\\\"input\\\",\\\"schema\\\":[{\\\"type\\\":\\\"string\\\",\\\"name\\\":\\\"name\\\",\\\"required\\\":false},{\\\"type\\\":\\\"integer\\\",\\\"name\\\":\\\"age\\\",\\\"required\\\":false}],\\\"required\\\":false},{\\\"type\\\":\\\"list\\\",\\\"name\\\":\\\"input_list\\\",\\\"schema\\\":{\\\"type\\\":\\\"object\\\",\\\"schema\\\":[{\\\"type\\\":\\\"string\\\",\\\"name\\\":\\\"name\\\",\\\"required\\\":false},{\\\"type\\\":\\\"integer\\\",\\\"name\\\":\\\"age\\\",\\\"required\\\":false}]},\\\"required\\\":false}]\",\"content_type\":\"form_schema\"}",
					},
				},
			},
		}

		streamRunReq := &workflow.OpenAPIRunFlowRequest{
			WorkflowID: idStr,
			Parameters: ptr.Of(inputStr),
		}

		var (
			resumeID string
			index    int
		)

		_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v1.0.0"),
			VersionDescription: ptr.Of("desc"),
			SpaceID:            "123",
		}, "api/workflow_api/publish")

		mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
			UserID:      123,
			ConnectorID: consts.APIConnectorID,
		}).Build()
		sseReader := postSSE(t, streamRunReq, "/v1/workflow/stream_run")
		err := sseReader.ForEach(t.Context(), func(e *sse.Event) error {
			t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
			if e.Type == string(appworkflow.InterruptEvent) {
				var event streamRunData
				err := sonic.Unmarshal(e.Data, &event)
				assert.NoError(t, err)
				resumeID = event.InterruptData.EventID
			}

			var streamE streamRunData
			err := sonic.Unmarshal(e.Data, &streamE)
			assert.NoError(t, err)
			debugURL := streamE.DebugURL
			if debugURL != nil {
				exeID := strings.TrimPrefix(strings.Split(*debugURL, "&")[0], "https://www.coze.cn/work_flow?execute_id=")
				expectedEvents[index].Data.DebugURL = ptr.Of(strings.ReplaceAll(*debugURL, "{{exeID}}", exeID))
			}
			if streamE.InterruptData != nil {
				expectedEvents[index].Data.InterruptData.EventID = streamE.InterruptData.EventID
			}
			assert.Equal(t, expectedEvents[index], expectedE{
				ID:    e.ID,
				Event: appworkflow.StreamRunEventType(e.Type),
				Data:  &streamE,
			})
			index++
			return nil
		})
		assert.NoError(t, err)

		userInput := map[string]any{
			"input":      `{"name": "eino", "age": 1}`,
			"input_list": `[{"name":"user_1"},{"age":2}]`,
		}
		userInputStr, _ := sonic.MarshalString(userInput)

		expectedEvents = []expectedE{
			{
				ID:    "0",
				Event: appworkflow.MessageEvent,
				Data: &streamRunData{
					NodeID:       ptr.Of("900001"),
					NodeType:     ptr.Of("End"),
					NodeTitle:    ptr.Of("结束"),
					NodeSeqID:    ptr.Of("0"),
					NodeIsFinish: ptr.Of(true),
					Content:      ptr.Of("{\"output\":{\"age\":1,\"name\":\"eino\"},\"output_list\":[{\"age\":0,\"name\":\"user_1\"},{\"age\":2,\"name\":\"\"}]}"),
					ContentType:  ptr.Of("text"),
					Token:        ptr.Of(int64(0)),
				},
			},
			{
				ID:    "1",
				Event: appworkflow.DoneEvent,
				Data: &streamRunData{
					DebugURL: ptr.Of(fmt.Sprintf("https://www.coze.cn/work_flow?execute_id={{exeID}}&space_id=123&workflow_id=%s&execute_mode=2", idStr)),
				},
			},
		}

		streamResumeReq := &workflow.OpenAPIStreamResumeFlowRequest{
			WorkflowID:  idStr,
			EventID:     resumeID,
			ResumeData:  userInputStr,
			ConnectorID: ptr.Of(strconv.FormatInt(consts.APIConnectorID, 10)),
		}

		index = 0

		sseReader = postSSE(t, streamResumeReq, "/v1/workflow/stream_resume")
		err = sseReader.ForEach(t.Context(), func(e *sse.Event) error {
			t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
			var streamE streamRunData
			err := sonic.Unmarshal(e.Data, &streamE)
			assert.NoError(t, err)
			debugURL := streamE.DebugURL
			if debugURL != nil {
				exeID := strings.TrimPrefix(strings.Split(*debugURL, "&")[0], "https://www.coze.cn/work_flow?execute_id=")
				expectedEvents[index].Data.DebugURL = ptr.Of(strings.ReplaceAll(*debugURL, "{{exeID}}", exeID))
			}
			if streamE.InterruptData != nil {
				expectedEvents[index].Data.InterruptData.EventID = streamE.InterruptData.EventID
			}
			assert.Equal(t, expectedEvents[index], expectedE{
				ID:    e.ID,
				Event: appworkflow.StreamRunEventType(e.Type),
				Data:  &streamE,
			})
			index++
			return nil
		})
		assert.NoError(t, err)
	})
}

func TestGetLLMNodeFCSettingsDetailAndMerged(t *testing.T) {
	mockey.PatchConvey("fc setting detail", t, func() {
		operationString := `{
  "summary" : "根据输入的解梦标题给出相关对应的解梦内容，如果返回的内容为空，给用户返回固定的话术：如果想了解自己梦境的详细解析，需要给我详细的梦见信息，例如： 梦见XXX",
  "operationId" : "xz_zgjm",
  "parameters" : [ {
    "description" : "查询解梦标题，例如：梦见蛇",
    "in" : "query",
    "name" : "title",
    "required" : true,
    "schema" : {
      "description" : "查询解梦标题，例如：梦见蛇",
      "type" : "string"
    }
  } ],
  "requestBody" : {
    "content" : {
      "application/json" : {
        "schema" : {
          "type" : "object"
        }
      }
    }
  },
  "responses" : {
    "200" : {
      "content" : {
        "application/json" : {
          "schema" : {
            "properties" : {
              "data" : {
                "description" : "返回数据",
                "type" : "string"
              },
              "data_structural" : {
                "description" : "返回数据结构",
                "properties" : {
                  "content" : {
                    "description" : "解梦内容",
                    "type" : "string"
                  },
                  "title" : {
                    "description" : "解梦标题",
                    "type" : "string"
                  },
                  "weburl" : {
                    "description" : "当前内容关联的页面地址",
                    "type" : "string"
                  }
                },
                "type" : "object"
              },
              "err_msg" : {
                "description" : "错误提示",
                "type" : "string"
              }
            },
            "required" : [ "data", "data_structural" ],
            "type" : "object"
          }
        }
      },
      "description" : "new desc"
    },
    "default" : {
      "description" : ""
    }
  }
}`
		operation := &pluginModel.Openapi3Operation{}
		_ = sonic.UnmarshalString(operationString, operation)
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		mPlugin := mockPlugin.NewMockPluginService(ctrl)
		mPlugin.EXPECT().MGetOnlinePlugins(gomock.Any(), gomock.Any()).Return([]*pluginentity.PluginInfo{
			{
				PluginInfo: &pluginModel.PluginInfo{
					ID:       123,
					SpaceID:  123,
					Version:  ptr.Of("v0.0.1"),
					Manifest: &pluginModel.PluginManifest{NameForHuman: "p1", DescriptionForHuman: "desc"},
				},
			},
		}, nil).AnyTimes()
		mPlugin.EXPECT().MGetOnlineTools(gomock.Any(), gomock.Any()).Return([]*pluginentity.ToolInfo{
			{ID: 123, Operation: operation},
		}, nil).AnyTimes()
		mockTos := storageMock.NewMockStorage(ctrl)
		mockTos.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any(), gomock.Any()).Return("", nil).AnyTimes()

		toolSrv := crossplugin.NewToolService(mPlugin, mockTos)
		plugin.SetToolService(toolSrv)
		t.Run("plugin tool info ", func(t *testing.T) {
			fcSettingDetailReq := &workflow.GetLLMNodeFCSettingDetailRequest{
				PluginList: []*workflow.PluginFCItem{
					{PluginID: "123", APIID: "123"},
				},
				SpaceID: "123",
			}
			response := post[map[string]any](t, h, fcSettingDetailReq, "/api/workflow_api/llm_fc_setting_detail")
			assert.Equal(t, (*response)["plugin_detail_map"].(map[string]any)["123"].(map[string]any)["description"], "desc")
			assert.Equal(t, (*response)["plugin_detail_map"].(map[string]any)["123"].(map[string]any)["name"], "p1")

			assert.Equal(t, (*response)["plugin_api_detail_map"].(map[string]any)["123"].(map[string]any)["name"], "xz_zgjm")
			assert.Equal(t, 1, len((*response)["plugin_api_detail_map"].(map[string]any)["123"].(map[string]any)["parameters"].([]any)))
		})

		t.Run("workflow tool info ", func(t *testing.T) {
			ensureWorkflowVersion(t, h, 123, "v0.0.1", "entry_exit.json", mockIDGen)
			fcSettingDetailReq := &workflow.GetLLMNodeFCSettingDetailRequest{
				WorkflowList: []*workflow.WorkflowFCItem{
					{WorkflowID: "123", PluginID: "123", WorkflowVersion: ptr.Of("v0.0.1")},
				},
				SpaceID: "123",
			}
			response := post[map[string]any](t, h, fcSettingDetailReq, "/api/workflow_api/llm_fc_setting_detail")
			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()
			assert.Equal(t, (*response)["workflow_detail_map"].(map[string]any)["123"].(map[string]any)["plugin_id"], "123")
			assert.Equal(t, (*response)["workflow_detail_map"].(map[string]any)["123"].(map[string]any)["name"], "test_wf")
			assert.Equal(t, (*response)["workflow_detail_map"].(map[string]any)["123"].(map[string]any)["description"], "this is a test wf")
		})
	})
	mockey.PatchConvey("fc setting merged", t, func() {
		operationString := `{
  "summary" : "根据输入的解梦标题给出相关对应的解梦内容，如果返回的内容为空，给用户返回固定的话术：如果想了解自己梦境的详细解析，需要给我详细的梦见信息，例如： 梦见XXX",
  "operationId" : "xz_zgjm",
  "parameters" : [ {
    "description" : "查询解梦标题，例如：梦见蛇",
    "in" : "query",
    "name" : "title",
    "required" : true,
    "schema" : {
      "description" : "查询解梦标题，例如：梦见蛇",
      "type" : "string"
    }
  } ],
  "requestBody" : {
    "content" : {
      "application/json" : {
        "schema" : {
          "type" : "object"
        }
      }
    }
  },
  "responses" : {
    "200" : {
      "content" : {
        "application/json" : {
          "schema" : {
            "properties" : {
              "data" : {
                "description" : "返回数据",
                "type" : "string"
              },
              "data_structural" : {
                "description" : "返回数据结构",
                "properties" : {
                  "content" : {
                    "description" : "解梦内容",
                    "type" : "string"
                  },
                  "title" : {
                    "description" : "解梦标题",
                    "type" : "string"
                  },
                  "weburl" : {
                    "description" : "当前内容关联的页面地址",
                    "type" : "string"
                  }
                },
                "type" : "object"
              },
              "err_msg" : {
                "description" : "错误提示",
                "type" : "string"
              }
            },
            "required" : [ "data", "data_structural" ],
            "type" : "object"
          }
        }
      },
      "description" : "new desc"
    },
    "default" : {
      "description" : ""
    }
  }
}`

		operation := &pluginModel.Openapi3Operation{}
		_ = sonic.UnmarshalString(operationString, operation)
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		mPlugin := mockPlugin.NewMockPluginService(ctrl)
		mPlugin.EXPECT().MGetOnlinePlugins(gomock.Any(), gomock.Any()).Return([]*pluginentity.PluginInfo{
			{
				PluginInfo: &pluginModel.PluginInfo{
					ID:       123,
					SpaceID:  123,
					Version:  ptr.Of("v0.0.1"),
					Manifest: &pluginModel.PluginManifest{NameForHuman: "p1", DescriptionForHuman: "desc"},
				},
			},
		}, nil).AnyTimes()
		mPlugin.EXPECT().MGetOnlineTools(gomock.Any(), gomock.Any()).Return([]*pluginentity.ToolInfo{
			{ID: 123, Operation: operation},
		}, nil).AnyTimes()
		mockTos := storageMock.NewMockStorage(ctrl)
		mockTos.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any(), gomock.Any()).Return("", nil).AnyTimes()

		toolSrv := crossplugin.NewToolService(mPlugin, mockTos)
		plugin.SetToolService(toolSrv)
		t.Run("plugin merge", func(t *testing.T) {
			fcSettingMergedReq := &workflow.GetLLMNodeFCSettingsMergedRequest{
				PluginFcSetting: &workflow.FCPluginSetting{
					PluginID: "123", APIID: "123",
					RequestParams: []*workflow.APIParameter{
						{Name: "title", LocalDisable: true, LocalDefault: ptr.Of("value")},
					},
					ResponseParams: []*workflow.APIParameter{
						{Name: "data123", LocalDisable: true},
					},
				},
				SpaceID: "123",
			}
			response := post[map[string]any](t, h, fcSettingMergedReq, "/api/workflow_api/llm_fc_setting_merged")

			assert.Equal(t, (*response)["plugin_fc_setting"].(map[string]any)["request_params"].([]any)[0].(map[string]any)["local_disable"], true)
			names := map[string]bool{
				"data":            true,
				"data_structural": true,
				"err_msg":         true,
			}
			assert.Equal(t, 3, len((*response)["plugin_fc_setting"].(map[string]any)["response_params"].([]any)))

			for _, mm := range (*response)["plugin_fc_setting"].(map[string]any)["response_params"].([]any) {
				n := mm.(map[string]any)["name"].(string)
				assert.True(t, names[n])
			}
		})
		t.Run("workflow merge", func(t *testing.T) {
			ensureWorkflowVersion(t, h, 1234, "v0.0.1", "entry_exit.json", mockIDGen)
			fcSettingMergedReq := &workflow.GetLLMNodeFCSettingsMergedRequest{
				WorkflowFcSetting: &workflow.FCWorkflowSetting{
					WorkflowID: "1234",
					PluginID:   "1234",
					RequestParams: []*workflow.APIParameter{
						{Name: "obj", LocalDisable: true, LocalDefault: ptr.Of("{}")},
					},
					ResponseParams: []*workflow.APIParameter{
						{Name: "literal_key", LocalDisable: true},
						{Name: "literal_key_bak", LocalDisable: true},
					},
				},
				SpaceID: "123",
			}

			response := post[map[string]any](t, h, fcSettingMergedReq, "/api/workflow_api/llm_fc_setting_merged")

			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			assert.Equal(t, 3, len((*response)["worflow_fc_setting"].(map[string]any)["request_params"].([]any)))
			assert.Equal(t, 8, len((*response)["worflow_fc_setting"].(map[string]any)["response_params"].([]any)))

			for _, mm := range (*response)["worflow_fc_setting"].(map[string]any)["request_params"].([]any) {
				if mm.(map[string]any)["name"].(string) == "obj" {
					assert.True(t, mm.(map[string]any)["local_disable"].(bool))
				}
			}
		})
	})
}

func TestNodeDebugLoop(t *testing.T) {
	mockey.PatchConvey("test node debug loop", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflow(t, h, "loop_selector_variable_assign_text_processor.json")

		nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
			WorkflowID: idStr,
			NodeID:     "192046",
			Input:      map[string]string{"input": `["a", "bb", "ccc", "dddd"]`},
			SpaceID:    ptr.Of("123"),
		}

		nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
		executeID := nodeDebugResp.Data.ExecuteID

		workflowStatus := workflow.WorkflowExeStatus_Running
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, executeID)
			if len(getProcessResp.Data.NodeResults) > 0 {
				for _, n := range getProcessResp.Data.NodeResults {
					if n.NodeId == "192046" {
						output = n.Output
						break
					}
				}
			}

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("run llm node status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

		outputMap := map[string]any{}
		err := sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"converted": []any{
				"new_a",
				"new_ccc",
			},
			"variable_out": "dddd",
		}, outputMap)

		result := getNodeExeHistory(t, h, idStr, executeID, "192046", nil)
		assert.Equal(t, outputMap, mustUnmarshalToMap(t, result.Output))

		result = getNodeExeHistory(t, h, idStr, "", "100001", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.Equal(t, "", result.Output)

		result = getNodeExeHistory(t, h, idStr, "", "wrong_node_id", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.Equal(t, "", result.Output)
	})
}

func TestCopyWorkflow(t *testing.T) {
	mockey.PatchConvey("copy work flow", t, func() {
		h, _, _, f := prepareWorkflowIntegration(t, true)
		defer f()

		idStr := loadWorkflowWithWorkflowName(t, h, "original_workflow", "publish/publish_workflow.json")

		response := post[workflow.CopyWorkflowResponse](t, h, &workflow.CopyWorkflowRequest{
			WorkflowID: idStr,
			SpaceID:    "123",
		}, "/api/workflow_api/copy")

		oldCanvasResponse := post[workflow.GetCanvasInfoResponse](t, h, &workflow.GetCanvasInfoRequest{
			SpaceID:    "123",
			WorkflowID: ptr.Of(idStr),
		}, "/api/workflow_api/canvas")

		copiedCanvasResponse := post[workflow.GetCanvasInfoResponse](t, h, &workflow.GetCanvasInfoRequest{
			SpaceID:    "123",
			WorkflowID: ptr.Of(response.Data.WorkflowID),
		}, "/api/workflow_api/canvas")

		assert.Equal(t, ptr.From(oldCanvasResponse.Data.Workflow.SchemaJSON), ptr.From(copiedCanvasResponse.Data.Workflow.SchemaJSON))

		assert.Equal(t, "original_workflow_1", copiedCanvasResponse.Data.Workflow.Name)

		_ = post[workflow.BatchDeleteWorkflowResponse](t, h, &workflow.BatchDeleteWorkflowRequest{
			WorkflowIDList: []string{idStr, response.Data.WorkflowID},
			SpaceID:        "123",
		}, "/api/workflow_api/batch_delete")

		wid, _ := strconv.ParseInt(idStr, 10, 64)

		_, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), wid)
		assert.NotNil(t, err)
		assert.Equal(t, fmt.Sprintf("workflow meta not found for ID %s: record not found", idStr), err.Error())
	})
}

func TestReleaseApplicationWorkflows(t *testing.T) {
	mockey.PatchConvey("normal release application workflow", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		vars := make([]*variable.VarMeta, 0)
		vars = append(vars, &variable.VarMeta{
			Name: "app_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeArray,
				ElemTypeInfo: &variable.VarTypeInfo{
					Type: variable.VarTypeString,
				},
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v2",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})
		mockVarGetter := mockvar.NewMockVariablesMetaGetter(ctrl)
		ctx := t.Context()
		ctx = ctxcache.Init(context.Background())
		ctxcache.Store(ctx, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})

		mockey.Mock(variable.GetVariablesMetaGetter).Return(mockVarGetter).Build()
		mockVarGetter.EXPECT().GetProjectVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

		_, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(ctx, 100100100100)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(100100100100), nil).Times(1)
			_ = loadWorkflowWithCreateReq(t, h, &workflow.CreateWorkflowRequest{
				Name:      "main",
				Desc:      "main",
				IconURI:   consts.DefaultWorkflowIcon,
				SpaceID:   "123",
				ProjectID: ptr.Of("10001000"),
			}, "publish/release_main_workflow.json")
		}

		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(ctx, 7511615200781402118)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7511615200781402118), nil).Times(1)
			_ = loadWorkflowWithCreateReq(t, h, &workflow.CreateWorkflowRequest{
				Name:      "c1",
				Desc:      "c1",
				IconURI:   consts.DefaultWorkflowIcon,
				SpaceID:   "123",
				ProjectID: ptr.Of("10001000"),
			}, "publish/release_c1_workflow.json")
		}

		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(ctx, 7511616004728815618)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7511616004728815618), nil).Times(1)

			_ = loadWorkflowWithCreateReq(t, h, &workflow.CreateWorkflowRequest{
				Name:      "cc1",
				Desc:      "cc1",
				IconURI:   consts.DefaultWorkflowIcon,
				SpaceID:   "123",
				ProjectID: ptr.Of("10001000"),
			}, "publish/release_cc1_workflow.json")
		}

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		wf, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7511616004728815618)
		assert.NoError(t, err)
		version := "v0.0.1"
		if wf.LatestVersion != "" {
			versionSchema := strings.Split(wf.LatestVersion, ".")
			vInt, err := strconv.ParseInt(versionSchema[2], 10, 64)
			if err != nil {
				return
			}
			nextVer := strconv.FormatInt(vInt+1, 10)
			versionSchema[2] = nextVer
			version = strings.Join(versionSchema, ".")
		}

		vIssues, err := appworkflow.GetWorkflowDomainSVC().ReleaseApplicationWorkflows(ctx, 10001000, &vo.ReleaseWorkflowConfig{
			Version:   version,
			PluginIDs: []int64{7511616454588891136},
		})
		assert.NoError(t, err)
		assert.Equal(t, 0, len(vIssues))

		wf, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowVersion(ctx, &entity.WorkflowIdentity{
			ID:      100100100100,
			Version: version,
		})
		assert.NoError(t, err)
		canvasSchema := *wf.Canvas

		cv := &vo.Canvas{}

		err = sonic.UnmarshalString(canvasSchema, cv)
		assert.NoError(t, err)

		var validateCv func(ns []*vo.Node)
		validateCv = func(ns []*vo.Node) {
			for _, n := range ns {
				if n.Type == vo.BlockTypeBotSubWorkflow {
					assert.Equal(t, n.Data.Inputs.WorkflowVersion, version)
				}
				if n.Type == vo.BlockTypeBotAPI {
					for _, apiParam := range n.Data.Inputs.APIParams {
						// In the application, the workflow plugin node When the plugin version is equal to 0, the plugin is a plugin created in the application
						if apiParam.Name == "pluginVersion" {
							assert.Equal(t, apiParam.Input.Value.Content, version)
						}
					}
				}

				if n.Type == vo.BlockTypeBotLLM {
					if n.Data.Inputs.FCParam != nil && n.Data.Inputs.FCParam.PluginFCParam != nil {
						// In the application, the workflow llm node When the plugin version is equal to 0, the plugin is a plugin created in the application
						for idx := range n.Data.Inputs.FCParam.PluginFCParam.PluginList {
							p := n.Data.Inputs.FCParam.PluginFCParam.PluginList[idx]
							assert.Equal(t, p.PluginVersion, version)
						}
					}

					if n.Data.Inputs.FCParam != nil && n.Data.Inputs.FCParam.WorkflowFCParam != nil {
						for _, w := range n.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
							assert.Equal(t, w.WorkflowVersion, version)
						}
					}
				}

				if len(n.Blocks) > 0 {
					validateCv(n.Blocks)
				}
			}
		}
	})
	mockey.PatchConvey("has issues release application workflow", t, func() {
		h, ctrl, mockIDGen, f := prepareWorkflowIntegration(t, false)
		defer f()

		vars := make([]*variable.VarMeta, 0)
		vars = append(vars, &variable.VarMeta{
			Name: "app_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeArray,
				ElemTypeInfo: &variable.VarTypeInfo{
					Type: variable.VarTypeString,
				},
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v2",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})
		mockVarGetter := mockvar.NewMockVariablesMetaGetter(ctrl)
		mockey.Mock(variable.GetVariablesMetaGetter).Return(mockVarGetter).Build()
		mockVarGetter.EXPECT().GetProjectVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

		_, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 1001001001001)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(1001001001001), nil).Times(1)
			_ = loadWorkflowWithCreateReq(t, h, &workflow.CreateWorkflowRequest{
				Name:      "main",
				Desc:      "main",
				IconURI:   consts.DefaultWorkflowIcon,
				SpaceID:   "123",
				ProjectID: ptr.Of("100010001"),
			}, "publish/release_error_workflow.json")
		}

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()
		c := ctxcache.Init(context.Background())
		ctxcache.Store(c, consts.SessionDataKeyInCtx, &userentity.Session{
			UserID: 123,
		})

		wf, err := appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 1001001001001)
		assert.NoError(t, err)

		version := "v0.0.1"

		if wf.LatestVersion != "" {
			versionSchema := strings.Split(wf.LatestVersion, ".")
			vInt, err := strconv.ParseInt(versionSchema[2], 10, 64)
			if err != nil {
				return
			}
			nextVer := strconv.FormatInt(vInt+1, 10)
			versionSchema[2] = nextVer
			version = strings.Join(versionSchema, ".")
		}

		vIssues, err := appworkflow.GetWorkflowDomainSVC().ReleaseApplicationWorkflows(c, 100010001, &vo.ReleaseWorkflowConfig{
			Version:   version,
			PluginIDs: []int64{},
		})
		assert.NoError(t, err)
		assert.Equal(t, 1, len(vIssues))
		assert.Equal(t, 2, len(vIssues[0].IssueMessages))
	})
}

func TestLLMException(t *testing.T) {
	mockey.PatchConvey("test llm exception", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()
		idStr := loadWorkflow(t, h, "exception/llm_default_output_retry_timeout.json")

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		mainChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				return nil, errors.New("first invoke error")
			},
		}

		fallbackChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				return &schema.Message{
					Role:    schema.Assistant,
					Content: `{"name":"eino","age":1}`,
				}, nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1737521813 {
				return mainChatModel, nil
			} else {
				return fallbackChatModel, nil
			}
		}).AnyTimes()

		mockey.PatchConvey("two retries to succeed", func() {
			nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
				WorkflowID: idStr,
				NodeID:     "103929",
				Input:      map[string]string{"input": "hello"},
				SpaceID:    ptr.Of("123"),
			}

			nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
			executeID := nodeDebugResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}

				workflowStatus = getProcessResp.Data.ExecuteStatus
				t.Logf("run llm node with exception status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

			outputMap := map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"name":      "eino",
				"age":       float64(1),
				"isSuccess": true,
			}, outputMap)
		})

		mockey.PatchConvey("timeout then use default output", func() {
			fallbackChatModel.InvokeResultProvider = func(index int, in []*schema.Message) (*schema.Message, error) {
				time.Sleep(500 * time.Millisecond)
				return &schema.Message{
					Role:    schema.Assistant,
					Content: `{"name":"eino","age":1}`,
				}, nil
			}

			nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
				WorkflowID: idStr,
				NodeID:     "103929",
				Input:      map[string]string{"input": "hello"},
				SpaceID:    ptr.Of("123"),
			}

			nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
			executeID := nodeDebugResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}

				workflowStatus = getProcessResp.Data.ExecuteStatus
				t.Logf("run llm node with exception status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

			outputMap := map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"name":      "zhangsan",
				"age":       float64(3),
				"isSuccess": false,
				"errorBody": map[string]any{
					"errorMessage": "[GraphRunError]\ncontext has been canceled: context deadline exceeded",
					"errorCode":    float64(-1),
				},
			}, outputMap)
		})
	})
}

func TestLLMExceptionThenThrow(t *testing.T) {
	mockey.PatchConvey("test llm exception then throw", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()
		idStr := loadWorkflow(t, h, "exception/llm_timeout_throw.json")

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		mainChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				return nil, errors.New("first invoke error")
			},
		}

		fallbackChatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				time.Sleep(500 * time.Millisecond)
				return &schema.Message{
					Role:    schema.Assistant,
					Content: `{"name":"eino","age":1}`,
				}, nil
			},
		}

		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, error) {
			if params.ModelType == 1737521813 {
				return mainChatModel, nil
			} else {
				return fallbackChatModel, nil
			}
		}).AnyTimes()

		nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
			WorkflowID: idStr,
			NodeID:     "103929",
			Input:      map[string]string{"input": "hello"},
			SpaceID:    ptr.Of("123"),
		}

		nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](t, h, nodeDebugReq, "/api/workflow_api/nodeDebug")
		executeID := nodeDebugResp.Data.ExecuteID

		workflowStatus := workflow.WorkflowExeStatus_Running
		var reason *string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, executeID)
			reason = getProcessResp.Data.Reason

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("run llm node with exception status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowFailed), workflowStatus)
		assert.Contains(t, *reason, "context deadline exceeded")
	})
}

func TestCodeExceptionBranch(t *testing.T) {
	mockey.PatchConvey("test code exception branch", t, func() {
		h, ctrl, _, f := prepareWorkflowIntegration(t, true)
		defer f()
		idStr := loadWorkflow(t, h, "exception/code_exception_branch.json")

		mockey.PatchConvey("exception branch", func() {
			code.SetCodeRunner(coderunner.NewRunner())

			testRunReq := &workflow.WorkFlowTestRunRequest{
				WorkflowID: idStr,
				Input:      map[string]string{"input": "hello"},
				SpaceID:    ptr.Of("123"),
			}

			testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")
			executeID := testRunResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}

				workflowStatus = getProcessResp.Data.ExecuteStatus
				t.Logf("run code node with exception branch status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

			outputMap := map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"output":  false,
				"output1": "code result: False",
			}, outputMap)
		})

		mockey.PatchConvey("normal branch", func() {
			mockCodeRunner := mockcode.NewMockRunner(ctrl)
			mockey.Mock(code.GetCodeRunner).Return(mockCodeRunner).Build()
			mockCodeRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(&code.RunResponse{
				Result: map[string]any{
					"key0": "value0",
					"key1": []string{"value1", "value2"},
					"key2": map[string]any{},
				},
			}, nil).AnyTimes()

			testRunReq := &workflow.WorkFlowTestRunRequest{
				WorkflowID: idStr,
				Input:      map[string]string{"input": "hello"},
				SpaceID:    ptr.Of("123"),
			}

			testRunResp := post[workflow.WorkFlowTestRunResponse](t, h, testRunReq, "/api/workflow_api/test_run")
			executeID := testRunResp.Data.ExecuteID

			workflowStatus := workflow.WorkflowExeStatus_Running
			var output string
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, executeID)
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}

				workflowStatus = getProcessResp.Data.ExecuteStatus
				t.Logf("run code node with exception branch status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

			outputMap := map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"output":  true,
				"output1": "",
			}, outputMap)

			mockey.PatchConvey("sync run", func() {
				_ = post[workflow.PublishWorkflowResponse](t, h, &workflow.PublishWorkflowRequest{
					WorkflowID:         idStr,
					WorkflowVersion:    ptr.Of("v1.0.0"),
					VersionDescription: ptr.Of("test"),
					SpaceID:            "123",
				}, "api/workflow_api/publish")

				mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
					UserID:      123,
					ConnectorID: consts.APIConnectorID,
				}).Build()

				syncRunReq := &workflow.OpenAPIRunFlowRequest{
					WorkflowID: idStr,
					Parameters: ptr.Of(mustMarshalToString(t, testRunReq.Input)),
					IsAsync:    ptr.Of(false),
				}

				runResp := post[workflow.OpenAPIRunFlowResponse](t, h, syncRunReq, "/v1/workflow/run")
				var m map[string]any
				err = sonic.UnmarshalString(runResp.GetData(), &m)
				assert.NoError(t, err)
				assert.Equal(t, map[string]any{
					"output":  true,
					"output1": "",
				}, m)
			})
		})
	})
}
