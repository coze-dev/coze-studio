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

package saasapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// CozeAPIClient represents a client for coze.cn OpenAPI
type CozeAPIClient struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
	MaxRetries int
}

// CozeAPIResponse represents the standard response format from coze.cn API
type CozeAPIResponse struct {
	Code int             `json:"code"`
	Msg  string          `json:"msg"`
	Data json.RawMessage `json:"data"`
}

// NewCozeAPIClient creates a new coze.cn API client
func NewCozeAPIClient() *CozeAPIClient {
	return &CozeAPIClient{
		BaseURL: getSaasOpenAPIUrl(),
		APIKey:  getSaasOpenAPIKey(),
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		MaxRetries: 1,
	}
}

// Get performs a GET request to the coze.cn API
func (c *CozeAPIClient) Get(ctx context.Context, path string) (*CozeAPIResponse, error) {
	return c.request(ctx, "GET", path, nil)
}

// GetWithQuery performs a GET request to the coze.cn API with query parameters
func (c *CozeAPIClient) GetWithQuery(ctx context.Context, path string, queryParams map[string]interface{}) (*CozeAPIResponse, error) {
	return c.requestWithQuery(ctx, "GET", path, nil, queryParams)
}

// Post performs a POST request to the coze.cn API
func (c *CozeAPIClient) Post(ctx context.Context, path string, body interface{}) (*CozeAPIResponse, error) {
	var bodyBytes []byte
	var err error

	if body != nil {
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
	}

	return c.request(ctx, "POST", path, bodyBytes)
}

// request is the core method for making HTTP requests to coze.cn API
func (c *CozeAPIClient) request(ctx context.Context, method, path string, body []byte) (*CozeAPIResponse, error) {
	url := fmt.Sprintf("%s%s", c.BaseURL, path)

	var req *http.Request
	var err error

	if body != nil {
		req, err = http.NewRequestWithContext(ctx, method, url, bytes.NewReader(body))
	} else {
		req, err = http.NewRequestWithContext(ctx, method, url, nil)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Add API key if available
	if c.APIKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.APIKey))
	}

	// Make request with retries
	var resp *http.Response
	for i := 0; i <= c.MaxRetries; i++ {
		resp, err = c.HTTPClient.Do(req)
		if err == nil {
			break
		}

		if i < c.MaxRetries {
			logs.CtxWarnf(ctx, "coze API request failed, retrying (%d/%d): %v", i+1, c.MaxRetries, err)
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("request failed after %d retries: %w", c.MaxRetries, err)
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check HTTP status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	// Parse response
	var apiResp CozeAPIResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse API response: %w", err)
	}

	// Check API response code
	if apiResp.Code != 0 {
		return nil, fmt.Errorf("API returned error: code=%d, msg=%s", apiResp.Code, apiResp.Msg)
	}

	return &apiResp, nil
}

// requestWithQuery is the core method for making HTTP requests to coze.cn API with query parameters
func (c *CozeAPIClient) requestWithQuery(ctx context.Context, method, path string, body []byte, queryParams map[string]interface{}) (*CozeAPIResponse, error) {
	baseURL := fmt.Sprintf("%s%s", c.BaseURL, path)

	// Build query parameters
	if len(queryParams) > 0 {
		u, err := url.Parse(baseURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse URL: %w", err)
		}

		q := u.Query()
		for key, value := range queryParams {
			if value != nil {
				switch v := value.(type) {
				case string:
					if v != "" {
						q.Set(key, v)
					}
				case int:
					q.Set(key, strconv.Itoa(v))
				case bool:
					q.Set(key, strconv.FormatBool(v))
				case *string:
					if v != nil && *v != "" {
						q.Set(key, *v)
					}
				case *int:
					if v != nil {
						q.Set(key, strconv.Itoa(*v))
					}
				case *bool:
					if v != nil {
						q.Set(key, strconv.FormatBool(*v))
					}
				}
			}
		}
		u.RawQuery = q.Encode()
		baseURL = u.String()
	}

	var req *http.Request
	var err error

	if body != nil {
		req, err = http.NewRequestWithContext(ctx, method, baseURL, bytes.NewReader(body))
	} else {
		req, err = http.NewRequestWithContext(ctx, method, baseURL, nil)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Add API key if available
	if c.APIKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.APIKey))
	}

	// Make request with retries
	var resp *http.Response
	for i := 0; i <= c.MaxRetries; i++ {
		resp, err = c.HTTPClient.Do(req)
		if err == nil {
			break
		}

		if i < c.MaxRetries {
			logs.CtxWarnf(ctx, "coze API request failed, retrying (%d/%d): %v", i+1, c.MaxRetries, err)
			time.Sleep(time.Duration(i+1) * time.Second)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("request failed after %d retries: %w", c.MaxRetries, err)
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check HTTP status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	// Parse response
	var apiResp CozeAPIResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse API response: %w", err)
	}

	// Check API response code
	if apiResp.Code != 0 {
		return nil, fmt.Errorf("API returned error: code=%d, msg=%s", apiResp.Code, apiResp.Msg)
	}

	return &apiResp, nil
}

// getEnvOrDefault returns environment variable value or default if not set
func getSaasOpenAPIUrl() string {
	baseConfig, err := config.Base().GetBaseConfig(context.Background())
	if err != nil {
		logs.CtxErrorf(context.Background(), "GetBaseConfig failed: %v", err)
		return "https://api.coze.cn"
	}

	return baseConfig.PluginConfiguration.CozeSaasAPIBaseURL
}

func getSaasOpenAPIKey() string {
	baseConfig, err := config.Base().GetBaseConfig(context.Background())
	if err != nil {
		logs.CtxErrorf(context.Background(), "GetBaseConfig failed: %v", err)
		return ""
	}

	return baseConfig.PluginConfiguration.CozeAPIToken
}
