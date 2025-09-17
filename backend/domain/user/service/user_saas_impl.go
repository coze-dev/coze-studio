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
	"encoding/json"

	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/saasapi"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// CozeUserService provides user-related API operations
type CozeUserService struct {
	client *saasapi.CozeAPIClient
}

// NewCozeUserService creates a new user service
func NewCozeUserService() *CozeUserService {
	return &CozeUserService{
		client: saasapi.NewCozeAPIClient(),
	}
}

// GetUserInfo calls the /v1/users/me endpoint
func (s *CozeUserService) GetUserInfo(ctx context.Context, userID int64) (*entity.User, error) {
	resp, err := s.client.Get(ctx, "/v1/users/me")
	if err != nil {
		logs.CtxErrorf(ctx, "failed to call GetUserInfo API: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "API call failed"))
	}

	// Parse the data field
	var userData struct {
		UserID       int64  `json:"user_id"`
		Name         string `json:"name"`
		UniqueName   string `json:"unique_name"`
		Email        string `json:"email"`
		Description  string `json:"description"`
		IconURI      string `json:"icon_uri"`
		IconURL      string `json:"icon_url"`
		UserVerified bool   `json:"user_verified"`
		Locale       string `json:"locale"`
		CreatedAt    int64  `json:"created_at"`
		UpdatedAt    int64  `json:"updated_at"`
	}

	if err := json.Unmarshal(resp.Data, &userData); err != nil {
		logs.CtxErrorf(ctx, "failed to parse user data: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "data parse failed"))
	}

	// Map to entity.User
	return &entity.User{
		UserID:       userData.UserID,
		Name:         userData.Name,
		UniqueName:   userData.UniqueName,
		Email:        userData.Email,
		Description:  userData.Description,
		IconURI:      userData.IconURI,
		IconURL:      userData.IconURL,
		UserVerified: userData.UserVerified,
		Locale:       userData.Locale,
		CreatedAt:    userData.CreatedAt,
		UpdatedAt:    userData.UpdatedAt,
	}, nil
}

// GetUserBenefit calls the /v1/users/benefit endpoint
func (s *CozeUserService) GetUserBenefit(ctx context.Context, userID int64) (*entity.UserBenefit, error) {
	resp, err := s.client.Get(ctx, "/v1/users/benefit")
	if err != nil {
		logs.CtxErrorf(ctx, "failed to call GetUserBenefit API: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "API call failed"))
	}

	// Parse the data field
	var benefitData struct {
		UserID int64 `json:"user_id"`
		// Add more fields here when API response format is confirmed
	}

	if err := json.Unmarshal(resp.Data, &benefitData); err != nil {
		logs.CtxErrorf(ctx, "failed to parse benefit data: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "data parse failed"))
	}

	// Map to entity.UserBenefit
	return &entity.UserBenefit{
		UserID: benefitData.UserID,
	}, nil
}

// Global coze user service instance
var cozeUserService *CozeUserService

// getCozeUserService returns the global coze user service instance
func getCozeUserService() *CozeUserService {
	if cozeUserService == nil {
		cozeUserService = NewCozeUserService()
	}
	return cozeUserService
}

// getSaasUserInfo is a helper function to get user info from SaaS API
func (u *userImpl) GetSaasUserInfo(ctx context.Context, userID int64) (*entity.User, error) {
	return getCozeUserService().GetUserInfo(ctx, userID)
}

// GetUserBenefit implements SaasUserProvider.GetUserBenefit
func (u *userImpl) GetUserBenefit(ctx context.Context, userID int64) (*entity.UserBenefit, error) {
	return getCozeUserService().GetUserBenefit(ctx, userID)
}
