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

package workflow

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"regexp"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/cloudwego/eino/schema"
	xmaps "golang.org/x/exp/maps"
	"golang.org/x/sync/errgroup"
	"gopkg.in/yaml.v3"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	pluginmodel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	resource "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	appknowledge "github.com/coze-dev/coze-studio/backend/application/knowledge"
	appmemory "github.com/coze-dev/coze-studio/backend/application/memory"
	appplugin "github.com/coze-dev/coze-studio/backend/application/plugin"
	"github.com/coze-dev/coze-studio/backend/application/user"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/contract/knowledge"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	crossuser "github.com/coze-dev/coze-studio/backend/crossdomain/contract/user"
	search "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	domainWorkflow "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/maps"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type ApplicationService struct {
	DomainSVC   domainWorkflow.Service
	ImageX      imagex.ImageX // we set Imagex here, because Imagex is used as a proxy to get auth token, there is no actual correlation with the workflow domain.
	TosClient   storage.Storage
	IDGenerator idgen.IDGenerator
}

var (
	SVC                = &ApplicationService{}
	nodeIconURLCache   = make(map[string]string)
	nodeIconURLCacheMu sync.Mutex
)

// getLocalizedMessage 获取本地化消息
func getLocalizedMessage(ctx context.Context, key string) string {
	locale := i18n.GetLocale(ctx)

	// 中英文消息映射
	messages := map[string]map[string]string{
		"zh-CN": {
			"no_valid_files_to_import":  "没有有效的文件可以导入",
			"file_parse_failed":         "文件 \"%s\" 解析失败：%v",
			"file_missing_schema_nodes": "文件 %s 缺少必要字段：schema 或 nodes",
			"workflow_name_duplicate":   "工作流名称重复：\"%s\"",
			"batch_import_files":        "批量导入文件：",
			"batch_import_failed_http":  "批量导入失败，HTTP状态码：%d",
			"invalid_response_format":   "服务器返回了无效的响应格式，请检查API接口",
			"batch_import_api_response": "批量导入API响应：",
			"batch_import_failed":       "批量导入失败",
		},
		"en-US": {
			"no_valid_files_to_import":  "No valid files to import",
			"file_parse_failed":         "File \"%s\" parse failed: %v",
			"file_missing_schema_nodes": "File %s missing required fields: schema or nodes",
			"workflow_name_duplicate":   "Duplicate workflow name: \"%s\"",
			"batch_import_files":        "Batch import files:",
			"batch_import_failed_http":  "Batch import failed, HTTP status code: %d",
			"invalid_response_format":   "Server returned invalid response format, please check API interface",
			"batch_import_api_response": "Batch import API response:",
			"batch_import_failed":       "Batch import failed",
		},
	}

	// 获取对应语言的消息
	if localeMessages, exists := messages[string(locale)]; exists {
		if message, exists := localeMessages[key]; exists {
			return message
		}
	}

	// 默认返回英文
	if enMessages, exists := messages["en-US"]; exists {
		if message, exists := enMessages[key]; exists {
			return message
		}
	}

	// 如果都没找到，返回key本身
	return key
}

func GetWorkflowDomainSVC() domainWorkflow.Service {
	return SVC.DomainSVC
}

func (w *ApplicationService) InitNodeIconURLCache(ctx context.Context) error {
	category2NodeMetaList, _, err := GetWorkflowDomainSVC().ListNodeMeta(ctx, nil)
	if err != nil {
		logs.Errorf("failed to list node meta for icon url cache: %v", err)
		return err
	}

	eg, gCtx := errgroup.WithContext(ctx)
	for _, nodeMetaList := range category2NodeMetaList {
		for _, nodeMeta := range nodeMetaList {
			eg.Go(func() error {
				if len(nodeMeta.IconURI) == 0 {
					// For custom nodes, if IconURI is not set, there will be no icon.
					logs.Warnf("node '%s' has an empty IconURI, it will have no icon", nodeMeta.Name)
					return nil
				}
				url, err := w.TosClient.GetObjectUrl(gCtx, nodeMeta.IconURI)
				if err != nil {
					logs.Warnf("failed to get object url for node %s: %v", nodeMeta.Name, err)
					return err
				}
				nodeTypeStr := entity.IDStrToNodeType(strconv.FormatInt(nodeMeta.ID, 10))
				if len(nodeTypeStr) > 0 {
					nodeIconURLCacheMu.Lock()
					nodeIconURLCache[string(nodeTypeStr)] = url
					nodeIconURLCacheMu.Unlock()
				}
				return nil
			})
		}
	}

	if err := eg.Wait(); err != nil {
		return err
	}

	logs.Infof("node icon url cache initialized with %d entries", len(nodeIconURLCache))
	return nil
}

func (w *ApplicationService) GetNodeTemplateList(ctx context.Context, req *workflow.NodeTemplateListRequest) (
	_ *workflow.NodeTemplateListResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	toQueryTypes := make(map[entity.NodeType]bool)
	for _, t := range req.NodeTypes {
		entityType := entity.IDStrToNodeType(t)
		if len(entityType) == 0 {
			logs.Warnf("get node type %v failed, err:=%v", t, err)
			continue
		}
		toQueryTypes[entityType] = true
	}
	category2NodeMetaList, categories, err := GetWorkflowDomainSVC().ListNodeMeta(ctx, toQueryTypes)
	if err != nil {
		return nil, err
	}

	resp := &workflow.NodeTemplateListResponse{
		Data: &workflow.NodeTemplateListData{},
	}

	categoryMap := make(map[string]*workflow.NodeCategory)

	for category, nodeMetaList := range category2NodeMetaList {
		categoryMap[category] = &workflow.NodeCategory{
			Name: category,
		}
		for _, nodeMeta := range nodeMetaList {
			nodeID := fmt.Sprintf("%d", nodeMeta.ID)
			nodeType := entity.IDStrToNodeType(nodeID)
			url := nodeIconURLCache[string(nodeType)]
			tpl := &workflow.NodeTemplate{
				ID:           nodeID,
				Type:         workflow.NodeTemplateType(nodeMeta.ID),
				Name:         ternary.IFElse(i18n.GetLocale(ctx) == i18n.LocaleEN, nodeMeta.EnUSName, nodeMeta.Name),
				Desc:         ternary.IFElse(i18n.GetLocale(ctx) == i18n.LocaleEN, nodeMeta.EnUSDescription, nodeMeta.Desc),
				IconURL:      url,
				SupportBatch: ternary.IFElse(nodeMeta.SupportBatch, workflow.SupportBatch_SUPPORT, workflow.SupportBatch_NOT_SUPPORT),
				NodeType:     nodeID,
				Color:        nodeMeta.Color,
			}

			resp.Data.TemplateList = append(resp.Data.TemplateList, tpl)
			categoryMap[category].NodeTypeList = append(categoryMap[category].NodeTypeList, nodeID)
		}
	}

	for _, cate := range categories {
		key := cate.Key
		nodeCategory, ok := categoryMap[key]
		if !ok {
			continue
		}
		resp.Data.CateList = append(resp.Data.CateList, &workflow.NodeCategory{
			Name:         ternary.IFElse(i18n.GetLocale(ctx) == i18n.LocaleEN, cate.EnUSName, cate.Name),
			NodeTypeList: nodeCategory.NodeTypeList,
		})
	}

	return resp, nil
}

func (w *ApplicationService) CreateWorkflow(ctx context.Context, req *workflow.CreateWorkflowRequest) (
	_ *workflow.CreateWorkflowResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.MustGetUIDFromCtx(ctx)
	spaceID := mustParseInt64(req.GetSpaceID())
	if err := checkUserSpace(ctx, uID, spaceID); err != nil {
		return nil, err
	}

	var createConversation bool
	if req.ProjectID != nil && req.IsSetFlowMode() && req.GetFlowMode() == workflow.WorkflowMode_ChatFlow && req.IsSetCreateConversation() && req.GetCreateConversation() {
		createConversation = true
		_, err := GetWorkflowDomainSVC().CreateDraftConversationTemplate(ctx, &vo.CreateConversationTemplateMeta{
			AppID:   mustParseInt64(req.GetProjectID()),
			UserID:  uID,
			SpaceID: spaceID,
			Name:    req.Name,
		})
		if err != nil {
			return nil, err
		}
	}

	wf := &vo.MetaCreate{
		CreatorID:        uID,
		SpaceID:          spaceID,
		ContentType:      workflow.WorkFlowType_User,
		Name:             req.Name,
		Desc:             req.Desc,
		IconURI:          req.IconURI,
		AppID:            parseInt64(req.ProjectID),
		Mode:             ternary.IFElse(req.IsSetFlowMode(), req.GetFlowMode(), workflow.WorkflowMode_Workflow),
		InitCanvasSchema: vo.GetDefaultInitCanvasJsonSchema(i18n.GetLocale(ctx)),
	}
	if req.IsSetFlowMode() && req.GetFlowMode() == workflow.WorkflowMode_ChatFlow {
		conversationName := req.Name
		if !req.IsSetProjectID() || mustParseInt64(req.GetProjectID()) == 0 || !createConversation {
			conversationName = "Default"
		}

		wf.InitCanvasSchema = vo.GetDefaultInitCanvasJsonSchemaChat(i18n.GetLocale(ctx), conversationName)
	}

	id, err := GetWorkflowDomainSVC().Create(ctx, wf)
	if err != nil {
		return nil, err
	}

	err = PublishWorkflowResource(ctx, id, ptr.Of(int32(wf.Mode)), search.Created, &search.ResourceDocument{
		Name:          &wf.Name,
		APPID:         wf.AppID,
		SpaceID:       &wf.SpaceID,
		OwnerID:       &wf.CreatorID,
		PublishStatus: ptr.Of(resource.PublishStatus_UnPublished),
		CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
	})
	if err != nil {
		return nil, vo.WrapError(errno.ErrNotifyWorkflowResourceChangeErr, err)
	}

	return &workflow.CreateWorkflowResponse{
		Data: &workflow.CreateWorkflowData{
			WorkflowID: strconv.FormatInt(id, 10),
		},
	}, nil
}

func (w *ApplicationService) SaveWorkflow(ctx context.Context, req *workflow.SaveWorkflowRequest) (
	_ *workflow.SaveWorkflowResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	if err := GetWorkflowDomainSVC().Save(ctx, mustParseInt64(req.WorkflowID), req.GetSchema()); err != nil {
		return nil, err
	}

	return &workflow.SaveWorkflowResponse{
		Data: &workflow.SaveWorkflowData{},
	}, nil
}

func (w *ApplicationService) UpdateWorkflowMeta(ctx context.Context, req *workflow.UpdateWorkflowMetaRequest) (
	_ *workflow.UpdateWorkflowMetaResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	workflowID := mustParseInt64(req.GetWorkflowID())

	err = GetWorkflowDomainSVC().UpdateMeta(ctx, mustParseInt64(req.GetWorkflowID()), &vo.MetaUpdate{
		Name:         req.Name,
		Desc:         req.Desc,
		IconURI:      req.IconURI,
		WorkflowMode: req.FlowMode,
	})
	if err != nil {
		return nil, err
	}

	safego.Go(ctx, func() {
		err := PublishWorkflowResource(ctx, workflowID, nil, search.Updated, &search.ResourceDocument{
			Name:         req.Name,
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		})
		if err != nil {
			logs.CtxErrorf(ctx, "publish update workflow resource failed, workflowID: %d, err: %v", workflowID, err)
		}
	})

	return &workflow.UpdateWorkflowMetaResponse{}, nil
}

func (w *ApplicationService) DeleteWorkflow(ctx context.Context, req *workflow.DeleteWorkflowRequest) (
	_ *workflow.DeleteWorkflowResponse, err error,
) {
	_, err = w.BatchDeleteWorkflow(ctx, &workflow.BatchDeleteWorkflowRequest{
		WorkflowIDList: []string{req.GetWorkflowID()},
		SpaceID:        req.SpaceID,
		Action:         req.Action,
	})

	if err != nil {
		return nil, err
	}

	return &workflow.DeleteWorkflowResponse{
		Data: &workflow.DeleteWorkflowData{
			Status: workflow.DeleteStatus_SUCCESS,
		},
	}, nil
}

func (w *ApplicationService) deleteWorkflowResource(ctx context.Context, policy *vo.DeletePolicy) error {
	ids, err := GetWorkflowDomainSVC().Delete(ctx, policy)
	if err != nil {
		return err
	}

	safego.Go(ctx, func() {
		for _, id := range ids {
			if err = PublishWorkflowResource(ctx, id, nil, search.Deleted, &search.ResourceDocument{}); err != nil {
				logs.CtxErrorf(ctx, "publish delete workflow event resource failed, workflowID: %d, err: %v", id, err)
			}
		}
	})

	return nil
}

func (w *ApplicationService) BatchDeleteWorkflow(ctx context.Context, req *workflow.BatchDeleteWorkflowRequest) (
	_ *workflow.BatchDeleteWorkflowResponse, err error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	ids, err := slices.TransformWithErrorCheck(req.GetWorkflowIDList(), func(a string) (int64, error) {
		return strconv.ParseInt(a, 10, 64)
	})
	if err != nil {
		return nil, err
	}

	err = w.deleteWorkflowResource(ctx, &vo.DeletePolicy{
		IDs: ids,
	})
	if err != nil {
		return nil, err
	}

	return &workflow.BatchDeleteWorkflowResponse{
		Data: &workflow.DeleteWorkflowData{
			Status: workflow.DeleteStatus_SUCCESS,
		},
	}, nil
}

func (w *ApplicationService) GetCanvasInfo(ctx context.Context, req *workflow.GetCanvasInfoRequest) (
	_ *workflow.GetCanvasInfoResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if req.GetSpaceID() != strconv.FormatInt(consts.TemplateSpaceID, 10) {
		if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
			return nil, err
		}
	}

	wf, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:    mustParseInt64(req.GetWorkflowID()),
		QType: workflowModel.FromDraft,
	})
	if err != nil {
		return nil, err
	}

	devStatus := workflow.WorkFlowDevStatus_CanNotSubmit
	if wf.TestRunSuccess {
		devStatus = workflow.WorkFlowDevStatus_CanSubmit
	}

	vcsType := workflow.VCSCanvasType_Draft

	if !wf.Modified {
		vcsType = workflow.VCSCanvasType_Publish
		devStatus = workflow.WorkFlowDevStatus_HadSubmit
	}

	updateTime := time.Time{}
	if wf.UpdatedAt != nil {
		updateTime = *wf.UpdatedAt
	}
	if wf.DraftMeta != nil && wf.DraftMeta.Timestamp.After(updateTime) {
		updateTime = wf.DraftMeta.Timestamp
	}
	if wf.VersionMeta != nil && wf.VersionMeta.VersionCreatedAt.After(updateTime) {
		updateTime = wf.VersionMeta.VersionCreatedAt
	}

	pluginID := "0"
	if wf.HasPublished {
		pluginID = strconv.FormatInt(wf.ID, 10)
	}

	canvasData := &workflow.CanvasData{
		Workflow: &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(wf.ID, 10),
			Name:             wf.Name,
			Desc:             wf.Desc,
			URL:              wf.IconURL,
			IconURI:          wf.IconURI,
			Status:           devStatus,
			Type:             wf.ContentType,
			CreateTime:       wf.CreatedAt.Unix(),
			UpdateTime:       updateTime.Unix(),
			Tag:              wf.Tag,
			TemplateAuthorID: ternary.IFElse(wf.AuthorID > 0, ptr.Of(strconv.FormatInt(wf.AuthorID, 10)), nil),
			SpaceID:          ptr.Of(strconv.FormatInt(wf.SpaceID, 10)),
			SchemaJSON:       ptr.Of(wf.Canvas),
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
			FlowMode:         wf.Mode,
			ProjectID:        i64PtrToStringPtr(wf.AppID),
			PersistenceModel: workflow.PersistenceModel_VCS, // the front-end validation logic, this field returns VCS, developers don't need to pay attention
			PluginID:         pluginID,
		},
		VcsData: &workflow.VCSCanvasData{
			SubmitCommitID: wf.CommitID,
			DraftCommitID:  wf.CommitID,
			Type:           vcsType,
		},
		WorkflowVersion: wf.LatestPublishedVersion,
	}

	return &workflow.GetCanvasInfoResponse{
		Data: canvasData,
	}, nil
}

