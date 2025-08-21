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

package service

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
)

type UpdateProfileRequest struct {
	UserID      int64
	Name        *string
	UniqueName  *string
	Description *string
	Locale      *string
}

type ValidateProfileUpdateRequest struct {
	UniqueName *string
	Email      *string
}

type ValidateProfileUpdateResult int

const (
	ValidateSuccess             ValidateProfileUpdateResult = 0
	UniqueNameExist             ValidateProfileUpdateResult = 2
	UniqueNameTooShortOrTooLong ValidateProfileUpdateResult = 3
	EmailExist                  ValidateProfileUpdateResult = 5
)

type ValidateProfileUpdateResponse struct {
	Code ValidateProfileUpdateResult
	Msg  string
}

type CreateUserRequest struct {
	Email       string
	Password    string
	Name        string
	UniqueName  string
	Description string
	SpaceID     int64
	Locale      string
}

type CreateUserResponse struct {
	UserID int64
}

type User interface {
	// Create creates or registers a new user.
	Create(ctx context.Context, req *CreateUserRequest) (user *entity.User, err error)
	Login(ctx context.Context, email, password string) (user *entity.User, err error)
	Logout(ctx context.Context, userID int64) (err error)
	ResetPassword(ctx context.Context, email, password string) (err error)
	GetUserInfo(ctx context.Context, userID int64) (user *entity.User, err error)
	UpdateAvatar(ctx context.Context, userID int64, ext string, imagePayload []byte) (url string, err error)
	UpdateProfile(ctx context.Context, req *UpdateProfileRequest) (err error)
	ValidateProfileUpdate(ctx context.Context, req *ValidateProfileUpdateRequest) (resp *ValidateProfileUpdateResponse, err error)
	GetUserProfiles(ctx context.Context, userID int64) (user *entity.User, err error)
	MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error)
	ValidateSession(ctx context.Context, sessionKey string) (session *entity.Session, exist bool, err error)
	GetUserSpaceList(ctx context.Context, userID int64) (spaces []*entity.Space, err error)
	CreateSpace(ctx context.Context, userID int64, name, description string) (space *entity.Space, err error)
	GetSpaceMembers(ctx context.Context, spaceID int64, page, pageSize int32, roleType *int32) (members []*entity.SpaceMember, total int64, err error)
	SearchUsers(ctx context.Context, keyword string, excludeSpaceID int64, limit int32) (users []*entity.User, err error)
	InviteMember(ctx context.Context, operatorID, spaceID, userID int64, roleType int32) (member *entity.SpaceMember, err error)
	UpdateMemberRole(ctx context.Context, operatorID, spaceID, userID int64, roleType int32) (member *entity.SpaceMember, err error)
	RemoveMember(ctx context.Context, operatorID, spaceID, userID int64) (err error)
	CheckMemberPermission(ctx context.Context, spaceID, userID int64) (isMember bool, roleType int32, canInvite, canManage bool, err error)
}
