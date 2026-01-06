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

var modelClass2NewModelBuilder = map[developer_api.ModelClass]func(*config.Model) Service{
	developer_api.ModelClass_SEED:     newArkModelBuilder,
	developer_api.ModelClass_GPT:      newOpenaiModelBuilder,
	developer_api.ModelClass_Claude:   newClaudeModelBuilder,
	developer_api.ModelClass_DeekSeek: newDeepseekModelBuilder,
	developer_api.ModelClass_Gemini:   newGeminiModelBuilder,
	developer_api.ModelClass_Llama:    newOllamaModelBuilder,
	developer_api.ModelClass_QWen:     newQwenModelBuilder,
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

	buildFn, ok := modelClass2NewModelBuilder[modelClass]
	if !ok {
		return nil, fmt.Errorf("model class %v not supported", modelClass)
	}

	return buildFn(cfg), nil
}

func SupportProtocol(modelClass developer_api.ModelClass) bool {
	_, ok := modelClass2NewModelBuilder[modelClass]

	return ok
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