func (w *ApplicationService) TestRun(ctx context.Context, req *workflow.WorkFlowTestRunRequest) (_ *workflow.WorkFlowTestRunResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.MustGetUIDFromCtx(ctx)

	if err := checkUserSpace(ctx, uID, mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var appID, agentID *int64
	if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	exeCfg := workflowModel.ExecuteConfig{
		ID:           mustParseInt64(req.GetWorkflowID()),
		From:         workflowModel.FromDraft,
		CommitID:     req.GetCommitID(),
		Operator:     uID,
		Mode:         workflowModel.ExecuteModeDebug,
		AppID:        appID,
		AgentID:      agentID,
		ConnectorID:  consts.CozeConnectorID,
		ConnectorUID: strconv.FormatInt(uID, 10),
		TaskType:     workflowModel.TaskTypeForeground,
		SyncPattern:  workflowModel.SyncPatternAsync,
		BizType:      workflowModel.BizTypeWorkflow,
		Cancellable:  true,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	exeID, err := GetWorkflowDomainSVC().AsyncExecute(ctx, exeCfg, maps.ToAnyValue(req.Input))
	if err != nil {
		return nil, err
	}

	return &workflow.WorkFlowTestRunResponse{
		Data: &workflow.WorkFlowTestRunData{
			WorkflowID: req.WorkflowID,
			ExecuteID:  fmt.Sprintf("%d", exeID),
		},
	}, nil
}

func (w *ApplicationService) NodeDebug(ctx context.Context, req *workflow.WorkflowNodeDebugV2Request) (
	_ *workflow.WorkflowNodeDebugV2Response, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.MustGetUIDFromCtx(ctx)

	if err := checkUserSpace(ctx, uID, mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	// merge input, batch and setting, they are all the same when executing
	mergedInput := make(map[string]string, len(req.Input)+len(req.Batch)+len(req.Setting))
	for k, v := range req.Input {
		mergedInput[k] = v
	}
	for k, v := range req.Batch {
		mergedInput[k] = v
	}
	for k, v := range req.Setting {
		mergedInput[k] = v
	}

	var appID, agentID *int64
	if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	exeCfg := workflowModel.ExecuteConfig{
		ID:           mustParseInt64(req.GetWorkflowID()),
		From:         workflowModel.FromDraft,
		Operator:     uID,
		Mode:         workflowModel.ExecuteModeNodeDebug,
		AppID:        appID,
		AgentID:      agentID,
		ConnectorID:  consts.CozeConnectorID,
		ConnectorUID: strconv.FormatInt(uID, 10),
		TaskType:     workflowModel.TaskTypeForeground,
		SyncPattern:  workflowModel.SyncPatternAsync,
		BizType:      workflowModel.BizTypeWorkflow,
		Cancellable:  true,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	exeID, err := GetWorkflowDomainSVC().AsyncExecuteNode(ctx, req.NodeID, exeCfg, maps.ToAnyValue(mergedInput))
	if err != nil {
		return nil, err
	}

	return &workflow.WorkflowNodeDebugV2Response{
		Data: &workflow.WorkflowNodeDebugV2Data{
			WorkflowID: req.WorkflowID,
			NodeID:     req.NodeID,
			ExecuteID:  fmt.Sprintf("%d", exeID),
		},
	}, nil
}

func (w *ApplicationService) GetProcess(ctx context.Context, req *workflow.GetWorkflowProcessRequest) (
	_ *workflow.GetWorkflowProcessResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var wfExeEntity *entity.WorkflowExecution
	if req.SubExecuteID == nil {
		wfExeEntity = &entity.WorkflowExecution{
			ID:         mustParseInt64(req.GetExecuteID()),
			WorkflowID: mustParseInt64(req.GetWorkflowID()),
		}
	} else {
		wfExeEntity = &entity.WorkflowExecution{
			ID:              mustParseInt64(req.GetSubExecuteID()),
			WorkflowID:      mustParseInt64(req.GetWorkflowID()),
			RootExecutionID: mustParseInt64(req.GetExecuteID()),
		}
	}

	wfExeEntity, err = GetWorkflowDomainSVC().GetExecution(ctx, wfExeEntity, true)
	if err != nil {
		return nil, err
	}

	status := wfExeEntity.Status
	if status == entity.WorkflowInterrupted {
		status = entity.WorkflowRunning
	}

	resp := &workflow.GetWorkflowProcessResponse{
		Data: &workflow.GetWorkFlowProcessData{
			WorkFlowId:       fmt.Sprintf("%d", wfExeEntity.WorkflowID),
			ExecuteId:        fmt.Sprintf("%d", wfExeEntity.ID),
			ExecuteStatus:    workflow.WorkflowExeStatus(status),
			ExeHistoryStatus: workflow.WorkflowExeHistoryStatus_HasHistory,
			WorkflowExeCost:  fmt.Sprintf("%.3fs", wfExeEntity.Duration.Seconds()),
			Reason:           wfExeEntity.FailReason,
			LogID:            wfExeEntity.LogID,
			NodeEvents:       make([]*workflow.NodeEvent, 0),
		},
	}

	if wfExeEntity.TokenInfo != nil {
		resp.Data.TokenAndCost = &workflow.TokenAndCost{
			InputTokens:  ptr.Of(fmt.Sprintf("%d Tokens", wfExeEntity.TokenInfo.InputTokens)),
			OutputTokens: ptr.Of(fmt.Sprintf("%d Tokens", wfExeEntity.TokenInfo.OutputTokens)),
			TotalTokens:  ptr.Of(fmt.Sprintf("%d Tokens", wfExeEntity.TokenInfo.InputTokens+wfExeEntity.TokenInfo.OutputTokens)),
		}
	}

	if wfExeEntity.AppID != nil {
		resp.Data.ProjectId = fmt.Sprintf("%d", *wfExeEntity.AppID)
	}

	var (
		hasNodeErr   bool
		workflowFail = status == entity.WorkflowFailed
		endNodeExe   *workflow.NodeResult
	)

	batchNodeID2NodeResult := make(map[string]*workflow.NodeResult)
	batchNodeID2InnerNodeResult := make(map[string]*workflow.NodeResult)
	successNum := 0
	for _, nodeExe := range wfExeEntity.NodeExecutions {
		if nodeExe.Status == entity.NodeFailed && nodeExe.ErrorInfo != nil {
			hasNodeErr = true
		}

		nr, err := convertNodeExecution(nodeExe)
		if err != nil {
			return nil, err
		}

		if nodeExe.NodeType == entity.NodeTypeExit {
			endNodeExe = nr
		}

		if nodeExe.NodeType == entity.NodeTypeBatch {
			if inner, ok := batchNodeID2InnerNodeResult[nodeExe.NodeID]; ok {
				nr = mergeBatchModeNodes(inner, nr)
				delete(batchNodeID2InnerNodeResult, nodeExe.NodeID)
			} else {
				batchNodeID2NodeResult[nodeExe.NodeID] = nr
				continue
			}
		} else if len(nodeExe.IndexedExecutions) > 0 {
			if vo.IsGeneratedNodeForBatchMode(nodeExe.NodeID, *nodeExe.ParentNodeID) {
				parentNodeResult, ok := batchNodeID2NodeResult[*nodeExe.ParentNodeID]
				if ok {
					nr = mergeBatchModeNodes(parentNodeResult, nr)
					delete(batchNodeID2NodeResult, *nodeExe.ParentNodeID)
				} else {
					batchNodeID2InnerNodeResult[*nodeExe.ParentNodeID] = nr
					continue
				}
			}
		}

		if nr.NodeStatus == workflow.NodeExeStatus_Success {
			successNum++
		}

		resp.Data.NodeResults = append(resp.Data.NodeResults, nr)
	}

	if workflowFail && !hasNodeErr {
		var failReason string
		if wfExeEntity.FailReason != nil {
			failReason = *wfExeEntity.FailReason
			if endNodeExe != nil {
				endNodeExe.ErrorInfo = failReason
				endNodeExe.ErrorLevel = string(vo.LevelError)
			} else {
				if len(resp.Data.NodeResults) == 1 &&
					(resp.Data.NodeResults)[0].NodeType != workflow.NodeTemplateType_Start.String() {
					// this is single node debug
					resp.Data.NodeResults[0].ErrorInfo = failReason
					resp.Data.NodeResults[0].ErrorLevel = string(vo.LevelError)
				} else {
					endNodeExe = &workflow.NodeResult{
						NodeId:     entity.ExitNodeKey,
						NodeType:   workflow.NodeTemplateType_End.String(),
						NodeStatus: workflow.NodeExeStatus_Fail,
						ErrorInfo:  failReason,
						ErrorLevel: string(vo.LevelError),
					}
					resp.Data.NodeResults = append(resp.Data.NodeResults, endNodeExe)
				}
			}
		}
	}

	for id := range batchNodeID2NodeResult {
		nr := batchNodeID2NodeResult[id]
		if nr.NodeStatus == workflow.NodeExeStatus_Success {
			successNum++
		}
		resp.Data.NodeResults = append(resp.Data.NodeResults, nr)
	}

	if wfExeEntity.NodeCount > 0 {
		resp.Data.Rate = fmt.Sprintf("%.2f", float64(successNum)/float64(wfExeEntity.NodeCount))
	}

	for _, ie := range wfExeEntity.InterruptEvents {
		if ie.EventType == entity.InterruptEventLLM {
			ie = &entity.InterruptEvent{
				ID:            ie.ID,
				NodeKey:       ie.ToolInterruptEvent.NodeKey,
				NodeType:      ie.ToolInterruptEvent.NodeType,
				NodeTitle:     ie.ToolInterruptEvent.NodeTitle,
				NodeIcon:      ie.ToolInterruptEvent.NodeIcon,
				EventType:     ie.ToolInterruptEvent.EventType,
				InterruptData: ie.ToolInterruptEvent.InterruptData,
			}
		}

		iconURL := nodeIconURLCache[string(ie.NodeType)]

		resp.Data.NodeEvents = append(resp.Data.NodeEvents, &workflow.NodeEvent{
			ID:           strconv.FormatInt(ie.ID, 10),
			NodeID:       string(ie.NodeKey),
			NodeTitle:    ie.NodeTitle,
			NodeIcon:     iconURL,
			Data:         ie.InterruptData,
			Type:         ie.EventType,
			SchemaNodeID: string(ie.NodeKey),
		})
	}

	return resp, nil
}

func (w *ApplicationService) GetNodeExecuteHistory(ctx context.Context, req *workflow.GetNodeExecuteHistoryRequest) (
	_ *workflow.GetNodeExecuteHistoryResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	executeID := req.GetExecuteID()
	scene := req.GetNodeHistoryScene()

	if scene == workflow.NodeHistoryScene_TestRunInput {
		if len(executeID) > 0 {
			return nil, fmt.Errorf("when scene is test_run_input, execute_id should be empty")
		}

		nodeID := req.GetNodeID()
		if nodeID == "100001" {
			nodeExe, found, err := GetWorkflowDomainSVC().GetLatestTestRunInput(ctx, mustParseInt64(req.GetWorkflowID()),
				ptr.FromOrDefault(ctxutil.GetUIDFromCtx(ctx), 0))
			if err != nil {
				return nil, err
			}
			if !found {
				return &workflow.GetNodeExecuteHistoryResponse{
					Data: &workflow.NodeResult{},
				}, nil
			}

			result, err := convertNodeExecution(nodeExe)
			if err != nil {
				return nil, err
			}

			return &workflow.GetNodeExecuteHistoryResponse{
				Data: result,
			}, nil
		} else {
			nodeExe, innerExe, found, err := GetWorkflowDomainSVC().GetLatestNodeDebugInput(ctx, mustParseInt64(req.GetWorkflowID()), nodeID,
				ptr.FromOrDefault(ctxutil.GetUIDFromCtx(ctx), 0))
			if err != nil {
				return nil, err
			}
			if !found {
				return &workflow.GetNodeExecuteHistoryResponse{
					Data: &workflow.NodeResult{},
				}, nil
			}

			result, err := convertNodeExecution(nodeExe)
			if err != nil {
				return nil, err
			}

			if innerExe == nil {
				return &workflow.GetNodeExecuteHistoryResponse{
					Data: result,
				}, nil
			}

			inner, err := convertNodeExecution(innerExe)
			if err != nil {
				return nil, err
			}

			result = mergeBatchModeNodes(result, inner)
			return &workflow.GetNodeExecuteHistoryResponse{
				Data: result,
			}, nil
		}
	} else {
		if len(executeID) == 0 {
			return nil, fmt.Errorf("when scene is not test_run_input, execute_id should not be empty")
		}

		nodeExe, innerNodeExe, err := GetWorkflowDomainSVC().GetNodeExecution(ctx, mustParseInt64(executeID), req.GetNodeID())
		if err != nil {
			return nil, err
		}

		result, err := convertNodeExecution(nodeExe)
		if err != nil {
			return nil, err
		}

		if innerNodeExe != nil {
			inner, err := convertNodeExecution(innerNodeExe)
			if err != nil {
				return nil, err
			}

			result := mergeBatchModeNodes(result, inner)
			return &workflow.GetNodeExecuteHistoryResponse{
				Data: result,
			}, nil
		}

		return &workflow.GetNodeExecuteHistoryResponse{
			Data: result,
		}, nil
	}
}

func (w *ApplicationService) DeleteWorkflowsByAppID(ctx context.Context, appID int64) (err error) {
	return w.deleteWorkflowResource(ctx, &vo.DeletePolicy{
		AppID: ptr.Of(appID),
	})
}

func (w *ApplicationService) CheckWorkflowsExistByAppID(ctx context.Context, appID int64) (_ bool, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	wfs, _, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			AppID: &appID,
			Page: &vo.Page{
				Size: 1,
				Page: 0,
			},
		},
		QType:    workflowModel.FromDraft,
		MetaOnly: true,
	})

	return len(wfs) > 0, err
}

func (w *ApplicationService) CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, spaceID, appID int64) (
	_ int64, _ []*vo.ValidateIssue, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	ds, err := GetWorkflowDomainSVC().GetWorkflowDependenceResource(ctx, workflowID)
	if err != nil {
		return 0, nil, err
	}

	pluginMap := make(map[int64]*plugin.PluginEntity)
	pluginToolMap := make(map[int64]int64)

	if len(ds.PluginIDs) > 0 {
		for idx := range ds.PluginIDs {
			id := ds.PluginIDs[idx]
			response, err := appplugin.PluginApplicationSVC.CopyPlugin(ctx, &appplugin.CopyPluginRequest{
				PluginID:  id,
				UserID:    ctxutil.MustGetUIDFromCtx(ctx),
				CopyScene: pluginmodel.CopySceneOfToLibrary,
			})
			if err != nil {
				return 0, nil, err
			}
			pInfo := response.Plugin
			pluginMap[id] = &plugin.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			}
			for o, n := range response.Tools {
				pluginToolMap[o] = n.ID
			}

		}
	}

	relatedKnowledgeMap := make(map[int64]int64, len(ds.KnowledgeIDs))
	if len(ds.KnowledgeIDs) > 0 {
		taskUniqIDs, err := w.IDGenerator.GenMultiIDs(ctx, len(ds.KnowledgeIDs))
		if err != nil {
			return 0, nil, err
		}

		for idx := range ds.KnowledgeIDs {
			id := ds.KnowledgeIDs[idx]
			response, err := appknowledge.KnowledgeSVC.CopyKnowledge(ctx, &model.CopyKnowledgeRequest{
				KnowledgeID:   id,
				TargetSpaceID: spaceID,
				TargetUserID:  ctxutil.MustGetUIDFromCtx(ctx),
				TaskUniqKey:   strconv.FormatInt(taskUniqIDs[idx], 10),
			})
			if err != nil {
				return 0, nil, err
			}
			if response.CopyStatus == model.CopyStatus_Failed {
				return 0, nil, fmt.Errorf("failed to copy knowledge, knowledge id=%d", id)
			}
			relatedKnowledgeMap[id] = response.TargetKnowledgeID
		}
	}

	relatedDatabaseMap := make(map[int64]int64, len(ds.DatabaseIDs))
	if len(ds.DatabaseIDs) > 0 {
		response, err := appmemory.DatabaseApplicationSVC.CopyDatabase(ctx, &appmemory.CopyDatabaseRequest{
			DatabaseIDs: ds.DatabaseIDs,
			TableType:   table.TableType_OnlineTable,
			CreatorID:   ctxutil.MustGetUIDFromCtx(ctx),
		})
		if err != nil {
			return 0, nil, err
		}
		for oid, e := range response.Databases {
			relatedDatabaseMap[oid] = e.ID
		}

	}

	relatedWorkflows, vIssues, err := w.copyWorkflowFromAppToLibrary(ctx, workflowID, appID, vo.ExternalResourceRelated{
		PluginMap:     pluginMap,
		PluginToolMap: pluginToolMap,
		KnowledgeMap:  relatedKnowledgeMap,
		DatabaseMap:   relatedDatabaseMap,
	})
	if err != nil {
		return 0, nil, err
	}

	if len(vIssues) > 0 {
		return 0, vIssues, nil
	}

	copiedWf, ok := relatedWorkflows[workflowID]
	if !ok {
		return 0, nil, fmt.Errorf("failed to get copy workflow id, workflow id=%d", workflowID)
	}

	return copiedWf.ID, vIssues, nil
}

func (w *ApplicationService) copyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, appID int64, related vo.ExternalResourceRelated) (map[int64]entity.IDVersionPair, []*vo.ValidateIssue, error) {
	resp, err := GetWorkflowDomainSVC().CopyWorkflowFromAppToLibrary(ctx, workflowID, appID, related)
	if err != nil {
		return nil, nil, err
	}

	for index := range resp.CopiedWorkflows {
		wf := resp.CopiedWorkflows[index]

		err = PublishWorkflowResource(ctx, wf.ID, ptr.Of(int32(wf.Meta.Mode)), search.Created, &search.ResourceDocument{
			Name:    &wf.Name,
			SpaceID: &wf.SpaceID,
			OwnerID: &wf.CreatorID,

			PublishStatus: ptr.Of(resource.PublishStatus_UnPublished),
			CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
		})
		if err != nil {
			logs.CtxErrorf(ctx, "failed to publish workflow resource, workflow id=%d, err=%v", wf.ID, err)
			return nil, nil, err
		}
	}

	return resp.WorkflowIDVersionMap, resp.ValidateIssues, nil
}

type ExternalResource struct {
	PluginMap     map[int64]int64
	PluginToolMap map[int64]int64
	KnowledgeMap  map[int64]int64
	DatabaseMap   map[int64]int64
}

func (w *ApplicationService) DuplicateWorkflowsByAppID(ctx context.Context, sourceAppID, targetAppID int64, externalResource ExternalResource) (err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	pluginMap := make(map[int64]*plugin.PluginEntity)
	for o, n := range externalResource.PluginMap {
		pluginMap[o] = &plugin.PluginEntity{
			PluginID: n,
		}
	}
	externalResourceRelated := vo.ExternalResourceRelated{
		PluginMap:     pluginMap,
		PluginToolMap: externalResource.PluginToolMap,
		KnowledgeMap:  externalResource.KnowledgeMap,
		DatabaseMap:   externalResource.DatabaseMap,
	}

	copiedWorkflowArray, err := GetWorkflowDomainSVC().DuplicateWorkflowsByAppID(ctx, sourceAppID, targetAppID, externalResourceRelated)
	if err != nil {
		return err
	}

	logs.CtxInfof(ctx, "[DuplicateWorkflowsByAppID] %s", conv.DebugJsonToStr(copiedWorkflowArray))

	for index := range copiedWorkflowArray {
		wf := copiedWorkflowArray[index]
		err = PublishWorkflowResource(ctx, wf.ID, ptr.Of(int32(wf.Meta.Mode)), search.Created, &search.ResourceDocument{
			Name:          &wf.Name,
			SpaceID:       &wf.SpaceID,
			OwnerID:       &wf.CreatorID,
			APPID:         &targetAppID,
			PublishStatus: ptr.Of(resource.PublishStatus_UnPublished),
			CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
		})
		if err != nil {
			logs.CtxErrorf(ctx, "failed to publish workflow resource, workflow id=%d, err=%v", wf.ID, err)
		}
	}

	return nil
}

func (w *ApplicationService) CopyWorkflowFromLibraryToApp(ctx context.Context, workflowID int64, appID int64) (
	_ int64, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	wf, err := w.copyWorkflow(ctx, workflowID, vo.CopyWorkflowPolicy{
		TargetAppID: &appID,
	})
	if err != nil {
		return 0, err
	}

	return wf.ID, nil
}

func (w *ApplicationService) copyWorkflow(ctx context.Context, workflowID int64, policy vo.CopyWorkflowPolicy) (*entity.Workflow, error) {
	wf, err := GetWorkflowDomainSVC().CopyWorkflow(ctx, workflowID, policy)
	if err != nil {
		return nil, err
	}

	err = PublishWorkflowResource(ctx, wf.ID, ptr.Of(int32(wf.Meta.Mode)), search.Created, &search.ResourceDocument{
		Name:          &wf.Name,
		APPID:         wf.AppID,
		SpaceID:       &wf.SpaceID,
		OwnerID:       &wf.CreatorID,
		PublishStatus: ptr.Of(resource.PublishStatus_UnPublished),
		CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "public copy workflow event failed, workflowID=%d, err=%v", wf.ID, err)
		return nil, err
	}

	return wf, nil
}

func (w *ApplicationService) MoveWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, spaceID, /*not used for now*/
	appID int64) (_ int64, _ []*vo.ValidateIssue, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	ds, err := GetWorkflowDomainSVC().GetWorkflowDependenceResource(ctx, workflowID)
	if err != nil {
		return 0, nil, err
	}

	pluginMap := make(map[int64]*plugin.PluginEntity)
	if len(ds.PluginIDs) > 0 {
		for idx := range ds.PluginIDs {
			id := ds.PluginIDs[idx]
			pInfo, err := appplugin.PluginApplicationSVC.MoveAPPPluginToLibrary(ctx, id)
			if err != nil {
				return 0, nil, err
			}
			pluginMap[id] = &plugin.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			}

		}
	}

	if len(ds.KnowledgeIDs) > 0 {
		for idx := range ds.KnowledgeIDs {
			id := ds.KnowledgeIDs[idx]
			err := appknowledge.KnowledgeSVC.MoveKnowledgeToLibrary(ctx, &model.MoveKnowledgeToLibraryRequest{
				KnowledgeID: id,
			})
			if err != nil {
				return 0, nil, err
			}
		}
	}

	if len(ds.DatabaseIDs) > 0 {
		_, err = appmemory.DatabaseApplicationSVC.MoveDatabaseToLibrary(ctx, &appmemory.MoveDatabaseToLibraryRequest{
			DatabaseIDs: ds.DatabaseIDs,
		})
		if err != nil {
			return 0, nil, err
		}
	}

	relatedWorkflows, vIssues, err := w.copyWorkflowFromAppToLibrary(ctx, workflowID, appID, vo.ExternalResourceRelated{
		PluginMap: pluginMap,
	})
	if err != nil {
		return 0, nil, err
	}
	if len(vIssues) > 0 {
		return 0, vIssues, nil
	}

	err = GetWorkflowDomainSVC().SyncRelatedWorkflowResources(ctx, appID, relatedWorkflows, vo.ExternalResourceRelated{
		PluginMap: pluginMap,
	})
	if err != nil {
		return 0, nil, err
	}

	deleteWorkflowIDs := xmaps.Keys(relatedWorkflows)
	err = w.deleteWorkflowResource(ctx, &vo.DeletePolicy{
		IDs: deleteWorkflowIDs,
	})
	if err != nil {
		return 0, nil, err
	}
	copiedWf, ok := relatedWorkflows[workflowID]
	if !ok {
		return 0, nil, fmt.Errorf("failed to get copy workflow id, workflow id=%d", workflowID)
	}

	return copiedWf.ID, nil, nil
}

func convertNodeExecution(nodeExe *entity.NodeExecution) (*workflow.NodeResult, error) {
	nr := &workflow.NodeResult{
		NodeId:      nodeExe.NodeID,
		NodeName:    nodeExe.NodeName,
		NodeType:    entity.NodeMetaByNodeType(nodeExe.NodeType).GetDisplayKey(),
		NodeStatus:  workflow.NodeExeStatus(nodeExe.Status),
		ErrorInfo:   ptr.FromOrDefault(nodeExe.ErrorInfo, ""),
		Input:       ptr.FromOrDefault(nodeExe.Input, ""),
		Output:      ptr.FromOrDefault(nodeExe.Output, ""),
		NodeExeCost: fmt.Sprintf("%.3fs", nodeExe.Duration.Seconds()),
		RawOutput:   nodeExe.RawOutput,
		ErrorLevel:  ptr.FromOrDefault(nodeExe.ErrorLevel, ""),
	}

	if nodeExe.TokenInfo != nil {
		nr.TokenAndCost = &workflow.TokenAndCost{
			InputTokens:  ptr.Of(fmt.Sprintf("%d Tokens", nodeExe.TokenInfo.InputTokens)),
			OutputTokens: ptr.Of(fmt.Sprintf("%d Tokens", nodeExe.TokenInfo.OutputTokens)),
			TotalTokens:  ptr.Of(fmt.Sprintf("%d Tokens", nodeExe.TokenInfo.InputTokens+nodeExe.TokenInfo.OutputTokens)),
		}
	}

	if nodeExe.ParentNodeID != nil {
		nr.Index = ptr.Of(int32(nodeExe.Index))
		nr.Items = nodeExe.Items
	}

	if len(nodeExe.IndexedExecutions) > 0 {
		nr.IsBatch = ptr.Of(true)
		subResults := make([]*workflow.NodeResult, 0, len(nodeExe.IndexedExecutions))
		for _, subNodeExe := range nodeExe.IndexedExecutions {
			if subNodeExe == nil {
				subResults = append(subResults, nil)
				continue
			}
			subResult, err := convertNodeExecution(subNodeExe)
			if err != nil {
				return nil, err
			}
			subResults = append(subResults, subResult)
		}
		m, err := sonic.MarshalString(subResults)
		if err != nil {
			return nil, err
		}
		nr.Batch = ptr.Of(m)
	}

	if nodeExe.SubWorkflowExecution != nil {
		if nodeExe.Extra == nil {
			nodeExe.Extra = &entity.NodeExtra{}
		}
		nodeExe.Extra.SubExecuteID = nodeExe.SubWorkflowExecution.ID
		nr.SubExecuteId = ptr.Of(strconv.FormatInt(nodeExe.SubWorkflowExecution.ID, 10))
		nr.ExecuteId = ptr.Of(strconv.FormatInt(nodeExe.ExecuteID, 10))
	}

	if nodeExe.Extra != nil {
		m, err := sonic.MarshalString(nodeExe.Extra)
		if err != nil {
			return nil, err
		}
		nr.Extra = m
	}

	return nr, nil
}

