package model

import (
	"time"

	"code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/model/protocol"
)

type ConnConfig struct {
	Timeout time.Duration `json:"timeout,omitempty"`

	OpenAI   *protocol.OpenAI   `json:"openai,omitempty"`
	Claude   *protocol.Claude   `json:"claude,omitempty"`
	Deepseek *protocol.Deepseek `json:"deepseek,omitempty"`
	Ark      *protocol.Ark      `json:"ark,omitempty"`

	Custom map[string]string `json:"custom"` // custom connection protocol
}

type Capability struct {
	// Model supports function calling
	FunctionCall bool `json:"function_call" yaml:"function_call" mapstructure:"function_call"`

	// Input modals
	InputModal []Modal `json:"input_modal,omitempty" yaml:"input_modal,omitempty" mapstructure:"input_modal,omitempty"`

	// Input tokens
	InputTokens int `json:"input_tokens" yaml:"input_tokens" mapstructure:"input_tokens"`

	// Model supports json mode
	JSONMode bool `json:"json_mode" yaml:"json_mode" mapstructure:"json_mode"`

	// Max tokens
	MaxTokens int `json:"max_tokens" yaml:"max_tokens" mapstructure:"max_tokens"`

	// Output modals
	OutputModal []Modal `json:"output_modal,omitempty" yaml:"output_modal,omitempty" mapstructure:"output_modal,omitempty"`

	// Output tokens
	OutputTokens int `json:"output_tokens" yaml:"output_tokens" mapstructure:"output_tokens"`

	// Model supports prefix caching
	PrefixCaching bool `json:"prefix_caching" yaml:"prefix_caching" mapstructure:"prefix_caching"`

	// Model supports reasoning
	Reasoning bool `json:"reasoning" yaml:"reasoning" mapstructure:"reasoning"`
}

type Modal string
