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

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal/query"
)

func NewSpaceDAO(db *gorm.DB) *SpaceDAO {
	return &SpaceDAO{
		query: query.Use(db),
	}
}

type SpaceDAO struct {
	query *query.Query
}

func (dao *SpaceDAO) CreateSpace(ctx context.Context, space *model.Space) error {
	return dao.query.Space.WithContext(ctx).Create(space)
}

func (dao *SpaceDAO) GetSpaceByIDs(ctx context.Context, spaceIDs []int64) ([]*model.Space, error) {
	return dao.query.Space.WithContext(ctx).Where(
		dao.query.Space.ID.In(spaceIDs...),
	).Find()
}
