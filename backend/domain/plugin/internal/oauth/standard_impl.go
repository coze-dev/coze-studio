package oauth

import (
	"context"
	"fmt"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type standardOAuth struct {
	oauthRepo repository.OAuthRepository
}

func newStandardOAuth(oauthRepo repository.OAuthRepository) *standardOAuth {
	return &standardOAuth{
		oauthRepo: oauthRepo,
	}
}

func (l *standardOAuth) GetAccessToken(ctx context.Context, oa *entity.OAuthInfo) (accessToken string, err error) {
	switch oa.OAuthMode {
	case model.AuthzSubTypeOfOAuthAuthorizationCode:
		accessToken, err = l.getAccessTokenByAuthorizationCode(ctx, oa.AuthorizationCode)
	default:
		return "", fmt.Errorf("[standardOAuth] invalid oauth mode '%s'", oa.OAuthMode)
	}

	return accessToken, nil
}

func (l *standardOAuth) getAccessTokenByAuthorizationCode(ctx context.Context, ci *entity.AuthorizationCodeInfo) (accessToken string, err error) {
	meta := ci.Meta

	info, exist, err := l.oauthRepo.GetAuthorizationCode(ctx, ci.Meta)
	if err != nil {
		return "", errorx.Wrapf(err, "[standardOAuth] GetAuthorizationCode failed, userID=%s, pluginID=%d, isDraft=%t",
			meta.UserID, meta.PluginID, meta.IsDraft)
	}
	if !exist {
		return "", nil
	}

	if hasUpdatedAuthCodeConfig(info.Config, ci.Config) {
		logs.CtxInfof(ctx, "[standardOAuth] oauth config has updated, userID=%s, pluginID=%d, isDraft=%t",
			meta.UserID, meta.PluginID, meta.IsDraft)
		return "", nil
	}

	return info.AccessToken, nil
}

func hasUpdatedAuthCodeConfig(o, n *model.OAuthAuthorizationCodeConfig) bool {
	if o.ClientID != n.ClientID {
		return true
	}
	if o.ClientSecret != n.ClientSecret {
		return true
	}
	if o.ClientURL != n.ClientURL {
		return true
	}
	if o.AuthorizationURL != n.AuthorizationURL {
		return true
	}
	if o.AuthorizationContentType != n.AuthorizationContentType {
		return true
	}

	if len(o.Scopes) != len(n.Scopes) {
		return false
	}
	m := make(map[string]bool, len(o.Scopes))
	for _, v := range o.Scopes {
		m[v] = true
	}
	for _, v := range n.Scopes {
		if _, ok := m[v]; !ok {
			return false
		}
	}

	return true
}
