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

	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/volcengine/volcengine-go-sdk/service/arkruntime/model"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type arkModelBuilder struct {
	cfg *config.Model
}

func newArkModelBuilder(cfg *config.Model) Service {
	return &arkModelBuilder{
		cfg: cfg,
	}
}

func (b *arkModelBuilder) getDefaultConfig() *ark.ChatModelConfig {
	return &ark.ChatModelConfig{}
}

func (b *arkModelBuilder) applyParamsToChatModelConfig(chatModelConf *ark.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}

	chatModelConf.TopP = params.TopP

	if params.Temperature != nil {
		chatModelConf.Temperature = ptr.Of(*params.Temperature)
	}

	if params.MaxTokens != 0 {
		chatModelConf.MaxTokens = ptr.Of(params.MaxTokens)
	}

	if params.FrequencyPenalty != 0 {
		chatModelConf.FrequencyPenalty = ptr.Of(params.FrequencyPenalty)
	}

	if params.PresencePenalty != 0 {
		chatModelConf.PresencePenalty = ptr.Of(params.PresencePenalty)
	}

	if params.EnableThinking != nil {
		arkThinkingType := ternary.IFElse(*params.EnableThinking, model.ThinkingTypeEnabled, model.ThinkingTypeDisabled)
		chatModelConf.Thinking = &model.Thinking{
			Type: arkThinkingType,
		}
	}
}

func (b *arkModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := b.cfg.Connection.BaseConnInfo

	chatModelConf := b.getDefaultConfig()
	chatModelConf.APIKey = base.APIKey
	chatModelConf.Model = base.Model
	if base.BaseURL != "" {
		chatModelConf.BaseURL = base.BaseURL
	}

	switch base.ThinkingType {
	case config.ThinkingType_Enable:
		chatModelConf.Thinking = &model.Thinking{
			Type: model.ThinkingTypeEnabled,
		}
	case config.ThinkingType_Disable:
		chatModelConf.Thinking = &model.Thinking{
			Type: model.ThinkingTypeDisabled,
		}
	case config.ThinkingType_Auto:
		chatModelConf.Thinking = &model.Thinking{
			Type: model.ThinkingTypeAuto,
		}
	}

	arkConn := b.cfg.Connection.Ark
	if arkConn != nil {
		chatModelConf.Region = arkConn.Region
	}

	b.applyParamsToChatModelConfig(chatModelConf, params)

	logs.CtxDebugf(ctx, "build ark model with config: %v", conv.DebugJsonToStr(chatModelConf))

	return ark.NewChatModel(ctx, chatModelConf)
}
