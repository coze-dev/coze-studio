package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
)

type AppRepository interface {
	// draft application
	CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error)

	GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (app *entity.APP, exist bool, err error)
	CheckDraftAPPExist(ctx context.Context, req *CheckDraftAPPExistRequest) (exist bool, err error)
	DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error)
	UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error)

	// online application
	GetLatestPublishedAPP(ctx context.Context, req *GetLatestPublishedAPPRequest) (app *entity.APP, exist bool, err error)

	// version application
	CheckAPPVersionExist(ctx context.Context, req *GetVersionAPPRequest) (exist bool, err error)
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

type GetLatestPublishedAPPRequest struct {
	APPID int64
}

type GetVersionAPPRequest struct {
	APPID   int64
	Version string
}