func mergeBatchModeNodes(parent, inner *workflow.NodeResult) *workflow.NodeResult {
	merged := &workflow.NodeResult{
		NodeId:       parent.NodeId,
		NodeType:     inner.NodeType,
		NodeName:     parent.NodeName,
		NodeStatus:   parent.NodeStatus,
		ErrorInfo:    parent.ErrorInfo,
		Input:        parent.Input,
		Output:       parent.Output,
		NodeExeCost:  parent.NodeExeCost,
		TokenAndCost: parent.TokenAndCost,
		RawOutput:    parent.RawOutput,
		ErrorLevel:   parent.ErrorLevel,
		Batch:        inner.Batch,
		IsBatch:      inner.IsBatch,
		Extra:        inner.Extra,
		ExecuteId:    parent.ExecuteId,
		SubExecuteId: parent.SubExecuteId,
		NeedAsync:    parent.NeedAsync,
	}

	return merged
}

type StreamRunEventType string

const (
	DoneEvent      StreamRunEventType = "Done"
	MessageEvent   StreamRunEventType = "Message"
	ErrEvent       StreamRunEventType = "Error"
	InterruptEvent StreamRunEventType = "Interrupt"
)

func convertStreamRunEvent(workflowID int64) func(msg *entity.Message) (res *workflow.OpenAPIStreamRunFlowResponse, err error) {
	var (
		messageID  int
		executeID  int64
		spaceID    int64
		nodeID2Seq = make(map[string]int)
	)

	return func(msg *entity.Message) (res *workflow.OpenAPIStreamRunFlowResponse, err error) {
		defer func() {
			if err == nil {
				messageID++
			}
		}()

		if msg.StateMessage != nil {
			// stream run will skip all messages from workflow tools
			if executeID > 0 && executeID != msg.StateMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}

			switch msg.StateMessage.Status {
			case entity.WorkflowSuccess:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:       strconv.Itoa(messageID),
					Event:    string(DoneEvent),
					DebugUrl: ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, executeID, spaceID, workflowID)),
				}, nil
			case entity.WorkflowFailed, entity.WorkflowCancel:
				var wfe vo.WorkflowError
				if !errors.As(msg.StateMessage.LastError, &wfe) {
					panic("stream run last error is not a WorkflowError")
				}
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:           strconv.Itoa(messageID),
					Event:        string(ErrEvent),
					DebugUrl:     ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, executeID, spaceID, workflowID)),
					ErrorCode:    ptr.Of(int64(wfe.Code())),
					ErrorMessage: ptr.Of(wfe.Msg()),
				}, nil
			case entity.WorkflowInterrupted:
				if msg.InterruptEvent.ToolInterruptEvent == nil {
					return &workflow.OpenAPIStreamRunFlowResponse{
						ID:       strconv.Itoa(messageID),
						Event:    string(InterruptEvent),
						DebugUrl: ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, executeID, spaceID, workflowID)),
						InterruptData: &workflow.Interrupt{
							EventID: fmt.Sprintf("%d/%d", executeID, msg.InterruptEvent.ID),
							Type:    workflow.InterruptType(msg.InterruptEvent.EventType),
							InData:  msg.InterruptEvent.InterruptData,
						},
					}, nil
				}

				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:       strconv.Itoa(messageID),
					Event:    string(InterruptEvent),
					DebugUrl: ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, executeID, spaceID, workflowID)),
					InterruptData: &workflow.Interrupt{
						EventID: fmt.Sprintf("%d/%d", executeID, msg.InterruptEvent.ID),
						Type:    workflow.InterruptType(msg.InterruptEvent.ToolInterruptEvent.EventType),
						InData:  msg.InterruptEvent.ToolInterruptEvent.InterruptData,
					},
				}, nil
			case entity.WorkflowRunning:
				executeID = msg.StateMessage.ExecuteID
				spaceID = msg.SpaceID
				return nil, schema.ErrNoValue
			default:
				return nil, schema.ErrNoValue
			}
		}

		if msg.DataMessage != nil {
			if msg.Type != entity.Answer {
				// stream run api do not emit FunctionCall or ToolResponse
				return nil, schema.ErrNoValue
			}

			// stream run will skip all messages from workflow tools
			if executeID > 0 && executeID != msg.DataMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}

			res = &workflow.OpenAPIStreamRunFlowResponse{
				ID:           strconv.Itoa(messageID),
				Event:        string(MessageEvent),
				NodeTitle:    ptr.Of(msg.NodeTitle),
				Content:      ptr.Of(msg.Content),
				ContentType:  ptr.Of("text"),
				NodeIsFinish: ptr.Of(msg.Last),
				NodeType:     ptr.Of(entity.NodeMetaByNodeType(msg.NodeType).GetDisplayKey()),
				NodeID:       ptr.Of(msg.NodeID),
			}

			if msg.DataMessage.Usage != nil {
				token := msg.DataMessage.Usage.InputTokens + msg.DataMessage.Usage.OutputTokens
				res.Token = ptr.Of(token)
			}

			seq, ok := nodeID2Seq[msg.NodeID]
			if !ok {
				seq = 0
				nodeID2Seq[msg.NodeID] = 0
			}

			res.NodeSeqID = ptr.Of(strconv.Itoa(seq))
			nodeID2Seq[msg.NodeID]++
		}

		return res, nil
	}
}

func (w *ApplicationService) OpenAPIStreamRun(ctx context.Context, req *workflow.OpenAPIRunFlowRequest) (
	_ *schema.StreamReader[*workflow.OpenAPIStreamRunFlowResponse], err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	parameters := make(map[string]any)
	if req.Parameters != nil {
		err := sonic.UnmarshalString(*req.Parameters, &parameters)
		if err != nil {
			return nil, vo.WrapError(errno.ErrInvalidParameter, err)
		}
	}

	meta, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}

	if meta.LatestPublishedVersion == nil {
		return nil, vo.NewError(errno.ErrWorkflowNotPublished)
	}

	if err = checkUserSpace(ctx, userID, meta.SpaceID); err != nil {
		return nil, err
	}

	var appID, agentID *int64
	if req.IsSetAppID() {
		appID = ptr.Of(mustParseInt64(req.GetAppID()))
	} else if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	var connectorID int64
	if req.IsSetConnectorID() {
		connectorID = mustParseInt64(req.GetConnectorID())
	}

	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	exeCfg := workflowModel.ExecuteConfig{
		ID:            meta.ID,
		From:          workflowModel.FromSpecificVersion,
		Version:       *meta.LatestPublishedVersion,
		Operator:      userID,
		Mode:          workflowModel.ExecuteModeRelease,
		AppID:         appID,
		AgentID:       agentID,
		ConnectorID:   connectorID,
		ConnectorUID:  strconv.FormatInt(userID, 10),
		TaskType:      workflowModel.TaskTypeForeground,
		SyncPattern:   workflowModel.SyncPatternStream,
		InputFailFast: true,
		BizType:       workflowModel.BizTypeWorkflow,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	sr, err := GetWorkflowDomainSVC().StreamExecute(ctx, exeCfg, parameters)
	if err != nil {
		return nil, err
	}

	convert := convertStreamRunEvent(meta.ID)

	return schema.StreamReaderWithConvert(sr, convert), nil
}

func (w *ApplicationService) OpenAPIStreamResume(ctx context.Context, req *workflow.OpenAPIStreamResumeFlowRequest) (
	_ *schema.StreamReader[*workflow.OpenAPIStreamRunFlowResponse], err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	idStr := req.EventID
	idSegments := strings.Split(idStr, "/")
	if len(idSegments) != 2 {
		return nil, fmt.Errorf("invalid event id when stream resume: %s", idStr)
	}

	executeID, err := strconv.ParseInt(idSegments[0], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse executeID from eventID segment %s: %w", idSegments[0], err)
	}
	eventID, err := strconv.ParseInt(idSegments[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse eventID from eventID segment %s: %w", idSegments[1], err)
	}

	workflowID := mustParseInt64(req.WorkflowID)

	resumeReq := &entity.ResumeRequest{
		ExecuteID:  executeID,
		EventID:    eventID,
		ResumeData: req.ResumeData,
	}

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	var connectorID int64
	if req.IsSetConnectorID() {
		connectorID = mustParseInt64(req.GetConnectorID())
	}

	sr, err := GetWorkflowDomainSVC().StreamResume(ctx, resumeReq, workflowModel.ExecuteConfig{
		Operator:     userID,
		Mode:         workflowModel.ExecuteModeRelease,
		ConnectorID:  connectorID,
		ConnectorUID: strconv.FormatInt(userID, 10),
		BizType:      workflowModel.BizTypeWorkflow,
	})
	if err != nil {
		return nil, err
	}

	convert := convertStreamRunEvent(workflowID)

	return schema.StreamReaderWithConvert(sr, convert), nil
}

func (w *ApplicationService) OpenAPIRun(ctx context.Context, req *workflow.OpenAPIRunFlowRequest) (
	_ *workflow.OpenAPIRunFlowResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	parameters := make(map[string]any)
	if req.Parameters != nil {
		err := sonic.UnmarshalString(*req.Parameters, &parameters)
		if err != nil {
			return nil, vo.WrapError(errno.ErrInvalidParameter, err)
		}
	}

	meta, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}

	if meta.LatestPublishedVersion == nil {
		return nil, vo.NewError(errno.ErrWorkflowNotPublished)
	}

	if err = checkUserSpace(ctx, userID, meta.SpaceID); err != nil {
		return nil, err
	}

	var appID, agentID *int64
	if req.IsSetAppID() {
		appID = ptr.Of(mustParseInt64(req.GetAppID()))
	} else if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	var connectorID int64
	if req.IsSetConnectorID() {
		connectorID = mustParseInt64(req.GetConnectorID())
	}

	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	exeCfg := workflowModel.ExecuteConfig{
		ID:            meta.ID,
		From:          workflowModel.FromSpecificVersion,
		Version:       *meta.LatestPublishedVersion,
		Operator:      userID,
		Mode:          workflowModel.ExecuteModeRelease,
		AppID:         appID,
		AgentID:       agentID,
		ConnectorID:   connectorID,
		ConnectorUID:  strconv.FormatInt(userID, 10),
		InputFailFast: true,
		BizType:       workflowModel.BizTypeWorkflow,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	if req.GetIsAsync() {
		exeCfg.SyncPattern = workflowModel.SyncPatternAsync
		exeCfg.TaskType = workflowModel.TaskTypeBackground
		exeID, err := GetWorkflowDomainSVC().AsyncExecute(ctx, exeCfg, parameters)
		if err != nil {
			return nil, err
		}

		return &workflow.OpenAPIRunFlowResponse{
			ExecuteID: ptr.Of(strconv.FormatInt(exeID, 10)),
			DebugUrl:  ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, exeID, meta.SpaceID, meta.ID)),
		}, nil
	}

	exeCfg.SyncPattern = workflowModel.SyncPatternSync
	exeCfg.TaskType = workflowModel.TaskTypeForeground
	wfExe, tPlan, err := GetWorkflowDomainSVC().SyncExecute(ctx, exeCfg, parameters)
	if err != nil {
		return nil, err
	}

	if wfExe.Status == entity.WorkflowInterrupted {
		return nil, vo.NewError(errno.ErrInterruptNotSupported)
	}

	var data *string
	if tPlan == vo.ReturnVariables {
		data = wfExe.Output
	} else {
		answerOutput := map[string]any{
			"content_type":   1,
			"data":           *wfExe.Output,
			"type_for_model": 2,
		}

		answerOutputStr, err := sonic.MarshalString(answerOutput)
		if err != nil {
			return nil, err
		}

		data = ptr.Of(answerOutputStr)
	}

	return &workflow.OpenAPIRunFlowResponse{
		Data:      data,
		ExecuteID: ptr.Of(strconv.FormatInt(wfExe.ID, 10)),
		DebugUrl:  ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, wfExe.ID, wfExe.SpaceID, meta.ID)),
		Token:     ptr.Of(wfExe.TokenInfo.InputTokens + wfExe.TokenInfo.OutputTokens),
		Cost:      ptr.Of("0.00000"),
	}, nil
}

func (w *ApplicationService) OpenAPIGetWorkflowRunHistory(ctx context.Context, req *workflow.GetWorkflowRunHistoryRequest) (
	_ *workflow.GetWorkflowRunHistoryResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	exe, err := GetWorkflowDomainSVC().GetExecution(ctx, &entity.WorkflowExecution{
		ID: mustParseInt64(req.GetExecuteID()),
	}, false)
	if err != nil {
		return nil, err
	}

	if err = checkUserSpace(ctx, userID, exe.SpaceID); err != nil {
		return nil, err
	}

	var updateTime *int64
	if exe.UpdatedAt != nil {
		updateTime = ptr.Of(exe.UpdatedAt.Unix())
	}

	var runMode *workflow.WorkflowRunMode
	switch exe.SyncPattern {
	case workflowModel.SyncPatternSync:
		runMode = ptr.Of(workflow.WorkflowRunMode_Sync)
	case workflowModel.SyncPatternAsync:
		runMode = ptr.Of(workflow.WorkflowRunMode_Async)
	case workflowModel.SyncPatternStream:
		runMode = ptr.Of(workflow.WorkflowRunMode_Stream)
	default:
	}

	res := &workflow.GetWorkflowRunHistoryResponse{
		Data: []*workflow.WorkflowExecuteHistory{
			{
				ExecuteID:     ptr.Of(exe.ID),
				ExecuteStatus: ptr.Of(workflow.WorkflowExeStatus(exe.Status).String()),
				BotID:         exe.AgentID,
				ConnectorID:   ptr.Of(exe.ConnectorID),
				ConnectorUID:  ptr.Of(exe.ConnectorUID),
				RunMode:       runMode,
				LogID:         ptr.Of(exe.LogID),
				CreateTime:    ptr.Of(exe.CreatedAt.Unix()),
				UpdateTime:    updateTime,
				DebugUrl:      ptr.Of(fmt.Sprintf(workflowModel.DebugURLTpl, exe.ID, exe.SpaceID, exe.WorkflowID)),
				Input:         exe.Input,
				Output:        exe.Output,
				Token:         ptr.Of(exe.TokenInfo.InputTokens + exe.TokenInfo.OutputTokens),
				Cost:          ptr.Of("0.00000"),
				ErrorCode:     exe.ErrorCode,
				ErrorMsg:      exe.FailReason,
			},
		},
	}

	return res, nil
}

func (w *ApplicationService) ValidateTree(ctx context.Context, req *workflow.ValidateTreeRequest) (
	_ *workflow.ValidateTreeResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	canvasSchema := req.GetSchema()
	if len(canvasSchema) == 0 {
		return nil, errors.New("validate tree schema is required")
	}
	response := &workflow.ValidateTreeResponse{}

	validateTreeCfg := vo.ValidateTreeConfig{
		CanvasSchema: canvasSchema,
	}
	if req.GetBindProjectID() != "" {
		pId, err := strconv.ParseInt(req.GetBindProjectID(), 10, 64)
		if err != nil {
			return nil, err
		}
		validateTreeCfg.AppID = ptr.Of(pId)
	}

	wfValidateInfos, err := GetWorkflowDomainSVC().ValidateTree(ctx, mustParseInt64(req.GetWorkflowID()), validateTreeCfg)
	if err != nil {
		return nil, err
	}
	response.Data = wfValidateInfos

	return response, nil
}

func (w *ApplicationService) GetWorkflowReferences(ctx context.Context, req *workflow.GetWorkflowReferencesRequest) (
	_ *workflow.GetWorkflowReferencesResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if req.GetSpaceID() != strconv.FormatInt(consts.TemplateSpaceID, 10) {
		if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
			return nil, err
		}
	}
	workflows, err := GetWorkflowDomainSVC().GetWorkflowReference(ctx, mustParseInt64(req.GetWorkflowID()))
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkflowReferencesResponse{}
	response.Data = &workflow.WorkflowReferencesData{
		WorkflowList: make([]*workflow.Workflow, 0, len(workflows)),
	}
	for id, wk := range workflows {
		wfw := &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(id, 10),
			Name:             wk.Name,
			Desc:             wk.Desc,
			URL:              wk.IconURL,
			IconURI:          wk.IconURI,
			Status:           workflow.WorkFlowDevStatus_HadSubmit,
			CreateTime:       wk.CreatedAt.Unix(),
			Tag:              wk.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(wk.AuthorID, 10)),
			SpaceID:          ptr.Of(strconv.FormatInt(wk.SpaceID, 10)),
			Creator: &workflow.Creator{
				ID: strconv.FormatInt(wk.CreatorID, 10),
			},
			FlowMode: wk.Mode,
		}

		if wk.UpdatedAt != nil {
			wfw.UpdateTime = wk.UpdatedAt.Unix()
		}

		if wk.AppID != nil {
			wfw.ProjectID = ptr.Of(strconv.FormatInt(ptr.From(wk.AppID), 10))
		}

		response.Data.WorkflowList = append(response.Data.WorkflowList, wfw)
	}

	return response, nil
}

func (w *ApplicationService) TestResume(ctx context.Context, req *workflow.WorkflowTestResumeRequest) (
	_ *workflow.WorkflowTestResumeResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	resumeReq := &entity.ResumeRequest{
		ExecuteID:  mustParseInt64(req.GetExecuteID()),
		EventID:    mustParseInt64(req.GetEventID()),
		ResumeData: req.GetData(),
	}
	err = GetWorkflowDomainSVC().AsyncResume(ctx, resumeReq, workflowModel.ExecuteConfig{
		Operator:    ptr.FromOrDefault(ctxutil.GetUIDFromCtx(ctx), 0),
		Mode:        workflowModel.ExecuteModeDebug, // at this stage it could be debug or node debug, we will decide it within AsyncResume
		BizType:     workflowModel.BizTypeWorkflow,
		Cancellable: true,
	})
	if err != nil {
		return nil, err
	}

	return &workflow.WorkflowTestResumeResponse{}, nil
}

func (w *ApplicationService) Cancel(ctx context.Context, req *workflow.CancelWorkFlowRequest) (
	_ *workflow.CancelWorkFlowResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowExecuteFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	err = GetWorkflowDomainSVC().Cancel(ctx, mustParseInt64(req.GetExecuteID()),
		mustParseInt64(req.GetWorkflowID()), mustParseInt64(req.GetSpaceID()))
	if err != nil {
		return nil, err
	}

	return &workflow.CancelWorkFlowResponse{}, nil
}

