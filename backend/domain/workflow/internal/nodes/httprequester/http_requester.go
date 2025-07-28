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

package httprequester

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"maps"
	"mime/multipart"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/crypto"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

const defaultGetFileTimeout = 20       // second
const maxSize int64 = 20 * 1024 * 1024 // 20MB

const (
	HeaderAuthorization = "Authorization"
	HeaderBearerPrefix  = "Bearer "
	HeaderContentType   = "Content-Type"
)

type AuthType uint

const (
	BearToken AuthType = 1
	Custom    AuthType = 2
)

const (
	ContentTypeJSON           = "application/json"
	ContentTypePlainText      = "text/plain"
	ContentTypeFormURLEncoded = "application/x-www-form-urlencoded"
	ContentTypeBinary         = "application/octet-stream"
)

type Location uint8

const (
	Header     Location = 1
	QueryParam Location = 2
)

type BodyType string

const (
	BodyTypeNone           BodyType = "EMPTY"
	BodyTypeJSON           BodyType = "JSON"
	BodyTypeRawText        BodyType = "RAW_TEXT"
	BodyTypeFormData       BodyType = "FORM_DATA"
	BodyTypeFormURLEncoded BodyType = "FORM_URLENCODED"
	BodyTypeBinary         BodyType = "BINARY"
)

type URLConfig struct {
	Tpl string `json:"tpl"`
}

type IgnoreExceptionSetting struct {
	IgnoreException bool           `json:"ignore_exception"`
	DefaultOutput   map[string]any `json:"default_output,omitempty"`
}

type BodyConfig struct {
	BodyType        BodyType         `json:"body_type"`
	FormDataConfig  *FormDataConfig  `json:"form_data_config,omitempty"`
	TextPlainConfig *TextPlainConfig `json:"text_plain_config,omitempty"`
	TextJsonConfig  *TextJsonConfig  `json:"text_json_config,omitempty"`
}

type FormDataConfig struct {
	FileTypeMapping map[string]bool `json:"file_type_mapping"`
}

type TextPlainConfig struct {
	Tpl string `json:"tpl"`
}

type TextJsonConfig struct {
	Tpl string
}

type AuthenticationConfig struct {
	Type     AuthType `json:"type"`
	Location Location `json:"location"`
}

type Authentication struct {
	Key   string
	Value string
	Token string
}

type Request struct {
	URLVars            map[string]any
	Headers            map[string]string
	Params             map[string]string
	Authentication     *Authentication
	FormDataVars       map[string]string
	FormURLEncodedVars map[string]string
	JsonVars           map[string]any
	TextPlainVars      map[string]any
	FileURL            *string
}

var globalVariableReplaceRegexp = regexp.MustCompile(`global_variable_(\w+)\["(\w+)"]`)

type MD5FieldMapping struct {
	HeaderMD5Mapping map[string]string `json:"header_md_5_mapping,omitempty"` // md5 vs key
	ParamMD5Mapping  map[string]string `json:"param_md_5_mapping,omitempty"`
	URLMD5Mapping    map[string]string `json:"url_md_5_mapping,omitempty"`
	BodyMD5Mapping   map[string]string `json:"body_md_5_mapping,omitempty"`
}

func (fm *MD5FieldMapping) SetHeaderFields(fields ...string) {
	if fm.HeaderMD5Mapping == nil && len(fields) > 0 {
		fm.HeaderMD5Mapping = make(map[string]string)
	}
	for _, field := range fields {
		fm.HeaderMD5Mapping[crypto.MD5HexValue(field)] = field
	}

}
func (fm *MD5FieldMapping) SetParamFields(fields ...string) {
	if fm.ParamMD5Mapping == nil && len(fields) > 0 {
		fm.ParamMD5Mapping = make(map[string]string)
	}

	for _, field := range fields {
		fm.ParamMD5Mapping[crypto.MD5HexValue(field)] = field
	}

}
func (fm *MD5FieldMapping) SetURLFields(fields ...string) {
	if fm.URLMD5Mapping == nil && len(fields) > 0 {
		fm.URLMD5Mapping = make(map[string]string)
	}
	for _, field := range fields {
		fm.URLMD5Mapping[crypto.MD5HexValue(field)] = field
	}

}
func (fm *MD5FieldMapping) SetBodyFields(fields ...string) {
	if fm.BodyMD5Mapping == nil && len(fields) > 0 {
		fm.BodyMD5Mapping = make(map[string]string)
	}
	for _, field := range fields {
		fm.BodyMD5Mapping[crypto.MD5HexValue(field)] = field
	}

}

