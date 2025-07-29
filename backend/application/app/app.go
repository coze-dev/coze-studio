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

package app

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"sync"
	"time"

	"github.com/google/uuid"

	connectorModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/connector"
	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	pluginModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	intelligenceAPI "github.com/coze-dev/coze-studio/backend/api/model/intelligence"
	"github.com/coze-dev/coze-studio/backend/api/model/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/playground"
	workflowAPI "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	projectAPI "github.com/coze-dev/coze-studio/backend/api/model/project"
	"github.com/coze-dev/coze-studio/backend/api/model/project_memory"
	publishAPI "github.com/coze-dev/coze-studio/backend/api/model/publish"
	resourceAPI "github.com/coze-dev/coze-studio/backend/api/model/resource"
	resourceCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	taskAPI "github.com/coze-dev/coze-studio/backend/api/model/task"
	taskStruct "github.com/coze-dev/coze-studio/backend/api/model/task_struct"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/knowledge"
	"github.com/coze-dev/coze-studio/backend/application/memory"
	"github.com/coze-dev/coze-studio/backend/application/plugin"
	"github.com/coze-dev/coze-studio/backend/application/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/repository"
	"github.com/coze-dev/coze-studio/backend/domain/app/service"
	connector "github.com/coze-dev/coze-studio/backend/domain/connector/service"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var APPApplicationSVC = &APPApplicationService{}

type APPApplicationService struct {
	DomainSVC service.AppService
	appRepo   repository.AppRepository

	oss             storage.Storage
	projectEventBus search.ProjectEventBus
	modelMgr        modelmgr.Manager

	userSVC user.User

	connectorSVC connector.Connector
	variablesSVC variables.Variables
}

