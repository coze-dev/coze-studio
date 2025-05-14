package coze

import (
	"bytes"

	"reflect"

	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	appworkflow "code.byted.org/flow/opencoze/backend/application/workflow"
	workflow2 "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	mockmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model/modelmock"
	crosssearch "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search/searchmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"

	mockvar "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	mockWorkflow "code.byted.org/flow/opencoze/backend/internal/mock/domain/workflow"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/internal/testutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func prepareWorkflowIntegration(t *testing.T, needMockIDGen bool) (*server.Hertz, *gomock.Controller, *mock.MockIDGenerator) {
	h := server.Default()
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

	ctrl := gomock.NewController(t)
	mockIDGen := mock.NewMockIDGenerator(ctrl)

	if needMockIDGen {
		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
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

	workflowRepo := service.NewWorkflowRepository(mockIDGen, db, redisClient)
	mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(service.NewWorkflowService(workflowRepo)).Build()
	mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build()

	mockSearchNotify := searchmock.NewMockNotifier(ctrl)
	mockey.Mock(crosssearch.GetNotifier).Return(mockSearchNotify).Build()
	mockSearchNotify.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

	return h, ctrl, mockIDGen
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
	assert.NoError(t, err)
	return &resp
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
		err = appworkflow.GetWorkflowDomainSVC().PublishWorkflow(context.Background(), id, true, &vo.VersionInfo{
			Version: version,
		})
		if err != nil {
			t.Fatal(err)
		}
	}
}

func TestNodeTemplateList(t *testing.T) {
	mockey.PatchConvey("test node template list", t, func() {
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

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
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

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
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

		mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
		mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any()).Return(1.0, nil).AnyTimes()
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
		workflowStatus = workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("second run workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowSuccess), workflowStatus)

		// cancel after success, nothing happens
		_ = post[workflow.CancelWorkFlowResponse](t, h, cancelReq, "/api/workflow_api/cancel")
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
			in := map[string]*entity.TypeInfo{}
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
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

		idStr := loadWorkflow(t, h, "input_receiver.json")

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

			t.Logf("workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		cancelReq := &workflow.CancelWorkFlowRequest{
			WorkflowID: &idStr,
			SpaceID:    "123",
			ExecuteID:  testRunResp.Data.ExecuteID,
		}

		// cancel after interruption. After resume, it will cancel at first possible chance.
		_ = post[workflow.CancelWorkFlowResponse](t, h, cancelReq, "/api/workflow_api/cancel")

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

		workflowStatus = workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("resume after cancel. workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}

		assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Cancel)

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
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
			lastResult = getProcessResp.Data
			t.Logf("third workflow resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
		}

		var outputMap = map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"input":    "user input",
			"inputArr": nil,
			"field1":   []any{"1", "2"},
		}, outputMap)
	})
}

