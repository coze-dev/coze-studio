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
	"context"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"

	"github.com/cloudwego/eino/schema"
)

type Openapi3T openapi3.T

func (ot Openapi3T) Validate(ctx context.Context) (err error) {
	err = ptr.Of(openapi3.T(ot)).Validate(ctx)
	if err != nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	if ot.Info == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"info is required"))
	}
	if ot.Info.Title == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"the title of info is required"))
	}
	if ot.Info.Description == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"the description of info is required"))
	}

	if len(ot.Servers) != 1 {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"server is required and only one server is allowed"))
	}

	serverURL := ot.Servers[0].URL
	urlSchema, err := url.Parse(serverURL)
	if err != nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
			"invalid server url '%s'", serverURL))
	}
	if urlSchema.Host == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
			"invalid server url '%s'", serverURL))
	}
	if len(serverURL) > 512 {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
			"server url '%s' is too long", serverURL))
	}

	for _, pathItem := range ot.Paths {
		for _, op := range pathItem.Operations() {
			err = NewOpenapi3Operation(op).Validate(ctx)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func NewOpenapi3Operation(op *openapi3.Operation) *Openapi3Operation {
	return &Openapi3Operation{
		Operation: op,
	}
}

type Openapi3Operation struct {
	*openapi3.Operation
}

func (op *Openapi3Operation) MarshalJSON() ([]byte, error) {
	return op.Operation.MarshalJSON()
}

func (op *Openapi3Operation) UnmarshalJSON(data []byte) error {
	op.Operation = &openapi3.Operation{}
	return op.Operation.UnmarshalJSON(data)
}

func (op *Openapi3Operation) Validate(ctx context.Context) (err error) {
	err = op.Operation.Validate(ctx)
	if err != nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey, "operation is invalid, err=%s", err))
	}

	if op.OperationID == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, "operationID is required"))
	}
	if op.Summary == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, "summary is required"))
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

func (op *Openapi3Operation) ToEinoSchemaParameterInfo(ctx context.Context) (map[string]*schema.ParameterInfo, error) {
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
			return nil, errorx.New(errno.ErrSearchInvalidParamCode, errorx.KVf(errno.PluginMsgKey,
				"unsupported json type '%s'", sc.Type))
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
			logs.CtxWarnf(ctx, "duplicate parameter name '%s'", paramVal.Name)
			continue
		}

		result[paramVal.Name] = paramInfo
	}

	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return result, nil
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
				logs.CtxWarnf(ctx, "duplicate parameter name '%s'", paramName)
				continue
			}

			result[paramName] = paramInfo
		}

		break // Take only one MIME.
	}

	return result, nil
}

func validateOpenapi3RequestBody(bodyRef *openapi3.RequestBodyRef) (err error) {
	if bodyRef == nil {
		return nil
	}
	if bodyRef.Value == nil || len(bodyRef.Value.Content) == 0 {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"request body is required"))
	}

	body := bodyRef.Value
	if len(body.Content) != 1 {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"request body only supports one media type"))
	}

	var mType *openapi3.MediaType
	for _, ct := range mediaTypeArray {
		var ok bool
		mType, ok = body.Content[ct]
		if ok {
			break
		}
	}
	if mType == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
			"invalid media type, request body only the following types: [%s]", strings.Join(mediaTypeArray, ", ")))
	}

	if mType.Schema == nil || mType.Schema.Value == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"request body schema is required"))
	}

	sc := mType.Schema.Value
	if sc.Type == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"request body only supports 'object' type"))
	}
	if sc.Type != openapi3.TypeObject {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"request body only supports 'object' type"))
	}

	return nil
}

func validateOpenapi3Parameters(params openapi3.Parameters) (err error) {
	if len(params) == 0 {
		return nil
	}

	for _, param := range params {
		if param == nil || param.Value == nil || param.Value.Schema == nil || param.Value.Schema.Value == nil {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
				"parameter schema is required"))
		}

		paramVal := param.Value

		if paramVal.In == "" {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
				"parameter location is required"))
		}
		if paramVal.In == string(ParamInBody) {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
				"the location of parameter '%s' cannot be 'body'", paramVal.Name))
		}

		paramSchema := paramVal.Schema.Value
		if paramSchema.Type == "" {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
				"the type of  parameter '%s' is required", paramVal.Name))
		}
		if paramSchema.Type == openapi3.TypeObject {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
				"the type of parameter '%s' cannot be 'object'", paramVal.Name))
		}
		if paramVal.In == openapi3.ParameterInPath && paramSchema.Type == openapi3.TypeArray {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KVf(errno.PluginMsgKey,
				"the type of parameter '%s' cannot be 'array'", paramVal.Name))
		}
	}

	return nil
}

// MIME Type
const (
	MediaTypeJson           = "application/json"
	MediaTypeProblemJson    = "application/problem+json"
	MediaTypeFormURLEncoded = "application/x-www-form-urlencoded"
	MediaTypeXYaml          = "application/x-yaml"
	MediaTypeYaml           = "application/yaml"
)

var mediaTypeArray = []string{
	MediaTypeJson,
	MediaTypeProblemJson,
	MediaTypeFormURLEncoded,
	MediaTypeXYaml,
	MediaTypeYaml,
}

func validateOpenapi3Responses(responses openapi3.Responses) (err error) {
	if len(responses) == 0 {
		return nil
	}

	// Default status not processed
	// Only process' 200 'status
	if len(responses) != 1 {
		if len(responses) != 2 {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
				"response only supports '200' status"))
		} else if _, ok := responses["default"]; !ok {
			return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
				"response only supports '200' status"))
		}
	}

	resp, ok := responses[strconv.Itoa(http.StatusOK)]
	if !ok || resp == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"response only supports '200' status"))
	}
	if resp.Value == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"response schema is required"))
	}
	if len(resp.Value.Content) != 1 {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"response only supports 'application/json' media type"))
	}
	mType, ok := resp.Value.Content[MediaTypeJson]
	if !ok || mType == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"response only supports 'application/json' media type"))

	}
	if mType.Schema == nil || mType.Schema.Value == nil {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"the media type schema of response is required"))
	}

	sc := mType.Schema.Value
	if sc.Type == "" {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"response body only supports 'object' type"))
	}
	if sc.Type != openapi3.TypeObject {
		return errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey,
			"response body only supports 'object' type"))
	}

	return nil
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}

	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}

	if v, ok := schemaVal.Extensions[APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}

	return globalDisable || localDisable
}
