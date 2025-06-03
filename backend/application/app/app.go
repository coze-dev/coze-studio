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
	publishAPI "code.byted.org/flow/opencoze/backend/api/model/publish"
	resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
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

	userSVC      user.User
	searchSVC    search.Search
	connectorSVC connector.Connector
}

func (a *APPApplicationService) DraftProjectCreate(ctx context.Context, req *projectAPI.DraftProjectCreateRequest) (resp *projectAPI.DraftProjectCreateResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrAppPermissionCode, errorx.KV("msg", "session required"))
	}

	res, err := a.DomainSVC.CreateDraftAPP(ctx, &service.CreateDraftAPPRequest{
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
			ID:      res.APPID,
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
			ProjectID: res.APPID,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) GetDraftIntelligenceInfo(ctx context.Context, req *intelligenceAPI.GetDraftIntelligenceInfoRequest) (resp *intelligenceAPI.GetDraftIntelligenceInfoResponse, err error) {
	res, err := a.DomainSVC.GetDraftAPP(ctx, &service.GetDraftAPPRequest{
		APPID: req.IntelligenceID,
	})
	if err != nil {
		return nil, err
	}

	iconURL, err := a.oss.GetObjectUrl(ctx, res.APP.GetIconURI())
	if err != nil {
		logs.CtxWarnf(ctx, "get icon url failed with '%s', err=%v", res.APP.GetIconURI(), err)
	}

	basicInfo := &common.IntelligenceBasicInfo{
		ID:          res.APP.ID,
		SpaceID:     res.APP.SpaceID,
		OwnerID:     res.APP.OwnerID,
		Name:        res.APP.GetName(),
		Description: res.APP.GetDesc(),
		IconURI:     res.APP.GetIconURI(),
		IconURL:     iconURL,
		CreateTime:  res.APP.CreatedAtMS / 1000,
		UpdateTime:  res.APP.UpdatedAtMS / 1000,
		PublishTime: res.APP.GetPublishedAtMS() / 1000,
		Status:      common.IntelligenceStatus_Using, // TODO(@maronghong): 完善状态
	}

	publishRecord := &intelligenceAPI.IntelligencePublishInfo{
		HasPublished: res.APP.Published(),
		PublishTime:  strconv.FormatInt(res.APP.GetPublishedAtMS()/1000, 10),
	}

	ui, err := a.userSVC.GetUserInfo(ctx, res.APP.OwnerID)
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
	err = a.DomainSVC.DeleteDraftAPP(ctx, &service.DeleteDraftAPPRequest{
		APPID: req.ProjectID,
	})
	if err != nil {
		return nil, err
	}

	err = a.projectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Deleted,
		Project: &searchEntity.ProjectDocument{
			ID: req.ProjectID,
		},
	})

	resp = &projectAPI.DraftProjectDeleteResponse{}

	return resp, nil
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

	hasWorkflow, err := a.hasWorkflow(ctx, appID)
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

func (a *APPApplicationService) hasWorkflow(ctx context.Context, appID int64) (bool, error) {
	searchRes, err := a.searchSVC.SearchResources(ctx, &searchEntity.SearchResourcesRequest{
		APPID:         appID,
		ResTypeFilter: []resource.ResType{resource.ResType_Workflow},
		Limit:         1,
	})
	if err != nil {
		return false, err
	}

	return len(searchRes.Data) > 0, nil
}

func (a *APPApplicationService) getLatestPublishRecord(ctx context.Context, appID int64) (info *publishAPI.LastPublishInfo, published bool, err error) {
	res, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID: appID,
	})
	if err != nil {
		return nil, false, err
	}

	if !res.Published {
		return nil, false, nil
	}

	latestPublishRecord := &publishAPI.LastPublishInfo{
		VersionNumber:          res.Record.APP.GetVersion(),
		ConnectorIds:           []int64{},
		ConnectorPublishConfig: map[int64]*publishAPI.ConnectorPublishConfig{},
	}

	for _, r := range res.Record.ConnectorPublishRecords {
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
	exist, err := a.appRepo.CheckAPPVersionExist(ctx, &repository.GetVersionAPPRequest{
		APPID:   req.ProjectID,
		Version: req.VersionNumber,
	})

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

	res, err := a.DomainSVC.GetAPPAllPublishRecords(ctx, &service.GetAPPAllPublishRecordsRequest{
		APPID: req.ProjectID,
	})
	if err != nil {
		return nil, err
	}

	if len(res.Records) == 0 {
		return &publishAPI.GetPublishRecordListResponse{
			Data: []*publishAPI.PublishRecordDetail{},
		}, nil
	}

	data := make([]*publishAPI.PublishRecordDetail, 0, len(res.Records))
	for _, r := range res.Records {
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

	res, err := a.DomainSVC.GetAPPPublishRecord(ctx, &service.GetAPPPublishRecordRequest{
		APPID:    req.ProjectID,
		RecordID: req.PublishRecordID,
	})
	if err != nil {
		return nil, err
	}

	if !res.Published {
		return &publishAPI.GetPublishRecordDetailResponse{
			Data: nil,
		}, nil
	}

	record := res.Record

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
