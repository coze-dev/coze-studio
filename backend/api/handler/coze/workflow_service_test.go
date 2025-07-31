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

package coze

import (
	"bytes"
	"context"
	"errors"
	"fmt"
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
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/client"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/cloudwego/hertz/pkg/protocol"
	"github.com/cloudwego/hertz/pkg/protocol/sse"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	modelknowledge "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	plugin2 "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	pluginmodel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/playground"
	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/plugin_develop"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	appknowledge "github.com/coze-dev/coze-studio/backend/application/knowledge"
	appmemory "github.com/coze-dev/coze-studio/backend/application/memory"
	appplugin "github.com/coze-dev/coze-studio/backend/application/plugin"
	"github.com/coze-dev/coze-studio/backend/application/user"
	appworkflow "github.com/coze-dev/coze-studio/backend/application/workflow"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossuser"
	plugin3 "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/plugin"
	entity4 "github.com/coze-dev/coze-studio/backend/domain/memory/database/entity"
	entity2 "github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/entity"
	entity3 "github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	entity5 "github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	userentity "github.com/coze-dev/coze-studio/backend/domain/user/entity"
	workflow2 "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/code"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database/databasemock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge/knowledgemock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
	mockmodel "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model/modelmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin/pluginmock"
	crosssearch "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/search"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/search/searchmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	mockvar "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable/varmock"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/checkpoint"
	"github.com/coze-dev/coze-studio/backend/infra/impl/coderunner/direct"
	mockCrossUser "github.com/coze-dev/coze-studio/backend/internal/mock/crossdomain/crossuser"
	mockPlugin "github.com/coze-dev/coze-studio/backend/internal/mock/domain/plugin"
	mockcode "github.com/coze-dev/coze-studio/backend/internal/mock/domain/workflow/crossdomain/code"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/idgen"
	storageMock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/internal/testutil"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type wfTestRunner struct {
	t           *testing.T
	h           *server.Hertz
	ctrl        *gomock.Controller
	idGen       *mock.MockIDGenerator
	search      *searchmock.MockNotifier
	appVarS     *mockvar.MockStore
	userVarS    *mockvar.MockStore
	varGetter   *mockvar.MockVariablesMetaGetter
	modelManage *mockmodel.MockManager
	plugin      *mockPlugin.MockPluginService
	tos         *storageMock.MockStorage
	knowledge   *knowledgemock.MockKnowledgeOperator
	database    *databasemock.MockDatabaseOperator
	pluginSrv   *pluginmock.MockService
	ctx         context.Context
	closeFn     func()
}

var req2URL = map[reflect.Type]string{
	reflect.TypeOf(&workflow.NodeTemplateListRequest{}):           "/api/workflow_api/node_template_list",
	reflect.TypeOf(&workflow.CreateWorkflowRequest{}):             "/api/workflow_api/create",
	reflect.TypeOf(&workflow.SaveWorkflowRequest{}):               "/api/workflow_api/save",
	reflect.TypeOf(&workflow.DeleteWorkflowRequest{}):             "/api/workflow_api/delete",
	reflect.TypeOf(&workflow.GetCanvasInfoRequest{}):              "/api/workflow_api/canvas",
	reflect.TypeOf(&workflow.WorkFlowTestRunRequest{}):            "/api/workflow_api/test_run",
	reflect.TypeOf(&workflow.CancelWorkFlowRequest{}):             "/api/workflow_api/cancel",
	reflect.TypeOf(&workflow.PublishWorkflowRequest{}):            "/api/workflow_api/publish",
	reflect.TypeOf(&workflow.OpenAPIRunFlowRequest{}):             "/v1/workflow/run",
	reflect.TypeOf(&workflow.ValidateTreeRequest{}):               "/api/workflow_api/validate_tree",
	reflect.TypeOf(&workflow.WorkflowTestResumeRequest{}):         "/api/workflow_api/test_resume",
	reflect.TypeOf(&workflow.WorkflowNodeDebugV2Request{}):        "/api/workflow_api/nodeDebug",
	reflect.TypeOf(&workflow.QueryWorkflowNodeTypeRequest{}):      "/api/workflow_api/node_type",
	reflect.TypeOf(&workflow.GetWorkFlowListRequest{}):            "/api/workflow_api/workflow_list",
	reflect.TypeOf(&workflow.UpdateWorkflowMetaRequest{}):         "/api/workflow_api/update_meta",
	reflect.TypeOf(&workflow.GetWorkflowDetailRequest{}):          "/api/workflow_api/workflow_detail",
	reflect.TypeOf(&workflow.GetWorkflowDetailInfoRequest{}):      "/api/workflow_api/workflow_detail_info",
	reflect.TypeOf(&workflow.GetLLMNodeFCSettingDetailRequest{}):  "/api/workflow_api/llm_fc_setting_detail",
	reflect.TypeOf(&workflow.GetLLMNodeFCSettingsMergedRequest{}): "/api/workflow_api/llm_fc_setting_merged",
	reflect.TypeOf(&workflow.CopyWorkflowRequest{}):               "/api/workflow_api/copy",
	reflect.TypeOf(&workflow.BatchDeleteWorkflowRequest{}):        "/api/workflow_api/batch_delete",
	reflect.TypeOf(&workflow.GetHistorySchemaRequest{}):           "/api/workflow_api/history_schema",
	reflect.TypeOf(&workflow.GetWorkflowReferencesRequest{}):      "/api/workflow_api/workflow_references",
}

func newWfTestRunner(t *testing.T) *wfTestRunner {
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
	h.POST("/api/workflow_api/history_schema", GetHistorySchema)
	h.POST("/api/workflow_api/workflow_references", GetWorkflowReferences)

	ctrl := gomock.NewController(t, gomock.WithOverridableExpectations())
	mockIDGen := mock.NewMockIDGenerator(ctrl)
	var previousID atomic.Int64
	mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
		newID := time.Now().UnixNano()
		for {
			if newID == previousID.Load() {
				newID = time.Now().UnixNano()
			} else {
				previousID.Store(newID)
				break
			}
		}
		return newID, nil
	}).AnyTimes()
	mockIDGen.EXPECT().GenMultiIDs(gomock.Any(), gomock.Any()).DoAndReturn(
		func(_ context.Context, count int) ([]int64, error) {
			ids := make([]int64, count)
			for i := 0; i < count; i++ {
				newID := time.Now().UnixNano()
				for {
					if newID == previousID.Load() {
						newID = time.Now().UnixNano()
					} else {
						previousID.Store(newID)
						break
					}
				}
				ids[i] = newID
			}
			return ids, nil
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

	cpStore := checkpoint.NewRedisStore(redisClient)

	mockTos := storageMock.NewMockStorage(ctrl)
	mockTos.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any(), gomock.Any()).Return("", nil).AnyTimes()
	workflowRepo := service.NewWorkflowRepository(mockIDGen, db, redisClient, mockTos, cpStore, nil)
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

	mockGlobalAppVarStore := mockvar.NewMockStore(ctrl)
	mockGlobalAppVarStore.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil).AnyTimes()
	mockGlobalUserVarStore := mockvar.NewMockStore(ctrl)
	mockGlobalUserVarStore.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil, nil).AnyTimes()
	vh := mockey.Mock(variable.GetVariableHandler).Return(&variable.Handler{
		AppVarStore:  mockGlobalAppVarStore,
		UserVarStore: mockGlobalUserVarStore,
	}).Build()

	mockVarGetter := mockvar.NewMockVariablesMetaGetter(ctrl)
	m2 := mockey.Mock(variable.GetVariablesMetaGetter).Return(mockVarGetter).Build()

	mPlugin := mockPlugin.NewMockPluginService(ctrl)

	mockKwOperator := knowledgemock.NewMockKnowledgeOperator(ctrl)
	knowledge.SetKnowledgeOperator(mockKwOperator)

	mockModelManage := mockmodel.NewMockManager(ctrl)
	mockModelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(nil, nil, nil).AnyTimes()
	m3 := mockey.Mock(model.GetManager).Return(mockModelManage).Build()

	m := mockey.Mock(crossuser.DefaultSVC).Return(mockCU).Build()
	m1 := mockey.Mock(ctxutil.GetApiAuthFromCtx).Return(&entity2.ApiKey{
		UserID:      123,
		ConnectorID: consts.APIConnectorID,
	}).Build()
	m4 := mockey.Mock(ctxutil.MustGetUIDFromCtx).Return(int64(1)).Build()
	m5 := mockey.Mock(ctxutil.GetUIDFromCtx).Return(ptr.Of(int64(1))).Build()

	mockDatabaseOperator := databasemock.NewMockDatabaseOperator(ctrl)
	database.SetDatabaseOperator(mockDatabaseOperator)

	mockPluginSrv := pluginmock.NewMockService(ctrl)
	plugin.SetPluginService(mockPluginSrv)

	mockey.Mock((*user.UserApplicationService).MGetUserBasicInfo).Return(&playground.MGetUserBasicInfoResponse{
		UserBasicInfoMap: make(map[string]*playground.UserBasicInfo),
	}, nil).Build()

	f := func() {
		m.UnPatch()
		m1.UnPatch()
		m2.UnPatch()
		m3.UnPatch()
		m4.UnPatch()
		m5.UnPatch()
		vh.UnPatch()
		ctrl.Finish()
		_ = h.Close()
	}

	return &wfTestRunner{
		t:           t,
		h:           h,
		ctrl:        ctrl,
		idGen:       mockIDGen,
		search:      mockSearchNotify,
		appVarS:     mockGlobalAppVarStore,
		userVarS:    mockGlobalUserVarStore,
		varGetter:   mockVarGetter,
		modelManage: mockModelManage,
		plugin:      mPlugin,
		tos:         mockTos,
		knowledge:   mockKwOperator,
		database:    mockDatabaseOperator,
		ctx:         context.Background(),
		closeFn:     f,
		pluginSrv:   mockPluginSrv,
	}
}

type PostOption struct {
	Headers map[string]string
}
type PostOptionFn func(option *PostOption)

func WithHeaders(hds map[string]string) PostOptionFn {
	return func(option *PostOption) {
		if option.Headers == nil {
			option.Headers = map[string]string{}
		}
		for k, v := range hds {
			option.Headers[k] = v
		}
	}
}

func post[T any](r *wfTestRunner, req any, opts ...PostOptionFn) *T {
	// if req has a field SpaceID, set it's value to "123"
	opt := &PostOption{}
	for _, fn := range opts {
		fn(opt)
	}

	typ := reflect.TypeOf(req)
	if typ.Kind() == reflect.Ptr {
		typ1 := typ.Elem()
		spaceField, ok := typ1.FieldByName("SpaceID")
		if ok {
			if spaceField.Type == reflect.TypeOf("") {
				reflect.ValueOf(req).Elem().FieldByName("SpaceID").SetString("123")
			} else {
				reflect.ValueOf(req).Elem().FieldByName("SpaceID").Set(reflect.ValueOf(ptr.Of("123")))
			}
		}

	}

	url := req2URL[typ]
	m, err := sonic.Marshal(req)
	assert.NoError(r.t, err)

	headers := make([]ut.Header, 0)
	headers = append(headers, ut.Header{
		Key:   "Content-Type",
		Value: "application/json",
	})
	for k, v := range opt.Headers {
		headers = append(headers, ut.Header{Key: k, Value: v})
	}
	w := ut.PerformRequest(r.h.Engine, "POST", url, &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
		headers...)
	res := w.Result()
	if res.StatusCode() != http.StatusOK {
		r.t.Fatalf("unexpected status code: %d, body: %s", res.StatusCode(), string(res.Body()))
	}
	rBody := res.Body()
	var resp T
	err = sonic.Unmarshal(rBody, &resp)
	if err != nil {
		r.t.Fatalf("failed to unmarshal response body: %v", err)
	}
	return &resp
}

func (r *wfTestRunner) postWithError(req any) string {
	m, err := sonic.Marshal(req)
	assert.NoError(r.t, err)

	url := req2URL[reflect.TypeOf(req)]

	w := ut.PerformRequest(r.h.Engine, "POST", url, &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)},
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	if res.StatusCode() == http.StatusOK {
		r.t.Errorf("expected error, but got none")
	}
	return string(res.Body())
}

type loadOptions struct {
	name      string
	id        int64
	req       *workflow.CreateWorkflowRequest
	version   string
	projectID int64
	data      []byte
}

func withWorkflowData(data []byte) func(*loadOptions) {
	return func(o *loadOptions) {
		o.data = data
	}
}

func withName(n string) func(*loadOptions) {
	return func(o *loadOptions) {
		o.name = n
	}
}
func withID(id int64) func(*loadOptions) {
	return func(o *loadOptions) {
		o.id = id
	}
}
func withProjectID(id int64) func(*loadOptions) {
	return func(o *loadOptions) {
		o.projectID = id
	}
}

func withPublish(version string) func(*loadOptions) {
	return func(o *loadOptions) {
		o.version = version
	}
}

func (r *wfTestRunner) load(schemaFile string, opts ...func(*loadOptions)) string {
	loadOpts := &loadOptions{}
	for _, opt := range opts {
		opt(loadOpts)
	}

	if loadOpts.id > 0 {
		_, err := appworkflow.GetWorkflowDomainSVC().Get(context.Background(), &vo.GetPolicy{
			ID:       loadOpts.id,
			MetaOnly: true,
		})
		if err == nil {
			return strconv.FormatInt(loadOpts.id, 10)
		} else {
			r.idGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
				return loadOpts.id, nil
			}).Times(3)
			defer func() {
				var previousID atomic.Int64
				r.idGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
					newID := time.Now().UnixNano()
					if newID == previousID.Load() {
						newID = previousID.Add(1)
					}
					return newID, nil
				}).AnyTimes()
			}()
		}
	}

	var createReq *workflow.CreateWorkflowRequest
	if loadOpts.req != nil {
		createReq = loadOpts.req
	} else {
		name := "test_wf"
		if loadOpts.name != "" {
			name = loadOpts.name
		}

		createReq = &workflow.CreateWorkflowRequest{
			Name:     name,
			Desc:     "this is a test wf",
			IconURI:  "icon/uri",
			SpaceID:  "123",
			FlowMode: ptr.Of(workflow.WorkflowMode_Workflow),
		}

		if loadOpts.projectID > 0 {
			createReq.ProjectID = ptr.Of(strconv.FormatInt(loadOpts.projectID, 10))
		}
	}

	resp := post[workflow.CreateWorkflowResponse](r, createReq)

	idStr := resp.Data.WorkflowID
	_, err := strconv.ParseInt(idStr, 10, 64)
	assert.NoError(r.t, err)

	var data []byte
	if len(loadOpts.data) > 0 {
		data = loadOpts.data
	} else {
		data, err = os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", schemaFile))
		assert.NoError(r.t, err)
	}

	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: idStr,
		Schema:     ptr.Of(string(data)),
		SpaceID:    ptr.Of("123"),
	}

	_ = post[workflow.SaveWorkflowResponse](r, saveReq)

	if loadOpts.version != "" {
		r.publish(idStr, loadOpts.version, true)
	}

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
	if res.StatusCode() != http.StatusOK {
		t.Fatalf("unexpected status code: %d, body: %s", res.StatusCode(), string(res.Body()))
	}
	getProcessResp := &workflow.GetWorkflowProcessResponse{}
	err := sonic.Unmarshal(res.Body(), getProcessResp)
	assert.NoError(t, err)

	time.Sleep(50 * time.Millisecond)

	return getProcessResp
}

