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

	"github.com/cloudwego/eino-ext/components/model/openai"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type openaiModelBuilder struct {
	config *config.OpenAIConnInfo
}

func newOpenaiModelBuilder(config *config.OpenAIConnInfo) *openaiModelBuilder {
	return &openaiModelBuilder{
		config: config,
	}
}

// TODO: 从配置文件里面读取默认值
func (o *openaiModelBuilder) getDefaultConfig() *openai.ChatModelConfig {
	return &openai.ChatModelConfig{
		MaxCompletionTokens: ptr.Of(4096),
		MaxTokens:           ptr.Of(4096),
		Temperature:         ptr.Of(float32(0.7)),
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type:       "text",
			JSONSchema: nil,
		},
	}
}

func (o *openaiModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if o.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	cfg := o.getDefaultConfig()
	cfg.APIKey = o.config.APIKey
	cfg.BaseURL = o.config.BaseURL

	return openai.NewChatModel(ctx, cfg)
}
