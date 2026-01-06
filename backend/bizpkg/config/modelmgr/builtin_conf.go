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
package modelmgr

import (
	"context"
	"fmt"
	"os"
	"strings"

	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/pkg/envkey"
)

func (c *ModelConfig) GetBuiltinChatModelConfig(ctx context.Context, builtinModelID int64) (*Model, error) {
	if builtinModelID > 0 {
		return c.GetModelByID(ctx, builtinModelID)
	}

	oldKnowledgeModel := getOldKnowledgeBuiltinChatModelConfig()
	if oldKnowledgeModel == nil {
		return nil, fmt.Errorf("old knowledge model conf is nil")
	}

	return oldKnowledgeModel, nil
}

func getOldKnowledgeBuiltinChatModelConfig() *Model {
	modelClass := getKnowledgeBuiltinModelClass()
	provider, ok := GetModelProvider(modelClass)
	if !ok {
		return nil
	}

	typeStr := strings.ToUpper(os.Getenv("BUILTIN_CM_TYPE"))

	if typeStr == "" {
		return nil
	}

	baseURLKey := fmt.Sprintf("BUILTIN_CM_%s_BASE_URL", typeStr)
	apiKeyKey := fmt.Sprintf("BUILTIN_CM_%s_API_KEY", typeStr)
	modelKey := fmt.Sprintf("BUILTIN_CM_%s_MODEL", typeStr)

	return &Model{
		Model: &config.Model{
			Provider: provider,
			Connection: &config.Connection{
				BaseConnInfo: &config.BaseConnectionInfo{
					BaseURL: envkey.GetString(baseURLKey),
					Model:   envkey.GetString(modelKey),
					APIKey:  envkey.GetString(apiKeyKey),
				},
				Gemini: &config.GeminiConnInfo{
					Backend:  envkey.GetI32D("BUILTIN_CM_GEMINI_BACKEND", 1),
					Project:  envkey.GetString("BUILTIN_CM_GEMINI_PROJECT"),
					Location: envkey.GetString("BUILTIN_CM_GEMINI_LOCATION"),
				},
				Openai: &config.OpenAIConnInfo{
					ByAzure: envkey.GetBoolD("BUILTIN_CM_OPENAI_BY_AZURE", false),
				},
			},
		},
	}
}

func getKnowledgeBuiltinModelClass() developer_api.ModelClass {
	builtinChatModelTypeStr := os.Getenv("BUILTIN_CM_TYPE")
	switch builtinChatModelTypeStr {
	case "openai":
		return developer_api.ModelClass_GPT
	case "ark":
		return developer_api.ModelClass_SEED
	case "deepseek":
		return developer_api.ModelClass_DeekSeek
	case "ollama":
		return developer_api.ModelClass_Llama
	case "qwen":
		return developer_api.ModelClass_QWen
	case "gemini":
		return developer_api.ModelClass_Gemini
	default:
		return developer_api.ModelClass_SEED
	}
}
