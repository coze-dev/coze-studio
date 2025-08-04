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

package plugin

import (
	"encoding/json"
	"net/url"
	"os"
	"strings"

	api "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/utils"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"

	"github.com/bytedance/sonic"
)

type PluginManifest struct {
	SchemaVersion       string                                         `json:"schema_version" yaml:"schema_version"`
	NameForModel        string                                         `json:"name_for_model" yaml:"name_for_model"`
	NameForHuman        string                                         `json:"name_for_human" yaml:"name_for_human"`
	DescriptionForModel string                                         `json:"description_for_model" yaml:"description_for_model"`
	DescriptionForHuman string                                         `json:"description_for_human" yaml:"description_for_human"`
	Auth                *AuthV2                                        `json:"auth" yaml:"auth"`
	LogoURL             string                                         `json:"logo_url" yaml:"logo_url"`
	API                 APIDesc                                        `json:"api" yaml:"api"`
	CommonParams        map[HTTPParamLocation][]*api.CommonParamSchema `json:"common_params" yaml:"common_params"`
}

func (mf *PluginManifest) Copy() (*PluginManifest, error) {
	if mf == nil {
		return mf, nil
	}

	b, err := json.Marshal(mf)
	if err != nil {
		return nil, err
	}

	mf_ := &PluginManifest{}
	err = json.Unmarshal(b, mf_)
	if err != nil {
		return nil, err
	}

	return mf_, err
}

func (mf *PluginManifest) EncryptAuthPayload() (*PluginManifest, error) {
	if mf == nil || mf.Auth == nil {
		return mf, nil
	}

	mf_, err := mf.Copy()
	if err != nil {
		return nil, err
	}

	if mf_.Auth.Payload == "" {
		return mf_, nil
	}

	secret := os.Getenv(utils.AuthSecretEnv)
	if secret == "" {
		secret = utils.DefaultAuthSecret
	}

	payload_, err := utils.EncryptByAES([]byte(mf_.Auth.Payload), secret)
	if err != nil {
		return nil, err
	}

	mf_.Auth.Payload = payload_

	return mf_, nil
}

func (mf *PluginManifest) Validate(skipAuthPayload bool) (err error) {
	if mf.SchemaVersion != "v1" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid schema version '%s'", mf.SchemaVersion))
	}
	if mf.NameForModel == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"name for model is required"))
	}
	if mf.NameForHuman == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"name for human is required"))
	}
	if mf.DescriptionForModel == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"description for model is required"))
	}
	if mf.DescriptionForHuman == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"description for human is required"))
	}
	if mf.API.Type != PluginTypeOfCloud {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid api type '%s'", mf.API.Type))
	}

	err = mf.validateAuthInfo(skipAuthPayload)
	if err != nil {
		return err
	}

	for loc := range mf.CommonParams {
		if loc != ParamInBody &&
			loc != ParamInHeader &&
			loc != ParamInQuery &&
			loc != ParamInPath {
			return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
				"invalid location '%s' in common params", loc))
		}
	}

	return nil
}

func (mf *PluginManifest) validateAuthInfo(skipAuthPayload bool) (err error) {
	if mf.Auth == nil {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"auth is required"))
	}

	if mf.Auth.Payload != "" {
		js := json.RawMessage{}
		err = sonic.UnmarshalString(mf.Auth.Payload, &js)
		if err != nil {
			return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
				"invalid auth payload"))
		}
	}

	if mf.Auth.Type == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"auth type is required"))
	}

	if mf.Auth.Type != AuthzTypeOfNone &&
		mf.Auth.Type != AuthzTypeOfOAuth &&
		mf.Auth.Type != AuthzTypeOfService {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid auth type '%s'", mf.Auth.Type))
	}

	if mf.Auth.Type == AuthzTypeOfNone {
		return nil
	}

	if mf.Auth.SubType == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"sub-auth type is required"))
	}

	switch mf.Auth.SubType {
	case AuthzSubTypeOfServiceAPIToken:
		err = mf.validateServiceToken(skipAuthPayload)
	//case AuthzSubTypeOfOAuthClientCredentials:
	//	err = mf.validateClientCredentials()
	case AuthzSubTypeOfOAuthAuthorizationCode:
		err = mf.validateAuthCode(skipAuthPayload)
	default:
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid sub-auth type '%s'", mf.Auth.SubType))
	}
	if err != nil {
		return err
	}

	return nil
}

