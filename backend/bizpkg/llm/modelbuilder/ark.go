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

	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/volcengine/volcengine-go-sdk/service/arkruntime/model"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type arkModelBuilder struct {
	base   *config.BaseConnectionInfo
	config *config.ArkConnInfo
}

func newArkModelBuilder(base *config.BaseConnectionInfo, config *config.ArkConnInfo) *arkModelBuilder {
	return &arkModelBuilder{
		base:   base,
		config: config,
	}
}

func (b *arkModelBuilder) getDefaultConfig() *ark.ChatModelConfig {
	return &ark.ChatModelConfig{
		Temperature: ptr.Of(float32(0.5)),
	}
}

func (b *arkModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	if b.base == nil {
		return nil, fmt.Errorf("base connection info is nil")
	}
	if b.config == nil {
		b.config = &config.ArkConnInfo{}
	}

	conf := b.getDefaultConfig()
	conf.APIKey = b.base.APIKey
	conf.Model = b.base.Model

	if len(b.config.Region) > 0 {
		conf.Region = b.config.Region
	}

	if b.base.BaseURL != "" {
		conf.BaseURL = b.base.BaseURL
	}

	if b.config.Region != "" {
		conf.Region = b.config.Region
	}

	if params != nil && params.Temperature != nil {
		conf.Temperature = ptr.Of(*params.Temperature)
	}

	if params != nil && params.MaxTokens != 0 {
		conf.MaxTokens = ptr.Of(params.MaxTokens)
	}

	if params != nil {
		conf.TopP = params.TopP
	}

	if params != nil && params.FrequencyPenalty != 0 {
		conf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params != nil && params.PresencePenalty != 0 {
		conf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

	if params != nil && params.EnableThinking != nil {
		arkThinkingType := ternary.IFElse(*params.EnableThinking, model.ThinkingTypeEnabled, model.ThinkingTypeDisabled)
		conf.Thinking = &model.Thinking{
			Type: arkThinkingType,
		}
	}

	logs.CtxDebugf(ctx, "build ark model with config: %v", conv.DebugJsonToStr(conf))

	return ark.NewChatModel(ctx, conf)
}
