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
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/gemini"
	"google.golang.org/genai"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type geminiModelBuilder struct {
	config *GeminiConfig
}

func newGeminiModelBuilder(config *GeminiConfig) *geminiModelBuilder {
	return &geminiModelBuilder{
		config: config,
	}
}

func (g *geminiModelBuilder) getDefaultGeminiConfig() *gemini.Config {
	return &gemini.Config{
		MaxTokens:   ptr.Of(4096),
		Temperature: ptr.Of(float32(0.7)),
		ThinkingConfig: &genai.ThinkingConfig{
			IncludeThoughts: true,
			ThinkingBudget:  nil,
		},
	}
}

func (g *geminiModelBuilder) getDefaultGenaiConfig() *genai.ClientConfig {
	return &genai.ClientConfig{
		HTTPOptions: genai.HTTPOptions{
			BaseURL: "https://generativelanguage.googleapis.com/",
		},
	}
}

func (g *geminiModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if g.config == nil || g.config.Gemini == nil || g.config.ClientConfig == nil {
		return nil, fmt.Errorf("config is nil")
	}

	defaultGenaiConfig := g.getDefaultGenaiConfig()
	if g.config.ClientConfig.HTTPOptions.BaseURL == "" {
		g.config.ClientConfig.HTTPOptions.BaseURL = defaultGenaiConfig.HTTPOptions.BaseURL
	}

	client, err := genai.NewClient(ctx, g.config.ClientConfig)
	if err != nil {
		return nil, err
	}

	g.config.Gemini.Client = client

	defaultConfig := g.getDefaultGeminiConfig()
	if g.config.Gemini.MaxTokens == nil {
		g.config.Gemini.MaxTokens = defaultConfig.MaxTokens
	}

	if g.config.Gemini.Temperature == nil {
		g.config.Gemini.Temperature = defaultConfig.Temperature
	}

	if g.config.Gemini.ThinkingConfig == nil {
		g.config.Gemini.ThinkingConfig = defaultConfig.ThinkingConfig
	}

	return gemini.NewChatModel(ctx, g.config.Gemini)
}
