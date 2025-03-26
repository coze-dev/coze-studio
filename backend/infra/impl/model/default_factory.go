package model

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/openai"

	"code.byted.org/flow/opencoze/backend/infra/contract/model"
)

type DefaultFactory struct {
	openaiCfg *openai.ChatModelConfig
}

func NewDefaultFactory(opts ...Option) (model.Factory, error) {
	df := &DefaultFactory{}
	for _, opt := range opts {
		if err := opt(df); err != nil {
			return nil, err
		}
	}

	return df, nil
}

// CreateChatModel of DefaultFactory won't check modelMeta.
func (d *DefaultFactory) CreateChatModel(ctx context.Context, protocol model.Protocol, config *model.Config) (model.ChatModel, error) {
	switch protocol {
	case model.ProtocolOpenAI:
		if d.openaiCfg == nil {
			return nil, fmt.Errorf("openai config not init")
		}

		c := *d.openaiCfg
		if config.ModelName != nil {
			c.Model = *config.ModelName
		}
		if config.Temperature != nil {
			c.Temperature = ptrOf(float32(*config.Temperature))
		}
		if config.FrequencyPenalty != nil {
			c.FrequencyPenalty = ptrOf(float32(*config.FrequencyPenalty))
		}
		if config.PresencePenalty != nil {
			c.PresencePenalty = ptrOf(float32(*config.PresencePenalty))
		}
		if config.MaxTokens != nil {
			c.MaxTokens = config.MaxTokens
		}
		if config.TopP != nil {
			c.TopP = ptrOf(float32(*config.TopP))
		}

		return openai.NewChatModel(ctx, &c)
	default:
		return nil, fmt.Errorf("unsupport protocol=%v", protocol)
	}
}

func ptrOf[T any](v T) *T {
	return &v
}
