/*
 * License: Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package modelbuilder

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/claude"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type claudeModelBuilder struct {
	base   *config.BaseConnectionInfo
	config *config.ClaudeConnInfo
}

func newClaudeModelBuilder(base *config.BaseConnectionInfo, config *config.ClaudeConnInfo) *claudeModelBuilder {
	return &claudeModelBuilder{
		base:   base,
		config: config,
	}
}

func (c *claudeModelBuilder) getDefaultClaudeConfig() *claude.Config {
	return &claude.Config{
		MaxTokens:   4096,
		Temperature: ptr.Of(float32(0.7)),
	}
}

func (c *claudeModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if c.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}
	if c.config == nil {
		c.config = &config.ClaudeConnInfo{}
	}

	conf := c.getDefaultClaudeConfig()
	conf.APIKey = c.base.APIKey
	conf.Model = c.base.Model

	if c.base.BaseURL != "" {
		conf.BaseURL = &c.base.BaseURL
	}

	if params != nil && params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params != nil && params.MaxTokens != 0 {
		conf.MaxTokens = params.MaxTokens
	}

	if params != nil {
		conf.TopP = params.TopP
		conf.TopK = params.TopK
	}

	if params != nil && params.EnableThinking != nil {
		conf.Thinking = &claude.Thinking{
			Enable: *params.EnableThinking,
		}
	}

	return claude.NewChatModel(ctx, conf)
}
