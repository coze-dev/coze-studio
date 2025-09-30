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

	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino-ext/components/model/qwen"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type qwenModelBuilder struct {
	cfg *config.Model
}

func newQwenModelBuilder(cfg *config.Model) *qwenModelBuilder {
	return &qwenModelBuilder{
		cfg: cfg,
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

func (q *qwenModelBuilder) applyParamsToQwenConfig(conf *qwen.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}

	conf.TopP = params.TopP

	if params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params.MaxTokens != 0 {
		conf.MaxTokens = ptr.Of(params.MaxTokens)
	}

	if params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params.PresencePenalty != 0 {
		conf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

	if params.EnableThinking != nil {
		conf.EnableThinking = params.EnableThinking
	}
}

func (q *qwenModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := q.cfg.Connection.BaseConnInfo

	conf := q.getDefaultQwenConfig()
	conf.APIKey = base.APIKey
	conf.BaseURL = base.BaseURL
	conf.Model = base.Model

	q.applyParamsToQwenConfig(conf, params)

	return qwen.NewChatModel(ctx, conf)
}
