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
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"

	productAPI "github.com/coze-dev/coze-studio/backend/api/model/flow/marketplace/product_public_api"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type ToolInfo struct {
	ID        int64
	PluginID  int64
	CreatedAt int64
	UpdatedAt int64
	Version   *string

	ActivatedStatus *ActivatedStatus
	DebugStatus     *plugin_develop_common.APIDebugStatus

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

func (t ToolInfo) GetActivatedStatus() ActivatedStatus {
	return ptr.FromOrDefault(t.ActivatedStatus, ActivateTool)
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
		return nil, fmt.Errorf("operation is required")
	}

	resp, ok := op.Responses[strconv.Itoa(http.StatusOK)]
	if !ok || resp == nil || resp.Value == nil || len(resp.Value.Content) == 0 {
		return nil, fmt.Errorf("response status '200' not found")
	}

	mType, ok := resp.Value.Content[MediaTypeJson] // only support application/json
	if !ok || mType == nil || mType.Schema == nil || mType.Schema.Value == nil {
		return nil, fmt.Errorf("media type '%s' not found in response", MediaTypeJson)
	}

	return mType.Schema.Value, nil
}

type paramMetaInfo struct {
	name     string
	desc     string
	required bool
	location string
}

func (t ToolInfo) ToRespAPIParameter() ([]*common.APIParameter, error) {
	op := t.Operation
	if op == nil {
		return nil, fmt.Errorf("operation is required")
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

	for subParamName, prop := range respSchema.Properties {
		if prop == nil || prop.Value == nil {
			return nil, fmt.Errorf("the schema of property '%s' is required", subParamName)
		}

		paramMeta := paramMetaInfo{
			name:     subParamName,
			desc:     prop.Value.Description,
			location: string(ParamInBody),
			required: required[subParamName],
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
		return nil, fmt.Errorf("operation is required")
	}

	params := make([]*common.APIParameter, 0, len(op.Parameters))
	for _, param := range op.Parameters {
		if param == nil || param.Value == nil || param.Value.Schema == nil || param.Value.Schema.Value == nil {
			return nil, fmt.Errorf("parameter schema is required")
		}

		paramVal := param.Value
		schemaVal := paramVal.Schema.Value

		if schemaVal.Type == openapi3.TypeObject {
			return nil, fmt.Errorf("the type of parameter '%s' cannot be 'object'", paramVal.Name)
		}

		if schemaVal.Type == openapi3.TypeArray {
			if paramVal.In == openapi3.ParameterInPath {
				return nil, fmt.Errorf("the type of field '%s' cannot be 'array'", paramVal.Name)
			}
			if schemaVal.Items == nil || schemaVal.Items.Value == nil {
				return nil, fmt.Errorf("the item schema of field '%s' is required", paramVal.Name)
			}
			item := schemaVal.Items.Value
			if item.Type == openapi3.TypeObject || item.Type == openapi3.TypeArray {
				return nil, fmt.Errorf("the item type of parameter '%s' cannot be 'object' or 'array'", paramVal.Name)
			}
		}

		paramMeta := paramMetaInfo{
			name:     paramVal.Name,
			desc:     paramVal.Description,
			location: paramVal.In,
			required: paramVal.Required,
		}
		apiParam, err := toAPIParameter(paramMeta, schemaVal)
		if err != nil {
			return nil, err
		}

		params = append(params, apiParam)
	}

	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return params, nil
	}

	for _, mType := range op.RequestBody.Value.Content {
		if mType == nil || mType.Schema == nil || mType.Schema.Value == nil {
			return nil, fmt.Errorf("request body schema is required")
		}

		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for subParamName, prop := range schemaVal.Properties {
			if prop == nil || prop.Value == nil {
				return nil, fmt.Errorf("the schema of property '%s' is required", subParamName)
			}

			paramMeta := paramMetaInfo{
				name:     subParamName,
				desc:     prop.Value.Description,
				location: string(ParamInBody),
				required: required[subParamName],
			}
			apiParam, err := toAPIParameter(paramMeta, prop.Value)
			if err != nil {
				return nil, err
			}

			params = append(params, apiParam)
		}

		break // Take only one MIME.
	}

	return params, nil
}

func toAPIParameter(paramMeta paramMetaInfo, sc *openapi3.Schema) (*common.APIParameter, error) {
	if sc == nil {
		return nil, fmt.Errorf("schema is requred")
	}

	apiType, ok := ToThriftParamType(strings.ToLower(sc.Type))
	if !ok {
		return nil, fmt.Errorf("the type '%s' of filed '%s' is invalid", sc.Type, paramMeta.name)
	}
	location, ok := ToThriftHTTPParamLocation(HTTPParamLocation(paramMeta.location))
	if !ok {
		return nil, fmt.Errorf("the location '%s' of field '%s' is invalid", paramMeta.location, paramMeta.name)
	}

	apiParam := &common.APIParameter{
		ID:            gonanoid.MustID(10),
		Name:          paramMeta.name,
		Desc:          paramMeta.desc,
		Type:          apiType,
		Location:      location, // Using the value of the parent node
		IsRequired:    paramMeta.required,
		SubParameters: []*common.APIParameter{},
	}

	if sc.Default != nil {
		apiParam.GlobalDefault = ptr.Of(fmt.Sprintf("%v", sc.Default))
		apiParam.LocalDefault = ptr.Of(fmt.Sprintf("%v", sc.Default))
	}

	if sc.Format != "" {
		aType, ok := FormatToAssistType(sc.Format)
		if !ok {
			return nil, fmt.Errorf("the format '%s' of field '%s' is invalid", sc.Format, paramMeta.name)
		}
		_aType, ok := ToThriftAPIAssistType(aType)
		if !ok {
			return nil, fmt.Errorf("assist type '%s' of field '%s' is invalid", aType, paramMeta.name)
		}
		apiParam.AssistType = ptr.Of(_aType)
	}

	if v, ok := sc.Extensions[APISchemaExtendGlobalDisable]; ok {
		if disable, ok := v.(bool); ok {
			apiParam.GlobalDisable = disable
		}
	}
	if v, ok := sc.Extensions[APISchemaExtendLocalDisable]; ok {
		if disable, ok := v.(bool); ok {
			apiParam.LocalDisable = disable
		}
	}
	if v, ok := sc.Extensions[APISchemaExtendVariableRef]; ok {
		if ref, ok := v.(string); ok {
			apiParam.VariableRef = ptr.Of(ref)
			apiParam.DefaultParamSource = ptr.Of(common.DefaultParamSource_Variable)
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
			if prop == nil || prop.Value == nil {
				return nil, fmt.Errorf("the schema of property '%s' is required", subParamName)
			}

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
		if sc.Items == nil || sc.Items.Value == nil {
			return nil, fmt.Errorf("the item schema of field '%s' is required", paramMeta.name)
		}

		item := sc.Items.Value

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
		return nil, fmt.Errorf("operation is required")
	}

	var params []*common.PluginParameter

	for _, prop := range op.Parameters {
		if prop == nil || prop.Value == nil || prop.Value.Schema == nil || prop.Value.Schema.Value == nil {
			return nil, fmt.Errorf("parameter schema is required")
		}

		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value

		if schemaVal.Type == openapi3.TypeObject {
			return nil, fmt.Errorf("the type of parameter '%s' cannot be 'object'", paramVal.Name)
		}

		var arrayItemType string
		if schemaVal.Type == openapi3.TypeArray {
			if paramVal.In == openapi3.ParameterInPath {
				return nil, fmt.Errorf("the type of field '%s' cannot be 'array'", paramVal.Name)
			}
			if schemaVal.Items == nil || schemaVal.Items.Value == nil {
				return nil, fmt.Errorf("the item schema of field '%s' is required", paramVal.Name)
			}
			item := schemaVal.Items.Value
			if item.Type == openapi3.TypeObject || item.Type == openapi3.TypeArray {
				return nil, fmt.Errorf("the item type of parameter '%s' cannot be 'object' or 'array'", paramVal.Name)
			}

			arrayItemType = item.Type
		}

		if disabledParam(schemaVal) {
			continue
		}

		var assistType *common.PluginParamTypeFormat
		if v, ok := schemaVal.Extensions[APISchemaExtendAssistType]; ok {
			_v, ok := v.(string)
			if !ok {
				continue
			}
			f, ok := AssistTypeToThriftFormat(APIFileAssistType(_v))
			if ok {
				return nil, fmt.Errorf("the assist type '%s' of field '%s' is invalid", _v, paramVal.Name)
			}
			assistType = ptr.Of(f)
		}

		params = append(params, &common.PluginParameter{
			Name:          paramVal.Name,
			Desc:          paramVal.Description,
			Required:      paramVal.Required,
			Type:          schemaVal.Type,
			SubType:       arrayItemType,
			Format:        assistType,
			SubParameters: []*common.PluginParameter{},
		})
	}

	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return params, nil
	}

	for _, mType := range op.RequestBody.Value.Content {
		if mType == nil || mType.Schema == nil || mType.Schema.Value == nil {
			return nil, fmt.Errorf("request body schema is required")
		}

		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for subParamName, prop := range schemaVal.Properties {
			if prop == nil || prop.Value == nil {
				return nil, fmt.Errorf("the schema of property '%s' is required", subParamName)
			}

			paramMeta := paramMetaInfo{
				name:     subParamName,
				desc:     prop.Value.Description,
				required: required[subParamName],
			}
			paramInfo, err := toPluginParameter(paramMeta, prop.Value)
			if err != nil {
				return nil, err
			}
			if paramInfo != nil {
				params = append(params, paramInfo)
			}
		}

		break // Take only one MIME.
	}

	return params, nil
}

func toPluginParameter(paramMeta paramMetaInfo, sc *openapi3.Schema) (*common.PluginParameter, error) {
	if sc == nil {
		return nil, fmt.Errorf("schema is required")
	}

	if disabledParam(sc) {
		return nil, nil
	}

	var assistType *common.PluginParamTypeFormat
	if v, ok := sc.Extensions[APISchemaExtendAssistType]; ok {
		if _v, ok := v.(string); ok {
			f, ok := AssistTypeToThriftFormat(APIFileAssistType(_v))
			if !ok {
				return nil, fmt.Errorf("the assist type '%s' of field '%s' is invalid", _v, paramMeta.name)
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
			if prop == nil || prop.Value == nil {
				return nil, fmt.Errorf("the schema of property '%s' is required", subParamName)
			}

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
		if sc.Items == nil || sc.Items.Value == nil {
			return nil, fmt.Errorf("the item schema of field '%s' is required", paramMeta.name)
		}

		item := sc.Items.Value
		pluginParam.SubType = item.Type

		if item.Type != openapi3.TypeObject {
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

		pluginParam.SubParameters = append(pluginParam.SubParameters, subParam.SubParameters...)

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
			typ, _ := ToOpenapiParamType(apiParam.Type)
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
