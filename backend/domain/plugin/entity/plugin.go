package entity

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-playground/validator"
	gonanoid "github.com/matoous/go-nanoid"

	"github.com/cloudwego/eino/schema"

	productAPI "code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_public_api"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/convertor"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type PluginInfo struct {
	ID           int64
	PluginType   common.PluginType
	SpaceID      int64
	DeveloperID  int64
	ProjectID    *int64
	RefProductID *int64 // for product plugin
	IconURI      *string
	ServerURL    *string // TODO(@mrh): 去除，直接使用 doc 内的 servers 定义？
	Version      *string
	VersionDesc  *string

	CreatedAt int64
	UpdatedAt int64

	Manifest   *PluginManifest
	OpenapiDoc *Openapi3T
}

func (p PluginInfo) GetName() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.NameForHuman
}

func (p PluginInfo) GetDesc() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.DescriptionForHuman
}

func (p PluginInfo) GetIconURI() string {
	return ptr.FromOrDefault(p.IconURI, "")
}

func (p PluginInfo) GetServerURL() string {
	return ptr.FromOrDefault(p.ServerURL, "")
}

func (p PluginInfo) GetRefProductID() int64 {
	return ptr.FromOrDefault(p.RefProductID, 0)
}

func (p PluginInfo) GetVersion() string {
	return ptr.FromOrDefault(p.Version, "")
}

func (p PluginInfo) GetVersionDesc() string {
	return ptr.FromOrDefault(p.VersionDesc, "")
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

type ToolExample struct {
	RequestExample  string
	ResponseExample string
}

func (p PluginInfo) GetToolExample(ctx context.Context, toolName string) *ToolExample {
	if p.OpenapiDoc == nil ||
		p.OpenapiDoc.Components == nil ||
		len(p.OpenapiDoc.Components.Examples) == 0 {
		return nil
	}
	example, ok := p.OpenapiDoc.Components.Examples[toolName]
	if !ok {
		return nil
	}
	if example.Value == nil || example.Value.Value == nil {
		return nil
	}

	val, ok := example.Value.Value.(map[string]any)
	if !ok {
		return nil
	}

	reqExample, ok := val["ReqExample"]
	if !ok {
		return nil
	}
	reqExampleStr, err := sonic.MarshalString(reqExample)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal request example failed, err=%v", err)
		return nil
	}

	respExample, ok := val["RespExample"]
	if !ok {
		return nil
	}
	respExampleStr, err := sonic.MarshalString(respExample)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal response example failed, err=%v", err)
		return nil
	}

	return &ToolExample{
		RequestExample:  reqExampleStr,
		ResponseExample: respExampleStr,
	}
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
	Operation *Openapi3Operation
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
	return strings.ToUpper(ptr.FromOrDefault(t.Method, ""))
}

func (t ToolInfo) GetDebugStatus() common.APIDebugStatus {
	return ptr.FromOrDefault(t.DebugStatus, common.APIDebugStatus_DebugWaiting)
}

func (t ToolInfo) GetResponseOpenapiSchema() (*openapi3.Schema, error) {
	op := t.Operation
	if op == nil {
		return nil, fmt.Errorf("operation is nil")
	}

	resp, ok := op.Responses[strconv.Itoa(http.StatusOK)]
	if !ok {
		if op.Responses == nil {
			op.Responses = openapi3.Responses{}
		}
		op.Responses[strconv.Itoa(http.StatusOK)] = &openapi3.ResponseRef{
			Value: &openapi3.Response{
				Content: openapi3.Content{
					consts.MIMETypeJson: {
						Schema: &openapi3.SchemaRef{
							Value: &openapi3.Schema{
								Type:       openapi3.TypeObject,
								Properties: openapi3.Schemas{},
							},
						},
					},
				},
			},
		}
	}

	mType, ok := resp.Value.Content[consts.MIMETypeJson] // only support application/json
	if !ok {
		if resp.Value.Content == nil {
			resp.Value.Content = openapi3.Content{}
		}
		resp.Value.Content[consts.MIMETypeJson] = &openapi3.MediaType{
			Schema: &openapi3.SchemaRef{
				Value: &openapi3.Schema{
					Type:       openapi3.TypeObject,
					Properties: openapi3.Schemas{},
				},
			},
		}
	}

	return mType.Schema.Value, nil
}

