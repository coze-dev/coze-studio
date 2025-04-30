package entity

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/convertor"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type PluginInfo struct {
	ID                int64
	PluginType        common.PluginType
	SpaceID           int64
	DeveloperID       int64
	ProjectID         *int64
	IconURI           *string
	ServerURL         *string // TODO(@mrh): 去除，直接使用 doc 内的 servers 定义？
	Version           *string
	VersionDesc       *string
	PrivacyInfoInJson *string

	CreatedAt int64
	UpdatedAt int64

	Manifest   *PluginManifest
	OpenapiDoc *openapi3.T
}

func (p PluginInfo) GetName() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.Name
}

func (p PluginInfo) GetDesc() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.Description
}

func (p PluginInfo) GetIconURI() string {
	return ptr.FromOrDefault(p.IconURI, "")
}

func (p PluginInfo) GetServerURL() string {
	return ptr.FromOrDefault(p.ServerURL, "")
}

func (p PluginInfo) GetVersion() string {
	return ptr.FromOrDefault(p.Version, "")
}

func (p PluginInfo) GetVersionDesc() string {
	return ptr.FromOrDefault(p.VersionDesc, "")
}

func (p PluginInfo) GetPrivacyInfoInJson() string {
	return ptr.FromOrDefault(p.PrivacyInfoInJson, "")
}

func (p PluginInfo) GetProjectID() int64 {
	return ptr.FromOrDefault(p.ProjectID, 0)
}

func (p PluginInfo) GetAuthInfo() *AuthV2 {
	if p.Manifest == nil {
		return nil
	}
	return p.Manifest.Auth
}

type ToolInfo struct {
	ID        int64
	PluginID  int64
	CreatedAt int64
	UpdatedAt int64
	Version   *string

	ActivatedStatus *consts.ActivatedStatus
	DebugStatus     *common.APIDebugStatus

	Method    *string
	SubURL    *string
	Operation *openapi3.Operation
}

func (t ToolInfo) GetName() string {
	if t.Operation == nil {
		return ""
	}
	return t.Operation.OperationID
}

func (t ToolInfo) GetDesc() string {
	if t.Operation == nil {
		return ""
	}
	return t.Operation.Summary
}

func (t ToolInfo) GetVersion() string {
	return ptr.FromOrDefault(t.Version, "")
}

func (t ToolInfo) GetActivatedStatus() consts.ActivatedStatus {
	return ptr.FromOrDefault(t.ActivatedStatus, consts.ActivateTool)
}

func (t ToolInfo) GetSubURL() string {
	return ptr.FromOrDefault(t.SubURL, "")
}

func (t ToolInfo) GetMethod() string {
	return ptr.FromOrDefault(t.Method, "")
}

func (t ToolInfo) GetDebugStatus() common.APIDebugStatus {
	return ptr.FromOrDefault(t.DebugStatus, common.APIDebugStatus_DebugWaiting)
}

func (t ToolInfo) ToRespAPIParameter() ([]*common.APIParameter, error) {
	op := t.Operation
	if op == nil {
		return nil, fmt.Errorf("operation is nil")
	}

	params := make([]*common.APIParameter, 0, len(op.Parameters))

	response := op.Responses[strconv.Itoa(http.StatusOK)]
	if response == nil {
		return params, fmt.Errorf("response '200' not found")
	}

	mType := response.Value.Content[consts.MIMETypeJson]
	if mType == nil {
		return params, fmt.Errorf("response '200' content type 'application/json' not found")
	}

	schemaVal := mType.Schema.Value
	if len(schemaVal.Properties) == 0 {
		return params, nil
	}

	required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
		return e, true
	})

	for paramName, prop := range schemaVal.Properties {
		loc := string(consts.ParamInBody)
		apiParam, err := toAPIParameter(paramName, loc, required[paramName], prop.Value)
		if err != nil {
			return nil, err
		}
		params = append(params, apiParam)
	}

	return params, nil
}