func TestQueryTypes(t *testing.T) {
	mockey.PatchConvey("test workflow node types", t, func() {
		h := server.Default()
		h.POST("/api/workflow_api/node_type", QueryWorkflowNodeTypes)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		t.Run("not sub workflow", func(t *testing.T) {

			workflowRepo := mockWorkflow.NewMockRepository(ctrl)
			srv := service.NewWorkflowService(workflowRepo)
			defer mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(srv).Build().UnPatch()

			defer mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build().UnPatch()

			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/query_types/llm_intent_http_nodes.json")
			assert.NoError(t, err)

			mockDraftInfo := &vo.DraftInfo{
				Canvas: string(data),
			}

			workflowRepo.EXPECT().GetWorkflowDraft(gomock.Any(), gomock.Any()).Return(mockDraftInfo, nil).AnyTimes()

			req := new(workflow.QueryWorkflowNodeTypeRequest)

			req.WorkflowID = "1"

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/node_type", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.QueryWorkflowNodeTypeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.Contains(t, response.Data.NodeTypes, "1")
			assert.Contains(t, response.Data.NodeTypes, "2")
			assert.Contains(t, response.Data.NodeTypes, "5")
			assert.Contains(t, response.Data.NodeTypes, "22")
			assert.Contains(t, response.Data.NodeTypes, "45")
			bs, _ := json.Marshal(response)
			fmt.Println(string(bs))

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

			workflowRepo := mockWorkflow.NewMockRepository(ctrl)
			srv := service.NewWorkflowService(workflowRepo)
			defer mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(srv).Build().UnPatch()

			defer mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build().UnPatch()

			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/query_types/loop_condition.json")
			assert.NoError(t, err)

			mockDraftInfo := &vo.DraftInfo{
				Canvas: string(data),
			}

			workflowRepo.EXPECT().GetWorkflowDraft(gomock.Any(), gomock.Any()).Return(mockDraftInfo, nil).AnyTimes()

			req := new(workflow.QueryWorkflowNodeTypeRequest)

			req.WorkflowID = "1"

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/node_type", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.QueryWorkflowNodeTypeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.Contains(t, response.Data.NodeTypes, "1")
			assert.Contains(t, response.Data.NodeTypes, "2")
			assert.Contains(t, response.Data.NodeTypes, "21")
			assert.Contains(t, response.Data.NodeTypes, "5")
			assert.Contains(t, response.Data.NodeTypes, "8")

			bs, _ := json.Marshal(response)
			fmt.Println(string(bs))

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

			workflowRepo := mockWorkflow.NewMockRepository(ctrl)
			srv := service.NewWorkflowService(workflowRepo)
			defer mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(srv).Build().UnPatch()
			defer mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build().UnPatch()

			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/query_types/subworkflows.json")
			assert.NoError(t, err)

			mockDraftInfo := &vo.DraftInfo{
				Canvas: string(data),
			}
			subWf2Data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/query_types/wf2.json")
			assert.NoError(t, err)

			subWf2ChildData, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/query_types/wf2child.json")
			assert.NoError(t, err)

			workflowRepo.EXPECT().GetWorkflowDraft(gomock.Any(), gomock.Any()).Return(mockDraftInfo, nil).AnyTimes()

			var mockGetWorkflowMeta = func(ctx context.Context, id int64, version string) (*vo.VersionInfo, error) {
				if id == 7498668117704163337 {
					return &vo.VersionInfo{
						Canvas: string(subWf2Data),
					}, nil
				}
				if id == 7498674832255615002 {
					return &vo.VersionInfo{
						Canvas: string(subWf2ChildData),
					}, nil
				}
				return nil, fmt.Errorf("not found")
			}

			workflowRepo.EXPECT().GetWorkflowVersion(gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(mockGetWorkflowMeta).AnyTimes()

			req := new(workflow.QueryWorkflowNodeTypeRequest)

			req.WorkflowID = "1"

			m, err := sonic.Marshal(req)
			assert.NoError(t, err)
			w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/node_type", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
				ut.Header{Key: "Content-Type", Value: "application/json"})

			res := w.Result()
			assert.Equal(t, http.StatusOK, res.StatusCode())

			response := &workflow.QueryWorkflowNodeTypeResponse{}
			err = sonic.Unmarshal(res.Body(), response)
			assert.NoError(t, err)

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
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		qaCount := 0
		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(_ int) (*schema.Message, error) {
				if qaCount == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your age?"}`,
					}, nil
				} else if qaCount == 2 {
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

		qaCount++

		userInput := "my name is eino"

		testResumeReq := &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       userInput,
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents

			t.Logf("first resume, workflow status: %s, success rate: %s, interruptEvents: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents)
		}

		qaCount++

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

		var outputMap = map[string]any{}
		err := sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"USER_RESPONSE": "1 year old",
			"name":          "eino",
			"age":           float64(1),
		}, outputMap)
	})
}

func TestNestedSubWorkflowWithInterrupt(t *testing.T) {
	mockey.PatchConvey("test nested sub workflow with interrupt", t, func() {
		h := server.Default()
		h.POST("/api/workflow_api/create", CreateWorkflow)
		h.POST("/api/workflow_api/save", SaveWorkflow)
		h.POST("/api/workflow_api/canvas", GetCanvasInfo)
		h.POST("/api/workflow_api/test_run", WorkFlowTestRun)
		h.GET("/api/workflow_api/get_process", GetWorkFlowProcess)
		h.POST("/api/workflow_api/test_resume", WorkFlowTestResume)

		ctrl := gomock.NewController(t)
		mockIDGen := mock.NewMockIDGenerator(ctrl)

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

		workflowRepo := service.NewWorkflowRepository(mockIDGen, db, redisClient)
		mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(service.NewWorkflowService(workflowRepo)).Build()
		mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build()

		mockSearchNotify := searchmock.NewMockNotifier(ctrl)
		mockey.Mock(crosssearch.GetNotifier).Return(mockSearchNotify).Build()
		mockSearchNotify.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel1 := &testutil.UTChatModel{
			StreamResultProvider: func(_ int) (*schema.StreamReader[*schema.Message], error) {
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
			StreamResultProvider: func(_ int) (*schema.StreamReader[*schema.Message], error) {
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

		mockIDGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).Times(1)
		topIDStr := loadWorkflow(t, h, "subworkflow/top_workflow.json")

		midIDStr := "7494849202016272435"
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7494849202016272435)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7494849202016272435), nil).Times(1)
			_ = loadWorkflow(t, h, "subworkflow/middle_workflow.json")
		}

		bottomIDStr := "7468899413567684634"
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7468899413567684634)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7468899413567684634), nil).Times(1)
			_ = loadWorkflow(t, h, "subworkflow/bottom_workflow.json")
		}

		inputIDStr := "7469607842648457243"
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflowDraft(context.Background(), 7469607842648457243)
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7469607842648457243), nil).Times(1)
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

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
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

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
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

		var outputMap = map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": "I don't know.\nI don't know too.\nb\n[new_a_more info 1 new_b_more info 2]",
		}, outputMap)
	})
}

