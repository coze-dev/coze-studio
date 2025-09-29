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
	"errors"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func NewAPPDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPDraftDAO {
	return &APPDraftDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPDraftDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type appDraftPO model.AppDraft

func (a appDraftPO) ToDO() *entity.APP {
	return &entity.APP{
		ID:          a.ID,
		SpaceID:     a.SpaceID,
		IconURI:     &a.IconURI,
		Name:        &a.Name,
		Desc:        &a.Description,
		OwnerID:     a.OwnerID,
		CreatedAtMS: a.CreatedAt,
		UpdatedAtMS: a.UpdatedAt,
	}
}

func (a *APPDraftDAO) Create(ctx context.Context, app *entity.APP) (appID int64, err error) {
	appID, err = a.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	m := &model.AppDraft{
		ID:          appID,
		SpaceID:     app.SpaceID,
		OwnerID:     app.OwnerID,
		IconURI:     app.GetIconURI(),
		Name:        app.GetName(),
		Description: app.GetDesc(),
	}
	err = a.query.AppDraft.WithContext(ctx).Create(m)
	if err != nil {
		return 0, err
	}

	return appID, nil
}

func (a *APPDraftDAO) Get(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	table := a.query.AppDraft
	res, err := table.WithContext(ctx).
		Where(table.ID.Eq(appID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = appDraftPO(*res).ToDO()

	return app, true, nil
}

func (a *APPDraftDAO) CheckExist(ctx context.Context, appID int64) (exist bool, err error) {
	table := a.query.AppDraft
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(appID)).
		Select(table.ID).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (a *APPDraftDAO) Delete(ctx context.Context, appID int64) (err error) {
	table := a.query.AppDraft
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(appID)).
		Delete()
	if err != nil {
		return err
	}
	return nil
}

func (a *APPDraftDAO) Update(ctx context.Context, app *entity.APP) (err error) {
	table := a.query.AppDraft

	m := &model.AppDraft{}
	if app.Name != nil {
		m.Name = *app.Name
	}
	if app.Desc != nil {
		m.Description = *app.Desc
	}
	if app.IconURI != nil {
		m.IconURI = *app.IconURI
	}

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(app.ID)).
		Updates(m)
	if err != nil {
		return err
	}
	return nil
}
