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
)

type deepseekModelBuilder struct {
	config *deepseek.ChatModelConfig
}

func newDeepseekModelBuilder(config *deepseek.ChatModelConfig) *deepseekModelBuilder {
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

	defaultConfig := d.getDefaultDeepseekConfig()

	if d.config.MaxTokens == 0 {
		d.config.MaxTokens = defaultConfig.MaxTokens
	}

	return deepseek.NewChatModel(ctx, d.config)
}
