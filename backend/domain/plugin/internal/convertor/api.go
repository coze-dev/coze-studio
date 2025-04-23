package convertor

import (
	"net/http"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
)

var httpParamLocations = map[plugin_common.ParameterLocation]consts.HTTPParamLocation{
	plugin_common.ParameterLocation_Path:   consts.ParamInPath,
	plugin_common.ParameterLocation_Query:  consts.ParamInQuery,
	plugin_common.ParameterLocation_Body:   consts.ParamInBody,
	plugin_common.ParameterLocation_Header: consts.ParamInHeader,
}

var thriftHTTPParamLocations = func() map[consts.HTTPParamLocation]plugin_common.ParameterLocation {
	locations := make(map[consts.HTTPParamLocation]plugin_common.ParameterLocation, len(httpParamLocations))
	for k, v := range httpParamLocations {
		locations[v] = k
	}

	return locations
}()

func ToHTTPParamLocation(loc plugin_common.ParameterLocation) consts.HTTPParamLocation {
	return httpParamLocations[loc]
}

func ToThriftHTTPParamLocation(loc consts.HTTPParamLocation) plugin_common.ParameterLocation {
	return thriftHTTPParamLocations[loc]
}

var openapiTypes = map[plugin_common.ParameterType]string{
	plugin_common.ParameterType_String:  openapi3.TypeString,
	plugin_common.ParameterType_Integer: openapi3.TypeInteger,
	plugin_common.ParameterType_Number:  openapi3.TypeNumber,
	plugin_common.ParameterType_Object:  openapi3.TypeObject,
	plugin_common.ParameterType_Array:   openapi3.TypeArray,
	plugin_common.ParameterType_Bool:    openapi3.TypeBoolean,
}

var thriftParameterTypes = func() map[string]plugin_common.ParameterType {
	types := make(map[string]plugin_common.ParameterType, len(openapiTypes))
	for k, v := range openapiTypes {
		types[v] = k
	}

	return types
}()

func ToOpenapiParamType(typ plugin_common.ParameterType) string {
	return openapiTypes[typ]
}

func ToThriftParamType(typ string) plugin_common.ParameterType {
	return thriftParameterTypes[typ]
}

var apiAssistTypes = map[plugin_common.AssistParameterType]consts.APIFileAssistType{
	plugin_common.AssistParameterType_DEFAULT: consts.AssistTypeFile,
	plugin_common.AssistParameterType_IMAGE:   consts.AssistTypeImage,
	plugin_common.AssistParameterType_DOC:     consts.AssistTypeDoc,
	plugin_common.AssistParameterType_PPT:     consts.AssistTypePpt,
	plugin_common.AssistParameterType_CODE:    consts.AssistTypeCode,
	plugin_common.AssistParameterType_EXCEL:   consts.AssistTypeExcel,
	plugin_common.AssistParameterType_ZIP:     consts.AssistTypeZip,
	plugin_common.AssistParameterType_VIDEO:   consts.AssistTypeVideo,
	plugin_common.AssistParameterType_AUDIO:   consts.AssistTypeAudio,
	plugin_common.AssistParameterType_TXT:     consts.AssistTypeTxt,
	//plugin_common.AssistParameterType_VOICE:   consts.AssistTypeVoice,
}

var thriftAPIAssistTypes = func() map[consts.APIFileAssistType]plugin_common.AssistParameterType {
	types := make(map[consts.APIFileAssistType]plugin_common.AssistParameterType, len(apiAssistTypes))
	for k, v := range apiAssistTypes {
		types[v] = k
	}

	return types
}()

func ToAPIAssistType(typ plugin_common.AssistParameterType) consts.APIFileAssistType {
	return apiAssistTypes[typ]
}

func ToThriftAPIAssistType(typ consts.APIFileAssistType) plugin_common.AssistParameterType {
	return thriftAPIAssistTypes[typ]
}

var httpMethods = map[plugin_common.APIMethod]string{
	plugin_common.APIMethod_GET:    strings.ToLower(http.MethodGet),
	plugin_common.APIMethod_POST:   strings.ToLower(http.MethodPost),
	plugin_common.APIMethod_PUT:    strings.ToLower(http.MethodPut),
	plugin_common.APIMethod_DELETE: strings.ToLower(http.MethodDelete),
	plugin_common.APIMethod_PATCH:  strings.ToLower(http.MethodPatch),
}

var thriftAPIMethods = func() map[string]plugin_common.APIMethod {
	methods := make(map[string]plugin_common.APIMethod, len(httpMethods))
	for k, v := range httpMethods {
		methods[v] = k
	}

	return methods
}()

func ToHttpMethod(method plugin_common.APIMethod) string {
	return httpMethods[method]
}

func ToThriftAPIMethod(method string) plugin_common.APIMethod {
	return thriftAPIMethods[method]
}