func (w *ApplicationService) QueryWorkflowNodeTypes(ctx context.Context, req *workflow.QueryWorkflowNodeTypeRequest) (
	_ *workflow.QueryWorkflowNodeTypeResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	nodeProperties, err := GetWorkflowDomainSVC().QueryNodeProperties(ctx, mustParseInt64(req.GetWorkflowID()))
	if err != nil {
		return nil, err
	}

	response := &workflow.QueryWorkflowNodeTypeResponse{
		Data: &workflow.WorkflowNodeTypeData{
			NodeTypes:                  make([]string, 0),
			SubWorkflowNodeTypes:       make([]string, 0),
			NodesProperties:            make([]*workflow.NodeProps, 0),
			SubWorkflowNodesProperties: make([]*workflow.NodeProps, 0),
		},
	}
	var combineNodesTypes func(props map[string]*vo.NodeProperty, deep int) error

	deepestSubWorkflowNodeTypes := make([]string, 0)

	combineNodesTypes = func(m map[string]*vo.NodeProperty, deep int) error {
		deepestSubWorkflowNodeTypes = make([]string, 0)
		for id, nodeProp := range m {
			if deep == 0 {
				response.Data.NodesProperties = append(response.Data.NodesProperties, &workflow.NodeProps{
					ID:                  id,
					Type:                nodeProp.Type,
					IsEnableChatHistory: nodeProp.IsEnableChatHistory,
					IsEnableUserQuery:   nodeProp.IsEnableUserQuery,
					IsRefGlobalVariable: nodeProp.IsRefGlobalVariable,
				})

				response.Data.NodeTypes = append(response.Data.NodeTypes, nodeProp.Type)
			} else {
				response.Data.SubWorkflowNodesProperties = append(response.Data.SubWorkflowNodesProperties, &workflow.NodeProps{
					ID:                  id,
					Type:                nodeProp.Type,
					IsEnableChatHistory: nodeProp.IsEnableChatHistory,
					IsEnableUserQuery:   nodeProp.IsEnableUserQuery,
					IsRefGlobalVariable: nodeProp.IsRefGlobalVariable,
				})
				deepestSubWorkflowNodeTypes = append(deepestSubWorkflowNodeTypes, nodeProp.Type)

			}
			if len(nodeProp.SubWorkflow) > 0 {
				err := combineNodesTypes(nodeProp.SubWorkflow, deep+1)
				if err != nil {
					return err
				}
			}
		}
		response.Data.SubWorkflowNodeTypes = slices.Unique(deepestSubWorkflowNodeTypes)
		return nil
	}
	response.Data.NodeTypes = slices.Unique(response.Data.NodeTypes)

	err = combineNodesTypes(nodeProperties, 0)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (w *ApplicationService) PublishWorkflow(ctx context.Context, req *workflow.PublishWorkflowRequest) (
	_ *workflow.PublishWorkflowResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	if err := checkUserSpace(ctx, userID, mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	info := &vo.PublishPolicy{
		ID:                 mustParseInt64(req.GetWorkflowID()),
		Version:            req.GetWorkflowVersion(),
		VersionDescription: req.GetVersionDescription(),
		CreatorID:          userID,
		CommitID:           req.GetCommitID(),
		Force:              req.GetForce(),
	}

	err = w.publishWorkflowResource(ctx, info)
	if err != nil {
		return nil, err
	}

	return &workflow.PublishWorkflowResponse{
		Data: &workflow.PublishWorkflowData{
			WorkflowID: req.GetWorkflowID(),
			Success:    true,
		},
	}, nil
}

func (w *ApplicationService) ListWorkflow(ctx context.Context, req *workflow.GetWorkFlowListRequest) (
	_ *workflow.GetWorkFlowListResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if req.GetSpaceID() == "" {
		return nil, errors.New("space id is required")
	}

	if req.GetPage() <= 0 || req.GetSize() <= 0 || req.GetSize() > 100 {
		return nil, fmt.Errorf("the number of page or size must be greater than 0, and the size must be greater than 0 and less than 100")
	}

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	page := &vo.Page{
		Page: req.GetPage(),
		Size: req.GetSize(),
	}

	option := vo.MetaQuery{
		Page:            page,
		NeedTotalNumber: true,
	}

	if req.ProjectID != nil {
		option.AppID = ptr.Of(mustParseInt64(*req.ProjectID))
	} else {
		option.LibOnly = true
	}

	status := req.GetStatus()
	var qType workflowModel.Locator
	if status == workflow.WorkFlowListStatus_UnPublished {
		option.PublishStatus = ptr.Of(vo.UnPublished)
		qType = workflowModel.FromDraft
	} else if status == workflow.WorkFlowListStatus_HadPublished {
		option.PublishStatus = ptr.Of(vo.HasPublished)
		qType = workflowModel.FromLatestVersion
	}

	if len(req.GetName()) > 0 {
		option.Name = req.Name
	}

	if len(req.GetWorkflowIds()) > 0 {
		ids, err := slices.TransformWithErrorCheck[string, int64](req.GetWorkflowIds(), func(s string) (int64, error) {
			return strconv.ParseInt(s, 10, 64)
		})
		if err != nil {
			return nil, err
		}
		option.IDs = ids
	}

	if req.IsSetFlowMode() && req.GetFlowMode() != workflow.WorkflowMode_All {
		option.Mode = ptr.Of(workflowModel.WorkflowMode(req.GetFlowMode()))
	}

	spaceID, err := strconv.ParseInt(req.GetSpaceID(), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("space id is invalid, parse to int64 failed, err: %w", err)
	}
	option.SpaceID = ptr.Of(spaceID)
	option.DescByUpdate = true

	wfs, total, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: option,
		QType:     qType,
		MetaOnly:  false,
	})
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkFlowListResponse{
		Data: &workflow.WorkFlowListData{
			AuthList:     make([]*workflow.ResourceAuthInfo, 0),
			WorkflowList: make([]*workflow.Workflow, 0, len(wfs)),
		},
	}

	wf2CreatorID := make(map[int64]string)
	workflowList := make([]*workflow.Workflow, 0, len(wfs))
	for _, w := range wfs {
		wf2CreatorID[w.ID] = strconv.FormatInt(w.CreatorID, 10)
		ww := &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(w.ID, 10),
			Name:             w.Name,
			Desc:             w.Desc,
			IconURI:          w.IconURI,
			URL:              w.IconURL,
			CreateTime:       w.CreatedAt.Unix(),
			Type:             w.ContentType,
			SchemaType:       workflow.SchemaType_FDL,
			Tag:              w.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(w.AuthorID, 10)),
			SpaceID:          ptr.Of(strconv.FormatInt(w.SpaceID, 10)),
			PluginID: func() string {
				if status == workflow.WorkFlowListStatus_UnPublished {
					return "0"
				}
				return strconv.FormatInt(w.ID, 10)
			}(),
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(w.CreatorID, 10),
				Self: ternary.IFElse[bool](w.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
		}

		if len(req.Checker) > 0 && status == workflow.WorkFlowListStatus_HadPublished {
			ww.CheckResult, err = GetWorkflowDomainSVC().WorkflowSchemaCheck(ctx, w, req.Checker)
			if err != nil {
				return nil, err
			}
		}

		if qType == workflowModel.FromDraft {
			ww.UpdateTime = w.DraftMeta.Timestamp.Unix()
		} else if qType == workflowModel.FromLatestVersion || qType == workflowModel.FromSpecificVersion {
			ww.UpdateTime = w.VersionMeta.VersionCreatedAt.Unix()
		} else if w.UpdatedAt != nil {
			ww.UpdateTime = w.UpdatedAt.Unix()
		}

		startNode := &workflow.Node{
			NodeID:    "100001",
			NodeName:  "start-node",
			NodeParam: &workflow.NodeParam{InputParameters: make([]*workflow.Parameter, 0)},
		}

		for _, in := range w.InputParams {
			param, err := toWorkflowParameter(in)
			if err != nil {
				return nil, err
			}
			startNode.NodeParam.InputParameters = append(startNode.NodeParam.InputParameters, param)
		}

		ww.StartNode = startNode

		auth := &workflow.ResourceAuthInfo{
			WorkflowID: strconv.FormatInt(w.ID, 10),
			UserID:     strconv.FormatInt(w.CreatorID, 10),
			Auth:       &workflow.ResourceActionAuth{CanEdit: true, CanDelete: true, CanCopy: true},
		}
		workflowList = append(workflowList, ww)
		response.Data.AuthList = append(response.Data.AuthList, auth)
	}

	userBasicInfoResponse, err := user.UserApplicationSVC.MGetUserBasicInfo(ctx, &playground.MGetUserBasicInfoRequest{UserIds: slices.Unique(xmaps.Values(wf2CreatorID))})
	if err != nil {
		return nil, err
	}

	for _, w := range workflowList {
		if u, ok := userBasicInfoResponse.UserBasicInfoMap[w.Creator.ID]; ok {
			w.Creator.Name = u.Username
			w.Creator.AvatarURL = u.UserAvatar
		}
	}

	response.Data.WorkflowList = workflowList
	response.Data.Total = total

	return response, nil
}

func (w *ApplicationService) GetWorkflowDetail(ctx context.Context, req *workflow.GetWorkflowDetailRequest) (
	_ *vo.WorkflowDetailDataList, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	ids, err := slices.TransformWithErrorCheck(req.GetWorkflowIds(), func(s string) (int64, error) {
		wid, err := strconv.ParseInt(s, 10, 64)
		if err != nil {
			return 0, err
		}
		return wid, nil
	})
	if err != nil {
		return nil, err
	}

	if len(ids) == 0 {
		return &vo.WorkflowDetailDataList{}, nil
	}

	wfs, _, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			IDs: ids,
		},
		QType:    workflowModel.FromDraft,
		MetaOnly: false,
	})
	if err != nil {
		return nil, err
	}

	workflowDetailDataList := &vo.WorkflowDetailDataList{
		List: make([]*workflow.WorkflowDetailData, 0, len(wfs)),
	}
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wf := range wfs {
		wfIDStr := strconv.FormatInt(wf.ID, 10)
		wd := &workflow.WorkflowDetailData{
			WorkflowID: wfIDStr,
			Name:       wf.Name,
			Desc:       wf.Desc,
			SpaceID:    strconv.FormatInt(wf.SpaceID, 10),
			CreateTime: wf.CreatedAt.Unix(),
			IconURI:    wf.IconURI,
			Icon:       wf.IconURL,
			FlowMode:   wf.Mode,
		}

		cv := &vo.Canvas{}
		err = sonic.UnmarshalString(wf.Canvas, cv)
		if err != nil {
			return nil, err
		}

		wd.EndType, err = parseWorkflowTerminatePlanType(cv)
		if err != nil {
			return nil, err
		}

		if wf.AppID != nil {
			wd.ProjectID = strconv.FormatInt(*wf.AppID, 10)
		}

		if wf.UpdatedAt != nil {
			wd.UpdateTime = wf.UpdatedAt.Unix()
		}
		inputs[wfIDStr], err = toVariables(wf.InputParams)
		if err != nil {
			return nil, err
		}
		outputs[wfIDStr], err = toVariables(wf.OutputParams)
		if err != nil {
			return nil, err
		}
		workflowDetailDataList.List = append(workflowDetailDataList.List, wd)
	}

	workflowDetailDataList.Inputs = inputs
	workflowDetailDataList.Outputs = outputs

	return workflowDetailDataList, nil
}

func (w *ApplicationService) GetWorkflowDetailInfo(ctx context.Context, req *workflow.GetWorkflowDetailInfoRequest) (
	_ *vo.WorkflowDetailInfoDataList, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var (
		draftIDs   []int64
		versionIDs []int64
		id2Version = make(map[int64]string)
	)

	for _, wf := range req.GetWorkflowFilterList() {
		id, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
		if err != nil {
			return nil, err
		}
		if wf.WorkflowVersion == nil || len(*wf.WorkflowVersion) == 0 {
			draftIDs = append(draftIDs, id)
		} else {
			versionIDs = append(versionIDs, id)
			id2Version[id] = *wf.WorkflowVersion
		}
	}

	if len(draftIDs)+len(versionIDs) == 0 {
		return &vo.WorkflowDetailInfoDataList{}, nil
	}

	var wfs []*entity.Workflow
	if len(draftIDs) > 0 {
		wfs, _, err = GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs: draftIDs,
			},
			QType:    workflowModel.FromDraft,
			MetaOnly: false,
		})
		if err != nil {
			return nil, err
		}
	}

	if len(versionIDs) > 0 {
		versionWfs, _, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs: versionIDs,
			},
			QType:    workflowModel.FromSpecificVersion,
			MetaOnly: false,
			Versions: id2Version,
		})
		if err != nil {
			return nil, err
		}
		wfs = append(wfs, versionWfs...)
	}

	workflowDetailInfoDataList := &vo.WorkflowDetailInfoDataList{
		List: make([]*workflow.WorkflowDetailInfoData, 0, len(wfs)),
	}
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wf := range wfs {
		wfIDStr := strconv.FormatInt(wf.ID, 10)
		wd := &workflow.WorkflowDetailInfoData{
			WorkflowID: wfIDStr,
			Name:       wf.Name,
			Desc:       wf.Desc,
			SpaceID:    strconv.FormatInt(wf.SpaceID, 10),
			CreateTime: wf.CreatedAt.Unix(),
			IconURI:    wf.IconURI,
			Icon:       wf.IconURL,
			FlowMode:   wf.Mode,
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},

			LatestFlowVersion: wf.GetLatestVersion(),
		}

		if wf.VersionMeta != nil {
			wd.FlowVersion = wf.Version
			wd.FlowVersionDesc = wf.VersionDescription
		}

		cv := &vo.Canvas{}
		err = sonic.UnmarshalString(wf.Canvas, cv)
		if err != nil {
			return nil, err
		}

		wd.EndType, err = parseWorkflowTerminatePlanType(cv)
		if err != nil {
			return nil, err
		}

		if wf.DraftMeta != nil {
			wd.UpdateTime = wf.DraftMeta.Timestamp.Unix()
		} else if wf.VersionMeta != nil {
			wd.UpdateTime = wf.VersionMeta.VersionCreatedAt.Unix()
		} else if wf.UpdatedAt != nil {
			wd.UpdateTime = wf.UpdatedAt.Unix()
		}

		if wf.AppID != nil {
			wd.ProjectID = strconv.FormatInt(*wf.AppID, 10)
		}

		inputs[wfIDStr], err = toVariables(wf.InputParams)
		if err != nil {
			return nil, err
		}

		if wd.EndType == 1 {
			outputs[wfIDStr] = []*vo.Variable{
				{
					Name: "output",
					Type: vo.VariableTypeString,
				},
			}
		} else {
			outputs[wfIDStr], err = toVariables(wf.OutputParams)
			if err != nil {
				return nil, err
			}
		}
		workflowDetailInfoDataList.List = append(workflowDetailInfoDataList.List, wd)
	}
	workflowDetailInfoDataList.Inputs = inputs
	workflowDetailInfoDataList.Outputs = outputs
	return workflowDetailInfoDataList, nil
}

func (w *ApplicationService) GetWorkflowUploadAuthToken(ctx context.Context, req *workflow.GetUploadAuthTokenRequest) (
	_ *workflow.GetUploadAuthTokenResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	var (
		sceneToUploadPrefixMap = map[string]string{
			"imageflow": "imageflow-",
		}
		prefix string
		ok     bool
	)

	if prefix, ok = sceneToUploadPrefixMap[req.GetScene()]; !ok {
		return nil, fmt.Errorf("scene %s is not supported", req.GetScene())
	}

	authToken, err := w.getAuthToken(ctx)
	if err != nil {
		return nil, err
	}

	return &workflow.GetUploadAuthTokenResponse{
		Data: &workflow.GetUploadAuthTokenData{
			ServiceID:        authToken.ServiceID,
			UploadPathPrefix: prefix,
			UploadHost:       authToken.UploadHost,
			Auth: &workflow.UploadAuthTokenInfo{
				AccessKeyID:     authToken.AccessKeyID,
				SecretAccessKey: authToken.SecretAccessKey,
				SessionToken:    authToken.SessionToken,
				ExpiredTime:     authToken.ExpiredTime,
				CurrentTime:     authToken.CurrentTime,
			},
			Schema: authToken.HostScheme,
		},
	}, nil
}

func (w *ApplicationService) getAuthToken(ctx context.Context) (*bot_common.AuthToken, error) {
	uploadAuthToken, err := w.ImageX.GetUploadAuth(ctx)
	if err != nil {
		return nil, err
	}
	authToken := &bot_common.AuthToken{
		ServiceID:       w.ImageX.GetServerID(),
		AccessKeyID:     uploadAuthToken.AccessKeyID,
		SecretAccessKey: uploadAuthToken.SecretAccessKey,
		SessionToken:    uploadAuthToken.SessionToken,
		ExpiredTime:     uploadAuthToken.ExpiredTime,
		CurrentTime:     uploadAuthToken.CurrentTime,
		UploadHost:      w.ImageX.GetUploadHost(ctx),
		HostScheme:      uploadAuthToken.HostScheme,
	}
	return authToken, nil
}

func (w *ApplicationService) SignImageURL(ctx context.Context, req *workflow.SignImageURLRequest) (
	_ *workflow.SignImageURLResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	url, err := w.ImageX.GetResourceURL(ctx, req.GetURI())
	if err != nil {
		return nil, err
	}

	return &workflow.SignImageURLResponse{
		URL: url.URL,
	}, nil
}

func (w *ApplicationService) GetApiDetail(ctx context.Context, req *workflow.GetApiDetailRequest) (
	_ *vo.ToolDetailInfo, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	toolID, err := strconv.ParseInt(req.GetAPIID(), 10, 64)
	if err != nil {
		return nil, err
	}
	pluginID, err := strconv.ParseInt(req.GetPluginID(), 10, 64)
	if err != nil {
		return nil, err
	}

	toolInfoResponse, err := crossplugin.DefaultSVC().GetPluginToolsInfo(ctx, &plugin.ToolsInfoRequest{
		PluginEntity: plugin.PluginEntity{
			PluginID:      pluginID,
			PluginVersion: req.PluginVersion,
		},
		ToolIDs: []int64{toolID},
	})
	if err != nil {
		return nil, err
	}

	toolInfo, ok := toolInfoResponse.ToolInfoList[toolID]
	if !ok {
		return nil, fmt.Errorf("tool info not found, tool id: %d", toolID)
	}

	inputVars, err := slices.TransformWithErrorCheck(toolInfo.Inputs, toVariable)
	if err != nil {
		return nil, err
	}

	outputVars, err := slices.TransformWithErrorCheck(toolInfo.Outputs, toVariable)
	if err != nil {
		return nil, err
	}

	toolDetailInfo := &vo.ToolDetailInfo{
		ApiDetailData: &workflow.ApiDetailData{
			PluginID:            req.GetPluginID(),
			SpaceID:             req.GetSpaceID(),
			Icon:                toolInfoResponse.IconURL,
			Name:                toolInfoResponse.PluginName,
			Desc:                toolInfoResponse.Description,
			ApiName:             toolInfo.ToolName,
			Version:             &toolInfoResponse.Version,
			VersionName:         &toolInfoResponse.Version,
			PluginType:          workflow.PluginType(toolInfoResponse.PluginType),
			LatestVersionName:   toolInfoResponse.LatestVersion,
			LatestVersion:       toolInfoResponse.LatestVersion,
			PluginProductStatus: ternary.IFElse(toolInfoResponse.IsOfficial, int64(1), 0),
			ProjectID:           ternary.IFElse(toolInfoResponse.AppID != 0, ptr.Of(strconv.FormatInt(toolInfoResponse.AppID, 10)), nil),
		},
		ToolInputs:  inputVars,
		ToolOutputs: outputVars,
	}

	return toolDetailInfo, nil
}

func (w *ApplicationService) GetLLMNodeFCSettingDetail(ctx context.Context, req *workflow.GetLLMNodeFCSettingDetailRequest) (
	_ *GetLLMNodeFCSettingDetailResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var (
		pluginSvc           = crossplugin.DefaultSVC()
		pluginToolsInfoReqs = make(map[int64]*plugin.ToolsInfoRequest)
		pluginDetailMap     = make(map[string]*workflow.PluginDetail)
		toolsDetailInfo     = make(map[string]*workflow.APIDetail)
		workflowDetailMap   = make(map[string]*workflow.WorkflowDetail)
		knowledgeDetailMap  = make(map[string]*workflow.DatasetDetail)
	)

	if len(req.GetPluginList()) > 0 {
		for _, pl := range req.GetPluginList() {
			pluginID, err := strconv.ParseInt(pl.PluginID, 10, 64)
			if err != nil {
				return nil, err
			}

			toolID, err := strconv.ParseInt(pl.APIID, 10, 64)
			if err != nil {
				return nil, err
			}

			if r, ok := pluginToolsInfoReqs[pluginID]; ok {
				r.ToolIDs = append(r.ToolIDs, toolID)
			} else {
				pluginToolsInfoReqs[pluginID] = &plugin.ToolsInfoRequest{
					PluginEntity: plugin.PluginEntity{
						PluginID:      pluginID,
						PluginVersion: pl.PluginVersion,
					},
					ToolIDs: []int64{toolID},
					IsDraft: pl.IsDraft,
				}
			}

		}
		for _, r := range pluginToolsInfoReqs {
			resp, err := pluginSvc.GetPluginToolsInfo(ctx, r)
			if err != nil {
				return nil, err
			}

			pluginIdStr := strconv.FormatInt(resp.PluginID, 10)
			if _, ok := pluginDetailMap[pluginIdStr]; !ok {
				pluginDetail := &workflow.PluginDetail{
					ID:          pluginIdStr,
					Name:        resp.PluginName,
					IconURL:     resp.IconURL,
					Description: resp.Description,
					PluginType:  resp.PluginType,
					VersionName: resp.Version,
					IsOfficial:  resp.IsOfficial,
				}

				if resp.LatestVersion != nil {
					pluginDetail.LatestVersionName = *resp.LatestVersion
				}
				pluginDetailMap[pluginIdStr] = pluginDetail
			}

			for id, tl := range resp.ToolInfoList {
				toolIDStr := strconv.FormatInt(id, 10)
				if _, ok := toolsDetailInfo[toolIDStr]; !ok {
					toolDetail := &workflow.APIDetail{
						ID:          toolIDStr,
						PluginID:    pluginIdStr,
						Name:        tl.ToolName,
						Description: tl.Description,
					}
					toolsDetailInfo[toolIDStr] = toolDetail

					toolDetail.Parameters = tl.Inputs

				}

			}

		}
	}

	if len(req.GetWorkflowList()) > 0 {
		var (
			draftIDs   []int64
			versionIDs []int64
			id2Version = make(map[int64]string)
		)

		for _, wf := range req.GetWorkflowList() {
			id, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
			if err != nil {
				return nil, err
			}

			if wf.WorkflowVersion == nil || len(*wf.WorkflowVersion) == 0 {
				draftIDs = append(draftIDs, id)
			} else {
				versionIDs = append(versionIDs, id)
				id2Version[id] = *wf.WorkflowVersion
			}
		}

		var wfs []*entity.Workflow
		if len(draftIDs) > 0 {
			wfs, _, err = GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
				MetaQuery: vo.MetaQuery{
					IDs: draftIDs,
				},
				QType:    workflowModel.FromDraft,
				MetaOnly: false,
			})
			if err != nil {
				return nil, err
			}
		}

		if len(id2Version) > 0 {
			wfs2, _, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
				MetaQuery: vo.MetaQuery{
					IDs: versionIDs,
				},
				QType:    workflowModel.FromSpecificVersion,
				MetaOnly: false,
				Versions: id2Version,
			})
			if err != nil {
				return nil, err
			}
			wfs = append(wfs, wfs2...)
		}

		for _, wf := range wfs {
			wfIDStr := strconv.FormatInt(wf.ID, 10)
			workflowParameters, err := slices.TransformWithErrorCheck(wf.InputParams, toWorkflowAPIParameter)
			if err != nil {
				return nil, err
			}

			workflowDetailMap[wfIDStr] = &workflow.WorkflowDetail{
				ID:                wfIDStr,
				PluginID:          wfIDStr,
				Description:       wf.Desc,
				Name:              wf.Name,
				IconURL:           wf.IconURL,
				Type:              int64(common.PluginType_WORKFLOW),
				LatestVersionName: wf.GetLatestVersion(),
				APIDetail: &workflow.APIDetail{
					ID:         wfIDStr,
					PluginID:   wfIDStr,
					Name:       wf.Name,
					Parameters: workflowParameters,
				},
			}
		}
	}

	if len(req.GetDatasetList()) > 0 {
		knowledgeOperator := crossknowledge.DefaultSVC()
		knowledgeIDs, err := slices.TransformWithErrorCheck(req.GetDatasetList(), func(a *workflow.DatasetFCItem) (int64, error) {
			return strconv.ParseInt(a.GetDatasetID(), 10, 64)
		})
		if err != nil {
			return nil, err
		}
		details, err := knowledgeOperator.ListKnowledgeDetail(ctx, &model.ListKnowledgeDetailRequest{KnowledgeIDs: knowledgeIDs})
		if err != nil {
			return nil, err
		}
		knowledgeDetailMap = slices.ToMap(details.KnowledgeDetails, func(kd *model.KnowledgeDetail) (string, *workflow.DatasetDetail) {
			return strconv.FormatInt(kd.ID, 10), &workflow.DatasetDetail{
				ID:         strconv.FormatInt(kd.ID, 10),
				Name:       kd.Name,
				IconURL:    kd.IconURL,
				FormatType: kd.FormatType,
			}
		})

	}

	response := &workflow.GetLLMNodeFCSettingDetailResponse{
		PluginDetailMap:    pluginDetailMap,
		PluginAPIDetailMap: toolsDetailInfo,
		WorkflowDetailMap:  workflowDetailMap,
		DatasetDetailMap:   knowledgeDetailMap,
	}

	return &GetLLMNodeFCSettingDetailResponse{
		GetLLMNodeFCSettingDetailResponse: response,
	}, nil
}