func TestInterruptWithinBatch(t *testing.T) {
	mockey.PatchConvey("test interrupt within batch", t, func() {
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()
		mockModelManager.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(nil, nil).AnyTimes()

		idStr := loadWorkflow(t, h, "batch_with_inner_interrupt.json")

		_ = idStr

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

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
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

			t.Logf("first resume. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_InputNode, interruptEvents[0].Type)

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

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
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

			t.Logf("second resume. workflow status: %v, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_Question, interruptEvents[0].Type)

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       "answer 1",
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
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

			t.Logf("third resume. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		assert.Equal(t, 1, len(interruptEvents))
		assert.Equal(t, workflow.EventType_Question, interruptEvents[0].Type)

		testResumeReq = &workflow.WorkflowTestResumeRequest{
			WorkflowID: idStr,
			SpaceID:    ptr.Of("123"),
			ExecuteID:  testRunResp.Data.ExecuteID,
			EventID:    interruptEvents[0].ID,
			Data:       "answer 2",
		}

		_ = post[workflow.WorkflowTestResumeResponse](t, h, testResumeReq, "/api/workflow_api/test_resume")

		workflowStatus = workflow.WorkflowExeStatus_Running
		interruptEvents = []*workflow.NodeEvent{}
		var output string
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running || len(interruptEvents) > 0 {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			interruptEvents = getProcessResp.Data.NodeEvents
			output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output

			nodeKey2Output := make(map[string]string)
			for _, nodeResult := range getProcessResp.Data.NodeResults {
				nodeKey2Output[nodeResult.NodeId] = nodeResult.Output
			}

			t.Logf("third resume. workflow status: %d, success rate: %s, interruptEvents: %v, nodeKey2Output: %v", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output)

			if workflowStatus == workflow.WorkflowExeStatus_Fail {
				t.Errorf("workflow status is fail: %v", *getProcessResp.Data.Reason)
			}
		}

		var outputMap = map[string]any{}
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

		h := server.Default()
		h.POST("/api/workflow_api/create", CreateWorkflow)
		h.POST("/api/workflow_api/save", SaveWorkflow)
		h.POST("/api/workflow_api/delete", DeleteWorkflow)
		h.POST("/api/workflow_api/publish", PublishWorkflow)
		h.POST("/api/workflow_api/workflow_list", GetWorkFlowList)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockIDGen := mock.NewMockIDGenerator(ctrl)

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

		workflowRepo := service.NewWorkflowRepository(mockIDGen, db, redisClient)
		mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(service.NewWorkflowService(workflowRepo)).Build()
		mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build()
		mockSearchNotify := searchmock.NewMockNotifier(ctrl)
		mockey.Mock(crosssearch.GetNotifier).Return(mockSearchNotify).Build()
		mockSearchNotify.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

		id := time.Now().UnixMilli()
		idStr := strconv.FormatInt(id, 10)

		mockIDGen.EXPECT().GenID(gomock.Any()).Return(id, nil).Times(1)

		loadWorkflowWithWorkflowName(t, h, "pb_wf", "publish/publish_workflow.json")

		listResponse := post[workflow.GetWorkFlowListResponse](t, h, &workflow.GetWorkFlowListRequest{
			Page:   ptr.Of(int32(1)),
			Size:   ptr.Of(int32(10)),
			Type:   ptr.Of(workflow.WorkFlowType_User),
			Status: ptr.Of(workflow.WorkFlowListStatus_UnPublished),
			Name:   ptr.Of("pb_wf"),
		}, "/api/workflow_api/workflow_list")

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))
		publishReq := &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
			WorkflowVersion:    ptr.Of("v0.0.1"),
			VersionDescription: ptr.Of("version v0.1.1"),
		}
		response := post[workflow.PublishWorkflowResponse](t, h, publishReq, "/api/workflow_api/publish")
		assert.Equal(t, response.Data.WorkflowID, idStr)

		listResponse = post[workflow.GetWorkFlowListResponse](t, h, &workflow.GetWorkFlowListRequest{
			Page:   ptr.Of(int32(1)),
			Size:   ptr.Of(int32(10)),
			Type:   ptr.Of(workflow.WorkFlowType_User),
			Status: ptr.Of(workflow.WorkFlowListStatus_HadPublished),
			Name:   ptr.Of("pb_w"),
		}, "/api/workflow_api/workflow_list")

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))

		publishReq = &workflow.PublishWorkflowRequest{
			WorkflowID:         idStr,
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
		h := server.Default()
		h.POST("/api/workflow_api/create", CreateWorkflow)
		h.POST("/api/workflow_api/save", SaveWorkflow)
		h.POST("/api/workflow_api/delete", DeleteWorkflow)
		h.POST("/api/workflow_api/canvas", GetCanvasInfo)
		h.POST("/api/workflow_api/publish", PublishWorkflow)
		h.POST("/api/workflow_api/test_run", WorkFlowTestRun)
		h.GET("/api/workflow_api/get_process", GetWorkFlowProcess)

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockIDGen := mock.NewMockIDGenerator(ctrl)

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

		workflowRepo := service.NewWorkflowRepository(mockIDGen, db, redisClient)
		mockey.Mock(appworkflow.GetWorkflowDomainSVC).Return(service.NewWorkflowService(workflowRepo)).Build()
		mockey.Mock(workflow2.GetRepository).Return(workflowRepo).Build()

		mockSearchNotify := searchmock.NewMockNotifier(ctrl)
		mockey.Mock(crosssearch.GetNotifier).Return(mockSearchNotify).Build()
		mockSearchNotify.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

		id := time.Now().UnixMilli()
		idStr := strconv.FormatInt(id, 10)
		mockIDGen.EXPECT().GenID(gomock.Any()).Return(id, nil).Times(1)

		loadWorkflow(t, h, "get_canvas/get_canvas.json")

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

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

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
		h, ctrl, _ := prepareWorkflowIntegration(t, true)
		defer ctrl.Finish()

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

func TestWorkflowAsTool(t *testing.T) {
	mockey.PatchConvey("test workflow as tool", t, func() {
		mockey.PatchConvey("simple invokable tool with return variables", func() {
			h, ctrl, mockIDGen := prepareWorkflowIntegration(t, false)
			defer ctrl.Finish()

			ensureWorkflowVersion(t, h, 7492075279843737651, "v0.0.1", "function_call/tool_workflow_1.json", mockIDGen)

			mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return time.Now().UnixNano(), nil
			}).AnyTimes()

			mockModelManager := mockmodel.NewMockManager(ctrl)
			mockey.Mock(model.GetManager).Return(mockModelManager).Build()

			chatModel := &testutil.UTChatModel{
				InvokeResultProvider: func(index int) (*schema.Message, error) {
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
							Content: `{"output": "final_answer"}`,
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
			// TODO: verify the tokens
			for {
				if workflowStatus != workflow.WorkflowExeStatus_Running {
					break
				}

				getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

				workflowStatus = getProcessResp.Data.ExecuteStatus
				if len(getProcessResp.Data.NodeResults) > 0 {
					output = getProcessResp.Data.NodeResults[len(getProcessResp.Data.NodeResults)-1].Output
				}
				t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			var outputMap = map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"output": "final_answer",
			}, outputMap)

			assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)
		})

		mockey.PatchConvey("return directly streamable tool", func() {
			h, ctrl, mockIDGen := prepareWorkflowIntegration(t, false)
			defer ctrl.Finish()

			mockModelManager := mockmodel.NewMockManager(ctrl)
			mockey.Mock(model.GetManager).Return(mockModelManager).Build()

			outerModel := &testutil.UTChatModel{
				StreamResultProvider: func(index int) (*schema.StreamReader[*schema.Message], error) {
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
				StreamResultProvider: func(index int) (*schema.StreamReader[*schema.Message], error) {
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
				t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
			}

			var outputMap = map[string]any{}
			err := sonic.UnmarshalString(output, &outputMap)
			assert.NoError(t, err)
			assert.Equal(t, map[string]any{
				"output": "this is the streaming output I don't know.",
			}, outputMap)

			assert.Equal(t, workflowStatus, workflow.WorkflowExeStatus_Success)
		})
	})
}
