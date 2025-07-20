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
	"errors"
	"strconv"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sqlutil"
)

const (
	defaultLimit = 100
)

type ModelMetaRepo interface {
	Create(ctx context.Context, meta *model.ModelMeta) error
	UpdateStatus(ctx context.Context, id int64, status modelmgr.ModelMetaStatus) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, fuzzyShowName *string, status []modelmgr.ModelMetaStatus, limit int, cursor *string) (
		resp []*model.ModelMeta, nextCursor *string, hasMore bool, err error)
	GetByID(ctx context.Context, id int64) (*model.ModelMeta, error)
	MGetByID(ctx context.Context, ids []int64) ([]*model.ModelMeta, error)
}

func NewModelMetaDAO(db *gorm.DB) ModelMetaRepo {
	return &ModelMetaDAO{
		db:    db,
		query: query.Use(db),
	}
}

type ModelMetaDAO struct {
	db    *gorm.DB
	query *query.Query
}

func (m *ModelMetaDAO) Create(ctx context.Context, meta *model.ModelMeta) error {
	return m.query.ModelMeta.WithContext(ctx).Create(meta)
}

func (m *ModelMetaDAO) UpdateStatus(ctx context.Context, id int64, status modelmgr.ModelMetaStatus) error {
	mm := m.query.ModelMeta
	_, err := mm.WithContext(ctx).
		Debug().
		Where(mm.ID.Eq(id)).
		Select(mm.Status, mm.UpdatedAt).
		Updates(&model.ModelMeta{
			Status:    status,
			UpdatedAt: time.Now().UnixMilli(),
		})

	return err
}

func (m *ModelMetaDAO) Delete(ctx context.Context, id int64) error {
	mm := m.query.ModelMeta
	_, err := mm.WithContext(ctx).
		Debug().
		Where(mm.ID.Eq(id)).
		Delete()

	return err
}

func (m *ModelMetaDAO) List(ctx context.Context, fuzzyShowName *string, status []modelmgr.ModelMetaStatus, limit int, cursor *string) (
	resp []*model.ModelMeta, nextCursor *string, hasMore bool, err error,
) {
	mm := m.query.ModelMeta
	do := mm.WithContext(ctx)

	if fuzzyShowName != nil {
		do.Where(mm.ModelName.Like(*fuzzyShowName))
	}

	if len(status) > 0 {
		vals := slices.Transform(status, func(a modelmgr.ModelMetaStatus) driver.Valuer {
			return sqlutil.DriverValue(a)
		})
		do.Where(mm.Status.In(vals...))
	}

	if cursor != nil {
		id, err := m.fromCursor(*cursor)
		if err != nil {
			return nil, nil, false, err
		}

		do.Where(mm.ID.Lt(id))
	}

	if limit == 0 {
		limit = defaultLimit
	}

	pos, err := do.Limit(limit).Order(mm.ID.Desc()).Find()
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

func (m *ModelMetaDAO) GetByID(ctx context.Context, id int64) (*model.ModelMeta, error) {
	mm := m.query.ModelMeta
	po, err := mm.WithContext(ctx).Where(mm.ID.Eq(id)).Take()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}

		return nil, err
	}

	return po, nil
}

func (m *ModelMetaDAO) MGetByID(ctx context.Context, ids []int64) ([]*model.ModelMeta, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	mm := m.query.ModelMeta
	do := mm.WithContext(ctx)

	pos, err := do.Where(mm.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}

	// todo::本意是按照ids的顺序返回结果，但是这里的查询结果是无序的，所以这里先不做排序 @zhaonan
	// id2Idx := make(map[int64]int, len(ids))
	// for idx, id := range ids {
	// 	id2Idx[id] = idx
	// }
	//
	// resp := make([]*model.ModelMeta, 0, len(ids))
	// for _, po := range pos {
	// 	idx, found := id2Idx[po.ID]
	// 	if !found { // unexpected
	// 		return nil, fmt.Errorf("[MGetByID] unexpected data found, id=%v", po.ID)
	// 	}
	//
	// 	item := po
	// 	resp[idx] = item
	// }

	return pos, nil
}

func (m *ModelMetaDAO) fromCursor(cursor string) (id int64, err error) {
	return strconv.ParseInt(cursor, 10, 64)
}

func (m *ModelMetaDAO) toIDCursor(id int64) (cursor *string) {
	s := strconv.FormatInt(id, 10)
	return &s
}
