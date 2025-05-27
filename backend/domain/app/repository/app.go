package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
)

type AppRepository interface {
	// draft application
	CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error)
	GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (app *entity.APP, exist bool, err error)
	DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error)
	UpdateDraftAPPMeta(ctx context.Context, req *UpdateDraftAPPMetaRequest) (err error)

	// online application
	GetLatestOnlineAPP(ctx context.Context, req *GetLatestOnlineAPPRequest) (app *entity.APP, exist bool, err error)
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

type DeleteDraftAPPRequest struct {
	APPID int64
}

type UpdateDraftAPPMetaRequest struct {
}

type GetLatestOnlineAPPRequest struct {
	APPID int64
}
