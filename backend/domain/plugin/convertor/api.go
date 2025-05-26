package convertor

import (
	"net/http"

	"github.com/getkin/kin-openapi/openapi3"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
)

var httpParamLocations = map[common.ParameterLocation]consts.HTTPParamLocation{
	common.ParameterLocation_Path:   consts.ParamInPath,
	common.ParameterLocation_Query:  consts.ParamInQuery,
	common.ParameterLocation_Body:   consts.ParamInBody,
	common.ParameterLocation_Header: consts.ParamInHeader,
}

func ToHTTPParamLocation(loc common.ParameterLocation) (consts.HTTPParamLocation, bool) {
	_loc, ok := httpParamLocations[loc]
	return _loc, ok
}

var thriftHTTPParamLocations = func() map[consts.HTTPParamLocation]common.ParameterLocation {
	locations := make(map[consts.HTTPParamLocation]common.ParameterLocation, len(httpParamLocations))
	for k, v := range httpParamLocations {
		locations[v] = k
	}
	return locations
}()

func ToThriftHTTPParamLocation(loc consts.HTTPParamLocation) (common.ParameterLocation, bool) {
	_loc, ok := thriftHTTPParamLocations[loc]
	return _loc, ok
}

var openapiTypes = map[common.ParameterType]string{
	common.ParameterType_String:  openapi3.TypeString,
	common.ParameterType_Integer: openapi3.TypeInteger,
	common.ParameterType_Number:  openapi3.TypeNumber,
	common.ParameterType_Object:  openapi3.TypeObject,
	common.ParameterType_Array:   openapi3.TypeArray,
	common.ParameterType_Bool:    openapi3.TypeBoolean,
}

func ToOpenapiParamType(typ common.ParameterType) (string, bool) {
	_typ, ok := openapiTypes[typ]
	return _typ, ok
}

var thriftParameterTypes = func() map[string]common.ParameterType {
	types := make(map[string]common.ParameterType, len(openapiTypes))
	for k, v := range openapiTypes {
		types[v] = k
	}
	return types
}()

func ToThriftParamType(typ string) (common.ParameterType, bool) {
	_typ, ok := thriftParameterTypes[typ]
	return _typ, ok
}

var apiAssistTypes = map[common.AssistParameterType]consts.APIFileAssistType{
	common.AssistParameterType_DEFAULT: consts.AssistTypeFile,
	common.AssistParameterType_IMAGE:   consts.AssistTypeImage,
	common.AssistParameterType_DOC:     consts.AssistTypeDoc,
	common.AssistParameterType_PPT:     consts.AssistTypePPT,
	common.AssistParameterType_CODE:    consts.AssistTypeCode,
	common.AssistParameterType_EXCEL:   consts.AssistTypeExcel,
	common.AssistParameterType_ZIP:     consts.AssistTypeZIP,
	common.AssistParameterType_VIDEO:   consts.AssistTypeVideo,
	common.AssistParameterType_AUDIO:   consts.AssistTypeAudio,
	common.AssistParameterType_TXT:     consts.AssistTypeTXT,
}

func ToAPIAssistType(typ common.AssistParameterType) (consts.APIFileAssistType, bool) {
	_typ, ok := apiAssistTypes[typ]
	return _typ, ok
}

var thriftAPIAssistTypes = func() map[consts.APIFileAssistType]common.AssistParameterType {
	types := make(map[consts.APIFileAssistType]common.AssistParameterType, len(apiAssistTypes))
	for k, v := range apiAssistTypes {
		types[v] = k
	}
	return types
}()

func ToThriftAPIAssistType(typ consts.APIFileAssistType) (common.AssistParameterType, bool) {
	_typ, ok := thriftAPIAssistTypes[typ]
	return _typ, ok
}

var httpMethods = map[common.APIMethod]string{
	common.APIMethod_GET:    http.MethodGet,
	common.APIMethod_POST:   http.MethodPost,
	common.APIMethod_PUT:    http.MethodPut,
	common.APIMethod_DELETE: http.MethodDelete,
	common.APIMethod_PATCH:  http.MethodPatch,
}

var thriftAPIMethods = func() map[string]common.APIMethod {
	methods := make(map[string]common.APIMethod, len(httpMethods))
	for k, v := range httpMethods {
		methods[v] = k
	}
	return methods
}()

