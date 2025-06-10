package service

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
)

type OAuthService interface {
	GetAccessToken(ctx context.Context, req *GetAccessTokenRequest) (accessToken string, err error)
}

type GetAccessTokenRequest = model.GetAccessTokenRequest
