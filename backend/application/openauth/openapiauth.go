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

package openauth

import (
	"context"
	"strconv"
	"time"

	"github.com/pkg/errors"

	openapimodel "github.com/coze-dev/coze-studio/backend/api/model/permission/openapiauth"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	openapi "github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth"
	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type OpenAuthApplicationService struct {
	OpenAPIDomainSVC openapi.APIAuth
}

var OpenAuthApplication = &OpenAuthApplicationService{}

func (s *OpenAuthApplicationService) GetPersonalAccessTokenAndPermission(ctx context.Context, req *openapimodel.GetPersonalAccessTokenAndPermissionRequest) (*openapimodel.GetPersonalAccessTokenAndPermissionResponse, error) {

	resp := new(openapimodel.GetPersonalAccessTokenAndPermissionResponse)

	userID := ctxutil.GetUIDFromCtx(ctx)

	appReq := &entity.GetApiKey{
		ID: req.ID,
	}
	apiKeyResp, err := openapiAuthDomainSVC.Get(ctx, appReq)

	if err != nil {
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.GetPersonalAccessTokenAndPermission failed, err=%v", err)
		return resp, errors.New("GetPersonalAccessTokenAndPermission failed")
	}
	if apiKeyResp == nil {
		return resp, errors.New("GetPersonalAccessTokenAndPermission failed")
	}

	if apiKeyResp.UserID != *userID {
		return resp, errors.New("permission not match")
	}
	resp.Data = &openapimodel.GetPersonalAccessTokenAndPermissionResponseData{
		PersonalAccessToken: &openapimodel.PersonalAccessToken{
			ID:        apiKeyResp.ID,
			Name:      apiKeyResp.Name,
			ExpireAt:  apiKeyResp.ExpiredAt,
			CreatedAt: apiKeyResp.CreatedAt,
			UpdatedAt: apiKeyResp.UpdatedAt,
		},
	}
	return resp, nil
}

func (s *OpenAuthApplicationService) CreatePersonalAccessToken(ctx context.Context, req *openapimodel.CreatePersonalAccessTokenAndPermissionRequest) (*openapimodel.CreatePersonalAccessTokenAndPermissionResponse, error) {
	resp := new(openapimodel.CreatePersonalAccessTokenAndPermissionResponse)
	userID := ctxutil.GetUIDFromCtx(ctx)

	appReq := &entity.CreateApiKey{
		Name:   req.Name,
		Expire: req.ExpireAt,
		UserID: *userID,
	}

	if req.DurationDay == "customize" {
		appReq.Expire = req.ExpireAt
	} else {
		expireDay, err := strconv.ParseInt(req.DurationDay, 10, 64)
		if err != nil {
			return resp, errors.New("invalid expireDay")
		}
		appReq.Expire = time.Now().Add(time.Duration(expireDay) * time.Hour * 24).Unix()
	}

	apiKeyResp, err := openapiAuthDomainSVC.Create(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.CreatePersonalAccessToken failed, err=%v", err)
		return resp, errors.New("CreatePersonalAccessToken failed")
	}
	resp.Data = &openapimodel.CreatePersonalAccessTokenAndPermissionResponseData{
		PersonalAccessToken: &openapimodel.PersonalAccessToken{
			ID:       apiKeyResp.ID,
			Name:     apiKeyResp.Name,
			ExpireAt: apiKeyResp.ExpiredAt,

			CreatedAt: apiKeyResp.CreatedAt,
			UpdatedAt: apiKeyResp.UpdatedAt,
		},
		Token: apiKeyResp.ApiKey,
	}
	return resp, nil
}

func (s *OpenAuthApplicationService) ListPersonalAccessTokens(ctx context.Context, req *openapimodel.ListPersonalAccessTokensRequest) (*openapimodel.ListPersonalAccessTokensResponse, error) {

	resp := new(openapimodel.ListPersonalAccessTokensResponse)

	userID := ctxutil.GetUIDFromCtx(ctx)
	appReq := &entity.ListApiKey{
		UserID: *userID,
		Page:   *req.Page,
		Limit:  *req.Size,
	}

	apiKeyResp, err := openapiAuthDomainSVC.List(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.ListPersonalAccessTokens failed, err=%v", err)
		return resp, errors.New("ListPersonalAccessTokens failed")
	}

	if apiKeyResp == nil {
		return resp, nil
	}
	resp.Data = &openapimodel.ListPersonalAccessTokensResponseData{
		HasMore: apiKeyResp.HasMore,
		PersonalAccessTokens: slices.Transform(apiKeyResp.ApiKeys, func(a *entity.ApiKey) *openapimodel.PersonalAccessTokenWithCreatorInfo {
			lastUsedAt := a.LastUsedAt
			if lastUsedAt == 0 {
				lastUsedAt = -1
			}
			return &openapimodel.PersonalAccessTokenWithCreatorInfo{
				ID:         a.ID,
				Name:       a.Name,
				ExpireAt:   a.ExpiredAt,
				CreatedAt:  a.CreatedAt,
				UpdatedAt:  a.UpdatedAt,
				LastUsedAt: lastUsedAt,
			}
		}),
	}
	return resp, nil
}

func (s *OpenAuthApplicationService) DeletePersonalAccessTokenAndPermission(ctx context.Context, req *openapimodel.DeletePersonalAccessTokenAndPermissionRequest) (*openapimodel.DeletePersonalAccessTokenAndPermissionResponse, error) {
	resp := new(openapimodel.DeletePersonalAccessTokenAndPermissionResponse)

	userID := ctxutil.GetUIDFromCtx(ctx)

	appReq := &entity.DeleteApiKey{
		ID:     req.ID,
		UserID: *userID,
	}
	err := openapiAuthDomainSVC.Delete(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.DeletePersonalAccessTokenAndPermission failed, err=%v", err)
		return resp, errors.New("DeletePersonalAccessTokenAndPermission failed")
	}
	return resp, nil
}

func (s *OpenAuthApplicationService) UpdatePersonalAccessTokenAndPermission(ctx context.Context, req *openapimodel.UpdatePersonalAccessTokenAndPermissionRequest) (*openapimodel.UpdatePersonalAccessTokenAndPermissionResponse, error) {
	resp := new(openapimodel.UpdatePersonalAccessTokenAndPermissionResponse)
	userID := ctxutil.GetUIDFromCtx(ctx)

	upErr := openapiAuthDomainSVC.Save(ctx, &entity.SaveMeta{
		ID:     req.ID,
		Name:   ptr.Of(req.Name),
		UserID: *userID,
	})

	return resp, upErr
}

func (s *OpenAuthApplicationService) UpdateLastUsedAt(ctx context.Context, apiID int64, userID int64) error {
	upErr := openapiAuthDomainSVC.Save(ctx, &entity.SaveMeta{
		ID:         apiID,
		LastUsedAt: ptr.Of(time.Now().Unix()),
		UserID:     userID,
	})
	return upErr
}

func (s *OpenAuthApplicationService) CheckPermission(ctx context.Context, token string) (*entity.ApiKey, error) {
	appReq := &entity.CheckPermission{
		ApiKey: token,
	}
	apiKey, err := openapiAuthDomainSVC.CheckPermission(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.CheckPermission failed, err=%v", err)
		return nil, errors.New("CheckPermission failed")
	}
	return apiKey, nil
}