func (a *APPApplicationService) DraftProjectCreate(ctx context.Context, req *projectAPI.DraftProjectCreateRequest) (resp *projectAPI.DraftProjectCreateResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV(errno.APPMsgKey, "session is required"))
	}

	respModel, err := a.modelMgr.ListInUseModel(ctx, 1, nil)
	if err != nil {
		return nil, err
	}

	if len(respModel.ModelList) == 0 {
		return nil, errorx.New(errno.ErrAppNoModelInUseCode)
	}

	appID, err := a.DomainSVC.CreateDraftAPP(ctx, &service.CreateDraftAPPRequest{
		SpaceID: req.SpaceID,
		OwnerID: *userID,
		IconURI: req.IconURI,
		Name:    req.Name,
		Desc:    req.Description,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftAPP failed, spaceID=%d", req.SpaceID)
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Created,
		Project: &searchEntity.ProjectDocument{
			Status:  common.IntelligenceStatus_Using,
			Type:    common.IntelligenceType_Project,
			ID:      appID,
			SpaceID: &req.SpaceID,
			OwnerID: userID,
			Name:    &req.Name,
		},
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish project '%d' failed", appID)
	}

	resp = &projectAPI.DraftProjectCreateResponse{
		Data: &projectAPI.DraftProjectCreateData{
			ProjectID: appID,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) GetDraftIntelligenceInfo(ctx context.Context, req *intelligenceAPI.GetDraftIntelligenceInfoRequest) (resp *intelligenceAPI.GetDraftIntelligenceInfoResponse, err error) {
	draftAPP, err := a.ValidateDraftAPPAccess(ctx, req.IntelligenceID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftAPP failed, id=%d", req.IntelligenceID)
	}

	basicInfo, published, err := a.getAPPBasicInfo(ctx, draftAPP)
	if err != nil {
		return nil, err
	}

	publishRecord := &intelligenceAPI.IntelligencePublishInfo{
		HasPublished: published,
		PublishTime:  strconv.FormatInt(basicInfo.PublishTime, 10),
	}

	ownerInfo := a.getAPPUserInfo(ctx, draftAPP.OwnerID)

	resp = &intelligenceAPI.GetDraftIntelligenceInfoResponse{
		Data: &intelligenceAPI.GetDraftIntelligenceInfoData{
			IntelligenceType: common.IntelligenceType_Project,
			BasicInfo:        basicInfo,
			PublishInfo:      publishRecord,
			OwnerInfo:        ownerInfo,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) DraftProjectDelete(ctx context.Context, req *projectAPI.DraftProjectDeleteRequest) (resp *projectAPI.DraftProjectDeleteResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	err = a.DomainSVC.DeleteDraftAPP(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "DeleteDraftAPP failed, id=%d", req.ProjectID)
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Deleted,
		Project: &searchEntity.ProjectDocument{
			ID:   req.ProjectID,
			Type: common.IntelligenceType_Project,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish project '%d' failed, err=%v", req.ProjectID, err)
	}

	safego.Go(ctx, func() {
		// When an app is deleted, resource deletion is currently handled as a weak dependency, meaning some resources might not be deleted, but they will be inaccessible to the user.
		// TODO:: Application resources need to check the deletion status of the application
		a.deleteAPPResources(ctx, req.ProjectID)
	})

	resp = &projectAPI.DraftProjectDeleteResponse{}

	return resp, nil
}

func (a *APPApplicationService) deleteAPPResources(ctx context.Context, appID int64) {
	err := plugin.PluginApplicationSVC.DeleteAPPAllPlugins(ctx, appID)
	if err != nil {
		logs.CtxErrorf(ctx, "delete app '%d' plugins failed, err=%v", appID, err)
	}

	err = memory.DatabaseApplicationSVC.DeleteDatabaseByAppID(ctx, appID)
	if err != nil {
		logs.CtxErrorf(ctx, "delete app '%d' databases failed, err=%v", appID, err)
	}

	err = a.variablesSVC.DeleteAllVariable(ctx, project_memory.VariableConnector_Project, conv.Int64ToStr(appID))
	if err != nil {
		logs.CtxErrorf(ctx, "delete app '%d' variables failed, err=%v", appID, err)
	}

	err = knowledge.KnowledgeSVC.DeleteAppKnowledge(ctx, &knowledge.DeleteAppKnowledgeRequest{AppID: appID})
	if err != nil {
		logs.CtxErrorf(ctx, "delete app '%d' knowledge failed, err=%v", appID, err)
	}

	err = workflow.SVC.DeleteWorkflowsByAppID(ctx, appID)
	if err != nil {
		logs.CtxErrorf(ctx, "delete app '%d' workflow failed, err=%v", appID, err)
	}
}

func (a *APPApplicationService) DraftProjectUpdate(ctx context.Context, req *projectAPI.DraftProjectUpdateRequest) (resp *projectAPI.DraftProjectUpdateResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	err = a.DomainSVC.UpdateDraftAPP(ctx, &service.UpdateDraftAPPRequest{
		APPID:   req.ProjectID,
		Name:    req.Name,
		Desc:    req.Description,
		IconURI: req.IconURI,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "UpdateDraftAPP failed, id=%d", req.ProjectID)
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:   req.ProjectID,
			Type: common.IntelligenceType_Project,
			Name: req.Name,
		},
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish project '%d' failed", req.ProjectID)
	}

	resp = &projectAPI.DraftProjectUpdateResponse{}

	return resp, nil
}

func (a *APPApplicationService) ProjectPublishConnectorList(ctx context.Context, req *publishAPI.PublishConnectorListRequest) (resp *publishAPI.PublishConnectorListResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	connectorList, err := a.getAPPPublishConnectorList(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}

	latestPublishRecord, err := a.getLatestPublishRecord(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}

	resp = &publishAPI.PublishConnectorListResponse{
		Data: &publishAPI.PublishConnectorListData{
			ConnectorList:         connectorList,
			LastPublishInfo:       latestPublishRecord,
			ConnectorUnionInfoMap: map[int64]*publishAPI.ConnectorUnionInfo{},
		},
	}

	return resp, nil
}

func (a *APPApplicationService) getAPPPublishConnectorList(ctx context.Context, appID int64) ([]*publishAPI.PublishConnectorInfo, error) {
	res, err := a.DomainSVC.GetPublishConnectorList(ctx, &service.GetPublishConnectorListRequest{})
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPublishConnectorList failed, appID=%d", appID)
	}

	hasWorkflow, err := workflow.SVC.CheckWorkflowsExistByAppID(ctx, appID)
	if err != nil {
		return nil, errorx.Wrapf(err, "CheckWorkflowsExistByAppID failed, appID=%d", appID)
	}

	connectorList := make([]*publishAPI.PublishConnectorInfo, 0, len(res.Connectors))
	for _, c := range res.Connectors {
		var info *publishAPI.PublishConnectorInfo

		switch c.ID {
		case consts.APIConnectorID:
			info, err = a.packAPIConnectorInfo(ctx, c, hasWorkflow)
			if err != nil {
				return nil, err
			}
		default:
			logs.CtxWarnf(ctx, "unsupported connector id '%v'", c.ID)
			continue
		}

		connectorList = append(connectorList, info)
	}

	return connectorList, nil
}

func (a *APPApplicationService) packAPIConnectorInfo(ctx context.Context, c *connectorModel.Connector, hasWorkflow bool) (*publishAPI.PublishConnectorInfo, error) {
	const noWorkflowText = "请在应用内至少添加一个工作流"

	info := &publishAPI.PublishConnectorInfo{
		ID:                      c.ID,
		BindType:                publishAPI.ConnectorBindType_ApiBind,
		ConnectorClassification: publishAPI.ConnectorClassification_APIOrSDK,
		BindInfo:                map[string]string{},
		Name:                    c.Name,
		IconURL:                 c.URL,
		Description:             c.Desc,
		AllowPublish:            true,
	}

	if hasWorkflow {
		return info, nil
	}

	info.AllowPublish = false
	info.NotAllowPublishReason = ptr.Of(noWorkflowText)

	return info, nil
}

func (a *APPApplicationService) getLatestPublishRecord(ctx context.Context, appID int64) (info *publishAPI.LastPublishInfo, err error) {
	record, exist, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:  appID,
		Oldest: false,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAPPPublishRecord failed, appID=%d", appID)
	}
	if !exist {
		return &publishAPI.LastPublishInfo{
			VersionNumber:          "",
			ConnectorIds:           []int64{},
			ConnectorPublishConfig: map[int64]*publishAPI.ConnectorPublishConfig{},
		}, nil
	}

	latestRecord := &publishAPI.LastPublishInfo{
		VersionNumber:          record.APP.GetVersion(),
		ConnectorIds:           []int64{},
		ConnectorPublishConfig: map[int64]*publishAPI.ConnectorPublishConfig{},
	}

	for _, r := range record.ConnectorPublishRecords {
		latestRecord.ConnectorIds = append(latestRecord.ConnectorIds, r.ConnectorID)
	}

	return latestRecord, nil
}

func (a *APPApplicationService) ReportUserBehavior(ctx context.Context, req *playground.ReportUserBehaviorRequest) (resp *playground.ReportUserBehaviorResponse, err error) {
	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:             req.ResourceID,
			SpaceID:        req.SpaceID,
			Type:           common.IntelligenceType_Project,
			IsRecentlyOpen: ptr.Of(1),
			RecentlyOpenMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxWarnf(ctx, "publish project '%d' event failed err=%s", req.ResourceID, err)
	}

	return &playground.ReportUserBehaviorResponse{}, nil
}

