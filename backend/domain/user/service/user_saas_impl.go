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
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
func (s *CozeUserService) GetUserInfo(ctx context.Context) (*entity.SaasUserData, error) {
	resp, err := s.client.Get(ctx, "/v1/users/me")
	if err != nil {
		logs.CtxErrorf(ctx, "failed to call GetUserInfo API: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "API call failed"))
	}

	// Parse the data field
	var userData entity.SaasUserData

	if err := json.Unmarshal(resp.Data, &userData); err != nil {
		logs.CtxErrorf(ctx, "failed to parse user data: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "data parse failed"))
	}

	// Map to entity.SaasUserData
	return &entity.SaasUserData{
		UserID:    userData.UserID,
		UserName:  userData.UserName,
		NickName:  userData.NickName,
		AvatarURL: userData.AvatarURL,
	}, nil
}

func (s *CozeUserService) GetEnterpriseBenefit(ctx context.Context, req *entity.GetEnterpriseBenefitRequest) (*entity.UserBenefit, error) {

	queryParams := make(map[string]interface{})
	if req.BenefitType != nil {
		queryParams["benefit_type_list"] = *req.BenefitType
	}
	if req.ResourceID != nil {
		queryParams["resource_id"] = *req.ResourceID
	}

	resp, err := s.client.GetWithQuery(ctx, "/v1/commerce/benefit/benefits/get", queryParams)
	if err != nil {
		logs.CtxErrorf(ctx, "failed to call GetEnterpriseBenefit API: %v", err)
		return nil, nil
	}

	var benefitData entity.BenefitData
	userBenefit := &entity.UserBenefit{}
	if err := json.Unmarshal(resp.Data, &benefitData); err != nil {
		logs.CtxErrorf(ctx, "failed to parse benefit data: %v", err)
		return nil, nil
	}

	for _, userBenefitInfo := range benefitData.BenefitInfo {

		if userBenefitInfo != nil && userBenefitInfo.BenefitType == entity.BenefitTypeCallToolLimit && userBenefitInfo.Basic != nil && userBenefitInfo.Basic.ItemInfo != nil {
			userBenefit.UsedCount = int32(userBenefitInfo.Basic.ItemInfo.Used)
			userBenefit.TotalCount = int32(userBenefitInfo.Basic.ItemInfo.Total)
			userBenefit.IsUnlimited = func() bool {
				return userBenefitInfo.Basic.ItemInfo.Strategy == entity.ResourceUsageStrategyUnlimit
			}()
			userBenefit.ResetDatetime = userBenefitInfo.Basic.ItemInfo.EndAt + 1
		}
		if userBenefitInfo != nil && userBenefitInfo.BenefitType == entity.BenefitTypeAPIRunQPS && userBenefitInfo.Effective != nil && userBenefitInfo.Effective.ItemInfo != nil {
			userBenefit.CallQPS = int32(userBenefitInfo.Effective.ItemInfo.Total)
		}
	}

	if benefitData.BasicInfo != nil {
		userBenefit.UserLevel = benefitData.BasicInfo.UserLevel
	}

	return userBenefit, nil
}

func (s *CozeUserService) GetUserBenefit(ctx context.Context) (*entity.UserBenefit, error) {

	req := &entity.GetEnterpriseBenefitRequest{
		BenefitType: ptr.Of(string(entity.BenefitTypeCallToolLimit) + "," + string(entity.BenefitTypeAPIRunQPS)),
		ResourceID:  ptr.Of("plugin"),
	}
	benefit, err := s.GetEnterpriseBenefit(ctx, req)
	if err != nil {
		return nil, err
	}

	return benefit, nil
}

var cozeUserService *CozeUserService

func getCozeUserService() *CozeUserService {
	if cozeUserService == nil {
		cozeUserService = NewCozeUserService()
	}
	return cozeUserService
}

func (u *userImpl) GetSaasUserInfo(ctx context.Context) (*entity.SaasUserData, error) {
	return getCozeUserService().GetUserInfo(ctx)
}

func (u *userImpl) GetUserBenefit(ctx context.Context) (*entity.UserBenefit, error) {
	return getCozeUserService().GetUserBenefit(ctx)
}