type Config struct {
	URLConfig  URLConfig
	AuthConfig *AuthenticationConfig
	BodyConfig BodyConfig
	Method     string
	Timeout    time.Duration
	RetryTimes uint64

	MD5FieldMapping
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	options := nodes.GetAdaptOptions(opts...)
	if options.Canvas == nil {
		return nil, fmt.Errorf("canvas is requried when adapting HTTPRequester node")
	}

	implicitDeps, err := extractImplicitDependency(n, options.Canvas)
	if err != nil {
		return nil, err
	}

	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeHTTPRequester,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	inputs := n.Data.Inputs

	md5FieldMapping := &MD5FieldMapping{}

	method := inputs.APIInfo.Method
	c.Method = method
	reqURL := inputs.APIInfo.URL
	c.URLConfig = URLConfig{
		Tpl: strings.TrimSpace(reqURL),
	}

	urlVars := extractBracesContent(reqURL)
	md5FieldMapping.SetURLFields(urlVars...)

	md5FieldMapping.SetHeaderFields(slices.Transform(inputs.Headers, func(a *vo.Param) string {
		return a.Name
	})...)

	md5FieldMapping.SetParamFields(slices.Transform(inputs.Params, func(a *vo.Param) string {
		return a.Name
	})...)

	if inputs.Auth != nil && inputs.Auth.AuthOpen {
		auth := &AuthenticationConfig{}
		ty, err := convertAuthType(inputs.Auth.AuthType)
		if err != nil {
			return nil, err
		}
		auth.Type = ty
		location, err := convertLocation(inputs.Auth.AuthData.CustomData.AddTo)
		if err != nil {
			return nil, err
		}
		auth.Location = location

		c.AuthConfig = auth
	}

	bodyConfig := BodyConfig{}

	bodyConfig.BodyType = BodyType(inputs.Body.BodyType)
	switch BodyType(inputs.Body.BodyType) {
	case BodyTypeJSON:
		jsonTpl := inputs.Body.BodyData.Json
		bodyConfig.TextJsonConfig = &TextJsonConfig{
			Tpl: jsonTpl,
		}
		jsonVars := extractBracesContent(jsonTpl)
		md5FieldMapping.SetBodyFields(jsonVars...)
	case BodyTypeFormData:
		bodyConfig.FormDataConfig = &FormDataConfig{
			FileTypeMapping: map[string]bool{},
		}
		formDataVars := make([]string, 0)
		for i := range inputs.Body.BodyData.FormData.Data {
			p := inputs.Body.BodyData.FormData.Data[i]
			formDataVars = append(formDataVars, p.Name)
			if p.Input.Type == vo.VariableTypeString && p.Input.AssistType > vo.AssistTypeNotSet && p.Input.AssistType < vo.AssistTypeTime {
				bodyConfig.FormDataConfig.FileTypeMapping[p.Name] = true
			}
		}

		md5FieldMapping.SetBodyFields(formDataVars...)
	case BodyTypeRawText:
		TextTpl := inputs.Body.BodyData.RawText
		bodyConfig.TextPlainConfig = &TextPlainConfig{
			Tpl: TextTpl,
		}
		textPlainVars := extractBracesContent(TextTpl)
		md5FieldMapping.SetBodyFields(textPlainVars...)
	case BodyTypeFormURLEncoded:
		formURLEncodedVars := make([]string, 0)
		for _, p := range inputs.Body.BodyData.FormURLEncoded {
			formURLEncodedVars = append(formURLEncodedVars, p.Name)
		}
		md5FieldMapping.SetBodyFields(formURLEncodedVars...)
	}
	c.BodyConfig = bodyConfig
	c.MD5FieldMapping = *md5FieldMapping

	if inputs.Setting != nil {
		c.Timeout = time.Duration(inputs.Setting.Timeout) * time.Second
		c.RetryTimes = uint64(inputs.Setting.RetryTimes)
	}

	if err := setHttpRequesterInputsForNodeSchema(n, ns, implicitDeps); err != nil {
		return nil, err
	}
	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}
	return ns, nil
}

