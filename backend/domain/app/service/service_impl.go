package service

import (
	"context"
	"fmt"
	"sort"
	"sync"

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
	"code.byted.org/flow/opencoze/backend/pkg/taskgroup"
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

func (a *appServiceImpl) PublishAPP(ctx context.Context, req *PublishAPPRequest) (resp *PublishAPPResponse, err error) {
	_, err = crossconnector.DefaultSVC().GetByIDs(ctx, entity.ConnectorIDWhiteList)
	if err != nil {
		return nil, err
	}

	// 1. 先发布 plugin，将版本号传给 workflow
	_, err = a.publishPlugins(ctx, req.Resources)
	if err != nil {
		return nil, err
	}

	err = a.publishWorkflows(ctx, req.Resources)
	if err != nil {
		return nil, err
	}

	resp = &PublishAPPResponse{}

	return resp, nil
}

func (a *appServiceImpl) publishWorkflows(ctx context.Context, resources []*resourceEntity.ResourceDocument) (err error) {
	tasks := taskgroup.NewTaskGroup(ctx, 2)
	for _, resource := range resources {
		if resource.ResType != resourceCommon.ResType_Workflow {
			continue
		}

		workflowID := resource.ResID

		tasks.Go(func() (err error) {
			err = crossworkflow.DefaultSVC().PublishWorkflow(ctx, workflowID, "", "", false)
			if err != nil {
				return fmt.Errorf("publish workflow '%d' failed, err=%v", workflowID, err)
			}

			return nil
		})
	}

	err = tasks.Wait()
	if err != nil {
		return err
	}

	return nil
}

func (a *appServiceImpl) publishPlugins(ctx context.Context, resources []*resourceEntity.ResourceDocument) (versions map[int64]string, err error) {
	versions = map[int64]string{}
	mutex := sync.Mutex{}

	tasks := taskgroup.NewTaskGroup(ctx, 3)
	for _, resource := range resources {
		if resource.ResType != resourceCommon.ResType_Plugin {
			continue
		}

		pluginID := resource.ResID

		tasks.Go(func() (err error) {
			nextVersionResp, err := crossplugin.DefaultSVC().GetPluginNextVersion(ctx, &plugin.GetPluginNextVersionRequest{
				PluginID: pluginID,
			})
			if err != nil {
				return fmt.Errorf("get next version of plugin '%d' failed, err=%v", pluginID, err)
			}

			err = crossplugin.DefaultSVC().PublishPlugin(ctx, &plugin.PublishPluginRequest{
				PluginID: pluginID,
				Version:  nextVersionResp.Version,
			})
			if err != nil {
				return fmt.Errorf("publish plugin '%d' failed, err=%v", pluginID, err)
			}

			mutex.Lock()
			versions[pluginID] = nextVersionResp.Version
			mutex.Unlock()

			return nil
		})
	}

	err = tasks.Wait()
	if err != nil {
		return nil, err
	}

	return versions, nil
}

func (a *appServiceImpl) GetAPPPublishInfo(ctx context.Context, req *GetAPPPublishInfoRequest) (resp *GetAppPublishInfoResponse, err error) {
	app, exist, err := a.APPRepo.GetLatestPublishedAPP(ctx, &repository.GetLatestPublishedAPPRequest{
		APPID: req.APPID,
	})
	if err != nil {
		return nil, err
	}
	if !exist {
		return &GetAppPublishInfoResponse{
			Published: false,
		}, nil
	}

	resp = &GetAppPublishInfoResponse{
		Published:            app.Published(),
		Version:              app.GetVersion(),
		PublishedAtMS:        app.GetPublishedAtMS(),
		ConnectorPublishInfo: app.ConnectorPublishInfo,
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
