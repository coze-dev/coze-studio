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

package api

import (
	"net/http"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func APIParamsToOpenapiOperation(reqParams, respParams []*common.APIParameter) (*openapi3.Operation, error) {
	op := &openapi3.Operation{}

	hasSetReqBody := false
	hasSetParams := false

	for _, apiParam := range reqParams {
		if apiParam.Location != common.ParameterLocation_Body {
			if !hasSetParams {
				hasSetParams = true
				op.Parameters = []*openapi3.ParameterRef{}
			}

			_apiParam, err := toOpenapiParameter(apiParam)
			if err != nil {
				return nil, err
			}
			op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
				Value: _apiParam,
			})

			continue
		}

		var mType *openapi3.MediaType
		if hasSetReqBody {
			mType = op.RequestBody.Value.Content[consts.MediaTypeJson]
		} else {
			hasSetReqBody = true
			mType = &openapi3.MediaType{
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type:       openapi3.TypeObject,
						Properties: map[string]*openapi3.SchemaRef{},
					},
				},
			}
			op.RequestBody = &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: map[string]*openapi3.MediaType{
						consts.MediaTypeJson: mType,
					},
				},
			}
		}

		_apiParam, err := toOpenapi3Schema(apiParam)
		if err != nil {
			return nil, err
		}

		mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
			Value: _apiParam,
		}
		if apiParam.IsRequired {
			mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
		}
	}

	if reqParams != nil {
		if !hasSetParams {
			op.Parameters = []*openapi3.ParameterRef{}
		}
		if !hasSetReqBody {
			op.RequestBody = model.DefaultOpenapi3RequestBody()
		}
	}

	hasSetRespBody := false

	for _, apiParam := range respParams {
		if !hasSetRespBody {
			hasSetRespBody = true
			op.Responses = map[string]*openapi3.ResponseRef{
				strconv.Itoa(http.StatusOK): {
					Value: &openapi3.Response{
						Content: map[string]*openapi3.MediaType{
							consts.MediaTypeJson: {
								Schema: &openapi3.SchemaRef{
									Value: &openapi3.Schema{
										Type:       openapi3.TypeObject,
										Properties: map[string]*openapi3.SchemaRef{},
									},
								},
							},
						},
					},
				},
			}
		}

		_apiParam, err := toOpenapi3Schema(apiParam)
		if err != nil {
			return nil, err
		}

		resp, _ := op.Responses[strconv.Itoa(http.StatusOK)]
		mType, _ := resp.Value.Content[consts.MediaTypeJson] // only support application/json
		mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
			Value: _apiParam,
		}

		if apiParam.IsRequired {
			mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
		}
	}

	if respParams != nil && !hasSetRespBody {
		op.Responses = model.DefaultOpenapi3Responses()
	}

	return op, nil
}

