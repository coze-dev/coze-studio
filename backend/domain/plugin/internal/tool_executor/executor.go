package tool_executor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-resty/resty/v2"

	openauthModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/openauth"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/variables"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossopenauth"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossvariables"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type Executor interface {
	Execute(ctx context.Context, argumentsInJson string) (resp *ExecuteResponse, err error)
}

type ExecutorConfig struct {
	UserID string
	Plugin *entity.PluginInfo
	Tool   *entity.ToolInfo

	ProjectInfo *entity.ProjectInfo

	InvalidRespProcessStrategy plugin.InvalidResponseProcessStrategy
}

type ExecuteResponse struct {
	TrimmedResp string
	RawResp     string
}

type executorImpl struct {
	config *ExecutorConfig
}

var (
	httpClient     *resty.Client
	httpClientOnce sync.Once
)

func NewExecutor(config *ExecutorConfig) Executor {
	httpClientOnce.Do(func() {
		httpClient = resty.New()
	})

	return &executorImpl{
		config: config,
	}
}

func (t *executorImpl) Execute(ctx context.Context, argumentsInJson string) (resp *ExecuteResponse, err error) {
	const defaultResp = "{}"

	if argumentsInJson == "" {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KV(errno.PluginMsgKey, "argumentsInJson is required"))
	}

	httpReq, err := t.buildHTTPRequest(ctx, argumentsInJson)
	if err != nil {
		return nil, err
	}

	var reqBodyBytes []byte
	if httpReq.Body != nil {
		reqBodyBytes, err = io.ReadAll(httpReq.Body)
		if err != nil {
			return nil, err
		}
	}

	restyReq := httpClient.NewRequest()
	restyReq.Header = httpReq.Header
	restyReq.Method = httpReq.Method
	restyReq.URL = httpReq.URL.String()
	if len(reqBodyBytes) > 0 {
		restyReq.SetBody(reqBodyBytes)
	}
	restyReq.SetContext(ctx)

	logs.CtxDebugf(ctx, "[Execute] url=%s, header=%s, method=%s, body=%s",
		restyReq.URL, restyReq.Header, restyReq.Method, restyReq.Body)

	httpResp, err := restyReq.Send()
	if err != nil {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey, "http request failed, err=%s", err))
	}

	logs.CtxDebugf(ctx, "[Execute] status=%s, response=%s", httpResp.Status(), httpResp.String())

	if httpResp.StatusCode() != http.StatusOK {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed,
			errorx.KVf(errno.PluginMsgKey, "http request failed, status=%s", httpResp.Status()))
	}

	rawResp := string(httpResp.Body())
	if rawResp == "" {
		return &ExecuteResponse{
			TrimmedResp: defaultResp,
			RawResp:     defaultResp,
		}, nil
	}

	trimmedResp, err := t.processResponse(ctx, rawResp)
	if err != nil {
		return nil, err
	}
	if trimmedResp == "" {
		trimmedResp = defaultResp
	}

	return &ExecuteResponse{
		TrimmedResp: trimmedResp,
		RawResp:     rawResp,
	}, nil
}

func (t *executorImpl) buildHTTPRequest(ctx context.Context, argumentsInJson string) (httpReq *http.Request, err error) {
	argMaps, err := t.prepareArguments(ctx, argumentsInJson)
	if err != nil {
		return nil, err
	}

	tool := t.config.Tool
	rawURL := t.config.Plugin.GetServerURL() + tool.GetSubURL()

	locArgs, err := t.getLocationArguments(ctx, argMaps, tool.Operation.Parameters)
	if err != nil {
		return nil, err
	}

	reqURL, err := locArgs.buildHTTPRequestURL(ctx, rawURL)
	if err != nil {
		return nil, err
	}

	httpReq, err = http.NewRequestWithContext(ctx, tool.GetMethod(), reqURL.String(), nil)
	if err != nil {
		return nil, err
	}

	header, err := locArgs.buildHTTPRequestHeader(ctx)
	if err != nil {
		return nil, err
	}

	httpReq.Header = header

	bodyArgs := map[string]any{}
	for k, v := range argMaps {
		if _, ok := locArgs.header[k]; ok {
			continue
		}
		if _, ok := locArgs.path[k]; ok {
			continue
		}
		if _, ok := locArgs.query[k]; ok {
			continue
		}
		bodyArgs[k] = v
	}

	bodyBytes, contentType, err := t.buildHTTPRequestBody(ctx, tool.Operation, bodyArgs)
	if err != nil {
		return nil, err
	}
	if len(bodyBytes) > 0 {
		httpReq.Header.Set("Content-Type", contentType)
		httpReq.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	}

	err = t.injectAuthInfo(ctx, httpReq)
	if err != nil {
		return nil, err
	}

	return httpReq, nil
}

