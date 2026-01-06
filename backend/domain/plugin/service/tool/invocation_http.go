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
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-resty/resty/v2"
	"github.com/tidwall/sjson"

	pluginConsts "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/encoder"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/saasapi"
	"github.com/coze-dev/coze-studio/backend/types/consts"

	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type httpCallImpl struct {
	ConversationID int64
}

var defaultHttpCli *resty.Client = resty.New()

func NewHttpCallImpl(ConversationID int64) Invocation {
	return &httpCallImpl{
		ConversationID: ConversationID,
	}
}

func (h *httpCallImpl) Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error) {
	httpReq, err := h.buildHTTPRequest(ctx, args)
	if err != nil {
		return "", "", err
	}

	errMsg, err := h.injectAuthInfo(ctx, httpReq, args)
	if err != nil {
		return "", "", err
	}

	if errMsg != "" {
		event := &model.ToolInterruptEvent{
			Event: pluginConsts.InterruptEventTypeOfToolNeedOAuth,
			ToolNeedOAuth: &model.ToolNeedOAuthInterruptEvent{
				Message: errMsg,
			},
		}

		return "", "", compose.NewInterruptAndRerunErr(event)
	}

	var reqBodyBytes []byte
	if httpReq.GetBody != nil {
		reqBody, err := httpReq.GetBody()
		if err != nil {
			return "", "", err
		}
		defer reqBody.Close()

		reqBodyBytes, err = io.ReadAll(reqBody)
		if err != nil {
			return "", "", err
		}
	}

	requestStr, err := genRequestString(httpReq, reqBodyBytes)
	if err != nil {
		return "", "", err
	}

	restyReq := defaultHttpCli.NewRequest()
	restyReq.Header = httpReq.Header
	restyReq.Method = httpReq.Method
	restyReq.URL = httpReq.URL.String()
	if reqBodyBytes != nil {
		restyReq.SetBody(reqBodyBytes)
	}
	restyReq.SetContext(ctx)

	logs.CtxDebugf(ctx, "[execute] url=%s, header=%s, method=%s, body=%s",
		restyReq.URL, restyReq.Header, restyReq.Method, restyReq.Body)

	httpResp, err := restyReq.Send()
	if err != nil {
		return "", "", errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey, "http request failed, err=%s", err))
	}

	logs.CtxDebugf(ctx, "[execute] status=%s, response=%s", httpResp.Status(), httpResp.String())

	if httpResp.StatusCode() != http.StatusOK {
		return "", "", errorx.New(errno.ErrPluginExecuteToolFailed,
			errorx.KVf(errno.PluginMsgKey, "http request failed, status=%s\nresp=%s", httpResp.Status(), httpResp.String()))
	}

	return requestStr, httpResp.String(), nil
}