func toOpenapiParameter(apiParam *common.APIParameter) (*openapi3.Parameter, error) {
	paramType, ok := convert.ToOpenapiParamType(apiParam.Type)
	if !ok {
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the type '%s' of field '%s' is invalid", apiParam.Type, apiParam.Name))
	}

	if paramType == openapi3.TypeObject {
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the type of field '%s' cannot be 'object'", apiParam.Name))
	}

	paramSchema := &openapi3.Schema{
		Type:    paramType,
		Default: apiParam.GlobalDefault,
		Extensions: map[string]interface{}{
			consts.APISchemaExtendGlobalDisable: apiParam.GlobalDisable,
		},
	}

	if paramType == openapi3.TypeArray {
		if apiParam.Location == common.ParameterLocation_Path {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the type of field '%s' cannot be 'array'", apiParam.Name))
		}
		if len(apiParam.SubParameters) == 0 {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the sub parameters of field '%s' is required", apiParam.Name))
		}

		arrayItem := apiParam.SubParameters[0]
		arrayItemType, ok := convert.ToOpenapiParamType(arrayItem.Type)
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the item type '%s' of field '%s' is invalid", arrayItemType, apiParam.Name))
		}

		if arrayItemType == openapi3.TypeObject || arrayItemType == openapi3.TypeArray {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the item type of field '%s' cannot be 'array' or 'object'", apiParam.Name))
		}

		itemSchema := &openapi3.Schema{
			Type:        arrayItemType,
			Description: arrayItem.Desc,
			Extensions:  map[string]any{},
		}

		if arrayItem.GetAssistType() > 0 {
			aType, ok := convert.ToAPIAssistType(arrayItem.GetAssistType())
			if !ok {
				return nil, errorx.New(errno.ErrPluginInvalidParamCode,
					errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", arrayItem.GetAssistType(), apiParam.Name))
			}
			itemSchema.Extensions[consts.APISchemaExtendAssistType] = aType
			format, ok := convert.AssistTypeToFormat(aType)
			if !ok {
				return nil, errorx.New(errno.ErrPluginInvalidParamCode,
					errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", aType, apiParam.Name))
			}
			itemSchema.Format = format
		}

		paramSchema.Items = &openapi3.SchemaRef{
			Value: itemSchema,
		}
	}

	if apiParam.LocalDefault != nil && *apiParam.LocalDefault != "" {
		paramSchema.Default = apiParam.LocalDefault
	}
	if apiParam.LocalDisable {
		paramSchema.Extensions[consts.APISchemaExtendLocalDisable] = true
	}
	if apiParam.VariableRef != nil && *apiParam.VariableRef != "" {
		paramSchema.Extensions[consts.APISchemaExtendVariableRef] = apiParam.VariableRef
	}

	if apiParam.GetAssistType() > 0 {
		aType, ok := convert.ToAPIAssistType(apiParam.GetAssistType())
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", apiParam.GetAssistType(), apiParam.Name))
		}
		paramSchema.Extensions[consts.APISchemaExtendAssistType] = aType
		format, ok := convert.AssistTypeToFormat(aType)
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", aType, apiParam.Name))
		}
		paramSchema.Format = format
	}

	loc, ok := convert.ToHTTPParamLocation(apiParam.Location)
	if !ok {
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the location '%s' of field '%s' is invalid ", apiParam.Location, apiParam.Name))
	}

	param := &openapi3.Parameter{
		Description: apiParam.Desc,
		Name:        apiParam.Name,
		In:          string(loc),
		Required:    apiParam.IsRequired,
		Schema: &openapi3.SchemaRef{
			Value: paramSchema,
		},
	}

	return param, nil
}

func toOpenapi3Schema(apiParam *common.APIParameter) (*openapi3.Schema, error) {
	paramType, ok := convert.ToOpenapiParamType(apiParam.Type)
	if !ok {
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the type '%s' of field '%s' is invalid", apiParam.Type, apiParam.Name))
	}

	sc := &openapi3.Schema{
		Description: apiParam.Desc,
		Type:        paramType,
		Extensions: map[string]interface{}{
			consts.APISchemaExtendGlobalDisable: apiParam.GlobalDisable,
		},
	}
	if apiParam.GlobalDefault != nil && *apiParam.GlobalDefault != "" {
		sc.Default = apiParam.GlobalDefault
	}

	if apiParam.LocalDefault != nil && *apiParam.LocalDefault != "" {
		sc.Default = apiParam.LocalDefault
	}
	if apiParam.LocalDisable {
		sc.Extensions[consts.APISchemaExtendLocalDisable] = true
	}
	if apiParam.VariableRef != nil && *apiParam.VariableRef != "" {
		sc.Extensions[consts.APISchemaExtendVariableRef] = apiParam.VariableRef
	}

	if apiParam.GetAssistType() > 0 {
		aType, ok := convert.ToAPIAssistType(apiParam.GetAssistType())
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", apiParam.GetAssistType(), apiParam.Name))
		}
		sc.Extensions[consts.APISchemaExtendAssistType] = aType
		format, ok := convert.AssistTypeToFormat(aType)
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", aType, apiParam.Name))
		}
		sc.Format = format
	}

	switch paramType {
	case openapi3.TypeObject:
		sc.Properties = map[string]*openapi3.SchemaRef{}
		for _, subParam := range apiParam.SubParameters {
			_subParam, err := toOpenapi3Schema(subParam)
			if err != nil {
				return nil, err
			}
			sc.Properties[subParam.Name] = &openapi3.SchemaRef{
				Value: _subParam,
			}
			if subParam.IsRequired {
				sc.Required = append(sc.Required, subParam.Name)
			}
		}

		return sc, nil

	case openapi3.TypeArray:
		if len(apiParam.SubParameters) == 0 {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the sub-parameters of field '%s' are required", apiParam.Name))
		}

		arrayItem := apiParam.SubParameters[0]
		itemType, ok := convert.ToOpenapiParamType(arrayItem.Type)
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the item type '%s' of field '%s' is invalid", itemType, apiParam.Name))
		}

		subParam, err := toOpenapi3Schema(arrayItem)
		if err != nil {
			return nil, err
		}
		sc.Items = &openapi3.SchemaRef{
			Value: subParam,
		}

		return sc, nil
	}

	return sc, nil
}
