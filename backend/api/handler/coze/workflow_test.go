package coze

import (
	"bytes"
	"net/http"
	"os"
	"strconv"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestNodeTemplateList(t *testing.T) {
	h := server.Default()
	h.POST("/api/workflow_api/node_template_list", NodeTemplateList)
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

		db, err := mysql.New()
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
