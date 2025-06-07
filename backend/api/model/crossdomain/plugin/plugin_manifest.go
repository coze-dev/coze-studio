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
	if mf.Auth.Type != AuthTypeOfNone && mf.Auth.Type != AuthTypeOfOAuth {
		if mf.Auth.SubType == "" {
			return fmt.Errorf("auth sub type is empty")
		}
		if mf.Auth.SubType != AuthSubTypeOfToken &&
			mf.Auth.SubType != AuthSubTypeOfOIDC {
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
	Type        AuthType     `json:"type" validate:"required" yaml:"type"`
	SubType     AuthSubType  `json:"sub_type" yaml:"sub_type"`
	Payload     *string      `json:"payload,omitempty" yaml:"payload,omitempty"`
	AuthOfOIDC  *AuthOfOIDC  `json:"-"`
	AuthOfToken *AuthOfToken `json:"-"`
	AuthOfOAuth *AuthOfOAuth `json:"-"`
}

type AuthOfOIDC struct {
	GrantType    string `json:"grant_type"`
	EndpointURL  string `json:"endpoint_url"`
	Audience     string `json:"audience,omitempty"`
	ODICScope    string `json:"oidc_scope,omitempty"`
	ODICClientID string `json:"oidc_client_id,omitempty"`
}

func (au *AuthV2) UnmarshalJSON(data []byte) error {
	auth := &Auth{} // 兼容老数据
	err := json.Unmarshal(data, auth)
	if err != nil {
		return err
	}

	au.Type = AuthType(auth.Type)
	au.SubType = AuthSubType(auth.SubType)

	if au.Type == AuthTypeOfNone {
		return nil
	}

	if au.Type == AuthTypeOfOAuth {
		if len(auth.ClientSecret) > 0 {
			au.AuthOfOAuth = &AuthOfOAuth{
				ClientID:                 auth.ClientID,
				ClientSecret:             auth.ClientSecret,
				ClientURL:                auth.ClientURL,
				Scope:                    auth.Scope,
				AuthorizationURL:         auth.AuthorizationURL,
				AuthorizationContentType: auth.AuthorizationContentType,
			}
		} else {
			oauth := &AuthOfOAuth{}
			err = json.Unmarshal([]byte(auth.Payload), oauth)
			if err != nil {
				return err
			}
			au.AuthOfOAuth = oauth
		}

		payload, err := json.Marshal(au.AuthOfOAuth)
		if err != nil {
			return err
		}

		au.Payload = ptr.Of(string(payload))
	}

	if au.Type == AuthTypeOfService {
		if au.SubType == "" && (au.Payload == nil || *au.Payload == "") { // 兼容老数据
			au.SubType = AuthSubTypeOfToken
		}
		switch au.SubType {
		case AuthSubTypeOfOIDC:
			oidc := &AuthOfOIDC{}
			err = json.Unmarshal([]byte(auth.Payload), oidc)
			if err != nil {
				return err
			}

			au.Payload = &auth.Payload

		case AuthSubTypeOfToken:
			if len(auth.ServiceToken) > 0 {
				au.AuthOfToken = &AuthOfToken{
					Location:     HTTPParamLocation(auth.Location),
					Key:          auth.Key,
					ServiceToken: auth.ServiceToken,
				}
			} else {
				token := &AuthOfToken{}
				err = json.Unmarshal([]byte(auth.Payload), token)
				if err != nil {
					return err
				}
				au.AuthOfToken = token
			}

			payload, err := json.Marshal(au.AuthOfToken)
			if err != nil {
				return err
			}

			au.Payload = ptr.Of(string(payload))
		}
	}

	return nil
}

type AuthOfToken struct {
	Location     HTTPParamLocation `json:"location"` // header or query
	Key          string            `json:"key"`
	ServiceToken string            `json:"service_token"`
}

type AuthOfOAuth struct {
	ClientID                 string `json:"client_id"`
	ClientSecret             string `json:"client_secret"`
	ClientURL                string `json:"client_url"`
	Scope                    string `json:"scope,omitempty"`
	AuthorizationURL         string `json:"authorization_url"`
	AuthorizationContentType string `json:"authorization_content_type"` // only support application/json
}

type APIDesc struct {
	Type PluginType `json:"type" validate:"required"`
}
