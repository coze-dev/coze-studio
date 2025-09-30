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
	"github.com/cloudwego/eino-ext/components/model/qwen"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type qwenModelBuilder struct {
	config *config.QwenConnInfo
}

func newQwenModelBuilder(config *config.QwenConnInfo) *qwenModelBuilder {
	return &qwenModelBuilder{
		config: config,
	}
}

func (q *qwenModelBuilder) getDefaultQwenConfig() *qwen.ChatModelConfig {
	return &qwen.ChatModelConfig{
		Temperature: ptr.Of(float32(0.7)),
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type:       "text",
			JSONSchema: nil,
		},
	}
}

func (q *qwenModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if q.config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	defaultQwenConfig := q.getDefaultQwenConfig()
	defaultQwenConfig.APIKey = q.config.APIKey
	defaultQwenConfig.BaseURL = q.config.BaseURL
	defaultQwenConfig.Model = q.config.Model

	return qwen.NewChatModel(ctx, defaultQwenConfig)
}