func (mf *PluginManifest) validateServiceToken(skipAuthPayload bool) (err error) {
	if mf.Auth.AuthOfAPIToken == nil {
		err = sonic.UnmarshalString(mf.Auth.Payload, &mf.Auth.AuthOfAPIToken)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
				"invalid auth payload"))
		}
	}

	if skipAuthPayload {
		return nil
	}

	apiToken := mf.Auth.AuthOfAPIToken

	if apiToken.ServiceToken == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"service token is required"))
	}
	if apiToken.Key == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"key is required"))
	}

	loc := HTTPParamLocation(strings.ToLower(string(apiToken.Location)))
	if loc != ParamInHeader && loc != ParamInQuery {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid location '%s'", apiToken.Location))
	}

	return nil
}

func (mf *PluginManifest) validateClientCredentials() (err error) {
	if mf.Auth.AuthOfOAuthClientCredentials == nil {
		err = sonic.UnmarshalString(mf.Auth.Payload, &mf.Auth.AuthOfOAuthClientCredentials)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
				"invalid auth payload"))
		}
	}

	clientCredentials := mf.Auth.AuthOfOAuthClientCredentials

	if clientCredentials.ClientID == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"client id is required"))
	}
	if clientCredentials.ClientSecret == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"client secret is required"))
	}
	if clientCredentials.TokenURL == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"token url is required"))
	}

	urlParse, err := url.Parse(clientCredentials.TokenURL)
	if err != nil || urlParse.Hostname() == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"invalid token url"))
	}
	if urlParse.Scheme != "https" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"token url scheme must be 'https'"))
	}

	return nil
}

func (mf *PluginManifest) validateAuthCode(skipAuthPayload bool) (err error) {
	if mf.Auth.AuthOfOAuthAuthorizationCode == nil {
		err = sonic.UnmarshalString(mf.Auth.Payload, &mf.Auth.AuthOfOAuthAuthorizationCode)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
				"invalid auth payload"))
		}
	}

	if skipAuthPayload {
		return nil
	}

	authCode := mf.Auth.AuthOfOAuthAuthorizationCode

	if authCode.ClientID == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"client id is required"))
	}
	if authCode.ClientSecret == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"client secret is required"))
	}
	if authCode.AuthorizationContentType != MediaTypeJson {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"authorization content type must be 'application/json'"))
	}
	if authCode.AuthorizationURL == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"token url is required"))
	}
	if authCode.ClientURL == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"client url is required"))
	}

	urlParse, err := url.Parse(authCode.AuthorizationURL)
	if err != nil || urlParse.Hostname() == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"invalid authorization url"))
	}
	if urlParse.Scheme != "https" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"authorization url scheme must be 'https'"))
	}

	urlParse, err = url.Parse(authCode.ClientURL)
	if err != nil || urlParse.Hostname() == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"invalid client url"))
	}
	if urlParse.Scheme != "https" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"client url scheme must be 'https'"))
	}

	return nil
}

type Auth struct {
	Type                     string `json:"type" validate:"required"`
	AuthorizationType        string `json:"authorization_type,omitempty"`
	ClientURL                string `json:"client_url,omitempty"`
	Scope                    string `json:"scope,omitempty"`
	AuthorizationURL         string `json:"authorization_url,omitempty"`
	AuthorizationContentType string `json:"authorization_content_type,omitempty"`
	Platform                 string `json:"platform,omitempty"`
	ClientID                 string `json:"client_id,omitempty"`
	ClientSecret             string `json:"client_secret,omitempty"`
	Location                 string `json:"location,omitempty"`
	Key                      string `json:"key,omitempty"`
	ServiceToken             string `json:"service_token,omitempty"`
	SubType                  string `json:"sub_type"`
	Payload                  string `json:"payload"`
}

type AuthV2 struct {
	Type    AuthzType    `json:"type" yaml:"type"`
	SubType AuthzSubType `json:"sub_type" yaml:"sub_type"`
	Payload string       `json:"payload" yaml:"payload"`
	// service
	AuthOfAPIToken *AuthOfAPIToken `json:"-"`

	// oauth
	AuthOfOAuthAuthorizationCode *OAuthAuthorizationCodeConfig `json:"-"`
	AuthOfOAuthClientCredentials *OAuthClientCredentialsConfig `json:"-"`
}

