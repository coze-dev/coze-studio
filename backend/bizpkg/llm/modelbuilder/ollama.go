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
	config *config.OllamaConnInfo
}

func newOllamaModelBuilder(config *config.OllamaConnInfo) *ollamaModelBuilder {
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

func (o *ollamaModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if o.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	cfg := o.getDefaultOllamaConfig()
	cfg.BaseURL = o.config.BaseURL

	return ollama.NewChatModel(ctx, cfg)
}
