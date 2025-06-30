package service

import (
	"context"
	"fmt"

	"github.com/go-resty/resty/v2"
	"golang.org/x/oauth2"
	"gorm.io/gorm"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	OSS        storage.Storage
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
	OAuthRepo  repository.OAuthRepository
}

func NewService(components *Components) PluginService {
	return &pluginServiceImpl{
		db:         components.DB,
		oss:        components.OSS,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
		oauthRepo:  components.OAuthRepo,
		httpCli:    resty.New(),
	}
}

type pluginServiceImpl struct {
	db         *gorm.DB
	oss        storage.Storage
	pluginRepo repository.PluginRepository
	toolRepo   repository.ToolRepository
	oauthRepo  repository.OAuthRepository
	httpCli    *resty.Client
}

func (p *pluginServiceImpl) GetOAuthStatus(ctx context.Context, userID, pluginID int64) (resp *GetOAuthStatusResponse, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", pluginID)
	}

	authInfo := pl.GetAuthInfo()
	if authInfo.Type == model.AuthzTypeOfNone || authInfo.Type == model.AuthzTypeOfService {
		return &GetOAuthStatusResponse{
			IsOauth: false,
		}, nil
	}

	if authInfo.Type != model.AuthzTypeOfOAuth {
		return nil, fmt.Errorf("invalid auth type '%v'", authInfo.Type)
	}
	if authInfo.SubType != model.AuthzSubTypeOfOAuthAuthorizationCode {
		return nil, fmt.Errorf("invalid auth sub type '%v'", authInfo.SubType)
	}

	authCode := &entity.AuthorizationCodeInfo{
		Meta: &entity.AuthorizationCodeMeta{
			UserID:   conv.Int64ToStr(userID),
			PluginID: pluginID,
			IsDraft:  true,
		},
		Config: pl.Manifest.Auth.AuthOfOAuthAuthorizationCode,
	}

	accessToken, err := p.GetAccessToken(ctx, &entity.OAuthInfo{
		OAuthMode:         model.AuthzSubTypeOfOAuthAuthorizationCode,
		AuthorizationCode: authCode,
	})
	if err != nil {
		return nil, err
	}

	status := common.OAuthStatus_Authorized
	if accessToken == "" {
		status = common.OAuthStatus_Unauthorized
	}

	authURL, err := genAuthURL(authCode)
	if err != nil {
		return nil, err
	}

	resp = &GetOAuthStatusResponse{
		IsOauth:  true,
		Status:   status,
		OAuthURL: authURL,
	}

	return resp, nil
}

func genAuthURL(info *entity.AuthorizationCodeInfo) (string, error) {
	conf := oauth2.Config{
		ClientID:     info.Config.ClientID,
		ClientSecret: info.Config.ClientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  info.Config.ClientURL,
			TokenURL: info.Config.AuthorizationURL,
		},
		RedirectURL: "http://localhost:3000/api/oauth/authorization_code",
		Scopes:      info.Config.Scopes,
	}

	state := &entity.State{
		ClientName: "",
		UserID:     info.Meta.UserID,
		PluginID:   info.Meta.PluginID,
		IsDraft:    info.Meta.IsDraft,
	}
	encryptState, err := state.EncryptState()
	if err != nil {
		return "", fmt.Errorf("encrypt state failed, err=%v", err)
	}

	authURL := conf.AuthCodeURL(encryptState)

	return authURL, nil
}