func convertAuthType(auth string) (AuthType, error) {
	switch auth {
	case "CUSTOM_AUTH":
		return Custom, nil
	case "BEARER_AUTH":
		return BearToken, nil
	default:
		return AuthType(0), fmt.Errorf("invalid auth type")
	}
}

func convertLocation(l string) (Location, error) {
	switch l {
	case "header":
		return Header, nil
	case "query":
		return QueryParam, nil
	default:
		return 0, fmt.Errorf("invalid location")
	}

}

func (c *Config) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if len(c.Method) == 0 {
		return nil, fmt.Errorf("method is requried")
	}

	hg := &HTTPRequester{
		urlConfig:       c.URLConfig,
		method:          c.Method,
		retryTimes:      c.RetryTimes,
		authConfig:      c.AuthConfig,
		bodyConfig:      c.BodyConfig,
		md5FieldMapping: c.MD5FieldMapping,
	}
	client := http.DefaultClient
	if c.Timeout > 0 {
		client.Timeout = c.Timeout
	}

	hg.client = client

	return hg, nil
}

type HTTPRequester struct {
	client          *http.Client
	urlConfig       URLConfig
	authConfig      *AuthenticationConfig
	bodyConfig      BodyConfig
	method          string
	retryTimes      uint64
	md5FieldMapping MD5FieldMapping
}

func (hg *HTTPRequester) Invoke(ctx context.Context, input map[string]any) (output map[string]any, err error) {
	var (
		req         = &Request{}
		method      = hg.method
		retryTimes  = hg.retryTimes
		body        io.ReadCloser
		contentType string
		response    *http.Response
	)

	req, err = hg.parserToRequest(input)
	if err != nil {
		return nil, err
	}

	httpRequest := &http.Request{
		Method: method,
		Header: http.Header{},
	}

	httpURL, err := nodes.TemplateRender(hg.urlConfig.Tpl, req.URLVars)
	if err != nil {
		return nil, err
	}

	for key, value := range req.Headers {
		httpRequest.Header.Set(key, value)
	}

	u, err := url.Parse(httpURL)
	if err != nil {
		return nil, err
	}

	params := u.Query()
	for key, value := range req.Params {
		params.Set(key, value)
	}

	if hg.authConfig != nil {
		httpRequest.Header, params, err = hg.authConfig.addAuthentication(ctx, req.Authentication, httpRequest.Header, params)
		if err != nil {
			return nil, err
		}
	}
	u.RawQuery = params.Encode()
	httpRequest.URL = u

	body, contentType, err = hg.bodyConfig.getBodyAndContentType(ctx, req)
	if err != nil {
		return nil, err
	}
	if body != nil {
		httpRequest.Body = body
	}

	if contentType != "" {
		httpRequest.Header.Add(HeaderContentType, contentType)
	}

	for i := uint64(0); i <= retryTimes; i++ {
		response, err = hg.client.Do(httpRequest)
		if err == nil {
			break
		}
	}

	if err != nil {
		return nil, err
	}
	result := make(map[string]any)

	headers := func() string {
		// The structure of httpResp.Header is map[string][]string
		// If there are multiple header values, the last one will be selected by default
		hds := make(map[string]string, len(response.Header))
		for key, values := range response.Header {
			if len(values) == 0 {
				hds[key] = ""
			} else {
				hds[key] = values[len(values)-1]
			}
		}
		bs, _ := json.Marshal(hds)
		return string(bs)
	}()
	result["headers"] = headers
	var bodyBytes []byte

	if response.Body != nil {
		defer func() {
			_ = response.Body.Close()
		}()

		bodyBytes, err = io.ReadAll(response.Body)
		if err != nil {
			return nil, err
		}
	}

	if response.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("request %v failed, response status code=%d, status=%v, headers=%v, body=%v",
			httpURL, response.StatusCode, response.Status, headers, string(bodyBytes))
	}

	result["body"] = string(bodyBytes)
	result["statusCode"] = int64(response.StatusCode)

	return result, nil
}

