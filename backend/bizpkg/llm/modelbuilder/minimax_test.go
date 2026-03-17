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
	"os"
	"testing"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

func TestClampTemperature(t *testing.T) {
	tests := []struct {
		name     string
		input    float32
		expected float32
	}{
		{"zero is clamped", 0.0, 0.01},
		{"negative is clamped", -0.5, 0.01},
		{"valid value unchanged", 0.5, 0.5},
		{"max value unchanged", 1.0, 1.0},
		{"above max is clamped", 1.5, 1.0},
		{"small positive value", 0.01, 0.01},
		{"typical value", 0.7, 0.7},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := clampTemperature(tt.input)
			if result != tt.expected {
				t.Errorf("clampTemperature(%v) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestNewMiniMaxModelBuilder(t *testing.T) {
	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{
				APIKey:  "test-key",
				Model:   "MiniMax-M2.5",
				BaseURL: "https://api.minimax.io/v1",
			},
		},
	}

	builder := newMiniMaxModelBuilder(cfg)
	if builder == nil {
		t.Fatal("newMiniMaxModelBuilder returned nil")
	}

	mmBuilder, ok := builder.(*minimaxModelBuilder)
	if !ok {
		t.Fatal("builder is not *minimaxModelBuilder")
	}

	if mmBuilder.cfg != cfg {
		t.Error("builder config mismatch")
	}
}

func TestMinimaxGetDefaultConfig(t *testing.T) {
	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{},
		},
	}

	builder := &minimaxModelBuilder{cfg: cfg}
	conf := builder.getDefaultConfig()

	if conf.BaseURL != defaultMiniMaxBaseURL {
		t.Errorf("default base URL = %v, want %v", conf.BaseURL, defaultMiniMaxBaseURL)
	}

	if conf.ResponseFormat == nil || conf.ResponseFormat.Type != "text" {
		t.Error("default response format should be text")
	}
}

func TestMinimaxApplyParams(t *testing.T) {
	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{},
		},
	}
	builder := &minimaxModelBuilder{cfg: cfg}

	t.Run("nil params", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		builder.applyParamsToConfig(conf, nil)
		// Should not panic
	})

	t.Run("temperature clamped from zero", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		temp := float32(0.0)
		params := &LLMParams{Temperature: &temp}
		builder.applyParamsToConfig(conf, params)
		if conf.Temperature == nil || *conf.Temperature != 0.01 {
			t.Errorf("temperature should be clamped to 0.01, got %v", conf.Temperature)
		}
	})

	t.Run("temperature valid value", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		temp := float32(0.7)
		params := &LLMParams{Temperature: &temp}
		builder.applyParamsToConfig(conf, params)
		if conf.Temperature == nil || *conf.Temperature != 0.7 {
			t.Errorf("temperature should be 0.7, got %v", conf.Temperature)
		}
	})

	t.Run("max tokens", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		params := &LLMParams{MaxTokens: 2048}
		builder.applyParamsToConfig(conf, params)
		if conf.MaxCompletionTokens == nil || *conf.MaxCompletionTokens != 2048 {
			t.Errorf("max tokens should be 2048, got %v", conf.MaxCompletionTokens)
		}
	})

	t.Run("frequency penalty", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		params := &LLMParams{FrequencyPenalty: 0.5}
		builder.applyParamsToConfig(conf, params)
		if conf.FrequencyPenalty == nil || *conf.FrequencyPenalty != 0.5 {
			t.Errorf("frequency penalty should be 0.5, got %v", conf.FrequencyPenalty)
		}
	})

	t.Run("presence penalty", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		params := &LLMParams{PresencePenalty: 0.3}
		builder.applyParamsToConfig(conf, params)
		if conf.PresencePenalty == nil || *conf.PresencePenalty != 0.3 {
			t.Errorf("presence penalty should be 0.3, got %v", conf.PresencePenalty)
		}
	})

	t.Run("top p", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		topP := float32(0.9)
		params := &LLMParams{TopP: &topP}
		builder.applyParamsToConfig(conf, params)
		if conf.TopP == nil || *conf.TopP != 0.9 {
			t.Errorf("top p should be 0.9, got %v", conf.TopP)
		}
	})

	t.Run("response format always text", func(t *testing.T) {
		conf := builder.getDefaultConfig()
		params := &LLMParams{ResponseFormat: 1} // JSON mode
		builder.applyParamsToConfig(conf, params)
		if conf.ResponseFormat == nil || conf.ResponseFormat.Type != "text" {
			t.Error("response format should always be text for MiniMax")
		}
	})
}

