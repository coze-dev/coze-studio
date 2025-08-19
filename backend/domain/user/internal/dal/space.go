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

func (dao *SpaceDAO) GetSpaceByID(ctx context.Context, spaceID int64) (*model.Space, error) {
	return dao.query.Space.WithContext(ctx).Where(
		dao.query.Space.ID.Eq(spaceID),
	).First()
}

func (dao *SpaceDAO) GetSpaceUserBySpaceIDAndUserID(ctx context.Context, spaceID, userID int64) (*model.SpaceUser, bool, error) {
	spaceUser, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
		dao.query.SpaceUser.UserID.Eq(userID),
	).First()
	if err == gorm.ErrRecordNotFound {
		return nil, false, nil
	}
	if err != nil {
		return nil, false, err
	}
	return spaceUser, true, nil
}

func (dao *SpaceDAO) CreateSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error {
	return dao.query.SpaceUser.WithContext(ctx).Create(spaceUser)
}

func (dao *SpaceDAO) GetSpaceUsers(ctx context.Context, spaceID int64, offset, limit int32, roleType *int32) ([]*model.SpaceUser, error) {
	q := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
	)
	if roleType != nil {
		q = q.Where(dao.query.SpaceUser.RoleType.Eq(*roleType))
	}
	if offset > 0 {
		q = q.Offset(int(offset))
	}
	if limit > 0 {
		q = q.Limit(int(limit))
	}
	return q.Find()
}

func (dao *SpaceDAO) CountSpaceUsers(ctx context.Context, spaceID int64, roleType *int32) (int64, error) {
	q := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
	)
	if roleType != nil {
		q = q.Where(dao.query.SpaceUser.RoleType.Eq(*roleType))
	}
	return q.Count()
}

func (dao *SpaceDAO) UpdateSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error {
	_, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceUser.SpaceID),
		dao.query.SpaceUser.UserID.Eq(spaceUser.UserID),
	).Updates(spaceUser)
	return err
}

func (dao *SpaceDAO) DeleteSpaceUser(ctx context.Context, spaceID, userID int64) error {
	_, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
		dao.query.SpaceUser.UserID.Eq(userID),
	).Delete()
	return err
}

func (dao *SpaceDAO) AddSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error {
	return dao.CreateSpaceUser(ctx, spaceUser)
}

func (dao *SpaceDAO) GetSpaceList(ctx context.Context, userID int64) ([]*model.SpaceUser, error) {
	return dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.UserID.Eq(userID),
	).Find()
}
