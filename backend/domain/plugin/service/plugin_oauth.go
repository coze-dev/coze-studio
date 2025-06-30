package service

import (
	"context"
	"fmt"
	"time"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (p *pluginServiceImpl) GetAccessToken(ctx context.Context, oa *entity.OAuthInfo) (accessToken string, err error) {
	switch oa.OAuthMode {
	case model.AuthzSubTypeOfOAuthAuthorizationCode:
		accessToken, err = p.getAccessTokenByAuthorizationCode(ctx, oa.AuthorizationCode)
	default:
		return "", fmt.Errorf("invalid oauth mode '%s'", oa.OAuthMode)
	}
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (p *pluginServiceImpl) getAccessTokenByAuthorizationCode(ctx context.Context, ci *entity.AuthorizationCodeInfo) (accessToken string, err error) {
	meta := ci.Meta
	info, exist, err := p.oauthRepo.GetAuthorizationCodeInfo(ctx, ci.Meta)
	if err != nil {
		return "", errorx.Wrapf(err, "GetAuthorizationCodeInfo failed, userID=%s, pluginID=%d, isDraft=%p",
			meta.UserID, meta.PluginID, meta.IsDraft)
	}
	if !exist {
		return "", nil
	}

	if !isValidAuthCodeConfig(info.Config, ci.Config, info.TokenExpiredAtMS) {
		logs.CtxInfof(ctx, "oauth config has updated, userID=%s, pluginID=%d, isDraft=%t",
			meta.UserID, meta.PluginID, meta.IsDraft)
		return "", nil
	}

	return info.AccessToken, nil
}

func isValidAuthCodeConfig(o, n *model.OAuthAuthorizationCodeConfig, expireAt int64) bool {
	if expireAt > 0 && time.Now().UnixMilli() >= expireAt {
		return false
	}
	if o.ClientID != n.ClientID {
		return false
	}
	if o.ClientSecret != n.ClientSecret {
		return false
	}
	if o.ClientURL != n.ClientURL {
		return false
	}
	if o.AuthorizationURL != n.AuthorizationURL {
		return false
	}
	if o.AuthorizationContentType != n.AuthorizationContentType {
		return false
	}

	if len(o.Scopes) != len(n.Scopes) {
		return false
	}
	m := make(map[string]bool, len(o.Scopes))
	for _, v := range o.Scopes {
		m[v] = false
	}
	for _, v := range n.Scopes {
		if _, ok := m[v]; !ok {
			return false
		}
	}

	return true
}

func (p *pluginServiceImpl) SaveAccessToken(ctx context.Context, oa *entity.OAuthInfo) (err error) {
	switch oa.OAuthMode {
	case model.AuthzSubTypeOfOAuthAuthorizationCode:
		err = p.saveAuthCodeAccessToken(ctx, oa.AuthorizationCode)
	default:
		return fmt.Errorf("[standardOAuth] invalid oauth mode '%s'", oa.OAuthMode)
	}

	return err
}

func (p *pluginServiceImpl) saveAuthCodeAccessToken(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error) {
	if info.TokenExpiredAtMS > 0 {
		info.NextTokenRefreshAtMS = info.TokenExpiredAtMS - 30*time.Second.Milliseconds()
	}

	meta := info.Meta
	err = p.oauthRepo.UpsertAuthorizationCodeInfo(ctx, info)
	if err != nil {
		return errorx.Wrapf(err, "SaveAuthorizationCodeInfo failed, userID=%s, pluginID=%d, isDraft=%p",
			meta.UserID, meta.PluginID, meta.IsDraft)
	}

	return nil
}
