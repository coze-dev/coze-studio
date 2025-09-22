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

package platforms

import "context"

type HTTPClient interface {
	PostJSON(ctx context.Context, url string, headers map[string]string, body any) ([]byte, error)
}

type Config struct {
	Platform string
	AgentURL string
	AgentKey string
	Query    string
	Inputs   map[string]string
}

type Response struct {
	Answer   string
	Platform string
	Metadata map[string]any
	Error    string
}

type Adapter interface {
	ValidateConfig(config *Config) error
	Call(ctx context.Context, config *Config) (*Response, error)
}

type unsupportedAdapter struct {
	platform string
}

func NewUnsupportedAdapter(platform string) Adapter {
	return &unsupportedAdapter{platform: platform}
}

func (u *unsupportedAdapter) ValidateConfig(_ *Config) error {
	return nil
}

func (u *unsupportedAdapter) Call(ctx context.Context, _ *Config) (*Response, error) {
	return nil, &UnsupportedPlatformError{Platform: u.platform}
}

type UnsupportedPlatformError struct {
	Platform string
}

func (e *UnsupportedPlatformError) Error() string {
	return "agent platform not supported: " + e.Platform
}
