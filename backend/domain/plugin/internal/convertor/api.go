package convertor

import (
	"net/http"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
)

var httpParamLocations = map[common.ParameterLocation]consts.HTTPParamLocation{
	common.ParameterLocation_Path:   consts.ParamInPath,
	common.ParameterLocation_Query:  consts.ParamInQuery,
	common.ParameterLocation_Body:   consts.ParamInBody,
	common.ParameterLocation_Header: consts.ParamInHeader,
}

var thriftHTTPParamLocations = func() map[consts.HTTPParamLocation]common.ParameterLocation {
	locations := make(map[consts.HTTPParamLocation]common.ParameterLocation, len(httpParamLocations))
	for k, v := range httpParamLocations {
		locations[v] = k
	}

	return locations
}()

func ToHTTPParamLocation(loc common.ParameterLocation) consts.HTTPParamLocation {
	return httpParamLocations[loc]
}

func ToThriftHTTPParamLocation(loc consts.HTTPParamLocation) common.ParameterLocation {
	return thriftHTTPParamLocations[loc]
}

var openapiTypes = map[common.ParameterType]string{
	common.ParameterType_String:  openapi3.TypeString,
	common.ParameterType_Integer: openapi3.TypeInteger,
	common.ParameterType_Number:  openapi3.TypeNumber,
	common.ParameterType_Object:  openapi3.TypeObject,
	common.ParameterType_Array:   openapi3.TypeArray,
	common.ParameterType_Bool:    openapi3.TypeBoolean,
}

var thriftParameterTypes = func() map[string]common.ParameterType {
	types := make(map[string]common.ParameterType, len(openapiTypes))
	for k, v := range openapiTypes {
		types[v] = k
	}

	return types
}()

func ToOpenapiParamType(typ common.ParameterType) string {
	return openapiTypes[typ]
}

func ToThriftParamType(typ string) common.ParameterType {
	return thriftParameterTypes[typ]
}

var apiAssistTypes = map[common.AssistParameterType]consts.APIFileAssistType{
	common.AssistParameterType_DEFAULT: consts.AssistTypeFile,
	common.AssistParameterType_IMAGE:   consts.AssistTypeImage,
	common.AssistParameterType_DOC:     consts.AssistTypeDoc,
	common.AssistParameterType_PPT:     consts.AssistTypePpt,
	common.AssistParameterType_CODE:    consts.AssistTypeCode,
	common.AssistParameterType_EXCEL:   consts.AssistTypeExcel,
	common.AssistParameterType_ZIP:     consts.AssistTypeZip,
	common.AssistParameterType_VIDEO:   consts.AssistTypeVideo,
	common.AssistParameterType_AUDIO:   consts.AssistTypeAudio,
	common.AssistParameterType_TXT:     consts.AssistTypeTxt,
	//common.AssistParameterType_VOICE:   consts.AssistTypeVoice,
}

var thriftAPIAssistTypes = func() map[consts.APIFileAssistType]common.AssistParameterType {
	types := make(map[consts.APIFileAssistType]common.AssistParameterType, len(apiAssistTypes))
	for k, v := range apiAssistTypes {
		types[v] = k
	}

	return types
}()

func ToAPIAssistType(typ common.AssistParameterType) consts.APIFileAssistType {
	return apiAssistTypes[typ]
}

func ToThriftAPIAssistType(typ consts.APIFileAssistType) common.AssistParameterType {
	return thriftAPIAssistTypes[typ]
}

var httpMethods = map[common.APIMethod]string{
	common.APIMethod_GET:    strings.ToLower(http.MethodGet),
	common.APIMethod_POST:   strings.ToLower(http.MethodPost),
	common.APIMethod_PUT:    strings.ToLower(http.MethodPut),
	common.APIMethod_DELETE: strings.ToLower(http.MethodDelete),
	common.APIMethod_PATCH:  strings.ToLower(http.MethodPatch),
}

var thriftAPIMethods = func() map[string]common.APIMethod {
	methods := make(map[string]common.APIMethod, len(httpMethods))
	for k, v := range httpMethods {
		methods[v] = k
	}

	return methods
}()

func ToHttpMethod(method common.APIMethod) string {
	return httpMethods[method]
}

func ToThriftAPIMethod(method string) common.APIMethod {
	return thriftAPIMethods[method]
}
