package service

import (
	"context"
	"fmt"
	"time"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
	"code.byted.org/flow/opencoze/backend/domain/openauth/oauth/entity"
	"code.byted.org/flow/opencoze/backend/domain/openauth/oauth/repository"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type larkOAuth struct {
	oauthRepo repository.OAuthRepository
}

func newLarkOAuth(oauthRepo repository.OAuthRepository) *larkOAuth {
	return &larkOAuth{
		oauthRepo: oauthRepo,
	}
}

func (l *larkOAuth) GetAccessToken(ctx context.Context, req *GetAccessTokenRequest) (accessToken string, err error) {
	if req.OAuthInfo.OAuthMode != model.OAuthModeClientCredentials { // TODO: 暂时只支持 client_credentials
		return "", fmt.Errorf("[larkOAuth] invalid oauth mode '%s'", req.OAuthInfo.OAuthMode)
	}

	accessToken, err = l.getAccessTokenByClientCredentials(ctx, req.UserID, req.OAuthInfo.ClientCredentials)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (l *larkOAuth) getAccessTokenByClientCredentials(ctx context.Context, userID int64, cc *entity.ClientCredentials) (accessToken string, err error) {
	accessToken, err = l.oauthRepo.GetAccessToken(ctx, &repository.GetAccessTokenRequest{
		UserID:   userID,
		ClientID: cc.ClientID,
		TokenURL: cc.TokenURL,
		Scopes:   cc.Scopes,
	})
	if err != nil {
		logs.CtxWarnf(ctx, "[larkOAuth] get access token failed, clientID=%s, err=%s", cc.ClientID, err)
	}

	if accessToken != "" {
		return accessToken, nil
	}

	type result struct {
		AppAccessToken    string `json:"app_access_token"`
		Code              int    `json:"code"`
		Expire            int    `json:"expire"`
		Msg               string `json:"msg"`
		TenantAccessToken string `json:"tenant_access_token"`
	}

	res := &result{}
	body := map[string]string{
		"app_id":     cc.ClientID,
		"app_secret": cc.ClientSecret,
	}

	resp, err := httpClient.R().
		SetBody(body).
		SetHeader("Content-Type", "application/json").
		SetResult(res).
		Post(cc.TokenURL)
	if err != nil {
		return "", err
	}
	if resp.IsError() {
		return "", fmt.Errorf("[larkOAuth] get access token failed, code=%d, msg=%s", resp.StatusCode(), resp.String())
	}
	if res.Code != 0 {
		return "", fmt.Errorf("[larkOAuth] get access token failed, code=%d, msg=%s", res.Code, res.Msg)
	}

	expiresIn := time.Duration(res.Expire-10) * time.Second

	err = l.oauthRepo.SetAccessToken(ctx, &repository.SetAccessTokenRequest{
		UserID:      userID,
		ClientID:    cc.ClientID,
		TokenURL:    cc.TokenURL,
		AccessToken: res.TenantAccessToken,
		ExpiresIn:   &expiresIn,
	})
	if err != nil {
		logs.CtxWarnf(ctx, "[larkOAuth] set access token failed, clientID=%s, err=%s", cc.ClientID, err)
	}

	return res.TenantAccessToken, nil
}
