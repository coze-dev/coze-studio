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

package repository

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
)

type AppRepository interface {
	// draft application
	CreateDraftAPP(ctx context.Context, app *entity.APP) (appID int64, err error)
	GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error)
	CheckDraftAPPExist(ctx context.Context, appID int64) (exist bool, err error)
	DeleteDraftAPP(ctx context.Context, appID int64) (err error)
	UpdateDraftAPP(ctx context.Context, app *entity.APP) (err error)

	GetPublishRecord(ctx context.Context, req *GetPublishRecordRequest) (record *entity.PublishRecord, exist bool, err error)
	CheckAPPVersionExist(ctx context.Context, appID int64, version string) (exist bool, err error)
	CreateAPPPublishRecord(ctx context.Context, record *entity.PublishRecord) (recordID int64, err error)
	UpdateAPPPublishStatus(ctx context.Context, req *UpdateAPPPublishStatusRequest) (err error)
	UpdateConnectorPublishStatus(ctx context.Context, recordID int64, status entity.ConnectorPublishStatus) (err error)
	GetAPPAllPublishRecords(ctx context.Context, appID int64, opts ...APPSelectedOptions) (records []*entity.PublishRecord, err error)

	InitResourceCopyTask(ctx context.Context, result *entity.ResourceCopyResult) (taskID string, err error)
	SaveResourceCopyTaskResult(ctx context.Context, taskID string, result *entity.ResourceCopyResult) (err error)
	GetResourceCopyTaskResult(ctx context.Context, taskID string) (result *entity.ResourceCopyResult, exist bool, err error)
}

type GetPublishRecordRequest struct {
	APPID         int64
	RecordID      *int64
	OldestSuccess bool // Get the oldest success record if OldestSuccess is true and RecordID is nil; otherwise, get the latest record
}

type UpdateAPPPublishStatusRequest struct {
	RecordID               int64
	PublishStatus          entity.PublishStatus
	PublishRecordExtraInfo *entity.PublishRecordExtraInfo
}
