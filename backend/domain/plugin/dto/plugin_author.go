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

package dto

import (
	"fmt"
	"strings"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type PluginAuthInfo struct {
	AuthzType    *model.AuthzType
	Location     *model.HTTPParamLocation
	Key          *string
	ServiceToken *string
	OAuthInfo    *string
	AuthzSubType *model.AuthzSubType
	AuthzPayload *string
}

// TODO(@fanlv): change to DTO + Service
func (p PluginAuthInfo) ToAuthV2() (*model.AuthV2, error) {
	if p.AuthzType == nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "auth type is required"))
	}

	switch *p.AuthzType {
	case model.AuthzTypeOfNone:
		return &model.AuthV2{
			Type: model.AuthzTypeOfNone,
		}, nil

	case model.AuthzTypeOfOAuth:
		m, err := p.authOfOAuthToAuthV2()
		if err != nil {
			return nil, err
		}
		return m, nil

	case model.AuthzTypeOfService:
		m, err := p.authOfServiceToAuthV2()
		if err != nil {
			return nil, err
		}
		return m, nil

	default:
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"the type '%s' of auth is invalid", *p.AuthzType))
	}
}

func (p PluginAuthInfo) authOfOAuthToAuthV2() (*model.AuthV2, error) {
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

	if *p.AuthzSubType == model.AuthzSubTypeOfOAuthClientCredentials {
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
			Type:                         model.AuthzTypeOfOAuth,
			SubType:                      model.AuthzSubTypeOfOAuthClientCredentials,
			Payload:                      str,
			AuthOfOAuthClientCredentials: _oauthInfo,
		}, nil
	}

	if *p.AuthzSubType == model.AuthzSubTypeOfOAuthAuthorizationCode {
		contentType := oauthInfo["authorization_content_type"]
		if contentType != model.MediaTypeJson { // only support application/json
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
			Type:                         model.AuthzTypeOfOAuth,
			SubType:                      model.AuthzSubTypeOfOAuthAuthorizationCode,
			Payload:                      str,
			AuthOfOAuthAuthorizationCode: _oauthInfo,
		}, nil
	}

	return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
		"the type '%s' of sub-auth is invalid", *p.AuthzSubType))
}

func (p PluginAuthInfo) authOfServiceToAuthV2() (*model.AuthV2, error) {
	if p.AuthzSubType == nil {
		return nil, fmt.Errorf("sub-auth type is required")
	}

	if *p.AuthzSubType == model.AuthzSubTypeOfServiceAPIToken {
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
			Location:     model.HTTPParamLocation(strings.ToLower(string(*p.Location))),
			Key:          *p.Key,
		}

		str, err := sonic.MarshalString(tokenAuth)
		if err != nil {
			return nil, fmt.Errorf("marshal token auth failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:           model.AuthzTypeOfService,
			SubType:        model.AuthzSubTypeOfServiceAPIToken,
			Payload:        str,
			AuthOfAPIToken: tokenAuth,
		}, nil
	}

	return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
		"the type '%s' of sub-auth is invalid", *p.AuthzSubType))
}
