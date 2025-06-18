package repository

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/openauth/oauth/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
)

type oauthRepoImpl struct {
	cache *dal.OAuthCache
}

func NewOAuthRepo(cacheCli *redis.Client) OAuthRepository {
	return &oauthRepoImpl{
		cache: dal.NewOAuthCache(cacheCli),
	}
}

func (o *oauthRepoImpl) GetAccessToken(ctx context.Context, req *GetAccessTokenRequest) (accessToken string, err error) {
	key, err := o.makeAccessTokenKey(req.UserID, req.ClientID, req.TokenURL, req.Scopes)
	if err != nil {
		return "", err
	}

	accessToken, _, err = o.cache.Get(ctx, key)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (o *oauthRepoImpl) SetAccessToken(ctx context.Context, req *SetAccessTokenRequest) (err error) {
	key, err := o.makeAccessTokenKey(req.UserID, req.ClientID, req.TokenURL, req.Scopes)
	if err != nil {
		return err
	}

	return o.cache.Set(ctx, key, req.AccessToken, req.ExpiresIn)
}

func (o *oauthRepoImpl) makeAccessTokenKey(userID string, clientID string, tokenURL string, scopes []string) (string, error) {
	urlParse, err := url.Parse(tokenURL)
	if err != nil {
		return "", fmt.Errorf("parse token url failed, err=%v", err)
	}

	var key string
	if len(scopes) == 0 {
		key = fmt.Sprintf("access_token:%s:%s:%s", userID, clientID, urlParse.Hostname())
	} else {
		scope := strings.Join(scopes, ",")
		key = fmt.Sprintf("access_token:%s:%s:%s:%s", userID, clientID, urlParse.Hostname(), scope)
	}

	return key, nil
}
