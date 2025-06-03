package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
)

type AppRepository interface {
	// draft application
	CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error)
	GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (app *entity.APP, exist bool, err error)
	CheckDraftAPPExist(ctx context.Context, req *CheckDraftAPPExistRequest) (exist bool, err error)
	DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error)
	UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error)

	GetLatestPublishInfo(ctx context.Context, req *GetLatestPublishInfo) (resp *GetLatestPublishInfoResponse, err error)
	CheckAPPVersionExist(ctx context.Context, req *GetVersionAPPRequest) (exist bool, err error)
	CreateAPPPublishRecord(ctx context.Context, req *CreateAPPPublishRecordRequest) (recordID int64, err error)
	UpdateAPPPublishStatus(ctx context.Context, req *UpdateAPPPublishStatusRequest) (err error)
	UpdateConnectorPublishStatus(ctx context.Context, recordID int64, status consts.ConnectorPublishStatus) (err error)
	GetAPPAllPublishRecords(ctx context.Context, appID int64, opts ...APPSelectedOptions) (resp *GetAPPAllPublishRecordsResponse, err error)
}

type CreateDraftAPPRequest struct {
	APP *entity.APP
}

type CreateDraftAPPResponse struct {
	APPID int64
}

type GetDraftAPPRequest struct {
	APPID int64
}

type CheckDraftAPPExistRequest struct {
	APPID int64
}

type DeleteDraftAPPRequest struct {
	APPID int64
}

type UpdateDraftAPPRequest struct {
	APP *entity.APP
}

type GetLatestPublishInfo struct {
	APPID int64
}

type GetLatestPublishInfoResponse struct {
	Published bool
	Record    *entity.PublishRecord
}

type GetVersionAPPRequest struct {
	APPID   int64
	Version string
}

type CreateAPPPublishRecordRequest struct {
	PublishRecord *entity.PublishRecord
}

type UpdateAPPPublishStatusRequest struct {
	RecordID               int64
	PublishStatus          consts.PublishStatus
	PublishRecordExtraInfo *entity.PublishRecordExtraInfo
}

type GetAPPAllPublishRecordsResponse struct {
	Records []*entity.PublishRecord
}

type APPPublishRecord struct {
	RecordID      int64
	PublishStatus consts.PublishStatus
}
