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

	"github.com/cloudwego/eino-ext/components/model/openai"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type openaiModelBuilder struct {
	cfg *config.Model
}

func newOpenaiModelBuilder(cfg *config.Model) Service {
	return &openaiModelBuilder{
		cfg: cfg,
	}
}

func (o *openaiModelBuilder) getDefaultConfig() *openai.ChatModelConfig {
	return &openai.ChatModelConfig{
		MaxCompletionTokens: ptr.Of(4096),
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type:       "text",
			JSONSchema: nil,
		},
	}
}

func (o *openaiModelBuilder) applyParamsToOpenaiConfig(conf *openai.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}

	if params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params.MaxTokens != 0 {
		conf.MaxCompletionTokens = ptr.Of(params.MaxTokens)
	}

	if params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params.PresencePenalty != 0 {
		conf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

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

func (o *openaiModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := o.cfg.Connection.BaseConnInfo

	conf := o.getDefaultConfig()
	conf.APIKey = base.APIKey
	conf.Model = base.Model

	if base.BaseURL != "" {
		conf.BaseURL = base.BaseURL
	}

	if o.cfg.Connection.Openai != nil {
		conf.APIVersion = o.cfg.Connection.Openai.APIVersion
		conf.ByAzure = o.cfg.Connection.Openai.ByAzure
	}

	o.applyParamsToOpenaiConfig(conf, params)

	return openai.NewChatModel(ctx, conf)
}