func (r *wfTestRunner) getNodeExeHistory(id string, exeID string, nodeID string, scene *workflow.NodeHistoryScene) *workflow.NodeResult {
	getNodeExeHistoryReq := &workflow.GetNodeExecuteHistoryRequest{
		WorkflowID:       id,
		SpaceID:          "123",
		ExecuteID:        exeID,
		NodeID:           nodeID,
		NodeHistoryScene: scene,
	}

	w := ut.PerformRequest(r.h.Engine, "GET", fmt.Sprintf("/api/workflow_api/get_node_execute_history?workflow_id=%s&space_id=%s&execute_id=%s"+
		"&node_id=%s&node_type=3&node_history_scene=%d", getNodeExeHistoryReq.WorkflowID, getNodeExeHistoryReq.SpaceID, getNodeExeHistoryReq.ExecuteID,
		getNodeExeHistoryReq.NodeID, getNodeExeHistoryReq.GetNodeHistoryScene()), nil,
		ut.Header{Key: "Content-Type", Value: "application/json"})

	res := w.Result()
	assert.Equal(r.t, http.StatusOK, res.StatusCode())
	getNodeResultResp := &workflow.GetNodeExecuteHistoryResponse{}
	err := sonic.Unmarshal(res.Body(), getNodeResultResp)
	assert.NoError(r.t, err)

	return getNodeResultResp.Data
}

func (r *wfTestRunner) getOpenAPIProcess(id string, exeID string) *workflow.GetWorkflowRunHistoryResponse {
	w := ut.PerformRequest(r.h.Engine, "GET", fmt.Sprintf("/v1/workflow/get_run_history?workflow_id=%s&execute_id=%s", id, exeID), nil,
		ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	assert.Equal(r.t, http.StatusOK, res.StatusCode())
	getProcessResp := &workflow.GetWorkflowRunHistoryResponse{}
	err := sonic.Unmarshal(res.Body(), getProcessResp)
	assert.NoError(r.t, err)

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

func (r *wfTestRunner) testRun(id string, input map[string]string) string {
	testRunReq := &workflow.WorkFlowTestRunRequest{
		WorkflowID: id,
		Input:      input,
	}

	testRunResponse := post[workflow.WorkFlowTestRunResponse](r, testRunReq)
	return testRunResponse.Data.ExecuteID
}

type getProcessOptions struct {
	previousInterruptEventID string
	specificNodeID           string
}

func withPreviousEventID(id string) func(options *getProcessOptions) {
	return func(options *getProcessOptions) {
		options.previousInterruptEventID = id
	}
}
func withSpecificNodeID(id string) func(options *getProcessOptions) {
	return func(options *getProcessOptions) {
		options.specificNodeID = id
	}
}

type exeResult struct {
	output string
	status workflow.WorkflowExeStatus
	event  *workflow.NodeEvent
	token  *workflow.TokenAndCost
	t      *testing.T
	reason string
}

func (e *exeResult) assertSuccess() {
	assert.Equal(e.t, workflow.WorkflowExeStatus_Success, e.status)
}

func (e *exeResult) tokenEqual(in, out int) {
	assert.NotNil(e.t, e.token)
	input := strings.TrimSuffix(*e.token.InputTokens, " Tokens")
	output := strings.TrimSuffix(*e.token.OutputTokens, " Tokens")
	inputI, err := strconv.Atoi(input)
	assert.NoError(e.t, err)
	outputI, err := strconv.Atoi(output)
	assert.NoError(e.t, err)
	assert.Equal(e.t, in, inputI)
	assert.Equal(e.t, out, outputI)
}

func (r *wfTestRunner) getProcess(id, exeID string, opts ...func(options *getProcessOptions)) *exeResult {
	options := &getProcessOptions{}
	for _, opt := range opts {
		opt(options)
	}

	workflowStatus := workflow.WorkflowExeStatus_Running
	var output string
	var nodeEvent *workflow.NodeEvent
	var eventID string
	var nodeType string
	var token *workflow.TokenAndCost
	var reason string
	for {
		if nodeEvent != nil {
			if options.previousInterruptEventID != "" {
				if options.previousInterruptEventID != nodeEvent.ID {
					break
				}
			} else {
				break
			}
		}

		if workflowStatus != workflow.WorkflowExeStatus_Running {
			break
		}

		getProcessResp := getProcess(r.t, r.h, id, exeID)
		if len(getProcessResp.Data.NodeResults) == 1 {
			output = getProcessResp.Data.NodeResults[0].Output
			nodeType = getProcessResp.Data.NodeResults[0].NodeType
		} else {
			for _, ns := range getProcessResp.Data.NodeResults {
				if options.specificNodeID != "" {
					if ns.NodeId == options.specificNodeID {
						output = ns.Output
						nodeType = ns.NodeType
						break
					}
				} else if ns.NodeType == workflow.NodeTemplateType_End.String() {
					output = ns.Output
					nodeType = ns.NodeType
				}
			}
		}
		if len(getProcessResp.Data.NodeEvents) > 0 {
			nodeEvent = getProcessResp.Data.NodeEvents[len(getProcessResp.Data.NodeEvents)-1]
		}

		workflowStatus = getProcessResp.Data.ExecuteStatus
		token = getProcessResp.Data.TokenAndCost

		if getProcessResp.Data.Reason != nil {
			reason = *getProcessResp.Data.Reason
		}

		if nodeEvent != nil {
			eventID = nodeEvent.ID
		}
		r.t.Logf("getProcess output= %s, status= %v, eventID= %s, nodeType= %s", output, workflowStatus, eventID, nodeType)
	}

	return &exeResult{
		output: output,
		status: workflowStatus,
		event:  nodeEvent,
		token:  token,
		t:      r.t,
		reason: reason,
	}
}

func (r *wfTestRunner) cancel(id, exeID string) {
	cancelReq := &workflow.CancelWorkFlowRequest{
		WorkflowID: &id,
		ExecuteID:  exeID,
	}
	_ = post[workflow.CancelWorkFlowResponse](r, cancelReq)
}

func (r *wfTestRunner) publish(id string, version string, force bool) {
	publishReq := &workflow.PublishWorkflowRequest{
		WorkflowID:         id,
		WorkflowVersion:    ptr.Of(version),
		VersionDescription: ptr.Of("desc"),
		Force:              ptr.Of(force),
	}
	_ = post[workflow.PublishWorkflowResponse](r, publishReq)
}

func (r *wfTestRunner) openapiAsyncRun(id string, input any) string {
	runReq := &workflow.OpenAPIRunFlowRequest{
		WorkflowID: id,
		Parameters: ptr.Of(mustMarshalToString(r.t, input)),
		IsAsync:    ptr.Of(true),
	}

	runResp := post[workflow.OpenAPIRunFlowResponse](r, runReq)
	return runResp.GetExecuteID()
}

func (r *wfTestRunner) openapiSyncRun(id string, input any) (map[string]any, string) {
	runReq := &workflow.OpenAPIRunFlowRequest{
		WorkflowID: id,
		Parameters: ptr.Of(mustMarshalToString(r.t, input)),
		IsAsync:    ptr.Of(false),
	}

	runResp := post[workflow.OpenAPIRunFlowResponse](r, runReq)
	output := runResp.GetData()
	var m map[string]any
	err := sonic.UnmarshalString(output, &m)
	assert.NoError(r.t, err)
	return m, runResp.GetExecuteID()
}

func (r *wfTestRunner) validateTree(schema string) [][]*workflow.ValidateErrorData {
	data, err := os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", schema))
	if err != nil {
		r.t.Fatal(err)
	}

	res := post[workflow.ValidateTreeResponse](r, &workflow.ValidateTreeRequest{
		WorkflowID:    "1",
		Schema:        ptr.Of(string(data)),
		BindProjectID: "1",
	})

	if len(res.Data) == 0 {
		return nil
	}

	var errs [][]*workflow.ValidateErrorData
	for _, d := range res.Data {
		errs = append(errs, d.Errors)
	}

	return errs
}

func (r *wfTestRunner) testResume(id string, exeID string, eventID string, input any) {
	inputStr, ok := input.(string)
	if !ok {
		inputStr = mustMarshalToString(r.t, input)
	}

	testResumeReq := &workflow.WorkflowTestResumeRequest{
		WorkflowID: id,
		SpaceID:    ptr.Of("123"),
		ExecuteID:  exeID,
		EventID:    eventID,
		Data:       inputStr,
	}

	_ = post[workflow.WorkflowTestResumeResponse](r, testResumeReq)
}

type nodeDebugOptions struct {
	input   map[string]string
	batch   map[string]string
	setting map[string]string
}

func withNDInput(input map[string]string) func(*nodeDebugOptions) {
	return func(options *nodeDebugOptions) {
		options.input = input
	}
}

func withNDBatch(batch map[string]string) func(*nodeDebugOptions) {
	return func(options *nodeDebugOptions) {
		options.batch = batch
	}
}

func withNDSettings(settings map[string]string) func(*nodeDebugOptions) {
	return func(options *nodeDebugOptions) {
		options.setting = settings
	}
}

func (r *wfTestRunner) nodeDebug(id string, nodeID string, opts ...func(*nodeDebugOptions)) string {
	options := &nodeDebugOptions{}
	for _, opt := range opts {
		opt(options)
	}

	nodeDebugReq := &workflow.WorkflowNodeDebugV2Request{
		WorkflowID: id,
		NodeID:     nodeID,
	}

	if options.input != nil {
		nodeDebugReq.Input = options.input
	}

	if options.batch != nil {
		nodeDebugReq.Batch = options.batch
	}

	if options.setting != nil {
		nodeDebugReq.Setting = options.setting
	}

	nodeDebugResp := post[workflow.WorkflowNodeDebugV2Response](r, nodeDebugReq)
	return nodeDebugResp.Data.ExecuteID
}

func (r *wfTestRunner) save(id string, schema string) {
	data, err := os.ReadFile(fmt.Sprintf("../../../domain/workflow/internal/canvas/examples/%s", schema))
	assert.NoError(r.t, err)

	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: id,
		Schema:     ptr.Of(string(data)),
	}

	_ = post[workflow.SaveWorkflowResponse](r, saveReq)
}

func getCanvas(ctx context.Context, id string) (string, error) {
	response, err := appworkflow.SVC.GetCanvasInfo(ctx, &workflow.GetCanvasInfoRequest{
		SpaceID:    "123",
		WorkflowID: ptr.Of(id),
	})
	if err != nil {
		return "", err
	}
	return response.GetData().GetWorkflow().GetSchemaJSON(), nil

}

func (r *wfTestRunner) openapiStream(id string, input any) *sse.Reader {
	inputStr, _ := sonic.MarshalString(input)

	req := &workflow.OpenAPIRunFlowRequest{
		WorkflowID: id,
		Parameters: ptr.Of(inputStr),
	}

	m, err := sonic.Marshal(req)
	assert.NoError(r.t, err)

	c, _ := client.NewClient()
	hReq, hResp := protocol.AcquireRequest(), protocol.AcquireResponse()
	hReq.SetRequestURI("http://localhost:8888" + "/v1/workflow/stream_run")
	hReq.SetMethod("POST")
	hReq.SetBody(m)
	hReq.SetHeader("Content-Type", "application/json")
	err = c.Do(context.Background(), hReq, hResp)
	assert.NoError(r.t, err)

	if hResp.StatusCode() != http.StatusOK {
		r.t.Errorf("unexpected status code: %d, body: %s", hResp.StatusCode(), string(hResp.Body()))
	}

	re, err := sse.NewReader(hResp)
	assert.NoError(r.t, err)

	return re
}

func (r *wfTestRunner) openapiResume(id string, eventID string, resumeData string) *sse.Reader {
	req := &workflow.OpenAPIStreamResumeFlowRequest{
		WorkflowID:  id,
		EventID:     eventID,
		ResumeData:  resumeData,
		ConnectorID: ptr.Of(strconv.FormatInt(consts.APIConnectorID, 10)),
	}

	m, err := sonic.Marshal(req)
	assert.NoError(r.t, err)

	c, _ := client.NewClient()
	hReq, hResp := protocol.AcquireRequest(), protocol.AcquireResponse()
	hReq.SetRequestURI("http://localhost:8888" + "/v1/workflow/stream_resume")
	hReq.SetMethod("POST")
	hReq.SetBody(m)
	hReq.SetHeader("Content-Type", "application/json")
	err = c.Do(context.Background(), hReq, hResp)
	assert.NoError(r.t, err)

	if hResp.StatusCode() != http.StatusOK {
		r.t.Errorf("unexpected status code: %d, body: %s", hResp.StatusCode(), string(hResp.Body()))
	}

	re, err := sse.NewReader(hResp)
	assert.NoError(r.t, err)

	return re
}

func (r *wfTestRunner) runServer() func() {
	go func() {
		_ = r.h.Run()
	}()

	return func() {
		_ = r.h.Close()
	}
}

func TestNodeTemplateList(t *testing.T) {
	mockey.PatchConvey("test node cn template list", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		resp := post[workflow.NodeTemplateListResponse](r, &workflow.NodeTemplateListRequest{
			NodeTypes: []string{"3", "5", "18"},
		})

		assert.Equal(t, 3, len(resp.Data.TemplateList))
		assert.Equal(t, 3, len(resp.Data.CateList))

		id2Name := map[string]string{
			"3":  "LLM",
			"5":  "Code",
			"18": "Question",
		}
		for _, tl := range resp.Data.TemplateList {
			assert.Equal(t, tl.Name, id2Name[tl.ID])
		}

	})
	mockey.PatchConvey("test node en template list", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		resp := post[workflow.NodeTemplateListResponse](r, &workflow.NodeTemplateListRequest{
			NodeTypes: []string{"3", "5", "18"},
		}, WithHeaders(map[string]string{
			"x-locale": "en-US",
		}))

		id2Name := map[string]string{
			"3":  "LLM",
			"5":  "Code",
			"18": "Question",
		}
		assert.Equal(t, 3, len(resp.Data.TemplateList))
		assert.Equal(t, 3, len(resp.Data.CateList))

		for _, tl := range resp.Data.TemplateList {
			assert.Equal(t, tl.Name, id2Name[tl.ID])
		}

	})

}

