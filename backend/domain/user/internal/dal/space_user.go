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
)

func (dao *SpaceDAO) AddSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error {
	return dao.query.SpaceUser.WithContext(ctx).Create(spaceUser)
}

func (dao *SpaceDAO) GetSpaceList(ctx context.Context, userID int64) ([]*model.SpaceUser, error) {
	return dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.UserID.Eq(userID),
	).Find()
}

// GetSpaceMembers 获取空间成员列表
func (dao *SpaceDAO) GetSpaceMembers(ctx context.Context, spaceID int64, page, pageSize int32, roleType *int32) ([]*model.SpaceUser, int64, error) {
	q := dao.query.SpaceUser.WithContext(ctx).Where(dao.query.SpaceUser.SpaceID.Eq(spaceID))
	
	if roleType != nil {
		q = q.Where(dao.query.SpaceUser.RoleType.Eq(*roleType))
	}
	
	// 获取总数
	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}
	
	// 分页查询
	offset := (page - 1) * pageSize
	spaceUsers, err := q.Offset(int(offset)).Limit(int(pageSize)).Order(dao.query.SpaceUser.CreatedAt.Desc()).Find()
	if err != nil {
		return nil, 0, err
	}
	
	return spaceUsers, total, nil
}

// GetSpaceUserBySpaceIDAndUserID 根据空间ID和用户ID获取空间用户关系
func (dao *SpaceDAO) GetSpaceUserBySpaceIDAndUserID(ctx context.Context, spaceID, userID int64) (*model.SpaceUser, bool, error) {
	spaceUser, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
		dao.query.SpaceUser.UserID.Eq(userID),
	).First()
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, false, nil
		}
		return nil, false, err
	}
	
	return spaceUser, true, nil
}

// UpdateSpaceUserRole 更新空间用户角色
func (dao *SpaceDAO) UpdateSpaceUserRole(ctx context.Context, spaceID, userID int64, roleType int32) error {
	_, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
		dao.query.SpaceUser.UserID.Eq(userID),
	).Update(dao.query.SpaceUser.RoleType, roleType)
	
	return err
}

// RemoveSpaceUser 移除空间用户
func (dao *SpaceDAO) RemoveSpaceUser(ctx context.Context, spaceID, userID int64) error {
	_, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(spaceID),
		dao.query.SpaceUser.UserID.Eq(userID),
	).Delete()
	
	return err
}

// SearchUsersByKeyword 根据关键词搜索用户(排除已在指定空间中的用户)
func (dao *SpaceDAO) SearchUsersByKeyword(ctx context.Context, keyword string, excludeSpaceID int64, limit int32) ([]*model.User, error) {
	// 获取指定空间中的用户ID列表
	existingUsers, err := dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.SpaceID.Eq(excludeSpaceID),
	).Find()
	if err != nil {
		return nil, err
	}
	
	excludeUserIDs := make([]int64, len(existingUsers))
	for i, user := range existingUsers {
		excludeUserIDs[i] = user.UserID
	}
	
	// 搜索用户，排除已在空间中的用户
	userQuery := dao.query.User.WithContext(ctx).Where(
		dao.query.User.Name.Like("%"+keyword+"%"),
	).Or(
		dao.query.User.UniqueName.Like("%"+keyword+"%"),
	).Or(
		dao.query.User.Email.Like("%"+keyword+"%"),
	)
	
	if len(excludeUserIDs) > 0 {
		userQuery = userQuery.Where(dao.query.User.ID.NotIn(excludeUserIDs...))
	}
	
	return userQuery.Limit(int(limit)).Order(dao.query.User.CreatedAt.Desc()).Find()
}
