package pluginutil

import (
	"net/http"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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
			mType = op.RequestBody.Value.Content[plugin.MediaTypeJson]
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
						plugin.MediaTypeJson: mType,
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

	hasSetRespBody := false

	for _, apiParam := range respParams {
		if !hasSetRespBody {
			hasSetRespBody = true
			op.Responses = map[string]*openapi3.ResponseRef{
				strconv.Itoa(http.StatusOK): {
					Value: &openapi3.Response{
						Content: map[string]*openapi3.MediaType{
							plugin.MediaTypeJson: {
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
		mType, _ := resp.Value.Content[plugin.MediaTypeJson] // only support application/json
		mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
			Value: _apiParam,
		}

		if apiParam.IsRequired {
			mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
		}
	}

	return op, nil
}

func toOpenapiParameter(apiParam *common.APIParameter) (*openapi3.Parameter, error) {
	paramType, ok := plugin.ToOpenapiParamType(apiParam.Type)
	if !ok {
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the type '%s' of field '%s' is invalid", apiParam.Type, apiParam.Name))
	}

	if paramType == openapi3.TypeObject || paramType == openapi3.TypeArray { //TODO:(@maronghong): 支持 array
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the type of field '%s' cannot be 'array' or 'object'", apiParam.Name))
	}

	paramSchema := &openapi3.Schema{
		Description: apiParam.Desc,
		Type:        paramType,
		Default:     apiParam.GlobalDefault,
		Extensions: map[string]interface{}{
			plugin.APISchemaExtendGlobalDisable: apiParam.GlobalDisable,
		},
	}
	if apiParam.LocalDefault != nil && *apiParam.LocalDefault != "" {
		paramSchema.Default = apiParam.LocalDefault
	}
	if apiParam.LocalDisable {
		paramSchema.Extensions[plugin.APISchemaExtendLocalDisable] = true
	}
	if apiParam.VariableRef != nil && *apiParam.VariableRef != "" {
		paramSchema.Extensions[plugin.APISchemaExtendVariableRef] = apiParam.VariableRef
	}

	if apiParam.GetAssistType() > 0 {
		aType, ok := plugin.ToAPIAssistType(apiParam.GetAssistType())
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", apiParam.GetAssistType(), apiParam.Name))
		}
		paramSchema.Extensions[plugin.APISchemaExtendAssistType] = aType
		format, ok := plugin.AssistTypeToFormat(aType)
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", aType, apiParam.Name))
		}
		paramSchema.Format = format
	}

	loc, ok := plugin.ToHTTPParamLocation(apiParam.Location)
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
	paramType, ok := plugin.ToOpenapiParamType(apiParam.Type)
	if !ok {
		return nil, errorx.New(errno.ErrPluginInvalidParamCode,
			errorx.KVf(errno.PluginMsgKey, "the type '%s' of field '%s' is invalid", apiParam.Type, apiParam.Name))
	}

	sc := &openapi3.Schema{
		Description: apiParam.Desc,
		Type:        paramType,
		Default:     apiParam.GlobalDefault,
		Extensions: map[string]interface{}{
			plugin.APISchemaExtendGlobalDisable: apiParam.GlobalDisable,
		},
	}
	if apiParam.LocalDefault != nil && *apiParam.LocalDefault != "" {
		sc.Default = apiParam.LocalDefault
	}
	if apiParam.LocalDisable {
		sc.Extensions[plugin.APISchemaExtendLocalDisable] = true
	}
	if apiParam.VariableRef != nil && *apiParam.VariableRef != "" {
		sc.Extensions[plugin.APISchemaExtendVariableRef] = apiParam.VariableRef
	}

	if apiParam.GetAssistType() > 0 {
		aType, ok := plugin.ToAPIAssistType(apiParam.GetAssistType())
		if !ok {
			return nil, errorx.New(errno.ErrPluginInvalidParamCode,
				errorx.KVf(errno.PluginMsgKey, "the assist type '%s' of field '%s' is invalid", apiParam.GetAssistType(), apiParam.Name))
		}
		sc.Extensions[plugin.APISchemaExtendAssistType] = aType
		format, ok := plugin.AssistTypeToFormat(aType)
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
		itemType, ok := plugin.ToOpenapiParamType(arrayItem.Type)
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
