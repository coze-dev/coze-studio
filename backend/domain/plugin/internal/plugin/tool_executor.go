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
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/getkin/kin-openapi/routers"
	"github.com/getkin/kin-openapi/routers/gorillamux"
	"github.com/go-resty/resty/v2"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
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
	args, err := t.prepareArguments(ctx, argumentsInJson)
	if err != nil {
		return nil, err
	}

	router, err := gorillamux.NewRouter(t.config.Plugin.OpenapiDoc)
	if err != nil {
		return nil, err
	}

	rawURL := t.config.Plugin.GetServerURL() + t.config.Tool.GetSubURLPath()
	httpReq, err = http.NewRequest(t.config.Tool.GetReqMethodName(), rawURL, nil)
	if err != nil {
		return nil, err
	}

	route, _, err := router.FindRoute(httpReq)
	if err != nil {
		return nil, err
	}

	locArgs, err := t.getLocationArguments(args, route.Operation.Parameters)
	if err != nil {
		return nil, err
	}

	reqURL, pathArgs, err := locArgs.buildHTTPRequestURL(ctx, rawURL)
	if err != nil {
		return nil, err
	}

	httpReq, err = http.NewRequestWithContext(ctx, route.Method, reqURL.String(), nil)
	if err != nil {
		return nil, err
	}

	header, err := locArgs.buildHTTPRequestHeader(ctx)
	if err != nil {
		return nil, err
	}

	httpReq.Header = header

	bodyBytes, contentType, err := locArgs.buildHTTPRequestBody(ctx, route.Operation, args)
	if len(bodyBytes) > 0 {
		httpReq.Header.Set("content-type", contentType)
		httpReq.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	}

	validationInput := &openapi3filter.RequestValidationInput{
		Request:    httpReq,
		PathParams: pathArgs,
		Route:      route,
	}

	if err = openapi3filter.ValidateRequest(ctx, validationInput); err != nil {
		return nil, err
	}

	return httpReq, nil
}

func (t *executorImpl) prepareArguments(_ context.Context, argumentsInJson string) (map[string]any, error) {
	args := make(map[string]any)
	for location, params := range t.config.Plugin.PluginManifest.CommonParams {
		loc := strings.ToLower(location)
		for _, p := range params {
			if loc != string(consts.ParamInHeader) {
				args[p.Name] = p.Value
			}
		}
	}

	var _args map[string]any
	err := sonic.Unmarshal([]byte(argumentsInJson), &_args) // nolint: byted_json_accuracyloss_unknowstruct
	if err != nil {
		return nil, err
	}

	for k, v := range _args {
		args[k] = v
	}

	return args, nil
}

