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

func (s *CozeUserService) GetEnterpriseBenefit(ctx context.Context, req *entity.GetEnterpriseBenefitRequest) (*entity.GetEnterpriseBenefitResponse, error) {

	queryParams := make(map[string]interface{})
	if req.BenefitType != nil {
		queryParams["benefit_type"] = *req.BenefitType
	}
	if req.ResourceID != nil {
		queryParams["resource_id"] = *req.ResourceID
	}

	resp, err := s.client.GetWithQuery(ctx, "/v1/commerce/benefit/benefits/get?benefit_type=call_tool_limit", queryParams)
	if err != nil {
		logs.CtxErrorf(ctx, "failed to call GetEnterpriseBenefit API: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "API call failed"))
	}

	var benefitData entity.BenefitData
	if err := json.Unmarshal(resp.Data, &benefitData); err != nil {
		logs.CtxErrorf(ctx, "failed to parse benefit data: %v", err)
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "data parse failed"))
	}

	// Validate parsed data
	if benefitData.BasicInfo != nil && !benefitData.BasicInfo.UserLevel.IsValid() {
		logs.CtxWarnf(ctx, "invalid user level: %s", benefitData.BasicInfo.UserLevel)
	}

	for _, benefitInfo := range benefitData.BenefitInfo {
		if benefitInfo != nil && benefitInfo.Basic != nil && !benefitInfo.Basic.Status.IsValid() {
			logs.CtxWarnf(ctx, "invalid benefit status: %s", benefitInfo.Basic.Status)
		}
		if benefitInfo != nil && benefitInfo.Basic != nil && benefitInfo.Basic.ItemInfo != nil && !benefitInfo.Basic.ItemInfo.Strategy.IsValid() {
			logs.CtxWarnf(ctx, "invalid resource usage strategy: %s", benefitInfo.Basic.ItemInfo.Strategy)
		}
	}

	benefit := &entity.GetEnterpriseBenefitResponse{
		Code:    int32(resp.Code),
		Message: resp.Msg,
		Data:    &benefitData,
	}

	logs.CtxInfof(ctx, "successfully retrieved enterprise benefit data, user_level: %s, benefit_count: %d",
		benefit.Data.BasicInfo.UserLevel, len(benefit.Data.BenefitInfo))

	return benefit, nil
}

func (s *CozeUserService) GetUserBenefit(ctx context.Context) (*entity.UserBenefit, error) {

	benefitType := entity.BenefitTypeCallToolLimit
	req := &entity.GetEnterpriseBenefitRequest{
		BenefitType: &benefitType,
	}
	benefit, err := s.GetEnterpriseBenefit(ctx, req)
	if err != nil {
		return nil, err
	}
	if benefit.Data == nil || len(benefit.Data.BenefitInfo) == 0 {
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("reason", "benefit info not found"))
	}
	var resetDatetime int64
	if benefit.Data.BenefitInfo[0].Basic != nil && benefit.Data.BenefitInfo[0].Basic.ItemInfo != nil {
		resetDatetime = benefit.Data.BenefitInfo[0].Basic.ItemInfo.EndAt + 1
	}
	return &entity.UserBenefit{
		ResetDatetime: resetDatetime,
		UsedCount:  int32(benefit.Data.BenefitInfo[0].Basic.ItemInfo.Used),
		TotalCount: int32(benefit.Data.BenefitInfo[0].Basic.ItemInfo.Total),
		IsUnlimited: func() bool {
			return benefit.Data.BenefitInfo[0].Basic.ItemInfo.Strategy == entity.ResourceUsageStrategyUnlimit
		}(),
	}, nil
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
