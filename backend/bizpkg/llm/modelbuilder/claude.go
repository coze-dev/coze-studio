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
	config *config.ClaudeConnInfo
}

func newClaudeModelBuilder(config *config.ClaudeConnInfo) *claudeModelBuilder {
	return &claudeModelBuilder{
		config: config,
	}
}

func (c *claudeModelBuilder) getDefaultClaudeConfig() *claude.Config {
	return &claude.Config{
		MaxTokens:   4096,
		Temperature: ptr.Of(float32(0.7)),
	}
}

func (c *claudeModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if c.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	cfg := c.getDefaultClaudeConfig()
	cfg.APIKey = c.config.APIKey
	cfg.Model = c.config.Model

	if c.config.BaseURL != "" {
		cfg.BaseURL = &c.config.BaseURL
	}

	return claude.NewChatModel(ctx, cfg)
}