// decodeUnicode parses the Unicode escape sequence in the string
func decodeUnicode(s string) string {
	var result strings.Builder
	for i := 0; i < len(s); {
		if i+1 < len(s) && s[i] == '\\' && s[i+1] == 'u' {
			if i+6 <= len(s) {
				hexStr := s[i+2 : i+6]
				if code, err := strconv.ParseInt(hexStr, 16, 32); err == nil {
					result.WriteRune(rune(code))
					i += 6
					continue
				}
			}
		}
		result.WriteByte(s[i])
		i++
	}
	return result.String()
}

func (authCfg *AuthenticationConfig) addAuthentication(_ context.Context, auth *Authentication, header http.Header, params url.Values) (
	http.Header, url.Values, error) {

	if authCfg.Type == BearToken {
		header.Set(HeaderAuthorization, HeaderBearerPrefix+auth.Token)
		return header, params, nil
	}
	if authCfg.Type == Custom && authCfg.Location == Header {
		header.Set(auth.Key, auth.Value)
		return header, params, nil
	}

	if authCfg.Type == Custom && authCfg.Location == QueryParam {
		params.Set(auth.Key, auth.Value)
		return header, params, nil
	}

	return header, params, nil
}

func (b *BodyConfig) getBodyAndContentType(ctx context.Context, req *Request) (io.ReadCloser, string, error) {
	var (
		body        io.Reader
		contentType string
	)

	// body none return body nil
	if b.BodyType == BodyTypeNone {
		return nil, "", nil
	}

	switch b.BodyType {
	case BodyTypeJSON:
		jsonString, err := nodes.TemplateRender(b.TextJsonConfig.Tpl, req.JsonVars)
		if err != nil {
			return nil, contentType, err
		}
		body = strings.NewReader(jsonString)
		contentType = ContentTypeJSON
	case BodyTypeFormURLEncoded:
		form := url.Values{}
		for key, value := range req.FormURLEncodedVars {
			form.Add(key, value)
		}

		body = strings.NewReader(form.Encode())
		contentType = ContentTypeFormURLEncoded
	case BodyTypeRawText:
		textString, err := nodes.TemplateRender(b.TextPlainConfig.Tpl, req.TextPlainVars)
		if err != nil {
			return nil, contentType, err
		}

		body = strings.NewReader(textString)
		contentType = ContentTypePlainText
	case BodyTypeBinary:
		if req.FileURL == nil {
			return nil, contentType, fmt.Errorf("file url is required")
		}

		fileURL := *req.FileURL
		response, err := httpGet(ctx, fileURL)
		if err != nil {
			return nil, contentType, err
		}

		body = response.Body
		contentType = ContentTypeBinary
	case BodyTypeFormData:
		var buffer = &bytes.Buffer{}
		formDataConfig := b.FormDataConfig
		writer := multipart.NewWriter(buffer)

		total := int64(0)
		for key, value := range req.FormDataVars {
			if ok := formDataConfig.FileTypeMapping[key]; ok {
				fileWrite, err := writer.CreateFormFile(key, key)
				if err != nil {
					return nil, contentType, err
				}

				response, err := httpGet(ctx, value)
				if err != nil {
					return nil, contentType, err
				}

				if response.StatusCode != http.StatusOK {
					return nil, contentType, fmt.Errorf("failed to download file: %s, status code %v", value, response.StatusCode)
				}

				size, err := io.Copy(fileWrite, response.Body)
				if err != nil {
					return nil, contentType, err
				}

				total += size
				if total > maxSize {
					return nil, contentType, fmt.Errorf("too large body, total size: %d", total)
				}
			} else {
				err := writer.WriteField(key, value)
				if err != nil {
					return nil, contentType, err
				}
			}
		}

		_ = writer.Close()
		contentType = writer.FormDataContentType()
		body = buffer
	default:
		return nil, contentType, fmt.Errorf("unknown content type %s", b.BodyType)
	}

	if _, ok := body.(io.ReadCloser); ok {
		return body.(io.ReadCloser), contentType, nil
	}

	return io.NopCloser(body), contentType, nil
}