func (t ToolInfo) ToRespAPIParameter() ([]*common.APIParameter, error) {
	op := t.Operation
	if op == nil {
		return nil, fmt.Errorf("operation is nil")
	}

	respSchema, err := t.GetResponseOpenapiSchema()
	if err != nil {
		return nil, err
	}

	params := make([]*common.APIParameter, 0, len(op.Parameters))
	if len(respSchema.Properties) == 0 {
		return params, nil
	}

	required := slices.ToMap(respSchema.Required, func(e string) (string, bool) {
		return e, true
	})

	for paramName, prop := range respSchema.Properties {
		paramMeta := paramMetaInfo{
			name:     paramName,
			desc:     prop.Value.Description,
			location: string(consts.ParamInBody),
			required: required[paramName],
		}
		apiParam, err := toAPIParameter(paramMeta, prop.Value)
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
		schemaVal := param.Value.Schema.Value
		paramMeta := paramMetaInfo{
			name:     param.Value.Name,
			desc:     param.Value.Description,
			location: param.Value.In,
			required: param.Value.Required,
		}
		apiParam, err := toAPIParameter(paramMeta, schemaVal)
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
			paramMeta := paramMetaInfo{
				name:     paramName,
				desc:     prop.Value.Description,
				location: string(consts.ParamInBody),
				required: required[paramName],
			}
			apiParam, err := toAPIParameter(paramMeta, prop.Value)
			if err != nil {
				return nil, err
			}
			params = append(params, apiParam)
		}

		break // 只取一种 MIME
	}

	return params, nil
}

type paramMetaInfo struct {
	name     string
	desc     string
	required bool
	location string
}

func toAPIParameter(paramMeta paramMetaInfo, sc *openapi3.Schema) (*common.APIParameter, error) {
	apiType, ok := convertor.ToThriftParamType(strings.ToLower(sc.Type))
	if !ok {
		return nil, fmt.Errorf("invalid type '%s'", sc.Type)
	}
	location, ok := convertor.ToThriftHTTPParamLocation(consts.HTTPParamLocation(paramMeta.location))
	if !ok {
		return nil, fmt.Errorf("invalid location '%s'", paramMeta.location)
	}

	apiParam := &common.APIParameter{
		ID:            gonanoid.MustID(10),
		Name:          paramMeta.name,
		Desc:          paramMeta.desc,
		Type:          apiType,
		Location:      location, //使用父节点的值
		IsRequired:    paramMeta.required,
		SubParameters: []*common.APIParameter{},
	}

	if sc.Default != nil {
		apiParam.LocalDefault = ptr.Of(fmt.Sprintf("%v", sc.Default))
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
	if v, ok := sc.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		if disable, ok := v.(bool); ok {
			apiParam.LocalDisable = disable
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
			subMeta := paramMetaInfo{
				name:     subParamName,
				desc:     prop.Value.Description,
				required: required[subParamName],
				location: paramMeta.location,
			}
			subParam, err := toAPIParameter(subMeta, prop.Value)
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
				subMeta := paramMetaInfo{
					name:     subParamName,
					desc:     prop.Value.Description,
					location: paramMeta.location,
					required: required[subParamName],
				}
				subParam, err := toAPIParameter(subMeta, prop.Value)
				if err != nil {
					return nil, err
				}

				apiParam.SubParameters = append(apiParam.SubParameters, subParam)
			}

			return apiParam, nil
		}

		subMeta := paramMetaInfo{
			name:     "[Array Item]",
			desc:     item.Description,
			location: paramMeta.location,
			required: paramMeta.required,
		}
		subParam, err := toAPIParameter(subMeta, item)
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
			Name:          paramVal.Name,
			Desc:          paramVal.Description,
			Required:      paramVal.Required,
			Type:          schemaVal.Type,
			Format:        assistType,
			SubParameters: []*common.PluginParameter{},
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
			paramMeta := paramMetaInfo{
				name:     paramName,
				desc:     prop.Value.Description,
				required: required[paramName],
			}
			paramInfo, err := toPluginParameter(paramMeta, prop.Value)
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

func toPluginParameter(paramMeta paramMetaInfo, sc *openapi3.Schema) (*common.PluginParameter, error) {
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
		Name:          paramMeta.name,
		Type:          sc.Type,
		Desc:          paramMeta.desc,
		Required:      paramMeta.required,
		Format:        assistType,
		SubParameters: []*common.PluginParameter{},
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
			subMeta := paramMetaInfo{
				name:     subParamName,
				desc:     prop.Value.Description,
				required: required[subParamName],
			}
			subParam, err := toPluginParameter(subMeta, prop.Value)
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
				subMeta := paramMetaInfo{
					name:     subParamName,
					desc:     prop.Value.Description,
					required: required[subParamName],
				}
				subParam, err := toPluginParameter(subMeta, prop.Value)
				if err != nil {
					return nil, err
				}
				pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)
			}

			return pluginParam, nil
		}

		subMeta := paramMetaInfo{
			desc:     item.Description,
			required: paramMeta.required,
		}
		subParam, err := toPluginParameter(subMeta, item)
		if err != nil {
			return nil, err
		}
		pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)

		return pluginParam, nil
	}

	return pluginParam, nil
}

