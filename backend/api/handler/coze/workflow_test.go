package coze

import (
	"bytes"

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

func prepareWorkflowIntegration(t *testing.T) (*server.Hertz, *gomock.Controller) {
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

	ctrl := gomock.NewController(t)
	mockIDGen := mock.NewMockIDGenerator(ctrl)
	mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
		return time.Now().UnixNano(), nil
	}).AnyTimes()

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

	return h, ctrl
}

func post[T any](t *testing.T, h *server.Hertz, req any, url string) *T {
	m, err := sonic.Marshal(req)
	assert.NoError(t, err)
	w := ut.PerformRequest(h.Engine, "POST", url, &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	assert.Equal(t, http.StatusOK, res.StatusCode())
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

	return getProcessResp
}

func TestNodeTemplateList(t *testing.T) {
	mockey.PatchConvey("test node template list", t, func() {
		h, ctrl := prepareWorkflowIntegration(t)
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
		h, ctrl := prepareWorkflowIntegration(t)
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

		m, err := sonic.Marshal(createReq)
		assert.NoError(t, err)
		w := ut.PerformRequest(h.Engine, "POST", "/api/workflow_api/canvas", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		res := w.Result()
		assert.Equal(t, http.StatusInternalServerError, res.StatusCode())
	})
}

func TestTestRunAndGetProcess(t *testing.T) {
	mockey.PatchConvey("test test_run and get_process", t, func() {
		h, ctrl := prepareWorkflowIntegration(t)
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

		workflowStatus := workflow.WorkflowExeStatus_Running
		for {
			if workflowStatus != workflow.WorkflowExeStatus_Running {
				break
			}

			getProcessResp := getProcess(t, h, idStr, testRunResp.Data.ExecuteID)

			workflowStatus = getProcessResp.Data.ExecuteStatus
			t.Logf("workflow status: %s, success rate: %s", workflowStatus, getProcessResp.Data.Rate)
		}
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
		cs := make(map[string]*vo.Canvas)
		err := json.Unmarshal(canvasMapByte, &cs)
		assert.NoError(t, err)

		workflowRepo.EXPECT().BatchGetSubWorkflowCanvas(gomock.Any(), gomock.Any()).Return(cs, nil).AnyTimes()

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
		h, ctrl := prepareWorkflowIntegration(t)
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
			t.Logf("after resume. workflow status: %s, success rate: %s, interruptEvents: %v, lastOutput= %s, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, output, lastResult.WorkflowExeCost)
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

func TestTestResumeWithQANode(t *testing.T) {
	mockey.PatchConvey("test test_resume with qa node", t, func() {
		h, ctrl := prepareWorkflowIntegration(t)
		defer ctrl.Finish()

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		qaCount := 0
		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func() (*schema.Message, error) {
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

		mockModelManager := mockmodel.NewMockManager(ctrl)
		mockey.Mock(model.GetManager).Return(mockModelManager).Build()

		chatModel1 := &testutil.UTChatModel{
			StreamResultProvider: func() (*schema.StreamReader[*schema.Message], error) {
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
			StreamResultProvider: func() (*schema.StreamReader[*schema.Message], error) {
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
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflow(context.Background(), &entity.WorkflowIdentity{
			ID: 7494849202016272435,
		})
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7494849202016272435), nil).Times(1)
			_ = loadWorkflow(t, h, "subworkflow/middle_workflow.json")
		}

		bottomIDStr := "7469607842648457243"
		_, err = appworkflow.GetWorkflowDomainSVC().GetWorkflow(context.Background(), &entity.WorkflowIdentity{
			ID: 7469607842648457243,
		})
		if err != nil {
			mockIDGen.EXPECT().GenID(gomock.Any()).Return(int64(7469607842648457243), nil).Times(1)
			_ = loadWorkflow(t, h, "subworkflow/bottom_workflow.json")
		}

		mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
			return time.Now().UnixNano(), nil
		}).AnyTimes()

		t.Logf("topID: %s, midID: %s, bottomID: %s", topIDStr, midIDStr, bottomIDStr)

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
		}

		userInput := map[string]any{
			"input": "more info",
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

			t.Logf("after resume. workflow status: %s, success rate: %s, interruptEvents: %v, nodeKey2Output= %v, duration= %s", workflowStatus, getProcessResp.Data.Rate, interruptEvents, nodeKey2Output, getProcessResp.Data.WorkflowExeCost)
		}

		var outputMap = map[string]any{}
		err = sonic.UnmarshalString(output, &outputMap)
		assert.NoError(t, err)
		assert.Equal(t, map[string]any{
			"output": "I don't know.\nI don't know too.\nmore info",
		}, outputMap)
	})
}
