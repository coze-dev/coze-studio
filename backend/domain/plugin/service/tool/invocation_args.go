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

package tool

import (
	"bytes"
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	api "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/variables"
	variables "github.com/coze-dev/coze-studio/backend/crossdomain/variables/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type groupedKeys struct {
	HeaderKeys map[string]*openapi3.Parameter
	PathKeys   map[string]*openapi3.Parameter
	QueryKeys  map[string]*openapi3.Parameter
	CookieKeys map[string]*openapi3.Parameter
	BodyKeys   map[string]*openapi3.Schema
	FileKeys   map[string]bool
}

type OAuthInfo struct {
	AccessToken string
	AuthURL     string
}
type AuthInfo struct {
	OAuth    *OAuthInfo
	MetaInfo *model.AuthV2
}

type InvocationArgs struct {
	groupedKeySchema groupedKeys
	Tool             *entity.ToolInfo
	AuthInfo         *AuthInfo
	PluginManifest   *model.PluginManifest
	ServerURL        string

	UserID      string
	ProjectInfo *model.ProjectInfo

	Header map[string]any
	Path   map[string]any
	Query  map[string]any
	Cookie map[string]any
	Body   map[string]any
}

type InvocationArgsBuilder struct {
	ArgsInJson     string
	ProjectInfo    *model.ProjectInfo
	UserID         string
	Plugin         *entity.PluginInfo
	Tool           *entity.ToolInfo
	AuthInfo       *AuthInfo
	PluginManifest *model.PluginManifest
	ServerURL      string
}

func NewInvocationArgs(ctx context.Context, builder *InvocationArgsBuilder) (*InvocationArgs, error) {
	// json to map[string]any
	requestArgs, err := json2Map(builder.ArgsInJson)
	if err != nil {
		return nil, err
	}

	if builder.AuthInfo == nil {
		return nil, fmt.Errorf("auth info is nil")
	}

	args := &InvocationArgs{
		UserID:         builder.UserID,
		ProjectInfo:    builder.ProjectInfo,
		Tool:           builder.Tool,
		AuthInfo:       builder.AuthInfo,
		PluginManifest: builder.PluginManifest,
		ServerURL:      builder.ServerURL,
	}

	// groupedKeySchema has all key
	// groupedKey = requestArgs.key + commonParams.key + defaultValues.key
	args.groupedKeySchema = groupedKeysByLocation(ctx, args.Tool.Operation)
	// group request args by location
	args.groupedRequestArgs(ctx, requestArgs)
	// add common params to each location
	args.setCommonParams(ctx, args.PluginManifest.CommonParams)
	// add default values if not exist
	err = args.setDefaultValues(ctx, builder.ProjectInfo, builder.UserID)
	if err != nil {
		return nil, err
	}

	return args, nil
}

func json2Map(argumentsInJson string) (map[string]any, error) {
	decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(argumentsInJson))
	decoder.UseNumber()

	// Suppose the output of the large model is of type object
	args := map[string]any{}
	err := decoder.Decode(&args)
	if err != nil {
		return nil, fmt.Errorf("unmarshal into map failed, input=%s, err=%v", argumentsInJson, err)
	}

	return args, nil
}

func groupedKeysByLocation(ctx context.Context, apiSchema *model.Openapi3Operation) groupedKeys {
	headerArgs := map[string]*openapi3.Parameter{}
	pathArgs := map[string]*openapi3.Parameter{}
	queryArgs := map[string]*openapi3.Parameter{}
	cookieArgs := map[string]*openapi3.Parameter{}
	bodyArgs := map[string]*openapi3.Schema{}
	fileKey := map[string]bool{}

	paramRefs := apiSchema.Parameters
	for _, paramRef := range paramRefs {
		valueSchema := paramRef.Value

		if isFileSchema(valueSchema.Schema.Value) {
			fileKey[valueSchema.Name] = true
		}

		switch valueSchema.In {
		case openapi3.ParameterInQuery:
			queryArgs[valueSchema.Name] = valueSchema
		case openapi3.ParameterInHeader:
			headerArgs[valueSchema.Name] = valueSchema
		case openapi3.ParameterInPath:
			pathArgs[valueSchema.Name] = valueSchema
		case openapi3.ParameterInCookie:
			cookieArgs[valueSchema.Name] = valueSchema
		default:
			logs.CtxWarnf(ctx, "[groupedKeysByLocation] unsupported parameter location '%s' in api schema, name=%s", valueSchema.In, valueSchema.Name)
			continue
		}
	}

	_, bodySchema := apiSchema.GetReqBodySchema()

	if bodySchema != nil && bodySchema.Value != nil {
		for paramName, paramSchema := range bodySchema.Value.Properties {
			if isFileSchema(paramSchema.Value) {
				fileKey[paramName] = true
			}

			bodyArgs[paramName] = paramSchema.Value
		}
	}

	return groupedKeys{
		HeaderKeys: headerArgs,
		PathKeys:   pathArgs,
		QueryKeys:  queryArgs,
		CookieKeys: cookieArgs,
		BodyKeys:   bodyArgs,
		FileKeys:   fileKey,
	}
}