func (t ToolInfo) ToToolParameters() ([]*productAPI.ToolParameter, error) {
	apiParams, err := t.ToReqAPIParameter()
	if err != nil {
		return nil, err
	}

	var toToolParams func(apiParams []*common.APIParameter) ([]*productAPI.ToolParameter, error)
	toToolParams = func(apiParams []*common.APIParameter) ([]*productAPI.ToolParameter, error) {
		params := make([]*productAPI.ToolParameter, 0, len(apiParams))
		for _, apiParam := range apiParams {
			typ, _ := convertor.ToOpenapiParamType(apiParam.Type)
			toolParam := &productAPI.ToolParameter{
				Name:         apiParam.Name,
				Description:  apiParam.Desc,
				Type:         typ,
				IsRequired:   apiParam.IsRequired,
				SubParameter: []*productAPI.ToolParameter{},
			}

			if len(apiParam.SubParameters) > 0 {
				subParams, err := toToolParams(apiParam.SubParameters)
				if err != nil {
					return nil, err
				}
				toolParam.SubParameter = append(toolParam.SubParameter, subParams...)
			}

			params = append(params, toolParam)
		}

		return params, nil
	}

	return toToolParams(apiParams)
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
	ToolID    int64
	ToolName  *string
	AgentID   int64
	VersionMs *int64
}

type VersionTool struct {
	ToolID  int64
	Version *string
}

type VersionPlugin struct {
	PluginID int64
	Version  string
}

type VersionAgentTool struct {
	ToolName *string
	ToolID   int64

	VersionMs *int64
}

type PluginManifest struct {
	SchemaVersion       string                                            `json:"schema_version" yaml:"schema_version" validate:"required" `
	NameForModel        string                                            `json:"name_for_model" validate:"required" yaml:"name_for_model"`
	NameForHuman        string                                            `json:"name_for_human" yaml:"name_for_human" validate:"required" `
	DescriptionForModel string                                            `json:"description_for_model" validate:"required" yaml:"description_for_model"`
	DescriptionForHuman string                                            `json:"description_for_human" yaml:"description_for_human" validate:"required"`
	Auth                *AuthV2                                           `json:"auth" yaml:"auth" validate:"required"`
	LogoURL             string                                            `json:"logo_url" yaml:"logo_url" validate:"required"`
	API                 APIDesc                                           `json:"api" yaml:"api"`
	CommonParams        map[consts.HTTPParamLocation][]*CommonParamSchema `json:"common_params" yaml:"common_params"`
}

func NewDefaultPluginManifest() *PluginManifest {
	return &PluginManifest{
		SchemaVersion: "v1",
		API: APIDesc{
			Type: consts.PluginTypeOfLocal,
		},
		Auth: &AuthV2{
			Type: consts.AuthTypeOfNone,
		},
		CommonParams: map[consts.HTTPParamLocation][]*CommonParamSchema{
			consts.ParamInBody: {},
			consts.ParamInHeader: {
				{
					Name:  "User-Agent",
					Value: "Coze/1.0",
				},
			},
			consts.ParamInPath:  {},
			consts.ParamInQuery: {},
		},
	}
}

