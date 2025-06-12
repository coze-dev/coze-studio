package plugin

import (
	"encoding/json"

	api "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"

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

func (mf PluginManifest) Validate() (err error) {
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
	if mf.Auth == nil {
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
			"auth is required"))

	}
	if mf.Auth.Payload != nil {
		if !isValidJSON([]byte(*mf.Auth.Payload)) {
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
	if mf.Auth.Type != AuthzTypeOfNone {
		if mf.Auth.SubType == "" {
			return errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
				"sub-auth type is required"))
		}
		if mf.Auth.SubType != AuthzSubTypeOfServiceAPIToken &&
			mf.Auth.SubType != AuthzSubTypeOfOAuthClientCredentials {
			return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
				"invalid sub-auth type '%s'", mf.Auth.SubType))
		}
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

func isValidJSON(data []byte) bool {
	var js json.RawMessage
	return sonic.Unmarshal(data, &js) == nil
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
	ServiceToken             string `json:"service_token"`
	SubType                  string `json:"sub_type"`
	Payload                  string `json:"payload"`
}

type AuthV2 struct {
	Type    AuthzType    `json:"type" yaml:"type"`
	SubType AuthzSubType `json:"sub_type" yaml:"sub_type"`
	Payload *string      `json:"payload,omitempty" yaml:"payload,omitempty"`
	// service
	AuthOfAPIToken *AuthOfAPIToken `json:"-"`

	// oauth
	AuthOfOAuthAuthorizationCode *AuthOfOAuthAuthorizationCode `json:"-"`
	AuthOfOAuthClientCredentials *AuthOfOAuthClientCredentials `json:"-"`
}

func (au *AuthV2) UnmarshalJSON(data []byte) error {
	auth := &Auth{} // 兼容老数据
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

	switch au.Type {
	case AuthzTypeOfNone:
		return nil

	case AuthzTypeOfOAuth:
		err = au.unmarshalOAuth(auth)
		if err != nil {
			return err
		}

	case AuthzTypeOfService:
		err = au.unmarshalService(auth)
		if err != nil {
			return err
		}

	default:
		return errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"invalid plugin auth type '%s'", au.Type))
	}

	return nil
}

func (au *AuthV2) unmarshalService(auth *Auth) (err error) {
	if au.SubType == "" && (au.Payload == nil || *au.Payload == "") { // 兼容老数据
		au.SubType = AuthzSubTypeOfServiceAPIToken
	}

	var payload []byte

	if au.SubType == AuthzSubTypeOfServiceAPIToken {
		if len(auth.ServiceToken) > 0 {
			au.AuthOfAPIToken = &AuthOfAPIToken{
				Location:     HTTPParamLocation(auth.Location),
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

	au.Payload = ptr.Of(string(payload))

	return nil
}

func (au *AuthV2) unmarshalOAuth(auth *Auth) (err error) {
	if au.SubType == "" { // 兼容老数据
		au.SubType = AuthzSubTypeOfOAuthAuthorizationCode
	}

	var payload []byte

	if au.SubType == AuthzSubTypeOfOAuthAuthorizationCode {
		if len(auth.ClientSecret) > 0 {
			au.AuthOfOAuthAuthorizationCode = &AuthOfOAuthAuthorizationCode{
				ClientID:                 auth.ClientID,
				ClientSecret:             auth.ClientSecret,
				ClientURL:                auth.ClientURL,
				Scopes:                   []string{auth.Scope},
				AuthorizationURL:         auth.AuthorizationURL,
				AuthorizationContentType: auth.AuthorizationContentType,
			}
		} else {
			oauth := &AuthOfOAuthAuthorizationCode{}
			err = json.Unmarshal([]byte(auth.Payload), oauth)
			if err != nil {
				return errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey,
					"invalid auth payload json"))
			}
			au.AuthOfOAuthAuthorizationCode = oauth
		}

		payload, err = json.Marshal(au.AuthOfOAuthClientCredentials)
		if err != nil {
			return err
		}
	}

	if au.SubType == AuthzSubTypeOfOAuthClientCredentials {
		oauth := &AuthOfOAuthClientCredentials{}
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

	au.Payload = ptr.Of(string(payload))

	return nil
}

type AuthOfAPIToken struct {
	Location     HTTPParamLocation `json:"location"` // header or query
	Key          string            `json:"key"`
	ServiceToken string            `json:"service_token"`
}

type AuthOfOAuthAuthorizationCode struct {
	ClientID                 string   `json:"client_id"`
	ClientSecret             string   `json:"client_secret"`
	ClientURL                string   `json:"client_url"`
	Scopes                   []string `json:"scopes,omitempty"`
	AuthorizationURL         string   `json:"authorization_url"`
	AuthorizationContentType string   `json:"authorization_content_type"` // only support application/json
}

type AuthOfOAuthClientCredentials struct {
	ClientID     string   `json:"client_id"`
	ClientSecret string   `json:"client_secret"`
	TokenURL     string   `json:"token_url"`
	Scopes       []string `json:"scopes,omitempty"`
}

type APIDesc struct {
	Type PluginType `json:"type" validate:"required"`
}