func (h *httpCallImpl) buildHTTPRequest(ctx context.Context, args *InvocationArgs) (httpReq *http.Request, err error) {
	tool := args.Tool
	rawURL := args.ServerURL + tool.GetSubURL()

	reqURL, err := h.buildHTTPRequestURL(ctx, rawURL, args)
	if err != nil {
		return nil, err
	}

	bodyBytes, contentType, err := h.buildRequestBody(ctx, tool.Operation, args.Body)
	if err != nil {
		return nil, err
	}

	httpReq, err = http.NewRequestWithContext(ctx, tool.GetMethod(), reqURL.String(), bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	httpReq.Header, err = h.buildHTTPRequestHeader(ctx, args)
	if err != nil {
		return nil, err
	}

	if len(bodyBytes) > 0 {
		httpReq.Header.Set("Content-Type", contentType)
	}

	return httpReq, nil
}

func (h *httpCallImpl) injectAuthInfo(ctx context.Context, httpReq *http.Request, args *InvocationArgs) (errMsg string, err error) {

	if args.AuthInfo.MetaInfo.Type == pluginConsts.AuthzTypeOfNone {
		return "", nil
	}

	if args.AuthInfo.MetaInfo.Type == pluginConsts.AuthzTypeOfService {
		return h.injectServiceAPIToken(ctx, httpReq, args.AuthInfo.MetaInfo)
	}

	if args.AuthInfo.MetaInfo.Type == pluginConsts.AuthzTypeOfOAuth {
		return h.injectOAuthAccessToken(ctx, httpReq, args)
	}

	return "", nil
}

func genRequestString(req *http.Request, body []byte) (string, error) {
	type Request struct {
		Path   string            `json:"path"`
		Header map[string]string `json:"header"`
		Query  map[string]string `json:"query"`
		Body   *[]byte           `json:"body"`
	}

	req_ := &Request{
		Path:   req.URL.Path,
		Header: map[string]string{},
		Query:  map[string]string{},
	}

	if len(req.Header) > 0 {
		for k, v := range req.Header {
			req_.Header[k] = v[0]
		}
	}
	if len(req.URL.Query()) > 0 {
		for k, v := range req.URL.Query() {
			req_.Query[k] = v[0]
		}
	}

	requestStr, err := sonic.MarshalString(req_)
	if err != nil {
		return "", fmt.Errorf("[genRequestString] marshal failed, err=%s", err)
	}

	if len(body) > 0 {
		requestStr, err = sjson.SetRaw(requestStr, "body", string(body))
		if err != nil {
			return "", fmt.Errorf("[genRequestString] set body failed, err=%s", err)
		}
	}

	return requestStr, nil
}

func (h *httpCallImpl) buildHTTPRequestURL(ctx context.Context, rawURL string, args *InvocationArgs) (reqURL *url.URL, err error) {
	if len(args.Path) > 0 {
		for k, v := range args.Path {
			p := args.groupedKeySchema.PathKeys[k]
			vStr, eErr := encoder.EncodeParameter(p, v)
			if eErr != nil {
				return nil, eErr
			}
			rawURL = strings.ReplaceAll(rawURL, "{"+k+"}", vStr)
		}
	}

	query := url.Values{}
	if len(args.Query) > 0 {
		for k, val := range args.Query {
			switch v := val.(type) {
			case []any:
				for _, _v := range v {
					query.Add(k, encoder.MustString(_v))
				}
			default:
				query.Add(k, encoder.MustString(v))
			}
		}
	}

	encodeQuery := query.Encode()

	reqURL, err = url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	if len(reqURL.RawQuery) > 0 && len(encodeQuery) > 0 {
		reqURL.RawQuery += "&" + encodeQuery
	} else if len(encodeQuery) > 0 {
		reqURL.RawQuery = encodeQuery
	}

	return reqURL, nil
}

func (h *httpCallImpl) buildRequestBody(ctx context.Context, op *model.Openapi3Operation, bodyArgs map[string]any) (body []byte, contentType string, err error) {
	contentType, bodySchema := op.GetReqBodySchema()
	if bodySchema != nil && len(bodySchema.Value.Properties) > 0 {
		for paramName, prop := range bodySchema.Value.Properties {
			value, ok := bodyArgs[paramName]
			if !ok {
				continue
			}

			_value, eErr := encoder.TryCorrectValueType(paramName, prop, value)
			if eErr != nil {
				return nil, "", eErr
			}

			bodyArgs[paramName] = _value
		}

		body, err = encoder.EncodeBodyWithContentType(contentType, bodyArgs)
		if err != nil {
			return nil, "", fmt.Errorf("[buildRequestBody] EncodeBodyWithContentType failed, err=%v", err)
		}
	}

	return body, contentType, nil
}

func (h *httpCallImpl) injectCozeSaasAPIToken(ctx context.Context, httpReq *http.Request) (errMsg string, err error) {

	saasapiClient := saasapi.NewCozeAPIClient()
	if saasapiClient.APIKey == "" {
		return "", fmt.Errorf("coze saas api token is empty")
	}
	httpReq.Header.Set("Authorization", "Bearer "+saasapiClient.APIKey)
	return "", nil
}

func (h *httpCallImpl) injectServiceAPIToken(ctx context.Context, httpReq *http.Request, authInfo *model.AuthV2) (errMsg string, err error) {
	if authInfo.SubType == pluginConsts.AuthzSubTypeOfServiceAPIToken {
		authOfAPIToken := authInfo.AuthOfAPIToken
		if authOfAPIToken == nil {
			return "", fmt.Errorf("auth of api token is nil")
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

	return "", nil
}

func (h *httpCallImpl) injectOAuthAccessToken(ctx context.Context, httpReq *http.Request, args *InvocationArgs) (errMsg string, err error) {
	authMode := pluginConsts.ToolAuthModeOfRequired
	if tmp, ok := args.Tool.Operation.Extensions[pluginConsts.APISchemaExtendAuthMode].(string); ok {
		authMode = pluginConsts.ToolAuthMode(tmp)
	}

	if authMode == pluginConsts.ToolAuthModeOfDisabled {
		return "", nil
	}

	if args.AuthInfo.OAuth == nil {
		return "", fmt.Errorf("auth of oauth is nil")
	}

	accessToken := args.AuthInfo.OAuth.AccessToken
	authInfo := args.AuthInfo.MetaInfo

	if authInfo.SubType == pluginConsts.AuthzSubTypeOfOAuthAuthorizationCode &&
		accessToken == "" && authMode != pluginConsts.ToolAuthModeOfSupported {
		errMsg = authCodeInvalidTokenErrMsg[i18n.GetLocale(ctx)]
		if errMsg == "" {
			errMsg = authCodeInvalidTokenErrMsg[i18n.LocaleEN]
		}

		errMsg = fmt.Sprintf(errMsg, args.PluginManifest.NameForHuman, args.AuthInfo.OAuth.AuthURL)

		return errMsg, nil
	}

	if accessToken != "" {
		httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}

	return "", nil
}

var authCodeInvalidTokenErrMsg = map[i18n.Locale]string{
	i18n.LocaleZH: "%s 插件需要授权使用。授权后即代表你同意与扣子中你所选择的 AI 模型分享数据。请[点击这里](%s)进行授权。",
	i18n.LocaleEN: "The '%s' plugin requires authorization. By authorizing, you agree to share data with the AI model you selected in Coze. Please [click here](%s) to authorize.",
}

func (h *httpCallImpl) buildHTTPRequestHeader(ctx context.Context, args *InvocationArgs) (http.Header, error) {
	header := http.Header{}
	if len(args.Header) > 0 {
		for k, v := range args.Header {
			switch vv := v.(type) {
			case []any:
				for _, _v := range vv {
					header.Add(k, encoder.MustString(_v))
				}
			default:
				header.Add(k, encoder.MustString(vv))
			}
		}
	}

	logId, _ := ctx.Value(consts.CtxLogIDKey).(string)
	header.Set("X-Tt-Logid", logId)
	header.Set("X-Aiplugin-Connector-Identifier", args.UserID)
	if args.ProjectInfo != nil {
		header.Set("X-AIPlugin-Bot-ID", conv.Int64ToStr(args.ProjectInfo.ProjectID))
	}
	if h.ConversationID > 0 {
		header.Set("X-AIPlugin-Conversation-ID", conv.Int64ToStr(h.ConversationID))
	}

	return header, nil
}