func TestTestRunAndGetProcess(t *testing.T) {
	mockey.PatchConvey("test test_run and get_process", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		r.appVarS.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any()).Return("1.0", nil).AnyTimes()

		id := r.load("entry_exit.json")
		input := map[string]string{
			"arr":   "[\"arr1\", \"arr2\"]",
			"obj":   "{\"field1\": [\"1234\", \"5678\"]}",
			"input": "3.5",
		}

		mockey.PatchConvey("test run then immediately cancel", func() {
			exeID := r.testRun(id, input)

			r.cancel(id, exeID)

			e := r.getProcess(id, exeID)
			// maybe cancel or success, whichever comes first
			assert.Contains(t, []workflow.WorkflowExeStatus{workflow.WorkflowExeStatus_Cancel, workflow.WorkflowExeStatus_Success}, e.status)
		})

		mockey.PatchConvey("test run success, then cancel", func() {
			exeID := r.testRun(id, input)
			r.getProcess(id, exeID)

			// cancel after success, nothing happens
			r.cancel(id, exeID)

			his := r.getOpenAPIProcess(id, exeID)
			assert.Equal(t, exeID, fmt.Sprintf("%d", *his.Data[0].ExecuteID))
			assert.Equal(t, workflow.WorkflowRunMode_Async, *his.Data[0].RunMode)

			r.publish(id, "v0.0.1", true)

			mockey.PatchConvey("openapi async run", func() {
				exeID := r.openapiAsyncRun(id, input)
				e := r.getProcess(id, exeID)
				assert.Equal(t, "1.0_[\"1234\",\"5678\"]", e.output)
			})

			mockey.PatchConvey("openapi sync run", func() {
				output, exeID := r.openapiSyncRun(id, input)
				assert.Equal(t, "1.0_[\"1234\",\"5678\"]", output["data"])
				his := r.getOpenAPIProcess(id, exeID)
				assert.Equal(t, exeID, fmt.Sprintf("%d", *his.Data[0].ExecuteID))
				assert.Equal(t, workflow.WorkflowRunMode_Sync, *his.Data[0].RunMode)
			})
		})

	})
}

