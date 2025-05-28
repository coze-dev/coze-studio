package service

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	resourceCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/app/crossdomain"
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

	VariablesSVC crossdomain.VariablesService
	KnowledgeSVC crossdomain.KnowledgeService
	WorkflowSVC  crossdomain.WorkflowService
	DatabaseSVC  crossdomain.DatabaseService
	PluginSVC    crossdomain.PluginService
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
		err = a.PluginSVC.DeleteDraftPlugin(ctx, &plugin.DeleteDraftPluginRequest{
			PluginID: resource.ResID,
		})

	case resourceCommon.ResType_Knowledge:
		err = a.KnowledgeSVC.DeleteKnowledge(ctx, &knowledge.DeleteKnowledgeRequest{
			KnowledgeID: resource.ResID,
		})

	case resourceCommon.ResType_Workflow:
		err = a.WorkflowSVC.DeleteWorkflow(ctx, resource.ResID)

	case resourceCommon.ResType_Database:
		err = a.DatabaseSVC.DeleteDatabase(ctx, &database.DeleteDatabaseRequest{
			Database: &model.Database{
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

func (a *appServiceImpl) PublishAPP(ctx context.Context, req *PublishAPPRequest) (resp *PublishAPPResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (a *appServiceImpl) CopyResource(ctx context.Context, req *CopyResourceRequest) (resp *CopyResourceResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (a *appServiceImpl) GetAPPReleaseInfo(ctx context.Context, req *GetAPPReleaseInfoRequest) (resp *GetAppReleaseInfoResponse, err error) {
	app, exist, err := a.APPRepo.GetLatestOnlineAPP(ctx, &repository.GetLatestOnlineAPPRequest{
		APPID: req.APPID,
	})
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft app '%d' not exist", req.APPID)
	}

	resp = &GetAppReleaseInfoResponse{
		HasPublished: app.HasPublished(),
		Version:      app.GetVersion(),
		PublishAtMS:  app.GetPublishedAtMS(),
		ConnectorIDs: app.ConnectorIDs,
	}

	return resp, nil
}