func (t *executorImpl) prepareArguments(_ context.Context, argumentsInJson string) (map[string]any, error) {
	args := map[string]any{}
	for loc, params := range t.config.Plugin.Manifest.CommonParams {
		for _, p := range params {
			if loc != plugin.ParamInBody {
				args[p.Name] = p.Value
			}
		}
	}

	decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(argumentsInJson))
	decoder.UseNumber()

	// 假设大模型的输出都是 object 类型
	input := map[string]any{}
	err := decoder.Decode(&input)
	if err != nil {
		return nil, fmt.Errorf("[prepareArguments] unmarshal into map failed, input=%s, err=%v",
			argumentsInJson, err)
	}

	for k, v := range input {
		args[k] = v
	}

	return args, nil
}

func (t *executorImpl) getLocationArguments(ctx context.Context, args map[string]any, paramRefs []*openapi3.ParameterRef) (*locationArguments, error) {
	headerArgs := map[string]valueWithSchema{}
	pathArgs := map[string]valueWithSchema{}
	queryArgs := map[string]valueWithSchema{}

	for _, paramRef := range paramRefs {
		paramVal := paramRef.Value
		if paramVal.In == openapi3.ParameterInCookie {
			continue
		}

		scVal := paramVal.Schema.Value
		typ := scVal.Type
		if typ == openapi3.TypeObject || typ == openapi3.TypeArray {
			return nil, fmt.Errorf("the '%s' parameter '%s' does not support object or array type", paramVal.In, paramVal.Name)
		}

		argValue, ok := args[paramVal.Name]
		if !ok {
			var err error
			argValue, err = t.getDefaultValue(ctx, scVal)
			if err != nil {
				return nil, err
			}
			if argValue == nil {
				if !paramVal.Required {
					continue
				}
				return nil, fmt.Errorf("the '%s' parameter '%s' is required", paramVal.In, paramVal.Name)
			}
		}

		v := valueWithSchema{
			argValue:    argValue,
			paramSchema: paramVal,
		}

		switch paramVal.In {
		case openapi3.ParameterInQuery:
			queryArgs[paramVal.Name] = v
		case openapi3.ParameterInHeader:
			headerArgs[paramVal.Name] = v
		case openapi3.ParameterInPath:
			pathArgs[paramVal.Name] = v
		}
	}

	locArgs := &locationArguments{
		header: headerArgs,
		path:   pathArgs,
		query:  queryArgs,
	}

	return locArgs, nil
}

func (t *executorImpl) getDefaultValue(ctx context.Context, scVal *openapi3.Schema) (any, error) {
	vn, exist := scVal.Extensions[plugin.APISchemaExtendVariableRef]
	if !exist {
		return scVal.Default, nil
	}

	vnStr, ok := vn.(string)
	if !ok {
		logs.CtxErrorf(ctx, "invalid variable_ref type '%T'", vn)
		return nil, nil
	}

	variableVal, err := t.getVariableValue(ctx, vnStr)
	if err != nil {
		return nil, err
	}

	return variableVal, nil
}