func (a *APPApplicationService) CheckProjectVersionNumber(ctx context.Context, req *publishAPI.CheckProjectVersionNumberRequest) (resp *publishAPI.CheckProjectVersionNumberResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	exist, err := a.appRepo.CheckAPPVersionExist(ctx, req.ProjectID, req.VersionNumber)
	if err != nil {
		return nil, errorx.Wrapf(err, "CheckAPPVersionExist failed, appID=%d, version=%s", req.ProjectID, req.VersionNumber)
	}

	resp = &publishAPI.CheckProjectVersionNumberResponse{
		Data: &publishAPI.CheckProjectVersionNumberData{
			IsDuplicate: exist,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) PublishAPP(ctx context.Context, req *publishAPI.PublishProjectRequest) (resp *publishAPI.PublishProjectResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	connectorIDs := make([]int64, 0, len(req.Connectors))
	for connectorID := range req.Connectors {
		connectorIDs = append(connectorIDs, connectorID)
	}
	connectorPublishConfigs, err := a.getConnectorPublishConfigs(ctx, connectorIDs, req.ConnectorPublishConfig)
	if err != nil {
		return nil, err
	}

	res, err := a.DomainSVC.PublishAPP(ctx, &service.PublishAPPRequest{
		APPID:                   req.ProjectID,
		Version:                 req.VersionNumber,
		VersionDesc:             req.GetDescription(),
		ConnectorPublishConfigs: connectorPublishConfigs,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "PublishAPP failed, id=%d", req.ProjectID)
	}

	resp = &publishAPI.PublishProjectResponse{
		Data: &publishAPI.PublishProjectData{
			PublishRecordID: res.PublishRecordID,
		},
	}

	if !res.Success {
		return resp, nil
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:            req.ProjectID,
			Type:          common.IntelligenceType_Project,
			HasPublished:  ptr.Of(1),
			PublishTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish project '%d' failed,  err=%v", req.ProjectID, err)
	}

	return resp, nil
}

func (a *APPApplicationService) getConnectorPublishConfigs(ctx context.Context, connectorIDs []int64, configs map[int64]*publishAPI.ConnectorPublishConfig) (map[int64]entity.PublishConfig, error) {
	publishConfigs := make(map[int64]entity.PublishConfig, len(configs))
	for _, connectorID := range connectorIDs {
		publishConfigs[connectorID] = entity.PublishConfig{}

		config := configs[connectorID]
		if config == nil {
			continue
		}

		selectedWorkflows := make([]*entity.SelectedWorkflow, 0, len(config.SelectedWorkflows))
		for _, w := range config.SelectedWorkflows {
			if w.WorkflowID == 0 {
				return nil, errorx.New(errno.ErrAppInvalidParamCode, errorx.KV(errno.APPMsgKey, "invalid workflow id"))
			}
			selectedWorkflows = append(selectedWorkflows, &entity.SelectedWorkflow{
				WorkflowID:   w.WorkflowID,
				WorkflowName: w.WorkflowName,
			})
		}

		publishConfigs[connectorID] = entity.PublishConfig{
			SelectedWorkflows: selectedWorkflows,
		}
	}

	return publishConfigs, nil
}

func (a *APPApplicationService) GetPublishRecordList(ctx context.Context, req *publishAPI.GetPublishRecordListRequest) (resp *publishAPI.GetPublishRecordListResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	connectorInfo, err := a.connectorSVC.GetByIDs(ctx, entity.ConnectorIDWhiteList)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetByIDs failed, ids=%v", entity.ConnectorIDWhiteList)
	}

	records, err := a.DomainSVC.GetAPPAllPublishRecords(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAPPAllPublishRecords failed, appID=%d", req.ProjectID)
	}

	if len(records) == 0 {
		return &publishAPI.GetPublishRecordListResponse{
			Data: []*publishAPI.PublishRecordDetail{},
		}, nil
	}

	data := make([]*publishAPI.PublishRecordDetail, 0, len(records))
	for _, r := range records {
		connectorPublishRecords := make([]*publishAPI.ConnectorPublishResult, 0, len(r.ConnectorPublishRecords))
		for _, c := range r.ConnectorPublishRecords {
			info, exist := connectorInfo[c.ConnectorID]
			if !exist {
				logs.CtxErrorf(ctx, "connector '%d' not exist", c.ConnectorID)
				continue
			}

			connectorPublishRecords = append(connectorPublishRecords, &publishAPI.ConnectorPublishResult{
				ConnectorID:            c.ConnectorID,
				ConnectorName:          info.Name,
				ConnectorIconURL:       info.URL,
				ConnectorPublishStatus: publishAPI.ConnectorPublishStatus(c.PublishStatus),
				ConnectorPublishConfig: c.PublishConfig.ToVO(),
			})
		}

		data = append(data, &publishAPI.PublishRecordDetail{
			PublishRecordID:        r.APP.GetPublishRecordID(),
			VersionNumber:          r.APP.GetVersion(),
			ConnectorPublishResult: connectorPublishRecords,
			PublishStatus:          publishAPI.PublishRecordStatus(r.APP.GetPublishStatus()),
			PublishStatusDetail:    r.APP.PublishExtraInfo.ToVO(),
		})
	}

	resp = &publishAPI.GetPublishRecordListResponse{
		Data: data,
	}

	return resp, nil
}

func (a *APPApplicationService) GetPublishRecordDetail(ctx context.Context, req *publishAPI.GetPublishRecordDetailRequest) (resp *publishAPI.GetPublishRecordDetailResponse, err error) {
	_, err = a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	connectorInfo, err := a.connectorSVC.GetByIDs(ctx, entity.ConnectorIDWhiteList)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetByIDs failed, ids=%v", entity.ConnectorIDWhiteList)
	}

	record, exist, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:    req.ProjectID,
		RecordID: req.PublishRecordID,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAPPPublishRecord failed, appID=%d, recordID=%d", req.ProjectID, req.PublishRecordID)
	}
	if !exist {
		return &publishAPI.GetPublishRecordDetailResponse{
			Data: nil,
		}, nil
	}

	connectorPublishRecords := make([]*publishAPI.ConnectorPublishResult, 0, len(record.ConnectorPublishRecords))
	for _, c := range record.ConnectorPublishRecords {
		info, exist := connectorInfo[c.ConnectorID]
		if !exist {
			logs.CtxErrorf(ctx, "connector '%d' not exist", c.ConnectorID)
			continue
		}

		connectorPublishRecords = append(connectorPublishRecords, &publishAPI.ConnectorPublishResult{
			ConnectorID:            c.ConnectorID,
			ConnectorName:          info.Name,
			ConnectorIconURL:       info.URL,
			ConnectorPublishStatus: publishAPI.ConnectorPublishStatus(c.PublishStatus),
			ConnectorPublishConfig: c.PublishConfig.ToVO(),
		})
	}

	detail := &publishAPI.PublishRecordDetail{
		PublishRecordID:        record.APP.GetPublishRecordID(),
		VersionNumber:          record.APP.GetVersion(),
		ConnectorPublishResult: connectorPublishRecords,
		PublishStatus:          publishAPI.PublishRecordStatus(record.APP.GetPublishStatus()),
		PublishStatusDetail:    record.APP.PublishExtraInfo.ToVO(),
	}

	resp = &publishAPI.GetPublishRecordDetailResponse{
		Data: detail,
	}

	return resp, nil
}

