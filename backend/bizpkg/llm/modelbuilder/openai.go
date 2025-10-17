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
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type openaiModelBuilder struct {
	base   *config.BaseConnectionInfo
	config *config.OpenAIConnInfo
}

func newOpenaiModelBuilder(base *config.BaseConnectionInfo, config *config.OpenAIConnInfo) *openaiModelBuilder {
	return &openaiModelBuilder{
		base:   base,
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

func (o *openaiModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if o.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}

	if o.config == nil {
		o.config = &config.OpenAIConnInfo{}
	}

	conf := o.getDefaultConfig()
	conf.APIKey = o.base.APIKey
	conf.APIVersion = o.config.APIVersion
	conf.ByAzure = o.config.ByAzure
	conf.BaseURL = o.base.BaseURL

	if params != nil && params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params != nil && params.MaxTokens != 0 {
		conf.MaxTokens = ptr.Of(params.MaxTokens)
	}

	if params != nil && params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params != nil && params.PresencePenalty != 0 {
		conf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

	if params != nil {
		conf.TopP = params.TopP

		if params.ResponseFormat == bot_common.ModelResponseFormat_JSON {
			conf.ResponseFormat = &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONObject,
			}
		} else {
			conf.ResponseFormat = &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeText,
			}
		}
	}

	return openai.NewChatModel(ctx, conf)
}
