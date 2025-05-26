package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
)

type AppRepository interface {
	CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error)
	GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (resp *GetDraftAPPResponse, err error)
	DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error)
	UpdateDraftAPPMeta(ctx context.Context, req *UpdateDraftAPPMetaRequest) (err error)
}

type CreateDraftAPPRequest struct {
	APP *entity.Application
}

type CreateDraftAPPResponse struct {
	APPID int64
}

type GetDraftAPPRequest struct {
	APPID int64
}

type GetDraftAPPResponse struct {
	APP *entity.Application
}

type DeleteDraftAPPRequest struct {
}

type UpdateDraftAPPMetaRequest struct {
}