func (w *ApplicationService) GetLLMNodeFCSettingsMerged(ctx context.Context, req *workflow.GetLLMNodeFCSettingsMergedRequest) (
	_ *workflow.GetLLMNodeFCSettingsMergedResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var fcPluginSetting *workflow.FCPluginSetting
	if req.GetPluginFcSetting() != nil {
		var (
			pluginSvc       = crossplugin.DefaultSVC()
			pluginFcSetting = req.GetPluginFcSetting()
			isDraft         = pluginFcSetting.GetIsDraft()
		)

		pluginID, err := strconv.ParseInt(pluginFcSetting.GetPluginID(), 10, 64)
		if err != nil {
			return nil, err
		}

		toolID, err := strconv.ParseInt(pluginFcSetting.GetAPIID(), 10, 64)
		if err != nil {
			return nil, err
		}

		pluginReq := &plugin.ToolsInfoRequest{
			PluginEntity: plugin.PluginEntity{
				PluginID: pluginID,
			},
			ToolIDs: []int64{toolID},
			IsDraft: isDraft,
		}

		pInfo, err := pluginSvc.GetPluginToolsInfo(ctx, pluginReq)
		if err != nil {
			return nil, err
		}
		toolInfo, ok := pInfo.ToolInfoList[toolID]
		if !ok {
			return nil, fmt.Errorf("tool info not found, too id=%v", toolID)
		}

		latestRequestParams := toolInfo.Inputs
		latestResponseParams := toolInfo.Outputs
		mergeWorkflowAPIParameters(latestRequestParams, pluginFcSetting.GetRequestParams())
		mergeWorkflowAPIParameters(latestResponseParams, pluginFcSetting.GetResponseParams())

		fcPluginSetting = &workflow.FCPluginSetting{
			PluginID:       strconv.FormatInt(pInfo.PluginID, 10),
			APIID:          strconv.FormatInt(toolInfo.ToolID, 10),
			APIName:        toolInfo.ToolName,
			IsDraft:        isDraft,
			RequestParams:  latestRequestParams,
			ResponseParams: latestResponseParams,
			PluginVersion:  pluginFcSetting.GetPluginVersion(),
			ResponseStyle:  &workflow.ResponseStyle{},
		}
	}
	var fCWorkflowSetting *workflow.FCWorkflowSetting
	if setting := req.GetWorkflowFcSetting(); setting != nil {
		wID, err := strconv.ParseInt(setting.GetWorkflowID(), 10, 64)
		if err != nil {
			return nil, err
		}

		policy := &vo.GetPolicy{
			ID:      wID,
			QType:   ternary.IFElse(len(setting.WorkflowVersion) == 0, workflowModel.FromDraft, workflowModel.FromSpecificVersion),
			Version: setting.WorkflowVersion,
		}

		wf, err := GetWorkflowDomainSVC().Get(ctx, policy)
		if err != nil {
			return nil, err
		}

		latestRequestParams, err := slices.TransformWithErrorCheck(wf.InputParams, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}

		latestResponseParams, err := slices.TransformWithErrorCheck(wf.OutputParams, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}

		mergeWorkflowAPIParameters(latestRequestParams, setting.GetRequestParams())

		mergeWorkflowAPIParameters(latestResponseParams, setting.GetResponseParams())

		fCWorkflowSetting = &workflow.FCWorkflowSetting{
			WorkflowID:     strconv.FormatInt(wID, 10),
			PluginID:       strconv.FormatInt(wID, 10),
			IsDraft:        setting.GetIsDraft(),
			RequestParams:  latestRequestParams,
			ResponseParams: latestResponseParams,
			ResponseStyle:  &workflow.ResponseStyle{},
		}
	}

	return &workflow.GetLLMNodeFCSettingsMergedResponse{
		PluginFcSetting:  fcPluginSetting,
		WorflowFcSetting: fCWorkflowSetting,
	}, nil
}

func (w *ApplicationService) GetPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (
	resp *pluginAPI.GetPlaygroundPluginListResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	currentUser := ctxutil.MustGetUIDFromCtx(ctx)
	if err = checkUserSpace(ctx, currentUser, req.GetSpaceID()); err != nil {
		return nil, err
	}

	var (
		toolIDs []int64
		wfs     []*entity.Workflow
	)
	if len(req.GetPluginIds()) > 0 {
		toolIDs, err = slices.TransformWithErrorCheck(req.GetPluginIds(), func(a string) (int64, error) {
			return strconv.ParseInt(a, 10, 64)
		})
		if err != nil {
			return nil, err
		}

		wfs, _, err = GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs:           toolIDs,
				SpaceID:       ptr.Of(req.GetSpaceID()),
				PublishStatus: ptr.Of(vo.HasPublished),
			},
			QType: workflowModel.FromLatestVersion,
		})
	} else if req.GetPage() > 0 && req.GetSize() > 0 {
		wfs, _, err = GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				Page: &vo.Page{
					Size: req.GetSize(),
					Page: req.GetPage(),
				},
				SpaceID:       ptr.Of(req.GetSpaceID()),
				PublishStatus: ptr.Of(vo.HasPublished),
			},
			QType: workflowModel.FromLatestVersion,
		})
	}

	if err != nil {
		return nil, err
	}

	pluginInfoList := make([]*common.PluginInfoForPlayground, 0)
	for _, wf := range wfs {
		pInfo := &common.PluginInfoForPlayground{
			ID:           strconv.FormatInt(wf.ID, 10),
			Name:         wf.Name,
			PluginIcon:   wf.IconURL,
			DescForHuman: wf.Desc,
			Creator: &common.Creator{
				Self: wf.CreatorID == currentUser,
			},
			PluginType:  common.PluginType_WORKFLOW,
			VersionName: wf.VersionMeta.Version,
			CreateTime:  strconv.FormatInt(wf.CreatedAt.Unix(), 10),
			UpdateTime:  strconv.FormatInt(wf.VersionCreatedAt.Unix(), 10),
		}

		pluginApi := &common.PluginApi{
			APIID:    strconv.FormatInt(wf.ID, 10),
			Name:     wf.Name,
			Desc:     wf.Desc,
			PluginID: strconv.FormatInt(wf.ID, 10),
		}
		pluginApi.Parameters, err = slices.TransformWithErrorCheck(wf.InputParams, toPluginParameter)
		if err != nil {
			return nil, err
		}

		pInfo.PluginApis = []*common.PluginApi{pluginApi}
		pluginInfoList = append(pluginInfoList, pInfo)
	}

	return &pluginAPI.GetPlaygroundPluginListResponse{
		Data: &common.GetPlaygroundPluginListData{
			PluginList: pluginInfoList,
			Total:      int32(len(pluginInfoList)),
		},
	}, nil
}

func (w *ApplicationService) CopyWorkflow(ctx context.Context, req *workflow.CopyWorkflowRequest) (
	resp *workflow.CopyWorkflowResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	spaceID, err := strconv.ParseInt(req.GetSpaceID(), 10, 64)
	if err != nil {
		return nil, err
	}

	if err = checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), spaceID); err != nil {
		return nil, err
	}

	workflowID, err := strconv.ParseInt(req.GetWorkflowID(), 10, 64)
	if err != nil {
		return nil, err
	}

	wf, err := w.copyWorkflow(ctx, workflowID, vo.CopyWorkflowPolicy{
		ShouldModifyWorkflowName: true,
	})
	if err != nil {
		return nil, err
	}

	return &workflow.CopyWorkflowResponse{
		Data: &workflow.CopyWorkflowData{
			WorkflowID: strconv.FormatInt(wf.ID, 10),
		},
	}, err
}

func (w *ApplicationService) GetHistorySchema(ctx context.Context, req *workflow.GetHistorySchemaRequest) (
	resp *workflow.GetHistorySchemaResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	spaceID := mustParseInt64(req.GetSpaceID())
	if err = checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	workflowID := mustParseInt64(req.GetWorkflowID())
	executeID := mustParseInt64(req.GetExecuteID())

	var subExecuteID *int64
	if req.IsSetSubExecuteID() {
		subExecuteID = ptr.Of(mustParseInt64(req.GetSubExecuteID()))
	}

	exe := &entity.WorkflowExecution{
		WorkflowID: workflowID,
		SpaceID:    spaceID,
	}

	if subExecuteID == nil {
		exe.ID = executeID
		exe.RootExecutionID = executeID
	} else {
		exe.ID = *subExecuteID
		exe.RootExecutionID = executeID
	}
	// use executeID and sub_executeID to get the workflow execution
	exe, err = GetWorkflowDomainSVC().GetExecution(ctx, exe, false)
	if err != nil {
		return nil, err
	}

	// verify the workflowID
	if exe.WorkflowID != workflowID {
		return nil, fmt.Errorf("workflowID mismatch")
	}

	// get the workflow entity for that workflowID and commitID
	policy := &vo.GetPolicy{
		ID:       workflowID,
		QType:    ternary.IFElse(len(exe.Version) > 0, workflowModel.FromSpecificVersion, workflowModel.FromDraft),
		Version:  exe.Version,
		CommitID: exe.CommitID,
	}

	wfEntity, err := GetWorkflowDomainSVC().Get(ctx, policy)
	if err != nil {
		return nil, err
	}

	// convert the workflow entity to workflow history schema
	return &workflow.GetHistorySchemaResponse{
		Data: &workflow.GetHistorySchemaData{
			Name:         wfEntity.Name,
			Describe:     wfEntity.Desc,
			URL:          wfEntity.IconURL,
			Schema:       wfEntity.Canvas,
			FlowMode:     wfEntity.Mode,
			WorkflowID:   req.GetWorkflowID(),
			CommitID:     wfEntity.CommitID,
			ExecuteID:    req.ExecuteID,
			SubExecuteID: req.SubExecuteID,
		},
	}, nil
}

func (w *ApplicationService) GetExampleWorkFlowList(ctx context.Context, req *workflow.GetExampleWorkFlowListRequest) (
	resp *workflow.GetExampleWorkFlowListResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	page := &vo.Page{}
	if req.GetPage() > 0 {
		page.Page = req.GetPage()
	}

	if req.GetSize() > 0 {
		page.Size = req.GetSize()
	}

	option := vo.MetaQuery{
		Page:    page,
		SpaceID: ptr.Of(consts.TemplateSpaceID),
	}
	if len(req.GetName()) > 0 {
		option.Name = req.Name
	}

	wfs, _, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: option,
		QType:     workflowModel.FromDraft,
		MetaOnly:  false,
	})
	if err != nil {
		return nil, err
	}

	response := &workflow.GetExampleWorkFlowListResponse{
		Data: &workflow.WorkFlowListData{
			AuthList:     make([]*workflow.ResourceAuthInfo, 0),
			WorkflowList: make([]*workflow.Workflow, 0, len(wfs)),
		},
	}
	for _, w := range wfs {
		ww := &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(w.ID, 10),
			Name:             w.Name,
			Desc:             w.Desc,
			IconURI:          w.IconURI,
			URL:              w.IconURL,
			CreateTime:       w.CreatedAt.Unix(),
			UpdateTime:       ternary.IFElse(w.DraftMeta.Timestamp.Unix() == 0, w.CreatedAt.Unix(), w.DraftMeta.Timestamp.Unix()),
			Type:             w.ContentType,
			SchemaType:       workflow.SchemaType_FDL,
			Tag:              w.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(w.AuthorID, 10)),
			SpaceID:          ptr.Of(strconv.FormatInt(w.SpaceID, 10)),
		}

		startNode := &workflow.Node{
			NodeID:    "100001",
			NodeName:  "start-node",
			NodeParam: &workflow.NodeParam{InputParameters: make([]*workflow.Parameter, 0)},
		}
		for _, in := range w.InputParams {
			param, err := toWorkflowParameter(in)
			if err != nil {
				return nil, err
			}
			startNode.NodeParam.InputParameters = append(startNode.NodeParam.InputParameters, param)
		}

		ww.StartNode = startNode
		response.Data.WorkflowList = append(response.Data.WorkflowList, ww)
		response.Data.AuthList = append(response.Data.AuthList, &workflow.ResourceAuthInfo{
			WorkflowID: strconv.FormatInt(w.ID, 10),
			UserID:     strconv.FormatInt(w.CreatorID, 10),
			Auth:       &workflow.ResourceActionAuth{CanEdit: false, CanDelete: false, CanCopy: true},
		})
	}

	return response, nil
}

func (w *ApplicationService) CopyWkTemplateApi(ctx context.Context, req *workflow.CopyWkTemplateApiRequest) (
	resp *workflow.CopyWkTemplateApiResponse, err error,
) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if err = checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), req.GetTargetSpaceID()); err != nil {
		return nil, err
	}

	resp = &workflow.CopyWkTemplateApiResponse{
		Data: map[int64]*workflow.WkPluginBasicData{},
	}
	for _, widStr := range req.GetWorkflowIds() {
		wid, err := strconv.ParseInt(widStr, 10, 64)
		if err != nil {
			return nil, err
		}
		wf, err := w.copyWorkflow(ctx, wid, vo.CopyWorkflowPolicy{
			ShouldModifyWorkflowName: true,
			TargetSpaceID:            ptr.Of(req.GetTargetSpaceID()),
			TargetAppID:              ptr.Of(int64(0)),
		})
		if err != nil {
			return nil, err
		}

		err = w.publishWorkflowResource(ctx, &vo.PublishPolicy{
			ID:        wf.ID,
			Version:   "v0.0.0",
			CommitID:  wf.CommitID,
			CreatorID: ctxutil.MustGetUIDFromCtx(ctx),
			Force:     true,
		})
		if err != nil {
			return nil, err
		}
		var (
			inputs    []*vo.NamedTypeInfo
			outputs   []*vo.NamedTypeInfo
			startNode *workflow.Node
			endNode   *workflow.Node
		)
		if len(wf.InputParamsStr) > 0 {
			err = sonic.UnmarshalString(wf.InputParamsStr, &inputs)
			if err != nil {
				return nil, err
			}
			startNode = &workflow.Node{
				NodeID:    "100001",
				NodeName:  "start-node",
				NodeParam: &workflow.NodeParam{InputParameters: make([]*workflow.Parameter, 0, len(inputs))},
			}
			for _, in := range inputs {
				param, err := toWorkflowParameter(in)
				if err != nil {
					return nil, err
				}
				startNode.NodeParam.InputParameters = append(startNode.NodeParam.InputParameters, param)
			}
		}

		if len(wf.OutputParamsStr) > 0 {
			err = sonic.UnmarshalString(wf.OutputParamsStr, &outputs)
			if err != nil {
				return nil, err
			}
			endNode = &workflow.Node{
				NodeID:    entity.ExitNodeKey,
				NodeName:  "end-node",
				NodeParam: &workflow.NodeParam{InputParameters: make([]*workflow.Parameter, 0, len(outputs))},
			}
			for _, in := range outputs {
				param, err := toWorkflowParameter(in)
				if err != nil {
					return nil, err
				}
				endNode.NodeParam.InputParameters = append(endNode.NodeParam.InputParameters, param)
			}
		}

		resp.Data[wid] = &workflow.WkPluginBasicData{
			WorkflowID: wf.ID,
			SpaceID:    req.GetTargetSpaceID(),
			Name:       wf.Name,
			Desc:       wf.Desc,
			URL:        wf.IconURL,
			IconURI:    wf.IconURI,
			Status:     workflow.WorkFlowStatus_HadPublished,
			PluginID:   wf.ID,
			CreateTime: time.Now().Unix(),
			SourceID:   wid,
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
			Schema:                wf.Canvas,
			FlowMode:              wf.Mode,
			LatestPublishCommitID: wf.CommitID,
			StartNode:             startNode,
			EndNode:               endNode,
		}

	}

	return resp, err
}

func (w *ApplicationService) publishWorkflowResource(ctx context.Context, policy *vo.PublishPolicy) error {
	err := GetWorkflowDomainSVC().Publish(ctx, policy)
	if err != nil {
		return err
	}

	safego.Go(ctx, func() {
		now := time.Now().UnixMilli()
		if err := PublishWorkflowResource(ctx, policy.ID, nil, search.Updated, &search.ResourceDocument{
			PublishStatus: ptr.Of(resource.PublishStatus_Published),
			UpdateTimeMS:  ptr.Of(now),
			PublishTimeMS: ptr.Of(now),
		}); err != nil {
			logs.CtxErrorf(ctx, "publish workflow resource failed workflowID = %d, err: %v", policy.ID, err)
		}
	})

	return nil
}

func mustParseInt64(s string) int64 {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		panic(err)
	}
	return i
}

func parseInt64(s *string) *int64 {
	if s == nil {
		return nil
	}

	i := mustParseInt64(*s)
	return &i
}

func toWorkflowParameter(nType *vo.NamedTypeInfo) (*workflow.Parameter, error) {
	wp := &workflow.Parameter{Name: nType.Name}
	wp.Desc = nType.Desc
	if nType.Required {
		wp.Required = true
	}
	switch nType.Type {
	case vo.DataTypeString, vo.DataTypeTime, vo.DataTypeFile:
		wp.Type = workflow.InputType_String
	case vo.DataTypeInteger:
		wp.Type = workflow.InputType_Integer
	case vo.DataTypeNumber:
		wp.Type = workflow.InputType_Number
	case vo.DataTypeBoolean:
		wp.Type = workflow.InputType_Boolean
	case vo.DataTypeArray:
		wp.Type = workflow.InputType_Array
		if nType.ElemTypeInfo != nil {
			switch nType.ElemTypeInfo.Type {
			case vo.DataTypeString, vo.DataTypeTime, vo.DataTypeFile:
				wp.SubType = workflow.InputType_String
			case vo.DataTypeInteger:
				wp.SubType = workflow.InputType_Integer
			case vo.DataTypeNumber:
				wp.SubType = workflow.InputType_Number
			case vo.DataTypeBoolean:
				wp.SubType = workflow.InputType_Boolean
			case vo.DataTypeObject:
				wp.SubType = workflow.InputType_Object
			}
		}
	case vo.DataTypeObject:
		wp.Type = workflow.InputType_Object
	default:
		return nil, fmt.Errorf("unknown type: %s", nType.Type)

	}

	return wp, nil
}

func i64PtrToStringPtr(i *int64) *string {
	if i == nil {
		return nil
	}

	s := strconv.FormatInt(*i, 10)
	return &s
}

func toVariables(namedTypeInfoList []*vo.NamedTypeInfo) ([]*vo.Variable, error) {
	vs := make([]*vo.Variable, 0, len(namedTypeInfoList))
	for _, in := range namedTypeInfoList {
		v, err := in.ToVariable()
		if err != nil {
			return nil, err
		}
		vs = append(vs, v)
	}

	return vs, nil
}