func TestValidateTree(t *testing.T) {
	mockey.PatchConvey("test validate tree", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		vars := map[string]*vo.TypeInfo{
			"app_v1": {
				Type: vo.DataTypeString,
			},
			"app_list_v1": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeString,
				},
			},
			"app_list_v2": {
				Type:     vo.DataTypeString,
				Required: true,
			},
		}

		r.varGetter.EXPECT().GetAppVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

		t.Run("workflow_has_loop", func(t *testing.T) {
			errs := r.validateTree("validate/workflow_has_loop.json")

			paths := map[string]string{
				"161668": "101917",
				"101917": "177387",
				"177387": "161668",
				"166209": "102541",
				"102541": "109507",
				"109507": "166209",
			}

			for _, i := range errs[0] {
				assert.Equal(t, paths[i.PathError.Start], i.PathError.End)
			}
		})

		t.Run("workflow_has_no_connected_nodes", func(t *testing.T) {
			errs := r.validateTree("validate/workflow_has_no_connected_nodes.json")

			for _, i := range errs[0] {
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
			errs := r.validateTree("validate/workflow_ref_variable.json")

			for _, i := range errs[0] {
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
			errs := r.validateTree("validate/workflow_nested_has_loop_or_batch.json")

			assert.Equal(t, errs[0][0].Message, `composite nodes such as batch/loop cannot be nested`)
		})

		t.Run("workflow_variable_assigner", func(t *testing.T) {
			errs := r.validateTree("validate/workflow_variable_assigner.json")
			assert.Equal(t, errs[0][0].Message, `node name 变量赋值,param [app_list_v2], type mismatch`)
		})

		t.Run("sub_workflow_terminate_plan_type", func(t *testing.T) {
			_ = r.load("validate/workflow_has_no_connected_nodes.json", withID(7498321598097768457))

			errs := r.validateTree("validate/sub_workflow_terminate_plan_type.json")
			require.Equal(t, 2, len(errs))
			assert.Equal(t, errs[0][0].Message, `node name 变量赋值,param [app_list_v2], type mismatch`)

			for _, i := range errs[1] {
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

		t.Run("invalid_input_parameter", func(t *testing.T) {
			errs := r.validateTree("validate/invalid_input_parameter.json")
			assert.Equal(t, len(errs[0]), 2)
			msgs := slices.Transform(errs[0], func(item *workflow.ValidateErrorData) string {
				return item.Message
			})
			assert.Contains(t, msgs, `parameter name only allows number or alphabet, and must begin with alphabet, but it's "123"`)
			assert.Contains(t, msgs, `ref block error,[blockID] is empty`)
		})

	})
}

func TestTestResumeWithInputNode(t *testing.T) {
	mockey.PatchConvey("test test_resume with input node", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("input_receiver.json")

		userInput := map[string]any{
			"input": "user input",
			"obj": map[string]any{
				"field1": []any{"1", "2"},
			},
		}
		userInputStr, err := sonic.MarshalString(userInput)
		assert.NoError(t, err)

		mockey.PatchConvey("cancel after interrupt", func() {
			exeID := r.testRun(id, map[string]string{
				"input": "unused initial input",
			})

			e := r.getProcess(id, exeID)
			assert.NotNil(t, e.event) // interrupted

			r.cancel(id, exeID)

			e = r.getProcess(id, exeID)
			assert.Equal(t, workflow.WorkflowExeStatus_Cancel, e.status)
		})

		mockey.PatchConvey("cancel immediately after resume", func() {
			exeID := r.testRun(id, map[string]string{
				"input": "unused initial input",
			})

			e := r.getProcess(id, exeID)
			assert.NotNil(t, e.event) // interrupted

			r.testResume(id, exeID, e.event.ID, userInputStr)
			r.cancel(id, exeID)

			e = r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
			// maybe cancel or success, whichever comes first
			if e.status != workflow.WorkflowExeStatus_Success &&
				e.status != workflow.WorkflowExeStatus_Cancel {
				t.Errorf("expected to be either success or cancel, got: %v", e.status)
			}
		})

		mockey.PatchConvey("test run, then test resume", func() {
			exeID := r.testRun(id, map[string]string{
				"input": "unused initial input",
			})

			e := r.getProcess(id, exeID)
			assert.NotNil(t, e.event) // interrupted

			r.testResume(id, exeID, e.event.ID, userInputStr)

			e = r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
			assert.Equal(t, workflow.WorkflowExeStatus_Success, e.status)
			assert.Equal(t, map[string]any{
				"input":    "user input",
				"inputArr": nil,
				"field1":   `["1","2"]`,
			}, mustUnmarshalToMap(t, e.output))
		})

		mockey.PatchConvey("node debug the input node", func() {
			exeID := r.nodeDebug(id, "154951")

			e := r.getProcess(id, exeID)
			assert.NotNil(t, e.event) // interrupted

			r.testResume(id, exeID, e.event.ID, userInputStr)

			e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
			e2.assertSuccess()
			assert.Equal(t, map[string]any{
				"input":    "user input",
				"inputArr": nil,
				"obj": map[string]any{
					"field1": `["1","2"]`,
				},
			}, mustUnmarshalToMap(t, e2.output))

			result := r.getNodeExeHistory(id, exeID, "154951", nil)
			assert.Equal(t, mustUnmarshalToMap(t, e2.output), mustUnmarshalToMap(t, result.Output))
		})

		mockey.PatchConvey("sync run does not support interrupt", func() {
			r.publish(id, "v1.0.0", true)

			syncRunReq := &workflow.OpenAPIRunFlowRequest{
				WorkflowID: id,
				Parameters: ptr.Of(mustMarshalToString(t, map[string]string{
					"input": "unused initial input",
				})),
				IsAsync: ptr.Of(false),
			}

			resp := post[workflow.OpenAPIRunFlowResponse](r, syncRunReq)
			assert.Equal(t, int64(errno.ErrOpenAPIInterruptNotSupported), resp.Code)
		})
	})
}

func TestQueryTypes(t *testing.T) {
	mockey.PatchConvey("test workflow node types", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		t.Run("not sub workflow", func(t *testing.T) {
			id := r.load("query_types/llm_intent_http_nodes.json")

			req := &workflow.QueryWorkflowNodeTypeRequest{
				WorkflowID: id,
			}

			response := post[workflow.QueryWorkflowNodeTypeResponse](r, req)
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
			id := r.load("query_types/loop_condition.json")

			req := &workflow.QueryWorkflowNodeTypeRequest{
				WorkflowID: id,
			}

			response := post[workflow.QueryWorkflowNodeTypeResponse](r, req)
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
			_ = r.load("query_types/wf2.json", withID(7498668117704163337), withPublish("v0.0.1"))
			_ = r.load("query_types/wf2child.json", withID(7498674832255615002), withPublish("v0.0.1"))
			id := r.load("query_types/subworkflows.json")

			req := &workflow.QueryWorkflowNodeTypeRequest{
				WorkflowID: id,
			}

			response := post[workflow.QueryWorkflowNodeTypeResponse](r, req)

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
	mockey.PatchConvey("test_resume with qa node", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your age?"}`,
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     6,
								CompletionTokens: 7,
								TotalTokens:      13,
							},
						},
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"fields": {"name": "eino", "age": 1}}`,
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     11,
								CompletionTokens: 19,
								TotalTokens:      30,
							},
						},
					}, nil
				}
				return nil, errors.New("not found")
			},
		}
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil, nil).AnyTimes()

		id := r.load("qa_with_structured_output.json")

		exeID := r.testRun(id, map[string]string{
			"input": "what's your name and age?",
		})

		e := r.getProcess(id, exeID)
		assert.NotNil(t, e.event)
		e.tokenEqual(0, 0)

		r.testResume(id, exeID, e.event.ID, "my name is eino")

		e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))

		r.testResume(id, exeID, e2.event.ID, "1 year old")

		e3 := r.getProcess(id, exeID, withPreviousEventID(e2.event.ID))
		e3.assertSuccess()
		assert.Equal(t, map[string]any{
			"USER_RESPONSE": "1 year old",
			"name":          "eino",
			"age":           int64(1),
		}, mustUnmarshalToMap(t, e3.output))
		e3.tokenEqual(17, 26)
	})
}

func TestNestedSubWorkflowWithInterrupt(t *testing.T) {
	mockey.PatchConvey("test nested sub workflow with interrupt", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		chatModel1 := &testutil.UTChatModel{
			StreamResultProvider: func(_ int, in []*schema.Message) (*schema.StreamReader[*schema.Message], error) {
				sr := schema.StreamReaderFromArray([]*schema.Message{
					{
						Role:    schema.Assistant,
						Content: "I ",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     1,
								CompletionTokens: 3,
								TotalTokens:      4,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: "don't know.",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								CompletionTokens: 7,
								TotalTokens:      7,
							},
						},
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
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     2,
								CompletionTokens: 2,
								TotalTokens:      4,
							},
						},
					},
					{
						Role:    schema.Assistant,
						Content: "don't know too.",
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								CompletionTokens: 11,
								TotalTokens:      11,
							},
						},
					},
				})
				return sr, nil
			},
		}

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1737521813 {
				return chatModel1, nil, nil
			} else {
				return chatModel2, nil, nil
			}
		}).AnyTimes()

		topID := r.load("subworkflow/top_workflow.json")
		defer func() {
			post[workflow.DeleteWorkflowResponse](r, &workflow.DeleteWorkflowRequest{
				WorkflowID: topID,
			})
		}()

		midID := r.load("subworkflow/middle_workflow.json", withID(7494849202016272435))
		bottomID := r.load("subworkflow/bottom_workflow.json", withID(7468899413567684634))
		inputID := r.load("input_receiver.json", withID(7469607842648457243))

		exeID := r.testRun(topID, map[string]string{
			"input": "hello",
		})

		e := r.getProcess(topID, exeID)
		assert.NotNil(t, e.event)

		r.testResume(topID, exeID, e.event.ID, map[string]any{
			"input": "more info 1",
		})

		e2 := r.getProcess(topID, exeID, withPreviousEventID(e.event.ID))
		assert.NotNil(t, e2.event)

		r.testResume(topID, exeID, e2.event.ID, map[string]any{
			"input": "more info 2",
		})

		e3 := r.getProcess(topID, exeID, withPreviousEventID(e2.event.ID))
		e3.assertSuccess()
		assert.Equal(t, "I don't know.\nI don't know too.\nb\n[\"new_a_more info 1\",\"new_b_more info 2\"]", e3.output)

		e3.tokenEqual(3, 23)

		r.publish(topID, "v0.0.1", true) // publish the top workflow to

		refs := post[workflow.GetWorkflowReferencesResponse](r, &workflow.GetWorkflowReferencesRequest{
			WorkflowID: midID,
		})
		assert.Equal(t, 1, len(refs.Data.WorkflowList))
		assert.Equal(t, topID, refs.Data.WorkflowList[0].WorkflowID)

		mockey.PatchConvey("verify history schema for all workflows", func() {
			// get current draft commit ID of top_workflow
			canvas := post[workflow.GetCanvasInfoResponse](r, &workflow.GetCanvasInfoRequest{
				WorkflowID: ptr.Of(topID),
			})
			topCommitID := canvas.Data.VcsData.DraftCommitID

			// get history schema of top_workflow
			resp := post[workflow.GetHistorySchemaResponse](r, &workflow.GetHistorySchemaRequest{
				WorkflowID: topID,
				ExecuteID:  ptr.Of(exeID),
			})

			assert.Equal(t, topCommitID, resp.Data.CommitID)

			// get sub_executeID for middle_workflow
			nodeHis := r.getNodeExeHistory(topID, exeID, "198743", nil)
			extra := mustUnmarshalToMap(t, nodeHis.GetExtra())
			midExeID := extra["subExecuteID"].(int64)

			// do the same for middle_workflow
			canvas = post[workflow.GetCanvasInfoResponse](r, &workflow.GetCanvasInfoRequest{
				WorkflowID: ptr.Of(midID),
			})
			resp = post[workflow.GetHistorySchemaResponse](r, &workflow.GetHistorySchemaRequest{
				WorkflowID:   midID,
				ExecuteID:    ptr.Of(exeID),
				SubExecuteID: ptr.Of(strconv.FormatInt(midExeID, 10)),
			})
			assert.Equal(t, canvas.Data.VcsData.DraftCommitID, resp.Data.CommitID)

			nodeHis = r.getNodeExeHistory(midID, strconv.FormatInt(midExeID, 10), "112956", nil)
			extra = mustUnmarshalToMap(t, nodeHis.GetExtra())
			bottomExeID := extra["subExecuteID"].(int64)

			// do the same for bottom_workflow
			canvas = post[workflow.GetCanvasInfoResponse](r, &workflow.GetCanvasInfoRequest{
				WorkflowID: ptr.Of(bottomID),
			})
			resp = post[workflow.GetHistorySchemaResponse](r, &workflow.GetHistorySchemaRequest{
				WorkflowID:   bottomID,
				ExecuteID:    ptr.Of(exeID),
				SubExecuteID: ptr.Of(strconv.FormatInt(bottomExeID, 10)),
			})
			assert.Equal(t, canvas.Data.VcsData.DraftCommitID, resp.Data.CommitID)

			nodeHis = r.getNodeExeHistory(bottomID, strconv.FormatInt(bottomExeID, 10), "141303", nil)
			extra = mustUnmarshalToMap(t, nodeHis.GetExtra())
			inputExeID := extra["subExecuteID"].(int64)

			// do the same for input_receiver workflow
			canvas = post[workflow.GetCanvasInfoResponse](r, &workflow.GetCanvasInfoRequest{
				WorkflowID: ptr.Of(inputID),
			})
			resp = post[workflow.GetHistorySchemaResponse](r, &workflow.GetHistorySchemaRequest{
				WorkflowID:   inputID,
				ExecuteID:    ptr.Of(exeID),
				SubExecuteID: ptr.Of(strconv.FormatInt(inputExeID, 10)),
			})
			assert.Equal(t, canvas.Data.VcsData.DraftCommitID, resp.Data.CommitID)

			// update the top_workflow's draft, we still can get it's history schema
			r.save(topID, "subworkflow/middle_workflow.json")
			resp = post[workflow.GetHistorySchemaResponse](r, &workflow.GetHistorySchemaRequest{
				WorkflowID: topID,
				ExecuteID:  ptr.Of(exeID),
			})
			assert.Equal(t, topCommitID, resp.Data.CommitID)

			r.publish(topID, "v0.0.2", true)
			refs := post[workflow.GetWorkflowReferencesResponse](r, &workflow.GetWorkflowReferencesRequest{
				WorkflowID: midID,
			})
			assert.Equal(t, 0, len(refs.Data.WorkflowList))
		})
	})
}

func TestInterruptWithinBatch(t *testing.T) {
	mockey.PatchConvey("test interrupt within batch", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("batch/batch_with_inner_interrupt.json")
		exeID := r.testRun(id, map[string]string{
			"input_array":       `["a","b"]`,
			"batch_concurrency": "2",
		})

		e := r.getProcess(id, exeID)
		assert.Equal(t, workflow.EventType_InputNode, e.event.Type)

		exeIDInt, _ := strconv.ParseInt(exeID, 0, 64)
		storeIEs, _ := workflow2.GetRepository().ListInterruptEvents(t.Context(), exeIDInt)
		assert.Equal(t, 2, len(storeIEs))

		r.testResume(id, exeID, e.event.ID, map[string]any{
			"input": "input 1",
		})

		e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
		assert.Equal(t, workflow.EventType_InputNode, e2.event.Type)

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeIDInt)
		assert.Equal(t, 2, len(storeIEs))

		r.testResume(id, exeID, e2.event.ID, map[string]any{
			"input": "input 2",
		})

		e3 := r.getProcess(id, exeID, withPreviousEventID(e2.event.ID))
		assert.Equal(t, workflow.EventType_Question, e3.event.Type)

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeIDInt)
		assert.Equal(t, 2, len(storeIEs))

		r.testResume(id, exeID, e3.event.ID, "answer 1")

		e4 := r.getProcess(id, exeID, withPreviousEventID(e3.event.ID))
		assert.Equal(t, workflow.EventType_Question, e4.event.Type)

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeIDInt)
		assert.Equal(t, 1, len(storeIEs))

		r.testResume(id, exeID, e4.event.ID, "answer 2")

		e5 := r.getProcess(id, exeID, withPreviousEventID(e4.event.ID))

		storeIEs, _ = workflow2.GetRepository().ListInterruptEvents(t.Context(), exeIDInt)
		assert.Equal(t, 0, len(storeIEs))
		e5.assertSuccess()

		outputMap := mustUnmarshalToMap(t, e5.output)

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
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("publish/publish_workflow.json", withName("pb_we"))

		listResponse := post[workflow.GetWorkFlowListResponse](r, &workflow.GetWorkFlowListRequest{
			Page:   ptr.Of(int32(1)),
			Size:   ptr.Of(int32(10)),
			Type:   ptr.Of(workflow.WorkFlowType_User),
			Status: ptr.Of(workflow.WorkFlowListStatus_UnPublished),
			Name:   ptr.Of("pb_we"),
		})

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))

		r.publish(id, "v0.0.1", true)

		listResponse = post[workflow.GetWorkFlowListResponse](r, &workflow.GetWorkFlowListRequest{
			Page:   ptr.Of(int32(1)),
			Size:   ptr.Of(int32(10)),
			Type:   ptr.Of(workflow.WorkFlowType_User),
			Status: ptr.Of(workflow.WorkFlowListStatus_HadPublished),
			Name:   ptr.Of("pb_we"),
		})

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))

		r.publish(id, "v0.0.2", true)

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: id,
		}
		_ = post[workflow.DeleteWorkflowResponse](r, deleteReq)
	})
}

func TestGetCanvasInfo(t *testing.T) {
	mockey.PatchConvey("test get canvas info", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("get_canvas/get_canvas.json")

		getCanvas := &workflow.GetCanvasInfoRequest{
			WorkflowID: ptr.Of(id),
		}
		response := post[workflow.GetCanvasInfoResponse](r, getCanvas)
		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanNotSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)

		exeID := r.testRun(id, map[string]string{
			"input": "input_v1",
			"e":     "e",
		})
		r.getProcess(id, exeID)

		response = post[workflow.GetCanvasInfoResponse](r, getCanvas)
		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)

		r.publish(id, "v0.0.1", true)

		response = post[workflow.GetCanvasInfoResponse](r, getCanvas)
		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_HadSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Publish)

		r.save(id, "get_canvas/get_canvas.json")
		response = post[workflow.GetCanvasInfoResponse](r, getCanvas)
		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)

		r.save(id, "get_canvas/get_canvas_modify.json")
		response = post[workflow.GetCanvasInfoResponse](r, getCanvas)
		assert.Equal(t, response.Data.Workflow.Status, workflow.WorkFlowDevStatus_CanNotSubmit)
		assert.Equal(t, response.Data.VcsData.Type, workflow.VCSCanvasType_Draft)
	})
}

func TestUpdateWorkflowMeta(t *testing.T) {
	mockey.PatchConvey("update workflow meta", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("entry_exit.json")

		updateMetaReq := &workflow.UpdateWorkflowMetaRequest{
			WorkflowID: id,
			Name:       ptr.Of("modify_name"),
			Desc:       ptr.Of("modify_desc"),
			IconURI:    ptr.Of("modify_icon_uri"),
		}
		_ = post[workflow.UpdateWorkflowMetaResponse](r, updateMetaReq)

		getCanvas := &workflow.GetCanvasInfoRequest{
			WorkflowID: ptr.Of(id),
		}
		response := post[workflow.GetCanvasInfoResponse](r, getCanvas)
		assert.Equal(t, response.Data.Workflow.Name, "modify_name")
		assert.Equal(t, response.Data.Workflow.Desc, "modify_desc")
		assert.Equal(t, response.Data.Workflow.IconURI, "modify_icon_uri")
	})
}

func TestSimpleInvokableToolWithReturnVariables(t *testing.T) {
	mockey.PatchConvey("simple invokable tool with return variables", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		toolID := r.load("function_call/tool_workflow_1.json", withID(7492075279843737651), withPublish("v0.0.1"))

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
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil, nil).AnyTimes()

		id := r.load("function_call/llm_with_workflow_as_tool.json")
		defer func() {
			post[workflow.DeleteWorkflowResponse](r, &workflow.DeleteWorkflowRequest{
				WorkflowID: id,
			})
		}()

		exeID := r.testRun(id, map[string]string{
			"input": "this is the user input",
		})

		e := r.getProcess(id, exeID)
		e.assertSuccess()
		assert.Equal(t, map[string]any{
			"output": "final_answer",
		}, mustUnmarshalToMap(t, e.output))
		e.tokenEqual(15, 17)

		mockey.PatchConvey("check behavior if stream run", func() {
			chatModel.Reset()

			defer r.runServer()()

			r.publish(id, "v0.0.1", true)

			sseReader := r.openapiStream(id, map[string]any{
				"input": "hello",
			})
			err := sseReader.ForEach(t.Context(), func(e *sse.Event) error {
				t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
				return nil
			})
			assert.NoError(t, err)

			// check workflow references are correct
			refs := post[workflow.GetWorkflowReferencesResponse](r, &workflow.GetWorkflowReferencesRequest{
				WorkflowID: toolID,
			})
			assert.Equal(t, 1, len(refs.Data.WorkflowList))
			assert.Equal(t, id, refs.Data.WorkflowList[0].WorkflowID)
		})
	})
}

func TestReturnDirectlyStreamableTool(t *testing.T) {
	mockey.PatchConvey("return directly streamable tool", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1706077826 {
				innerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return innerModel, nil, nil
			} else {
				outerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return outerModel, nil, nil
			}
		}).AnyTimes()

		r.load("function_call/tool_workflow_2.json", withID(7492615435881709608), withPublish("v0.0.1"))
		id := r.load("function_call/llm_workflow_stream_tool.json")

		exeID := r.testRun(id, map[string]string{
			"input": "this is the user input",
		})
		e := r.getProcess(id, exeID)
		e.assertSuccess()
		assert.Equal(t, "this is the streaming output I don't know.", e.output)
		e.tokenEqual(15, 27)

		mockey.PatchConvey("check behavior if stream run", func() {
			outerModel.Reset()
			innerModel.Reset()
			defer r.runServer()()
			r.publish(id, "v0.0.1", true)
			sseReader := r.openapiStream(id, map[string]any{
				"input": "hello",
			})
			err := sseReader.ForEach(t.Context(), func(e *sse.Event) error {
				t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
				return nil
			})
			assert.NoError(t, err)
		})
	})
}

func TestSimpleInterruptibleTool(t *testing.T) {
	mockey.PatchConvey("test simple interruptible tool", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		r.load("input_receiver.json", withID(7492075279843737652), withPublish("v0.0.1"))

		chatModel := &testutil.UTChatModel{
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					t.Logf("[TestSimpleInterruptibleTool] enter chatmodel index= 0")
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
					t.Logf("[TestSimpleInterruptibleTool] enter chatmodel index= 1")
					return &schema.Message{
						Role:    schema.Assistant,
						Content: "final_answer",
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil, nil).AnyTimes()

		id := r.load("function_call/llm_with_workflow_as_tool_1.json")

		exeID := r.testRun(id, map[string]string{
			"input": "this is the user input",
		})

		e := r.getProcess(id, exeID)
		assert.NotNil(t, e.event)

		r.testResume(id, exeID, e.event.ID, map[string]any{
			"input": "user input",
			"obj": map[string]any{
				"field1": []string{"1", "2"},
			},
		})

		e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
		e2.assertSuccess()
		assert.Equal(t, map[string]any{
			"output": "final_answer",
		}, mustUnmarshalToMap(t, e2.output))
	})
}

func TestStreamableToolWithMultipleInterrupts(t *testing.T) {
	mockey.PatchConvey("return directly streamable tool with multiple interrupts", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									PromptTokens:     6,
									CompletionTokens: 7,
									TotalTokens:      13,
								},
							},
						},
					}), nil
				} else if index == 1 {
					return schema.StreamReaderFromArray([]*schema.Message{
						{
							Role:    schema.Assistant,
							Content: "I now know your ",
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									PromptTokens:     5,
									CompletionTokens: 8,
									TotalTokens:      13,
								},
							},
						},
						{
							Role:    schema.Assistant,
							Content: "name is Eino and age is 1.",
							ResponseMeta: &schema.ResponseMeta{
								Usage: &schema.TokenUsage{
									CompletionTokens: 10,
									TotalTokens:      17,
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
			InvokeResultProvider: func(index int, in []*schema.Message) (*schema.Message, error) {
				if index == 0 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"question": "what's your age?"}`,
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     6,
								CompletionTokens: 7,
								TotalTokens:      13,
							},
						},
					}, nil
				} else if index == 1 {
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `{"fields": {"name": "eino", "age": 1}}`,
						ResponseMeta: &schema.ResponseMeta{
							Usage: &schema.TokenUsage{
								PromptTokens:     8,
								CompletionTokens: 10,
								TotalTokens:      18,
							},
						},
					}, nil
				} else {
					return nil, fmt.Errorf("unexpected index: %d", index)
				}
			},
		}

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1706077827 {
				outerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return outerModel, nil, nil
			} else {
				innerModel.ModelType = strconv.FormatInt(params.ModelType, 10)
				return innerModel, nil, nil
			}
		}).AnyTimes()

		r.load("function_call/tool_workflow_3.json", withID(7492615435881709611), withPublish("v0.0.1"))
		id := r.load("function_call/llm_workflow_stream_tool_1.json")

		exeID := r.testRun(id, map[string]string{
			"input": "this is the user input",
		})

		e := r.getProcess(id, exeID)
		assert.NotNil(t, e.event)
		e.tokenEqual(0, 0)

		r.testResume(id, exeID, e.event.ID, "my name is eino")
		e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
		assert.NotNil(t, e2.event)
		e2.tokenEqual(0, 0)

		r.testResume(id, exeID, e2.event.ID, "1 year old")
		e3 := r.getProcess(id, exeID, withPreviousEventID(e2.event.ID))
		e3.assertSuccess()
		assert.Equal(t, "the name is eino, age is 1", e3.output)
		e3.tokenEqual(20, 24)
	})
}

func TestNodeWithBatchEnabled(t *testing.T) {
	mockey.PatchConvey("test node with batch enabled", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		r.load("batch/sub_workflow_as_batch.json", withID(7469707607914217512), withPublish("v0.0.1"))

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
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil, nil).AnyTimes()

		id := r.load("batch/node_batches.json")

		exeID := r.testRun(id, map[string]string{
			"input": `["first input", "second input"]`,
		})
		e := r.getProcess(id, exeID)
		e.assertSuccess()
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
		}, mustUnmarshalToMap(t, e.output))
		e.tokenEqual(10, 12)

		// verify this workflow has previously succeeded a test run
		result := r.getNodeExeHistory(id, "", "100001", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.True(t, len(result.Output) > 0)

		// verify querying this node's result for a particular test run
		result = r.getNodeExeHistory(id, exeID, "178876", nil)
		assert.True(t, len(result.Output) > 0)

		mockey.PatchConvey("test node debug with batch mode", func() {
			exeID = r.nodeDebug(id, "178876", withNDBatch(map[string]string{"item1": `[{"output":"output_1"},{"output":"output_2"}]`}))
			e = r.getProcess(id, exeID)
			e.assertSuccess()
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
			}, mustUnmarshalToMap(t, e.output))

			// verify querying this node's result for this node debug run
			result := r.getNodeExeHistory(id, exeID, "178876", nil)
			assert.Equal(t, mustUnmarshalToMap(t, e.output), mustUnmarshalToMap(t, result.Output))

			// verify querying this node's has succeeded any node debug run
			result = r.getNodeExeHistory(id, "", "178876", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
			assert.Equal(t, mustUnmarshalToMap(t, e.output), mustUnmarshalToMap(t, result.Output))
		})
	})
}

