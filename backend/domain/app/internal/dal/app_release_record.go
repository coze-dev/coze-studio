/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package dal

import (
	"context"
	"encoding/json"
	"errors"
	"math"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func NewAPPReleaseRecordDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPReleaseRecordDAO {
	return &APPReleaseRecordDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPReleaseRecordDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type releaseRecordPO model.AppReleaseRecord

func (a releaseRecordPO) ToDO() *entity.APP {
	return &entity.APP{
		ID:               a.AppID,
		SpaceID:          a.SpaceID,
		IconURI:          &a.IconURI,
		Name:             &a.Name,
		Desc:             &a.Description,
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

func (r *APPReleaseRecordDAO) getSelected(opt *APPSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := r.query.AppReleaseRecord

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

func (r *APPReleaseRecordDAO) GetLatestReleaseRecord(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	table := r.query.AppReleaseRecord
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

func (r *APPReleaseRecordDAO) GetOldestReleaseSuccessRecord(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	table := r.query.AppReleaseRecord
	res, err := table.WithContext(ctx).
		Where(
			table.AppID.Eq(appID),
			table.PublishStatus.Eq(int32(entity.PublishStatusOfPublishDone)),
		).
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

func (r *APPReleaseRecordDAO) GetReleaseRecordWithID(ctx context.Context, recordID int64) (app *entity.APP, exist bool, err error) {
	table := r.query.AppReleaseRecord
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

func (r *APPReleaseRecordDAO) GetReleaseRecordWithVersion(ctx context.Context, appID int64, version string) (app *entity.APP, exist bool, err error) {
	table := r.query.AppReleaseRecord
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

func (r *APPReleaseRecordDAO) GetAPPAllPublishRecords(ctx context.Context, appID int64, opt *APPSelectedOption) (apps []*entity.APP, err error) {
	table := r.query.AppReleaseRecord

	cursor := int64(math.MaxInt64)
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

func (r *APPReleaseRecordDAO) UpdatePublishStatus(ctx context.Context, recordID int64, status entity.PublishStatus, extraInfo *entity.PublishRecordExtraInfo) (err error) {
	table := r.query.AppReleaseRecord

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

func (r *APPReleaseRecordDAO) CreateWithTX(ctx context.Context, tx *query.QueryTx, app *entity.APP) (recordID int64, err error) {
	id, err := r.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	m := &model.AppReleaseRecord{
		ID:            id,
		AppID:         app.ID,
		SpaceID:       app.SpaceID,
		OwnerID:       app.OwnerID,
		IconURI:       app.GetIconURI(),
		Name:          app.GetName(),
		Description:   app.GetDesc(),
		ConnectorIds:  app.ConnectorIDs,
		Version:       app.GetVersion(),
		VersionDesc:   app.GetVersionDesc(),
		PublishStatus: int32(app.GetPublishStatus()),
		PublishAt:     app.GetPublishedAtMS(),
	}

	err = tx.AppReleaseRecord.WithContext(ctx).Create(m)
	if err != nil {
		return 0, err
	}

	return id, err
}
