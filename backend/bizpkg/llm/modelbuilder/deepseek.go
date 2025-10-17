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

	"github.com/cloudwego/eino-ext/components/model/deepseek"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
)

type deepseekModelBuilder struct {
	base   *config.BaseConnectionInfo
	config *config.DeepseekConnInfo
}

func newDeepseekModelBuilder(base *config.BaseConnectionInfo, config *config.DeepseekConnInfo) *deepseekModelBuilder {
	return &deepseekModelBuilder{
		config: config,
	}
}

func (d *deepseekModelBuilder) getDefaultDeepseekConfig() *deepseek.ChatModelConfig {
	return &deepseek.ChatModelConfig{
		MaxTokens: 4096,
	}
}

func (d *deepseekModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if d.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}
	if d.config == nil {
		d.config = &config.DeepseekConnInfo{}
	}

	conf := d.getDefaultDeepseekConfig()
	conf.APIKey = d.base.APIKey
	conf.Model = d.base.Model
	conf.BaseURL = d.base.BaseURL

	if d.base.BaseURL != "" {
		conf.BaseURL = d.base.BaseURL
	}

	if params != nil && params.Temperature != nil {
		conf.Temperature = *params.Temperature
	}

	if params != nil && params.MaxTokens != 0 {
		conf.MaxTokens = params.MaxTokens
	}

	if params != nil && params.TopP != nil {
		conf.TopP = *params.TopP
	}

	if params != nil && params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = params.FrequencyPenalty
	}

	if params != nil && params.PresencePenalty != 0 {
		conf.PresencePenalty = params.PresencePenalty
	}

	if params != nil {
		if params.ResponseFormat == bot_common.ModelResponseFormat_JSON {
			conf.ResponseFormatType = deepseek.ResponseFormatTypeJSONObject
		} else {
			conf.ResponseFormatType = deepseek.ResponseFormatTypeText
		}
	}

	return deepseek.NewChatModel(ctx, conf)
}