func (t *executorImpl) getLocationArguments(args map[string]any, paramRefs []*openapi3.ParameterRef) (*locationArguments, error) {
	toolParams := make(map[string]*plugin_common.APIParameter, len(t.config.Tool.ReqParameters))
	for _, p := range t.config.Tool.ReqParameters {
		toolParams[p.Name] = p
	}

	headerArgs := map[string]valueWithSchema{}
	pathArgs := map[string]valueWithSchema{}
	queryArgs := map[string]valueWithSchema{}

	for _, paramRef := range paramRefs {
		refValue := paramRef.Value
		if refValue == nil {
			continue
		}

		// 不支持设置 cookie
		if refValue.In == openapi3.ParameterInCookie {
			continue
		}

		tp, ok := toolParams[refValue.Name]
		if !ok || tp == nil {
			return nil, fmt.Errorf("parameter '%s' not found in tool", refValue.Name)
		}

		// 非必填参数，关闭后跳过
		if !tp.IsRequired && (tp.LocalDisable || tp.GlobalDisable) {
			continue
		}

		// default 以 tool 为准，不读 openapi doc
		argValue, ok := args[refValue.Name]
		if !ok || isNilValue(argValue) {
			if !tp.IsRequired {
				continue
			}

			if tp.GetLocalDefault() == "" && tp.GetGlobalDefault() == "" {
				return nil, fmt.Errorf("parameter '%s' is required", refValue.Name)
			}

			argValue = tp.GetGlobalDefault()
			if tp.GetLocalDefault() != "" {
				argValue = tp.GetLocalDefault()
			}
		}

		if refValue.Schema == nil || refValue.Schema.Value == nil {
			return nil, fmt.Errorf("the schema of '%s' parameter '%s' is invalid", refValue.In, refValue.Name)
		}

		typ := refValue.Schema.Value.Type
		if typ == openapi3.TypeObject || typ == openapi3.TypeArray {
			return nil, fmt.Errorf("the '%s' parameter '%s' does not support object or array type", refValue.In, refValue.Name)
		}

		v := valueWithSchema{
			argValue:    argValue,
			paramSchema: refValue,
		}

		switch refValue.In {
		case openapi3.ParameterInQuery:
			queryArgs[refValue.Name] = v
		case openapi3.ParameterInHeader:
			headerArgs[refValue.Name] = v
		case openapi3.ParameterInPath:
			pathArgs[refValue.Name] = v

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

func (l *locationArguments) buildHTTPRequestURL(ctx context.Context, rawURL string) (reqURL *url.URL, pathArgs map[string]string, err error) {
	pathArgs = make(map[string]string, len(l.path))
	if len(l.path) > 0 {
		for k, v := range l.path {
			vStr, err := encodeSchemaValue(ctx, v.paramSchema, v.argValue)
			if err != nil {
				return nil, nil, err
			}

			pathArgs[k] = vStr
			rawURL = strings.ReplaceAll(rawURL, "{"+k+"}", vStr)
		}
	}

	encodeQueryStr := ""
	if len(l.query) > 0 {
		queryStr := ""
		for _, v := range l.query {
			vStr, err := encodeSchemaValue(ctx, v.paramSchema, v.argValue)
			if err != nil {
				return nil, nil, err
			}

			if len(queryStr) > 0 {
				queryStr += "&" + vStr
			} else {
				queryStr += vStr
			}
		}

		queryValues, err := url.ParseQuery(queryStr)
		if err != nil {
			return nil, nil, err
		}

		encodeQueryStr = queryValues.Encode()
	}

	reqURL, err = url.Parse(rawURL)
	if err != nil {
		return nil, nil, err
	}

	if len(reqURL.RawQuery) > 0 && len(encodeQueryStr) > 0 {
		reqURL.RawQuery += "&" + encodeQueryStr
	} else if len(encodeQueryStr) > 0 {
		reqURL.RawQuery = encodeQueryStr
	}

	return reqURL, pathArgs, nil
}

func (l *locationArguments) buildHTTPRequestHeader(ctx context.Context) (http.Header, error) {
	header := http.Header{}
	if len(l.header) > 0 {
		for k, v := range l.header {
			vStr, err := encodeSchemaValue(ctx, v.paramSchema, v.argValue)
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
	if bodySchema == nil || bodySchema.Value == nil || len(bodySchema.Value.Properties) == 0 {
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

	bodyMap := make(map[string]any, len(otherArgs))

	for k, v := range otherArgs {
		sc, ok := bodySchema.Value.Properties[k]
		if !ok || sc == nil {
			continue
		}

		_v, err := convertArgType(bodySchema, v)
		if err != nil {
			return nil, "", err
		}

		bodyMap[k] = _v
	}

	encoder, ok := bodyEncoders[contentType]
	if !ok {
		return nil, "", fmt.Errorf("unsupported content-type '%s'", contentType)
	}

	reqBodyStr, err := encoder(bodyMap)
	if err != nil {
		return nil, "", fmt.Errorf("encode failed, err=%v", err)
	}

	return reqBodyStr, contentType, nil
}

func getReqBodySchema(op *openapi3.Operation) (string, *openapi3.SchemaRef) {
	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return "", nil
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
