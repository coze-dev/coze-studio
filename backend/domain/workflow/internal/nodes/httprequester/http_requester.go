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

	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/crypto"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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

var globalVariableReplaceRegexp = regexp.MustCompile(`global_variable_(\w+)\["(\w+)"\]`)

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

	IgnoreException bool
	DefaultOutput   map[string]any

	MD5FieldMapping
}

type HTTPRequester struct {
	client *http.Client
	config *Config
}

func NewHTTPRequester(_ context.Context, cfg *Config) (*HTTPRequester, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config is requried")
	}

	if len(cfg.Method) == 0 {
		return nil, fmt.Errorf("method is requried")
	}

	hg := &HTTPRequester{}
	client := http.DefaultClient
	if cfg.Timeout > 0 {
		client.Timeout = cfg.Timeout
	}

	hg.client = client
	hg.config = cfg

	return hg, nil
}

func (hg *HTTPRequester) Invoke(ctx context.Context, input map[string]any) (output map[string]any, err error) {
	var (
		req         = &Request{}
		method      = hg.config.Method
		retryTimes  = hg.config.RetryTimes
		body        io.ReadCloser
		contentType string
		response    *http.Response
	)

	req, err = hg.config.parserToRequest(input)
	if err != nil {
		return nil, err
	}

	httpRequest := &http.Request{
		Method: method,
		Header: http.Header{},
	}

	httpURL, err := nodes.TemplateRender(hg.config.URLConfig.Tpl, req.URLVars)
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

	if hg.config.AuthConfig != nil {
		httpRequest.Header, params, err = hg.config.AuthConfig.addAuthentication(ctx, req.Authentication, httpRequest.Header, params)
		if err != nil {
			return nil, err
		}
	}
	u.RawQuery = params.Encode()
	httpRequest.URL = u

	body, contentType, err = hg.config.BodyConfig.getBodyAndContentType(ctx, req)
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
	var (
		request = &Request{}
		config  = hg.config
	)
	request, err := hg.config.parserToRequest(input)
	if err != nil {
		return nil, err
	}
	result := make(map[string]any)
	result["method"] = config.Method

	u, err := nodes.TemplateRender(config.URLConfig.Tpl, request.URLVars)
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
	if config.AuthConfig != nil {
		if config.AuthConfig.Type == Custom {
			result["auth"] = map[string]interface{}{
				"Key":   request.Authentication.Key,
				"Value": request.Authentication.Value,
			}
		} else if config.AuthConfig.Type == BearToken {
			result["auth"] = map[string]interface{}{
				"token": request.Authentication.Token,
			}
		}
	}

	result["body"] = nil
	switch config.BodyConfig.BodyType {
	case BodyTypeJSON:
		js, err := nodes.TemplateRender(config.BodyConfig.TextJsonConfig.Tpl, request.JsonVars)
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
		tx, err := nodes.TemplateRender(config.BodyConfig.TextPlainConfig.Tpl, request.TextPlainVars)
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

func (cfg *Config) parserToRequest(input map[string]any) (*Request, error) {
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
			if urlKey, ok := cfg.URLMD5Mapping[urlMD5]; ok {
				if strings.HasPrefix(urlKey, "global_variable_") {
					urlKey = globalVariableReplaceRegexp.ReplaceAllString(urlKey, "global_variable_$1.$2")
				}
				nodes.SetMapValue(request.URLVars, strings.Split(urlKey, "."), value.(string))
			}
		}
		if strings.HasPrefix(key, headersPrefix) {
			headerKeyMD5 := strings.TrimPrefix(key, headersPrefix)
			if headerKey, ok := cfg.HeaderMD5Mapping[headerKeyMD5]; ok {
				request.Headers[headerKey] = value.(string)
			}
		}
		if strings.HasPrefix(key, paramsPrefix) {
			paramKeyMD5 := strings.TrimPrefix(key, paramsPrefix)
			if paramKey, ok := cfg.ParamMD5Mapping[paramKeyMD5]; ok {
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
				if jsonKey, ok := cfg.BodyMD5Mapping[jsonMd5Key]; ok {
					if strings.HasPrefix(jsonKey, "global_variable_") {
						jsonKey = globalVariableReplaceRegexp.ReplaceAllString(jsonKey, "global_variable_$1.$2")
					}
					nodes.SetMapValue(request.JsonVars, strings.Split(jsonKey, "."), value)
				}

			}
			if strings.HasPrefix(bodyKey, bodyFormDataPrefix) {
				formDataMd5Key := strings.TrimPrefix(bodyKey, bodyFormDataPrefix)
				if formDataKey, ok := cfg.BodyMD5Mapping[formDataMd5Key]; ok {
					request.FormDataVars[formDataKey] = value.(string)
				}

			}

			if strings.HasPrefix(bodyKey, bodyFormURLEncodedPrefix) {
				formURLEncodeMd5Key := strings.TrimPrefix(bodyKey, bodyFormURLEncodedPrefix)
				if formURLEncodeKey, ok := cfg.BodyMD5Mapping[formURLEncodeMd5Key]; ok {
					request.FormURLEncodedVars[formURLEncodeKey] = value.(string)
				}
			}

			if strings.HasPrefix(bodyKey, bodyRawTextPrefix) {
				rawTextMd5Key := strings.TrimPrefix(bodyKey, bodyRawTextPrefix)
				if rawTextKey, ok := cfg.BodyMD5Mapping[rawTextMd5Key]; ok {
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