func (a *APPApplicationService) ResourceCopyDispatch(ctx context.Context, req *resourceAPI.ResourceCopyDispatchRequest) (resp *resourceAPI.ResourceCopyDispatchResponse, err error) {
	app, err := a.ValidateDraftAPPAccess(ctx, req.GetProjectID())
	if err != nil {
		return nil, errorx.Wrapf(err, "ValidateDraftAPPAccess failed, id=%d", req.ProjectID)
	}

	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV(errno.APPMsgKey, "session is required"))
	}

	taskID, err := a.initTask(ctx, req)
	if err != nil {
		return nil, err
	}

	var toAppID *int64
	if req.Scene != resourceCommon.ResourceCopyScene_CopyResourceToLibrary {
		toAppID = req.ProjectID
	}

	metaInfo := &copyMetaInfo{
		scene:      req.Scene,
		userID:     *userID,
		appSpaceID: app.SpaceID,
		copyTaskID: taskID,
		fromAppID:  app.ID,
		toAppID:    toAppID,
	}

	resType, err := toResourceType(req.ResType)
	if err != nil {
		return nil, err
	}
	res := &entity.Resource{
		ResID:   req.ResID,
		ResType: resType,
		ResName: req.GetResName(),
	}

	var (
		handleErr error
		newResID  int64
	)
	switch req.ResType {
	case resourceCommon.ResType_Plugin:
		newResID, handleErr = pluginCopyDispatchHandler(ctx, metaInfo, res)
	case resourceCommon.ResType_Database:
		newResID, handleErr = databaseCopyDispatchHandler(ctx, metaInfo, res)
	case resourceCommon.ResType_Knowledge:
		newResID, handleErr = knowledgeCopyDispatchHandler(ctx, metaInfo, res)
	case resourceCommon.ResType_Workflow:
		newResID, handleErr = workflowCopyDispatchHandler(ctx, metaInfo, res)
	default:
		return nil, errorx.New(errno.ErrAppInvalidParamCode, errorx.KVf(errno.APPMsgKey,
			"unsupported resource type '%s'", req.ResType))
	}

	if handleErr != nil {
		logs.CtxErrorf(ctx, "copy resource failed, taskID=%s, err=%v", taskID, handleErr)
	}

	failedReason, err := a.handleCopyResult(ctx, taskID, newResID, req, handleErr)
	if err != nil {
		return nil, err
	}

	resp = &resourceAPI.ResourceCopyDispatchResponse{
		TaskID:        ptr.Of(taskID),
		FailedReasons: []*resourceCommon.ResourceCopyFailedReason{},
	}

	if failedReason != "" {
		resp.FailedReasons = append(resp.FailedReasons, &resourceCommon.ResourceCopyFailedReason{
			ResID:   req.ResID,
			ResType: req.ResType,
			ResName: req.GetResName(),
			Reason:  "\n" + failedReason,
		})
	}

	return resp, nil
}

