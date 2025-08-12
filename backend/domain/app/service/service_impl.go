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

package service

import (
	"context"
	"sort"

	"gorm.io/gorm"

	connectorModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/connector"
	databaseModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	crossconnector "github.com/coze-dev/coze-studio/backend/crossdomain/contract/connector"
	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/contract/database"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/contract/knowledge"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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

	appID, err = a.APPRepo.CreateDraftAPP(ctx, app)
	if err != nil {
		return 0, errorx.Wrapf(err, "CreateDraftAPP failed, spaceID=%d", req.SpaceID)
	}

	return appID, nil
}

func (a *appServiceImpl) GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, err error) {
	app, exist, err := a.APPRepo.GetDraftAPP(ctx, appID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errorx.New(errno.ErrAppRecordNotFound)
	}

	return app, nil
}

func (a *appServiceImpl) DeleteDraftAPP(ctx context.Context, appID int64) (err error) {
	err = a.APPRepo.DeleteDraftAPP(ctx, appID)
	if err != nil {
		return errorx.Wrapf(err, "DeleteDraftAPP failed, appID=%d", appID)
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

	err = a.APPRepo.UpdateDraftAPP(ctx, app)
	if err != nil {
		return errorx.Wrapf(err, "UpdateDraftAPP failed, appID=%d", req.APPID)
	}

	return nil
}

func (a *appServiceImpl) GetAPPPublishRecord(ctx context.Context, req *GetAPPPublishRecordRequest) (record *entity.PublishRecord, exist bool, err error) {
	record, exist, err = a.APPRepo.GetPublishRecord(ctx, &repository.GetPublishRecordRequest{
		APPID:         req.APPID,
		RecordID:      req.RecordID,
		OldestSuccess: req.Oldest,
	})
	if err != nil {
		return nil, false, errorx.Wrapf(err, "GetPublishRecord failed, appID=%d", req.APPID)
	}

	return record, exist, nil
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
		return nil, errorx.Wrapf(err, "GetAPPAllPublishRecords failed, appID=%d", appID)
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
		return nil, errorx.Wrapf(err, "GetByIDs failed, ids=%v", entity.ConnectorIDWhiteList)
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

func (a *appServiceImpl) GetDraftAPPResources(ctx context.Context, appID int64) (resources []*entity.Resource, err error) {
	plugins, err := crossplugin.DefaultSVC().GetAPPAllPlugins(ctx, appID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAPPAllPlugins failed, appID=%d", appID)
	}

	databaseRes, err := crossdatabase.DefaultSVC().GetAllDatabaseByAppID(ctx, &databaseModel.GetAllDatabaseByAppIDRequest{
		AppID: appID,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAllDatabaseByAppID failed, appID=%d", appID)
	}

	knowledgeRes, err := crossknowledge.DefaultSVC().ListKnowledge(ctx, &knowledgeModel.ListKnowledgeRequest{
		AppID: &appID,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "ListKnowledge failed, appID=%d", appID)
	}

	resources = make([]*entity.Resource, 0, len(plugins)+len(databaseRes.Databases)+len(knowledgeRes.KnowledgeList))

	for _, pl := range plugins {
		resources = append(resources, &entity.Resource{
			ResID:   pl.ID,
			ResName: pl.GetName(),
			ResType: entity.ResourceTypeOfPlugin,
		})
	}
	for _, db := range databaseRes.Databases {
		resources = append(resources, &entity.Resource{
			ResID:   db.ID,
			ResName: db.TableName,
			ResType: entity.ResourceTypeOfDatabase,
		})
	}
	for _, kl := range knowledgeRes.KnowledgeList {
		resources = append(resources, &entity.Resource{
			ResID:   kl.ID,
			ResName: kl.Name,
			ResType: entity.ResourceTypeOfKnowledge,
		})
	}

	return resources, nil
}
