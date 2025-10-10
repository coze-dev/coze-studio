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

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type geminiModelBuilder struct {
	config *config.GeminiConnInfo
}

func newGeminiModelBuilder(config *config.GeminiConnInfo) *geminiModelBuilder {
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
	if g.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	clientCfg := g.getDefaultGenaiConfig()
	if g.config.BaseURL != "" {
		clientCfg.HTTPOptions.BaseURL = g.config.BaseURL
	}

	clientCfg.APIKey = g.config.APIKey

	client, err := genai.NewClient(ctx, clientCfg)
	if err != nil {
		return nil, err
	}

	cfg := g.getDefaultGeminiConfig()
	cfg.Client = client
	cfg.Model = g.config.Model

	return gemini.NewChatModel(ctx, cfg)
}