func (t ToolInfo) ToReqAPIParameter() ([]*common.APIParameter, error) {
	op := t.Operation
	if op == nil {
		return nil, fmt.Errorf("operation is nil")
	}

	params := make([]*common.APIParameter, 0, len(op.Parameters))
	for _, param := range op.Parameters {
		paramVal := param.Value
		schemaVal := paramVal.Schema.Value

		apiParam, err := toAPIParameter(paramVal.Name, paramVal.In, paramVal.Required, schemaVal)
		if err != nil {
			return nil, err
		}
		params = append(params, apiParam)
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			loc := string(consts.ParamInBody)
			apiParam, err := toAPIParameter(paramName, loc, required[paramName], prop.Value)
			if err != nil {
				return nil, err
			}

			params = append(params, apiParam)
		}

		break // 只取一种 MIME
	}

	return params, nil
}

func toAPIParameter(paramName string, loc string, isRequired bool, sc *openapi3.Schema) (*common.APIParameter, error) {
	apiType, ok := convertor.ToThriftParamType(strings.ToLower(sc.Type))
	if !ok {
		return nil, fmt.Errorf("invalid type '%s'", sc.Type)
	}
	location, ok := convertor.ToThriftHTTPParamLocation(consts.HTTPParamLocation(loc))
	if !ok {
		return nil, fmt.Errorf("invalid location '%s'", loc)
	}

	apiParam := &common.APIParameter{
		Name:       paramName,
		Desc:       sc.Description,
		Type:       apiType,
		Location:   location, //使用父节点的值
		IsRequired: isRequired,
	}

	if sc.Default != nil {
		apiParam.GlobalDefault = ptr.Of(fmt.Sprintf("%v", sc.Default))
	}

	if sc.Format != "" {
		aType, ok := convertor.FormatToAssistType(sc.Format)
		if !ok {
			return nil, fmt.Errorf("invalid format '%s'", sc.Format)
		}
		_aType, ok := convertor.ToThriftAPIAssistType(aType)
		if !ok {
			return nil, fmt.Errorf("invalid assist type '%s'", aType)
		}
		apiParam.AssistType = ptr.Of(_aType)
	}

	if v, ok := sc.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
		if disable, ok := v.(bool); ok {
			apiParam.GlobalDisable = disable
		}
	}

	switch sc.Type {
	case openapi3.TypeObject:
		if len(sc.Properties) == 0 {
			return apiParam, nil
		}

		required := slices.ToMap(sc.Required, func(e string) (string, bool) {
			return e, true
		})
		for subParamName, prop := range sc.Properties {
			subParam, err := toAPIParameter(subParamName, loc, required[subParamName], prop.Value)
			if err != nil {
				return nil, err
			}
			apiParam.SubParameters = append(apiParam.SubParameters, subParam)
		}

		return apiParam, nil

	case openapi3.TypeArray:
		item := sc.Items.Value
		if item.Type == openapi3.TypeObject {
			required := slices.ToMap(item.Required, func(e string) (string, bool) {
				return e, true
			})
			for subParamName, prop := range item.Properties {
				subParam, err := toAPIParameter(subParamName, loc, required[subParamName], prop.Value)
				if err != nil {
					return nil, err
				}
				apiParam.SubParameters = append(apiParam.SubParameters, subParam)
			}

			return apiParam, nil
		}

		subType, ok := convertor.ToThriftParamType(strings.ToLower(item.Type))
		if !ok {
			return nil, fmt.Errorf("invalid type '%s'", item.Type)
		}

		apiParam.SubType = ptr.Of(subType)
		subParam, err := toAPIParameter("[Array Item]", loc, isRequired, item)
		if err != nil {
			return nil, err
		}

		apiParam.SubParameters = append(apiParam.SubParameters, subParam)

		return apiParam, nil
	}

	return apiParam, nil
}

