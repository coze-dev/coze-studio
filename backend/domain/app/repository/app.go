package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
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
	UpdateConnectorPublishStatus(ctx context.Context, recordID int64, status consts.ConnectorPublishStatus) (err error)
	GetAPPAllPublishRecords(ctx context.Context, appID int64, opts ...APPSelectedOptions) (records []*entity.PublishRecord, err error)
}

type GetPublishRecordRequest struct {
	APPID    int64
	RecordID *int64
	Oldest   bool // Get the oldest record if Oldest is true and RecordID is nil; otherwise, get the latest record
}

type UpdateAPPPublishStatusRequest struct {
	RecordID               int64
	PublishStatus          consts.PublishStatus
	PublishRecordExtraInfo *entity.PublishRecordExtraInfo
}
