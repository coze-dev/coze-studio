package chatmodel

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/claude"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/ollama"
	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino-ext/components/model/qwen"
	"github.com/ollama/ollama/api"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
		chatmodel.ProtocolGemini:   nil, // TODO: upgrade gemini api
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