func (mf PluginManifest) Validate() (err error) {
	err = validator.New().Struct(mf)
	if err != nil {
		return fmt.Errorf("plugin manifest validates failed, err=%v", err)
	}

	if mf.SchemaVersion != "v1" {
		return fmt.Errorf("invalid schema version '%s'", mf.SchemaVersion)
	}
	if mf.API.Type != consts.PluginTypeOfLocal && mf.API.Type != consts.PluginTypeOfCloud {
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
	if mf.Auth.Type != consts.AuthTypeOfNone &&
		mf.Auth.Type != consts.AuthTypeOfOAuth &&
		mf.Auth.Type != consts.AuthTypeOfService {
		return fmt.Errorf("invalid auth type '%s'", mf.Auth.Type)
	}
	if mf.Auth.Type != consts.AuthTypeOfNone && mf.Auth.Type != consts.AuthTypeOfOAuth {
		if mf.Auth.SubType == "" {
			return fmt.Errorf("auth sub type is empty")
		}
		if mf.Auth.SubType != consts.AuthSubTypeOfToken &&
			mf.Auth.SubType != consts.AuthSubTypeOfOIDC {
			return fmt.Errorf("invalid auth sub type '%s'", mf.Auth.SubType)
		}
	}

	for loc := range mf.CommonParams {
		if loc != consts.ParamInBody &&
			loc != consts.ParamInHeader &&
			loc != consts.ParamInQuery &&
			loc != consts.ParamInPath {
			return fmt.Errorf("invalid location '%s' in common params", loc)
		}
	}

	return nil
}

func NewDefaultOpenapiDoc() *Openapi3T {
	return &Openapi3T{
		OpenAPI: "3.0.1",
		Info: &openapi3.Info{
			Version: "v1",
		},
		Paths:   openapi3.Paths{},
		Servers: openapi3.Servers{},
	}
}

type Openapi3T openapi3.T

func (ot Openapi3T) Validate(ctx context.Context) (err error) {
	err = ptr.Of(openapi3.T(ot)).Validate(ctx)
	if err != nil {
		return fmt.Errorf("openapi validates failed, err=%v", err)
	}

	if ot.OpenAPI != "3.0.1" {
		return fmt.Errorf("only support openapi '3.0.1' version")
	}
	if ot.Info == nil {
		return fmt.Errorf("info is empty")
	}
	if ot.Info.Title == "" {
		return fmt.Errorf("title of info is empty")
	}
	if ot.Info.Description == "" {
		return fmt.Errorf("description of info is empty")
	}

	if len(ot.Servers) != 1 {
		return fmt.Errorf("server is required and only one server is allowed, servers=%v", ot.Servers)
	}
	_, err = url.Parse(ot.Servers[0].URL)
	if err != nil {
		return fmt.Errorf("invalid server url '%s'", ot.Servers[0].URL)
	}
	if len(ot.Servers[0].URL) > 512 {
		return fmt.Errorf("server url too long")
	}

	return nil
}

type Openapi3Operation openapi3.Operation

func (op Openapi3Operation) Validate() (err error) {
	if op.OperationID == "" {
		return fmt.Errorf("operation id is empty")
	}
	if op.Summary == "" {
		return fmt.Errorf("summary is empty")
	}

	err = validateOpenapi3RequestBody(op.RequestBody)
	if err != nil {
		return err
	}

	err = validateOpenapi3Parameters(op.Parameters)
	if err != nil {
		return err
	}

	err = validateOpenapi3Responses(op.Responses)
	if err != nil {
		return err
	}

	return nil
}

func (op Openapi3Operation) ToEinoSchemaParameterInfo() (map[string]*schema.ParameterInfo, error) {
	convertType := func(openapiType string) schema.DataType {
		switch openapiType {
		case openapi3.TypeString:
			return schema.String
		case openapi3.TypeInteger:
			return schema.Integer
		case openapi3.TypeObject:
			return schema.Object
		case openapi3.TypeArray:
			return schema.Array
		case openapi3.TypeBoolean:
			return schema.Boolean
		case openapi3.TypeNumber:
			return schema.Number
		default:
			return schema.Null
		}
	}

	disabledParam := func(schemaVal *openapi3.Schema) bool {
		globalDisable, localDisable := false, false
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendLocalDisable]; ok {
			localDisable = v.(bool)
		}
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
			globalDisable = v.(bool)
		}
		return globalDisable || localDisable
	}

	var convertReqBody func(sc *openapi3.Schema, isRequired bool) (*schema.ParameterInfo, error)
	convertReqBody = func(sc *openapi3.Schema, isRequired bool) (*schema.ParameterInfo, error) {
		if disabledParam(sc) {
			return nil, nil
		}

		paramInfo := &schema.ParameterInfo{
			Type:     convertType(sc.Type),
			Desc:     sc.Description,
			Required: isRequired,
		}

		switch sc.Type {
		case openapi3.TypeObject:
			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})

			subParams := make(map[string]*schema.ParameterInfo, len(sc.Properties))
			for paramName, prop := range sc.Properties {
				subParam, err := convertReqBody(prop.Value, required[paramName])
				if err != nil {
					return nil, err
				}

				subParams[paramName] = subParam
			}

			paramInfo.SubParams = subParams
		case openapi3.TypeArray:
			ele, err := convertReqBody(sc.Items.Value, isRequired)
			if err != nil {
				return nil, err
			}

			paramInfo.ElemInfo = ele
		case openapi3.TypeString, openapi3.TypeInteger, openapi3.TypeBoolean, openapi3.TypeNumber:
			return paramInfo, nil
		default:
			return nil, fmt.Errorf("unsupported json type '%s'", sc.Type)
		}

		return paramInfo, nil
	}

	result := make(map[string]*schema.ParameterInfo)

	for _, prop := range op.Parameters {
		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value
		if schemaVal.Type == openapi3.TypeObject || schemaVal.Type == openapi3.TypeArray {
			continue
		}

		if disabledParam(prop.Value.Schema.Value) {
			continue
		}

		paramInfo := &schema.ParameterInfo{
			Type:     convertType(schemaVal.Type),
			Desc:     paramVal.Description,
			Required: paramVal.Required,
		}

		if _, ok := result[paramVal.Name]; ok {
			return nil, fmt.Errorf("duplicate param name '%s'", paramVal.Name)
		}

		result[paramVal.Name] = paramInfo
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
			paramInfo, err := convertReqBody(prop.Value, required[paramName])
			if err != nil {
				return nil, err
			}

			if _, ok := result[paramName]; ok {
				return nil, fmt.Errorf("duplicate param name '%s'", paramName)
			}

			result[paramName] = paramInfo
		}

		break // 只取一种 MIME
	}

	return result, nil
}

