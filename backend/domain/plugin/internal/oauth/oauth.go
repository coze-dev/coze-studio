package oauth

import (
	"context"
	"sync"

	"github.com/go-resty/resty/v2"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
)

type OAuthService interface {
	GetAccessToken(ctx context.Context, oa *entity.OAuthInfo) (accessToken string, err error)
}

var (
	httpCli     *resty.Client
	httpCliOnce sync.Once
)

func NewOAuthClient(repo repository.OAuthRepository) OAuthService {
	httpCliOnce.Do(func() {
		httpCli = resty.New()
	})

	return newStandardOAuth(repo)
}