func (t ToolInfo) ToPluginParameters() ([]*common.PluginParameter, error) {
	op := t.Operation
	if op == nil {
		return nil, fmt.Errorf("operation is nil")
	}

	var params []*common.PluginParameter

	for _, prop := range op.Parameters {
		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value
		if schemaVal.Type == openapi3.TypeObject || schemaVal.Type == openapi3.TypeArray {
			continue
		}

		if disabledParam(prop.Value.Schema.Value) {
			continue
		}

		var assistType *common.PluginParamTypeFormat
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendAssistType]; ok {
			_v, ok := v.(string)
			if !ok {
				continue
			}
			f, ok := convertor.AssistTypeToThriftFormat(consts.APIFileAssistType(_v))
			if ok {
				return nil, fmt.Errorf("invalid assist type '%s'", _v)
			}
			assistType = ptr.Of(f)
		}

		params = append(params, &common.PluginParameter{
			Name:     paramVal.Name,
			Desc:     paramVal.Description,
			Required: paramVal.Required,
			Type:     schemaVal.Type,
			Format:   assistType,
		})
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			paramInfo, err := toPluginParameter(paramName, required[paramName], prop.Value)
			if err != nil {
				return nil, err
			}
			if paramInfo != nil {
				params = append(params, paramInfo)
			}
		}

		break // 只取一种 MIME
	}

	return params, nil
}

func toPluginParameter(paramName string, isRequired bool, sc *openapi3.Schema) (*common.PluginParameter, error) {
	if disabledParam(sc) {
		return nil, nil
	}

	var assistType *common.PluginParamTypeFormat
	if v, ok := sc.Extensions[consts.APISchemaExtendAssistType]; ok {
		if _v, ok := v.(string); ok {
			f, ok := convertor.AssistTypeToThriftFormat(consts.APIFileAssistType(_v))
			if !ok {
				return nil, fmt.Errorf("invalid assist type '%s'", _v)
			}
			assistType = ptr.Of(f)
		}
	}

	pluginParam := &common.PluginParameter{
		Name:     paramName,
		Type:     sc.Type,
		Desc:     sc.Description,
		Required: isRequired,
		Format:   assistType,
	}

	switch sc.Type {
	case openapi3.TypeObject:
		if len(sc.Properties) == 0 {
			return pluginParam, nil
		}

		required := slices.ToMap(sc.Required, func(e string) (string, bool) {
			return e, true
		})
		for subParamName, prop := range sc.Properties {
			subParam, err := toPluginParameter(subParamName, required[subParamName], prop.Value)
			if err != nil {
				return nil, err
			}
			pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)
		}

		return pluginParam, nil

	case openapi3.TypeArray:
		item := sc.Items.Value
		pluginParam.SubType = item.Type

		if item.Type == openapi3.TypeObject {
			required := slices.ToMap(item.Required, func(e string) (string, bool) {
				return e, true
			})
			for subParamName, prop := range item.Properties {
				subParam, err := toPluginParameter(subParamName, required[subParamName], prop.Value)
				if err != nil {
					return nil, err
				}
				pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)
			}

			return pluginParam, nil
		}

		subParam, err := toPluginParameter("", isRequired, item)
		if err != nil {
			return nil, err
		}
		pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)

		return pluginParam, nil
	}

	return pluginParam, nil
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}

type AgentToolIdentity struct {
	AgentID   int64
	SpaceID   int64
	ToolID    int64
	VersionMs *int64
}

type VersionTool struct {
	ToolID  int64
	Version *string
}

type VersionAgentTool struct {
	ToolID    int64
	ToolName  *string
	VersionMs *int64
}

type PluginManifest struct {
	SchemaVersion string `json:"schema_version" validate:"required"`
	Name          string `json:"name" validate:"required"`
	Description   string `json:"description" validate:"required"`
	//NameForModel              string                            `json:"name_for_model" validate:"required"`
	//NameForHuman              string                            `json:"name_for_human" validate:"required"`
	//DescriptionForModel       string                            `json:"description_for_model" validate:"required"`
	//DescriptionForHuman       string                            `json:"description_for_human" validate:"required"`
	Auth         *AuthV2 `json:"auth"`
	LogoURL      string  `json:"logo_url"`
	ContactEmail string  `json:"contact_email"`
	LegalInfoURL string  `json:"legal_info_url"`
	//IdeCodeRuntime            string                            `json:"ide_code_runtime,omitempty"`
	API          APIDesc                                           `json:"api" `
	CommonParams map[common.ParameterLocation][]*CommonParamSchema `json:"common_params" `
	//SelectMode   *int32                          `json:"select_mode" `
	//APIExtend                 map[string]map[string]interface{} `json:"api_extend"`
	//DescriptionForClaudeModel string `json:"description_for_claude3"`
	//FixedExportIP *bool `json:"fixed_export_ip,omitempty"`
}

