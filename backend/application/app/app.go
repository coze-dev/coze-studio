package app

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"

	connectorModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
	knowledgeModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	pluginModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	intelligenceAPI "code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	workflowAPI "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	projectAPI "code.byted.org/flow/opencoze/backend/api/model/project"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	publishAPI "code.byted.org/flow/opencoze/backend/api/model/publish"
	resourceAPI "code.byted.org/flow/opencoze/backend/api/model/resource"
	resourceCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	taskAPI "code.byted.org/flow/opencoze/backend/api/model/task"
	taskStruct "code.byted.org/flow/opencoze/backend/api/model/task_struct"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/application/knowledge"
	"code.byted.org/flow/opencoze/backend/application/memory"
	"code.byted.org/flow/opencoze/backend/application/plugin"
	"code.byted.org/flow/opencoze/backend/application/workflow"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var APPApplicationSVC = &APPApplicationService{}

type APPApplicationService struct {
	DomainSVC service.AppService
	appRepo   repository.AppRepository

	oss             storage.Storage
	projectEventBus search.ProjectEventBus

	userSVC user.User

	connectorSVC connector.Connector
	variablesSVC variables.Variables
}

func (a *APPApplicationService) DraftProjectCreate(ctx context.Context, req *projectAPI.DraftProjectCreateRequest) (resp *projectAPI.DraftProjectCreateResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV("msg", "session required"))
	}

	appID, err := a.DomainSVC.CreateDraftAPP(ctx, &service.CreateDraftAPPRequest{
		SpaceID: req.SpaceID,
		OwnerID: *userID,
		IconURI: req.IconURI,
		Name:    req.Name,
		Desc:    req.Description,
	})
	if err != nil {
		return nil, err
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
		return nil, err
	}

	resp = &projectAPI.DraftProjectCreateResponse{
		Data: &projectAPI.DraftProjectCreateData{
			ProjectID: appID,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) GetDraftIntelligenceInfo(ctx context.Context, req *intelligenceAPI.GetDraftIntelligenceInfoRequest) (resp *intelligenceAPI.GetDraftIntelligenceInfoResponse, err error) {
	draftAPP, err := a.DomainSVC.GetDraftAPP(ctx, req.IntelligenceID)
	if err != nil {
		return nil, err
	}

	basicInfo, err := a.getAPPBasicInfo(ctx, draftAPP)
	if err != nil {
		return nil, err
	}

	publishRecord := &intelligenceAPI.IntelligencePublishInfo{
		HasPublished: basicInfo.PublishTime != 0,
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
	err = a.DomainSVC.DeleteDraftAPP(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Deleted,
		Project: &searchEntity.ProjectDocument{
			ID:   req.ProjectID,
			Type: common.IntelligenceType_Project,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish project event failed, id=%d, err=%v", req.ProjectID, err)
	}

	err = a.deleteAPPResources(ctx, req.ProjectID)
	if err != nil {
		logs.CtxErrorf(ctx, "delete app resources failed, id=%d, err=%v", req.ProjectID, err)
	}

	resp = &projectAPI.DraftProjectDeleteResponse{}

	return resp, nil
}

func (a *APPApplicationService) deleteAPPResources(ctx context.Context, appID int64) (err error) {
	err = plugin.PluginApplicationSVC.DeleteAPPAllPlugins(ctx, appID)
	if err != nil {
		logs.CtxErrorf(ctx, "delete app plugins failed, err=%v", err)
	}

	err = memory.DatabaseApplicationSVC.DeleteDatabaseByAppID(ctx, appID)
	if err != nil {
		logs.CtxErrorf(ctx, "delete app databases failed, err=%v", err)
	}

	err = a.variablesSVC.DeleteAllVariable(ctx, project_memory.VariableConnector_Project, conv.Int64ToStr(appID))
	if err != nil {
		logs.CtxErrorf(ctx, "delete app variables failed, err=%v", err)
	}

	err = knowledge.KnowledgeSVC.DeleteAppKnowledge(ctx, &knowledge.DeleteAppKnowledgeRequest{AppID: appID})
	if err != nil {
		logs.CtxErrorf(ctx, "delete app knowledge failed, err=%v", err)
		return err
	}
	err = workflow.SVC.DeleteWorkflowsByAppID(ctx, appID)
	if err != nil {
		return err
	}

	return nil
}

func (a *APPApplicationService) DraftProjectUpdate(ctx context.Context, req *projectAPI.DraftProjectUpdateRequest) (resp *projectAPI.DraftProjectUpdateResponse, err error) {
	err = a.DomainSVC.UpdateDraftAPP(ctx, &service.UpdateDraftAPPRequest{
		APPID:   req.ProjectID,
		Name:    req.Name,
		Desc:    req.Description,
		IconURI: req.IconURI,
	})
	if err != nil {
		return nil, err
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
		return nil, fmt.Errorf("publish project event failed, id=%d, err=%v", req.ProjectID, err)
	}

	resp = &projectAPI.DraftProjectUpdateResponse{}

	return resp, nil
}

func (a *APPApplicationService) ProjectPublishConnectorList(ctx context.Context, req *publishAPI.PublishConnectorListRequest) (resp *publishAPI.PublishConnectorListResponse, err error) {
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
		return nil, err
	}

	hasWorkflow, err := workflow.SVC.CheckWorkflowsExistByAppID(ctx, appID)
	if err != nil {
		return nil, err
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
		return nil, err
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
		logs.CtxWarnf(ctx, "publish updated project event failed id=%v, err=%v", req.ResourceID, err)
	}

	return &playground.ReportUserBehaviorResponse{}, nil
}

func (a *APPApplicationService) CheckProjectVersionNumber(ctx context.Context, req *publishAPI.CheckProjectVersionNumberRequest) (resp *publishAPI.CheckProjectVersionNumberResponse, err error) {
	exist, err := a.appRepo.CheckAPPVersionExist(ctx, req.ProjectID, req.VersionNumber)
	if err != nil {
		return nil, err
	}

	resp = &publishAPI.CheckProjectVersionNumberResponse{
		Data: &publishAPI.CheckProjectVersionNumberData{
			IsDuplicate: exist,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) PublishAPP(ctx context.Context, req *publishAPI.PublishProjectRequest) (resp *publishAPI.PublishProjectResponse, err error) {
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
		return nil, err
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
		logs.CtxErrorf(ctx, "publish project event failed, id=%v, err=%v", req.ProjectID, err)
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
				return nil, errorx.New(errno.ErrAppInvalidParamCode, errorx.KV("msg", "invalid workflow id"))
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
	connectorInfo, err := a.connectorSVC.GetByIDs(ctx, entity.ConnectorIDWhiteList)
	if err != nil {
		return nil, err
	}

	records, err := a.DomainSVC.GetAPPAllPublishRecords(ctx, req.ProjectID)
	if err != nil {
		return nil, err
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
	connectorInfo, err := a.connectorSVC.GetByIDs(ctx, entity.ConnectorIDWhiteList)
	if err != nil {
		return nil, err
	}

	record, exist, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:    req.ProjectID,
		RecordID: req.PublishRecordID,
	})
	if err != nil {
		return nil, err
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

type copyMetaInfo struct {
	userID  int64
	spaceID int64
	taskID  string
}

func (a *APPApplicationService) ResourceCopyDispatch(ctx context.Context, req *resourceAPI.ResourceCopyDispatchRequest) (resp *resourceAPI.ResourceCopyDispatchResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV("msg", "session is required"))
	}

	app, err := a.DomainSVC.GetDraftAPP(ctx, req.GetProjectID())
	if err != nil {
		return nil, err
	}

	taskID, err := a.initTask(ctx, req)
	if err != nil {
		return nil, err
	}

	metaInfo := &copyMetaInfo{
		userID:  *userID,
		taskID:  taskID,
		spaceID: app.SpaceID,
	}

	var (
		handleErr error
		newResID  int64
	)
	switch req.ResType {
	case resourceCommon.ResType_Plugin:
		newResID, handleErr = pluginCopyDispatchHandler(ctx, metaInfo, req)
	case resourceCommon.ResType_Database:
		newResID, handleErr = databaseCopyDispatchHandler(ctx, metaInfo, req)
	case resourceCommon.ResType_Knowledge:
		newResID, handleErr = knowledgeCopyDispatchHandler(ctx, metaInfo, req)
	case resourceCommon.ResType_Workflow:
		newResID, handleErr = workflowCopyDispatchHandler(ctx, metaInfo, req)
	default:
		return nil, errorx.New(errno.ErrAppInvalidParamCode, errorx.KVf("msg", "unsupported resource type '%s'", req.ResType))
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
	req *resourceAPI.ResourceCopyDispatchRequest, copyErr error) (failedReason string, err error) {

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

func pluginCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newPluginID int64, err error) {
	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyPlugin(ctx, metaInfo, req)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPPlugin(ctx, metaInfo, req)
		if err != nil {
			return 0, err
		}
		return req.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}
}

func copyPlugin(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newPluginID int64, err error) {
	var copyScene pluginModel.CopyScene
	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource:
		copyScene = pluginModel.CopySceneOfDuplicate
	case resourceCommon.ResourceCopyScene_CopyResourceToLibrary:
		copyScene = pluginModel.CopySceneOfToLibrary
	case resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		copyScene = pluginModel.CopySceneOfToAPP
	case resourceCommon.ResourceCopyScene_CopyProject:
		copyScene = pluginModel.CopySceneOfAPPDuplicate
	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}

	newPlugin, err := plugin.PluginApplicationSVC.CopyPlugin(ctx, &plugin.CopyPluginRequest{
		CopyScene:   copyScene,
		PluginID:    req.ResID,
		UserID:      metaInfo.userID,
		TargetAPPID: req.ProjectID,
	})
	if err != nil {
		return 0, errorx.Wrapf(err, "CopyPlugin failed, pluginID=%d, scene=%s", req.ResID, req.Scene)
	}

	return newPlugin.Plugin.ID, nil
}

func moveAPPPlugin(ctx context.Context, _ *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (err error) {
	_, err = plugin.PluginApplicationSVC.MoveAPPPluginToLibrary(ctx, req.ResID)
	if err != nil {
		return errorx.Wrapf(err, "MoveAPPPluginToLibrary failed, pluginID=%d", req.ResID)
	}

	return nil
}

func databaseCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newDatabaseID int64, err error) {
	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyDatabase(ctx, metaInfo, req)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPDatabase(ctx, metaInfo, req)
		if err != nil {
			return 0, err
		}
		return req.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}
}

func copyDatabase(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newDatabaseID int64, err error) {
	targetAPPID := req.GetProjectID()
	if req.Scene == resourceCommon.ResourceCopyScene_CopyResourceToLibrary {
		targetAPPID = int64(0)
	}

	var suffix *string
	if req.Scene == resourceCommon.ResourceCopyScene_CopyProject {
		suffix = ptr.Of("")
	}

	res, err := memory.DatabaseApplicationSVC.CopyDatabase(ctx, &memory.CopyDatabaseRequest{
		DatabaseIDs: []int64{req.ResID},
		TableType:   table.TableType_OnlineTable,
		CreatorID:   metaInfo.userID,
		IsCopyData:  true,
		TargetAppID: targetAPPID,
		Suffix:      suffix,
	})
	if err != nil {
		return 0, errorx.Wrapf(err, "CopyDatabase failed, databaseID=%d, scene=%s", req.ResID, req.Scene)
	}

	if _, ok := res.Databases[req.ResID]; !ok {
		return 0, fmt.Errorf("copy database failed, databaseID=%d", req.ResID)
	}

	return res.Databases[req.ResID].ID, nil
}

func moveAPPDatabase(ctx context.Context, _ *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (err error) {
	_, err = memory.DatabaseApplicationSVC.MoveDatabaseToLibrary(ctx, &memory.MoveDatabaseToLibraryRequest{
		DatabaseIDs: []int64{req.ResID},
		TableType:   table.TableType_OnlineTable,
	})
	if err != nil {
		return errorx.Wrapf(err, "MoveDatabaseToLibrary failed, databaseID=%d", req.ResID)
	}

	return nil
}

func knowledgeCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newKnowledgeID int64, err error) {
	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyKnowledge(ctx, metaInfo, req)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPKnowledge(ctx, metaInfo, req)
		if err != nil {
			return 0, err
		}
		return req.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}
}

