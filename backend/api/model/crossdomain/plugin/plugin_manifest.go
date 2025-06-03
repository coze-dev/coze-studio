package plugin

import (
	"encoding/json"
	"fmt"

	api "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
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
	LogoURL             string                                         `json:"logo_url" yaml:"logo_url" validate:"required"`
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
