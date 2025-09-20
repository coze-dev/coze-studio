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
	"net/http"

	"github.com/getkin/kin-openapi/openapi3"

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
)

var httpParamLocations = map[common.ParameterLocation]HTTPParamLocation{
	common.ParameterLocation_Path:   ParamInPath,
	common.ParameterLocation_Query:  ParamInQuery,
	common.ParameterLocation_Body:   ParamInBody,
	common.ParameterLocation_Header: ParamInHeader,
}

func ToHTTPParamLocation(loc common.ParameterLocation) (HTTPParamLocation, bool) {
	_loc, ok := httpParamLocations[loc]
	return _loc, ok
}

var thriftHTTPParamLocations = func() map[HTTPParamLocation]common.ParameterLocation {
	locations := make(map[HTTPParamLocation]common.ParameterLocation, len(httpParamLocations))
	for k, v := range httpParamLocations {
		locations[v] = k
	}
	return locations
}()

func ToThriftHTTPParamLocation(loc HTTPParamLocation) (common.ParameterLocation, bool) {
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

var apiAssistTypes = map[common.AssistParameterType]APIFileAssistType{
	common.AssistParameterType_DEFAULT: AssistTypeFile,
	common.AssistParameterType_IMAGE:   AssistTypeImage,
	common.AssistParameterType_DOC:     AssistTypeDoc,
	common.AssistParameterType_PPT:     AssistTypePPT,
	common.AssistParameterType_CODE:    AssistTypeCode,
	common.AssistParameterType_EXCEL:   AssistTypeExcel,
	common.AssistParameterType_ZIP:     AssistTypeZIP,
	common.AssistParameterType_VIDEO:   AssistTypeVideo,
	common.AssistParameterType_AUDIO:   AssistTypeAudio,
	common.AssistParameterType_TXT:     AssistTypeTXT,
}

// TODO(fanlv): move to other package

func ToAPIAssistType(typ common.AssistParameterType) (APIFileAssistType, bool) {
	_typ, ok := apiAssistTypes[typ]
	return _typ, ok
}

var thriftAPIAssistTypes = func() map[APIFileAssistType]common.AssistParameterType {
	types := make(map[APIFileAssistType]common.AssistParameterType, len(apiAssistTypes))
	for k, v := range apiAssistTypes {
		types[v] = k
	}
	return types
}()

func ToThriftAPIAssistType(typ APIFileAssistType) (common.AssistParameterType, bool) {
	_typ, ok := thriftAPIAssistTypes[typ]
	return _typ, ok
}

func IsValidAPIAssistType(typ APIFileAssistType) bool {
	_, ok := thriftAPIAssistTypes[typ]
	return ok
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

var assistTypeToFormat = map[APIFileAssistType]string{
	AssistTypeFile:  "file_url",
	AssistTypeImage: "image_url",
	AssistTypeDoc:   "doc_url",
	AssistTypePPT:   "ppt_url",
	AssistTypeCode:  "code_url",
	AssistTypeExcel: "excel_url",
	AssistTypeZIP:   "zip_url",
	AssistTypeVideo: "video_url",
	AssistTypeAudio: "audio_url",
	AssistTypeTXT:   "txt_url",
}

func AssistTypeToFormat(typ APIFileAssistType) (string, bool) {
	format, ok := assistTypeToFormat[typ]
	return format, ok
}

var formatToAssistType = func() map[string]APIFileAssistType {
	types := make(map[string]APIFileAssistType, len(assistTypeToFormat))
	for k, v := range assistTypeToFormat {
		types[v] = k
	}
	return types
}()

func FormatToAssistType(format string) (APIFileAssistType, bool) {
	typ, ok := formatToAssistType[format]
	return typ, ok
}

var assistTypeToThriftFormat = map[APIFileAssistType]common.PluginParamTypeFormat{
	AssistTypeFile:  common.PluginParamTypeFormat_FileUrl,
	AssistTypeImage: common.PluginParamTypeFormat_ImageUrl,
	AssistTypeDoc:   common.PluginParamTypeFormat_DocUrl,
	AssistTypePPT:   common.PluginParamTypeFormat_PptUrl,
	AssistTypeCode:  common.PluginParamTypeFormat_CodeUrl,
	AssistTypeExcel: common.PluginParamTypeFormat_ExcelUrl,
	AssistTypeZIP:   common.PluginParamTypeFormat_ZipUrl,
	AssistTypeVideo: common.PluginParamTypeFormat_VideoUrl,
	AssistTypeAudio: common.PluginParamTypeFormat_AudioUrl,
	AssistTypeTXT:   common.PluginParamTypeFormat_TxtUrl,
}

func AssistTypeToThriftFormat(typ APIFileAssistType) (common.PluginParamTypeFormat, bool) {
	format, ok := assistTypeToThriftFormat[typ]
	return format, ok
}

var authTypes = map[common.AuthorizationType]AuthzType{
	common.AuthorizationType_None:     AuthzTypeOfNone,
	common.AuthorizationType_Service:  AuthzTypeOfService,
	common.AuthorizationType_OAuth:    AuthzTypeOfOAuth,
	common.AuthorizationType_Standard: AuthzTypeOfOAuth, // deprecated, the same as OAuth
}

func ToAuthType(typ common.AuthorizationType) (AuthzType, bool) {
	_type, ok := authTypes[typ]
	return _type, ok
}

var thriftAuthTypes = func() map[AuthzType]common.AuthorizationType {
	types := make(map[AuthzType]common.AuthorizationType, len(authTypes))
	for k, v := range authTypes {
		if v == AuthzTypeOfOAuth {
			types[v] = common.AuthorizationType_OAuth
		} else {
			types[v] = k
		}
	}
	return types
}()

func ToThriftAuthType(typ AuthzType) (common.AuthorizationType, bool) {
	_type, ok := thriftAuthTypes[typ]
	return _type, ok
}

var subAuthTypes = map[int32]AuthzSubType{
	int32(common.ServiceAuthSubType_ApiKey):                 AuthzSubTypeOfServiceAPIToken,
	int32(common.ServiceAuthSubType_OAuthAuthorizationCode): AuthzSubTypeOfOAuthAuthorizationCode,
}

func ToAuthSubType(typ int32) (AuthzSubType, bool) {
	_type, ok := subAuthTypes[typ]
	return _type, ok
}

var thriftSubAuthTypes = func() map[AuthzSubType]int32 {
	types := make(map[AuthzSubType]int32, len(subAuthTypes))
	for k, v := range subAuthTypes {
		types[v] = int32(k)
	}
	return types
}()

func ToThriftAuthSubType(typ AuthzSubType) (int32, bool) {
	_type, ok := thriftSubAuthTypes[typ]
	return _type, ok
}

var pluginTypes = map[common.PluginType]PluginType{
	common.PluginType_PLUGIN: PluginTypeOfCloud,
}

func ToPluginType(typ common.PluginType) (PluginType, bool) {
	_type, ok := pluginTypes[typ]
	return _type, ok
}

var thriftPluginTypes = func() map[PluginType]common.PluginType {
	types := make(map[PluginType]common.PluginType, len(pluginTypes))
	for k, v := range pluginTypes {
		types[v] = k
	}
	return types
}()

func ToThriftPluginType(typ PluginType) (common.PluginType, bool) {
	_type, ok := thriftPluginTypes[typ]
	return _type, ok
}

var apiAuthModes = map[common.PluginToolAuthType]ToolAuthMode{
	common.PluginToolAuthType_Required:  ToolAuthModeOfRequired,
	common.PluginToolAuthType_Supported: ToolAuthModeOfSupported,
	common.PluginToolAuthType_Disable:   ToolAuthModeOfDisabled,
}

func ToAPIAuthMode(mode common.PluginToolAuthType) (ToolAuthMode, bool) {
	_mode, ok := apiAuthModes[mode]
	return _mode, ok
}

var thriftAPIAuthModes = func() map[ToolAuthMode]common.PluginToolAuthType {
	modes := make(map[ToolAuthMode]common.PluginToolAuthType, len(apiAuthModes))
	for k, v := range apiAuthModes {
		modes[v] = k
	}
	return modes
}()

func ToThriftAPIAuthMode(mode ToolAuthMode) (common.PluginToolAuthType, bool) {
	_mode, ok := thriftAPIAuthModes[mode]
	return _mode, ok
}
