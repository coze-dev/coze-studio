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
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	OSS        storage.Storage
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
}

func NewService(components *Components) PluginService {
	return &pluginServiceImpl{
		db:         components.DB,
		oss:        components.OSS,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
	}
}

type pluginServiceImpl struct {
	db         *gorm.DB
	oss        storage.Storage
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
	if authInfo.Type == model.AuthzTypeOfNone || authInfo.Type == model.AuthzTypeOfService {
		resp = &GetOAuthStatusResponse{
			IsOauth: false,
		}

		return resp, nil
	}

	if authInfo.Type != model.AuthzTypeOfOAuth {
		return nil, fmt.Errorf("invalid auth type '%v'", authInfo.Type)
	}
	if authInfo.SubType != model.AuthzSubTypeOfOAuthClientCredentials {
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
	if authInfo.Type != model.AuthzTypeOfOAuth {
		return nil
	}

	if authInfo.SubType == model.AuthzSubTypeOfOAuthClientCredentials {
		oauth := authInfo.AuthOfOAuthClientCredentials

		accessToken, err := crossopenauth.DefaultOAuthSVC().GetAccessToken(ctx, &openauthModel.GetAccessTokenRequest{
			UserID: conv.Int64ToStr(userID),
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
			return errorx.New(errno.ErrPluginInvalidClientCredentialsCode)
		}

		if accessToken == "" {
			logs.CtxErrorf(ctx, "access token is empty")
			return errorx.New(errno.ErrPluginInvalidClientCredentialsCode)
		}
	}

	return nil
}
