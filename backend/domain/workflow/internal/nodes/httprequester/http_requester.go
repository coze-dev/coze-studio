package httprequester

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"strings"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
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

type Config struct {
	URLConfig  URLConfig
	AuthConfig *AuthenticationConfig
	BodyConfig BodyConfig
	Method     string
	Timeout    time.Duration
	RetryTimes uint64

	IgnoreException bool
	DefaultOutput   map[string]any
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

	bsIn, _ := json.Marshal(input)
	err = json.Unmarshal(bsIn, &req)
	if err != nil {
		return nil, err
	}

	httpRequest := &http.Request{
		Method: method,
		Header: http.Header{},
	}

	httpURL, err := nodes.Jinja2TemplateRender(hg.config.URLConfig.Tpl, req.URLVars)
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

	for i := uint64(0); i < retryTimes; i++ {
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
	result["statusCode"] = response.StatusCode

	return result, nil
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
		jsonString, err := nodes.Jinja2TemplateRender(b.TextJsonConfig.Tpl, req.JsonVars)
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
		textString, err := nodes.Jinja2TemplateRender(b.TextPlainConfig.Tpl, req.TextPlainVars)
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
	bs, _ := sonic.Marshal(input)
	if err := sonic.Unmarshal(bs, request); err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["method"] = config.Method

	u, err := nodes.Jinja2TemplateRender(config.URLConfig.Tpl, request.URLVars)
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
		js, err := nodes.Jinja2TemplateRender(config.BodyConfig.TextJsonConfig.Tpl, request.JsonVars)
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
		tx, err := nodes.Jinja2TemplateRender(config.BodyConfig.TextPlainConfig.Tpl, request.TextPlainVars)
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
