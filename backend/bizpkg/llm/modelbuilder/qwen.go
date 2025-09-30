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

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type qwenModelBuilder struct {
	base   *config.BaseConnectionInfo
	config *config.QwenConnInfo
}

func newQwenModelBuilder(base *config.BaseConnectionInfo, config *config.QwenConnInfo) *qwenModelBuilder {
	return &qwenModelBuilder{
		base:   base,
		config: config,
	}
}

func (q *qwenModelBuilder) getDefaultQwenConfig() *qwen.ChatModelConfig {
	return &qwen.ChatModelConfig{
		Temperature: ptr.Of(float32(0.7)),
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type:       "text",
			JSONSchema: nil,
		},
	}
}

func (q *qwenModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if q.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}
	if q.config == nil {
		q.config = &config.QwenConnInfo{}
	}

	conf := q.getDefaultQwenConfig()
	conf.APIKey = q.base.APIKey
	conf.BaseURL = q.base.BaseURL
	conf.Model = q.base.Model

	if params != nil && params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params != nil && params.MaxTokens != 0 {
		conf.MaxTokens = ptr.Of(params.MaxTokens)
	}

	if params != nil {
		conf.TopP = params.TopP
	}

	if params != nil && params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params != nil && params.PresencePenalty != 0 {
		conf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

	if params != nil && params.EnableThinking != nil {
		conf.EnableThinking = params.EnableThinking
	}

	return qwen.NewChatModel(ctx, conf)
}
