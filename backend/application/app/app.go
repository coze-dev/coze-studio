package app

import (
	"context"
	"fmt"
	"strconv"
	"time"

	connectorModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
	intelligenceAPI "code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	projectAPI "code.byted.org/flow/opencoze/backend/api/model/project"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	publishAPI "code.byted.org/flow/opencoze/backend/api/model/publish"
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

	userSVC   user.User
	searchSVC search.Search

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
	app, err := a.DomainSVC.GetDraftAPP(ctx, req.IntelligenceID)
	if err != nil {
		return nil, err
	}

	iconURL, err := a.oss.GetObjectUrl(ctx, app.GetIconURI())
	if err != nil {
		logs.CtxWarnf(ctx, "get icon url failed with '%s', err=%v", app.GetIconURI(), err)
	}

	basicInfo := &common.IntelligenceBasicInfo{
		ID:          app.ID,
		SpaceID:     app.SpaceID,
		OwnerID:     app.OwnerID,
		Name:        app.GetName(),
		Description: app.GetDesc(),
		IconURI:     app.GetIconURI(),
		IconURL:     iconURL,
		CreateTime:  app.CreatedAtMS / 1000,
		UpdateTime:  app.UpdatedAtMS / 1000,
		PublishTime: app.GetPublishedAtMS() / 1000,
		Status:      common.IntelligenceStatus_Using, // TODO(@maronghong): 完善状态
	}

	publishRecord := &intelligenceAPI.IntelligencePublishInfo{
		HasPublished: app.Published(),
		PublishTime:  strconv.FormatInt(app.GetPublishedAtMS()/1000, 10),
	}

	ui, err := a.userSVC.GetUserInfo(ctx, app.OwnerID)
	if err != nil {
		return nil, err
	}
	ownerInfo := &common.User{
		UserID:         ui.UserID,
		Nickname:       ui.Name,
		AvatarURL:      ui.IconURL,
		UserUniqueName: ui.UniqueName,
	}

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

	latestPublishRecord, published, err := a.getLatestPublishRecord(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}
	if !published {
		latestPublishRecord = &publishAPI.LastPublishInfo{
			VersionNumber:          "",
			ConnectorIds:           []int64{},
			ConnectorPublishConfig: map[int64]*publishAPI.ConnectorPublishConfig{},
		}
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

func (a *APPApplicationService) getLatestPublishRecord(ctx context.Context, appID int64) (info *publishAPI.LastPublishInfo, published bool, err error) {
	record, published, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID: appID,
	})
	if err != nil {
		return nil, false, err
	}

	if !published {
		return nil, false, nil
	}

	latestPublishRecord := &publishAPI.LastPublishInfo{
		VersionNumber:          record.APP.GetVersion(),
		ConnectorIds:           []int64{},
		ConnectorPublishConfig: map[int64]*publishAPI.ConnectorPublishConfig{},
	}

	for _, r := range record.ConnectorPublishRecords {
		latestPublishRecord.ConnectorIds = append(latestPublishRecord.ConnectorIds, r.ConnectorID)
	}

	return latestPublishRecord, true, nil
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
	connectorPublishConfigs, err := a.getConnectorPublishConfigs(ctx, req.ConnectorPublishConfig)
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
			HasPublished:  ptr.Of(1),
			PublishTimeMS: ptr.Of(time.Now().UnixMilli()),
			Type:          common.IntelligenceType_Project,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish project event failed, id=%v, err=%v", req.ProjectID, err)
	}

	return resp, nil
}

func (a *APPApplicationService) getConnectorPublishConfigs(ctx context.Context, configs map[int64]*publishAPI.ConnectorPublishConfig) (map[int64]entity.PublishConfig, error) {
	publishConfigs := make(map[int64]entity.PublishConfig, len(configs))
	for connectorID, config := range configs {
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

	record, published, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:    req.ProjectID,
		RecordID: req.PublishRecordID,
	})
	if err != nil {
		return nil, err
	}

	if !published {
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
