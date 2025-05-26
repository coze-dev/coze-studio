package service

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB

	APPRepo repository.AppRepository
}

func NewService(components *Components) AppService {
	return &appServiceImpl{
		db:      components.DB,
		appRepo: components.APPRepo,
	}
}

type appServiceImpl struct {
	db *gorm.DB

	appRepo repository.AppRepository
}

func (a *appServiceImpl) CreateDraftAPP(ctx context.Context, req *CreateDraftAPPRequest) (resp *CreateDraftAPPResponse, err error) {
	app := &entity.Application{
		SpaceID: req.SpaceID,
		Name:    req.Name,
		Desc:    req.Desc,
		IconURI: req.IconURI,
		OwnerID: req.OwnerID,
	}
	res, err := a.appRepo.CreateDraftAPP(ctx, &repository.CreateDraftAPPRequest{
		APP: app,
	})
	if err != nil {
		return nil, err
	}

	resp = &CreateDraftAPPResponse{
		APPID: res.APPID,
	}

	return resp, nil
}

func (a *appServiceImpl) GetDraftAPP(ctx context.Context, req *GetDraftAPPRequest) (resp *GetDraftAPPResponse, err error) {
	res, err := a.appRepo.GetDraftAPP(ctx, &repository.GetDraftAPPRequest{
		APPID: req.APPID,
	})
	if err != nil {
		return nil, err
	}

	resp = &GetDraftAPPResponse{
		APP: res.APP,
	}

	return resp, nil
}

func (a *appServiceImpl) DeleteDraftAPP(ctx context.Context, req *DeleteDraftAPPRequest) (err error) {
	//TODO implement me
	panic("implement me")
}

func (a *appServiceImpl) UpdateDraftAPP(ctx context.Context, req *UpdateDraftAPPRequest) (err error) {
	//TODO implement me
	panic("implement me")
}

func (a *appServiceImpl) PublishAPP(ctx context.Context, req *PublishAPPRequest) (resp *PublishAPPResponse, err error) {
	//TODO implement me
	panic("implement me")
}

func (a *appServiceImpl) CopyResource(ctx context.Context, req *CopyResourceRequest) (resp *CopyResourceResponse, err error) {
	//TODO implement me
	panic("implement me")
}