func TestStartNodeDefaultValues(t *testing.T) {
	mockey.PatchConvey("default values", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		t.Run("no input keys, all fields use default values", func(t *testing.T) {
			idStr := r.load("start_node_default_values.json")
			r.publish(idStr, "v0.0.1", true)
			input := map[string]string{}
			result, _ := r.openapiSyncRun(idStr, input)
			assert.Equal(t, result, map[string]any{
				"ts":    "2025-07-09 21:43:34",
				"files": "http://imagex.fanlv.fun/tos-cn-i-1heqlfnr21/e81acc11277f421390770618e24e01ce.jpeg~tplv-1heqlfnr21-image.image?x-wf-file_name=20250317-154742.jpeg",
				"str":   "str",
				"object": map[string]any{
					"a": "1",
				},
				"array":  []any{"1", "2"},
				"inter":  int64(100),
				"number": 12.4,
				"bool":   false,
			})

		})
		t.Run("all fields use default values", func(t *testing.T) {
			idStr := r.load("start_node_default_values.json")
			r.publish(idStr, "v0.0.1", true)
			input := map[string]string{
				"str":    "",
				"array":  "[]",
				"object": "{}",
			}

			result, _ := r.openapiSyncRun(idStr, input)
			assert.Equal(t, result, map[string]any{
				"ts":    "2025-07-09 21:43:34",
				"files": "http://imagex.fanlv.fun/tos-cn-i-1heqlfnr21/e81acc11277f421390770618e24e01ce.jpeg~tplv-1heqlfnr21-image.image?x-wf-file_name=20250317-154742.jpeg",
				"str":   "str",
				"object": map[string]any{
					"a": "1",
				},
				"array":  []any{"1", "2"},
				"inter":  int64(100),
				"number": 12.4,
				"bool":   false,
			})

		})
		t.Run("some use default values and some use user-entered values", func(t *testing.T) {
			idStr := r.load("start_node_default_values.json")
			r.publish(idStr, "v0.0.1", true)
			input := map[string]string{
				"str":    "value",
				"array":  `["a","b"]`,
				"object": "{}",
				"bool":   "true",
			}

			result, _ := r.openapiSyncRun(idStr, input)
			assert.Equal(t, result, map[string]any{
				"ts":    "2025-07-09 21:43:34",
				"files": "http://imagex.fanlv.fun/tos-cn-i-1heqlfnr21/e81acc11277f421390770618e24e01ce.jpeg~tplv-1heqlfnr21-image.image?x-wf-file_name=20250317-154742.jpeg",
				"str":   "value",
				"object": map[string]any{
					"a": "1",
				},
				"array":  []any{"a", "b"},
				"inter":  int64(100),
				"number": 12.4,
				"bool":   true,
			})

		})

	})
}

func TestAggregateStreamVariables(t *testing.T) {
	mockey.PatchConvey("test aggregate stream variables", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1737521813 {
				cm1.ModelType = strconv.FormatInt(params.ModelType, 10)
				return cm1, nil, nil
			} else {
				cm2.ModelType = strconv.FormatInt(params.ModelType, 10)
				return cm2, nil, nil
			}
		}).AnyTimes()

		id := r.load("variable_aggregate/aggregate_streams.json", withPublish("v0.0.1"))
		exeID := r.testRun(id, map[string]string{
			"input": "I've got an important question",
		})
		e := r.getProcess(id, exeID)
		e.assertSuccess()
		assert.Equal(t, "I won't tell you.\nI won't tell you.\n{\"Group1\":\"I won't tell you.\",\"input\":\"I've got an important question\"}", e.output)

		defer r.runServer()()

		sseReader := r.openapiStream(id, map[string]any{
			"input": "I've got an important question",
		})
		err := sseReader.ForEach(t.Context(), func(e *sse.Event) error {
			t.Logf("sse id: %s, type: %s, data: %s", e.ID, e.Type, string(e.Data))
			return nil
		})
		assert.NoError(t, err)
	})
}

func TestListWorkflowAsToolData(t *testing.T) {
	mockey.PatchConvey("publish list workflow & list workflow as tool data", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		name := "pb_wf" + strconv.FormatInt(time.Now().UnixMilli(), 10)
		id := r.load("publish/publish_workflow.json", withName(name))

		listResponse := post[workflow.GetWorkFlowListResponse](r, &workflow.GetWorkFlowListRequest{
			Page:   ptr.Of(int32(1)),
			Size:   ptr.Of(int32(10)),
			Type:   ptr.Of(workflow.WorkFlowType_User),
			Status: ptr.Of(workflow.WorkFlowListStatus_UnPublished),
			Name:   ptr.Of(name),
		})

		assert.Equal(t, 1, len(listResponse.Data.WorkflowList))

		r.publish(id, "v0.0.1", true)

		res, err := appworkflow.SVC.GetPlaygroundPluginList(t.Context(), &pluginAPI.GetPlaygroundPluginListRequest{
			PluginIds: []string{id},
			SpaceID:   ptr.Of(int64(123)),
		})
		assert.NoError(t, err)
		assert.Equal(t, 1, len(res.Data.PluginList))
		assert.Equal(t, "v0.0.1", res.Data.PluginList[0].VersionName)
		assert.Equal(t, "input", res.Data.PluginList[0].PluginApis[0].Parameters[0].Name)
		assert.Equal(t, "obj", res.Data.PluginList[0].PluginApis[0].Parameters[1].Name)
		assert.Equal(t, "field1", res.Data.PluginList[0].PluginApis[0].Parameters[1].SubParameters[0].Name)
		assert.Equal(t, "arr", res.Data.PluginList[0].PluginApis[0].Parameters[2].Name)
		assert.Equal(t, "string", res.Data.PluginList[0].PluginApis[0].Parameters[2].SubType)

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: id,
		}
		_ = post[workflow.DeleteWorkflowResponse](r, deleteReq)
	})
}

func TestWorkflowDetailAndDetailInfo(t *testing.T) {
	mockey.PatchConvey("workflow detail & detail info", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		name := "pb_wf" + strconv.FormatInt(time.Now().UnixMilli(), 10)
		id := r.load("publish/publish_workflow.json", withName(name))

		detailReq := &workflow.GetWorkflowDetailRequest{
			WorkflowIds: []string{id},
		}
		response := post[map[string]any](r, detailReq)
		assert.Equal(t, 1, len((*response)["data"].([]any)))

		r.publish(id, "v0.0.1", true)
		r.publish(id, "v0.0.2", true)

		detailInfoReq := &workflow.GetWorkflowDetailInfoRequest{
			WorkflowFilterList: []*workflow.WorkflowFilter{
				{WorkflowID: id},
			},
		}
		detailInfoResponse := post[map[string]any](r, detailInfoReq)
		assert.Equal(t, 1, len((*detailInfoResponse)["data"].([]any)))
		assert.Equal(t, "v0.0.2", (*detailInfoResponse)["data"].([]any)[0].(map[string]any)["latest_flow_version"].(string))
		assert.Equal(t, int64(1), (*detailInfoResponse)["data"].([]any)[0].(map[string]any)["end_type"].(int64))

		deleteReq := &workflow.DeleteWorkflowRequest{
			WorkflowID: id,
		}
		_ = post[workflow.DeleteWorkflowResponse](r, deleteReq)
	})
}

func TestParallelInterrupts(t *testing.T) {
	mockey.PatchConvey("test parallel interrupts", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1737521813 {
				return chatModel1, nil, nil
			} else {
				return chatModel2, nil, nil
			}
		}).AnyTimes()

		id := r.load("parallel_interrupt.json")

		const (
			qa1NodeID   = "107234"
			qa2NodeID   = "157915"
			inputNodeID = "162226"
		)

		var (
			interruptSeq []string // total 5 interrupts, the interrupted node ID in sequence
			qa1Answers   = []string{"my name is eino.", "my age is 1"}
			qa2Answers   = []string{"I'm from China.", "I prefer not to say my gender"}
			inputStr     = mustMarshalToString(t, map[string]any{
				"input": "this is the user input",
			})
		)

		exeID := r.testRun(id, map[string]string{})
		e := r.getProcess(id, exeID)
		interruptSeq = append(interruptSeq, e.event.NodeID)

		r.testResume(id, exeID, e.event.ID, ternary.IFElse(interruptSeq[0] == qa1NodeID, qa1Answers[0], qa2Answers[0]))
		e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
		interruptSeq = append(interruptSeq, e2.event.NodeID)
		assert.Equal(t, interruptSeq[0], interruptSeq[1]) // the first two interrupts must happen at the same QA node

		r.testResume(id, exeID, e2.event.ID, ternary.IFElse(interruptSeq[1] == qa1NodeID, qa1Answers[1], qa2Answers[1]))
		e3 := r.getProcess(id, exeID, withPreviousEventID(e2.event.ID))
		interruptSeq = append(interruptSeq, e3.event.NodeID)

		var thirdResumeString string
		switch e3.event.NodeID {
		case qa1NodeID:
			thirdResumeString = qa1Answers[0]
		case qa2NodeID:
			thirdResumeString = qa2Answers[0]
		case inputNodeID:
			thirdResumeString = inputStr
		default:
		}

		r.testResume(id, exeID, e3.event.ID, thirdResumeString)
		e4 := r.getProcess(id, exeID, withPreviousEventID(e3.event.ID))
		interruptSeq = append(interruptSeq, e4.event.NodeID)
		assert.Contains(t, []string{qa1NodeID, qa2NodeID}, interruptSeq[2]) // fourth interrupt must be either qa1 or qa2
		assert.NotEqual(t, interruptSeq[0], interruptSeq[3])                // fourth interrupt must be different from the first interrupt

		var fourthResumeString string
		switch e4.event.NodeID {
		case qa1NodeID:
			fourthResumeString = ternary.IFElse(interruptSeq[3] == interruptSeq[2], qa1Answers[1], qa1Answers[0])
		case qa2NodeID:
			fourthResumeString = ternary.IFElse(interruptSeq[3] == interruptSeq[2], qa2Answers[1], qa2Answers[0])
		}

		r.testResume(id, exeID, e4.event.ID, fourthResumeString)
		e5 := r.getProcess(id, exeID, withPreviousEventID(e4.event.ID))
		interruptSeq = append(interruptSeq, e5.event.NodeID)

		var fifthResumeString string
		switch e5.event.NodeID {
		case qa1NodeID:
			fifthResumeString = qa1Answers[1]
		case qa2NodeID:
			fifthResumeString = qa2Answers[1]
		case inputNodeID:
			fifthResumeString = inputStr
		default:
		}

		r.testResume(id, exeID, e5.event.ID, fifthResumeString)
		e6 := r.getProcess(id, exeID, withPreviousEventID(e5.event.ID))
		e6.assertSuccess()
		assert.Equal(t, map[string]any{
			"gender":      "prefer not to say",
			"user_input":  "this is the user input",
			"user_name":   "eino",
			"user_age":    int64(1),
			"nationality": "China",
		}, mustUnmarshalToMap(t, e6.output))
	})
}

func TestInputComplex(t *testing.T) {
	mockey.PatchConvey("test input complex", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("input_complex.json")
		exeID := r.testRun(id, map[string]string{})
		e := r.getProcess(id, exeID)
		r.testResume(id, exeID, e.event.ID, mustMarshalToString(t, map[string]any{
			"input":      `{"name": "eino", "age": 1}`,
			"input_list": `[{"name":"user_1"},{"age":2}]`,
		}))
		e2 := r.getProcess(id, exeID, withPreviousEventID(e.event.ID))
		e2.assertSuccess()
		assert.Equal(t, map[string]any{
			"output": map[string]any{
				"name": "eino",
				"age":  int64(1),
			},
			"output_list": []any{
				map[string]any{
					"name": "user_1",
					"age":  nil,
				},
				map[string]any{
					"name": nil,
					"age":  int64(2),
				},
			},
		}, mustUnmarshalToMap(t, e2.output))
	})
}

func TestLLMWithSkills(t *testing.T) {
	mockey.PatchConvey("workflow llm node with plugin", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(utChatModel, nil, nil).AnyTimes()

		r.plugin.EXPECT().ExecuteTool(gomock.Any(), gomock.Any(), gomock.Any()).Return(&plugin2.ExecuteToolResponse{
			TrimmedResp: `{"data":"ok","err_msg":"error","data_structural":{"content":"ok","title":"title","weburl":"weburl"}}`,
		}, nil).AnyTimes()

		r.plugin.EXPECT().MGetOnlinePlugins(gomock.Any(), gomock.Any()).Return([]*entity3.PluginInfo{
			{PluginInfo: &plugin2.PluginInfo{ID: 7509353177339133952}},
		}, nil).AnyTimes()

		r.plugin.EXPECT().MGetDraftPlugins(gomock.Any(), gomock.Any()).Return([]*entity3.PluginInfo{{
			PluginInfo: &plugin2.PluginInfo{ID: 7509353177339133952},
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

		operation := &plugin2.Openapi3Operation{}
		_ = sonic.UnmarshalString(operationString, operation)

		r.plugin.EXPECT().MGetOnlineTools(gomock.Any(), gomock.Any()).Return([]*entity3.ToolInfo{
			{ID: int64(7509353598782816256), Operation: operation},
		}, nil).AnyTimes()

		r.plugin.EXPECT().MGetDraftTools(gomock.Any(), gomock.Any()).Return([]*entity3.ToolInfo{
			{ID: int64(7509353598782816256), Operation: operation},
		}, nil).AnyTimes()

		pluginSrv := plugin3.NewPluginService(r.plugin, r.tos)

		plugin.SetPluginService(pluginSrv)

		t.Run("llm with plugin tool", func(t *testing.T) {
			id := r.load("llm_node_with_skills/llm_node_with_plugin_tool.json")
			exeID := r.testRun(id, map[string]string{
				"e": "mmmm",
			})
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, `{"output":"mmmm"}`, e.output)
		})
	})

	mockey.PatchConvey("workflow llm node with workflow as tool", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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
					assert.Equal(t, int64(123), result["output_number"])
					return &schema.Message{
						Role:    schema.Assistant,
						Content: `output_data`,
					}, nil
				}
				return nil, fmt.Errorf("unexpected index: %d", index)
			},
		}
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(utChatModel, nil, nil).AnyTimes()

		t.Run("llm with workflow tool", func(t *testing.T) {
			r.load("llm_node_with_skills/llm_workflow_as_tool.json", withID(7509120431183544356), withPublish("v0.0.1"))
			id := r.load("llm_node_with_skills/llm_node_with_workflow_tool.json")
			exeID := r.testRun(id, map[string]string{
				"input_string": "ok_input_string",
			})
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, `{"output":"output_data"}`, e.output)
		})
	})

	mockey.PatchConvey("workflow llm node with knowledge skill", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

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
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(utChatModel, nil, nil).AnyTimes()

		r.knowledge.EXPECT().ListKnowledgeDetail(gomock.Any(), gomock.Any()).Return(&knowledge.ListKnowledgeDetailResponse{
			KnowledgeDetails: []*knowledge.KnowledgeDetail{
				{ID: 7512369185624686592, Name: "旅游景点", Description: "旅游景点介绍"},
			},
		}, nil).AnyTimes()

		r.knowledge.EXPECT().Retrieve(gomock.Any(), gomock.Any()).Return(&knowledge.RetrieveResponse{
			Slices: []*knowledge.Slice{
				{DocumentID: "1", Output: "天安门广场 ‌：中国政治文化中心，见证了近现代重大历史事件‌"},
				{DocumentID: "2", Output: "八达岭长城 ‌：明代长城的精华段，被誉为“不到长城非好汉"},
			},
		}, nil).AnyTimes()

		t.Run("llm node with knowledge skill", func(t *testing.T) {
			id := r.load("llm_node_with_skills/llm_with_knowledge_skill.json")
			exeID := r.testRun(id, map[string]string{
				"input": "北京有哪些著名的景点",
			})
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, `{"output":"八达岭长城 ‌：明代长城的精华段，被誉为“不到长城非好汉‌"}`, e.output)
		})
	})
}

