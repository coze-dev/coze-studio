package openauth

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossopenauth"
	oauth "code.byted.org/flow/opencoze/backend/domain/openauth/oauth/service"
)

var defaultSVC crossopenauth.OAuthService

type impl struct {
	DomainSVC oauth.OAuthService
}

func InitDomainService(c oauth.OAuthService) crossopenauth.OAuthService {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i impl) GetPluginAccessToken(ctx context.Context, req *model.GetPluginAccessTokenRequest) (accessToken string, err error) {
	return i.DomainSVC.GetPluginAccessToken(ctx, req)
}
