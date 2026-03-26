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

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

const defaultMiniMaxBaseURL = "https://api.minimax.io/v1"

type minimaxModelBuilder struct {
	cfg *config.Model
}

func newMiniMaxModelBuilder(cfg *config.Model) Service {
	return &minimaxModelBuilder{
		cfg: cfg,
	}
}

func (m *minimaxModelBuilder) getDefaultConfig() *openai.ChatModelConfig {
	return &openai.ChatModelConfig{
		BaseURL: defaultMiniMaxBaseURL,
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeText,
		},
	}
}

// clampTemperature ensures temperature stays within MiniMax's valid range (0, 1.0].
// MiniMax rejects temperature=0, so we clamp it to a small positive value.
func clampTemperature(t float32) float32 {
	if t <= 0 {
		return 0.01
	}
	if t > 1.0 {
		return 1.0
	}
	return t
}

func (m *minimaxModelBuilder) applyParamsToConfig(conf *openai.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}

	if params.Temperature != nil {
		clamped := clampTemperature(*params.Temperature)
		conf.Temperature = ptr.Of(clamped)
	}

	if params.MaxTokens != 0 {
		conf.MaxCompletionTokens = ptr.Of(params.MaxTokens)
	}

	if params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params.PresencePenalty != 0 {
		conf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

	conf.TopP = params.TopP

	// MiniMax does not support response_format (JSON mode), always use text.
	conf.ResponseFormat = &openai.ChatCompletionResponseFormat{
		Type: openai.ChatCompletionResponseFormatTypeText,
	}
}

func (m *minimaxModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := m.cfg.Connection.BaseConnInfo

	conf := m.getDefaultConfig()
	conf.APIKey = base.APIKey
	conf.Model = base.Model

	if base.BaseURL != "" {
		conf.BaseURL = base.BaseURL
	}

	m.applyParamsToConfig(conf, params)

	return openai.NewChatModel(ctx, conf)
}