func (i *InvocationArgs) groupedRequestArgs(ctx context.Context, args map[string]any) {
	groupedKeySchema := i.groupedKeySchema
	headerArgs := map[string]any{}
	pathArgs := map[string]any{}
	queryArgs := map[string]any{}
	cookieArgs := map[string]any{}
	bodyArgs := map[string]any{}

	for k, v := range args {
		if _, ok := groupedKeySchema.HeaderKeys[k]; ok {
			headerArgs[k] = v
		} else if _, ok := groupedKeySchema.PathKeys[k]; ok {
			pathArgs[k] = v
		} else if _, ok := groupedKeySchema.QueryKeys[k]; ok {
			queryArgs[k] = v
		} else if _, ok := groupedKeySchema.CookieKeys[k]; ok {
			cookieArgs[k] = v
		} else if _, ok := groupedKeySchema.BodyKeys[k]; ok {
			bodyArgs[k] = v
		} else {
			logs.CtxWarnf(ctx, "[groupedRequestArgs] unsupported parameter key '%s' in api schema", k)
		}
	}

	i.Header = headerArgs
	i.Path = pathArgs
	i.Query = queryArgs
	i.Cookie = cookieArgs
	i.Body = bodyArgs
}

func (i *InvocationArgs) setCommonParams(ctx context.Context, commonParams map[consts.HTTPParamLocation][]*api.CommonParamSchema) {
	for location, params := range commonParams {
		for _, param := range params {
			if param.Name == "" {
				continue
			}

			var dic map[string]any
			switch location {
			case consts.ParamInHeader:
				dic = i.Header
			case consts.ParamInPath:
				dic = i.Path
			case consts.ParamInQuery:
				dic = i.Query
			case consts.ParamInBody:
				dic = i.Body
			default:
				logs.CtxWarnf(ctx, "unsupported common parameter location '%s' in api schema, name=%s", location, param.Name)
			}

			_, ok := dic[param.Name]
			if !ok {
				dic[param.Name] = param.Value
			}
		}
	}
}

func (i *InvocationArgs) setDefaultValues(ctx context.Context, projectInfo *model.ProjectInfo, userID string) (err error) {
	groupedKeysSchema := i.groupedKeySchema

	i.Header, err = setParameterDefaultValues(ctx, i.Header, groupedKeysSchema.HeaderKeys, projectInfo, userID)
	if err != nil {
		return err
	}

	i.Path, err = setParameterDefaultValues(ctx, i.Path, groupedKeysSchema.PathKeys, projectInfo, userID)
	if err != nil {
		return err
	}

	i.Query, err = setParameterDefaultValues(ctx, i.Query, groupedKeysSchema.QueryKeys, projectInfo, userID)
	if err != nil {
		return err
	}

	i.Cookie, err = setParameterDefaultValues(ctx, i.Cookie, groupedKeysSchema.CookieKeys, projectInfo, userID)
	if err != nil {
		return err
	}

	_, bodySchema := i.Tool.Operation.GetReqBodySchema()
	i.Body, err = setBodyDefaultValues(ctx, i.Body, bodySchema.Value, projectInfo, userID)
	if err != nil {
		return err
	}

	return nil
}

func setParameterDefaultValues(ctx context.Context, dic map[string]any, paramSchema map[string]*openapi3.Parameter, projectInfo *model.ProjectInfo, userID string) (map[string]any, error) {
	for key, valueSchema := range paramSchema {
		if valueSchema.Schema == nil || valueSchema.Schema.Value == nil {
			logs.CtxWarnf(ctx, "[setParameterDefaultValues] parameter '%s' schema is nil", key)
			continue
		}

		if valueSchema.Schema.Value.Type == openapi3.TypeObject {
			return nil, fmt.Errorf("the type of '%s' parameter '%s' cannot be 'object'", valueSchema.In, key)
		}

		if _, ok := dic[key]; !ok {
			defaultVal, err := getDefaultValue(ctx, valueSchema.Schema.Value, projectInfo, userID)
			if err != nil {
				logs.CtxErrorf(ctx, "get default value failed, key=%s, err=%v", key, err)
				return nil, err
			}

			if valueSchema.Required && defaultVal == nil {
				return nil, fmt.Errorf("the '%s' parameter '%s' is required", valueSchema.In, key)
			}

			dic[key] = defaultVal
		}
	}

	return dic, nil
}