func httpGet(ctx context.Context, url string) (*http.Response, error) {
	request, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	http.DefaultClient.Timeout = time.Second * defaultGetFileTimeout
	return http.DefaultClient.Do(request)
}

func (hg *HTTPRequester) ToCallbackInput(_ context.Context, input map[string]any) (map[string]any, error) {
	var request = &Request{}

	request, err := hg.parserToRequest(input)
	if err != nil {
		return nil, err
	}
	result := make(map[string]any)
	result["method"] = hg.method

	u, err := nodes.TemplateRender(hg.urlConfig.Tpl, request.URLVars)
	if err != nil {
		return nil, err
	}
	result["url"] = u

	params := make(map[string]any, len(request.Params))
	for k, v := range request.Params {
		params[k] = v
	}
	result["param"] = params

	headers := make(map[string]any, len(request.Headers))
	for k, v := range request.Headers {
		headers[k] = v
	}
	result["header"] = headers
	result["auth"] = nil
	if hg.authConfig != nil {
		if hg.authConfig.Type == Custom {
			result["auth"] = map[string]interface{}{
				"Key":   request.Authentication.Key,
				"Value": request.Authentication.Value,
			}
		} else if hg.authConfig.Type == BearToken {
			result["auth"] = map[string]interface{}{
				"token": request.Authentication.Token,
			}
		}
	}

	result["body"] = nil
	switch hg.bodyConfig.BodyType {
	case BodyTypeJSON:
		js, err := nodes.TemplateRender(hg.bodyConfig.TextJsonConfig.Tpl, request.JsonVars)
		if err != nil {
			return nil, err
		}
		ret := make(map[string]any)
		err = sonic.Unmarshal([]byte(js), &ret)
		if err != nil {
			return nil, err
		}
		result["body"] = ret
	case BodyTypeRawText:
		tx, err := nodes.TemplateRender(hg.bodyConfig.TextPlainConfig.Tpl, request.TextPlainVars)
		if err != nil {

			return nil, err
		}
		result["body"] = tx
	case BodyTypeFormData:
		result["body"] = request.FormDataVars
	case BodyTypeFormURLEncoded:
		result["body"] = request.FormURLEncodedVars
	case BodyTypeBinary:
		result["body"] = request.FileURL

	}
	return result, nil
}

const (
	apiInfoURLPrefix = "__apiInfo_url_"
	headersPrefix    = "__headers_"
	paramsPrefix     = "__params_"

	authDataPrefix            = "__auth_authData_"
	authBearerTokenDataPrefix = "bearerTokenData_token"
	authCustomDataPrefix      = "customData_data"

	bodyDataPrefix           = "__body_bodyData_"
	bodyJsonPrefix           = "json_"
	bodyFormDataPrefix       = "formData_"
	bodyFormURLEncodedPrefix = "formURLEncoded_"
	bodyRawTextPrefix        = "rawText_"
	bodyBinaryFileURLPrefix  = "binary_fileURL"
)

