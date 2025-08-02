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

package chatmodel

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/claude"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/gemini"
	"github.com/cloudwego/eino-ext/components/model/ollama"
	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino-ext/components/model/qwen"
	"github.com/ollama/ollama/api"
	"github.com/volcengine/volcengine-go-sdk/service/arkruntime/model"
	"google.golang.org/genai"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type Builder func(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error)

func NewDefaultFactory() chatmodel.Factory {
	return NewFactory(nil)
}

func NewFactory(customFactory map[chatmodel.Protocol]Builder) chatmodel.Factory {
	protocol2Builder := map[chatmodel.Protocol]Builder{
		chatmodel.ProtocolOpenAI:   openAIBuilder,
		chatmodel.ProtocolClaude:   claudeBuilder,
		chatmodel.ProtocolDeepseek: deepseekBuilder,
		chatmodel.ProtocolArk:      arkBuilder,
		chatmodel.ProtocolGemini:   geminiBuilder,
		chatmodel.ProtocolOllama:   ollamaBuilder,
		chatmodel.ProtocolQwen:     qwenBuilder,
		chatmodel.ProtocolErnie:    nil,
	}

	for p := range customFactory {
		protocol2Builder[p] = customFactory[p]
	}

	return &defaultFactory{protocol2Builder: protocol2Builder}
}

type defaultFactory struct {
	protocol2Builder map[chatmodel.Protocol]Builder
}

func (f *defaultFactory) CreateChatModel(ctx context.Context, protocol chatmodel.Protocol, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	if config == nil {
		return nil, fmt.Errorf("[CreateChatModel] config not provided")
	}

	builder, found := f.protocol2Builder[protocol]
	if !found {
		return nil, fmt.Errorf("[CreateChatModel] protocol not support, protocol=%s", protocol)
	}

	return builder(ctx, config)
}

func (f *defaultFactory) SupportProtocol(protocol chatmodel.Protocol) bool {
	_, found := f.protocol2Builder[protocol]
	return found
}

func openAIBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	cfg := &openai.ChatModelConfig{
		APIKey:           config.APIKey,
		Timeout:          config.Timeout,
		BaseURL:          config.BaseURL,
		Model:            config.Model,
		MaxTokens:        config.MaxTokens,
		Temperature:      config.Temperature,
		TopP:             config.TopP,
		Stop:             config.Stop,
		PresencePenalty:  config.PresencePenalty,
		FrequencyPenalty: config.FrequencyPenalty,
	}
	if config.OpenAI != nil {
		cfg.ByAzure = config.OpenAI.ByAzure
		cfg.APIVersion = config.OpenAI.APIVersion
		cfg.ResponseFormat = config.OpenAI.ResponseFormat
	}
	return openai.NewChatModel(ctx, cfg)
}

func claudeBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	cfg := &claude.Config{
		APIKey:        config.APIKey,
		Model:         config.Model,
		Temperature:   config.Temperature,
		TopP:          config.TopP,
		StopSequences: config.Stop,
	}
	if config.BaseURL != "" {
		cfg.BaseURL = &config.BaseURL
	}
	if config.MaxTokens != nil {
		cfg.MaxTokens = *config.MaxTokens
	}
	if config.TopK != nil {
		cfg.TopK = ptr.Of(int32(*config.TopK))
	}
	if config.Claude != nil {
		cfg.ByBedrock = config.Claude.ByBedrock
		cfg.AccessKey = config.Claude.AccessKey
		cfg.SecretAccessKey = config.Claude.SecretAccessKey
		cfg.SessionToken = config.Claude.SessionToken
		cfg.Region = config.Claude.Region
	}
	if config.EnableThinking != nil {
		cfg.Thinking = &claude.Thinking{
			Enable: ptr.From(config.EnableThinking),
		}
		if config.Claude != nil && config.Claude.BudgetTokens != nil {
			cfg.Thinking.BudgetTokens = ptr.From(config.Claude.BudgetTokens)
		}
	}
	return claude.NewChatModel(ctx, cfg)
}

func deepseekBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	cfg := &deepseek.ChatModelConfig{
		APIKey:  config.APIKey,
		Timeout: config.Timeout,
		BaseURL: config.BaseURL,
		Model:   config.Model,
		Stop:    config.Stop,
	}
	if config.Temperature != nil {
		cfg.Temperature = *config.Temperature
	}
	if config.FrequencyPenalty != nil {
		cfg.FrequencyPenalty = *config.FrequencyPenalty
	}
	if config.PresencePenalty != nil {
		cfg.PresencePenalty = *config.PresencePenalty
	}
	if config.MaxTokens != nil {
		cfg.MaxTokens = *config.MaxTokens
	}
	if config.TopP != nil {
		cfg.TopP = *config.TopP
	}
	if config.Deepseek != nil {
		cfg.ResponseFormatType = config.Deepseek.ResponseFormatType
	}
	return deepseek.NewChatModel(ctx, cfg)
}

func arkBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	cfg := &ark.ChatModelConfig{
		BaseURL:          config.BaseURL,
		APIKey:           config.APIKey,
		Model:            config.Model,
		MaxTokens:        config.MaxTokens,
		Temperature:      config.Temperature,
		TopP:             config.TopP,
		Stop:             config.Stop,
		FrequencyPenalty: config.FrequencyPenalty,
		PresencePenalty:  config.PresencePenalty,
	}
	if config.Timeout != 0 {
		cfg.Timeout = &config.Timeout
	}
	if config.Ark != nil {
		cfg.Region = config.Ark.Region
		cfg.AccessKey = config.Ark.AccessKey
		cfg.SecretKey = config.Ark.SecretKey
		cfg.RetryTimes = config.Ark.RetryTimes
		cfg.CustomHeader = config.Ark.CustomHeader
	}

	if config.EnableThinking != nil {
		cfg.Thinking = func() *model.Thinking {
			var arkThinkingType model.ThinkingType
			switch {
			case ptr.From(config.EnableThinking):
				arkThinkingType = model.ThinkingTypeEnabled
			default:
				arkThinkingType = model.ThinkingTypeDisabled
			}
			return &model.Thinking{
				Type: arkThinkingType,
			}
		}()
	}
	return ark.NewChatModel(ctx, cfg)
}

func ollamaBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	cfg := &ollama.ChatModelConfig{
		BaseURL:    config.BaseURL,
		Timeout:    config.Timeout,
		HTTPClient: nil,
		Model:      config.Model,
		Format:     nil,
		KeepAlive:  nil,
		Options: &api.Options{
			TopK:             ptr.From(config.TopK),
			TopP:             ptr.From(config.TopP),
			Temperature:      ptr.From(config.Temperature),
			PresencePenalty:  ptr.From(config.PresencePenalty),
			FrequencyPenalty: ptr.From(config.FrequencyPenalty),
			Stop:             config.Stop,
		},
	}
	if config.EnableThinking != nil {
		cfg.Thinking = config.EnableThinking
	}
	return ollama.NewChatModel(ctx, cfg)
}

func qwenBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	cfg := &qwen.ChatModelConfig{
		APIKey:           config.APIKey,
		Timeout:          config.Timeout,
		BaseURL:          config.BaseURL,
		Model:            config.Model,
		MaxTokens:        config.MaxTokens,
		Temperature:      config.Temperature,
		TopP:             config.TopP,
		Stop:             config.Stop,
		PresencePenalty:  config.PresencePenalty,
		FrequencyPenalty: config.FrequencyPenalty,
		EnableThinking:   config.EnableThinking,
	}
	if config.Qwen != nil {
		cfg.ResponseFormat = config.Qwen.ResponseFormat
	}
	return qwen.NewChatModel(ctx, cfg)
}

func geminiBuilder(ctx context.Context, config *chatmodel.Config) (chatmodel.ToolCallingChatModel, error) {
	gc := &genai.ClientConfig{
		APIKey: config.APIKey,
		HTTPOptions: genai.HTTPOptions{
			BaseURL: config.BaseURL,
		},
	}
	if config.Gemini != nil {
		gc.Backend = config.Gemini.Backend
		gc.Project = config.Gemini.Project
		gc.Location = config.Gemini.Location
		gc.HTTPOptions.APIVersion = config.Gemini.APIVersion
		gc.HTTPOptions.Headers = config.Gemini.Headers
	}

	client, err := genai.NewClient(ctx, gc)
	if err != nil {
		return nil, err
	}

	cfg := &gemini.Config{
		Client:      client,
		Model:       config.Model,
		MaxTokens:   config.MaxTokens,
		Temperature: config.Temperature,
		TopP:        config.TopP,
		ThinkingConfig: &genai.ThinkingConfig{
			IncludeThoughts: true,
			ThinkingBudget:  nil,
		},
	}
	if config.TopK != nil {
		cfg.TopK = ptr.Of(int32(ptr.From(config.TopK)))
	}
	if config.Gemini != nil && config.Gemini.IncludeThoughts != nil {
		cfg.ThinkingConfig.IncludeThoughts = ptr.From(config.Gemini.IncludeThoughts)
	}
	if config.Gemini != nil && config.Gemini.ThinkingBudget != nil {
		cfg.ThinkingConfig.ThinkingBudget = config.Gemini.ThinkingBudget
	}

	cm, err := gemini.NewChatModel(ctx, cfg)
	if err != nil {
		return nil, err
	}

	return cm, nil
}