func (a *APPApplicationService) initTask(ctx context.Context, req *resourceAPI.ResourceCopyDispatchRequest) (taskID string, err error) {
	resType, err := toResourceType(req.ResType)
	if err != nil {
		return "", err
	}

	taskID, err = a.appRepo.InitResourceCopyTask(ctx, &entity.ResourceCopyResult{
		ResID:      req.ResID,
		ResType:    resType,
		ResName:    req.GetResName(),
		CopyScene:  req.Scene,
		CopyStatus: entity.ResourceCopyStatusOfProcessing,
	})
	if err != nil {
		return "", errorx.Wrapf(err, "InitResourceCopyTask failed, resID=%d, resType=%s", req.ResID, req.ResType)
	}

	return taskID, nil
}

func (a *APPApplicationService) handleCopyResult(ctx context.Context, taskID string, newResID int64,
	req *resourceAPI.ResourceCopyDispatchRequest, copyErr error,
) (failedReason string, err error) {
	resType, err := toResourceType(req.ResType)
	if err != nil {
		return "", err
	}

	result := &entity.ResourceCopyResult{
		ResID:     req.ResID,
		ResType:   resType,
		ResName:   req.GetResName(),
		CopyScene: req.Scene,
	}

	if copyErr == nil {
		result.ResID = newResID
		result.CopyStatus = entity.ResourceCopyStatusOfSuccess

		err = a.appRepo.SaveResourceCopyTaskResult(ctx, taskID, result)
		if err != nil {
			return "", errorx.Wrapf(err, "SaveResourceCopyTaskResult failed, taskID=%s", taskID)
		}

		return "", nil
	}

	var customErr errorx.StatusError
	if errors.As(copyErr, &customErr) {
		result.FailedReason = customErr.Msg()
	} else {
		result.FailedReason = "internal server error"
	}

	result.CopyStatus = entity.ResourceCopyStatusOfFailed
	err = a.appRepo.SaveResourceCopyTaskResult(ctx, taskID, result)
	if err != nil {
		return "", errorx.Wrapf(err, "SaveResourceCopyTaskResult failed, taskID=%s", taskID)
	}

	return result.FailedReason, nil
}

func pluginCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newPluginID int64, err error) {
	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		resp, err := copyPlugin(ctx, metaInfo, res)
		if err != nil {
			return 0, err
		}
		return resp.Plugin.ID, nil

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPPlugin(ctx, metaInfo, res)
		if err != nil {
			return 0, err
		}
		return res.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}
}

func copyPlugin(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (resp *plugin.CopyPluginResponse, err error) {
	var copyScene pluginModel.CopyScene
	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource:
		copyScene = pluginModel.CopySceneOfDuplicate
	case resourceCommon.ResourceCopyScene_CopyResourceToLibrary:
		copyScene = pluginModel.CopySceneOfToLibrary
	case resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		copyScene = pluginModel.CopySceneOfToAPP
	case resourceCommon.ResourceCopyScene_CopyProject:
		copyScene = pluginModel.CopySceneOfAPPDuplicate
	default:
		return nil, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}

	resp, err = plugin.PluginApplicationSVC.CopyPlugin(ctx, &plugin.CopyPluginRequest{
		CopyScene:   copyScene,
		PluginID:    res.ResID,
		UserID:      metaInfo.userID,
		TargetAPPID: metaInfo.toAppID,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CopyPlugin failed, pluginID=%d, scene=%s", res.ResID, metaInfo.scene)
	}

	return resp, nil
}

func moveAPPPlugin(ctx context.Context, _ *copyMetaInfo, res *entity.Resource) (err error) {
	_, err = plugin.PluginApplicationSVC.MoveAPPPluginToLibrary(ctx, res.ResID)
	if err != nil {
		return errorx.Wrapf(err, "MoveAPPPluginToLibrary failed, pluginID=%d", res.ResID)
	}

	return nil
}

func databaseCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newDatabaseID int64, err error) {
	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyDatabase(ctx, metaInfo, res)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPDatabase(ctx, metaInfo, res)
		if err != nil {
			return 0, err
		}
		return res.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}
}

