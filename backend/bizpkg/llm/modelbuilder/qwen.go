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
	"github.com/cloudwego/eino-ext/components/model/qwen"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type qwenModelBuilder struct {
	config *qwen.ChatModelConfig
}

func newQwenModelBuilder(config *qwen.ChatModelConfig) *qwenModelBuilder {
	return &qwenModelBuilder{
		config: config,
	}
}

func (q *qwenModelBuilder) getDefaultQwenConfig() *qwen.ChatModelConfig {
	return &qwen.ChatModelConfig{
		MaxTokens:   ptr.Of(4096),
		Temperature: ptr.Of(float32(0.7)),
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type:       "text",
			JSONSchema: nil,
		},
	}
}

func (q *qwenModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if q.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	defaultQwenConfig := q.getDefaultQwenConfig()
	if q.config.MaxTokens == nil {
		q.config.MaxTokens = defaultQwenConfig.MaxTokens
	}

	if q.config.Temperature == nil {
		q.config.Temperature = defaultQwenConfig.Temperature
	}

	if q.config.ResponseFormat == nil {
		q.config.ResponseFormat = defaultQwenConfig.ResponseFormat
	}

	return qwen.NewChatModel(ctx, q.config)
}
