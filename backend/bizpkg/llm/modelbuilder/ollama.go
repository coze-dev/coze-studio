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

	"github.com/cloudwego/eino-ext/components/model/ollama"
	"github.com/eino-contrib/ollama/api"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type ollamaModelBuilder struct {
	cfg *config.Model
}

func newOllamaModelBuilder(cfg *config.Model) *ollamaModelBuilder {
	return &ollamaModelBuilder{
		cfg: cfg,
	}
}

func (o *ollamaModelBuilder) getDefaultOllamaConfig() *ollama.ChatModelConfig {
	return &ollama.ChatModelConfig{
		Options: &api.Options{},
		BaseURL: "http://127.0.0.1:11434",
	}
}

func (o *ollamaModelBuilder) applyParamsToOllamaConfig(conf *ollama.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}

	if params.Temperature != nil {
		conf.Options.Temperature = *params.Temperature
	}

	if params.TopP != nil {
		conf.Options.TopP = *params.TopP
	}

	if params.TopK != nil {
		conf.Options.TopK = int(*params.TopK)
	}

	if params.FrequencyPenalty != 0 {
		conf.Options.FrequencyPenalty = params.FrequencyPenalty
	}

	if params.PresencePenalty != 0 {
		conf.Options.PresencePenalty = params.PresencePenalty
	}

	if params.EnableThinking != nil {
		conf.Thinking = &api.ThinkValue{
			Value: ptr.From(params.EnableThinking),
		}
	}
}

func (o *ollamaModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := o.cfg.Connection.BaseConnInfo

	conf := o.getDefaultOllamaConfig()
	if base.BaseURL != "" {
		conf.BaseURL = base.BaseURL
	}
	conf.Model = base.Model

	o.applyParamsToOllamaConfig(conf, params)

	return ollama.NewChatModel(ctx, conf)
}
