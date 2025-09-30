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

	"github.com/cloudwego/eino-ext/components/model/openai"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type openaiModelBuilder struct {
	config *openai.ChatModelConfig
}

func newOpenaiModelBuilder(config *openai.ChatModelConfig) *openaiModelBuilder {
	return &openaiModelBuilder{
		config: config,
	}
}

func (o *openaiModelBuilder) getDefaultConfig() *openai.ChatModelConfig {
	return &openai.ChatModelConfig{
		MaxCompletionTokens: ptr.Of(4096),
		MaxTokens:           ptr.Of(4096),
		Temperature:         ptr.Of(float32(0.7)),
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type:       "text",
			JSONSchema: nil,
		},
	}
}

func (o *openaiModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if o.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	defaultCfg := o.getDefaultConfig()
	if o.config.MaxCompletionTokens == nil {
		o.config.MaxCompletionTokens = defaultCfg.MaxCompletionTokens
	}

	if o.config.Temperature == nil {
		o.config.Temperature = defaultCfg.Temperature
	}

	if o.config.ResponseFormat == nil {
		o.config.ResponseFormat = defaultCfg.ResponseFormat
	}

	if o.config.MaxTokens == nil {
		o.config.MaxTokens = defaultCfg.MaxTokens
	}

	return openai.NewChatModel(ctx, o.config)
}