func NewDefaultPluginManifest() *PluginManifest {
	return &PluginManifest{
		SchemaVersion: "v1",
		LegalInfoURL:  "http://www.example.com/legal",
		ContactEmail:  "support@example.com",
		API: APIDesc{
			Type: "openapi",
			URL:  "http://localhost:3333/openapi.yaml",
		},
		Auth: &AuthV2{
			Type: consts.AuthTypeOfNone,
		},
		CommonParams: map[common.ParameterLocation][]*CommonParamSchema{
			common.ParameterLocation_Body:   {},
			common.ParameterLocation_Header: {},
			common.ParameterLocation_Path:   {},
			common.ParameterLocation_Query:  {},
		},
	}
}

func NewDefaultOpenapiDoc() *openapi3.T {
	return &openapi3.T{
		OpenAPI: "3.0.1",
		Info: &openapi3.Info{
			Version: "v1",
		},
		Paths:   openapi3.Paths{},
		Servers: openapi3.Servers{},
	}
}

type AuthV2 struct {
	Type        consts.AuthType    `json:"type" validate:"required"`
	SubType     consts.AuthSubType `json:"sub_type"`
	Payload     string             `json:"payload"`
	AuthOfOIDC  *AuthOfOIDC
	AuthOfToken *AuthOfToken
	AuthOfOAuth *AuthOfOAuth
}

type AuthOfOIDC struct {
	GrantType    string `json:"grant_type"`
	EndpointURL  string `json:"endpoint_url"`
	Audience     string `json:"audience,omitempty"`
	ODICScope    string `json:"oidc_scope,omitempty"`
	ODICClientID string `json:"oidc_client_id,omitempty"`
}

type AuthOfToken struct {
	Location     consts.HTTPParamLocation `json:"location"` // header or query
	Key          string                   `json:"key"`
	ServiceToken string                   `json:"service_token"`
}

type AuthOfOAuth struct {
	ClientID                 string `json:"client_id"`
	ClientSecret             string `json:"client_secret"`
	ClientURL                string `json:"client_url"`
	Scope                    string `json:"scope,omitempty"`
	AuthorizationURL         string `json:"authorization_url"`
	AuthorizationContentType string `json:"authorization_content_type"` // only support application/json
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

func (au *AuthV2) UnmarshalJSON(data []byte) error {
	auth := &Auth{} // 兼容老数据
	err := sonic.Unmarshal(data, auth)
	if err != nil {
		return err
	}

	au.Type = consts.AuthType(auth.Type)
	au.SubType = consts.AuthSubType(auth.SubType)
	au.Payload = auth.Payload

	if au.Type == consts.AuthTypeOfNone {
		return nil
	}

	if au.Type == consts.AuthTypeOfOAuth {
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
			err = sonic.UnmarshalString(auth.Payload, oauth)
			if err != nil {
				return err
			}
			au.AuthOfOAuth = oauth
		}
	}

	if au.Type == consts.AuthTypeOfService {
		switch au.SubType {
		case consts.AuthSubTypeOfOIDC:
			oidc := &AuthOfOIDC{}
			err = sonic.UnmarshalString(auth.Payload, oidc)
			if err != nil {
				return err
			}
			au.AuthOfOIDC = oidc
		case consts.AuthSubTypeOfToken:
			token := &AuthOfToken{}
			err = sonic.UnmarshalString(auth.Payload, token)
			if err != nil {
				return err
			}
			au.AuthOfToken = token
		}
	}

	return nil
}

type CommonParamSchema struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type APIDesc struct {
	Type string `json:"type"`
	URL  string `json:"url"`
	//Package string `json:"package,omitempty"`
}

type UniqueToolAPI struct {
	SubURL string
	Method string
}