func copyKnowledge(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newKnowledgeID int64, err error) {
	copyReq := &knowledgeModel.CopyKnowledgeRequest{
		KnowledgeID:  req.ResID,
		TargetUserID: metaInfo.userID,
		TaskUniqKey:  metaInfo.taskID,
	}

	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource:
		copyReq.TargetAppID = req.GetProjectID()
		copyReq.TargetSpaceID = metaInfo.spaceID
	case resourceCommon.ResourceCopyScene_CopyResourceToLibrary:
		copyReq.TargetAppID = 0
		copyReq.TargetSpaceID = metaInfo.spaceID
	case resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		copyReq.TargetAppID = req.GetProjectID()
		copyReq.TargetSpaceID = metaInfo.spaceID
	case resourceCommon.ResourceCopyScene_CopyProject:
		copyReq.TargetAppID = req.GetProjectID()
		copyReq.TargetSpaceID = metaInfo.spaceID
	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}

	res, err := knowledge.KnowledgeSVC.CopyKnowledge(ctx, copyReq)
	if err != nil {
		return 0, errorx.Wrapf(err, "CopyKnowledge failed, knowledgeID=%d, scene=%s", req.ResID, req.Scene)
	}

	if res.CopyStatus != knowledgeModel.CopyStatus_Successful {
		return 0, fmt.Errorf("copy knowledge failed, knowledgeID=%d, scene=%s", req.ResID, req.Scene)
	}

	return res.TargetKnowledgeID, nil
}