func toPluginParameter(info *vo.NamedTypeInfo) (*common.PluginParameter, error) {
	if info == nil {
		return nil, fmt.Errorf("named type info is nil")
	}
	p := &common.PluginParameter{
		Name:     info.Name,
		Desc:     info.Desc,
		Required: info.Required,
	}

	if info.Type == vo.DataTypeFile && info.FileType != nil {
		switch *info.FileType {
		case vo.FileTypeZip:
			p.Format = ptr.Of(common.PluginParamTypeFormat_ZipUrl)
		case vo.FileTypeCode:
			p.Format = ptr.Of(common.PluginParamTypeFormat_CodeUrl)
		case vo.FileTypeTxt:
			p.Format = ptr.Of(common.PluginParamTypeFormat_TxtUrl)
		case vo.FileTypeExcel:
			p.Format = ptr.Of(common.PluginParamTypeFormat_ExcelUrl)
		case vo.FileTypePPT:
			p.Format = ptr.Of(common.PluginParamTypeFormat_PptUrl)
		case vo.FileTypeDocument:
			p.Format = ptr.Of(common.PluginParamTypeFormat_DocUrl)
		case vo.FileTypeVideo:
			p.Format = ptr.Of(common.PluginParamTypeFormat_VideoUrl)
		case vo.FileTypeAudio:
			p.Format = ptr.Of(common.PluginParamTypeFormat_AudioUrl)
		case vo.FileTypeImage:
			p.Format = ptr.Of(common.PluginParamTypeFormat_ImageUrl)
		default:
			// missing types use file as the default type
			p.Format = ptr.Of(common.PluginParamTypeFormat_FileUrl)
		}
	}

	switch info.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		p.Type = "string"
	case vo.DataTypeInteger:
		p.Type = "integer"
	case vo.DataTypeNumber:
		p.Type = "number"
	case vo.DataTypeBoolean:
		p.Type = "boolean"
	case vo.DataTypeObject:
		p.Type = "object"
		p.SubParameters = make([]*common.PluginParameter, 0, len(info.Properties))
		for _, sub := range info.Properties {
			subParameter, err := toPluginParameter(sub)
			if err != nil {
				return nil, err
			}
			p.SubParameters = append(p.SubParameters, subParameter)
		}
	case vo.DataTypeArray:
		p.Type = "array"
		eleParameter, err := toPluginParameter(info.ElemTypeInfo)
		if err != nil {
			return nil, err
		}
		p.SubType = eleParameter.Type
		p.SubParameters = []*common.PluginParameter{eleParameter}
	default:
		return nil, fmt.Errorf("unknown named type info type: %s", info.Type)
	}

	return p, nil
}

func toWorkflowAPIParameter(info *vo.NamedTypeInfo) (*workflow.APIParameter, error) {
	if info == nil {
		return nil, fmt.Errorf("named type info is nil")
	}
	p := &workflow.APIParameter{
		Name:       info.Name,
		Desc:       info.Desc,
		IsRequired: info.Required,
	}

	if info.Type == vo.DataTypeFile && info.FileType != nil {
		p.AssistType = ptr.Of(toWorkflowAPIParameterAssistType(*info.FileType))
	}

	switch info.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		p.Type = workflow.ParameterType_String
	case vo.DataTypeInteger:
		p.Type = workflow.ParameterType_Integer
	case vo.DataTypeBoolean:
		p.Type = workflow.ParameterType_Bool
	case vo.DataTypeObject:
		p.Type = workflow.ParameterType_Object
		p.SubParameters = make([]*workflow.APIParameter, 0, len(info.Properties))
		subParameters, err := slices.TransformWithErrorCheck(info.Properties, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}
		p.SubParameters = append(p.SubParameters, subParameters...)
	case vo.DataTypeNumber:
		p.Type = workflow.ParameterType_Number
	case vo.DataTypeArray:
		p.Type = workflow.ParameterType_Array
		eleParameters, err := slices.TransformWithErrorCheck([]*vo.NamedTypeInfo{info.ElemTypeInfo}, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}
		eleParameter := eleParameters[0]
		p.SubType = &eleParameter.Type
		p.SubParameters = []*workflow.APIParameter{eleParameter}
	default:
		return nil, fmt.Errorf("unknown named type info type: %s", info.Type)
	}

	return p, nil
}

func toWorkflowAPIParameterAssistType(ty vo.FileSubType) workflow.AssistParameterType {
	switch ty {
	case vo.FileTypeImage:
		return workflow.AssistParameterType_IMAGE
	case vo.FileTypeSVG:
		return workflow.AssistParameterType_SVG
	case vo.FileTypeAudio:
		return workflow.AssistParameterType_AUDIO
	case vo.FileTypeVideo:
		return workflow.AssistParameterType_VIDEO
	case vo.FileTypeVoice:
		return workflow.AssistParameterType_Voice
	case vo.FileTypeDocument:
		return workflow.AssistParameterType_DOC
	case vo.FileTypePPT:
		return workflow.AssistParameterType_PPT
	case vo.FileTypeExcel:
		return workflow.AssistParameterType_EXCEL
	case vo.FileTypeTxt:
		return workflow.AssistParameterType_TXT
	case vo.FileTypeCode:
		return workflow.AssistParameterType_CODE
	case vo.FileTypeZip:
		return workflow.AssistParameterType_ZIP
	default:
		return workflow.APIParameter_AssistType_DEFAULT
	}
}

func toVariableSlice(params []*workflow.APIParameter) ([]*vo.Variable, error) {
	if len(params) == 0 {
		return nil, nil
	}
	res := make([]*vo.Variable, 0, len(params))
	for _, p := range params {
		v, err := toVariable(p)
		if err != nil {
			return nil, err
		}
		res = append(res, v)
	}
	return res, nil
}

func toVariable(p *workflow.APIParameter) (*vo.Variable, error) {
	if p == nil {
		return nil, nil
	}
	v := &vo.Variable{
		Name:        p.Name,
		Description: p.Desc,
		Required:    p.IsRequired,
	}

	if p.AssistType != nil {
		v.AssistType = vo.AssistType(*p.AssistType)
	}

	switch p.Type {
	case workflow.ParameterType_String:
		v.Type = vo.VariableTypeString
	case workflow.ParameterType_Integer:
		v.Type = vo.VariableTypeInteger
	case workflow.ParameterType_Number:
		v.Type = vo.VariableTypeFloat
	case workflow.ParameterType_Bool:
		v.Type = vo.VariableTypeBoolean
	case workflow.ParameterType_Array:
		v.Type = vo.VariableTypeList
		if p.SubType == nil {
			return nil, fmt.Errorf("array parameter '%s' is missing a SubType", p.Name)
		}
		// The schema of a list variable is a single variable describing the items.
		itemSchema := &vo.Variable{
			Type: vo.VariableType(strings.ToLower(p.SubType.String())),
		}
		// If the items in the array are objects, describe their structure.
		if *p.SubType == workflow.ParameterType_Object {
			itemFields, err := toVariableSlice(p.SubParameters)
			if err != nil {
				return nil, err
			}
			itemSchema.Schema = itemFields
		} else {
			if len(p.SubParameters) > 0 && p.SubParameters[0].AssistType != nil {
				itemSchema.AssistType = vo.AssistType(*p.SubParameters[0].AssistType)
			}
		}
		v.Schema = itemSchema
	case workflow.ParameterType_Object:
		v.Type = vo.VariableTypeObject
		subVars, err := toVariableSlice(p.SubParameters)
		if err != nil {
			return nil, err
		}
		v.Schema = subVars
	default:
		return nil, fmt.Errorf("unknown workflow api parameter type: %v", p.Type)
	}
	return v, nil
}

func mergeWorkflowAPIParameters(latestAPIParameters []*workflow.APIParameter, existAPIParameters []*workflow.APIParameter) {
	existAPIParameterMap := slices.ToMap(existAPIParameters, func(w *workflow.APIParameter) (string, *workflow.APIParameter) {
		return w.Name, w
	})

	for _, parameter := range latestAPIParameters {
		if ep, ok := existAPIParameterMap[parameter.Name]; ok {
			parameter.LocalDisable = ep.LocalDisable
			parameter.LocalDefault = ep.LocalDefault
			if len(parameter.SubParameters) > 0 && len(ep.SubParameters) > 0 {
				mergeWorkflowAPIParameters(parameter.SubParameters, ep.SubParameters)
			}

		} else {
			existAPIParameters = append(existAPIParameters, parameter)
		}
	}
}

func parseWorkflowTerminatePlanType(c *vo.Canvas) (int32, error) {
	var endNode *vo.Node
	for _, n := range c.Nodes {
		if n.Type == entity.NodeTypeExit.IDStr() {
			endNode = n
			break
		}
	}
	if endNode == nil {
		return 0, fmt.Errorf("can not find end node")
	}
	switch *endNode.Data.Inputs.TerminatePlan {
	case vo.ReturnVariables:
		return 0, nil
	case vo.UseAnswerContent:
		return 1, nil
	default:
		return 0, fmt.Errorf("invalid terminate plan type %v", *endNode.Data.Inputs.TerminatePlan)
	}
}

type GetLLMNodeFCSettingDetailResponse struct {
	*workflow.GetLLMNodeFCSettingDetailResponse
}

func (g *GetLLMNodeFCSettingDetailResponse) MarshalJSON() ([]byte, error) {
	bs, err := sonic.Marshal(g.GetLLMNodeFCSettingDetailResponse)
	if err != nil {
		return nil, err
	}
	result := make(map[string]interface{})
	_ = sonic.Unmarshal(bs, &result)
	pluginDetailMaps := result["plugin_detail_map"].(map[string]interface{})
	for k, value := range pluginDetailMaps {
		pluginDetail := value.(map[string]interface{})
		pluginDetail["latest_version_ts"] = pluginDetail["latest_version_name"]
		pluginDetailMaps[k] = pluginDetail
	}
	return sonic.Marshal(result)
}

func checkUserSpace(ctx context.Context, uid int64, spaceID int64) error {
	spaces, err := crossuser.DefaultSVC().GetUserSpaceList(ctx, uid)
	if err != nil {
		return err
	}

	var match bool
	for _, s := range spaces {
		if s.ID == spaceID {
			match = true
			break
		}
	}

	if !match {
		return fmt.Errorf("user %d does not have access to space %d", uid, spaceID)
	}

	return nil
}

func (w *ApplicationService) populateChatFlowRoleFields(role *workflow.ChatFlowRole, targetRole interface{}) error {
	var avatarUri, audioStr, bgStr, obStr, srStr, uiStr string
	var err error

	if role.Avatar != nil {
		avatarUri = role.Avatar.ImageUri

	}
	if role.AudioConfig != nil {
		audioStr, err = sonic.MarshalString(*role.AudioConfig)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}
	if role.BackgroundImageInfo != nil {
		bgStr, err = sonic.MarshalString(*role.BackgroundImageInfo)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}
	if role.OnboardingInfo != nil {
		obStr, err = sonic.MarshalString(*role.OnboardingInfo)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}
	if role.SuggestReplyInfo != nil {
		srStr, err = sonic.MarshalString(*role.SuggestReplyInfo)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}
	if role.UserInputConfig != nil {
		uiStr, err = sonic.MarshalString(*role.UserInputConfig)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}

	switch r := targetRole.(type) {
	case *vo.ChatFlowRoleCreate:
		if role.Name != nil {
			r.Name = *role.Name
		}
		if role.Description != nil {
			r.Description = *role.Description
		}
		if avatarUri != "" {
			r.AvatarUri = avatarUri
		}
		if audioStr != "" {
			r.AudioConfig = audioStr
		}
		if bgStr != "" {
			r.BackgroundImageInfo = bgStr
		}
		if obStr != "" {
			r.OnboardingInfo = obStr
		}
		if srStr != "" {
			r.SuggestReplyInfo = srStr
		}
		if uiStr != "" {
			r.UserInputConfig = uiStr
		}
	case *vo.ChatFlowRoleUpdate:
		r.Name = role.Name
		r.Description = role.Description
		if avatarUri != "" {
			r.AvatarUri = ptr.Of(avatarUri)
		}
		if audioStr != "" {
			r.AudioConfig = ptr.Of(audioStr)
		}
		if bgStr != "" {
			r.BackgroundImageInfo = ptr.Of(bgStr)
		}
		if obStr != "" {
			r.OnboardingInfo = ptr.Of(obStr)
		}
		if srStr != "" {
			r.SuggestReplyInfo = ptr.Of(srStr)
		}
		if uiStr != "" {
			r.UserInputConfig = ptr.Of(uiStr)
		}
	default:
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid type for targetRole: %T", targetRole))
	}

	return nil
}

// ExportWorkflow 导出工作流
func (w *ApplicationService) ExportWorkflow(ctx context.Context, req *workflow.ExportWorkflowRequest) (*workflow.ExportWorkflowResponse, error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err := safego.NewPanicErr(panicErr, debug.Stack())
			logs.CtxErrorf(ctx, "ExportWorkflow panic: %v", err)
		}
	}()

	// 参数验证
	if req.WorkflowID == "" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow_id is required"))
	}
	supportedFormats := map[string]bool{
		"json": true,
		"yml":  true,
		"yaml": true,
	}
	if !supportedFormats[req.ExportFormat] {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported export format: %s, supported formats: json, yml, yaml", req.ExportFormat))
	}

	// 记录操作日志
	logs.CtxInfof(ctx, "ExportWorkflow started, workflowID=%s, includeDependencies=%v", req.WorkflowID, req.IncludeDependencies)

	// 获取工作流信息
	workflowID, err := strconv.ParseInt(req.WorkflowID, 10, 64)
	if err != nil {
		logs.CtxErrorf(ctx, "ExportWorkflow failed to parse workflow_id: %s, error: %v", req.WorkflowID, err)
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid workflow_id: %s", req.WorkflowID))
	}

	// 获取工作流详情
	workflowInfo, err := w.DomainSVC.Get(ctx, &vo.GetPolicy{
		ID: workflowID,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "ExportWorkflow failed to get workflow: %d, error: %v", workflowID, err)
		return nil, vo.WrapError(errno.ErrWorkflowNotFound, fmt.Errorf("failed to get workflow: %v", err))
	}

	// 验证用户权限（检查工作空间）
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), workflowInfo.SpaceID); err != nil {
		logs.CtxErrorf(ctx, "ExportWorkflow permission denied, user=%d, space=%d, error: %v", ctxutil.MustGetUIDFromCtx(ctx), workflowInfo.SpaceID, err)
		return nil, vo.WrapError(errno.ErrWorkflowOperationFail, fmt.Errorf("permission denied: %v", err))
	}

	// 构建导出数据
	exportData := &workflow.WorkflowExportData{
		WorkflowID:  req.WorkflowID,
		Name:        workflowInfo.Name,
		Description: workflowInfo.Desc,
		Version:     workflowInfo.GetVersion(),
		CreateTime:  workflowInfo.CreatedAt.Unix(),
		UpdateTime:  workflowInfo.UpdatedAt.Unix(),
		Metadata: map[string]interface{}{
			"space_id":     strconv.FormatInt(workflowInfo.SpaceID, 10),
			"creator_id":   strconv.FormatInt(workflowInfo.CreatorID, 10),
			"content_type": strconv.FormatInt(int64(workflowInfo.ContentType), 10),
			"mode":         strconv.FormatInt(int64(workflowInfo.Mode), 10),
		},
	}

	// 添加工作流Schema
	if workflowInfo.Canvas != "" {
		var canvas vo.Canvas
		if err := sonic.UnmarshalString(workflowInfo.Canvas, &canvas); err == nil {
			// 解析Schema
			var schemaData map[string]interface{}
			if err := sonic.UnmarshalString(workflowInfo.Canvas, &schemaData); err == nil {
				exportData.Schema = schemaData
			}

			// 设置节点
			exportData.Nodes = make([]interface{}, len(canvas.Nodes))
			for i, node := range canvas.Nodes {
				exportData.Nodes[i] = node
			}

			// 设置边
			exportData.Edges = make([]interface{}, len(canvas.Edges))
			for i, edge := range canvas.Edges {
				edgeData := map[string]string{
					"from_node": edge.SourceNodeID,
					"to_node":   edge.TargetNodeID,
					"from_port": edge.SourcePortID,
					"to_port":   edge.TargetPortID,
				}
				exportData.Edges[i] = edgeData
			}
		}
	}

	// 添加依赖资源信息（如果启用）
	if req.IncludeDependencies {
		dependencies := make([]interface{}, 0)

		// 获取工作流中引用的资源
		if workflowInfo.Canvas != "" {
			var canvas vo.Canvas
			if err := sonic.UnmarshalString(workflowInfo.Canvas, &canvas); err == nil {
				// 分析节点中的资源引用
				for _, node := range canvas.Nodes {
					if node.Data != nil && node.Data.Meta != nil {
						// 这里可以添加更多资源类型的检测逻辑
						// 目前先添加一个示例
						dependency := map[string]interface{}{
							"resource_id":   fmt.Sprintf("node_%s", node.ID),
							"resource_type": "node",
							"resource_name": node.Data.Meta.Title,
							"metadata": map[string]interface{}{
								"node_type": "workflow_node",
							},
						}
						dependencies = append(dependencies, dependency)
					}
				}
			}
		}

		exportData.Dependencies = dependencies
	}

	logs.CtxInfof(ctx, "ExportWorkflow completed successfully, workflowID=%s, nodeCount=%d, edgeCount=%d",
		req.WorkflowID, len(exportData.Nodes), len(exportData.Edges))

	// 设置导出格式
	exportData.ExportFormat = req.ExportFormat

	// 根据导出格式进行序列化处理
	if req.ExportFormat == "yml" || req.ExportFormat == "yaml" {
		// 创建一个不包含SerializedData的副本用于YAML序列化
		exportDataForYAML := &workflow.WorkflowExportData{
			WorkflowID:   exportData.WorkflowID,
			Name:         exportData.Name,
			Description:  exportData.Description,
			Version:      exportData.Version,
			CreateTime:   exportData.CreateTime,
			UpdateTime:   exportData.UpdateTime,
			Schema:       exportData.Schema,
			Nodes:        exportData.Nodes,
			Edges:        exportData.Edges,
			Metadata:     exportData.Metadata,
			Dependencies: exportData.Dependencies,
			ExportFormat: exportData.ExportFormat,
			// 不包含 SerializedData 字段
		}

		yamlData, err := yaml.Marshal(exportDataForYAML)
		if err != nil {
			logs.CtxErrorf(ctx, "ExportWorkflow failed to marshal YAML data: %v", err)
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, fmt.Errorf("failed to serialize workflow to YAML: %v", err))
		}
		exportData.SerializedData = string(yamlData)
		logs.CtxInfof(ctx, "ExportWorkflow YAML serialization completed, size=%d bytes", len(yamlData))
	}

	// 构建响应
	return &workflow.ExportWorkflowResponse{
		Code: 200,
		Msg:  "success",
		Data: struct {
			WorkflowExport *workflow.WorkflowExportData `json:"workflow_export,omitempty"`
		}{
			WorkflowExport: exportData,
		},
	}, nil
}

// parseWorkflowData 解析工作流数据，支持JSON和YAML格式
func (w *ApplicationService) parseWorkflowData(ctx context.Context, data string, format string) (*workflow.WorkflowExportData, error) {
	var exportData workflow.WorkflowExportData

	if format == "yml" || format == "yaml" {
		// YAML格式解析
		if err := yaml.Unmarshal([]byte(data), &exportData); err != nil {
			return nil, fmt.Errorf("failed to parse YAML workflow data: %v", err)
		}
	} else if format == "zip" {
		// ZIP格式解析和转换
		convertedData, err := w.parseAndConvertZipWorkflowData(ctx, data)
		if err != nil {
			return nil, fmt.Errorf("failed to parse ZIP workflow data: %v", err)
		}
		exportData = *convertedData
	} else {
		// JSON格式解析
		if err := sonic.UnmarshalString(data, &exportData); err != nil {
			return nil, fmt.Errorf("failed to parse JSON workflow data: %v", err)
		}
	}

	return &exportData, nil
}

// parseAndConvertZipWorkflowData 解析ZIP格式工作流数据并转换为开源格式
func (w *ApplicationService) parseAndConvertZipWorkflowData(ctx context.Context, zipDataStr string) (*workflow.WorkflowExportData, error) {
	// ZIP数据通过base64编码传输
	zipBytes, err := base64.StdEncoding.DecodeString(zipDataStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64 ZIP data: %v", err)
	}

	// 解析ZIP内容
	zipReader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		return nil, fmt.Errorf("failed to read ZIP file: %v", err)
	}

	var workflowContent string

	// 遍历ZIP文件内容
	for _, file := range zipReader.File {
		reader, err := file.Open()
		if err != nil {
			continue
		}

		content, err := io.ReadAll(reader)
		reader.Close()
		if err != nil {
			continue
		}

		// 检查是否是工作流文件
		if strings.Contains(file.Name, "Workflow-") && strings.HasSuffix(file.Name, ".zip") {
			// 这是内嵌的工作流文件，需要进一步解析
			workflowContent = string(content)
		}
	}

	if workflowContent == "" {
		return nil, fmt.Errorf("no workflow content found in ZIP file")
	}

	// 从工作流内容中提取JSON和MANIFEST
	jsonData, manifestData, err := extractWorkflowDataFromContent(workflowContent)
	if err != nil {
		return nil, fmt.Errorf("failed to extract workflow data: %v", err)
	}

	// 转换为开源格式
	convertedData, err := w.convertZipWorkflowToOpenSource(ctx, jsonData, manifestData)
	if err != nil {
		return nil, fmt.Errorf("failed to convert ZIP workflow: %v", err)
	}

	return convertedData, nil
}

