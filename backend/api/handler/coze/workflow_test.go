package coze

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	mockvar "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestNodeTemplateList(t *testing.T) {
	mockey.PatchConvey("test node template list", t, func() {
		h := server.Default()
		h.POST("/api/workflow_api/node_template_list", NodeTemplateList)

		dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
		if os.Getenv("CI_JOB_NAME") != "" {
			dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
		}
		db, err := gorm.Open(mysql.Open(dsn))
		assert.NoError(t, err)
		service.InitWorkflowService(nil, db)
		mockey.Mock(application.GetWorkflowDomainSVC).Return(service.GetWorkflowService()).Build()

		req := &workflow.NodeTemplateListRequest{
			NodeTypes: []string{"1", "5", "18"},
		}
		m, err := sonic.Marshal(req)
		assert.NoError(t, err)
		w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/node_template_list", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res := w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())
		rBody := res.Body()
		resp := &workflow.NodeTemplateListResponse{}
		err = sonic.Unmarshal(rBody, resp)
		assert.NoError(t, err)
		assert.Equal(t, 3, len(resp.Data.TemplateList))
		assert.Equal(t, 3, len(resp.Data.CateList))
	})
}

func TestCRUD(t *testing.T) {
	mockey.PatchConvey("test CRUD", t, func() {
		h := server.Default()
		h.POST("/api/workflow_api/create", CreateWorkflow)
		h.POST("/api/workflow_api/save", SaveWorkflow)
		h.POST("/api/workflow_api/delete", DeleteWorkflow)
		h.POST("/api/workflow_api/canvas", GetCanvasInfo)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockIDGen := mock.NewMockIDGenerator(ctrl)
		mockIDGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()

		dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
		if os.Getenv("CI_JOB_NAME") != "" {
			dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
		}
		db, err := gorm.Open(mysql.Open(dsn))
		assert.NoError(t, err)

		service.InitWorkflowService(mockIDGen, db)
		mockey.Mock(application.GetWorkflowDomainSVC).Return(service.GetWorkflowService()).Build()

		createReq := &workflow.CreateWorkflowRequest{
			Name:     "test_wf",
			Desc:     "this is a test wf",
			IconURI:  "icon/uri",
			SpaceID:  "123",
			FlowMode: ptr.Of(workflow.WorkflowMode_Workflow),
		}

		m, err := sonic.Marshal(createReq)
		assert.NoError(t, err)
		w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/create", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res := w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())
		rBody := res.Body()
		resp := &workflow.CreateWorkflowResponse{}
		err = sonic.Unmarshal(rBody, resp)
		assert.NoError(t, err)

		idStr := resp.Data.WorkflowID
		_, err = strconv.ParseInt(idStr, 10, 64)
		assert.NoError(t, err)

		data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/entry_exit.json")
		assert.NoError(t, err)

		saveReq := &workflow.SaveWorkflowRequest{
			WorkflowID: idStr,
			Schema:     ptr.Of(string(data)),
			SpaceID:    ptr.Of("123"),
		}

		m, err = sonic.Marshal(saveReq)
		assert.NoError(t, err)
		w = ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/save", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res = w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())

		canvasReq := &workflow.GetCanvasInfoRequest{
			WorkflowID: &idStr,
			SpaceID:    "123",
		}

		m, err = sonic.Marshal(canvasReq)
		assert.NoError(t, err)
		w = ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/canvas", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res = w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())
		rBody = res.Body()
		canvasResp := &workflow.GetCanvasInfoResponse{}
		err = sonic.Unmarshal(rBody, canvasResp)
		assert.NoError(t, err)

		assert.Equal(t, canvasResp.Data.Workflow.WorkflowID, idStr)
		assert.Equal(t, *canvasResp.Data.Workflow.SchemaJSON, string(data))

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: idStr,
			SpaceID:    "123",
		}
		m, err = sonic.Marshal(deleteReq)
		assert.NoError(t, err)
		w = ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/delete", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res = w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())
		deleteResp := &workflow.DeleteWorkflowResponse{}
		err = sonic.Unmarshal(rBody, deleteResp)
		assert.NoError(t, err)
		assert.Equal(t, deleteResp.Data.Status, workflow.DeleteStatus_SUCCESS)

		w = ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/canvas", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res = w.Result()
		assert.Equal(t, http.StatusInternalServerError, res.StatusCode())
	})
}