func (au *AuthV2) UnmarshalJSON(data []byte) error {
	auth := &Auth{} // Compatible with old data
	err := json.Unmarshal(data, auth)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"invalid plugin manifest json"))
	}

	au.Type = AuthzType(auth.Type)
	au.SubType = AuthzSubType(auth.SubType)

	if au.Type == "" {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"plugin auth type is required"))
	}

	if auth.Payload != "" {
		secret := os.Getenv(utils.AuthSecretEnv)
		if secret == "" {
			secret = utils.DefaultAuthSecret
		}

		payload_, err := utils.DecryptByAES(auth.Payload, secret)
		if err == nil {
			auth.Payload = string(payload_)
		}
	}

	switch au.Type {
	case AuthzTypeOfNone:
	case AuthzTypeOfOAuth:
		err = au.unmarshalOAuth(auth)
	case AuthzTypeOfService:
		err = au.unmarshalService(auth)
	default:
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid plugin auth type '%s'", au.Type))
	}
	if err != nil {
		return err
	}

	return nil
}

func (au *AuthV2) unmarshalService(auth *Auth) (err error) {
	if au.SubType == "" && au.Payload == "" { // Compatible with old data
		au.SubType = AuthzSubTypeOfServiceAPIToken
	}

	var payload []byte

	if au.SubType == AuthzSubTypeOfServiceAPIToken {
		if len(auth.ServiceToken) > 0 {
			au.AuthOfAPIToken = &AuthOfAPIToken{
				Location:     HTTPParamLocation(strings.ToLower(auth.Location)),
				Key:          auth.Key,
				ServiceToken: auth.ServiceToken,
			}
		} else {
			token := &AuthOfAPIToken{}
			err = json.Unmarshal([]byte(auth.Payload), token)
			if err != nil {
				return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
					"invalid auth payload json"))
			}
			au.AuthOfAPIToken = token
		}

		payload, err = json.Marshal(au.AuthOfAPIToken)
		if err != nil {
			return err
		}
	}

	if len(payload) == 0 {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid plugin sub-auth type '%s'", au.SubType))
	}

	au.Payload = string(payload)

	return nil
}

func (au *AuthV2) unmarshalOAuth(auth *Auth) (err error) {
	if au.SubType == "" { // Compatible with old data
		au.SubType = AuthzSubTypeOfOAuthAuthorizationCode
	}

	var payload []byte

	if au.SubType == AuthzSubTypeOfOAuthAuthorizationCode {
		if len(auth.ClientSecret) > 0 {
			au.AuthOfOAuthAuthorizationCode = &OAuthAuthorizationCodeConfig{
				ClientID:                 auth.ClientID,
				ClientSecret:             auth.ClientSecret,
				ClientURL:                auth.ClientURL,
				Scope:                    auth.Scope,
				AuthorizationURL:         auth.AuthorizationURL,
				AuthorizationContentType: auth.AuthorizationContentType,
			}
		} else {
			oauth := &OAuthAuthorizationCodeConfig{}
			err = json.Unmarshal([]byte(auth.Payload), oauth)
			if err != nil {
				return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
					"invalid auth payload json"))
			}
			au.AuthOfOAuthAuthorizationCode = oauth
		}

		payload, err = json.Marshal(au.AuthOfOAuthAuthorizationCode)
		if err != nil {
			return err
		}
	}

	if au.SubType == AuthzSubTypeOfOAuthClientCredentials {
		oauth := &OAuthClientCredentialsConfig{}
		err = json.Unmarshal([]byte(auth.Payload), oauth)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
				"invalid auth payload json"))
		}
		au.AuthOfOAuthClientCredentials = oauth

		payload, err = json.Marshal(au.AuthOfOAuthClientCredentials)
		if err != nil {
			return err
		}
	}

	if len(payload) == 0 {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid plugin sub-auth type '%s'", au.SubType))
	}

	au.Payload = string(payload)

	return nil
}

type AuthOfAPIToken struct {
	// Location is the location of the parameter.
	// It can be "header" or "query".
	Location HTTPParamLocation `json:"location"`
	// Key is the name of the parameter.
	Key string `json:"key"`
	// ServiceToken is the simple authorization information for the service.
	ServiceToken string `json:"service_token"`
}

type OAuthAuthorizationCodeConfig struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	// ClientURL is the URL of authorization endpoint.
	ClientURL string `json:"client_url"`
	// Scope is the scope of the authorization request.
	// If multiple scopes are requested, they must be separated by a space.
	Scope string `json:"scope,omitempty"`
	// AuthorizationURL is the URL of token exchange endpoint.
	AuthorizationURL string `json:"authorization_url"`
	// AuthorizationContentType is the content type of the authorization request, and it must be "application/json".
	AuthorizationContentType string `json:"authorization_content_type"`
}

type OAuthClientCredentialsConfig struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	TokenURL     string `json:"token_url"`
}

type APIDesc struct {
	Type PluginType `json:"type" validate:"required"`
}