func validateOpenapi3Parameters(params openapi3.Parameters) (err error) {
	if len(params) == 0 {
		return nil
	}

	for _, param := range params {
		if param.Value == nil {
			return fmt.Errorf("parameter value is nil")
		}

		if param.Value.In == "" {
			return fmt.Errorf("parameter location is empty")
		}
		loc := strings.ToLower(param.Value.In)
		if loc == string(consts.ParamInBody) {
			return fmt.Errorf("the location of parameter '%s' cannot be 'body'", param.Value.Name)
		}

		if param.Value.Schema == nil || param.Value.Schema.Value == nil {
			return fmt.Errorf("parameter schema is empty")
		}

		sc := param.Value.Schema.Value
		if sc.Type == "" {
			return fmt.Errorf("parameter type is empty")
		}
		if sc.Type != openapi3.TypeString &&
			sc.Type != openapi3.TypeInteger &&
			sc.Type != openapi3.TypeNumber &&
			sc.Type != openapi3.TypeBoolean {
			return fmt.Errorf("invalid parameter type '%s'", sc.Type)
		}
	}

	return nil
}

var contentTypeArray = []string{
	consts.MIMETypeJson,
	consts.MIMETypeJsonPatch,
	consts.MIMETypeProblemJson,
	consts.MIMETypeForm,
	consts.MIMETypeXYaml,
	consts.MIMETypeYaml,
}