func TestTestRunAndGetProcess(t *testing.T) {
	mockey.PatchConvey("test test_run and get_process", t, func() {
		h := server.Default()
		h.POST("/api/workflow_api/create", CreateWorkflow)
		h.POST("/api/workflow_api/save", SaveWorkflow)
		h.POST("/api/workflow_api/test_run", WorkFlowTestRun)
		h.GET("/api/workflow_api/get_process", GetWorkFlowProcess)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockIDGen := mock.NewMockIDGenerator(ctrl)
		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()
		mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
		mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any()).Return(1.0, nil).AnyTimes()

		mockey.Mock(variable.GetVariableHandler).Return(&variable.Handler{
			AppVarStore: mockGlobalAppVarStore,
		}).Build()

		dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
		if os.Getenv("CI_JOB_NAME") != "" {
			dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
		}
		db, err := gorm.Open(mysql.Open(dsn))
		assert.NoError(t, err)

		service.InitWorkflowService(mockIDGen, db)
		mockey.Mock(application.GetWorkflowDomainSVC).Return(service.GetWorkflowService()).Build()

		createReq := &workflow.CreateWorkflowRequest{
			Name:     "test_wf",
			Desc:     "this is a test wf",
			IconURI:  "icon/uri",
			SpaceID:  "123",
			FlowMode: ptr.Of(workflow.WorkflowMode_Workflow),
		}

		m, err := sonic.Marshal(createReq)
		assert.NoError(t, err)
		w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/create", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res := w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())
		rBody := res.Body()
		resp := &workflow.CreateWorkflowResponse{}
		err = sonic.Unmarshal(rBody, resp)
		assert.NoError(t, err)

		idStr := resp.Data.WorkflowID
		_, err = strconv.ParseInt(idStr, 10, 64)
		assert.NoError(t, err)

		data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/entry_exit.json")
		assert.NoError(t, err)

		saveReq := &workflow.SaveWorkflowRequest{
			WorkflowID: idStr,
			Schema:     ptr.Of(string(data)),
			SpaceID:    ptr.Of("123"),
		}

		m, err = sonic.Marshal(saveReq)
		assert.NoError(t, err)
		w = ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/save", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res = w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())

		testRunReq := &workflow.WorkFlowTestRunRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			Input: map[string]string{
				"arr":   "[\"arr1\", \"arr2\"]",
				"obj":   "{\"field1\": [\"1234\", \"5678\"]}",
				"input": "3.5",
			},
		}

		m, err = sonic.Marshal(testRunReq)
		assert.NoError(t, err)
		w = ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/test_run", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res = w.Result()
		assert.Equal(t, http.StatusOK, res.StatusCode())
		testRunResp := &workflow.WorkFlowTestRunResponse{}
		err = sonic.Unmarshal(res.Body(), testRunResp)
		assert.NoError(t, err)

		workflowStatus := workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessReq := &workflow.GetWorkflowProcessRequest{
				WorkflowID: idStr,
				SpaceID:    "123",
				ExecuteID:  ptr.Of(testRunResp.Data.ExecuteID),
			}

			w = ut.PerformRequest(h.Engine, "GET", fmt.Sprintf("/api/workflow_api/get_process?workflow_id=%s&space_id=%s&execute_id=%s", getProcessReq.WorkflowID, getProcessReq.SpaceID, *getProcessReq.ExecuteID), nil,
				ut.Header{Key: "Content-Type", Value: "application/json"})
			res = w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())
			getProcessResp := &workflow.GetWorkflowProcessResponse{}
			err = sonic.Unmarshal(res.Body(), getProcessResp)
			assert.NoError(t, err)

			workflowStatus = getProcessResp.Data.ExecuteStatus

			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}
	})
}
