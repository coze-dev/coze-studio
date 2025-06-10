package service

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/oauth2/clientcredentials"

	openauthModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
	"code.byted.org/flow/opencoze/backend/domain/openauth/oauth/entity"
	"code.byted.org/flow/opencoze/backend/domain/openauth/oauth/repository"
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

func (l *standardOAuth) GetAccessToken(ctx context.Context, req *GetAccessTokenRequest) (accessToken string, err error) {
	if req.OAuthInfo.OAuthMode != openauthModel.OAuthModeClientCredentials { // TODO: 暂时只支持 client_credentials
		return "", fmt.Errorf("[standardOAuth] invalid oauth mode '%s'", req.OAuthInfo.OAuthMode)
	}

	accessToken, err = l.getAccessTokenByClientCredentials(ctx, req.UserID, req.OAuthInfo.ClientCredentials)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (l *standardOAuth) getAccessTokenByClientCredentials(ctx context.Context, userID int64, cc *entity.ClientCredentials) (accessToken string, err error) {
	accessToken, err = l.oauthRepo.GetAccessToken(ctx, &repository.GetAccessTokenRequest{
		UserID:   userID,
		ClientID: cc.ClientID,
		TokenURL: cc.TokenURL,
		Scopes:   cc.Scopes,
	})
	if err != nil {
		logs.CtxWarnf(ctx, "[standardOAuth] get access token failed, clientID=%s, err=%s", cc.ClientID, err)
	}

	if accessToken != "" {
		return accessToken, nil
	}

	config := clientcredentials.Config{
		ClientID:     cc.ClientID,
		ClientSecret: cc.ClientSecret,
		TokenURL:     cc.TokenURL,
		Scopes:       cc.Scopes,
	}
	res, err := config.Token(ctx)
	if err != nil {
		return "", fmt.Errorf("[standardOAuth] get access token failed, err=%s", err)
	}

	expireIn := time.Duration(res.ExpiresIn-10) * time.Second

	err = l.oauthRepo.SetAccessToken(ctx, &repository.SetAccessTokenRequest{
		UserID:      userID,
		ClientID:    cc.ClientID,
		TokenURL:    cc.TokenURL,
		AccessToken: res.AccessToken,
		ExpiresIn:   &expireIn,
	})
	if err != nil {
		logs.CtxWarnf(ctx, "[standardOAuth] set access token failed, clientID=%s, err=%s", cc.ClientID, err)
	}

	return res.AccessToken, nil
}
