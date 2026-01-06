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

package convert

import (
	"github.com/getkin/kin-openapi/openapi3"

	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
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

func IsValidAPIAssistType(typ consts.APIFileAssistType) bool {
	_, ok := thriftAPIAssistTypes[typ]
	return ok
}
