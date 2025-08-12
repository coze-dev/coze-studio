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

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal"
	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal/model"
)

func NewUserRepo(db *gorm.DB) UserRepository {
	return dal.NewUserDAO(db)
}

func NewSpaceRepo(db *gorm.DB) SpaceRepository {
	return dal.NewSpaceDAO(db)
}

type UserRepository interface {
	GetUsersByEmail(ctx context.Context, email string) (*model.User, bool, error)
	UpdateSessionKey(ctx context.Context, userID int64, sessionKey string) error
	ClearSessionKey(ctx context.Context, userID int64) error
	UpdatePassword(ctx context.Context, email, password string) error
	GetUserByID(ctx context.Context, userID int64) (*model.User, error)
	UpdateAvatar(ctx context.Context, userID int64, iconURI string) error
	CheckUniqueNameExist(ctx context.Context, uniqueName string) (bool, error)
	UpdateProfile(ctx context.Context, userID int64, updates map[string]any) error
	CheckEmailExist(ctx context.Context, email string) (bool, error)
	CreateUser(ctx context.Context, user *model.User) error
	GetUserBySessionKey(ctx context.Context, sessionKey string) (*model.User, bool, error)
	GetUsersByIDs(ctx context.Context, userIDs []int64) ([]*model.User, error)
}

type SpaceRepository interface {
	CreateSpace(ctx context.Context, space *model.Space) error
	GetSpaceByIDs(ctx context.Context, spaceIDs []int64) ([]*model.Space, error)
	AddSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error
	GetSpaceList(ctx context.Context, userID int64) ([]*model.SpaceUser, error)
	GetSpaceMembers(ctx context.Context, spaceID int64, page, pageSize int32, roleType *int32) ([]*model.SpaceUser, int64, error)
	GetSpaceUserBySpaceIDAndUserID(ctx context.Context, spaceID, userID int64) (*model.SpaceUser, bool, error)
	UpdateSpaceUserRole(ctx context.Context, spaceID, userID int64, roleType int32) error
	RemoveSpaceUser(ctx context.Context, spaceID, userID int64) error
	SearchUsersByKeyword(ctx context.Context, keyword string, excludeSpaceID int64, limit int32) ([]*model.User, error)
}