func moveAPPKnowledge(ctx context.Context, _ *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (err error) {
	err = knowledge.KnowledgeSVC.MoveKnowledgeToLibrary(ctx, &knowledgeModel.MoveKnowledgeToLibraryRequest{
		KnowledgeID: req.ResID,
	})
	if err != nil {
		return errorx.Wrapf(err, "MoveKnowledgeToLibrary failed, knowledgeID=%d", req.ResID)
	}

	return nil
}

func workflowCopyDispatchHandler(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newWorkflowID int64, err error) {
	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource,
		resourceCommon.ResourceCopyScene_CopyResourceToLibrary,
		resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		return copyWorkflow(ctx, metaInfo, req)

	case resourceCommon.ResourceCopyScene_MoveResourceToLibrary:
		err = moveAPPWorkflow(ctx, metaInfo, req)
		if err != nil {
			return 0, err
		}
		return req.ResID, nil

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}
}

func copyWorkflow(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (newWorkflowID int64, err error) {
	switch req.Scene {
	case resourceCommon.ResourceCopyScene_CopyProjectResource:
		res, err := workflow.SVC.CopyWorkflow(ctx, &workflowAPI.CopyWorkflowRequest{
			WorkflowID: strconv.FormatInt(req.ResID, 10),
			SpaceID:    strconv.FormatInt(metaInfo.spaceID, 10),
		})
		if err != nil {
			return 0, errorx.Wrapf(err, "CopyWorkflow failed, workflowID=%d", req.ResID)
		}

		newWorkflowID, _ = strconv.ParseInt(res.Data.WorkflowID, 10, 64)

		return newWorkflowID, nil

	case resourceCommon.ResourceCopyScene_CopyResourceToLibrary:
		newWorkflowID, issues, err := workflow.SVC.CopyWorkflowFromAppToLibrary(ctx, req.ResID, metaInfo.spaceID, req.GetProjectID())
		if err != nil {
			return 0, errorx.Wrapf(err, "CopyWorkflowFromAppToLibrary failed, workflowID=%d", req.ResID)
		}
		if len(issues) > 0 {
			return 0, errorx.New(errno.ErrAppInvalidParamCode, errorx.KVf(errno.APPMsgKey, "workflow validate failed"))
		}

		return newWorkflowID, nil

	case resourceCommon.ResourceCopyScene_CopyResourceFromLibrary:
		newWorkflowID, err = workflow.SVC.CopyWorkflowFromLibraryToApp(ctx, req.ResID, req.GetProjectID())
		if err != nil {
			return 0, errorx.Wrapf(err, "CopyWorkflowFromLibraryToApp failed, workflowID=%d", req.ResID)
		}

		return newWorkflowID, nil

	case resourceCommon.ResourceCopyScene_CopyProject:
		//TODO(@zhuangjie): 提供应用 duplicate workflow 接口
		panic("implement me")

	default:
		return 0, fmt.Errorf("unsupported copy scene '%s'", req.Scene)
	}
}

func moveAPPWorkflow(ctx context.Context, metaInfo *copyMetaInfo, req *resourceAPI.ResourceCopyDispatchRequest) (err error) {
	issues, err := workflow.SVC.MoveWorkflowFromAppToLibrary(ctx, req.ResID, metaInfo.spaceID, req.GetProjectID())
	if err != nil {
		return errorx.Wrapf(err, "MoveWorkflowFromAppToLibrary failed, workflowID=%d", req.ResID)
	}
	if len(issues) > 0 {
		return errorx.New(errno.ErrAppInvalidParamCode, errorx.KVf(errno.APPMsgKey, "workflow validate failed"))
	}

	return nil
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
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV(errno.APPMsgKey, "session is required"))
	}

	draftAPP, err := a.DomainSVC.GetDraftAPP(ctx, req.ProjectID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftAPP failed, projectID=%d", req.ProjectID)
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
	basicInfo, err := a.getAPPBasicInfo(ctx, draftAPP)
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
		userID:  userID,
		spaceID: req.ToSpaceID,
		taskID:  uuid.New().String(),
	}

	for _, res := range resources {
		switch res.ResType {
		case entity.ResourceTypeOfPlugin:
			_, err = copyPlugin(ctx, metaInfo, &resourceAPI.ResourceCopyDispatchRequest{
				Scene:     resourceCommon.ResourceCopyScene_CopyProject,
				ResID:     res.ResID,
				ResName:   &res.ResName,
				ResType:   resourceCommon.ResType_Plugin,
				ProjectID: &newAppID,
			})
			if err != nil {
				return err
			}

		case entity.ResourceTypeOfDatabase:
			_, err = copyDatabase(ctx, metaInfo, &resourceAPI.ResourceCopyDispatchRequest{
				Scene:     resourceCommon.ResourceCopyScene_CopyProject,
				ResID:     res.ResID,
				ResName:   &res.ResName,
				ResType:   resourceCommon.ResType_Database,
				ProjectID: &newAppID,
			})
			if err != nil {
				return err
			}

		case entity.ResourceTypeOfKnowledge:
			_, err = copyKnowledge(ctx, metaInfo, &resourceAPI.ResourceCopyDispatchRequest{
				Scene:     resourceCommon.ResourceCopyScene_CopyProject,
				ResID:     res.ResID,
				ResName:   &res.ResName,
				ResType:   resourceCommon.ResType_Knowledge,
				ProjectID: &newAppID,
			})
			if err != nil {
				return err
			}

		case entity.ResourceTypeOfWorkflow:
			_, err = copyWorkflow(ctx, metaInfo, &resourceAPI.ResourceCopyDispatchRequest{
				Scene:     resourceCommon.ResourceCopyScene_CopyProject,
				ResID:     res.ResID,
				ResName:   &res.ResName,
				ResType:   resourceCommon.ResType_Workflow,
				ProjectID: &newAppID,
			})
			if err != nil {
				return err
			}

		default:
			return fmt.Errorf("unsupported resource type '%s'", res.ResType)
		}
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

func (a *APPApplicationService) getAPPBasicInfo(ctx context.Context, draftAPP *entity.APP) (info *common.IntelligenceBasicInfo, err error) {
	record, exist, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:  draftAPP.ID,
		Oldest: false,
	})
	if err != nil {
		return nil, err
	}

	var publishAt int64
	if exist {
		publishAt = record.APP.GetPublishedAtMS() / 1000
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

	return basicInfo, nil
}
