package crossopenauth

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
)

type OAuthService interface {
	GetAccessToken(ctx context.Context, req *model.GetAccessTokenRequest) (accessToken string, err error)
}

var defaultOAuthSVC OAuthService

func DefaultOAuthSVC() OAuthService {
	return defaultOAuthSVC
}

func SetDefaultOAuthSVC(svc OAuthService) {
	defaultOAuthSVC = svc
}
