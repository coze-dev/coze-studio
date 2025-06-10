package openauth

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/pkg/errors"

	openapimodel "code.byted.org/flow/opencoze/backend/api/model/permission/openapiauth"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	oauth "code.byted.org/flow/opencoze/backend/domain/openauth/oauth/service"
	openapi "code.byted.org/flow/opencoze/backend/domain/openauth/openapiauth"
	"code.byted.org/flow/opencoze/backend/domain/openauth/openapiauth/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type OpenAuthApplicationService struct {
	OpenAPIDomainSVC openapi.APIAuth
	OAuthDomainSVC   oauth.OAuthService
}

var OpenAuthApplication = &OpenAuthApplicationService{}

func (s *OpenAuthApplicationService) GetPersonalAccessTokenAndPermission(ctx context.Context, req *openapimodel.GetPersonalAccessTokenAndPermissionRequest) (*openapimodel.GetPersonalAccessTokenAndPermissionResponseData, error) {
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
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.GetPersonalAccessTokenAndPermission failed, err=%v", err)
		return nil, errors.New("GetPersonalAccessTokenAndPermission failed")
	}
	if apiKeyResp == nil {
		return nil, errors.New("GetPersonalAccessTokenAndPermission failed")
	}

	if apiKeyResp.UserID != *userID {
		return nil, errors.New("permission not match")
	}

	return &openapimodel.GetPersonalAccessTokenAndPermissionResponseData{
		PersonalAccessToken: &openapimodel.PersonalAccessToken{
			ID:        fmt.Sprintf("%d", apiKeyResp.ID),
			Name:      apiKeyResp.Name,
			ExpireAt:  apiKeyResp.ExpiredAt,
			CreatedAt: apiKeyResp.CreatedAt,
			UpdatedAt: apiKeyResp.UpdatedAt,
		},
	}, nil
}

func (s *OpenAuthApplicationService) CreatePersonalAccessToken(ctx context.Context, req *openapimodel.CreatePersonalAccessTokenAndPermissionRequest) (*openapimodel.CreatePersonalAccessTokenAndPermissionResponseData, error) {
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
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.CreatePersonalAccessToken failed, err=%v", err)
		return nil, errors.New("CreatePersonalAccessToken failed")
	}

	return &openapimodel.CreatePersonalAccessTokenAndPermissionResponseData{
		PersonalAccessToken: &openapimodel.PersonalAccessToken{
			ID:       strconv.FormatInt(apiKeyResp.ID, 10),
			Name:     apiKeyResp.Name,
			ExpireAt: apiKeyResp.ExpiredAt,

			CreatedAt: apiKeyResp.CreatedAt,
			UpdatedAt: apiKeyResp.UpdatedAt,
		},
		Token: apiKeyResp.ApiKey,
	}, nil
}

func (s *OpenAuthApplicationService) ListPersonalAccessTokens(ctx context.Context, req *openapimodel.ListPersonalAccessTokensRequest) (*openapimodel.ListPersonalAccessTokensResponseData, error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	appReq := &entity.ListApiKey{
		UserID: *userID,
		Page:   *req.Page,
		Limit:  *req.Size,
	}

	apiKeyResp, err := openapiAuthDomainSVC.List(ctx, appReq)
	if err != nil {
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.ListPersonalAccessTokens failed, err=%v", err)
		return nil, errors.New("ListPersonalAccessTokens failed")
	}

	if apiKeyResp == nil {
		return nil, nil
	}

	listData := &openapimodel.ListPersonalAccessTokensResponseData{}

	listData.PersonalAccessTokens = slices.Transform(apiKeyResp.ApiKeys, func(a *entity.ApiKey) *openapimodel.PersonalAccessTokenWithCreatorInfo {
		return &openapimodel.PersonalAccessTokenWithCreatorInfo{
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

func (s *OpenAuthApplicationService) DeletePersonalAccessTokenAndPermission(ctx context.Context, req *openapimodel.DeletePersonalAccessTokenAndPermissionRequest) error {
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
		logs.CtxErrorf(ctx, "OpenAuthApplicationService.DeletePersonalAccessTokenAndPermission failed, err=%v", err)
		return errors.New("DeletePersonalAccessTokenAndPermission failed")
	}
	return nil
}

func (s *OpenAuthApplicationService) UpdatePersonalAccessTokenAndPermission(ctx context.Context, req *openapimodel.UpdatePersonalAccessTokenAndPermissionRequest) error {
	userID := ctxutil.GetUIDFromCtx(ctx)

	upErr := openapiAuthDomainSVC.Save(ctx, &entity.SaveMeta{
		ID:     req.ID,
		Name:   req.Name,
		UserID: *userID,
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
