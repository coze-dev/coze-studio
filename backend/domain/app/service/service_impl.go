package service

import (
	"context"
	"fmt"
	"sort"

	"gorm.io/gorm"

	connectorModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
	resourceCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconnector"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatabase"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossknowledge"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	resourceEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB

	APPRepo repository.AppRepository
}

func NewService(components *Components) AppService {
	return &appServiceImpl{
		Components: components,
	}
}

type appServiceImpl struct {
	*Components
}

func (a *appServiceImpl) CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (appID int64, err error) {
	app := &entity.APP{
		SpaceID: req.SpaceID,
		Name:    &req.Name,
		Desc:    &req.Desc,
		IconURI: &req.IconURI,
		OwnerID: req.OwnerID,
	}

	return a.APPRepo.CreateDraftAPP(ctx, app)
}

func (a *appServiceImpl) GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, err error) {
	app, exist, err := a.APPRepo.GetDraftAPP(ctx, appID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft app '%d' not exist", appID)
	}

	return app, nil
}

func (a *appServiceImpl) DeleteDraftAPP(ctx context.Context, appID int64) (err error) {
	return a.APPRepo.DeleteDraftAPP(ctx, appID)
}

func (a *appServiceImpl) deleteAPPResource(ctx context.Context, resource *resourceEntity.ResourceDocument) (err error) {
	// TODO(@maronhong): 尽量删，不返回错误，后续改成异步删除
	// TODO(@maronghong): 删除 variables
	switch resource.ResType {
	case resourceCommon.ResType_Plugin:

	case resourceCommon.ResType_Knowledge:
		err = crossknowledge.DefaultSVC().DeleteKnowledge(ctx, &knowledge.DeleteKnowledgeRequest{
			KnowledgeID: resource.ResID,
		})

	case resourceCommon.ResType_Workflow:
		err = crossworkflow.DefaultSVC().DeleteWorkflow(ctx, resource.ResID)

	case resourceCommon.ResType_Database:
		err = crossdatabase.DefaultSVC().DeleteDatabase(ctx, &database.DeleteDatabaseRequest{
			ID: resource.ResID,
		})

	default:
		logs.CtxErrorf(ctx, "unsupported resource type '%d'", resource.ResType)
	}

	if err != nil {
		logs.CtxErrorf(ctx, "delete resource '%d' failed, resType='%d', err=%v", resource.ResID, resource.ResType, err)
		return nil
	}

	return nil
}

func (a *appServiceImpl) UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error) {
	app := &entity.APP{
		ID:      req.APPID,
		Name:    req.Name,
		Desc:    req.Desc,
		IconURI: req.IconURI,
	}

	return a.APPRepo.UpdateDraftAPP(ctx, app)
}

func (a *appServiceImpl) GetAPPPublishRecord(ctx context.Context, req *GetAPPPublishRecordRequest) (record *entity.PublishRecord, published bool, err error) {
	return a.APPRepo.GetPublishRecord(ctx, &repository.GetPublishRecordRequest{
		APPID:    req.APPID,
		RecordID: req.RecordID,
	})
}

func (a *appServiceImpl) GetAPPAllPublishRecords(ctx context.Context, appID int64) (records []*entity.PublishRecord, err error) {
	records, err = a.APPRepo.GetAPPAllPublishRecords(ctx, appID,
		repository.WithAPPID(),
		repository.WithPublishRecordID(),
		repository.WithAPPPublishAtMS(),
		repository.WithPublishVersion(),
		repository.WithAPPPublishStatus(),
		repository.WithPublishRecordExtraInfo(),
	)
	if err != nil {
		return nil, err
	}

	sort.Slice(records, func(i, j int) bool {
		return records[i].APP.GetPublishedAtMS() > records[j].APP.GetPublishedAtMS()
	})
	for _, r := range records {
		sort.Slice(r.ConnectorPublishRecords, func(i, j int) bool {
			return r.ConnectorPublishRecords[i].ConnectorID < r.ConnectorPublishRecords[j].ConnectorID
		})
	}

	return records, nil
}

func (a *appServiceImpl) GetPublishConnectorList(ctx context.Context, _ *GetPublishConnectorListRequest) (resp *GetPublishConnectorListResponse, err error) {
	connectorMap, err := crossconnector.DefaultSVC().GetByIDs(ctx, entity.ConnectorIDWhiteList)
	if err != nil {
		return nil, err
	}

	connectorList := make([]*connectorModel.Connector, 0, len(connectorMap))
	for _, v := range connectorMap {
		connectorList = append(connectorList, v)
	}
	sort.Slice(connectorList, func(i, j int) bool {
		return connectorList[i].ID < connectorList[j].ID
	})

	resp = &GetPublishConnectorListResponse{
		Connectors: connectorList,
	}

	return resp, nil
}

func (a *appServiceImpl) CopyResource(ctx context.Context, req *CopyResourceRequest) (resp *CopyResourceResponse, err error) {
	//TODO implement me
	panic("implement me")
}
