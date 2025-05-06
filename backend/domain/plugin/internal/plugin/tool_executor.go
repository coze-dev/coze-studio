package plugin

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/routers"
	"github.com/go-resty/resty/v2"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type Executor interface {
	Execute(ctx context.Context, argumentsInJson string) (resp *ExecuteResponse, err error)
}

type ExecutorConfig struct {
	Plugin *entity.PluginInfo
	Tool   *entity.ToolInfo
}

type ExecuteResponse struct {
	Result string
}

type executorImpl struct {
	config *ExecutorConfig
	router routers.Router
}

var (
	httpClient     *resty.Client
	httpClientOnce sync.Once
)

func NewExecutor(_ context.Context, config *ExecutorConfig) Executor {
	httpClientOnce.Do(func() {
		httpClient = resty.New()
	})

	return &executorImpl{
		config: config,
	}
}

func (t *executorImpl) Execute(ctx context.Context, argumentsInJson string) (resp *ExecuteResponse, err error) {
	if argumentsInJson == "" {
		return nil, fmt.Errorf("[Execute] argument is empty")
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
	restyReq.SetBody(reqBodyBytes)
	restyReq.SetContext(ctx)

	logs.CtxDebugf(ctx, "[Execute] url=%s, header=%s, method=%s, body=%s",
		restyReq.URL, restyReq.Header, restyReq.Method, restyReq.Body)

	httpResp, err := restyReq.Send()
	if err != nil {
		return nil, err
	}

	logs.CtxDebugf(ctx, "[Execute] status=%s, response=%s", httpResp.Status(), httpResp.String())

	if httpResp.StatusCode() != http.StatusOK {
		return nil, fmt.Errorf("[Execute] http request failed, status=%s", httpResp.Status())
	}

	return &ExecuteResponse{
		Result: string(httpResp.Body()),
	}, nil
}

func (t *executorImpl) buildHTTPRequest(ctx context.Context, argumentsInJson string) (httpReq *http.Request, err error) {
	argMaps, err := t.prepareArguments(ctx, argumentsInJson)
	if err != nil {
		return nil, err
	}

	tool := t.config.Tool
	rawURL := t.config.Plugin.GetServerURL() + tool.GetSubURL()

	locArgs, err := t.getLocationArguments(argMaps, tool.Operation.Parameters)
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

	bodyBytes, contentType, err := locArgs.buildHTTPRequestBody(ctx, tool.Operation, argMaps)
	if len(bodyBytes) > 0 {
		httpReq.Header.Set("content-type", contentType)
		httpReq.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	}

	return httpReq, nil
}

func (t *executorImpl) prepareArguments(_ context.Context, argumentsInJson string) (map[string]any, error) {
	args := map[string]any{}
	for loc, params := range t.config.Plugin.Manifest.CommonParams {
		var location consts.HTTPParamLocation
		switch loc {
		case common.ParameterLocation_Path:
			location = consts.ParamInPath
		case common.ParameterLocation_Header:
			location = consts.ParamInHeader
		case common.ParameterLocation_Query:
			location = consts.ParamInQuery
		case common.ParameterLocation_Body:
			location = consts.ParamInBody
		default:
			return nil, fmt.Errorf("[prepareArguments] unsupported location=%s", loc)
		}

		for _, p := range params {
			if location != consts.ParamInBody {
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

func (t *executorImpl) getLocationArguments(args map[string]any, paramRefs []*openapi3.ParameterRef) (*locationArguments, error) {
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
			var defaultVal any
			_, exist := scVal.Extensions[consts.APISchemaExtendVariableRef]
			if exist {
				// TODO(@maronghong): 从 Agent Variable 取值
			} else if scVal.Default != nil {
				defaultVal = scVal.Default
			}

			if defaultVal != nil {
				argValue = defaultVal
			} else if !paramVal.Required {
				continue
			} else {
				return nil, fmt.Errorf("parameter '%s' is required", paramVal.Name)
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

func (l *locationArguments) buildHTTPRequestBody(_ context.Context, op *openapi3.Operation, args map[string]any) (body []byte, contentType string, err error) {
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

	otherArgs := map[string]any{}
	for k, v := range args {
		if _, ok := l.header[k]; ok {
			continue
		}
		if _, ok := l.path[k]; ok {
			continue
		}
		if _, ok := l.query[k]; ok {
			continue
		}

		otherArgs[k] = v
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

			defaultVal, err := getDefaultValue(paramName, paramSchema, required[paramName])
			if err != nil {
				return nil, err
			}

			if defaultVal != nil {
				res[paramName] = defaultVal
			}
		}

		return res, nil
	}

	bodyMap, err := fillObjectDefaultValue(bodySchema.Value, otherArgs)
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

func getDefaultValue(name string, sc *openapi3.Schema, isRequired bool) (val any, e error) {
	var defaultVal any
	_, ok := sc.Extensions[consts.APISchemaExtendVariableRef]
	if ok {
		// TODO(@maronghong): 从 Agent Variable 取值
	} else if sc.Default != nil {
		defaultVal = sc.Default
	}

	if isRequired && defaultVal == nil {
		return nil, fmt.Errorf("parameter '%s' is required", name)
	}

	return defaultVal, nil
}

func getReqBodySchema(op *openapi3.Operation) (string, *openapi3.SchemaRef) {
	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return "", nil
	}

	var contentTypeArray = []string{
		consts.MIMETypeJson,
		consts.MIMETypeJsonPatch,
		consts.MIMETypeProblemJson,
		consts.MIMETypeForm,
		consts.MIMETypeXYaml,
		consts.MIMETypeYaml,
	}

	for _, ct := range contentTypeArray {
		mType := op.RequestBody.Value.Content.Get(ct)
		if mType == nil {
			continue
		}

		return ct, mType.Schema
	}

	return "", nil
}
