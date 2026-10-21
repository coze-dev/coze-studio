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
	"net/http"

	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

const defaultMiniMaxBaseURL = "https://api.minimax.io/v1"

const (
	miniMaxM31Flash = "MiniMax-M3.1-Flash"
	miniMaxM3       = "MiniMax-M3"
	miniMaxM2_7     = "MiniMax-M2.7"
)

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
		Model:   miniMaxM31Flash,
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

func (m *minimaxModelBuilder) applyThinkingToConfig(conf *openai.ChatModelConfig, thinkingType config.ThinkingType) {
	model := conf.Model
	if model != miniMaxM31Flash && model != miniMaxM3 {
		return
	}

	mode := "adaptive"
	// Flash always thinks; only M3 supports disabling thinking.
	if model == miniMaxM3 && thinkingType == config.ThinkingType_Disable {
		mode = "disabled"
	}

	conf.ExtraFields = map[string]any{
		"thinking": map[string]any{
			"type": mode,
		},
	}
}

func (m *minimaxModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := m.cfg.Connection.BaseConnInfo

	conf := m.getDefaultConfig()
	conf.APIKey = base.APIKey
	// Saved and custom model IDs remain authoritative.
	if base.Model != "" {
		conf.Model = base.Model
	}

	if base.BaseURL != "" {
		conf.BaseURL = base.BaseURL
	}

	m.applyThinkingToConfig(conf, base.ThinkingType)
	m.applyParamsToConfig(conf, params)

	conf.HTTPClient = &http.Client{Transport: miniMaxTransport{base: http.DefaultTransport}}
	chatModel, err := openai.NewChatModel(ctx, conf)
	if err != nil {
		return nil, err
	}
	return &miniMaxChatModel{ToolCallingChatModel: chatModel}, nil
}

// Keep the SDK's message conversion and response handling, restoring only the
// reasoning field it omits from outgoing assistant history.
type miniMaxChatModel struct {
	ToolCallingChatModel
}

func miniMaxHistoryContext(ctx context.Context, messages []*schema.Message) context.Context {
	history := make([]string, len(messages))
	hasReasoning := false
	for i, message := range messages {
		if message != nil && message.Role == schema.Assistant && message.ReasoningContent != "" {
			history[i] = message.ReasoningContent
			hasReasoning = true
		}
	}
	if !hasReasoning {
		return ctx
	}
	return context.WithValue(ctx, miniMaxReasoningKey{}, history)
}

func (m *miniMaxChatModel) Generate(ctx context.Context, messages []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	return m.ToolCallingChatModel.Generate(miniMaxHistoryContext(ctx, messages), messages, opts...)
}

func (m *miniMaxChatModel) Stream(ctx context.Context, messages []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	return m.ToolCallingChatModel.Stream(miniMaxHistoryContext(ctx, messages), messages, opts...)
}

func (m *miniMaxChatModel) WithTools(tools []*schema.ToolInfo) (model.ToolCallingChatModel, error) {
	bound, err := m.ToolCallingChatModel.WithTools(tools)
	if err != nil {
		return nil, err
	}
	return &miniMaxChatModel{ToolCallingChatModel: bound}, nil
}
