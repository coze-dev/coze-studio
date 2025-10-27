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

	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/encoder"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/saasapi"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type saasCallImpl struct {
}

func NewSaasCallImpl() Invocation {
	return &saasCallImpl{}
}

func (s *saasCallImpl) Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error) {
	httpReq, err := s.buildHTTPRequest(ctx, args)
	if err != nil {
		return "", "", err
	}

	err = s.injectAuthInfo(ctx, httpReq, args)
	if err != nil {
		return "", "", err
	}

	s.injectUserAgentHeader(ctx, httpReq)

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
	httpRespBody := httpResp.String()

	type CozeAPIResponse struct {
		Code int            `json:"code"`
		Msg  string         `json:"msg"`
		Data map[string]any `json:"data"`
	}
	var apiResp CozeAPIResponse
	if err := sonic.UnmarshalString(httpRespBody, &apiResp); err != nil {
		return "", "", fmt.Errorf("failed to parse API response: %w", err)
	}

	rawResp := apiResp.Data["result"]
	return requestStr, encoder.MustString(rawResp), nil
}

func (s *saasCallImpl) injectAuthInfo(ctx context.Context, httpReq *http.Request, args *InvocationArgs) (err error) {

	saasapiClient := saasapi.NewCozeAPIClient()
	if saasapiClient.APIKey == "" {
		return fmt.Errorf("coze saas api token is empty")
	}
	httpReq.Header.Set("Authorization", "Bearer "+saasapiClient.APIKey)
	return nil
}
func (s *saasCallImpl) injectUserAgentHeader(ctx context.Context, httpReq *http.Request) {
	httpReq.Header.Set("User-Agent", "open_coze/1.0.0")
}

func (s *saasCallImpl) buildHTTPRequest(ctx context.Context, args *InvocationArgs) (httpReq *http.Request, err error) {
	tool := args.Tool
	rawURL := args.ServerURL + tool.GetSubURL()

	reqURL, err := s.buildHTTPRequestURL(ctx, rawURL, args)
	if err != nil {
		return nil, err
	}

	type callSaasTool struct {
		Arguments map[string]any `json:"arguments"`
		ToolName  string         `json:"tool_name"`
	}

	callSaasToolData := &callSaasTool{
		ToolName:  tool.GetName(),
		Arguments: args.Body,
	}

	bodyBytes, err := sonic.MarshalString(callSaasToolData)
	if err != nil {
		return nil, err
	}

	httpReq, err = http.NewRequestWithContext(ctx, tool.GetMethod(), reqURL.String(), bytes.NewBufferString(bodyBytes))
	if err != nil {
		return nil, err
	}

	return httpReq, nil
}

func (s *saasCallImpl) buildHTTPRequestURL(ctx context.Context, rawURL string, args *InvocationArgs) (reqURL *url.URL, err error) {
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
