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

	"github.com/cloudwego/eino-ext/components/model/deepseek"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
)

type deepseekModelBuilder struct {
	cfg *config.Model
}

func newDeepseekModelBuilder(cfg *config.Model) Service {
	return &deepseekModelBuilder{
		cfg: cfg,
	}
}

func (d *deepseekModelBuilder) getDefaultDeepseekConfig() *deepseek.ChatModelConfig {
	return &deepseek.ChatModelConfig{}
}

func (d *deepseekModelBuilder) applyParamsToChatModelConfig(conf *deepseek.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}

	if params.Temperature != nil {
		conf.Temperature = *params.Temperature
	}

	if params.MaxTokens != 0 {
		conf.MaxTokens = params.MaxTokens
	}

	if params.TopP != nil {
		conf.TopP = *params.TopP
	}

	if params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = params.FrequencyPenalty
	}

	if params.PresencePenalty != 0 {
		conf.PresencePenalty = params.PresencePenalty
	}

	if params.ResponseFormat == bot_common.ModelResponseFormat_JSON {
		conf.ResponseFormatType = deepseek.ResponseFormatTypeJSONObject
	} else {
		conf.ResponseFormatType = deepseek.ResponseFormatTypeText
	}
}

func (d *deepseekModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := d.cfg.Connection.BaseConnInfo

	conf := d.getDefaultDeepseekConfig()
	conf.APIKey = base.APIKey
	conf.Model = base.Model
	if base.BaseURL != "" {
		conf.BaseURL = base.BaseURL
	}

	d.applyParamsToChatModelConfig(conf, params)

	return deepseek.NewChatModel(ctx, conf)
}
