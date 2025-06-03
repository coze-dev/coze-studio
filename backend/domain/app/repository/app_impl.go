package repository

import (
	"context"
	"fmt"
	"runtime/debug"
	"sync"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/taskgroup"
)

type appRepoImpl struct {
	query *query.Query

	appDraftDAO      *dal.APPDraftDAO
	releaseRecordDAO *dal.ReleaseRecordDAO
	connectorRefDAO  *dal.ConnectorReleaseRefDAO
}

type APPRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewAPPRepo(components *APPRepoComponents) AppRepository {
	return &appRepoImpl{
		query:            query.Use(components.DB),
		appDraftDAO:      dal.NewAPPDraftDAO(components.DB, components.IDGen),
		releaseRecordDAO: dal.NewReleaseRecordDAO(components.DB, components.IDGen),
		connectorRefDAO:  dal.NewConnectorReleaseRefDAO(components.DB, components.IDGen),
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

func (a *appRepoImpl) GetLatestPublishInfo(ctx context.Context, req *GetLatestPublishInfo) (resp *GetLatestPublishInfoResponse, err error) {
	app, exist, err := a.releaseRecordDAO.GetLatestReleaseRecord(ctx, req.APPID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return &GetLatestPublishInfoResponse{
			Published: false,
		}, nil
	}

	publishRecords, err := a.connectorRefDAO.GetAllConnectorRecords(ctx, req.APPID)
	if err != nil {
		return nil, err
	}

	resp = &GetLatestPublishInfoResponse{
		Published: true,
		Record: &entity.PublishRecord{
			APP:                     app,
			ConnectorPublishRecords: publishRecords,
		},
	}

	return
}

func (a *appRepoImpl) CheckAPPVersionExist(ctx context.Context, req *GetVersionAPPRequest) (exist bool, err error) {
	_, exist, err = a.releaseRecordDAO.GetReleaseRecord(ctx, req.APPID, req.Version)
	return exist, err
}

func (a *appRepoImpl) CreateAPPPublishRecord(ctx context.Context, req *CreateAPPPublishRecordRequest) (recordID int64, err error) {
	tx := a.query.Begin()
	if tx.Error != nil {
		return 0, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}
		if err != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	recordID, err = a.releaseRecordDAO.CreateWithTX(ctx, tx, req.PublishRecord.APP)
	if err != nil {
		return 0, err
	}

	err = a.connectorRefDAO.BatchCreateWithTX(ctx, tx, recordID, req.PublishRecord.ConnectorPublishRecords)
	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return recordID, nil
}

func (a *appRepoImpl) UpdateAPPPublishStatus(ctx context.Context, req *UpdateAPPPublishStatusRequest) (err error) {
	return a.releaseRecordDAO.UpdatePublishStatus(ctx, req.RecordID, req.PublishStatus)
}

func (a *appRepoImpl) UpdateConnectorPublishStatus(ctx context.Context, recordID int64, status consts.ConnectorPublishStatus) (err error) {
	return a.connectorRefDAO.UpdatePublishStatus(ctx, recordID, status)
}

func (a *appRepoImpl) GetAPPAllPublishRecords(ctx context.Context, appID int64, opts ...APPSelectedOptions) (resp *GetAPPAllPublishRecordsResponse, err error) {
	var opt *dal.APPSelectedOption
	for _, o := range opts {
		o(opt)
	}

	apps, err := a.releaseRecordDAO.GetAPPAllPublishRecords(ctx, appID, opt)
	if err != nil {
		return nil, err
	}

	appPublishRecords := make([]*entity.PublishRecord, 0, len(apps))

	tasks := taskgroup.NewTaskGroup(ctx, 5)
	lock := sync.Mutex{}
	for _, r := range apps {
		tasks.Go(func() error {
			connectorPublishRecords, err := a.connectorRefDAO.GetAllConnectorPublishRecords(ctx, r.GetPublishRecordID())
			if err != nil {
				return err
			}

			lock.Lock()
			appPublishRecords = append(appPublishRecords, &entity.PublishRecord{
				APP:                     r,
				ConnectorPublishRecords: connectorPublishRecords,
			})
			lock.Unlock()

			return nil
		})
	}

	err = tasks.Wait()
	if err != nil {
		return nil, err
	}

	resp = &GetAPPAllPublishRecordsResponse{
		Records: appPublishRecords,
	}

	return resp, nil
}
