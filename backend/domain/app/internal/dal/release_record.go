package dal

import (
	"context"
	"encoding/json"
	"errors"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func NewReleaseRecordDAO(db *gorm.DB, idGen idgen.IDGenerator) *ReleaseRecordDAO {
	return &ReleaseRecordDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ReleaseRecordDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type releaseRecordPO model.ReleaseRecord

func (a releaseRecordPO) ToDO() *entity.APP {
	return &entity.APP{
		ID:               a.AppID,
		SpaceID:          a.SpaceID,
		IconURI:          &a.IconURI,
		Name:             &a.Name,
		Desc:             &a.Desc,
		OwnerID:          a.OwnerID,
		CreatedAtMS:      a.CreatedAt,
		UpdatedAtMS:      a.UpdatedAt,
		PublishedAtMS:    &a.PublishAt,
		ConnectorIDs:     a.ConnectorIds,
		PublishRecordID:  &a.ID,
		Version:          &a.Version,
		VersionDesc:      &a.VersionDesc,
		PublishStatus:    ptr.Of(entity.PublishStatus(a.PublishStatus)),
		PublishExtraInfo: a.ExtraInfo,
	}
}

func (r *ReleaseRecordDAO) getSelected(opt *APPSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := r.query.ReleaseRecord

	if opt.PublishRecordID {
		selected = append(selected, table.ID)
	}
	if opt.APPID {
		selected = append(selected, table.AppID)
	}
	if opt.PublishAtMS {
		selected = append(selected, table.PublishAt)
	}
	if opt.PublishVersion {
		selected = append(selected, table.Version)
	}
	if opt.PublishRecordExtraInfo {
		selected = append(selected, table.ExtraInfo)
	}

	return selected
}

func (r *ReleaseRecordDAO) GetLatestReleaseRecord(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	table := r.query.ReleaseRecord
	res, err := table.WithContext(ctx).
		Where(table.AppID.Eq(appID)).
		Order(table.PublishAt.Desc()).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = releaseRecordPO(*res).ToDO()

	return app, true, nil
}

func (r *ReleaseRecordDAO) GetOldestReleaseRecord(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	table := r.query.ReleaseRecord
	res, err := table.WithContext(ctx).
		Where(table.AppID.Eq(appID)).
		Order(table.PublishAt.Asc()).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = releaseRecordPO(*res).ToDO()

	return app, true, nil
}

func (r *ReleaseRecordDAO) GetReleaseRecordWithID(ctx context.Context, recordID int64) (app *entity.APP, exist bool, err error) {
	table := r.query.ReleaseRecord
	res, err := table.WithContext(ctx).
		Where(table.ID.Eq(recordID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = releaseRecordPO(*res).ToDO()

	return app, true, nil
}

func (r *ReleaseRecordDAO) GetReleaseRecordWithVersion(ctx context.Context, appID int64, version string) (app *entity.APP, exist bool, err error) {
	table := r.query.ReleaseRecord
	res, err := table.WithContext(ctx).
		Where(
			table.AppID.Eq(appID),
			table.Version.Eq(version),
		).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = releaseRecordPO(*res).ToDO()

	return app, true, nil
}

func (r *ReleaseRecordDAO) GetAPPAllPublishRecords(ctx context.Context, appID int64, opt *APPSelectedOption) (apps []*entity.APP, err error) {
	table := r.query.ReleaseRecord

	cursor := int64(0)
	limit := 20

	for {
		res, err := table.WithContext(ctx).
			Select(r.getSelected(opt)...).
			Where(
				table.AppID.Eq(appID),
				table.ID.Lt(cursor),
			).
			Order(table.ID.Desc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, v := range res {
			apps = append(apps, releaseRecordPO(*v).ToDO())
		}

		if len(res) < limit {
			break
		}

		cursor = res[len(res)-1].ID
	}

	return apps, nil
}

func (r *ReleaseRecordDAO) UpdatePublishStatus(ctx context.Context, recordID int64, status entity.PublishStatus, extraInfo *entity.PublishRecordExtraInfo) (err error) {
	table := r.query.ReleaseRecord

	updateMap := map[string]any{
		table.PublishStatus.ColumnName().String(): int32(status),
	}
	if extraInfo != nil {
		b, err := json.Marshal(extraInfo)
		if err != nil {
			return err
		}
		updateMap[table.ExtraInfo.ColumnName().String()] = b
	}

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(recordID)).
		Updates(updateMap)
	if err != nil {
		return err
	}

	return nil
}

func (r *ReleaseRecordDAO) CreateWithTX(ctx context.Context, tx *query.QueryTx, app *entity.APP) (recordID int64, err error) {
	id, err := r.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	m := &model.ReleaseRecord{
		ID:            id,
		AppID:         app.ID,
		SpaceID:       app.SpaceID,
		OwnerID:       app.OwnerID,
		IconURI:       app.GetIconURI(),
		Name:          app.GetName(),
		Desc:          app.GetDesc(),
		ConnectorIds:  app.ConnectorIDs,
		Version:       app.GetVersion(),
		VersionDesc:   app.GetVersionDesc(),
		PublishStatus: int32(app.GetPublishStatus()),
		PublishAt:     app.GetPublishedAtMS(),
	}

	err = tx.ReleaseRecord.WithContext(ctx).Create(m)
	if err != nil {
		return 0, err
	}

	return id, err
}