func (hg *HTTPRequester) parserToRequest(input map[string]any) (*Request, error) {
	request := &Request{
		URLVars:            make(map[string]any),
		Headers:            make(map[string]string),
		Params:             make(map[string]string),
		Authentication:     &Authentication{},
		FormURLEncodedVars: make(map[string]string),
		JsonVars:           make(map[string]any),
		TextPlainVars:      make(map[string]any),
		FormDataVars:       map[string]string{},
	}
	for key, value := range input {
		if strings.HasPrefix(key, apiInfoURLPrefix) {
			urlMD5 := strings.TrimPrefix(key, apiInfoURLPrefix)
			if urlKey, ok := hg.md5FieldMapping.URLMD5Mapping[urlMD5]; ok {
				if strings.HasPrefix(urlKey, "global_variable_") {
					urlKey = globalVariableReplaceRegexp.ReplaceAllString(urlKey, "global_variable_$1.$2")
				}
				nodes.SetMapValue(request.URLVars, strings.Split(urlKey, "."), value.(string))
			}
		}
		if strings.HasPrefix(key, headersPrefix) {
			headerKeyMD5 := strings.TrimPrefix(key, headersPrefix)
			if headerKey, ok := hg.md5FieldMapping.HeaderMD5Mapping[headerKeyMD5]; ok {
				request.Headers[headerKey] = value.(string)
			}
		}
		if strings.HasPrefix(key, paramsPrefix) {
			paramKeyMD5 := strings.TrimPrefix(key, paramsPrefix)
			if paramKey, ok := hg.md5FieldMapping.ParamMD5Mapping[paramKeyMD5]; ok {
				request.Params[paramKey] = value.(string)
			}
		}

		if strings.HasPrefix(key, authDataPrefix) {
			authKey := strings.TrimPrefix(key, authDataPrefix)
			if strings.HasPrefix(authKey, authBearerTokenDataPrefix) {
				request.Authentication.Token = value.(string) // bear
			}
			if strings.HasPrefix(authKey, authCustomDataPrefix) {
				if key == "__auth_authData_customData_data_Key" {
					request.Authentication.Key = value.(string)
				}
				if key == "__auth_authData_customData_data_Value" {
					request.Authentication.Value = value.(string)
				}
			}
		}

		if strings.HasPrefix(key, bodyDataPrefix) {
			bodyKey := strings.TrimPrefix(key, bodyDataPrefix)
			if strings.HasPrefix(bodyKey, bodyJsonPrefix) {
				jsonMd5Key := strings.TrimPrefix(bodyKey, bodyJsonPrefix)
				if jsonKey, ok := hg.md5FieldMapping.BodyMD5Mapping[jsonMd5Key]; ok {
					if strings.HasPrefix(jsonKey, "global_variable_") {
						jsonKey = globalVariableReplaceRegexp.ReplaceAllString(jsonKey, "global_variable_$1.$2")
					}
					nodes.SetMapValue(request.JsonVars, strings.Split(jsonKey, "."), value)
				}

			}
			if strings.HasPrefix(bodyKey, bodyFormDataPrefix) {
				formDataMd5Key := strings.TrimPrefix(bodyKey, bodyFormDataPrefix)
				if formDataKey, ok := hg.md5FieldMapping.BodyMD5Mapping[formDataMd5Key]; ok {
					request.FormDataVars[formDataKey] = value.(string)
				}

			}

			if strings.HasPrefix(bodyKey, bodyFormURLEncodedPrefix) {
				formURLEncodeMd5Key := strings.TrimPrefix(bodyKey, bodyFormURLEncodedPrefix)
				if formURLEncodeKey, ok := hg.md5FieldMapping.BodyMD5Mapping[formURLEncodeMd5Key]; ok {
					request.FormURLEncodedVars[formURLEncodeKey] = value.(string)
				}
			}

			if strings.HasPrefix(bodyKey, bodyRawTextPrefix) {
				rawTextMd5Key := strings.TrimPrefix(bodyKey, bodyRawTextPrefix)
				if rawTextKey, ok := hg.md5FieldMapping.BodyMD5Mapping[rawTextMd5Key]; ok {
					if strings.HasPrefix(rawTextKey, "global_variable_") {
						rawTextKey = globalVariableReplaceRegexp.ReplaceAllString(rawTextKey, "global_variable_$1.$2")
					}
					nodes.SetMapValue(request.TextPlainVars, strings.Split(rawTextKey, "."), value)
				}
			}

			if strings.HasPrefix(bodyKey, bodyBinaryFileURLPrefix) {
				request.FileURL = ptr.Of(value.(string))
			}

		}

	}

	return request, nil
}

func (hg *HTTPRequester) ToCallbackOutput(_ context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	if body, ok := out["body"]; !ok {
		return &nodes.StructuredCallbackOutput{
			RawOutput: out,
			Output:    out,
		}, nil
	} else {
		output := maps.Clone(out)
		output["body"] = decodeUnicode(body.(string))
		return &nodes.StructuredCallbackOutput{
			RawOutput: out,
			Output:    output,
		}, nil
	}

}