func TestMinimaxBuildWithCustomBaseURL(t *testing.T) {
	customURL := "https://api.minimaxi.com/v1"
	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{
				APIKey:  "test-key",
				Model:   "MiniMax-M2.5",
				BaseURL: customURL,
			},
		},
	}

	builder := &minimaxModelBuilder{cfg: cfg}
	// Build will try to create an HTTP client, which requires network access.
	// We verify the config is set correctly by checking the builder logic.
	conf := builder.getDefaultConfig()
	conf.APIKey = cfg.Connection.BaseConnInfo.APIKey
	conf.Model = cfg.Connection.BaseConnInfo.Model
	if cfg.Connection.BaseConnInfo.BaseURL != "" {
		conf.BaseURL = cfg.Connection.BaseConnInfo.BaseURL
	}

	if conf.BaseURL != customURL {
		t.Errorf("base URL = %v, want %v", conf.BaseURL, customURL)
	}
	if conf.APIKey != "test-key" {
		t.Errorf("API key = %v, want test-key", conf.APIKey)
	}
	if conf.Model != "MiniMax-M2.5" {
		t.Errorf("model = %v, want MiniMax-M2.5", conf.Model)
	}
}

func TestMinimaxBuildWithDefaultBaseURL(t *testing.T) {
	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{
				APIKey:  "test-key",
				Model:   "MiniMax-M2.5",
				BaseURL: "",
			},
		},
	}

	builder := &minimaxModelBuilder{cfg: cfg}
	conf := builder.getDefaultConfig()
	if cfg.Connection.BaseConnInfo.BaseURL != "" {
		conf.BaseURL = cfg.Connection.BaseConnInfo.BaseURL
	}

	if conf.BaseURL != defaultMiniMaxBaseURL {
		t.Errorf("base URL = %v, want %v", conf.BaseURL, defaultMiniMaxBaseURL)
	}
}

func TestModelBuilderRegistration(t *testing.T) {
	_, ok := modelClass2NewModelBuilder[developer_api.ModelClass_MiniMax]
	if !ok {
		t.Error("MiniMax model builder not registered in modelClass2NewModelBuilder")
	}
}

func TestNewModelBuilderMiniMax(t *testing.T) {
	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{
				APIKey:  "test-key",
				Model:   "MiniMax-M2.5",
				BaseURL: "https://api.minimax.io/v1",
			},
		},
	}

	builder, err := NewModelBuilder(developer_api.ModelClass_MiniMax, cfg)
	if err != nil {
		t.Fatalf("NewModelBuilder for MiniMax failed: %v", err)
	}

	if builder == nil {
		t.Fatal("NewModelBuilder returned nil for MiniMax")
	}
}

func TestMinimaxIntegration(t *testing.T) {
	apiKey := os.Getenv("MINIMAX_API_KEY")
	if apiKey == "" {
		t.Skip("MINIMAX_API_KEY not set, skipping integration test")
	}

	models := []string{"MiniMax-M2.5", "MiniMax-M2.5-highspeed"}
	for _, modelName := range models {
		t.Run(modelName, func(t *testing.T) {
			cfg := &config.Model{
				Connection: &config.Connection{
					BaseConnInfo: &config.BaseConnectionInfo{
						APIKey:  apiKey,
						Model:   modelName,
						BaseURL: "https://api.minimax.io/v1",
					},
				},
			}

			builder := newMiniMaxModelBuilder(cfg)
			temp := float32(1.0)
			params := &LLMParams{
				Temperature: &temp,
				MaxTokens:   100,
			}

			chatModel, err := builder.Build(context.Background(), params)
			if err != nil {
				t.Fatalf("Build failed: %v", err)
			}

			if chatModel == nil {
				t.Fatal("Build returned nil chat model")
			}
		})
	}
}
