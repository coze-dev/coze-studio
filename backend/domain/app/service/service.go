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

	connectorModel "github.com/coze-dev/coze-studio/backend/crossdomain/connector/model"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
)

type AppService interface {
	CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (appID int64, err error)
	GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, err error)
	DeleteDraftAPP(ctx context.Context, appID int64) (err error)
	UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error)
	GetDraftAPPResources(ctx context.Context, appID int64) (resources []*entity.Resource, err error)

	PublishAPP(ctx context.Context, req *PublishAPPRequest) (resp *PublishAPPResponse, err error)

	GetAPPPublishRecord(ctx context.Context, req *GetAPPPublishRecordRequest) (record *entity.PublishRecord, published bool, err error)
	GetAPPAllPublishRecords(ctx context.Context, appID int64) (records []*entity.PublishRecord, err error)
	GetPublishConnectorList(ctx context.Context, req *GetPublishConnectorListRequest) (resp *GetPublishConnectorListResponse, err error)
}

type CreateDraftAPPRequest struct {
	SpaceID int64
	OwnerID int64
	Name    string
	Desc    string
	IconURI string
}

type UpdateDraftAPPRequest struct {
	APPID   int64
	Name    *string
	Desc    *string
	IconURI *string
}

type DuplicateDraftAPPRequest struct {
	APPID   int64
	Name    string
	Desc    string
	IconURI string
}

type PublishAPPRequest struct {
	APPID                   int64
	Version                 string
	VersionDesc             string
	ConnectorPublishConfigs map[int64]entity.PublishConfig
}

type PublishAPPResponse struct {
	PublishRecordID int64
	Success         bool
}

type GetAPPPublishRecordRequest struct {
	APPID    int64
	RecordID *int64
	Oldest   bool // Get the oldest record if Oldest is true and RecordID is nil; otherwise, get the latest record
}

type GetPublishConnectorListRequest struct {
}

type GetPublishConnectorListResponse struct {
	Connectors []*connectorModel.Connector
}