func validateOpenapi3RequestBody(bodyRef *openapi3.RequestBodyRef) (err error) {
	if bodyRef == nil || bodyRef.Value == nil || len(bodyRef.Value.Content) == 0 {
		return nil
	}

	body := bodyRef.Value
	if len(body.Content) != 1 {
		return fmt.Errorf("the request body only supports one MIME type")
	}

	var mType *openapi3.MediaType
	for _, ct := range contentTypeArray {
		var ok bool
		mType, ok = body.Content[ct]
		if ok {
			break
		}
	}
	if mType == nil {
		return fmt.Errorf("invalid request MIME type, the request body only the following types: [%v]",
			strings.Join(contentTypeArray, ", "))
	}

	if mType.Schema == nil || mType.Schema.Value == nil {
		return fmt.Errorf("request body schema is empty")
	}

	sc := mType.Schema.Value
	if sc.Type == "" {
		return fmt.Errorf("request body type is empty")
	}
	if sc.Type != openapi3.TypeObject {
		return fmt.Errorf("the request body only supports 'object' type")
	}

	return nil
}

func validateOpenapi3Responses(responses openapi3.Responses) (err error) {
	if len(responses) == 0 {
		return nil
	}

	// default status 不处理
	// 只处理 '200' status
	if len(responses) != 1 {
		if len(responses) != 2 {
			return fmt.Errorf("the response only supports '200' status")
		} else if _, ok := responses["default"]; !ok {
			return fmt.Errorf("the response only supports '200' status")
		}
	}

	resp, ok := responses[strconv.Itoa(http.StatusOK)]
	if !ok {
		return fmt.Errorf("the response only supports '200' status")
	}
	if resp.Value == nil {
		return fmt.Errorf("response value is nil")
	}
	if resp.Value.Content == nil {
		return fmt.Errorf("response content is empty")
	}

	if len(resp.Value.Content) != 1 {
		return fmt.Errorf("the response only supports 'application/json' type")
	}
	mType, ok := resp.Value.Content[consts.MIMETypeJson]
	if !ok {
		return fmt.Errorf("the response only supports 'application/json' type")
	}
	if mType.Schema == nil || mType.Schema.Value == nil {
		return fmt.Errorf("response schema is empty")
	}

	sc := mType.Schema.Value
	if sc.Type == "" {
		return fmt.Errorf("response type is empty")
	}
	if sc.Type != openapi3.TypeObject {
		return fmt.Errorf("the response only supports 'object' type")
	}

	return nil
}

type AuthV2 struct {
	Type        consts.AuthType    `json:"type" validate:"required" yaml:"type"`
	SubType     consts.AuthSubType `json:"sub_type" yaml:"sub_type"`
	Payload     *string            `json:"payload,omitempty" yaml:"payload,omitempty"`
	AuthOfOIDC  *AuthOfOIDC        `json:"-"`
	AuthOfToken *AuthOfToken       `json:"-"`
	AuthOfOAuth *AuthOfOAuth       `json:"-"`
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

		payload, err := sonic.MarshalString(au.AuthOfOAuth)
		if err != nil {
			return err
		}

		au.Payload = &payload
	}

	if au.Type == consts.AuthTypeOfService {
		if au.SubType == "" && (au.Payload == nil || *au.Payload == "") { // 兼容老数据
			au.SubType = consts.AuthSubTypeOfToken
		}
		switch au.SubType {
		case consts.AuthSubTypeOfOIDC:
			oidc := &AuthOfOIDC{}
			err = sonic.UnmarshalString(auth.Payload, oidc)
			if err != nil {
				return err
			}

			au.Payload = &auth.Payload

		case consts.AuthSubTypeOfToken:
			if len(auth.ServiceToken) > 0 {
				au.AuthOfToken = &AuthOfToken{
					Location:     consts.HTTPParamLocation(auth.Location),
					Key:          auth.Key,
					ServiceToken: auth.ServiceToken,
				}
			} else {
				token := &AuthOfToken{}
				err = sonic.UnmarshalString(auth.Payload, token)
				if err != nil {
					return err
				}
				au.AuthOfToken = token
			}

			payload, err := sonic.MarshalString(au.AuthOfToken)
			if err != nil {
				return err
			}

			au.Payload = &payload
		}
	}

	return nil
}

type CommonParamSchema struct {
	Name  string `json:"name" yaml:"name" validate:"required"`
	Value string `json:"value" yaml:"value"`
}

type APIDesc struct {
	Type consts.PluginType `json:"type" validate:"required"`
}

type UniqueToolAPI struct {
	SubURL string
	Method string
}

func isValidJSON(data []byte) bool {
	var js json.RawMessage
	return sonic.Unmarshal(data, &js) == nil
}
