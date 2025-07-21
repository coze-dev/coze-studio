package lark

import (
	"context"
	"errors"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/lark/http"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"gorm.io/gorm"
)

type LarkFetcher struct {
	authDao repository.AuthRepo
	config  *dataconnector.ConnectorConfig
}

func NewLarkFetcher(db *gorm.DB, config *dataconnector.ConnectorConfig) *LarkFetcher {
	return &LarkFetcher{
		config:  config,
		authDao: repository.NewAuthDAO(db),
	}
}

func (l *LarkFetcher) GetAuthInfo(ctx context.Context, creatorID int64) ([]*dataconnector.AuthInfo, error) {
	auths, err := l.authDao.GetAuthInfoByCreatorIDAndConnectorID(ctx, creatorID, l.config.ConnectorID)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetAuthInfo] GetAuthByCreatorID error:%v", err)
		return nil, errors.New("get auth info error")
	}
	resp, err := slices.TransformWithErrorCheck(auths, l.fromModelAuth)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetAuthInfo] TransformWithErrorCheck error:%v", err)
		return nil, errors.New("transform auth info error")
	}
	return resp, nil
}

func (l *LarkFetcher) GetConsentURL(ctx context.Context) (string, error) {
	return l.config.AuthConfig.AuthorizationURI, nil
}

func (l *LarkFetcher) AuthorizeCode(ctx context.Context, creatorID int64, code string) error {
	// get token
	authParam := http.FeishuAuthParam{
		AppId:     l.config.AuthConfig.ClientID,
		AppSecret: l.config.AuthConfig.ClientSecret,
	}
}

func (l *LarkFetcher) fromModelAuth(auth *model.Auth) (*dataconnector.AuthInfo, error) {
	if auth == nil {
		return nil, errors.New("auth is nil")
	}
	authInfo := &dataconnector.AuthInfo{
		ID:          auth.ID,
		CreatorID:   auth.CreatorID,
		ConnectorID: auth.ConnectorID,
		Name:        auth.Name,
		Icon:        auth.Icon,
		AuthType:    auth.AuthType,
		AuthInfo: dataconnector.AuthTokenInfo{
			AccessToken:     auth.AuthInfo.AccessToken,
			RefreshToken:    auth.AuthInfo.RefreshToken,
			TokenExpireIn:   auth.AuthInfo.TokenExpireIn,
			RefreshExpireIn: auth.AuthInfo.RefreshExpireIn,
			Scope:           auth.AuthInfo.Scope,
			Extra:           auth.AuthInfo.Extra,
		},
	}
	return authInfo, nil
}