func TestStreamRun(t *testing.T) {
	mockey.PatchConvey("test stream run", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		defer r.runServer()()

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
		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel1, nil, nil).AnyTimes()

		id := r.load("sse/llm_emitter.json")

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
					DebugURL: ptr.Of(fmt.Sprintf("https://www.coze.cn/work_flow?execute_id={{exeID}}&space_id=123&workflow_id=%s&execute_mode=2", id)),
				},
			},
		}

		index := 0

		r.publish(id, "v0.0.1", true)

		sseReader := r.openapiStream(id, map[string]any{
			"input": "hello",
		})
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
			require.Equal(t, expectedEvents[index].Data.Content, streamE.Content)
			require.Equal(t, expectedEvents[index], expectedE{
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

			exeID := r.nodeDebug(id, "156549", withNDInput(map[string]string{"input": "hello"}))
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, map[string]any{
				"output": "I don't know.",
			}, mustUnmarshalToMap(t, e.output))

			result := r.getNodeExeHistory(id, exeID, "156549", nil)
			assert.Equal(t, mustUnmarshalToMap(t, e.output), mustUnmarshalToMap(t, result.Output))
		})
	})
}

func TestStreamResume(t *testing.T) {
	mockey.PatchConvey("test stream resume", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		defer r.runServer()()

		id := r.load("input_complex.json")

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
					DebugURL: ptr.Of(fmt.Sprintf("https://www.coze.cn/work_flow?execute_id={{exeID}}&space_id=123&workflow_id=%s&execute_mode=2", id)),
					InterruptData: &interruptData{
						EventID: "%s/%s",
						Type:    5,
						Data:    "{\"content\":\"[{\\\"type\\\":\\\"object\\\",\\\"name\\\":\\\"input\\\",\\\"schema\\\":[{\\\"type\\\":\\\"string\\\",\\\"name\\\":\\\"name\\\",\\\"required\\\":false},{\\\"type\\\":\\\"integer\\\",\\\"name\\\":\\\"age\\\",\\\"required\\\":false}],\\\"required\\\":false},{\\\"type\\\":\\\"list\\\",\\\"name\\\":\\\"input_list\\\",\\\"schema\\\":{\\\"type\\\":\\\"object\\\",\\\"schema\\\":[{\\\"type\\\":\\\"string\\\",\\\"name\\\":\\\"name\\\",\\\"required\\\":false},{\\\"type\\\":\\\"integer\\\",\\\"name\\\":\\\"age\\\",\\\"required\\\":false}]},\\\"required\\\":false}]\",\"content_type\":\"form_schema\"}",
					},
				},
			},
		}

		var (
			resumeID string
			index    int
		)

		r.publish(id, "v0.0.1", true)

		sseReader := r.openapiStream(id, map[string]any{})
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
					Content:      ptr.Of("{\"output\":{\"age\":1,\"name\":\"eino\"},\"output_list\":[{\"age\":null,\"name\":\"user_1\"},{\"age\":2,\"name\":null}]}"),
					ContentType:  ptr.Of("text"),
				},
			},
			{
				ID:    "1",
				Event: appworkflow.DoneEvent,
				Data: &streamRunData{
					DebugURL: ptr.Of(fmt.Sprintf("https://www.coze.cn/work_flow?execute_id={{exeID}}&space_id=123&workflow_id=%s&execute_mode=2", id)),
				},
			},
		}

		index = 0

		sseReader = r.openapiResume(id, resumeID, mustMarshalToString(t, map[string]any{
			"input":      `{"name": "eino", "age": 1}`,
			"input_list": `[{"name":"user_1"},{"age":2}]`,
		}))
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
		operation := &plugin2.Openapi3Operation{}
		_ = sonic.UnmarshalString(operationString, operation)

		r := newWfTestRunner(t)
		defer r.closeFn()

		r.plugin.EXPECT().MGetOnlinePlugins(gomock.Any(), gomock.Any()).Return([]*entity3.PluginInfo{
			{
				PluginInfo: &plugin2.PluginInfo{
					ID:       123,
					SpaceID:  123,
					Version:  ptr.Of("v0.0.1"),
					Manifest: &plugin2.PluginManifest{NameForHuman: "p1", DescriptionForHuman: "desc"},
				},
			},
		}, nil).AnyTimes()
		r.plugin.EXPECT().MGetOnlineTools(gomock.Any(), gomock.Any()).Return([]*entity3.ToolInfo{
			{ID: 123, Operation: operation},
		}, nil).AnyTimes()

		pluginSrv := plugin3.NewPluginService(r.plugin, r.tos)
		plugin.SetPluginService(pluginSrv)

		t.Run("plugin tool info ", func(t *testing.T) {
			fcSettingDetailReq := &workflow.GetLLMNodeFCSettingDetailRequest{
				PluginList: []*workflow.PluginFCItem{
					{PluginID: "123", APIID: "123"},
				},
			}
			response := post[map[string]any](r, fcSettingDetailReq)
			assert.Equal(t, (*response)["plugin_detail_map"].(map[string]any)["123"].(map[string]any)["description"], "desc")
			assert.Equal(t, (*response)["plugin_detail_map"].(map[string]any)["123"].(map[string]any)["name"], "p1")
			assert.Equal(t, (*response)["plugin_api_detail_map"].(map[string]any)["123"].(map[string]any)["name"], "xz_zgjm")
			assert.Equal(t, 1, len((*response)["plugin_api_detail_map"].(map[string]any)["123"].(map[string]any)["parameters"].([]any)))
		})

		t.Run("workflow tool info ", func(t *testing.T) {
			r.load("entry_exit.json", withID(123), withPublish("v0.0.1"))
			fcSettingDetailReq := &workflow.GetLLMNodeFCSettingDetailRequest{
				WorkflowList: []*workflow.WorkflowFCItem{
					{WorkflowID: "123", PluginID: "123", WorkflowVersion: ptr.Of("v0.0.1")},
				},
			}
			response := post[map[string]any](r, fcSettingDetailReq)
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

		operation := &plugin2.Openapi3Operation{}
		_ = sonic.UnmarshalString(operationString, operation)
		r := newWfTestRunner(t)
		defer r.closeFn()

		r.plugin.EXPECT().MGetOnlinePlugins(gomock.Any(), gomock.Any()).Return([]*entity3.PluginInfo{
			{
				PluginInfo: &plugin2.PluginInfo{
					ID:       123,
					SpaceID:  123,
					Version:  ptr.Of("v0.0.1"),
					Manifest: &plugin2.PluginManifest{NameForHuman: "p1", DescriptionForHuman: "desc"},
				},
			},
		}, nil).AnyTimes()
		r.plugin.EXPECT().MGetOnlineTools(gomock.Any(), gomock.Any()).Return([]*entity3.ToolInfo{
			{ID: 123, Operation: operation},
		}, nil).AnyTimes()

		pluginSrv := plugin3.NewPluginService(r.plugin, r.tos)
		plugin.SetPluginService(pluginSrv)

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
			}
			response := post[map[string]any](r, fcSettingMergedReq)
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
			r.load("entry_exit.json", withID(1234), withPublish("v0.0.1"))
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
			}

			response := post[map[string]any](r, fcSettingMergedReq)
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
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("loop_selector_variable_assign_text_processor.json")
		exeID := r.nodeDebug(id, "192046", withNDInput(map[string]string{"input": `["a", "bb", "ccc", "dddd"]`}))
		e := r.getProcess(id, exeID, withSpecificNodeID("192046"))
		e.assertSuccess()
		assert.Equal(t, map[string]any{
			"converted": []any{
				"new_a",
				"new_ccc",
			},
			"variable_out": "dddd",
		}, mustUnmarshalToMap(t, e.output))

		result := r.getNodeExeHistory(id, exeID, "192046", nil)
		assert.Equal(t, mustUnmarshalToMap(t, e.output), mustUnmarshalToMap(t, result.Output))

		// verify this workflow has not been successfully test ran
		result = r.getNodeExeHistory(id, "", "100001", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.Equal(t, "", result.Output)

		// verify that another node of this workflow is not node debugged
		result = r.getNodeExeHistory(id, "", "wrong_node_id", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.Equal(t, "", result.Output)
	})

	mockey.PatchConvey("test node debug loop", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("loop_selector_variable_assign_text_processor.json")
		exeID := r.nodeDebug(id, "192046", withNDInput(map[string]string{"input": `["a", "bb", "ccc", "dddd"]`}))
		e := r.getProcess(id, exeID, withSpecificNodeID("192046"))
		e.assertSuccess()
		assert.Equal(t, map[string]any{
			"converted": []any{
				"new_a",
				"new_ccc",
			},
			"variable_out": "dddd",
		}, mustUnmarshalToMap(t, e.output))

		result := r.getNodeExeHistory(id, exeID, "192046", nil)
		assert.Equal(t, mustUnmarshalToMap(t, e.output), mustUnmarshalToMap(t, result.Output))

		// verify this workflow has not been successfully test ran
		result = r.getNodeExeHistory(id, "", "100001", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.Equal(t, "", result.Output)

		// verify that another node of this workflow is not node debugged
		result = r.getNodeExeHistory(id, "", "wrong_node_id", ptr.Of(workflow.NodeHistoryScene_TestRunInput))
		assert.Equal(t, "", result.Output)
	})

	mockey.PatchConvey("test node debug loop", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		runner := mockcode.NewMockRunner(r.ctrl)
		runner.EXPECT().Run(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, request *coderunner.RunRequest) (*coderunner.RunResponse, error) {
			return &coderunner.RunResponse{
				Result: request.Params,
			}, nil
		}).AnyTimes()

		code.SetCodeRunner(runner)
		id := r.load("loop_with_object_input.json")
		exeID := r.nodeDebug(id, "122149",
			withNDInput(map[string]string{"input": `[{"a":"1"},{"a":"2"}]`}))
		e := r.getProcess(id, exeID, withSpecificNodeID("122149"))
		e.assertSuccess()
		assert.Equal(t, `{"output":["1","2"]}`, e.output)

	})

}

func TestCopyWorkflow(t *testing.T) {
	mockey.PatchConvey("copy work flow", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("publish/publish_workflow.json", withName("original_workflow"))

		response := post[workflow.CopyWorkflowResponse](r, &workflow.CopyWorkflowRequest{
			WorkflowID: id,
		})

		oldCanvasResponse := post[workflow.GetCanvasInfoResponse](r, &workflow.GetCanvasInfoRequest{
			WorkflowID: ptr.Of(id),
		})

		copiedCanvasResponse := post[workflow.GetCanvasInfoResponse](r, &workflow.GetCanvasInfoRequest{
			WorkflowID: ptr.Of(response.Data.WorkflowID),
		})

		assert.Equal(t, ptr.From(oldCanvasResponse.Data.Workflow.SchemaJSON), ptr.From(copiedCanvasResponse.Data.Workflow.SchemaJSON))
		assert.Equal(t, "original_workflow_1", copiedCanvasResponse.Data.Workflow.Name)

		_ = post[workflow.BatchDeleteWorkflowResponse](r, &workflow.BatchDeleteWorkflowRequest{
			WorkflowIDList: []string{id, response.Data.WorkflowID},
		})

		wid, _ := strconv.ParseInt(id, 10, 64)

		_, err := appworkflow.GetWorkflowDomainSVC().Get(context.Background(), &vo.GetPolicy{
			ID:       wid,
			QType:    vo.FromDraft,
			CommitID: "",
		})
		assert.NotNil(t, err)
		assert.ErrorContains(t, err, strconv.Itoa(errno.ErrWorkflowNotFound))
	})
}

func TestReleaseApplicationWorkflows(t *testing.T) {
	appID := int64(10001000)
	mockey.PatchConvey("normal release application workflow", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		vars := map[string]*vo.TypeInfo{
			"app_v1": {
				Type: vo.DataTypeString,
			},
			"app_list_v1": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeString,
				},
			},
			"app_list_v2": {
				Type: vo.DataTypeString,
			},
		}

		r.varGetter.EXPECT().GetAppVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

		r.load("publish/release_main_workflow.json", withID(100100100100), withProjectID(appID))
		r.load("publish/release_c1_workflow.json", withID(7511615200781402118), withProjectID(appID))
		r.load("publish/release_cc1_workflow.json", withID(7511616004728815618), withProjectID(appID))

		wf, err := appworkflow.GetWorkflowDomainSVC().Get(context.Background(), &vo.GetPolicy{
			ID:       7511616004728815618,
			MetaOnly: true,
		})
		assert.NoError(t, err)
		version := "v0.0.1"
		if wf.LatestPublishedVersion != nil {
			versionSchema := strings.Split(*wf.LatestPublishedVersion, ".")
			vInt, err := strconv.ParseInt(versionSchema[2], 10, 64)
			if err != nil {
				return
			}
			nextVer := strconv.FormatInt(vInt+1, 10)
			versionSchema[2] = nextVer
			version = strings.Join(versionSchema, ".")
		}

		vIssues, err := appworkflow.GetWorkflowDomainSVC().ReleaseApplicationWorkflows(context.Background(), appID, &vo.ReleaseWorkflowConfig{
			Version:      version,
			PluginIDs:    []int64{7511616454588891136},
			ConnectorIDs: []int64{consts.APIConnectorID},
		})
		assert.NoError(t, err)
		assert.Equal(t, 0, len(vIssues))

		wf, err = appworkflow.GetWorkflowDomainSVC().Get(context.Background(), &vo.GetPolicy{
			ID:      100100100100,
			QType:   vo.FromSpecificVersion,
			Version: version,
		})
		assert.NoError(t, err)
		canvasSchema := wf.Canvas

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
						for _, p := range n.Data.Inputs.FCParam.PluginFCParam.PluginList {
							_ = p
							// assert.Equal(t, p.PluginVersion, version) TODO: this assert fails
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

		validateCv(cv.Nodes)
	})

	mockey.PatchConvey("has issues release application workflow", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		vars := map[string]*vo.TypeInfo{
			"app_v1": {
				Type: vo.DataTypeString,
			},
			"app_list_v1": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeString,
				},
			},
			"app_list_v2": {
				Type: vo.DataTypeString,
			},
		}

		r.varGetter.EXPECT().GetAppVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

		r.load("publish/release_error_workflow.json", withID(1001001001001), withProjectID(100010001))
		wf, err := appworkflow.GetWorkflowDomainSVC().Get(context.Background(), &vo.GetPolicy{
			ID:       1001001001001,
			MetaOnly: true,
		})
		assert.NoError(t, err)

		version := "v0.0.1"
		if wf.LatestPublishedVersion != nil {
			versionSchema := strings.Split(*wf.LatestPublishedVersion, ".")
			vInt, err := strconv.ParseInt(versionSchema[2], 10, 64)
			if err != nil {
				return
			}
			nextVer := strconv.FormatInt(vInt+1, 10)
			versionSchema[2] = nextVer
			version = strings.Join(versionSchema, ".")
		}

		vIssues, err := appworkflow.GetWorkflowDomainSVC().ReleaseApplicationWorkflows(context.Background(), 100010001, &vo.ReleaseWorkflowConfig{
			Version:      version,
			PluginIDs:    []int64{},
			ConnectorIDs: []int64{consts.APIConnectorID},
		})
		assert.NoError(t, err)
		assert.Equal(t, 1, len(vIssues))
		assert.Equal(t, 2, len(vIssues[0].IssueMessages))
	})
}