func copyDatabase(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newDatabaseID int64, err error) {
	var suffix *string
	if metaInfo.scene == resourceCommon.ResourceCopyScene_CopyProject ||
		metaInfo.scene == resourceCommon.ResourceCopyScene_CopyResourceFromLibrary {
		suffix = ptr.Of("")
	}

	resp, err := memory.DatabaseApplicationSVC.CopyDatabase(ctx, &memory.CopyDatabaseRequest{
		DatabaseIDs: []int64{res.ResID},
		TableType:   table.TableType_OnlineTable,
		CreatorID:   metaInfo.userID,
		IsCopyData:  true,
		TargetAppID: ptr.FromOrDefault(metaInfo.toAppID, 0),
		Suffix:      suffix,
	})
	if err != nil {
		return 0, errorx.Wrapf(err, "CopyDatabase failed, databaseID=%d, scene=%s", res.ResID, metaInfo.scene)
	}

	if _, ok := resp.Databases[res.ResID]; !ok {
		return 0, fmt.Errorf("copy database failed, databaseID=%d", res.ResID)
	}

	return resp.Databases[res.ResID].ID, nil
}

func moveAPPDatabase(ctx context.Context, _ *copyMetaInfo, res *entity.Resource) (err error) {
	_, err = memory.DatabaseApplicationSVC.MoveDatabaseToLibrary(ctx, &memory.MoveDatabaseToLibraryRequest{
		DatabaseIDs: []int64{res.ResID},
		TableType:   table.TableType_OnlineTable,
	})
	if err != nil {
		return errorx.Wrapf(err, "MoveDatabaseToLibrary failed, databaseID=%d", res.ResID)
	}

	return nil
}

func knowledgeCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newKnowledgeID int64, err error) {
	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyKnowledge(ctx, metaInfo, res)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPKnowledge(ctx, metaInfo, res)
		if err != nil {
			return 0, err
		}
		return res.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}
}

func copyKnowledge(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newKnowledgeID int64, err error) {
	copyReq := &knowledgeModel.CopyKnowledgeRequest{
		KnowledgeID:  res.ResID,
		TargetUserID: metaInfo.userID,
		TaskUniqKey:  metaInfo.copyTaskID,
	}

	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource:
		copyReq.TargetAppID = *metaInfo.toAppID
		copyReq.TargetSpaceID = metaInfo.appSpaceID
	case resourceCommon.ResourceCopyScene_CopyResourceToLibrary:
		copyReq.TargetSpaceID = metaInfo.appSpaceID
	case resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		copyReq.TargetAppID = *metaInfo.toAppID
		copyReq.TargetSpaceID = metaInfo.appSpaceID
	case resourceCommon.ResourceCopyScene_CopyProject:
		copyReq.TargetAppID = *metaInfo.toAppID
		copyReq.TargetSpaceID = metaInfo.appSpaceID
	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}

	resp, err := knowledge.KnowledgeSVC.CopyKnowledge(ctx, copyReq)
	if err != nil {
		return 0, errorx.Wrapf(err, "CopyKnowledge failed, knowledgeID=%d, scene=%s", res.ResID, metaInfo.scene)
	}

	if resp.CopyStatus != knowledgeModel.CopyStatus_Successful {
		return 0, fmt.Errorf("copy knowledge failed, knowledgeID=%d, scene=%s", res.ResID, metaInfo.scene)
	}

	return resp.TargetKnowledgeID, nil
}

func moveAPPKnowledge(ctx context.Context, _ *copyMetaInfo, res *entity.Resource) (err error) {
	err = knowledge.KnowledgeSVC.MoveKnowledgeToLibrary(ctx, &knowledgeModel.MoveKnowledgeToLibraryRequest{
		KnowledgeID: res.ResID,
	})
	if err != nil {
		return errorx.Wrapf(err, "MoveKnowledgeToLibrary failed, knowledgeID=%d", res.ResID)
	}

	return nil
}

func workflowCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newWorkflowID int64, err error) {
	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyWorkflow(ctx, metaInfo, res)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		newWfId, err := moveAPPWorkflow(ctx, metaInfo, res)
		if err != nil {
			return 0, err
		}
		return newWfId, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}
}

func copyWorkflow(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (newWorkflowID int64, err error) {
	switch metaInfo.scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource:
		resp, err := workflow.SVC.CopyWorkflow(ctx, &workflowAPI.CopyWorkflowRequest{
			WorkflowID: strconv.FormatInt(res.ResID, 10),
			SpaceID:    strconv.FormatInt(metaInfo.appSpaceID, 10),
		})
		if err != nil {
			return 0, errorx.Wrapf(err, "CopyWorkflow failed, workflowID=%d", res.ResID)
		}

		newWorkflowID, _ = strconv.ParseInt(resp.Data.WorkflowID, 10, 64)

		return newWorkflowID, nil

	case resourceCommon.ResourceCopyScene_CopyResourceToLibrary:
		newWorkflowID, issues, err := workflow.SVC.CopyWorkflowFromAppToLibrary(ctx, res.ResID, metaInfo.appSpaceID, metaInfo.fromAppID)
		if err != nil {
			return 0, errorx.Wrapf(err, "CopyWorkflowFromAppToLibrary failed, workflowID=%d", res.ResID)
		}
		if len(issues) > 0 {
			return 0, errorx.New(errno.ErrAppInvalidParamCode, errorx.KVf(errno.APPMsgKey, "workflow validates failed"))
		}

		return newWorkflowID, nil

	case resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		newWorkflowID, err = workflow.SVC.CopyWorkflowFromLibraryToApp(ctx, res.ResID, *metaInfo.toAppID)
		if err != nil {
			return 0, errorx.Wrapf(err, "CopyWorkflowFromLibraryToApp failed, workflowID=%d", res.ResID)
		}

		return newWorkflowID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", metaInfo.scene)
	}
}

