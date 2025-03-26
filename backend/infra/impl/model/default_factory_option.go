package model

import "github.com/cloudwego/eino-ext/components/model/openai"

type Option func(d *DefaultFactory) error

func WithOpenAIBasicConfig(cfg *openai.ChatModelConfig) Option {
	return func(d *DefaultFactory) error {
		d.openaiCfg = cfg
		return nil
	}
}
