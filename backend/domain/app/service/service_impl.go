package service

import (
	"context"
	"fmt"
	"sort"

	"gorm.io/gorm"

	connectorModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
	databaseModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	resourceCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconnector"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatabase"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossknowledge"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
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

func (a *appServiceImpl) CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error) {
	app := &entity.APP{
		SpaceID: req.SpaceID,
		Name:    &req.Name,
		Desc:    &req.Desc,
		IconURI: &req.IconURI,
		OwnerID: req.OwnerID,
	}
	res, err := a.APPRepo.CreateDraftAPP(ctx, &repository.CreateDraftAPPRequest{
		APP: app,
	})
	if err != nil {
		return nil, err
	}

	resp = &CreateDraftAPPResponse{
		APPID: res.APPID,
	}

	return resp, nil
}

func (a *appServiceImpl) GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (resp *GetDraftAPPResponse, err error) {
	app, exist, err := a.APPRepo.GetDraftAPP(ctx, &repository.GetDraftAPPRequest{
		APPID: req.APPID,
	})
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft app '%d' not exist", req.APPID)
	}

	resp = &GetDraftAPPResponse{
		APP: app,
	}

	return resp, nil
}

func (a *appServiceImpl) DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error) {
	err = a.APPRepo.DeleteDraftAPP(ctx, &repository.DeleteDraftAPPRequest{
		APPID: req.APPID,
	})
	if err != nil {
		return err
	}

	for _, r := range req.Resources {
		err = a.deleteAPPResource(ctx, r)
		if err != nil {
			return err
		}
	}

	return nil
}

func (a *appServiceImpl) deleteAPPResource(ctx context.Context, resource *resourceEntity.ResourceDocument) (err error) {
	// TODO(@maronhong): 尽量删，不返回错误，后续改成异步删除
	// TODO(@maronghong): 删除 variables
	switch resource.ResType {
	case resourceCommon.ResType_Plugin:
		err = crossplugin.DefaultSVC().DeleteDraftPlugin(ctx, &plugin.DeleteDraftPluginRequest{
			PluginID: resource.ResID,
		})

	case resourceCommon.ResType_Knowledge:
		err = crossknowledge.DefaultSVC().DeleteKnowledge(ctx, &knowledge.DeleteKnowledgeRequest{
			KnowledgeID: resource.ResID,
		})

	case resourceCommon.ResType_Workflow:
		err = crossworkflow.DefaultSVC().DeleteWorkflow(ctx, resource.ResID)

	case resourceCommon.ResType_Database:
		err = crossdatabase.DefaultSVC().DeleteDatabase(ctx, &database.DeleteDatabaseRequest{
			Database: &databaseModel.Database{
				ID: resource.ResID,
			},
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
	err = a.APPRepo.UpdateDraftAPP(ctx, &repository.UpdateDraftAPPRequest{
		APP: app,
	})
	if err != nil {
		return err
	}

	return nil
}

func (a *appServiceImpl) GetAPPLatestPublishRecord(ctx context.Context, req *GetAPPLatestPublishRecordRequest) (resp *GetAPPLatestPublishRecordResponse, err error) {
	res, err := a.APPRepo.GetLatestPublishInfo(ctx, &repository.GetLatestPublishInfo{
		APPID: req.APPID,
	})
	if err != nil {
		return nil, err
	}

	if !res.Published {
		return &GetAPPLatestPublishRecordResponse{
			Published: false,
		}, nil
	}

	resp = &GetAPPLatestPublishRecordResponse{
		Published:              res.Published,
		Version:                res.Record.APP.GetVersion(),
		PublishedAtMS:          res.Record.APP.GetPublishedAtMS(),
		ConnectorPublishRecord: res.Record.ConnectorPublishRecords,
	}

	return resp, nil
}

func (a *appServiceImpl) GetAPPAllPublishRecords(ctx context.Context, req *GetAPPAllPublishRecordsRequest) (resp *GetAPPAllPublishRecordsResponse, err error) {
	res, err := a.APPRepo.GetAPPAllPublishRecords(ctx, req.APPID,
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

	resp = &GetAPPAllPublishRecordsResponse{
		Records: res.Records,
	}

	return resp, nil
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