func moveAPPWorkflow(ctx context.Context, metaInfo *copyMetaInfo, res *entity.Resource) (wid int64, err error) {
	newWfId, issues, err := workflow.SVC.MoveWorkflowFromAppToLibrary(ctx, res.ResID, metaInfo.appSpaceID, metaInfo.fromAppID)
	if err != nil {
		return 0, errorx.Wrapf(err, "MoveWorkflowFromAppToLibrary failed, workflowID=%d", res.ResID)
	}
	if len(issues) > 0 {
		return 0, errorx.New(errno.ErrAppInvalidParamCode, errorx.KVf(errno.APPMsgKey, "workflow validate failed"))
	}

	return newWfId, nil
}

func (a *APPApplicationService) ResourceCopyDetail(ctx context.Context, req *resourceAPI.ResourceCopyDetailRequest) (resp *resourceAPI.ResourceCopyDetailResponse, err error) {
	result, exist, err := a.appRepo.GetResourceCopyTaskResult(ctx, req.TaskID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetResourceCopyTaskResult failed, taskID=%s", req.TaskID)
	}

	detail := &resourceCommon.ResourceCopyTaskDetail{
		TaskID: req.TaskID,
		Status: resourceCommon.TaskStatus_Processing,
		Scene:  result.CopyScene,
	}

	resp = &resourceAPI.ResourceCopyDetailResponse{
		TaskDetail: detail,
	}

	if !exist {
		return resp, nil // 默认返回处理中
	}

	detail.Status = resourceCommon.TaskStatus(result.CopyStatus)
	detail.ResID = result.ResID
	detail.ResType, err = toThriftResourceType(result.ResType)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func (a *APPApplicationService) DraftProjectInnerTaskList(ctx context.Context, req *taskAPI.DraftProjectInnerTaskListRequest) (resp *taskAPI.DraftProjectInnerTaskListResponse, err error) {
	resp = &taskAPI.DraftProjectInnerTaskListResponse{
		Data: &taskAPI.DraftProjectInnerTaskListData{
			TaskList: []*taskStruct.ProjectInnerTaskInfo{},
		},
	}

	return resp, nil
}

func (a *APPApplicationService) DraftProjectCopy(ctx context.Context, req *projectAPI.DraftProjectCopyRequest) (resp *projectAPI.DraftProjectCopyResponse, err error) {
	draftAPP, err := a.ValidateDraftAPPAccess(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateDraftProjectCopyRequest failed")
	}

	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV(errno.APPMsgKey, "session is required"))
	}

	newAPPID, err := a.duplicateDraftAPP(ctx, *userID, req)
	if err != nil {
		return nil, err
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Created,
		Project: &searchEntity.ProjectDocument{
			Status:  common.IntelligenceStatus_Using,
			Type:    common.IntelligenceType_Project,
			ID:      newAPPID,
			SpaceID: &req.ToSpaceID,
			OwnerID: userID,
			Name:    &req.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	draftAPP.ID = newAPPID
	draftAPP.Name = &req.Name
	draftAPP.Desc = &req.Description
	draftAPP.IconURI = &req.IconURI

	userInfo := a.getAPPUserInfo(ctx, *userID)
	basicInfo, _, err := a.getAPPBasicInfo(ctx, draftAPP)
	if err != nil {
		return nil, err
	}

	resp = &projectAPI.DraftProjectCopyResponse{
		Data: &projectAPI.DraftProjectCopyResponseData{
			BasicInfo: basicInfo,
			UserInfo:  userInfo,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) duplicateDraftAPP(ctx context.Context, userID int64, req *projectAPI.DraftProjectCopyRequest) (newAppID int64, err error) {
	newAppID, err = a.DomainSVC.CreateDraftAPP(ctx, &service.CreateDraftAPPRequest{
		SpaceID: req.ToSpaceID,
		OwnerID: userID,
		Name:    req.Name,
		Desc:    req.Description,
		IconURI: req.IconURI,
	})
	if err != nil {
		return 0, errorx.Wrapf(err, "CreateDraftAPP failed, spaceID=%d", req.ToSpaceID)
	}

	err = a.duplicateDraftAPPResources(ctx, userID, newAppID, req)
	if err != nil {
		return 0, err
	}

	return newAppID, nil
}

func (a *APPApplicationService) duplicateDraftAPPResources(ctx context.Context, userID, newAppID int64, req *projectAPI.DraftProjectCopyRequest) (err error) {
	err = a.duplicateAPPVariables(ctx, userID, req.ProjectID, newAppID)
	if err != nil {
		return err
	}

	resources, err := a.DomainSVC.GetDraftAPPResources(ctx, req.GetProjectID())
	if err != nil {
		return errorx.Wrapf(err, "GetDraftAPPResources failed, appID=%d", req.GetProjectID())
	}

	metaInfo := &copyMetaInfo{
		scene:      resourceCommon.ResourceCopyScene_CopyProject,
		userID:     userID,
		appSpaceID: req.ToSpaceID,
		copyTaskID: uuid.New().String(),
		fromAppID:  req.ProjectID,
		toAppID:    &newAppID,
	}

	copyPluginIDMap := make(map[int64]int64)
	copyToolIDMap := make(map[int64]int64)
	copyDatabaseIDMap := make(map[int64]int64)
	copyKnowledgeIDMap := make(map[int64]int64)

	taskGroup := taskgroup.NewTaskGroup(ctx, 5)
	mu := sync.Mutex{}

	for _, res := range resources {
		if res.ResType == entity.ResourceTypeOfPlugin {
			taskGroup.Go(func() error {
				resp, err := copyPlugin(ctx, metaInfo, res)
				if err != nil {
					return err
				}

				mu.Lock()
				defer mu.Unlock()

				copyPluginIDMap[res.ResID] = resp.Plugin.ID
				for oldToolID, tool := range resp.Tools {
					copyToolIDMap[oldToolID] = tool.ID
				}

				return nil
			})
		}

		if res.ResType == entity.ResourceTypeOfDatabase {
			taskGroup.Go(func() error {
				newDatabaseID, err := copyDatabase(ctx, metaInfo, res)
				if err != nil {
					return err
				}

				mu.Lock()
				defer mu.Unlock()

				copyDatabaseIDMap[res.ResID] = newDatabaseID

				return nil
			})
		}

		if res.ResType == entity.ResourceTypeOfKnowledge {
			taskGroup.Go(func() error {
				newKnowledgeID, err := copyKnowledge(ctx, metaInfo, res)
				if err != nil {
					return err
				}

				mu.Lock()
				defer mu.Unlock()

				copyKnowledgeIDMap[res.ResID] = newKnowledgeID

				return nil
			})
		}
	}

	err = taskGroup.Wait()
	if err != nil {
		return err
	}

	err = workflow.SVC.DuplicateWorkflowsByAppID(ctx, req.GetProjectID(), newAppID, workflow.ExternalResource{
		PluginMap:     copyPluginIDMap,
		PluginToolMap: copyToolIDMap,
		DatabaseMap:   copyDatabaseIDMap,
		KnowledgeMap:  copyKnowledgeIDMap,
	})
	if err != nil {
		return errorx.Wrapf(err, "DuplicateWorkflowsByAppID failed, appID=%d", req.GetProjectID())
	}

	return nil
}

func (a *APPApplicationService) duplicateAPPVariables(ctx context.Context, userID, fromAPPID, toAPPID int64) (err error) {
	vars, err := a.variablesSVC.GetProjectVariablesMeta(ctx, strconv.FormatInt(fromAPPID, 10), "")
	if err != nil {
		return err
	}
	if vars == nil {
		return nil
	}

	vars.ID = 0
	vars.BizID = conv.Int64ToStr(toAPPID)
	vars.BizType = project_memory.VariableConnector_Project
	vars.Version = ""
	vars.CreatorID = userID

	_, err = a.variablesSVC.UpsertMeta(ctx, vars)
	if err != nil {
		return err
	}

	return nil
}

func (a *APPApplicationService) getAPPUserInfo(ctx context.Context, userID int64) (userInfo *common.User) {
	ui, err := a.userSVC.GetUserInfo(ctx, userID)
	if err != nil {
		logs.CtxErrorf(ctx, "GetUserInfo failed, userID=%d, err=%v", userID, err)
		return nil
	}

	userInfo = &common.User{
		UserID:         ui.UserID,
		Nickname:       ui.Name,
		UserUniqueName: ui.UniqueName,
		AvatarURL:      ui.IconURL,
	}

	return userInfo
}

func (a *APPApplicationService) getAPPBasicInfo(ctx context.Context, draftAPP *entity.APP) (info *common.IntelligenceBasicInfo, published bool, err error) {
	record, exist, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:  draftAPP.ID,
		Oldest: false,
	})
	if err != nil {
		return nil, false, err
	}

	var publishAt int64
	if exist {
		publishAt = record.APP.GetPublishedAtMS() / 1000
		published = record.APP.Published()
	}

	iconURL, err := a.oss.GetObjectUrl(ctx, draftAPP.GetIconURI())
	if err != nil {
		logs.CtxWarnf(ctx, "get icon url failed with '%s', err=%v", draftAPP.GetIconURI(), err)
	}

	basicInfo := &common.IntelligenceBasicInfo{
		ID:          draftAPP.ID,
		SpaceID:     draftAPP.SpaceID,
		OwnerID:     draftAPP.OwnerID,
		Name:        draftAPP.GetName(),
		Description: draftAPP.GetDesc(),
		IconURI:     draftAPP.GetIconURI(),
		IconURL:     iconURL,
		CreateTime:  draftAPP.CreatedAtMS / 1000,
		UpdateTime:  draftAPP.UpdatedAtMS / 1000,
		PublishTime: publishAt,
		Status:      common.IntelligenceStatus_Using,
	}

	return basicInfo, published, nil
}

func (a *APPApplicationService) ValidateDraftAPPAccess(ctx context.Context, appID int64) (app *entity.APP, err error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV(errno.APPMsgKey, "session is required"))
	}

	app, err = a.DomainSVC.GetDraftAPP(ctx, appID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftAPP failed, appID=%d", appID)
	}

	if app.OwnerID != *uid {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV(errno.APPMsgKey, "you are not the application owner"))
	}

	return app, nil
}
