package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type appRepoImpl struct {
	query *query.Query

	appDraftDAO *dal.APPDraftDAO
}

type APPRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewAPPRepo(components *APPRepoComponents) AppRepository {
	return &appRepoImpl{
		query:       query.Use(components.DB),
		appDraftDAO: dal.NewAPPDraftDAO(components.DB, components.IDGen),
	}
}

func (a *appRepoImpl) CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error) {
	appID, err := a.appDraftDAO.Create(ctx, req.APP)
	if err != nil {
		return nil, err
	}
	resp = &CreateDraftAPPResponse{
		APPID: appID,
	}
	return resp, nil
}

func (a *appRepoImpl) GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (resp *GetDraftAPPResponse, err error) {
	app, exist, err := a.appDraftDAO.Get(ctx, req.APPID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft app '%d' not exist", req.APPID)
	}

	resp = &GetDraftAPPResponse{
		APP: app,
	}

	return resp, nil
}

func (a *appRepoImpl) DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error) {
	//TODO implement me
	panic("implement me")
}

func (a *appRepoImpl) UpdateDraftAPPMeta(ctx context.Context, req *UpdateDraftAPPMetaRequest) (err error) {
	//TODO implement me
	panic("implement me")
}
