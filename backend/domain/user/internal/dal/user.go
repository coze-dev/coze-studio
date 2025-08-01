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
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal/query"
)

func NewUserDAO(db *gorm.DB) *UserDAO {
	return &UserDAO{
		query: query.Use(db),
	}
}

type UserDAO struct {
	query *query.Query
}

func (dao *UserDAO) GetUsersByEmail(ctx context.Context, email string) (*model.User, bool, error) {
	user, err := dao.query.User.WithContext(ctx).Where(dao.query.User.Email.Eq(email)).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, false, nil
	}

	if err != nil {
		return nil, false, err
	}

	return user, true, err
}

func (dao *UserDAO) UpdateSessionKey(ctx context.Context, userID int64, sessionKey string) error {
	_, err := dao.query.User.WithContext(ctx).Where(
		dao.query.User.ID.Eq(userID),
	).Updates(map[string]interface{}{
		"session_key": sessionKey,
		"updated_at":  time.Now().UnixMilli(),
	})
	return err
}

func (dao *UserDAO) ClearSessionKey(ctx context.Context, userID int64) error {
	_, err := dao.query.User.WithContext(ctx).
		Where(
			dao.query.User.ID.Eq(userID),
		).
		UpdateColumn(dao.query.User.SessionKey, "")

	return err
}

func (dao *UserDAO) UpdatePassword(ctx context.Context, email, password string) error {
	_, err := dao.query.User.WithContext(ctx).Where(
		dao.query.User.Email.Eq(email),
	).Updates(map[string]interface{}{
		"password":    password,
		"session_key": "", // clear session key
		"updated_at":  time.Now().UnixMilli(),
	})
	return err
}

func (dao *UserDAO) GetUserByID(ctx context.Context, userID int64) (*model.User, error) {
	return dao.query.User.WithContext(ctx).Where(
		dao.query.User.ID.Eq(userID),
	).First()
}

func (dao *UserDAO) UpdateAvatar(ctx context.Context, userID int64, iconURI string) error {
	_, err := dao.query.User.WithContext(ctx).Where(
		dao.query.User.ID.Eq(userID),
	).Updates(map[string]interface{}{
		"icon_uri":   iconURI,
		"updated_at": time.Now().UnixMilli(),
	})
	return err
}

func (dao *UserDAO) CheckUniqueNameExist(ctx context.Context, uniqueName string) (bool, error) {
	_, err := dao.query.User.WithContext(ctx).Select(dao.query.User.ID).Where(
		dao.query.User.UniqueName.Eq(uniqueName),
	).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (dao *UserDAO) UpdateProfile(ctx context.Context, userID int64, updates map[string]interface{}) error {
	if _, ok := updates["updated_at"]; !ok {
		updates["updated_at"] = time.Now().UnixMilli()
	}

	_, err := dao.query.User.WithContext(ctx).Where(
		dao.query.User.ID.Eq(userID),
	).Updates(updates)
	return err
}

func (dao *UserDAO) CheckEmailExist(ctx context.Context, email string) (bool, error) {
	_, exist, err := dao.GetUsersByEmail(ctx, email)
	if !exist {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

// CreateUser Create a new user
func (dao *UserDAO) CreateUser(ctx context.Context, user *model.User) error {
	return dao.query.User.WithContext(ctx).Create(user)
}

// GetUserBySessionKey Query users based on session key
func (dao *UserDAO) GetUserBySessionKey(ctx context.Context, sessionKey string) (*model.User, bool, error) {
	sm, err := dao.query.User.WithContext(ctx).Where(
		dao.query.User.SessionKey.Eq(sessionKey),
	).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, false, nil
	}
	if err != nil {
		return nil, false, err
	}

	return sm, true, nil
}

// GetUsersByIDs Query user information in batches
func (dao *UserDAO) GetUsersByIDs(ctx context.Context, userIDs []int64) ([]*model.User, error) {
	return dao.query.User.WithContext(ctx).Where(
		dao.query.User.ID.In(userIDs...),
	).Find()
}
