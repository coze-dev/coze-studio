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
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type BaseChatModel = model.BaseChatModel

type ToolCallingChatModel = model.ToolCallingChatModel

type Service interface {
	Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error)
}

func NewModelBuilder(modelClass developer_api.ModelClass, cfg *config.Model) (Service, error) {
	if cfg == nil {
		return nil, fmt.Errorf("model config is nil")
	}

	if cfg.Connection == nil {
		return nil, fmt.Errorf("model connection is nil")
	}

	if cfg.Connection.BaseConnInfo == nil {
		return nil, fmt.Errorf("model base connection is nil")
	}

	switch modelClass {
	case developer_api.ModelClass_SEED:
		return newArkModelBuilder(cfg), nil
	case developer_api.ModelClass_GPT:
		return newOpenaiModelBuilder(cfg), nil
	case developer_api.ModelClass_Claude:
		return newClaudeModelBuilder(cfg), nil
	case developer_api.ModelClass_DeekSeek:
		return newDeepseekModelBuilder(cfg), nil
	case developer_api.ModelClass_Gemini:
		return newGeminiModelBuilder(cfg), nil
	case developer_api.ModelClass_Llama:
		return newOllamaModelBuilder(cfg), nil
	case developer_api.ModelClass_QWen:
		return newQwenModelBuilder(cfg), nil
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
		logs.CtxDebugf(ctx, "model id is nil, app settings: %v", conv.DebugJsonToStr(appSettings))
		return nil, nil, fmt.Errorf("model id is nil")
	}

	params := newLLMParamsWithSettings(appSettings)

	return BuildModelByID(ctx, *appSettings.ModelId, params)
}

func buildModelWithConfParams(ctx context.Context, m *modelmgr.Model, params *LLMParams) (bcm ToolCallingChatModel, err error) {
	modelBuilder, err := NewModelBuilder(m.Provider.ModelClass, m.Model)
	if err != nil {
		return nil, fmt.Errorf("new model builder failed: %w", err)
	}

	bcm, err = modelBuilder.Build(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("build model failed: %w", err)
	}

	return bcm, nil
}
