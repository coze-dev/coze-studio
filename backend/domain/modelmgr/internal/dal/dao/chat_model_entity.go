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

package dao

import (
	"context"
	"database/sql/driver"
	"strconv"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sqlutil"
)

type ModelEntityRepo interface {
	Create(ctx context.Context, modelEntity *model.ModelEntity) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, fuzzyModelName *string, scenario *int64, status []modelmgr.ModelEntityStatus,
		limit int, cursor *string) (resp []*model.ModelEntity, nextCursor *string, hasMore bool, err error)
	MGet(ctx context.Context, ids []int64) ([]*model.ModelEntity, error)
}

func NewModelEntityDAO(db *gorm.DB) ModelEntityRepo {
	return &ModelEntityDAO{
		db:    db,
		query: query.Use(db),
	}
}

type ModelEntityDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (m *ModelEntityDAO) Create(ctx context.Context, modelEntity *model.ModelEntity) error {
	return m.query.ModelEntity.WithContext(ctx).Create(modelEntity)
}

func (m *ModelEntityDAO) Delete(ctx context.Context, id int64) error {
	me := m.query.ModelEntity
	_, err := me.WithContext(ctx).
		Debug().
		Where(me.ID.Eq(id)).
		Delete()

	return err
}

func (m *ModelEntityDAO) List(ctx context.Context, fuzzyModelName *string, scenario *int64, status []modelmgr.ModelEntityStatus,
	limit int, cursor *string,
) (resp []*model.ModelEntity, nextCursor *string, hasMore bool, err error) {
	me := m.query.ModelEntity
	do := me.WithContext(ctx)

	if fuzzyModelName != nil {
		do = do.Where(me.Name.Like(*fuzzyModelName))
	}
	if scenario != nil {
		do = do.Where(me.Scenario.Eq(sqlutil.DriverValue(*scenario)))
	}
	if len(status) > 0 {
		vals := slices.Transform(status, func(a modelmgr.ModelEntityStatus) driver.Valuer {
			return sqlutil.DriverValue(int64(a))
		})

		do = do.Where(me.Status.In(vals...))
	}
	if cursor != nil {
		var id int64
		id, err = m.fromCursor(*cursor)
		if err != nil {
			return nil, nil, false, err
		}
		do = do.Where(me.ID.Lt(id))
	}
	if limit == 0 {
		limit = defaultLimit
	}

	pos, err := do.Limit(limit).Order(me.ID.Desc()).Find()
	if err != nil {
		return nil, nil, false, err
	}

	if len(pos) == 0 {
		return nil, nil, false, nil
	}

	hasMore = len(pos) == limit
	if len(pos) > 0 {
		nextCursor = m.toIDCursor(pos[len(pos)-1].ID)
	}

	return pos, nextCursor, hasMore, nil
}

func (m *ModelEntityDAO) MGet(ctx context.Context, ids []int64) ([]*model.ModelEntity, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	me := m.query.ModelEntity
	pos, err := me.WithContext(ctx).Where(me.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}

	return pos, nil
}

func (m *ModelEntityDAO) fromCursor(cursor string) (id int64, err error) {
	return strconv.ParseInt(cursor, 10, 64)
}

func (m *ModelEntityDAO) toIDCursor(id int64) (cursor *string) {
	s := strconv.FormatInt(id, 10)
	return &s
}
