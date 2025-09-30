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

	"github.com/cloudwego/eino-ext/components/model/ollama"
	"github.com/ollama/ollama/api"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
)

type ollamaModelBuilder struct {
	base   *config.BaseConnectionInfo
	config *config.OllamaConnInfo
}

func newOllamaModelBuilder(base *config.BaseConnectionInfo, config *config.OllamaConnInfo) *ollamaModelBuilder {
	return &ollamaModelBuilder{
		config: config,
	}
}

func (o *ollamaModelBuilder) getDefaultOllamaConfig() *ollama.ChatModelConfig {
	return &ollama.ChatModelConfig{
		BaseURL: "http://127.0.0.1:11434",
		Options: &api.Options{
			Temperature: 0.7,
			TopP:        0.95,
			TopK:        20,
		},
	}
}

func (o *ollamaModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if o.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}
	if o.config == nil {
		o.config = &config.OllamaConnInfo{}
	}

	conf := o.getDefaultOllamaConfig()
	conf.BaseURL = o.base.BaseURL
	conf.Model = o.base.Model

	if params != nil && params.Temperature != nil {
		conf.Options.Temperature = *params.Temperature
	}

	if params != nil && params.TopP != nil {
		conf.Options.TopP = *params.TopP
	}

	if params != nil && params.TopK != nil {
		conf.Options.TopK = int(*params.TopK)
	}

	if params != nil && params.FrequencyPenalty != 0 {
		conf.Options.FrequencyPenalty = params.FrequencyPenalty
	}

	if params != nil && params.PresencePenalty != 0 {
		conf.Options.PresencePenalty = params.PresencePenalty
	}

	if params != nil && params.EnableThinking != nil {
		conf.Thinking = params.EnableThinking
	}

	return ollama.NewChatModel(ctx, conf)
}
