package service

import (
	"context"

	connectorModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
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

	GetAPPPublishInfo(ctx context.Context, req *GetAPPPublishInfoRequest) (resp *GetAppPublishInfoResponse, err error)
	GetPublishConnectorList(ctx context.Context, req *GetPublishConnectorListRequest) (resp *GetPublishConnectorListResponse, err error)
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
	APPID   int64
	Name    *string
	Desc    *string
	IconURI *string
}

type PublishAPPRequest struct {
	APPID       int64
	Version     string
	VersionDesc string
	Resources   []*resourceEntity.ResourceDocument
}

type PublishAPPResponse struct {
}

type CopyResourceRequest struct {
}

type CopyResourceResponse struct {
}

type GetAPPPublishInfoRequest struct {
	APPID int64
}

type GetAppPublishInfoResponse struct {
	Published            bool
	Version              string
	PublishedAtMS        int64
	ConnectorPublishInfo []entity.ConnectorPublishInfo
}

type GetPublishConnectorListRequest struct {
}

type GetPublishConnectorListResponse struct {
	Connectors []*connectorModel.Connector
}

type ReleaseAPP struct {
	APPID int64
}

type ReleaseAPPResource struct {
}

type ConnectorRelease struct {
}