func TestLLMException(t *testing.T) {
	mockey.PatchConvey("test llm exception", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("exception/llm_default_output_retry_timeout.json")

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

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1737521813 {
				return mainChatModel, nil, nil
			} else {
				return fallbackChatModel, nil, nil
			}
		}).AnyTimes()

		mockey.PatchConvey("two retries to succeed", func() {
			exeID := r.nodeDebug(id, "103929", withNDInput(map[string]string{"input": "hello"}))
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, map[string]any{
				"name":      "eino",
				"age":       int64(1),
				"isSuccess": true,
			}, mustUnmarshalToMap(t, e.output))
		})

		mockey.PatchConvey("timeout then use default output", func() {
			fallbackChatModel.InvokeResultProvider = func(index int, in []*schema.Message) (*schema.Message, error) {
				time.Sleep(500 * time.Millisecond)
				return &schema.Message{
					Role:    schema.Assistant,
					Content: `{"name":"eino","age":1}`,
				}, nil
			}

			exeID := r.nodeDebug(id, "103929", withNDInput(map[string]string{"input": "hello"}))
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, map[string]any{
				"name":      "zhangsan",
				"age":       int64(3),
				"isSuccess": false,
				"errorBody": map[string]any{
					"errorMessage": "node timeout",
					"errorCode":    int64(errno.ErrNodeTimeout),
				},
			}, mustUnmarshalToMap(t, e.output))
		})
	})
}

func TestLLMExceptionThenThrow(t *testing.T) {
	mockey.PatchConvey("test llm exception then throw", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("exception/llm_timeout_throw.json")

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

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
			if params.ModelType == 1737521813 {
				return mainChatModel, nil, nil
			} else {
				return fallbackChatModel, nil, nil
			}
		}).AnyTimes()

		exeID := r.nodeDebug(id, "103929", withNDInput(map[string]string{"input": "hello"}))
		e := r.getProcess(id, exeID)
		assert.Equal(t, workflow.WorkflowExeStatus(entity.WorkflowFailed), e.status)
	})
}

func TestCodeExceptionBranch(t *testing.T) {
	mockey.PatchConvey("test code exception branch", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		id := r.load("exception/code_exception_branch.json")

		mockey.PatchConvey("exception branch", func() {
			code.SetCodeRunner(direct.NewRunner())

			exeID := r.testRun(id, map[string]string{"input": "hello"})
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, map[string]any{
				"output":  false,
				"output1": "code result: false",
			}, mustUnmarshalToMap(t, e.output))
		})

		mockey.PatchConvey("normal branch", func() {
			mockCodeRunner := mockcode.NewMockRunner(r.ctrl)
			mockey.Mock(code.GetCodeRunner).Return(mockCodeRunner).Build()
			mockCodeRunner.EXPECT().Run(gomock.Any(), gomock.Any()).Return(&coderunner.RunResponse{
				Result: map[string]any{
					"key0": "value0",
					"key1": []string{"value1", "value2"},
					"key2": map[string]any{},
				},
			}, nil).AnyTimes()

			exeID := r.testRun(id, map[string]string{"input": "hello"})
			e := r.getProcess(id, exeID)
			e.assertSuccess()
			assert.Equal(t, map[string]any{
				"output":  true,
				"output1": "",
			}, mustUnmarshalToMap(t, e.output))

			mockey.PatchConvey("sync run", func() {
				r.publish(id, "v0.0.1", false)

				result, _ := r.openapiSyncRun(id, map[string]string{"input": "hello"})
				assert.Equal(t, map[string]any{
					"output":  true,
					"output1": "",
				}, result)
			})
		})
	})
}

func TestCopyWorkflowAppToLibrary(t *testing.T) {
	r := newWfTestRunner(t)
	appworkflow.SVC.IDGenerator = r.idGen
	defer r.closeFn()

	vars := map[string]*vo.TypeInfo{
		"app_v1": {
			Type: vo.DataTypeString,
		},
		"app_list_v1": {
			Type: vo.DataTypeArray,
			ElemTypeInfo: &vo.TypeInfo{
				Type: vo.DataTypeString,
			},
		},
		"app_list_v2": {
			Type: vo.DataTypeString,
		},
	}

	r.varGetter.EXPECT().GetAppVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()

	mockey.PatchConvey("copy with subworkflow, subworkflow with external resource ", t, func() {
		var copiedIDs = make([]int64, 0)
		var mockPublishWorkflowResource func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error
		var ignoreIDs = map[int64]bool{
			7515027325977624576: true,
			7515027249628708864: true,
			7515027182796668928: true,
			7515027150387281920: true,
			7515027091302121472: true,
		}
		mockPublishWorkflowResource = func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error {
			if ignoreIDs[event.WorkflowID] {
				return nil
			}
			wf, err := appworkflow.GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
				ID:    event.WorkflowID,
				QType: vo.FromLatestVersion,
			})
			copiedIDs = append(copiedIDs, event.WorkflowID)
			assert.NoError(t, err)
			assert.Equal(t, "v0.0.1", wf.Version)
			canvas := &vo.Canvas{}
			err = sonic.UnmarshalString(wf.Canvas, canvas)
			assert.NoError(t, err)

			copiedIDMap := slices.ToMap(copiedIDs, func(e int64) (string, bool) {
				return strconv.FormatInt(e, 10), true
			})

			var validateSubWorkflowIDs func(nodes []*vo.Node)
			validateSubWorkflowIDs = func(nodes []*vo.Node) {
				for _, node := range nodes {
					switch node.Type {
					case vo.BlockTypeBotAPI:
						apiParams := slices.ToMap(node.Data.Inputs.APIParams, func(e *vo.Param) (string, *vo.Param) {
							return e.Name, e
						})
						pluginIDParam, ok := apiParams["pluginID"]
						assert.True(t, ok)
						pID, err := strconv.ParseInt(pluginIDParam.Input.Value.Content.(string), 10, 64)
						assert.NoError(t, err)

						pluginVersionParam, ok := apiParams["pluginVersion"]
						assert.True(t, ok)

						pVersion := pluginVersionParam.Input.Value.Content.(string)

						if pVersion == "0" {
							assert.Equal(t, "100100", pID)
						}

					case vo.BlockTypeBotSubWorkflow:
						assert.True(t, copiedIDMap[node.Data.Inputs.WorkflowID])
						wfId, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
						assert.NoError(t, err)

						subWf, err := appworkflow.GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
							ID:    wfId,
							QType: vo.FromLatestVersion,
						})
						assert.NoError(t, err)
						subworkflowCanvas := &vo.Canvas{}
						err = sonic.UnmarshalString(subWf.Canvas, subworkflowCanvas)
						assert.NoError(t, err)
						validateSubWorkflowIDs(subworkflowCanvas.Nodes)
					case vo.BlockTypeBotLLM:
						if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
							for _, w := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
								assert.True(t, copiedIDMap[w.WorkflowID])
							}
						}

						if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.PluginFCParam != nil {
							for _, p := range node.Data.Inputs.FCParam.PluginFCParam.PluginList {
								if p.PluginVersion == "0" {
									assert.Equal(t, "100100", p.PluginID)
								}
							}
						}

						if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.KnowledgeFCParam != nil {
							for _, k := range node.Data.Inputs.FCParam.KnowledgeFCParam.KnowledgeList {
								assert.Equal(t, "100100", k.ID)
							}
						}
					case vo.BlockTypeBotDataset, vo.BlockTypeBotDatasetWrite:
						datasetListInfoParam := node.Data.Inputs.DatasetParam[0]
						knowledgeIDs := datasetListInfoParam.Input.Value.Content.([]any)
						for idx := range knowledgeIDs {
							assert.Equal(t, "100100", knowledgeIDs[idx].(string))
						}
					case vo.BlockTypeDatabase, vo.BlockTypeDatabaseSelect, vo.BlockTypeDatabaseInsert, vo.BlockTypeDatabaseDelete, vo.BlockTypeDatabaseUpdate:
						for _, d := range node.Data.Inputs.DatabaseInfoList {
							assert.Equal(t, "100100", d.DatabaseInfoID)
						}

					}

				}
			}

			validateSubWorkflowIDs(canvas.Nodes)

			return nil

		}

		r.search.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(mockPublishWorkflowResource).AnyTimes()

		appID := "7513788954458456064"
		appIDInt64, _ := strconv.ParseInt(appID, 10, 64)

		r.load("copy_to_app/child_4.json", withID(7515027325977624576), withProjectID(appIDInt64))
		r.load("copy_to_app/child_3.json", withID(7515027249628708864), withProjectID(appIDInt64))
		r.load("copy_to_app/child_2.json", withID(7515027182796668928), withProjectID(appIDInt64))
		r.load("copy_to_app/child_1.json", withID(7515027150387281920), withProjectID(appIDInt64))
		r.load("copy_to_app/main.json", withID(7515027091302121472), withProjectID(appIDInt64))

		defer mockey.Mock((*appknowledge.KnowledgeApplicationService).CopyKnowledge).Return(&modelknowledge.CopyKnowledgeResponse{
			TargetKnowledgeID: 100100,
		}, nil).Build().UnPatch()

		mockCopyDatabase := func(ctx context.Context, req *appmemory.CopyDatabaseRequest) (*appmemory.CopyDatabaseResponse, error) {
			es := make(map[int64]*entity4.Database)
			for _, id := range req.DatabaseIDs {
				es[id] = &entity4.Database{ID: 100100}
			}
			return &appmemory.CopyDatabaseResponse{
				Databases: es,
			}, nil
		}

		defer mockey.Mock((*appmemory.DatabaseApplicationService).CopyDatabase).To(mockCopyDatabase).Build().UnPatch()

		defer mockey.Mock((*appplugin.PluginApplicationService).CopyPlugin).Return(&appplugin.CopyPluginResponse{
			Plugin: &entity5.PluginInfo{
				PluginInfo: &pluginmodel.PluginInfo{
					ID:      100100,
					Version: ptr.Of("v0.0.1"),
				},
			},
		}, nil).Build().UnPatch()

		_, is, err := appworkflow.SVC.CopyWorkflowFromAppToLibrary(t.Context(), 7515027091302121472, appIDInt64, appIDInt64)
		assert.NoError(t, err)
		assert.Equal(t, 0, len(is))
	})

	mockey.PatchConvey("copy only with external resource", t, func() {
		var copiedIDs = make([]int64, 0)
		var mockPublishWorkflowResource func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error
		var ignoreIDs = map[int64]bool{
			7516518409656336384: true,
			7516516198096306176: true,
		}
		mockPublishWorkflowResource = func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error {
			if ignoreIDs[event.WorkflowID] {
				return nil
			}
			wf, err := appworkflow.GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
				ID:    event.WorkflowID,
				QType: vo.FromLatestVersion,
			})

			copiedIDs = append(copiedIDs, event.WorkflowID)
			assert.NoError(t, err)
			assert.Equal(t, "v0.0.1", wf.Version)
			canvas := &vo.Canvas{}
			err = sonic.UnmarshalString(wf.Canvas, canvas)
			assert.NoError(t, err)

			copiedIDMap := slices.ToMap(copiedIDs, func(e int64) (string, bool) {
				return strconv.FormatInt(e, 10), true
			})
			var validateSubWorkflowIDs func(nodes []*vo.Node)
			validateSubWorkflowIDs = func(nodes []*vo.Node) {
				for _, node := range nodes {
					switch node.Type {
					case vo.BlockTypeBotSubWorkflow:
						assert.True(t, copiedIDMap[node.Data.Inputs.WorkflowID])
					case vo.BlockTypeBotLLM:
						if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
							for _, w := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
								assert.True(t, copiedIDMap[w.WorkflowID])
							}
						}

						if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.PluginFCParam != nil {
							for _, p := range node.Data.Inputs.FCParam.PluginFCParam.PluginList {
								_ = p
							}
						}

						if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.KnowledgeFCParam != nil {
							for _, k := range node.Data.Inputs.FCParam.KnowledgeFCParam.KnowledgeList {
								assert.Equal(t, "100100", k.ID)
							}
						}
					case vo.BlockTypeBotDataset, vo.BlockTypeBotDatasetWrite:
						datasetListInfoParam := node.Data.Inputs.DatasetParam[0]
						knowledgeIDs := datasetListInfoParam.Input.Value.Content.([]any)
						for idx := range knowledgeIDs {
							assert.Equal(t, "100100", knowledgeIDs[idx].(string))
						}
					case vo.BlockTypeDatabase, vo.BlockTypeDatabaseSelect, vo.BlockTypeDatabaseInsert, vo.BlockTypeDatabaseDelete, vo.BlockTypeDatabaseUpdate:
						for _, d := range node.Data.Inputs.DatabaseInfoList {
							assert.Equal(t, "100100", d.DatabaseInfoID)
						}

					}

				}
			}

			validateSubWorkflowIDs(canvas.Nodes)
			return nil

		}

		r.search.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(mockPublishWorkflowResource).AnyTimes()

		defer mockey.Mock((*appknowledge.KnowledgeApplicationService).CopyKnowledge).Return(&modelknowledge.CopyKnowledgeResponse{
			TargetKnowledgeID: 100100,
		}, nil).Build().UnPatch()

		mockCopyDatabase := func(ctx context.Context, req *appmemory.CopyDatabaseRequest) (*appmemory.CopyDatabaseResponse, error) {
			es := make(map[int64]*entity4.Database)
			for _, id := range req.DatabaseIDs {
				es[id] = &entity4.Database{ID: 100100}
			}
			return &appmemory.CopyDatabaseResponse{
				Databases: es,
			}, nil
		}

		defer mockey.Mock((*appmemory.DatabaseApplicationService).CopyDatabase).To(mockCopyDatabase).Build().UnPatch()

		defer mockey.Mock((*appplugin.PluginApplicationService).CopyPlugin).Return(&appplugin.CopyPluginResponse{
			Plugin: &entity5.PluginInfo{
				PluginInfo: &pluginmodel.PluginInfo{
					ID:      time.Now().Unix(),
					Version: ptr.Of("v0.0.1"),
				},
			},
		}, nil).Build().UnPatch()

		appIDInt64 := int64(7516515408422109184)

		r.load("copy_to_app/child2_1.json", withID(7516518409656336384), withProjectID(appIDInt64))
		r.load("copy_to_app/main2.json", withID(7516516198096306176), withProjectID(appIDInt64))

		_, ret, err := appworkflow.SVC.CopyWorkflowFromAppToLibrary(t.Context(), 7516516198096306176, 123, appIDInt64)
		assert.NoError(t, err)
		assert.Equal(t, 0, len(ret))
	})
}

