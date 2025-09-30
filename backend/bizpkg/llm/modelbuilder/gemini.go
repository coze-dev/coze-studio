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
	base   *config.BaseConnectionInfo
	config *config.GeminiConnInfo
}

func newGeminiModelBuilder(base *config.BaseConnectionInfo, config *config.GeminiConnInfo) *geminiModelBuilder {
	return &geminiModelBuilder{
		base:   base,
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

func (g *geminiModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if g.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}
	if g.config == nil {
		g.config = &config.GeminiConnInfo{}
	}

	clientCfg := g.getDefaultGenaiConfig()
	if g.base.BaseURL != "" {
		clientCfg.HTTPOptions.BaseURL = g.base.BaseURL
	}

	clientCfg.APIKey = g.base.APIKey
	clientCfg.Backend = genai.Backend(g.config.Backend)
	clientCfg.Project = g.config.Project
	clientCfg.Location = g.config.Location

	client, err := genai.NewClient(ctx, clientCfg)
	if err != nil {
		return nil, err
	}

	conf := g.getDefaultGeminiConfig()
	conf.Client = client
	conf.Model = g.base.Model

	if params != nil && params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params != nil && params.MaxTokens != 0 {
		conf.MaxTokens = ptr.Of(params.MaxTokens)
	}

	if params != nil {
		conf.TopP = params.TopP
		conf.TopK = params.TopK
	}

	if params != nil && params.EnableThinking != nil {
		conf.ThinkingConfig = &genai.ThinkingConfig{
			IncludeThoughts: *params.EnableThinking,
			ThinkingBudget:  nil,
		}
	}

	return gemini.NewChatModel(ctx, conf)
}
