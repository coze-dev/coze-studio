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
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

func NewModelBuilder(modelClass developer_api.ModelClass, config *Config) (Service, error) {
	switch modelClass {
	case developer_api.ModelClass_GPT:
		return newOpenaiModelBuilder(config.OpenAI), nil
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
