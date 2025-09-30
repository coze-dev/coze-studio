/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package modelbuilder

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/model"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	bizConf "github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
)

type BaseChatModel = model.BaseChatModel

type ToolCallingChatModel = model.ToolCallingChatModel

type Service interface {
	Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error)
}

func NewModelBuilder(modelClass developer_api.ModelClass, config *config.Connection) (Service, error) {
	switch modelClass {
	case developer_api.ModelClass_GPT:
		return newOpenaiModelBuilder(config.BaseConnInfo, config.Openai), nil
	case developer_api.ModelClass_Claude:
		return newClaudeModelBuilder(config.BaseConnInfo, config.Claude), nil
	case developer_api.ModelClass_DeekSeek:
		return newDeepseekModelBuilder(config.BaseConnInfo, config.Deepseek), nil
	case developer_api.ModelClass_SEED:
		return newArkModelBuilder(config.BaseConnInfo, config.Ark), nil
	case developer_api.ModelClass_Gemini:
		return newGeminiModelBuilder(config.BaseConnInfo, config.Gemini), nil
	case developer_api.ModelClass_Llama:
		return newOllamaModelBuilder(config.BaseConnInfo, config.Ollama), nil
	case developer_api.ModelClass_QWen:
		return newQwenModelBuilder(config.BaseConnInfo, config.Qwen), nil
	default:
		return nil, fmt.Errorf("model class %v not supported", modelClass)
	}
}

func SupportProtocol(modelClass developer_api.ModelClass) bool {
	if modelClass == developer_api.ModelClass_GPT ||
		modelClass == developer_api.ModelClass_Claude ||
		modelClass == developer_api.ModelClass_DeekSeek ||
		modelClass == developer_api.ModelClass_SEED ||
		modelClass == developer_api.ModelClass_Gemini ||
		modelClass == developer_api.ModelClass_Llama ||
		modelClass == developer_api.ModelClass_QWen {
		return true
	}
	return false
}

// BuildModelWithConf for create model scene, params is nil
func BuildModelWithConf(ctx context.Context, m *modelmgr.Model) (bcm ToolCallingChatModel, err error) {
	return buildModelWithConfParams(ctx, m, nil)
}

func BuildModelByID(ctx context.Context, modelID int64, params *LLMParams) (bcm ToolCallingChatModel, info *modelmgr.Model, err error) {
	m, err := bizConf.ModelConf().GetModelByID(ctx, modelID)
	if err != nil {
		return nil, nil, fmt.Errorf("get model by id failed: %w", err)
	}

	bcm, err = buildModelWithConfParams(ctx, m, params)
	if err != nil {
		return nil, nil, fmt.Errorf("build model failed: %w", err)
	}

	return bcm, m, nil
}

func BuildModelBySettings(ctx context.Context, appSettings *bot_common.ModelInfo) (bcm ToolCallingChatModel, info *modelmgr.Model, err error) {
	if appSettings == nil {
		return nil, nil, fmt.Errorf("model settings is nil")
	}

	if appSettings.ModelId == nil {
		return nil, nil, fmt.Errorf("model id is nil")
	}

	m, err := bizConf.ModelConf().GetModelByID(ctx, appSettings.GetModelId())
	if err != nil {
		return nil, nil, fmt.Errorf("get model by id failed: %w", err)
	}

	params := newLLMParamsWithSettings(appSettings)

	bcm, err = buildModelWithConfParams(ctx, m, params)
	if err != nil {
		return nil, nil, fmt.Errorf("build model failed: %w", err)
	}

	return bcm, m, nil
}

func buildModelWithConfParams(ctx context.Context, m *modelmgr.Model, params *LLMParams) (bcm ToolCallingChatModel, err error) {
	modelBuilder, err := NewModelBuilder(m.Provider.ModelClass, m.Connection)
	if err != nil {
		return nil, fmt.Errorf("new model builder failed: %w", err)
	}

	bcm, err = modelBuilder.Build(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("build model failed: %w", err)
	}

	return bcm, nil
}