func (t *executorImpl) getVariableValue(ctx context.Context, keyword string) (any, error) {
	info := t.config.ProjectInfo
	if info == nil {
		return nil, fmt.Errorf("project info is nil")
	}

	meta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        strconv.FormatInt(info.ProjectID, 10),
		Version:      ptr.FromOrDefault(info.ProjectVersion, ""),
		ConnectorUID: t.config.UserID,
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

func (t *executorImpl) injectAuthInfo(_ context.Context, httpReq *http.Request) error {
	authInfo := t.config.Plugin.GetAuthInfo()
	if authInfo.Type == plugin.AuthzTypeOfNone {
		return nil
	}

	if authInfo.Type == plugin.AuthzTypeOfService {
		return t.injectServiceAPIToken(httpReq.Context(), httpReq, authInfo)
	}

	if authInfo.Type == plugin.AuthzTypeOfOAuth {
		return t.injectOAuthAccessToken(httpReq.Context(), httpReq, authInfo)
	}

	return nil
}

func (t *executorImpl) injectServiceAPIToken(ctx context.Context, httpReq *http.Request, authInfo *plugin.AuthV2) (err error) {
	if authInfo.SubType == plugin.AuthzSubTypeOfServiceAPIToken {
		authOfAPIToken := authInfo.AuthOfAPIToken
		if authOfAPIToken == nil {
			return fmt.Errorf("auth of api token is nil")
		}

		loc := strings.ToLower(string(authOfAPIToken.Location))

		if loc == openapi3.ParameterInQuery {
			query := httpReq.URL.Query()
			if query.Get(authOfAPIToken.Key) == "" {
				query.Set(authOfAPIToken.Key, authOfAPIToken.ServiceToken)
				httpReq.URL.RawQuery = query.Encode()
			}
		}

		if loc == openapi3.ParameterInHeader {
			if httpReq.Header.Get(authOfAPIToken.Key) == "" {
				httpReq.Header.Set(authOfAPIToken.Key, authOfAPIToken.ServiceToken)
			}
		}
	}

	return nil
}

func (t *executorImpl) injectOAuthAccessToken(ctx context.Context, httpReq *http.Request, authInfo *plugin.AuthV2) (err error) {
	var accessToken string

	if authInfo.SubType == plugin.AuthzSubTypeOfOAuthClientCredentials {
		oauth := authInfo.AuthOfOAuthClientCredentials
		if oauth == nil {
			return fmt.Errorf("auth of oauth client credentials is nil")
		}

		accessToken, err = crossopenauth.DefaultOAuthSVC().GetAccessToken(ctx, &openauthModel.GetAccessTokenRequest{
			UserID: t.config.UserID,
			OAuthInfo: &openauthModel.OAuthInfo{
				OAuthProvider: entity.GetOAuthProvider(oauth.TokenURL),
				OAuthMode:     openauthModel.OAuthModeClientCredentials,
				ClientCredentials: &openauthModel.ClientCredentials{
					ClientID:     oauth.ClientID,
					ClientSecret: oauth.ClientSecret,
					TokenURL:     oauth.TokenURL,
					Scopes:       oauth.Scopes,
				},
			},
		})
		if err != nil {
			return err
		}
	}

	if accessToken == "" {
		return fmt.Errorf("access token is empty")
	}

	provider := entity.GetOAuthProvider(authInfo.AuthOfOAuthClientCredentials.TokenURL)
	switch provider {
	case openauthModel.OAuthProviderOfLark:
		httpReq.Header.Set("tenant-access-token", accessToken)
	default:
		httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}

	return nil
}

func (t *executorImpl) processResponse(ctx context.Context, rawResp string) (trimmedResp string, err error) {
	responses := t.config.Tool.Operation.Responses
	if len(responses) == 0 {
		return "", nil
	}

	resp, ok := responses[strconv.Itoa(http.StatusOK)]
	if !ok {
		return "", fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
	}
	mType, ok := resp.Value.Content[plugin.MediaTypeJson] // only support application/json
	if !ok {
		return "", fmt.Errorf("the '%s' media type is not defined in response", plugin.MediaTypeJson)
	}

	decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(rawResp))
	decoder.UseNumber()
	respMap := map[string]any{}
	err = decoder.Decode(&respMap)
	if err != nil {
		return "", errorx.New(errno.ErrPluginExecuteToolFailed,
			errorx.KVf(errno.PluginMsgKey, "response is not object, raw response=%s", rawResp))
	}

	schemaVal := mType.Schema.Value
	if len(schemaVal.Properties) == 0 {
		return "", nil
	}

	// FIXME: trimming is a weak dependency function and does not affect the response

	var trimmedRespMap map[string]any
	switch t.config.InvalidRespProcessStrategy {
	case plugin.InvalidResponseProcessStrategyOfReturnRaw:
		trimmedRespMap, err = processWithInvalidRespProcessStrategyOfReturnRaw(ctx, respMap, schemaVal)
		if err != nil {
			logs.CtxErrorf(ctx, "processWithInvalidRespProcessStrategyOfReturnRaw failed, err=%v", err)
			return rawResp, nil
		}

	case plugin.InvalidResponseProcessStrategyOfReturnDefault:
		trimmedRespMap, err = processWithInvalidRespProcessStrategyOfReturnDefault(ctx, respMap, schemaVal)
		if err != nil {
			logs.CtxErrorf(ctx, "processWithInvalidRespProcessStrategyOfReturnDefault failed, err=%v", err)
			return rawResp, nil
		}

	default:
		logs.CtxErrorf(ctx, "invalid response process strategy '%d'", t.config.InvalidRespProcessStrategy)
		return rawResp, nil
	}

	trimmedResp, err = sonic.MarshalString(trimmedRespMap)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal trimmed response failed, err=%v", err)
		return rawResp, nil
	}

	return trimmedResp, nil
}

