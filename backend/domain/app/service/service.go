package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	resourceEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type AppService interface {
	CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error)
	GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (resp *GetDraftAPPResponse, err error)
	DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error)
	UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error)

	PublishAPP(ctx context.Context, req *PublishAPPRequest) (resp *PublishAPPResponse, err error)

	CopyResource(ctx context.Context, req *CopyResourceRequest) (resp *CopyResourceResponse, err error)

	GetAPPReleaseInfo(ctx context.Context, req *GetAPPReleaseInfoRequest) (resp *GetAppReleaseInfoResponse, err error)
}

type CreateDraftAPPRequest struct {
	SpaceID int64
	OwnerID int64
	Name    string
	Desc    string
	IconURI string
}

type CreateDraftAPPResponse struct {
	APPID int64
}

type GetDraftAPPRequest struct {
	APPID int64
}

type GetDraftAPPResponse struct {
	APP *entity.APP
}

type DeleteDraftAPPRequest struct {
	APPID     int64
	Resources []*resourceEntity.ResourceDocument
}

type UpdateDraftAPPRequest struct {
}

type PublishAPPRequest struct {
}

type PublishAPPResponse struct {
}

type CopyResourceRequest struct {
}

type CopyResourceResponse struct {
}

type GetAPPReleaseInfoRequest struct {
	APPID int64
}

type GetAppReleaseInfoResponse struct {
	HasPublished bool
	Version      string
	PublishAtMS  int64
	ConnectorIDs []int64
}