func setBodyDefaultValues(ctx context.Context, dic map[string]any, sc *openapi3.Schema, projectInfo *model.ProjectInfo, userID string) (map[string]any, error) {
	required := slices.ToMap(sc.Required, func(e string) (string, bool) {
		return e, true
	})

	newVals := make(map[string]any, len(sc.Properties))

	for paramName, prop := range sc.Properties {
		paramSchema := prop.Value
		if paramSchema.Type == openapi3.TypeObject {
			val := dic[paramName]
			if val == nil {
				val = map[string]any{}
			}

			mapVal, ok := val.(map[string]any)
			if !ok {
				return nil, fmt.Errorf("[injectRequestBodyDefaultValue] parameter '%s' is not object", paramName)
			}

			newMapVal, err := setBodyDefaultValues(ctx, mapVal, paramSchema, projectInfo, userID)
			if err != nil {
				return nil, err
			}

			if len(newMapVal) > 0 {
				newVals[paramName] = newMapVal
			}

			continue
		}

		if val := dic[paramName]; val != nil {
			newVals[paramName] = val
			continue
		}

		defaultVal, err := getDefaultValue(ctx, paramSchema, projectInfo, userID)
		if err != nil {
			return nil, err
		}

		if defaultVal == nil {
			if !required[paramName] {
				continue
			}

			return nil, fmt.Errorf("[setBodyDefaultValues] parameter '%s' is required", paramName)
		}

		newVals[paramName] = defaultVal
	}

	return newVals, nil
}

func getDefaultValue(ctx context.Context, schema *openapi3.Schema, info *model.ProjectInfo, userID string) (any, error) {
	vn, exist := schema.Extensions[consts.APISchemaExtendVariableRef]
	if !exist {
		return schema.Default, nil
	}

	keyword, ok := vn.(string)
	if !ok {
		logs.CtxErrorf(ctx, "invalid variable_ref type '%T'", vn)
		return nil, nil
	}

	if info == nil {
		return nil, fmt.Errorf("project info is nil")
	}

	meta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector(info.ProjectType),
		BizID:        strconv.FormatInt(info.ProjectID, 10),
		Version:      ptr.FromOrDefault(info.ProjectVersion, ""),
		ConnectorUID: userID,
		ConnectorID:  info.ConnectorID,
	}

	vals, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, meta, []string{keyword})
	if err != nil {
		return nil, err
	}

	if len(vals) == 0 {
		return nil, nil
	}

	return vals[0].Value, nil

}

func (i *InvocationArgs) AssembleFileURIToURL(ctx context.Context, oss storage.Storage) error {
	allFileKeys := i.groupedKeySchema.FileKeys
	for key := range allFileKeys {
		dic, ok := i.lookupArgGroup(key)
		if !ok {
			continue
		}

		uriObj, ok := dic[key]
		if !ok {
			continue
		}

		var uris []string
		if str, ok := uriObj.(string); ok {
			url, err := convertURItoURL(ctx, str, oss)
			if err != nil {
				return err
			}
			dic[key] = url

		} else if arr, ok := uriObj.([]any); ok {
			for _, item := range arr {
				if str, ok := item.(string); ok {
					url, err := convertURItoURL(ctx, str, oss)
					if err != nil {
						return err
					}
					uris = append(uris, url)
				}
			}
			if len(uris) > 0 {
				dic[key] = uris
			}
		}
	}

	return nil
}

func (i *InvocationArgs) lookupArgGroup(key string) (map[string]any, bool) {
	if _, ok := i.Header[key]; ok {
		return i.Header, ok
	}
	if _, ok := i.Path[key]; ok {
		return i.Path, ok
	}

	if _, ok := i.Query[key]; ok {
		return i.Query, ok
	}

	if _, ok := i.Cookie[key]; ok {
		return i.Cookie, ok
	}

	if _, ok := i.Body[key]; ok {
		return i.Body, ok
	}

	return nil, false
}

func convertURItoURL(ctx context.Context, uri string, oss storage.Storage) (newArg string, err error) {
	if uri == "" {
		return "", fmt.Errorf("uri is empty")
	}

	if strings.HasPrefix(uri, "http://") || strings.HasPrefix(uri, "https://") {
		return uri, nil
	}

	newArg, err = oss.GetObjectUrl(ctx, uri)
	if err != nil {
		return "", errorx.Wrapf(err, "GetObjectUrl failed, uri=%s", uri)
	}

	return newArg, nil
}

func isFileSchema(valueSchema *openapi3.Schema) bool {
	if valueSchema.Type != openapi3.TypeString {
		// file value must be string
		return false
	}

	// file schema x-assist-type must not nil
	assistTypeObj := valueSchema.Extensions[consts.APISchemaExtendAssistType]
	if assistTypeObj == nil {
		// it is not a file value
		return false
	}

	assistType, ok := assistTypeObj.(string)
	if !ok {
		return false
	}

	if !convert.IsValidAPIAssistType(consts.APIFileAssistType(assistType)) {
		return false
	}

	return true
}
