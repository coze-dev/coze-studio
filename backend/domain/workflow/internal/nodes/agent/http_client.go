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

package agent

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type HTTPClient interface {
	PostJSON(ctx context.Context, url string, headers map[string]string, body any) ([]byte, error)
}

type httpClient struct {
	client  *http.Client
	retries int
}

func NewHTTPClient(timeout time.Duration, retries int) HTTPClient {
	if timeout <= 0 {
		timeout = 30 * time.Second
	}
	if retries < 0 {
		retries = 0
	}
	return &httpClient{
		client: &http.Client{
			Timeout: timeout,
		},
		retries: retries,
	}
}

func (c *httpClient) PostJSON(ctx context.Context, url string, headers map[string]string, body any) ([]byte, error) {
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal request body failed: %w", err)
	}

	attempts := c.retries + 1
	var lastErr error
	for i := 0; i < attempts; i++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
		if err != nil {
			return nil, fmt.Errorf("create request failed: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")
		for k, v := range headers {
			if strings.EqualFold(k, "content-type") {
				continue
			}
			req.Header.Set(k, v)
		}

		resp, err := c.client.Do(req)
		if err != nil {
			lastErr = err
		} else {
			data, readErr := io.ReadAll(resp.Body)
			_ = resp.Body.Close()
			if readErr != nil {
				lastErr = fmt.Errorf("read response failed: %w", readErr)
			} else if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				return data, nil
			} else {
				lastErr = fmt.Errorf("unexpected status %d: %s", resp.StatusCode, strings.TrimSpace(string(data)))
			}
		}

		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		if i < attempts-1 {
			time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
		}
	}

	if lastErr == nil {
		lastErr = fmt.Errorf("request failed")
	}
	return nil, lastErr
}
