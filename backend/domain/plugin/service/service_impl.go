package service

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	openauthModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossopenauth"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
}

func NewService(components *Components) PluginService {
	return &pluginServiceImpl{
		db:         components.DB,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
	}
}

type pluginServiceImpl struct {
	db         *gorm.DB
	pluginRepo repository.PluginRepository
	toolRepo   repository.ToolRepository
}

func (p *pluginServiceImpl) GetOAuthStatus(ctx context.Context, pluginID int64) (resp *GetOAuthStatusResponse, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", pluginID)
	}

	authInfo := pl.GetAuthInfo()
	if authInfo.Type == model.AuthTypeOfNone || authInfo.Type == model.AuthTypeOfService {
		resp = &GetOAuthStatusResponse{
			IsOauth: false,
		}

		return resp, nil
	}

	if authInfo.Type != model.AuthTypeOfOAuth {
		return nil, fmt.Errorf("invalid auth type '%v'", authInfo.Type)
	}
	if authInfo.SubType != model.AuthSubTypeOfOAuthClientCredentials {
		return nil, fmt.Errorf("invalid auth sub type '%v'", authInfo.SubType)
	}

	// credentials 授权模式下，注册时都已经授权了
	resp = &GetOAuthStatusResponse{
		IsOauth: true,
		Status:  common.OAuthStatus_Authorized,
	}

	return resp, nil
}

func (p *pluginServiceImpl) validateOAuthInfo(ctx context.Context, userID int64, authInfo *model.AuthV2) error {
	if authInfo.Type != model.AuthTypeOfOAuth {
		return nil
	}

	if authInfo.SubType == model.AuthSubTypeOfOAuthClientCredentials {
		oauth := authInfo.AuthOfOAuthClientCredentials
		if oauth == nil {
			return fmt.Errorf("oauth client credentials is nil")
		}

		accessToken, err := crossopenauth.DefaultOAuthSVC().GetAccessToken(ctx, &openauthModel.GetAccessTokenRequest{
			UserID: userID,
			OAuthInfo: &openauthModel.OAuthInfo{
				OAuthProvider: entity.GetOAuthProvider(oauth.TokenURL),
				OAuthMode:     openauthModel.OAuthModeClientCredentials,
				ClientCredentials: &openauthModel.ClientCredentials{
					ClientID:     oauth.ClientID,
					ClientSecret: oauth.ClientSecret,
					TokenURL:     oauth.TokenURL,
					Scopes:       oauth.Scopes,
				},
			},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "get access token failed, err=%v", err)
			return fmt.Errorf("invalid oauth client credentials")
		}

		if accessToken == "" {
			return fmt.Errorf("invalid oauth client credentials")
		}
	}

	return nil
}
