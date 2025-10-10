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
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

type BaseChatModel = model.BaseChatModel

type ToolCallingChatModel = model.ToolCallingChatModel

type Builder struct{}

type Service interface {
	Build(ctx context.Context) (ToolCallingChatModel, error)
}

func NewModelBuilder(modelClass developer_api.ModelClass, config *config.Connection) (Service, error) {
	switch modelClass {
	case developer_api.ModelClass_GPT:
		return newOpenaiModelBuilder(config.Openai), nil
	case developer_api.ModelClass_Claude:
		return newClaudeModelBuilder(config.Claude), nil
	case developer_api.ModelClass_DeekSeek:
		return newDeepseekModelBuilder(config.Deepseek), nil
	case developer_api.ModelClass_SEED:
		return newArkModelBuilder(config.Ark), nil
	case developer_api.ModelClass_Gemini:
		return newGeminiModelBuilder(config.Gemini), nil
	case developer_api.ModelClass_Llama:
		return newOllamaModelBuilder(config.Ollama), nil
	case developer_api.ModelClass_QWen:
		return newQwenModelBuilder(config.Qwen), nil
	default:
		return nil, fmt.Errorf("model class %v not supported", modelClass)
	}
}
