package chatmodel

import (
	"time"

	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/libs/acl/openai"
)

type Config struct {
	BaseURL string        `json:"base_url,omitempty"`
	APIKey  string        `json:"api_key,omitempty"`
	Timeout time.Duration `json:"timeout,omitempty"`

	Model            string   `json:"model"`
	Temperature      *float32 `json:"temperature,omitempty"`
	FrequencyPenalty *float32 `json:"frequency_penalty,omitempty"`
	PresencePenalty  *float32 `json:"presence_penalty,omitempty"`
	MaxTokens        *int     `json:"max_tokens,omitempty"`
	TopP             *float32 `json:"top_p,omitempty"`
	TopK             *int     `json:"top_k,omitempty"`
	Stop             []string `json:"stop,omitempty"`

	OpenAI   *OpenAIConfig   `json:"open_ai,omitempty"`
	Claude   *ClaudeConfig   `json:"claude,omitempty"`
	Ark      *ArkConfig      `json:"ark,omitempty"`
	Deepseek *DeepseekConfig `json:"deepseek,omitempty"`

	Custom map[string]string `json:"custom,omitempty"`
}

type OpenAIConfig struct {
	ByAzure    bool   `json:"by_azure,omitempty"`
	APIVersion string `json:"api_version,omitempty"`

	ResponseFormat *openai.ChatCompletionResponseFormat `json:"response_format,omitempty"`
}

type ClaudeConfig struct {
	ByBedrock bool `json:"by_bedrock"`
	// bedrock config
	AccessKey       string `json:"access_key,omitempty"`
	SecretAccessKey string `json:"secret_access_key,omitempty"`
	SessionToken    string `json:"session_token,omitempty"`
	Region          string `json:"region,omitempty"`
}

type ArkConfig struct {
	Region       string            `json:"region"`
	AccessKey    string            `json:"access_key,omitempty"`
	SecretKey    string            `json:"secret_key,omitempty"`
	RetryTimes   *int              `json:"retry_times,omitempty"`
	CustomHeader map[string]string `json:"custom_header,omitempty"`
}

type DeepseekConfig struct {
	ResponseFormatType deepseek.ResponseFormatType `json:"response_format_type"`
}
