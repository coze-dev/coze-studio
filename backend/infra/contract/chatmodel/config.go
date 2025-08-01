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
	"time"

	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/libs/acl/openai"
	"google.golang.org/genai"
)

type Config struct {
	BaseURL string        `json:"base_url,omitempty" yaml:"base_url"`
	APIKey  string        `json:"api_key,omitempty" yaml:"api_key"`
	Timeout time.Duration `json:"timeout,omitempty" yaml:"timeout"`

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
	Gemini   *GeminiConfig   `json:"gemini,omitempty" yaml:"gemini"`

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
	BudgetTokens    *int   `json:"budget_tokens,omitempty" yaml:"budget_tokens"`
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

type GeminiConfig struct {
	Backend    genai.Backend       `json:"backend,omitempty" yaml:"backend"`
	Project    string              `json:"project,omitempty" yaml:"project"`
	Location   string              `json:"location,omitempty" yaml:"location"`
	APIVersion string              `json:"api_version,omitempty" yaml:"api_version"`
	Headers    map[string][]string `json:"headers,omitempty" yaml:"headers"`
	TimeoutMs  int64               `json:"timeout_ms,omitempty" yaml:"timeout_ms"`

	IncludeThoughts *bool  `json:"include_thoughts,omitempty" yaml:"include_thoughts"` // default true
	ThinkingBudget  *int32 `json:"thinking_budget,omitempty" yaml:"thinking_budget"`   // default nil
}
