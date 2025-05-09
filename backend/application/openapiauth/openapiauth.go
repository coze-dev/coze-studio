package openapiauth

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/pkg/errors"

	"code.byted.org/flow/opencoze/backend/api/model/permission/openapiauth"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type OpenApiAuthApplicationService struct{}

var OpenApiAuthApplication = new(OpenApiAuthApplicationService)

func (s *OpenApiAuthApplicationService) GetPersonalAccessTokenAndPermission(ctx context.Context, req *openapiauth.GetPersonalAccessTokenAndPermissionRequest) (*openapiauth.GetPersonalAccessTokenAndPermissionResponseData, error) {
	userID := ctxutil.GetUIDFromCtx(ctx)

	apiKeyID, err := strconv.ParseInt(req.ID, 10, 64)
	if err != nil {
		return nil, errors.New("invalid apiKeyID")
	}
	appReq := &entity.GetApiKey{
		ID: apiKeyID,
	}
	apiKeyResp, err := openapiAuthDomainSVC.Get(ctx, appReq)

	if err != nil {
		logs.CtxErrorf(ctx, "OpenApiAuthApplicationService.GetPersonalAccessTokenAndPermission failed, err=%v", err)
		return nil, errors.New("GetPersonalAccessTokenAndPermission failed")
	}
	if apiKeyResp == nil {
		return nil, errors.New("GetPersonalAccessTokenAndPermission failed")
	}

	if apiKeyResp.UserID != *userID {
		return nil, errors.New("permission not match")
	}

	return &openapiauth.GetPersonalAccessTokenAndPermissionResponseData{
		PersonalAccessToken: &openapiauth.PersonalAccessToken{
			ID:        fmt.Sprintf("%d", apiKeyResp.ID),
			Name:      apiKeyResp.Name,
			ExpireAt:  apiKeyResp.ExpiredAt,
			CreatedAt: apiKeyResp.CreatedAt,
			UpdatedAt: apiKeyResp.UpdatedAt,
		},
	}, nil
}

func (s *OpenApiAuthApplicationService) CreatePersonalAccessToken(ctx context.Context, req *openapiauth.CreatePersonalAccessTokenAndPermissionRequest) (*openapiauth.CreatePersonalAccessTokenAndPermissionResponseData, error) {
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
			return nil, errors.New("invalid expireDay")
		}
		appReq.Expire = time.Now().Add(time.Duration(expireDay) * time.Hour * 24).Unix()
	}

	apiKeyResp, err := openapiAuthDomainSVC.Create(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenApiAuthApplicationService.CreatePersonalAccessToken failed, err=%v", err)
		return nil, errors.New("CreatePersonalAccessToken failed")
	}

	return &openapiauth.CreatePersonalAccessTokenAndPermissionResponseData{
		PersonalAccessToken: &openapiauth.PersonalAccessToken{
			ID:       strconv.FormatInt(apiKeyResp.ID, 10),
			Name:     apiKeyResp.Name,
			ExpireAt: apiKeyResp.ExpiredAt,

			CreatedAt: apiKeyResp.CreatedAt,
			UpdatedAt: apiKeyResp.UpdatedAt,
		},
		Token: apiKeyResp.ApiKey,
	}, nil
}

func (s *OpenApiAuthApplicationService) ListPersonalAccessTokens(ctx context.Context, req *openapiauth.ListPersonalAccessTokensRequest) (*openapiauth.ListPersonalAccessTokensResponseData, error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	appReq := &entity.ListApiKey{
		UserID: *userID,
		Page:   *req.Page,
		Limit:  *req.Size,
	}

	apiKeyResp, err := openapiAuthDomainSVC.List(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenApiAuthApplicationService.ListPersonalAccessTokens failed, err=%v", err)
		return nil, errors.New("ListPersonalAccessTokens failed")
	}

	if apiKeyResp == nil {
		return nil, nil
	}

	listData := &openapiauth.ListPersonalAccessTokensResponseData{}

	listData.PersonalAccessTokens = slices.Transform(apiKeyResp.ApiKeys, func(a *entity.ApiKey) *openapiauth.PersonalAccessTokenWithCreatorInfo {
		return &openapiauth.PersonalAccessTokenWithCreatorInfo{
			ID:        strconv.FormatInt(a.ID, 10),
			Name:      a.Name,
			ExpireAt:  a.ExpiredAt,
			CreatedAt: a.CreatedAt,
			UpdatedAt: a.UpdatedAt,
		}
	})
	listData.HasMore = apiKeyResp.HasMore

	return listData, nil
}

func (s *OpenApiAuthApplicationService) DeletePersonalAccessTokenAndPermission(ctx context.Context, req *openapiauth.DeletePersonalAccessTokenAndPermissionRequest) error {
	userID := ctxutil.GetUIDFromCtx(ctx)
	apiKeyID, err := strconv.ParseInt(req.ID, 10, 64)
	if err != nil {
		return errors.New("invalid apiKeyID")
	}
	appReq := &entity.DeleteApiKey{
		ID:     apiKeyID,
		UserID: *userID,
	}
	err = openapiAuthDomainSVC.Delete(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenApiAuthApplicationService.DeletePersonalAccessTokenAndPermission failed, err=%v", err)
		return errors.New("DeletePersonalAccessTokenAndPermission failed")
	}
	return nil
}

func (s *OpenApiAuthApplicationService) UpdatePersonalAccessTokenAndPermission(ctx context.Context, req *openapiauth.UpdatePersonalAccessTokenAndPermissionRequest) error {
	userID := ctxutil.GetUIDFromCtx(ctx)

	upErr := openapiAuthDomainSVC.Save(ctx, &entity.SaveMeta{
		ID:     req.ID,
		Name:   req.Name,
		UserID: *userID,
	})

	return upErr
}
