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

package modelbuilder

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/deepseek"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
)

type deepseekModelBuilder struct {
	config *config.DeepseekConnInfo
}

func newDeepseekModelBuilder(config *config.DeepseekConnInfo) *deepseekModelBuilder {
	return &deepseekModelBuilder{
		config: config,
	}
}

func (d *deepseekModelBuilder) getDefaultDeepseekConfig() *deepseek.ChatModelConfig {
	return &deepseek.ChatModelConfig{
		MaxTokens: 4096,
	}
}

func (d *deepseekModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if d.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	cfg := d.getDefaultDeepseekConfig()
	cfg.APIKey = d.config.APIKey
	cfg.Model = cfg.Path

	if d.config.BaseURL != "" {
		cfg.BaseURL = d.config.BaseURL
	}

	return deepseek.NewChatModel(ctx, cfg)
}