func ToThriftAPIMethod(method string) (common.APIMethod, bool) {
	_method, ok := thriftAPIMethods[method]
	return _method, ok
}

func ToHTTPMethod(method common.APIMethod) (string, bool) {
	_method, ok := httpMethods[method]
	return _method, ok
}

var assistTypeToFormat = map[consts.APIFileAssistType]string{
	consts.AssistTypeFile:  "file_url",
	consts.AssistTypeImage: "image_url",
	consts.AssistTypeDoc:   "doc_url",
	consts.AssistTypePPT:   "ppt_url",
	consts.AssistTypeCode:  "code_url",
	consts.AssistTypeExcel: "excel_url",
	consts.AssistTypeZIP:   "zip_url",
	consts.AssistTypeVideo: "video_url",
	consts.AssistTypeAudio: "audio_url",
	consts.AssistTypeTXT:   "txt_url",
}

func AssistTypeToFormat(typ consts.APIFileAssistType) (string, bool) {
	format, ok := assistTypeToFormat[typ]
	return format, ok
}

var formatToAssistType = func() map[string]consts.APIFileAssistType {
	types := make(map[string]consts.APIFileAssistType, len(assistTypeToFormat))
	for k, v := range assistTypeToFormat {
		types[v] = k
	}
	return types
}()

func FormatToAssistType(format string) (consts.APIFileAssistType, bool) {
	typ, ok := formatToAssistType[format]
	return typ, ok
}

var assistTypeToThriftFormat = map[consts.APIFileAssistType]common.PluginParamTypeFormat{
	consts.AssistTypeFile:  common.PluginParamTypeFormat_FileUrl,
	consts.AssistTypeImage: common.PluginParamTypeFormat_ImageUrl,
	consts.AssistTypeDoc:   common.PluginParamTypeFormat_DocUrl,
	consts.AssistTypePPT:   common.PluginParamTypeFormat_PptUrl,
	consts.AssistTypeCode:  common.PluginParamTypeFormat_CodeUrl,
	consts.AssistTypeExcel: common.PluginParamTypeFormat_ExcelUrl,
	consts.AssistTypeZIP:   common.PluginParamTypeFormat_ZipUrl,
	consts.AssistTypeVideo: common.PluginParamTypeFormat_VideoUrl,
	consts.AssistTypeAudio: common.PluginParamTypeFormat_AudioUrl,
	consts.AssistTypeTXT:   common.PluginParamTypeFormat_TxtUrl,
}

func AssistTypeToThriftFormat(typ consts.APIFileAssistType) (common.PluginParamTypeFormat, bool) {
	format, ok := assistTypeToThriftFormat[typ]
	return format, ok
}

var authTypes = map[common.AuthorizationType]consts.AuthType{
	common.AuthorizationType_None:    consts.AuthTypeOfNone,
	common.AuthorizationType_Service: consts.AuthTypeOfService,
	common.AuthorizationType_OAuth:   consts.AuthTypeOfOAuth,
}

func ToAuthType(typ common.AuthorizationType) (consts.AuthType, bool) {
	_type, ok := authTypes[typ]
	return _type, ok
}

var subAuthTypes = map[int32]consts.AuthSubType{
	int32(common.ServiceAuthSubType_ApiKey): consts.AuthSubTypeOfToken,
	int32(common.ServiceAuthSubType_OIDC):   consts.AuthSubTypeOfOIDC,
}

func ToAuthSubType(typ int32) (consts.AuthSubType, bool) {
	_type, ok := subAuthTypes[typ]
	return _type, ok
}

var pluginTypes = map[common.PluginType]consts.PluginType{
	common.PluginType_PLUGIN: consts.PluginTypeOfCloud,
}

func ToPluginType(typ common.PluginType) (consts.PluginType, bool) {
	_type, ok := pluginTypes[typ]
	return _type, ok
}

var thriftPluginTypes = func() map[consts.PluginType]common.PluginType {
	types := make(map[consts.PluginType]common.PluginType, len(pluginTypes))
	for k, v := range pluginTypes {
		types[v] = k
	}
	return types
}()

func ToThriftPluginType(typ consts.PluginType) (common.PluginType, bool) {
	_type, ok := thriftPluginTypes[typ]
	return _type, ok
}
