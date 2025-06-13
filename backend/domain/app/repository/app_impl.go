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

func (a *appRepoImpl) CreateDraftAPP(ctx context.Context, app *entity.APP) (appID int64, err error) {
	appID, err = a.appDraftDAO.Create(ctx, app)
	if err != nil {
		return 0, err
	}

	return appID, nil
}

func (a *appRepoImpl) GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	return a.appDraftDAO.Get(ctx, appID)
}

func (a *appRepoImpl) CheckDraftAPPExist(ctx context.Context, appID int64) (exist bool, err error) {
	return a.appDraftDAO.CheckExist(ctx, appID)
}

func (a *appRepoImpl) DeleteDraftAPP(ctx context.Context, appID int64) (err error) {
	table := a.query.AppDraft

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(appID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}

func (a *appRepoImpl) UpdateDraftAPP(ctx context.Context, app *entity.APP) (err error) {
	return a.appDraftDAO.Update(ctx, app)
}

func (a *appRepoImpl) GetPublishRecord(ctx context.Context, req *GetPublishRecordRequest) (record *entity.PublishRecord, exist bool, err error) {
	var app *entity.APP
	if req.RecordID != nil {
		app, exist, err = a.releaseRecordDAO.GetReleaseRecordWithID(ctx, *req.RecordID)
	} else if req.Oldest {
		app, exist, err = a.releaseRecordDAO.GetOldestReleaseRecord(ctx, req.APPID)
	} else {
		app, exist, err = a.releaseRecordDAO.GetLatestReleaseRecord(ctx, req.APPID)
	}
	if err != nil {
		return nil, false, err
	}
	if !exist {
		return nil, false, nil
	}

	publishRecords, err := a.connectorRefDAO.GetAllConnectorRecords(ctx, app.GetPublishRecordID())
	if err != nil {
		return nil, false, err
	}

	record = &entity.PublishRecord{
		APP:                     app,
		ConnectorPublishRecords: publishRecords,
	}

	return record, true, nil
}

func (a *appRepoImpl) CheckAPPVersionExist(ctx context.Context, appID int64, version string) (exist bool, err error) {
	_, exist, err = a.releaseRecordDAO.GetReleaseRecordWithVersion(ctx, appID, version)
	return exist, err
}

func (a *appRepoImpl) CreateAPPPublishRecord(ctx context.Context, record *entity.PublishRecord) (recordID int64, err error) {
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

	recordID, err = a.releaseRecordDAO.CreateWithTX(ctx, tx, record.APP)
	if err != nil {
		return 0, err
	}

	err = a.connectorRefDAO.BatchCreateWithTX(ctx, tx, recordID, record.ConnectorPublishRecords)
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
	return a.releaseRecordDAO.UpdatePublishStatus(ctx, req.RecordID, req.PublishStatus, req.PublishRecordExtraInfo)
}

func (a *appRepoImpl) UpdateConnectorPublishStatus(ctx context.Context, recordID int64, status consts.ConnectorPublishStatus) (err error) {
	return a.connectorRefDAO.UpdatePublishStatus(ctx, recordID, status)
}

func (a *appRepoImpl) GetAPPAllPublishRecords(ctx context.Context, appID int64, opts ...APPSelectedOptions) (records []*entity.PublishRecord, err error) {
	var opt *dal.APPSelectedOption
	for _, o := range opts {
		o(opt)
	}

	apps, err := a.releaseRecordDAO.GetAPPAllPublishRecords(ctx, appID, opt)
	if err != nil {
		return nil, err
	}

	tasks := taskgroup.NewTaskGroup(ctx, 5)
	lock := sync.Mutex{}
	for _, r := range apps {
		tasks.Go(func() error {
			connectorPublishRecords, err := a.connectorRefDAO.GetAllConnectorPublishRecords(ctx, r.GetPublishRecordID())
			if err != nil {
				return err
			}

			lock.Lock()
			records = append(records, &entity.PublishRecord{
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

	return records, nil
}
