package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type appRepoImpl struct {
	query *query.Query

	appDraftDAO   *dal.APPDraftDAO
	appReleaseDAO *dal.APPReleaseDAO
}

type APPRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewAPPRepo(components *APPRepoComponents) AppRepository {
	return &appRepoImpl{
		query:         query.Use(components.DB),
		appDraftDAO:   dal.NewAPPDraftDAO(components.DB, components.IDGen),
		appReleaseDAO: dal.NewAPPReleaseDAO(components.DB, components.IDGen),
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

func (a *appRepoImpl) GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (app *entity.APP, exist bool, err error) {
	return a.appDraftDAO.Get(ctx, req.APPID)
}

func (a *appRepoImpl) CheckDraftAPPExist(ctx context.Context, req *CheckDraftAPPExistRequest) (exist bool, err error) {
	return a.appDraftDAO.CheckExist(ctx, req.APPID)
}

func (a *appRepoImpl) DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error) {
	table := a.query.AppDraft

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(req.APPID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}

func (a *appRepoImpl) UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error) {
	return a.appDraftDAO.Update(ctx, req.APP)
}

func (a *appRepoImpl) GetLatestOnlineAPP(ctx context.Context, req *GetLatestOnlineAPPRequest) (app *entity.APP, exist bool, err error) {
	return a.appReleaseDAO.GetLatestAPP(ctx, req.APPID)
}