func processWithInvalidRespProcessStrategyOfReturnRaw(ctx context.Context, paramVals map[string]any, paramSchema *openapi3.Schema) (map[string]any, error) {
	for paramName, _paramVal := range paramVals {
		_paramSchema, ok := paramSchema.Properties[paramName]
		if !ok || disabledParam(_paramSchema.Value) {
			delete(paramVals, paramName)
			continue
		}

		if _paramSchema.Value.Type != openapi3.TypeObject {
			continue
		}

		paramValMap, ok := _paramVal.(map[string]any)
		if !ok {
			continue
		}

		_, err := processWithInvalidRespProcessStrategyOfReturnRaw(ctx, paramValMap, _paramSchema.Value)
		if err != nil {
			return nil, err
		}
	}

	return paramVals, nil
}

func processWithInvalidRespProcessStrategyOfReturnDefault(_ context.Context, paramVals map[string]any, paramSchema *openapi3.Schema) (map[string]any, error) {
	var processor func(paramVal any, schemaVal *openapi3.Schema) (any, error)
	processor = func(paramVal any, schemaVal *openapi3.Schema) (any, error) {
		switch schemaVal.Type {
		case openapi3.TypeObject:
			newParamValMap := map[string]any{}
			paramValMap, ok := paramVal.(map[string]any)
			if !ok {
				return nil, nil
			}

			for paramName, _paramVal := range paramValMap {
				_paramSchema, ok := schemaVal.Properties[paramName]
				if !ok || disabledParam(_paramSchema.Value) { // 只有 object field 才能被禁用，request 和 response 顶层必定都是 object 结构
					continue
				}
				newParamVal, err := processor(_paramVal, _paramSchema.Value)
				if err != nil {
					return nil, err
				}
				newParamValMap[paramName] = newParamVal
			}

			return newParamValMap, nil

		case openapi3.TypeArray:
			newParamValSlice := []any{}
			paramValSlice, ok := paramVal.([]any)
			if !ok {
				return nil, nil
			}

			for _, _paramVal := range paramValSlice {
				newParamVal, err := processor(_paramVal, schemaVal.Items.Value)
				if err != nil {
					return nil, err
				}
				if newParamVal != nil {
					newParamValSlice = append(newParamValSlice, newParamVal)
				}
			}

			return newParamValSlice, nil

		case openapi3.TypeString:
			paramValStr, ok := paramVal.(string)
			if !ok {
				return "", nil
			}

			return paramValStr, nil

		case openapi3.TypeBoolean:
			paramValBool, ok := paramVal.(bool)
			if !ok {
				return false, nil
			}

			return paramValBool, nil

		case openapi3.TypeInteger:
			paramValInt, ok := paramVal.(float64)
			if !ok {
				return float64(0), nil
			}

			return paramValInt, nil

		case openapi3.TypeNumber:
			paramValNum, ok := paramVal.(json.Number)
			if !ok {
				return json.Number("0"), nil
			}

			return paramValNum, nil

		default:
			return nil, fmt.Errorf("unsupported type '%s'", schemaVal.Type)
		}
	}

	newParamVals := make(map[string]any, len(paramVals))
	for paramName, _paramVal := range paramVals {
		_paramSchema, ok := paramSchema.Properties[paramName]
		if !ok || disabledParam(_paramSchema.Value) {
			continue
		}

		newParamVal, err := processor(_paramVal, _paramSchema.Value)
		if err != nil {
			return nil, err
		}

		newParamVals[paramName] = newParamVal
	}

	return newParamVals, nil
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[plugin.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[plugin.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}

type locationArguments struct {
	header map[string]valueWithSchema
	path   map[string]valueWithSchema
	query  map[string]valueWithSchema
}

type valueWithSchema struct {
	argValue    any
	paramSchema *openapi3.Parameter
}

func (l *locationArguments) buildHTTPRequestURL(_ context.Context, rawURL string) (reqURL *url.URL, err error) {
	if len(l.path) > 0 {
		for k, v := range l.path {
			vStr, err := encodeParameter(v.paramSchema, v.argValue)
			if err != nil {
				return nil, err
			}
			rawURL = strings.ReplaceAll(rawURL, "{"+k+"}", vStr)
		}
	}

	encodeQueryStr := ""
	if len(l.query) > 0 {
		queryStr := ""
		for _, v := range l.query {
			vStr, err := encodeParameter(v.paramSchema, v.argValue)
			if err != nil {
				return nil, err
			}

			if len(queryStr) > 0 {
				queryStr += "&" + vStr
			} else {
				queryStr += vStr
			}
		}

		queryValues, err := url.ParseQuery(queryStr)
		if err != nil {
			return nil, err
		}

		encodeQueryStr = queryValues.Encode()
	}

	reqURL, err = url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	if len(reqURL.RawQuery) > 0 && len(encodeQueryStr) > 0 {
		reqURL.RawQuery += "&" + encodeQueryStr
	} else if len(encodeQueryStr) > 0 {
		reqURL.RawQuery = encodeQueryStr
	}

	return reqURL, nil
}

func (l *locationArguments) buildHTTPRequestHeader(_ context.Context) (http.Header, error) {
	header := http.Header{}
	if len(l.header) > 0 {
		for k, v := range l.header {
			vStr, err := encodeParameter(v.paramSchema, v.argValue)
			if err != nil {
				return nil, err
			}

			header.Set(k, vStr)
		}
	}

	return header, nil
}

func (t *executorImpl) buildHTTPRequestBody(ctx context.Context, op *plugin.Openapi3Operation, bodyArgs map[string]any) (body []byte, contentType string, err error) {
	contentType, bodySchema := getReqBodySchema(op)
	if bodySchema == nil || bodySchema.Value == nil {
		return nil, "", nil
	}

	// body 限制为 object 类型
	if bodySchema.Value.Type != openapi3.TypeObject {
		return nil, "", fmt.Errorf("[buildHTTPRequestBody] requset body is not object, type=%s",
			bodySchema.Value.Type)
	}

	if len(bodySchema.Value.Properties) == 0 {
		return nil, "", nil
	}
	var fillObjectDefaultValue func(sc *openapi3.Schema, vals map[string]any) (map[string]any, error)
	fillObjectDefaultValue = func(sc *openapi3.Schema, vals map[string]any) (map[string]any, error) {
		required := slices.ToMap(sc.Required, func(e string) (string, bool) {
			return e, true
		})

		res := make(map[string]any, len(sc.Properties))

		for paramName, prop := range sc.Properties {
			paramSchema := prop.Value
			if paramSchema.Type == openapi3.TypeObject {
				val := vals[paramName]
				if val == nil {
					val = map[string]any{}
				}

				mapVal, ok := val.(map[string]any)
				if !ok {
					return nil, fmt.Errorf("[buildHTTPRequestBody] parameter '%s' is not object", paramName)
				}

				newMapVal, err := fillObjectDefaultValue(paramSchema, mapVal)
				if err != nil {
					return nil, err
				}

				if len(newMapVal) > 0 {
					res[paramName] = newMapVal
				}

				continue
			}

			if val := vals[paramName]; val != nil {
				res[paramName] = val
				continue
			}

			defaultVal, err := t.getDefaultValue(ctx, paramSchema)
			if err != nil {
				return nil, err
			}
			if defaultVal == nil && required[paramName] {
				return nil, fmt.Errorf("[buildHTTPRequestBody] parameter '%s' is required", paramName)
			}

			res[paramName] = defaultVal
		}

		return res, nil
	}

	bodyMap, err := fillObjectDefaultValue(bodySchema.Value, bodyArgs)
	if err != nil {
		return nil, "", err
	}

	for paramName, prop := range bodySchema.Value.Properties {
		value, ok := bodyMap[paramName]
		if !ok {
			continue
		}

		_value, err := tryFixValueType(paramName, prop, value)
		if err != nil {
			return nil, "", err
		}

		bodyMap[paramName] = _value
	}

	reqBodyStr, err := encodeBodyWithContentType(contentType, bodyMap)
	if err != nil {
		return nil, "", fmt.Errorf("[buildHTTPRequestBody] encodeBodyWithContentType failed, err=%v", err)
	}

	return reqBodyStr, contentType, nil
}

var contentTypeArray = []string{
	plugin.MediaTypeJson,
	plugin.MediaTypeProblemJson,
	plugin.MediaTypeFormURLEncoded,
	plugin.MediaTypeXYaml,
	plugin.MediaTypeYaml,
}

func getReqBodySchema(op *plugin.Openapi3Operation) (string, *openapi3.SchemaRef) {
	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return "", nil
	}

	for _, ct := range contentTypeArray {
		mType := op.RequestBody.Value.Content[ct]
		if mType == nil {
			continue
		}

		return ct, mType.Schema
	}

	return "", nil
}