// extractWorkflowDataFromContent 从工作流内容中提取JSON和MANIFEST数据
func extractWorkflowDataFromContent(content string) (map[string]interface{}, map[string]interface{}, error) {
	// 首先尝试找到JSON的开始位置
	jsonStart := strings.Index(content, "{\"edges\"")
	if jsonStart == -1 {
		jsonStart = strings.Index(content, `{"nodes"`)
	}
	if jsonStart == -1 {
		return nil, nil, fmt.Errorf("no JSON start found")
	}

	// 从JSON开始位置截取，找到完整的JSON
	contentFromJson := content[jsonStart:]

	// 找到完整的JSON（通过括号匹配）
	braceCount := 0
	jsonEnd := -1
	for i, char := range contentFromJson {
		if char == '{' {
			braceCount++
		} else if char == '}' {
			braceCount--
			if braceCount == 0 {
				jsonEnd = i
				break
			}
		}
	}

	if jsonEnd == -1 {
		return nil, nil, fmt.Errorf("no complete JSON found")
	}

	jsonMatch := contentFromJson[:jsonEnd+1]

	// 清理JSON字符串
	cleanJsonString := strings.ReplaceAll(jsonMatch, "\x00", "")
	cleanJsonString = regexp.MustCompile(`[\x00-\x1F\x7F-\x9F]`).ReplaceAllString(cleanJsonString, "")
	cleanJsonString = strings.TrimSpace(cleanJsonString)

	var jsonData map[string]interface{}
	if err := sonic.UnmarshalString(cleanJsonString, &jsonData); err != nil {
		return nil, nil, fmt.Errorf("failed to parse JSON data: %v", err)
	}

	// 查找MANIFEST.yml数据
	manifestRegex := regexp.MustCompile(`MANIFEST\.yml[\s\S]*?type:\s*(\w+)[\s\S]*?version:\s*([^\n\r]+)[\s\S]*?main:\s*[\s\S]*?id:\s*([^\n\r]+)[\s\S]*?name:\s*([^\n\r]+)[\s\S]*?desc:\s*([^\n\r]+)`)
	manifestMatch := manifestRegex.FindStringSubmatch(content)

	manifestData := make(map[string]interface{})
	if len(manifestMatch) >= 6 {
		manifestData = map[string]interface{}{
			"type":    strings.TrimSpace(manifestMatch[1]),
			"version": strings.Trim(strings.TrimSpace(manifestMatch[2]), `"`),
			"main": map[string]interface{}{
				"id":   strings.Trim(strings.TrimSpace(manifestMatch[3]), `"`),
				"name": strings.Trim(strings.TrimSpace(manifestMatch[4]), `"`),
				"desc": strings.Trim(strings.TrimSpace(manifestMatch[5]), `"`),
			},
		}
	}

	return jsonData, manifestData, nil
}

// convertZipWorkflowToOpenSource 转换ZIP格式到开源格式
func (w *ApplicationService) convertZipWorkflowToOpenSource(ctx context.Context, zipData map[string]interface{}, manifest map[string]interface{}) (*workflow.WorkflowExportData, error) {
	currentTime := time.Now().Unix()

	logs.CtxInfof(ctx, "Converting ZIP workflow to open source format, preserving original model IDs")

	// 提取edges数据并转换格式
	var convertedEdges []map[string]interface{}
	if edgesData, ok := zipData["edges"].([]interface{}); ok {
		for _, edge := range edgesData {
			if edgeMap, ok := edge.(map[string]interface{}); ok {
				convertedEdge := map[string]interface{}{
					"from_node": edgeMap["sourceNodeID"],
					"from_port": getStringValue(edgeMap, "sourcePortID"),
					"to_node":   edgeMap["targetNodeID"],
					"to_port":   getStringValue(edgeMap, "targetPortID"),
				}
				convertedEdges = append(convertedEdges, convertedEdge)
			}
		}
	}

	// 提取nodes数据并转换格式
	var convertedNodes []map[string]interface{}
	var simplifiedNodes []map[string]interface{}
	var dependencies []map[string]interface{}

	if nodesData, ok := zipData["nodes"].([]interface{}); ok {
		for _, node := range nodesData {
			if nodeMap, ok := node.(map[string]interface{}); ok {
				// 移除blocks字段
				nodeWithoutBlocks := make(map[string]interface{})
				for k, v := range nodeMap {
					if k != "blocks" {
						nodeWithoutBlocks[k] = v
					}
				}
				convertedNodes = append(convertedNodes, nodeWithoutBlocks)

				// 创建简化节点
				simplifiedNode := map[string]interface{}{
					"id":   nodeMap["id"],
					"type": nodeMap["type"],
					"meta": nodeMap["meta"],
					"data": extractNodeData(nodeMap),
				}
				simplifiedNodes = append(simplifiedNodes, simplifiedNode)

				// 创建依赖
				nodeTitle := "Node"
				if dataMap, ok := nodeMap["data"].(map[string]interface{}); ok {
					if metaMap, ok := dataMap["nodeMeta"].(map[string]interface{}); ok {
						if title, ok := metaMap["title"].(string); ok && title != "" {
							nodeTitle = title
						}
					}
				}

				dependency := map[string]interface{}{
					"metadata": map[string]interface{}{
						"node_type": "workflow_node",
					},
					"resource_id":   fmt.Sprintf("node_%v", nodeMap["id"]),
					"resource_name": nodeTitle,
					"resource_type": "node",
				}
				dependencies = append(dependencies, dependency)
			}
		}
	}

	// 构建schema中的edges
	var schemaEdges []map[string]interface{}
	for _, edge := range convertedEdges {
		schemaEdge := map[string]interface{}{
			"sourceNodeID": edge["from_node"],
			"sourcePortID": edge["from_port"],
			"targetNodeID": edge["to_node"],
			"targetPortID": edge["to_port"],
		}
		schemaEdges = append(schemaEdges, schemaEdge)
	}

	// 构建schema
	schema := map[string]interface{}{
		"edges": schemaEdges,
		"nodes": convertedNodes,
	}

	// 添加versions如果存在
	if versions, ok := zipData["versions"]; ok {
		schema["versions"] = versions
	}

	// 从manifest提取元数据
	var workflowID, name, description, version string
	if mainData, ok := manifest["main"].(map[string]interface{}); ok {
		workflowID = getStringValue(mainData, "id")
		name = getStringValue(mainData, "name")
		description = getStringValue(mainData, "desc")
	}
	if version == "" {
		if v, ok := manifest["version"].(string); ok {
			version = v
		}
	}
	if version == "" {
		version = "v1.0.0"
	}
	if workflowID == "" {
		workflowID = fmt.Sprintf("imported_%d", currentTime)
	}
	if name == "" {
		name = "Imported Workflow"
	}

	// 转换切片类型
	convertedNodesInterface := make([]interface{}, len(simplifiedNodes))
	for i, node := range simplifiedNodes {
		convertedNodesInterface[i] = node
	}

	convertedEdgesInterface := make([]interface{}, len(convertedEdges))
	for i, edge := range convertedEdges {
		convertedEdgesInterface[i] = edge
	}

	convertedDepsInterface := make([]interface{}, len(dependencies))
	for i, dep := range dependencies {
		convertedDepsInterface[i] = dep
	}

	// 构建最终的WorkflowExportData
	exportData := &workflow.WorkflowExportData{
		WorkflowID:  workflowID,
		Name:        name,
		Description: description,
		Version:     version,
		CreateTime:  currentTime,
		UpdateTime:  currentTime,
		Schema:      schema,
		Nodes:       convertedNodesInterface,
		Edges:       convertedEdgesInterface,
		Metadata: map[string]interface{}{
			"content_type": "0",
			"mode":         "0",
			"creator_id":   "imported_user",
			"space_id":     "imported_space",
		},
		Dependencies: convertedDepsInterface,
		ExportFormat: "json",
	}

	return exportData, nil
}

// extractNodeData 提取节点数据
func extractNodeData(nodeMap map[string]interface{}) map[string]interface{} {
	dataMap := map[string]interface{}{}

	if data, ok := nodeMap["data"].(map[string]interface{}); ok {
		if nodeMeta, ok := data["nodeMeta"]; ok {
			dataMap["nodeMeta"] = nodeMeta
		}
		if outputs, ok := data["outputs"]; ok {
			dataMap["outputs"] = outputs
		}
		if inputs, ok := data["inputs"]; ok {
			dataMap["inputs"] = inputs
		}
		if triggerParams, ok := data["trigger_parameters"]; ok {
			dataMap["trigger_parameters"] = triggerParams
		}
	}

	return dataMap
}

// getStringValue 安全获取字符串值
func getStringValue(m map[string]interface{}, key string) string {
	if val, ok := m[key].(string); ok {
		return val
	}
	return ""
}

// ImportWorkflow 导入工作流
func (w *ApplicationService) ImportWorkflow(ctx context.Context, req *workflow.ImportWorkflowRequest) (*workflow.ImportWorkflowResponse, error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err := safego.NewPanicErr(panicErr, debug.Stack())
			logs.CtxErrorf(ctx, "ImportWorkflow panic: %v", err)
		}
	}()

	// 记录操作日志
	logs.CtxInfof(ctx, "ImportWorkflow started, workflowName=%s, spaceID=%s, creatorID=%s",
		req.WorkflowName, req.SpaceID, req.CreatorID)

	// 验证请求参数
	if req.WorkflowData == "" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow_data is required"))
	}
	if req.WorkflowName == "" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow_name is required"))
	}
	if req.SpaceID == "" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("space_id is required"))
	}
	if req.CreatorID == "" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("creator_id is required"))
	}
	// 验证导入格式
	supportedImportFormats := map[string]bool{
		"json": true,
		"yml":  true,
		"yaml": true,
		"zip":  true, // 支持ZIP格式
	}
	if !supportedImportFormats[req.ImportFormat] {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported import format: %s, supported formats: json, yml, yaml, zip", req.ImportFormat))
	}

	// 验证工作流名称格式
	if !isValidWorkflowName(req.WorkflowName) {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid workflow name format: %s", req.WorkflowName))
	}

	// 验证用户权限（检查工作空间）
	spaceID, err := strconv.ParseInt(req.SpaceID, 10, 64)
	if err != nil {
		logs.CtxErrorf(ctx, "ImportWorkflow failed to parse space_id: %s, error: %v", req.SpaceID, err)
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid space_id: %s", req.SpaceID))
	}

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), spaceID); err != nil {
		logs.CtxErrorf(ctx, "ImportWorkflow permission denied, user=%d, space=%d, error: %v", ctxutil.MustGetUIDFromCtx(ctx), spaceID, err)
		return nil, vo.WrapError(errno.ErrWorkflowOperationFail, fmt.Errorf("permission denied: %v", err))
	}

	// 验证导入格式
	if req.ImportFormat != "json" && req.ImportFormat != "yml" && req.ImportFormat != "yaml" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported import format: %s, supported formats: json, yml, yaml", req.ImportFormat))
	}

	// 解析工作流数据
	exportData, err := w.parseWorkflowData(ctx, req.WorkflowData, req.ImportFormat)
	if err != nil {
		logs.CtxErrorf(ctx, "ImportWorkflow failed to parse workflow data: %v", err)
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	// 验证工作流数据结构
	if exportData.Schema == nil {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid workflow data: missing schema"))
	}

	// 验证工作流名称长度
	if len(req.WorkflowName) > 100 {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow name too long: %d characters (max: 100)", len(req.WorkflowName)))
	}

	// 构建工作流创建请求
	createReq := &workflow.CreateWorkflowRequest{
		Name:    req.WorkflowName,
		Desc:    exportData.Description,
		SpaceID: req.SpaceID,
	}

	// 调用创建工作流服务
	createResp, err := w.CreateWorkflow(ctx, createReq)
	if err != nil {
		logs.CtxErrorf(ctx, "ImportWorkflow failed to create workflow: %v", err)
		return nil, vo.WrapError(errno.ErrWorkflowOperationFail, fmt.Errorf("failed to create workflow: %v", err))
	}

	// 保存工作流架构数据
	canvasData, err := sonic.MarshalString(exportData.Schema)
	if err != nil {
		logs.CtxErrorf(ctx, "ImportWorkflow failed to marshal canvas data: %v", err)
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, fmt.Errorf("failed to marshal canvas data: %v", err))
	}

	// 构建保存工作流请求
	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: createResp.Data.WorkflowID,
		SpaceID:    ptr.Of(req.SpaceID),
		Schema:     ptr.Of(canvasData),
	}

	// 调用保存工作流服务
	_, err = w.SaveWorkflow(ctx, saveReq)
	if err != nil {
		logs.CtxErrorf(ctx, "ImportWorkflow failed to save workflow schema: %v", err)
		return nil, vo.WrapError(errno.ErrWorkflowOperationFail, fmt.Errorf("failed to save workflow schema: %v", err))
	}

	logs.CtxInfof(ctx, "ImportWorkflow completed successfully, workflowID=%s, workflowName=%s",
		createResp.Data.WorkflowID, req.WorkflowName)

	// 构建响应
	return &workflow.ImportWorkflowResponse{
		Code: 200,
		Msg:  "success",
		Data: struct {
			WorkflowID string `json:"workflow_id,omitempty"`
		}{
			WorkflowID: createResp.Data.WorkflowID,
		},
	}, nil
}