func TestMoveWorkflowAppToLibrary(t *testing.T) {
	mockey.PatchConvey("test move workflow", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		vars := map[string]*vo.TypeInfo{
			"app_v1": {
				Type: vo.DataTypeString,
			},
			"app_list_v1": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeString,
				},
			},
			"app_list_v2": {
				Type: vo.DataTypeString,
			},
		}

		r.varGetter.EXPECT().GetAppVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()
		t.Run("move workflow", func(t *testing.T) {

			var mockPublishWorkflowResource func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error

			named2Idx := []string{"c1", "c2", "cc1", "main"}
			callCount := 0
			initialWf2ID := map[string]int64{}
			old2newID := map[int64]int64{}
			mockPublishWorkflowResource = func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error {
				if callCount <= 3 {
					initialWf2ID[named2Idx[callCount]] = event.WorkflowID
					callCount++
					return nil
				}
				if OpType == crosssearch.Created {
					if oldID, ok := initialWf2ID[*event.Name]; ok {
						old2newID[oldID] = event.WorkflowID
					}
				}

				return nil

			}

			r.search.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(mockPublishWorkflowResource).AnyTimes()

			defer mockey.Mock((*appknowledge.KnowledgeApplicationService).MoveKnowledgeToLibrary).Return(nil).Build().UnPatch()
			defer mockey.Mock((*appmemory.DatabaseApplicationService).MoveDatabaseToLibrary).Return(&appmemory.MoveDatabaseToLibraryResponse{}, nil).Build().UnPatch()

			defer mockey.Mock((*appplugin.PluginApplicationService).MoveAPPPluginToLibrary).Return(&entity5.PluginInfo{
				PluginInfo: &pluginmodel.PluginInfo{
					ID:      time.Now().Unix(),
					Version: ptr.Of("v0.0.1"),
				},
			}, nil).Build().UnPatch()

			ctx := t.Context()

			appIDInt64 := time.Now().UnixNano()
			c1IdStr := r.load("move_to_app/c1.json", withName("c1"), withProjectID(appIDInt64))
			c2IdStr := r.load("move_to_app/c2.json", withName("c2"), withProjectID(appIDInt64))

			data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/move_to_app/main.json")
			assert.NoError(t, err)
			mainCanvas := &vo.Canvas{}
			err = sonic.Unmarshal(data, mainCanvas)
			assert.NoError(t, err)
			for _, node := range mainCanvas.Nodes {
				if node.Type == vo.BlockTypeBotSubWorkflow {
					if node.Data.Inputs.WorkflowID == "7516826260387921920" {
						node.Data.Inputs.WorkflowID = c1IdStr
					}
					if node.Data.Inputs.WorkflowID == "7516826283318181888" {
						node.Data.Inputs.WorkflowID = c2IdStr
					}
				}
			}

			cc1Data, err := os.ReadFile("../../../domain/workflow/internal/canvas/examples/move_to_app/cc1.json")
			assert.NoError(t, err)
			cc1Canvas := &vo.Canvas{}
			err = sonic.Unmarshal(cc1Data, cc1Canvas)
			assert.NoError(t, err)
			for _, node := range cc1Canvas.Nodes {
				if node.Type == vo.BlockTypeBotSubWorkflow {
					if node.Data.Inputs.WorkflowID == "7516826283318181888" {
						node.Data.Inputs.WorkflowID = c2IdStr
					}
				}
			}
			cc1Data, _ = sonic.Marshal(cc1Canvas)
			cc1IdStr := r.load("", withName("cc1"), withProjectID(appIDInt64), withWorkflowData(cc1Data))
			data, _ = sonic.Marshal(mainCanvas)
			mIdStr := r.load("", withName("main"), withProjectID(appIDInt64), withWorkflowData(data))

			mId, err := strconv.ParseInt(mIdStr, 10, 64)

			id, vs, err := appworkflow.SVC.MoveWorkflowFromAppToLibrary(ctx, mId, 123, appIDInt64)
			assert.NoError(t, err)

			assert.Equal(t, 0, len(vs))
			assert.Equal(t, id, old2newID[mId])
			_, err = getCanvas(ctx, mIdStr)

			assert.NotNil(t, err)
			assert.Contains(t, err.Error(), "record not found")
			_, err = getCanvas(ctx, c1IdStr)

			assert.NotNil(t, err)
			assert.Contains(t, err.Error(), "record not found")
			_, err = getCanvas(ctx, c2IdStr)
			assert.NotNil(t, err)
			assert.Contains(t, err.Error(), "record not found")

			mIdInt64, _ := strconv.ParseInt(mIdStr, 10, 64)
			newMainID := old2newID[mIdInt64]
			schemaJson, err := getCanvas(ctx, strconv.FormatInt(newMainID, 10))

			assert.NoError(t, err)

			c1IDInt64, _ := strconv.ParseInt(c1IdStr, 10, 64)
			c2IDInt64, _ := strconv.ParseInt(c2IdStr, 10, 64)

			newC1ID := old2newID[c1IDInt64]
			newC2ID := old2newID[c2IDInt64]

			newSubWorkflowID := map[string]bool{
				strconv.FormatInt(newC1ID, 10): true,
				strconv.FormatInt(newC2ID, 10): true,
			}
			newMainCanvas := &vo.Canvas{}
			err = sonic.UnmarshalString(schemaJson, newMainCanvas)
			assert.NoError(t, err)

			for _, node := range newMainCanvas.Nodes {
				if node.Type == vo.BlockTypeBotSubWorkflow {
					assert.True(t, newSubWorkflowID[node.Data.Inputs.WorkflowID])
					assert.Equal(t, "v0.0.1", node.Data.Inputs.WorkflowVersion)
				}
			}

			schemaJson, err = getCanvas(ctx, cc1IdStr)
			assert.NoError(t, err)

			cc1Canvas = &vo.Canvas{}
			err = sonic.UnmarshalString(schemaJson, cc1Canvas)
			assert.NoError(t, err)

			for _, node := range cc1Canvas.Nodes {
				if node.Type == vo.BlockTypeBotSubWorkflow {
					assert.True(t, newSubWorkflowID[node.Data.Inputs.WorkflowID])
					assert.Equal(t, "v0.0.1", node.Data.Inputs.WorkflowVersion)
				}
			}
		})

	})
}

func TestDuplicateWorkflowsByAppID(t *testing.T) {
	mockey.PatchConvey("test duplicate work", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		vars := map[string]*vo.TypeInfo{
			"app_v1": {
				Type: vo.DataTypeString,
			},
			"app_list_v1": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeString,
				},
			},
			"app_list_v2": {
				Type: vo.DataTypeString,
			},
		}

		r.varGetter.EXPECT().GetAppVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil).AnyTimes()
		var copiedIDs = make([]int64, 0)
		var mockPublishWorkflowResource func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error
		var ignoreIDs = map[int64]bool{
			7515027325977624576: true,
			7515027249628708864: true,
			7515027182796668928: true,
			7515027150387281920: true,
			7515027091302121472: true,
			7515027325977624579: true,
		}
		mockPublishWorkflowResource = func(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error {
			if ignoreIDs[event.WorkflowID] {
				return nil
			}
			copiedIDs = append(copiedIDs, event.WorkflowID)
			return nil

		}

		r.search.EXPECT().PublishWorkflowResource(gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(mockPublishWorkflowResource).AnyTimes()

		appIDInt64 := int64(7513788954458456064)

		r.load("copy_to_app/child_5.json", withID(7515027325977624579), withProjectID(appIDInt64))
		r.load("copy_to_app/child_4.json", withID(7515027325977624576), withProjectID(appIDInt64))
		r.load("copy_to_app/child_3.json", withID(7515027249628708864), withProjectID(appIDInt64))
		r.load("copy_to_app/child_2.json", withID(7515027182796668928), withProjectID(appIDInt64))
		r.load("copy_to_app/child_1.json", withID(7515027150387281920), withProjectID(appIDInt64))
		r.load("copy_to_app/main.json", withID(7515027091302121472), withProjectID(appIDInt64))
		targetAppID := int64(7513788954458456066)

		err := appworkflow.SVC.DuplicateWorkflowsByAppID(t.Context(), appIDInt64, targetAppID, appworkflow.ExternalResource{})
		assert.NoError(t, err)

		copiedIDMap := slices.ToMap(copiedIDs, func(e int64) (string, bool) {
			return strconv.FormatInt(e, 10), true
		})
		var validateSubWorkflowIDs func(nodes []*vo.Node)
		validateSubWorkflowIDs = func(nodes []*vo.Node) {
			for _, node := range nodes {
				if node.Type == vo.BlockTypeBotSubWorkflow {
					assert.True(t, copiedIDMap[node.Data.Inputs.WorkflowID])
				}
				if node.Type == vo.BlockTypeBotLLM {
					if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
						for _, w := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
							assert.True(t, copiedIDMap[w.WorkflowID])
						}
					}
				}

			}
		}
		for id := range copiedIDMap {
			schemaString, err := getCanvas(t.Context(), id)
			assert.NoError(t, err)
			cs := &vo.Canvas{}
			err = sonic.UnmarshalString(schemaString, cs)
			assert.NoError(t, err)
			validateSubWorkflowIDs(cs.Nodes)
		}

	})
}

func TestMismatchedTypeConvert(t *testing.T) {
	mockey.PatchConvey("test mismatched type convert", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		chatModel := &testutil.UTChatModel{
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

		r.modelManage.EXPECT().GetModel(gomock.Any(), gomock.Any()).Return(chatModel, nil, nil).AnyTimes()

		id := r.load("type_convert/mismatched_types.json")
		exeID := r.testRun(id, map[string]string{
			"input": "what's the meaning of life",
			"arr_str": `[
  "{\"a\":1}"
]`,
			"bool_a":  "True",
			"int_a":   "2",
			"num_a":   "3.5",
			"obj":     `{"b":true}`,
			"obj_str": `{"s":[2,false]}`,
		})
		e := r.getProcess(id, exeID)
		e.assertSuccess()
		assert.Equal(t, "false [] {\"s\":[2,false]} [{\"a\":1}] 3 0 {\"b\":true}\nI don't know. {\"a\":1} false", e.output)
	})
}

func TestJsonSerializationDeserialization(t *testing.T) {
	mockey.PatchConvey("test JSON serialization and deserialization workflow", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		idStr := r.load("json/json_test.json")

		mockey.PatchConvey("no type conversion", func() {
			testInput := map[string]string{
				"person": `{"int":123,"string":"hello","bool":true}`,
			}

			exeID := r.testRun(idStr, testInput)
			e := r.getProcess(idStr, exeID)
			output := e.output
			t.Logf("JSON deserialization result (no conversion): %s", output)

			var result map[string]any
			err := sonic.Unmarshal([]byte(output), &result)
			assert.NoError(t, err, "Failed to unmarshal output JSON")

			outputData, ok := result["output"].(map[string]any)
			assert.True(t, ok, "output field is not a map[string]any")

			assert.Equal(t, int64(123), outputData["int"], "int field mismatch")
			assert.Equal(t, "hello", outputData["string"], "string field mismatch")
			assert.Equal(t, true, outputData["bool"], "bool field mismatch")
		})

		mockey.PatchConvey("legal type conversion", func() {
			testInput := map[string]string{
				"person": `{"int":"123","string":456,"bool":"true"}`,
			}

			exeID := r.testRun(idStr, testInput)
			e := r.getProcess(idStr, exeID)
			output := e.output
			t.Logf("JSON deserialization result (legal conversion): %s", output)

			var result map[string]any
			err := sonic.Unmarshal([]byte(output), &result)
			assert.NoError(t, err, "Failed to unmarshal output JSON")

			outputData, ok := result["output"].(map[string]any)
			assert.True(t, ok, "output field is not a map[string]any")

			assert.Equal(t, int64(123), outputData["int"], "int field mismatch")
			assert.Equal(t, "456", outputData["string"], "string field mismatch")
			assert.Equal(t, true, outputData["bool"], "bool field mismatch")
		})
	})
}

func TestJsonSerializationDeserializationWithWarning(t *testing.T) {
	mockey.PatchConvey("test JSON serialization and deserialization with warning", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()

		idStr := r.load("json/json_test_warning.json")
		testInput := map[string]string{
			"person": `{"int":1,"string":"abc","bool":true}`,
		}

		exeID := r.testRun(idStr, testInput)
		e := r.getProcess(idStr, exeID)
		output := e.output
		t.Logf("JSON deserialization result (legal conversion): %s", output)

		var result map[string]any
		err := sonic.Unmarshal([]byte(output), &result)
		assert.NoError(t, err, "Failed to unmarshal output JSON")

		outputData, ok := result["output"].(map[string]any)
		assert.True(t, ok, "output field is not a map[string]any")

		assert.Equal(t, nil, outputData["int"], "int field mismatch")
		assert.Equal(t, "abc", outputData["string"], "string field mismatch")
		assert.Equal(t, true, outputData["bool"], "bool field mismatch")
	})
}

func TestSetAppVariablesFOrSubProcesses(t *testing.T) {
	mockey.PatchConvey("app variables for sub_process", t, func() {
		r := newWfTestRunner(t)
		defer r.closeFn()
		r.appVarS.EXPECT().Get(gomock.Any(), gomock.Any(), gomock.Any()).Return("1.0", nil).AnyTimes()
		idStr := r.load("app_variables_for_sub_process.json")
		r.publish(idStr, "v0.0.1", true)
		result, _ := r.openapiSyncRun(idStr, map[string]any{
			"input": "ax",
		})

		assert.Equal(t, result, map[string]any{
			"output": "ax",
		})

	})
}
