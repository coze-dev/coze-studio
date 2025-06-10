package service

import (
	"context"
	"fmt"
	"sync"

	"github.com/go-resty/resty/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
	repository2 "code.byted.org/flow/opencoze/backend/domain/openauth/oauth/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	httpClient     *resty.Client
	httpClientOnce sync.Once
)

type Components struct {
	IDGen    idgen.IDGenerator
	DB       *gorm.DB
	CacheCli *redis.Client
}

func NewService(components *Components) OAuthService {
	httpClientOnce.Do(func() {
		httpClient = resty.New()
		httpClient.SetRetryCount(3).
			SetRetryWaitTime(200).
			SetRetryMaxWaitTime(1000)
	})

	return &oauthServiceImpl{
		db:   components.DB,
		repo: repository2.NewOAuthRepo(components.CacheCli),
	}
}

type oauthServiceImpl struct {
	db   *gorm.DB
	repo repository2.OAuthRepository
}

func (o *oauthServiceImpl) GetAccessToken(ctx context.Context, req *GetAccessTokenRequest) (accessToken string, err error) {
	pr, err := o.getOAuthProvider(ctx, req)
	if err != nil {
		return "", err
	}

	return pr.GetAccessToken(ctx, req)
}

func (o *oauthServiceImpl) getOAuthProvider(ctx context.Context, req *GetAccessTokenRequest) (pr OAuthService, err error) {
	switch req.OAuthInfo.OAuthProvider {
	case model.OAuthProviderOfLark:
		return newLarkOAuth(o.repo), nil
	case model.OAuthProviderOfStandard:
		return newStandardOAuth(o.repo), nil
	default:
		return nil, fmt.Errorf("invalid oauth provider '%s'", req.OAuthInfo.OAuthProvider)
	}
}