// isValidWorkflowName 验证工作流名称格式
func isValidWorkflowName(name string) bool {
	if len(name) < 2 || len(name) > 100 {
		return false
	}

	// 检查是否以字母开头
	if !regexp.MustCompile(`^[a-zA-Z]`).MatchString(name) {
		return false
	}

	// 检查是否只包含字母、数字和下划线
	if !regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_]*$`).MatchString(name) {
		return false
	}

	return true
}

// BatchImportWorkflow 批量导入工作流
func (w *ApplicationService) BatchImportWorkflow(ctx context.Context, req *workflow.BatchImportWorkflowRequest) (*workflow.BatchImportWorkflowResponse, error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err := safego.NewPanicErr(panicErr, debug.Stack())
			logs.CtxErrorf(ctx, "BatchImportWorkflow panic: %v", err)
		}
	}()

	startTime := time.Now()
	logs.CtxInfof(ctx, "BatchImportWorkflow started, fileCount=%d, spaceID=%s, mode=%s",
		len(req.WorkflowFiles), req.SpaceID, req.ImportMode)

	// 1. 参数验证
	if err := w.validateBatchImportRequest(req); err != nil {
		return nil, err
	}

	// 2. 权限验证
	spaceID, err := strconv.ParseInt(req.SpaceID, 10, 64)
	if err != nil {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid space_id: %s", req.SpaceID))
	}

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), spaceID); err != nil {
		return nil, vo.WrapError(errno.ErrWorkflowOperationFail, fmt.Errorf("permission denied: %v", err))
	}

	// 3. 构建导入配置
	config := w.buildBatchImportConfig(req)

	// 4. 预验证所有文件（如果启用）- 改为警告模式，不阻止导入
	if config.ValidateBeforeImport {
		w.preValidateWorkflowFilesWithWarning(ctx, req.WorkflowFiles)
	}

	// 5. 执行批量导入
	results, err := w.executeBatchImport(ctx, req, config)
	if err != nil {
		return nil, err
	}

	// 6. 构建响应
	endTime := time.Now()
	response := w.buildBatchImportResponse(results, startTime, endTime, config, req.WorkflowFiles)

	logs.CtxInfof(ctx, "BatchImportWorkflow completed, total=%d, success=%d, failed=%d, duration=%dms",
		response.Data.TotalCount, response.Data.SuccessCount, response.Data.FailedCount, response.Data.ImportSummary.Duration)

	return response, nil
}

// validateBatchImportRequest 验证批量导入请求参数
func (w *ApplicationService) validateBatchImportRequest(req *workflow.BatchImportWorkflowRequest) error {
	if len(req.WorkflowFiles) == 0 {
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow_files cannot be empty"))
	}

	// 验证导入格式
	supportedImportFormats := map[string]bool{
		"json":  true,
		"yml":   true,
		"yaml":  true,
		"zip":   true, // 支持ZIP格式
		"mixed": true, // 支持混合格式
	}
	if !supportedImportFormats[req.ImportFormat] {
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported import format: %s, supported formats: json, yml, yaml, zip, mixed", req.ImportFormat))
	}

	// 限制批量导入数量
	maxBatchSize := 50 // 最大批量导入数量
	if len(req.WorkflowFiles) > maxBatchSize {
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("too many files: %d (max: %d)", len(req.WorkflowFiles), maxBatchSize))
	}

	if req.SpaceID == "" {
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("space_id is required"))
	}

	if req.CreatorID == "" {
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("creator_id is required"))
	}

	// 验证导入格式（重复验证，已在上面的supportedImportFormats中处理）

	// 验证导入模式
	if req.ImportMode != "" && req.ImportMode != string(workflow.BatchImportModeBatch) && req.ImportMode != string(workflow.BatchImportModeTransaction) {
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid import mode: %s", req.ImportMode))
	}

	// 验证每个文件
	nameSet := make(map[string]bool)
	for i, file := range req.WorkflowFiles {
		if file.FileName == "" {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("file_name is required for file %d", i))
		}
		if file.WorkflowData == "" {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow_data is required for file %d", i))
		}
		if file.WorkflowName == "" {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("workflow_name is required for file %d", i))
		}

		// 验证工作流名称格式
		if !isValidWorkflowName(file.WorkflowName) {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid workflow name format: %s for file %s", file.WorkflowName, file.FileName))
		}

		// 检查名称重复
		if nameSet[file.WorkflowName] {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("duplicate workflow name: %s", file.WorkflowName))
		}
		nameSet[file.WorkflowName] = true
	}

	return nil
}
func IsChatFlow(wf *entity.Workflow) bool {
	if wf == nil || wf.ID == 0 {
		return false
	}
	return wf.Meta.Mode == workflow.WorkflowMode_ChatFlow
}

func (w *ApplicationService) CreateChatFlowRole(ctx context.Context, req *workflow.CreateChatFlowRoleRequest) (
	_ *workflow.CreateChatFlowRoleResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.MustGetUIDFromCtx(ctx)
	wf, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetChatFlowRole().GetWorkflowID()),
		MetaOnly: true,
	})

	if err != nil {
		return nil, err
	}
	if err = checkUserSpace(ctx, uID, wf.Meta.SpaceID); err != nil {
		return nil, err
	}

	role := req.GetChatFlowRole()

	if !IsChatFlow(wf) {
		logs.CtxWarnf(ctx, "CreateChatFlowRole not chat flow, workflowID: %d", wf.ID)
		return nil, vo.WrapError(errno.ErrChatFlowRoleOperationFail, fmt.Errorf("workflow %d is not a chat flow", wf.ID))
	}

	oldRole, err := GetWorkflowDomainSVC().GetChatFlowRole(ctx, mustParseInt64(role.WorkflowID), "")
	if err != nil {
		return nil, err
	}

	var roleID int64
	if oldRole != nil {
		role.ID = strconv.FormatInt(oldRole.ID, 10)
		roleID = oldRole.ID
	}

	if role.GetID() == "" || role.GetID() == "0" {
		chatFlowRole := &vo.ChatFlowRoleCreate{
			WorkflowID: mustParseInt64(role.WorkflowID),
			CreatorID:  uID,
		}
		if err = w.populateChatFlowRoleFields(role, chatFlowRole); err != nil {
			return nil, err
		}
		roleID, err = GetWorkflowDomainSVC().CreateChatFlowRole(ctx, chatFlowRole)
		if err != nil {
			return nil, err
		}

	} else {
		chatFlowRole := &vo.ChatFlowRoleUpdate{
			WorkflowID: mustParseInt64(role.WorkflowID),
		}

		if err = w.populateChatFlowRoleFields(role, chatFlowRole); err != nil {
			return nil, err
		}

		err = GetWorkflowDomainSVC().UpdateChatFlowRole(ctx, chatFlowRole.WorkflowID, chatFlowRole)
		if err != nil {
			return nil, err
		}
	}

	return &workflow.CreateChatFlowRoleResponse{
		ID: strconv.FormatInt(roleID, 10),
	}, nil
}

func (w *ApplicationService) DeleteChatFlowRole(ctx context.Context, req *workflow.DeleteChatFlowRoleRequest) (
	_ *workflow.DeleteChatFlowRoleResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.MustGetUIDFromCtx(ctx)
	wf, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}
	if err = checkUserSpace(ctx, uID, wf.Meta.SpaceID); err != nil {
		return nil, err
	}

	err = GetWorkflowDomainSVC().DeleteChatFlowRole(ctx, mustParseInt64(req.ID), mustParseInt64(req.WorkflowID))
	if err != nil {
		return nil, err
	}

	return &workflow.DeleteChatFlowRoleResponse{}, nil
}

func (w *ApplicationService) GetChatFlowRole(ctx context.Context, req *workflow.GetChatFlowRoleRequest) (
	_ *workflow.GetChatFlowRoleResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.MustGetUIDFromCtx(ctx)
	wf, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}
	if err = checkUserSpace(ctx, uID, wf.Meta.SpaceID); err != nil {
		return nil, err
	}

	if !IsChatFlow(wf) {
		logs.CtxWarnf(ctx, "GetChatFlowRole not chat flow, workflowID: %d", wf.ID)
		return nil, vo.WrapError(errno.ErrChatFlowRoleOperationFail, fmt.Errorf("workflow %d is not a chat flow", wf.ID))
	}

	var version string
	if wf.Meta.AppID != nil {
		if vl, err := GetWorkflowDomainSVC().GetWorkflowVersionsByConnector(ctx, mustParseInt64(req.GetConnectorID()), wf.ID, 1); err != nil {
			return nil, err
		} else if len(vl) > 0 {
			version = vl[0]
		}

	}

	role, err := GetWorkflowDomainSVC().GetChatFlowRole(ctx, mustParseInt64(req.WorkflowID), version)
	if err != nil {
		return nil, err
	}

	if role == nil {
		logs.CtxWarnf(ctx, "GetChatFlowRole role nil, workflowID: %d", wf.ID)
		// Return nil for the error to align with the production behavior,
		// where the GET API may be called before the CREATE API during chatflow creation.
		return &workflow.GetChatFlowRoleResponse{}, nil
	}

	wfRole, err := w.convertChatFlowRole(ctx, role)

	if err != nil {
		return nil, fmt.Errorf("failed to get chat flow role config, internal data processing error: %+v", err)
	}

	return &workflow.GetChatFlowRoleResponse{
		Role: wfRole,
	}, nil
}

func (w *ApplicationService) convertChatFlowRole(ctx context.Context, role *entity.ChatFlowRole) (*workflow.ChatFlowRole, error) {
	var err error
	res := &workflow.ChatFlowRole{
		ID:          strconv.FormatInt(role.ID, 10),
		WorkflowID:  strconv.FormatInt(role.WorkflowID, 10),
		Name:        ptr.Of(role.Name),
		Description: ptr.Of(role.Description),
	}

	if role.AvatarUri != "" {
		url, err := w.ImageX.GetResourceURL(ctx, role.AvatarUri)
		if err != nil {
			return nil, err
		}
		res.Avatar = &workflow.AvatarConfig{
			ImageUri: role.AvatarUri,
			ImageUrl: url.URL,
		}
	}

	if role.AudioConfig != "" {
		err = sonic.UnmarshalString(role.AudioConfig, &res.AudioConfig)
		if err != nil {
			logs.CtxErrorf(ctx, "GetChatFlowRole AudioConfig UnmarshalString err: %+v", err)
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}

	if role.OnboardingInfo != "" {
		err = sonic.UnmarshalString(role.OnboardingInfo, &res.OnboardingInfo)
		if err != nil {
			logs.CtxErrorf(ctx, "GetChatFlowRole OnboardingInfo UnmarshalString err: %+v", err)
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}

	if role.SuggestReplyInfo != "" {
		err = sonic.UnmarshalString(role.SuggestReplyInfo, &res.SuggestReplyInfo)
		if err != nil {
			logs.CtxErrorf(ctx, "GetChatFlowRole SuggestReplyInfo UnmarshalString err: %+v", err)
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}

	if role.UserInputConfig != "" {
		err = sonic.UnmarshalString(role.UserInputConfig, &res.UserInputConfig)
		if err != nil {
			logs.CtxErrorf(ctx, "GetChatFlowRole UserInputConfig UnmarshalString err: %+v", err)
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}

	if role.BackgroundImageInfo != "" {
		res.BackgroundImageInfo = &workflow.BackgroundImageInfo{}
		err = sonic.UnmarshalString(role.BackgroundImageInfo, res.BackgroundImageInfo)
		if err != nil {
			logs.CtxErrorf(ctx, "GetChatFlowRole BackgroundImageInfo UnmarshalString err: %+v", err)
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
		if res.BackgroundImageInfo != nil {
			if res.BackgroundImageInfo.WebBackgroundImage != nil && res.BackgroundImageInfo.WebBackgroundImage.OriginImageUri != nil {
				url, err := w.ImageX.GetResourceURL(ctx, res.BackgroundImageInfo.WebBackgroundImage.GetOriginImageUri())
				if err != nil {
					logs.CtxErrorf(ctx, "get url by uri err, err:%s", err.Error())
					return nil, err
				}
				res.BackgroundImageInfo.WebBackgroundImage.ImageUrl = &url.URL
			}

			if res.BackgroundImageInfo.MobileBackgroundImage != nil && res.BackgroundImageInfo.MobileBackgroundImage.OriginImageUri != nil {
				url, err := w.ImageX.GetResourceURL(ctx, res.BackgroundImageInfo.MobileBackgroundImage.GetOriginImageUri())
				if err != nil {
					logs.CtxErrorf(ctx, "get url by uri err, err:%s", err.Error())
					return nil, err
				}
				res.BackgroundImageInfo.MobileBackgroundImage.ImageUrl = &url.URL
			}
		}
	}

	return res, nil
}

func (w *ApplicationService) OpenAPIGetWorkflowInfo(ctx context.Context, req *workflow.OpenAPIGetWorkflowInfoRequest) (
	_ *workflow.OpenAPIGetWorkflowInfoResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	uID := ctxutil.GetApiAuthFromCtx(ctx).UserID
	wf, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}
	if err = checkUserSpace(ctx, uID, wf.Meta.SpaceID); err != nil {
		return nil, err
	}

	if !IsChatFlow(wf) {
		logs.CtxWarnf(ctx, "GetChatFlowRole not chat flow, workflowID: %d", wf.ID)
		return nil, vo.WrapError(errno.ErrChatFlowRoleOperationFail, fmt.Errorf("workflow %d is not a chat flow", wf.ID))
	}

	var version string
	if wf.Meta.AppID != nil {
		if vl, err := GetWorkflowDomainSVC().GetWorkflowVersionsByConnector(ctx, mustParseInt64(req.GetConnectorID()), wf.ID, 1); err != nil {
			return nil, err
		} else if len(vl) > 0 {
			version = vl[0]
		}
	}

	role, err := GetWorkflowDomainSVC().GetChatFlowRole(ctx, mustParseInt64(req.WorkflowID), version)
	if err != nil {
		return nil, err
	}

	if role == nil {
		logs.CtxWarnf(ctx, "GetChatFlowRole role nil, workflowID: %d", wf.ID)
		// Return nil for the error to align with the production behavior,
		// where the GET API may be called before the CREATE API during chatflow creation.
		return &workflow.OpenAPIGetWorkflowInfoResponse{}, nil
	}

	wfRole, err := w.convertChatFlowRole(ctx, role)

	if err != nil {
		return nil, fmt.Errorf("failed to get chat flow role config, internal data processing error: %+v", err)
	}

	return &workflow.OpenAPIGetWorkflowInfoResponse{
		WorkflowInfo: &workflow.WorkflowInfo{
			Role: wfRole,
		},
	}, nil
}

// buildBatchImportConfig 构建批量导入配置
func (w *ApplicationService) buildBatchImportConfig(req *workflow.BatchImportWorkflowRequest) workflow.BatchImportConfig {
	config := workflow.BatchImportConfig{
		ImportMode:           req.ImportMode,
		MaxConcurrency:       5, // 最大并发数
		ContinueOnError:      true,
		ValidateBeforeImport: true,
	}

	// 设置默认导入模式
	if config.ImportMode == "" {
		config.ImportMode = string(workflow.BatchImportModeBatch)
	}

	// 事务模式不允许在出错时继续
	if config.ImportMode == string(workflow.BatchImportModeTransaction) {
		config.ContinueOnError = false
	}

	return config
}

// preValidateWorkflowFiles 预验证所有工作流文件
func (w *ApplicationService) preValidateWorkflowFiles(ctx context.Context, files []workflow.WorkflowFileData) error {
	for i, file := range files {
		// 根据文件名确定格式
		fileName := strings.ToLower(file.FileName)
		var format string
		if strings.HasSuffix(fileName, ".yml") {
			format = "yml"
		} else if strings.HasSuffix(fileName, ".yaml") {
			format = "yaml"
		} else if strings.HasSuffix(fileName, ".zip") {
			format = "zip"
		} else {
			format = "json"
		}

		// 对于ZIP文件，数据是base64编码的，需要特殊处理
		if format == "zip" {
			// ZIP文件验证：检查是否为有效的base64数据
			if _, err := base64.StdEncoding.DecodeString(file.WorkflowData); err != nil {
				return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("file %d (%s): invalid base64 ZIP data: %v", i, file.FileName, err))
			}
			// 暂时跳过ZIP文件的详细验证，在实际导入时再进行
			continue
		}

		exportData, err := w.parseWorkflowData(ctx, file.WorkflowData, format)
		if err != nil {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("file %d (%s): invalid %s format: %v", i, file.FileName, format, err))
		}

		// 验证工作流数据结构
		if exportData.Schema == nil {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("file %d (%s): missing schema", i, file.FileName))
		}

		if exportData.Nodes == nil {
			return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("file %d (%s): missing nodes", i, file.FileName))
		}
	}

	return nil
}

// preValidateWorkflowFilesWithWarning 预验证所有工作流文件（警告模式，不阻断导入）
func (w *ApplicationService) preValidateWorkflowFilesWithWarning(ctx context.Context, files []workflow.WorkflowFileData) {
	for i, file := range files {
		// 根据文件名确定格式
		fileName := strings.ToLower(file.FileName)
		var format string
		if strings.HasSuffix(fileName, ".yml") {
			format = "yml"
		} else if strings.HasSuffix(fileName, ".yaml") {
			format = "yaml"
		} else if strings.HasSuffix(fileName, ".zip") {
			format = "zip"
		} else {
			format = "json"
		}

		// 对于ZIP文件，数据是base64编码的，需要特殊处理
		if format == "zip" {
			// ZIP文件验证：检查是否为有效的base64数据
			if _, err := base64.StdEncoding.DecodeString(file.WorkflowData); err != nil {
				logs.CtxWarnf(ctx, "File %d (%s): invalid base64 ZIP data: %v", i, file.FileName, err)
				continue
			}
			// 暂时跳过ZIP文件的详细验证，在实际导入时再进行
			continue
		}

		exportData, err := w.parseWorkflowData(ctx, file.WorkflowData, format)
		if err != nil {
			logs.CtxWarnf(ctx, "File %d (%s): invalid %s format: %v", i, file.FileName, format, err)
			continue
		}

		// 验证工作流数据结构
		if exportData.Schema == nil {
			logs.CtxWarnf(ctx, "File %d (%s): missing schema", i, file.FileName)
			continue
		}

		if exportData.Nodes == nil {
			logs.CtxWarnf(ctx, "File %d (%s): missing nodes", i, file.FileName)
			continue
		}
	}
}

// executeBatchImport 执行批量导入
func (w *ApplicationService) executeBatchImport(ctx context.Context, req *workflow.BatchImportWorkflowRequest, config workflow.BatchImportConfig) ([]BatchImportResult, error) {
	if config.ImportMode == string(workflow.BatchImportModeTransaction) {
		// 事务模式：所有文件在同一事务中处理
		return w.executeBatchImportTransaction(ctx, req, config)
	} else {
		// 批量模式：每个文件独立处理
		return w.executeBatchImportParallel(ctx, req, config)
	}
}

// BatchImportResult 批量导入结果内部结构
type BatchImportResult struct {
	Index        int
	Success      bool
	WorkflowID   string
	NodeCount    int
	EdgeCount    int
	ErrorCode    int64
	ErrorMessage string
	FailReason   workflow.FailReason
}

// executeBatchImportParallel 并发执行批量导入
func (w *ApplicationService) executeBatchImportParallel(ctx context.Context, req *workflow.BatchImportWorkflowRequest, config workflow.BatchImportConfig) ([]BatchImportResult, error) {
	results := make([]BatchImportResult, len(req.WorkflowFiles))

	// 使用信号量控制并发数
	sem := make(chan struct{}, config.MaxConcurrency)
	var wg sync.WaitGroup

	for i, file := range req.WorkflowFiles {
		wg.Add(1)
		go func(index int, fileData workflow.WorkflowFileData) {
			defer wg.Done()
			sem <- struct{}{}        // 获取信号量
			defer func() { <-sem }() // 释放信号量

			result := w.importSingleWorkflow(ctx, fileData, req.SpaceID, req.CreatorID, "")
			result.Index = index
			results[index] = result
		}(i, file)
	}

	wg.Wait()
	return results, nil
}

// executeBatchImportTransaction 事务模式批量导入
func (w *ApplicationService) executeBatchImportTransaction(ctx context.Context, req *workflow.BatchImportWorkflowRequest, config workflow.BatchImportConfig) ([]BatchImportResult, error) {
	// 在事务中导入所有工作流
	results := make([]BatchImportResult, len(req.WorkflowFiles))
	createdWorkflowIDs := make([]string, 0)

	// 创建所有工作流
	for i, file := range req.WorkflowFiles {
		result := w.importSingleWorkflow(ctx, file, req.SpaceID, req.CreatorID, "")
		result.Index = i
		results[i] = result

		if !result.Success {
			// 如果任何一个失败，回滚所有已创建的工作流
			w.rollbackBatchCreatedWorkflows(ctx, createdWorkflowIDs)
			return results, nil
		}

		createdWorkflowIDs = append(createdWorkflowIDs, result.WorkflowID)
	}

	return results, nil
}

// importSingleWorkflow 导入单个工作流
func (w *ApplicationService) importSingleWorkflow(ctx context.Context, file workflow.WorkflowFileData, spaceID, creatorID, format string) BatchImportResult {
	result := BatchImportResult{Success: false}

	logs.CtxInfof(ctx, "Starting import for file: %s, workflow: %s", file.FileName, file.WorkflowName)

	// 1. 根据文件名确定格式（如果传入的format为空）
	if format == "" {
		fileName := strings.ToLower(file.FileName)
		if strings.HasSuffix(fileName, ".yml") {
			format = "yml"
		} else if strings.HasSuffix(fileName, ".yaml") {
			format = "yaml"
		} else if strings.HasSuffix(fileName, ".zip") {
			format = "zip"
		} else {
			format = "json"
		}
	}

	logs.CtxDebugf(ctx, "Detected format: %s for file: %s", format, file.FileName)

	// 2. 解析工作流数据
	exportData, err := w.parseWorkflowData(ctx, file.WorkflowData, format)
	if err != nil {
		result.ErrorCode = int64(errno.ErrSerializationDeserializationFail)
		result.ErrorMessage = fmt.Sprintf(getLocalizedMessage(ctx, "file_parse_failed"), file.FileName, err)
		result.FailReason = workflow.FailReasonInvalidFormat
		logs.CtxErrorf(ctx, "Failed to parse file %s: %v", file.FileName, err)
		return result
	}

	// 3. 验证数据结构
	if exportData.Schema == nil || exportData.Nodes == nil {
		result.ErrorCode = int64(errno.ErrInvalidParameter)
		result.ErrorMessage = fmt.Sprintf(getLocalizedMessage(ctx, "file_missing_schema_nodes"), file.FileName)
		result.FailReason = workflow.FailReasonInvalidData
		logs.CtxErrorf(ctx, "Invalid data structure in file %s: missing schema or nodes", file.FileName)
		return result
	}

	logs.CtxDebugf(ctx, "File %s parsed successfully, nodes: %d, edges: %d",
		file.FileName, len(exportData.Nodes), len(exportData.Edges))

	// 4. 创建工作流
	createReq := &workflow.CreateWorkflowRequest{
		Name:    file.WorkflowName,
		Desc:    exportData.Description,
		SpaceID: spaceID,
	}

	createResp, err := w.CreateWorkflow(ctx, createReq)
	if err != nil {
		result.ErrorCode = int64(errno.ErrWorkflowOperationFail)
		result.ErrorMessage = fmt.Sprintf("文件 %s 创建工作流失败：%v", file.FileName, err)
		result.FailReason = workflow.FailReasonSystemError
		logs.CtxErrorf(ctx, "Failed to create workflow for file %s: %v", file.FileName, err)
		return result
	}

	logs.CtxDebugf(ctx, "Workflow created successfully for file %s, ID: %s",
		file.FileName, createResp.Data.WorkflowID)

	// 5. 保存工作流架构
	canvasData, err := sonic.MarshalString(exportData.Schema)
	if err != nil {
		w.rollbackCreatedWorkflow(ctx, createResp.Data.WorkflowID)
		result.ErrorCode = int64(errno.ErrSerializationDeserializationFail)
		result.ErrorMessage = fmt.Sprintf("文件 %s 序列化工作流架构失败：%v", file.FileName, err)
		result.FailReason = workflow.FailReasonSystemError
		logs.CtxErrorf(ctx, "Failed to marshal schema for file %s: %v", file.FileName, err)
		return result
	}

	saveReq := &workflow.SaveWorkflowRequest{
		WorkflowID: createResp.Data.WorkflowID,
		SpaceID:    ptr.Of(spaceID),
		Schema:     ptr.Of(canvasData),
	}

	_, err = w.SaveWorkflow(ctx, saveReq)
	if err != nil {
		w.rollbackCreatedWorkflow(ctx, createResp.Data.WorkflowID)
		result.ErrorCode = int64(errno.ErrWorkflowOperationFail)
		result.ErrorMessage = fmt.Sprintf("文件 %s 保存工作流架构失败：%v", file.FileName, err)
		result.FailReason = workflow.FailReasonSystemError
		logs.CtxErrorf(ctx, "Failed to save workflow schema for file %s: %v", file.FileName, err)
		return result
	}

	// 6. 成功
	result.Success = true
	result.WorkflowID = createResp.Data.WorkflowID
	result.NodeCount = len(exportData.Nodes)
	result.EdgeCount = len(exportData.Edges)

	logs.CtxInfof(ctx, "Successfully imported file %s as workflow %s (ID: %s)",
		file.FileName, file.WorkflowName, result.WorkflowID)

	return result
}

// rollbackCreatedWorkflow 回滚单个创建的工作流
func (w *ApplicationService) rollbackCreatedWorkflow(ctx context.Context, workflowID string) {
	if workflowID == "" {
		return
	}

	id, err := strconv.ParseInt(workflowID, 10, 64)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to parse workflow ID for rollback: %s, error: %v", workflowID, err)
		return
	}

	if _, err := w.DomainSVC.Delete(ctx, &vo.DeletePolicy{ID: &id}); err != nil {
		logs.CtxErrorf(ctx, "Failed to rollback workflow creation: %d, error: %v", id, err)
	} else {
		logs.CtxInfof(ctx, "Successfully rolled back workflow creation: %d", id)
	}
}

// rollbackBatchCreatedWorkflows 回滚批量创建的工作流
func (w *ApplicationService) rollbackBatchCreatedWorkflows(ctx context.Context, workflowIDs []string) {
	for _, workflowID := range workflowIDs {
		w.rollbackCreatedWorkflow(ctx, workflowID)
	}
}

// buildBatchImportResponse 构建批量导入响应
func (w *ApplicationService) buildBatchImportResponse(results []BatchImportResult, startTime, endTime time.Time, config workflow.BatchImportConfig, files []workflow.WorkflowFileData) *workflow.BatchImportWorkflowResponse {
	successList := make([]workflow.WorkflowImportResult, 0)
	failedList := make([]workflow.WorkflowImportFailedResult, 0)
	errorStats := make(map[string]int)

	totalNodes := 0
	totalEdges := 0
	totalSize := int64(0)
	nodeTypes := make(map[string]bool)

	for _, result := range results {
		file := files[result.Index]

		if result.Success {
			successList = append(successList, workflow.WorkflowImportResult{
				FileName:     file.FileName,
				WorkflowName: file.WorkflowName,
				WorkflowID:   result.WorkflowID,
				NodeCount:    result.NodeCount,
				EdgeCount:    result.EdgeCount,
			})
			totalNodes += result.NodeCount
			totalEdges += result.EdgeCount
		} else {
			failedList = append(failedList, workflow.WorkflowImportFailedResult{
				FileName:     file.FileName,
				WorkflowName: file.WorkflowName,
				ErrorCode:    result.ErrorCode,
				ErrorMessage: result.ErrorMessage,
				FailReason:   string(result.FailReason),
			})
			errorStats[string(result.FailReason)]++
		}

		totalSize += int64(len(file.WorkflowData))
	}

	// 构建资源信息
	resourceInfo := workflow.BatchImportResourceInfo{
		TotalFiles:      len(files),
		TotalSize:       totalSize,
		TotalNodes:      totalNodes,
		TotalEdges:      totalEdges,
		UniqueNodeTypes: make([]string, 0, len(nodeTypes)),
	}

	for nodeType := range nodeTypes {
		resourceInfo.UniqueNodeTypes = append(resourceInfo.UniqueNodeTypes, nodeType)
	}

	// 构建导入摘要
	summary := workflow.ImportSummary{
		StartTime:    startTime.Unix(),
		EndTime:      endTime.Unix(),
		Duration:     endTime.Sub(startTime).Milliseconds(),
		ErrorStats:   errorStats,
		ImportConfig: config,
		ResourceInfo: resourceInfo,
	}

	return &workflow.BatchImportWorkflowResponse{
		Code: 200,
		Msg:  "success",
		Data: workflow.BatchImportResponseData{
			TotalCount:    len(results),
			SuccessCount:  len(successList),
			FailedCount:   len(failedList),
			SuccessList:   successList,
			FailedList:    failedList,
			ImportSummary: summary,
		},
	}
}
