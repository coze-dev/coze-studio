/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package service

import (
	"fmt"
	"strings"

	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type pluginAuthConverter struct {
	PluginAuthInfo *dto.PluginAuthInfo
}

func newPluginAuthConverter(pluginAuthInfo *dto.PluginAuthInfo) *pluginAuthConverter {
	return &pluginAuthConverter{
		PluginAuthInfo: pluginAuthInfo,
	}
}

func (s *pluginAuthConverter) ToAuthV2() (*model.AuthV2, error) {
	p := s.PluginAuthInfo
	if p.AuthzType == nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "auth type is required"))
	}

	switch *p.AuthzType {
	case consts.AuthzTypeOfNone:
		return &model.AuthV2{
			Type: consts.AuthzTypeOfNone,
		}, nil

	case consts.AuthzTypeOfOAuth:
		m, err := s.authOfOAuthToAuthV2()
		if err != nil {
			return nil, err
		}
		return m, nil

	case consts.AuthzTypeOfService:
		m, err := s.authOfServiceToAuthV2()
		if err != nil {
			return nil, err
		}
		return m, nil

	default:
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"the type '%s' of auth is invalid", *p.AuthzType))
	}
}

func (s *pluginAuthConverter) authOfOAuthToAuthV2() (*model.AuthV2, error) {
	p := s.PluginAuthInfo
	if p.AuthzSubType == nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "sub-auth type is required"))
	}

	if p.OAuthInfo == nil || *p.OAuthInfo == "" {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "oauth info is required"))
	}

	oauthInfo := make(map[string]string)
	err := sonic.Unmarshal([]byte(*p.OAuthInfo), &oauthInfo)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "invalid oauth info"))
	}

	if *p.AuthzSubType == consts.AuthzSubTypeOfOAuthClientCredentials {
		_oauthInfo := &model.OAuthClientCredentialsConfig{
			ClientID:     oauthInfo["client_id"],
			ClientSecret: oauthInfo["client_secret"],
			TokenURL:     oauthInfo["token_url"],
		}

		str, err := sonic.MarshalString(_oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("marshal oauth info failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:                         consts.AuthzTypeOfOAuth,
			SubType:                      consts.AuthzSubTypeOfOAuthClientCredentials,
			Payload:                      str,
			AuthOfOAuthClientCredentials: _oauthInfo,
		}, nil
	}

	if *p.AuthzSubType == consts.AuthzSubTypeOfOAuthAuthorizationCode {
		contentType := oauthInfo["authorization_content_type"]
		if contentType != consts.MediaTypeJson { // only support application/json
			return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
				"the type '%s' of authorization content is invalid", contentType))
		}

		_oauthInfo := &model.OAuthAuthorizationCodeConfig{
			ClientID:                 oauthInfo["client_id"],
			ClientSecret:             oauthInfo["client_secret"],
			ClientURL:                oauthInfo["client_url"],
			Scope:                    oauthInfo["scope"],
			AuthorizationURL:         oauthInfo["authorization_url"],
			AuthorizationContentType: contentType,
		}

		str, err := sonic.MarshalString(_oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("marshal oauth info failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:                         consts.AuthzTypeOfOAuth,
			SubType:                      consts.AuthzSubTypeOfOAuthAuthorizationCode,
			Payload:                      str,
			AuthOfOAuthAuthorizationCode: _oauthInfo,
		}, nil
	}

	return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
		"the type '%s' of sub-auth is invalid", *p.AuthzSubType))
}

func (s *pluginAuthConverter) authOfServiceToAuthV2() (*model.AuthV2, error) {
	p := s.PluginAuthInfo
	if p.AuthzSubType == nil {
		return nil, fmt.Errorf("sub-auth type is required")
	}

	if *p.AuthzSubType == consts.AuthzSubTypeOfServiceAPIToken {
		if p.Location == nil {
			return nil, fmt.Errorf("'Location' of sub-auth is required")
		}
		if p.ServiceToken == nil {
			return nil, fmt.Errorf("'ServiceToken' of sub-auth is required")
		}
		if p.Key == nil {
			return nil, fmt.Errorf("'Key' of sub-auth is required")
		}

		tokenAuth := &model.AuthOfAPIToken{
			ServiceToken: *p.ServiceToken,
			Location:     consts.HTTPParamLocation(strings.ToLower(string(*p.Location))),
			Key:          *p.Key,
		}

		str, err := sonic.MarshalString(tokenAuth)
		if err != nil {
			return nil, fmt.Errorf("marshal token auth failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:           consts.AuthzTypeOfService,
			SubType:        consts.AuthzSubTypeOfServiceAPIToken,
			Payload:        str,
			AuthOfAPIToken: tokenAuth,
		}, nil
	}

	return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
		"the type '%s' of sub-auth is invalid", *p.AuthzSubType))
}
