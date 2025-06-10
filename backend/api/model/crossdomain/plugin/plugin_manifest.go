package plugin

import (
	"encoding/json"
	"fmt"

	api "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"

	"github.com/bytedance/sonic"
	"github.com/go-playground/validator"
)

type PluginManifest struct {
	SchemaVersion       string                                         `json:"schema_version" yaml:"schema_version" validate:"required" `
	NameForModel        string                                         `json:"name_for_model" validate:"required" yaml:"name_for_model"`
	NameForHuman        string                                         `json:"name_for_human" yaml:"name_for_human" validate:"required" `
	DescriptionForModel string                                         `json:"description_for_model" validate:"required" yaml:"description_for_model"`
	DescriptionForHuman string                                         `json:"description_for_human" yaml:"description_for_human" validate:"required"`
	Auth                *AuthV2                                        `json:"auth" yaml:"auth" validate:"required"`
	LogoURL             string                                         `json:"logo_url" yaml:"logo_url"`
	API                 APIDesc                                        `json:"api" yaml:"api"`
	CommonParams        map[HTTPParamLocation][]*api.CommonParamSchema `json:"common_params" yaml:"common_params"`
}

func (mf PluginManifest) Validate() (err error) {
	err = validator.New().Struct(mf)
	if err != nil {
		return fmt.Errorf("plugin manifest validates failed, err=%v", err)
	}

	if mf.SchemaVersion != "v1" {
		return fmt.Errorf("invalid schema version '%s'", mf.SchemaVersion)
	}
	if mf.API.Type != PluginTypeOfCloud {
		return fmt.Errorf("invalid api type '%s'", mf.API.Type)
	}
	if mf.Auth == nil {
		return fmt.Errorf("auth is empty")
	}
	if mf.Auth.Payload != nil {
		if !isValidJSON([]byte(*mf.Auth.Payload)) {
			return fmt.Errorf("invalid auth payload")
		}
	}
	if mf.Auth.Type == "" {
		return fmt.Errorf("auth type is empty")
	}
	if mf.Auth.Type != AuthTypeOfNone &&
		mf.Auth.Type != AuthTypeOfOAuth &&
		mf.Auth.Type != AuthTypeOfService {
		return fmt.Errorf("invalid auth type '%s'", mf.Auth.Type)
	}
	if mf.Auth.Type != AuthTypeOfNone {
		if mf.Auth.SubType == "" {
			return fmt.Errorf("auth sub type is empty")
		}
		if mf.Auth.SubType != AuthSubTypeOfServiceAPIToken &&
			mf.Auth.SubType != AuthSubTypeOfOAuthClientCredentials {
			return fmt.Errorf("invalid auth sub type '%s'", mf.Auth.SubType)
		}
	}

	for loc := range mf.CommonParams {
		if loc != ParamInBody &&
			loc != ParamInHeader &&
			loc != ParamInQuery &&
			loc != ParamInPath {
			return fmt.Errorf("invalid location '%s' in common params", loc)
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
	Type    AuthType    `json:"type" validate:"required" yaml:"type"`
	SubType AuthSubType `json:"sub_type" yaml:"sub_type"`
	Payload *string     `json:"payload,omitempty" yaml:"payload,omitempty"`
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
		return err
	}

	au.Type = AuthType(auth.Type)
	au.SubType = AuthSubType(auth.SubType)

	switch au.Type {
	case AuthTypeOfNone:
		return nil

	case AuthTypeOfOAuth:
		err = au.unmarshalOAuth(auth)
		if err != nil {
			return err
		}

	case AuthTypeOfService:
		err = au.unmarshalService(auth)
		if err != nil {
			return err
		}

	default:
		return fmt.Errorf("invalid auth type '%s'", au.Type)
	}

	return nil
}

func (au *AuthV2) unmarshalService(auth *Auth) (err error) {
	if au.SubType == "" && (au.Payload == nil || *au.Payload == "") { // 兼容老数据
		au.SubType = AuthSubTypeOfServiceAPIToken
	}

	var payload []byte

	if au.SubType == AuthSubTypeOfServiceAPIToken {
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
				return err
			}
			au.AuthOfAPIToken = token
		}

		payload, err = json.Marshal(au.AuthOfAPIToken)
		if err != nil {
			return err
		}
	}

	if len(payload) == 0 {
		return fmt.Errorf("invalid auth sub type '%s'", au.SubType)
	}

	au.Payload = ptr.Of(string(payload))

	return nil
}

func (au *AuthV2) unmarshalOAuth(auth *Auth) (err error) {
	if au.SubType == "" { // 兼容老数据
		au.SubType = AuthSubTypeOfOAuthAuthorizationCode
	}

	var payload []byte

	if au.SubType == AuthSubTypeOfOAuthAuthorizationCode {
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
				return err
			}
			au.AuthOfOAuthAuthorizationCode = oauth
		}

		payload, err = json.Marshal(au.AuthOfOAuthClientCredentials)
		if err != nil {
			return err
		}
	}

	if au.SubType == AuthSubTypeOfOAuthClientCredentials {
		oauth := &AuthOfOAuthClientCredentials{}
		err = json.Unmarshal([]byte(auth.Payload), oauth)
		if err != nil {
			return err
		}
		au.AuthOfOAuthClientCredentials = oauth

		payload, err = json.Marshal(au.AuthOfOAuthClientCredentials)
		if err != nil {
			return err
		}
	}

	if len(payload) == 0 {
		return fmt.Errorf("invalid auth sub type '%s'", au.SubType)
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
