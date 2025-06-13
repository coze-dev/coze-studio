package chatmodel

import (
	"time"

	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/libs/acl/openai"
)

type Config struct {
	BaseURL string        `json:"base_url,omitempty" yaml:"base_url,omitempty"`
	APIKey  string        `json:"api_key,omitempty" yaml:"api_key,omitempty"`
	Timeout time.Duration `json:"timeout,omitempty" yaml:"timeout,omitempty"`

	Model            string   `json:"model" yaml:"model"`
	Temperature      *float32 `json:"temperature,omitempty" yaml:"temperature,omitempty"`
	FrequencyPenalty *float32 `json:"frequency_penalty,omitempty" yaml:"frequency_penalty,omitempty"`
	PresencePenalty  *float32 `json:"presence_penalty,omitempty" yaml:"presence_penalty,omitempty"`
	MaxTokens        *int     `json:"max_tokens,omitempty" yaml:"max_tokens,omitempty"`
	TopP             *float32 `json:"top_p,omitempty" yaml:"top_p"`
	TopK             *int     `json:"top_k,omitempty" yaml:"top_k"`
	Stop             []string `json:"stop,omitempty" yaml:"stop"`
	EnableThinking   *bool    `json:"enable_thinking,omitempty" yaml:"enable_thinking,omitempty"`

	OpenAI   *OpenAIConfig   `json:"open_ai,omitempty" yaml:"openai"`
	Claude   *ClaudeConfig   `json:"claude,omitempty" yaml:"claude"`
	Ark      *ArkConfig      `json:"ark,omitempty" yaml:"ark"`
	Deepseek *DeepseekConfig `json:"deepseek,omitempty" yaml:"deepseek"`
	Qwen     *QwenConfig     `json:"qwen,omitempty" yaml:"qwen"`

	Custom map[string]string `json:"custom,omitempty" yaml:"custom"`
}

type OpenAIConfig struct {
	ByAzure    bool   `json:"by_azure,omitempty" yaml:"by_azure"`
	APIVersion string `json:"api_version,omitempty" yaml:"api_version"`

	ResponseFormat *openai.ChatCompletionResponseFormat `json:"response_format,omitempty" yaml:"response_format"`
}

type ClaudeConfig struct {
	ByBedrock bool `json:"by_bedrock" yaml:"by_bedrock"`
	// bedrock config
	AccessKey       string `json:"access_key,omitempty" yaml:"access_key"`
	SecretAccessKey string `json:"secret_access_key,omitempty" yaml:"secret_access_key"`
	SessionToken    string `json:"session_token,omitempty" yaml:"session_token"`
	Region          string `json:"region,omitempty" yaml:"region"`
}

type ArkConfig struct {
	Region       string            `json:"region" yaml:"region"`
	AccessKey    string            `json:"access_key,omitempty" yaml:"access_key"`
	SecretKey    string            `json:"secret_key,omitempty" yaml:"secret_key"`
	RetryTimes   *int              `json:"retry_times,omitempty" yaml:"retry_times"`
	CustomHeader map[string]string `json:"custom_header,omitempty" yaml:"custom_header"`
}

type DeepseekConfig struct {
	ResponseFormatType deepseek.ResponseFormatType `json:"response_format_type" yaml:"response_format_type"`
}

type QwenConfig struct {
	ResponseFormat *openai.ChatCompletionResponseFormat `json:"response_format,omitempty" yaml:"response_format"`
}
