package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/cenkalti/backoff"
	"io"
	"net/http"
	"net/url"
	"time"
)

type Lambada func(context.Context, *Request) (*Response, error)

type Config struct {
	Method      string
	Timeout     int
	RetryTimes  uint64
	ContentType string
}

type HTTPNodeGenerate struct {
	Client *http.Client
	Config *Config
}

func NewHTTPNodeGenerate(ctx context.Context, cfg *Config) (*HTTPNodeGenerate, error) {
	if cfg == nil {
		return nil, fmt.Errorf("cfg is nil")
	}
	if len(cfg.Method) == 0 {
		return nil, fmt.Errorf("method is empty")
	}
	if len(cfg.ContentType) == 0 {
		return nil, fmt.Errorf("content type is empty")
	}

	hg := &HTTPNodeGenerate{}

	client := http.DefaultClient
	client.Timeout = time.Duration(cfg.Timeout) * time.Second
	hg.Client = client

	return hg, nil
}

func (hg *HTTPNodeGenerate) GenerateLambada(ctx context.Context) Lambada {
	return func(ctx context.Context, req *Request) (*Response, error) {
		request := &http.Request{
			Method: hg.Config.Method,
		}

		resp := &Response{}

		request.Header.Set("Content-Type", hg.Config.ContentType)
		for key, value := range req.Headers {
			request.Header.Set(key, value)
		}

		u, err := url.Parse(req.URL)
		if err != nil {
			return nil, err
		}

		params := url.Values{}
		for key, value := range req.QueryParameters {
			params.Add(key, value)
		}

		if req.Auth != nil {
			if req.Auth.Location == Header {
				request.Header.Set(req.Auth.Key, req.Auth.Value)
			}
			if req.Auth.Location == QueryParameter {
				params.Add(req.Auth.Key, req.Auth.Value)
			}

		}

		u.RawQuery = params.Encode()

		if req.Body != nil {
			request.Body = io.NopCloser(bytes.NewReader(req.Body.Data))
		}

		var response *http.Response
		err = backoff.Retry(func() error {
			response, err = hg.Client.Do(request)
			if err != nil {
				return err
			}
			return nil
		}, backoff.WithMaxRetries(&backoff.ZeroBackOff{}, hg.Config.RetryTimes)) // immediately

		if err != nil {
			return nil, err
		}

		defer func() {
			_ = response.Body.Close()
		}()

		resp.Headers = MarshalToString(response.Header)
		resp.StatusCode = response.StatusCode

		body, err := io.ReadAll(response.Body)
		if err != nil {
			return nil, err
		}

		resp.Body = string(body)
		return resp, nil
	}

}

func MarshalToString(a any) string {
	bs, _ := json.Marshal(a)
	return string(bs)
}
