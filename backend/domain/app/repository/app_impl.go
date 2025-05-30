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
	appVersionDAO *dal.APPVersionDAO
	appDAO        *dal.APPDAO
}

type APPRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewAPPRepo(components *APPRepoComponents) AppRepository {
	return &appRepoImpl{
		query:         query.Use(components.DB),
		appDraftDAO:   dal.NewAPPDraftDAO(components.DB, components.IDGen),
		appDAO:        dal.NewAPPDAO(components.DB, components.IDGen),
		appVersionDAO: dal.NewAPPVersionDAO(components.DB, components.IDGen),
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

func (a *appRepoImpl) GetLatestPublishedAPP(ctx context.Context, req *GetLatestPublishedAPPRequest) (app *entity.APP, exist bool, err error) {
	app, exist, err = a.appDAO.GetAPP(ctx, req.APPID)
	if err != nil {
		return nil, false, err
	}
	if !exist {
		return nil, false, nil
	}

	return app, true, nil
}

func (a *appRepoImpl) CheckAPPVersionExist(ctx context.Context, req *GetVersionAPPRequest) (exist bool, err error) {
	return a.appVersionDAO.CheckAPPVersionExist(ctx, req.APPID, req.Version)
}
