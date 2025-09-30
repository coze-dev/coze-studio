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
	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

func getModelProviderList() []*config.ModelProvider {
	return []*config.ModelProvider{
		{
			Name: &config.I18nText{
				ZhCn: "豆包模型",
				EnUs: "Doubao Model",
			},
			IconURI: "default_icon/doubao_v2.png",
			Description: &config.I18nText{
				ZhCn: "豆包模型家族",
				EnUs: "doubao model family",
			},
			ModelClass: developer_api.ModelClass_SEED,
		},
		{
			Name: &config.I18nText{
				ZhCn: "Claude 模型",
				EnUs: "Claude Model",
			},
			IconURI: "default_icon/claude_v2.png",
			Description: &config.I18nText{
				ZhCn: "Claude 模型家族",
				EnUs: "claude model family",
			},
			ModelClass: developer_api.ModelClass_Claude,
		},
		{
			Name: &config.I18nText{
				ZhCn: "Deepseek 模型",
				EnUs: "Deepseek Model",
			},
			IconURI: "default_icon/deepseek_v2.png",
			Description: &config.I18nText{
				ZhCn: "Deepseek 模型家族",
				EnUs: "deepseek model family",
			},
			ModelClass: developer_api.ModelClass_DeekSeek,
		},
		{
			Name: &config.I18nText{
				ZhCn: "Gemini 模型",
				EnUs: "Gemini Model",
			},
			IconURI: "default_icon/gemini_v2.png",
			Description: &config.I18nText{
				ZhCn: "Gemini 模型家族",
				EnUs: "gemini model family",
			},
			ModelClass: developer_api.ModelClass_Gemini,
		},
		{
			Name: &config.I18nText{
				ZhCn: "Ollama 模型",
				EnUs: "Ollama Model",
			},
			IconURI: "default_icon/ollama.png",
			Description: &config.I18nText{
				ZhCn: "Ollama 模型家族",
				EnUs: "ollama model family",
			},
			ModelClass: developer_api.ModelClass_Llama,
		},
		{
			Name: &config.I18nText{
				ZhCn: "OpenAI 模型",
				EnUs: "OpenAI Model",
			},
			IconURI: "default_icon/openai_v2.png",
			Description: &config.I18nText{
				ZhCn: "OpenAI 模型家族",
				EnUs: "openai model family",
			},
			ModelClass: developer_api.ModelClass_GPT,
		},
		{
			Name: &config.I18nText{
				ZhCn: "Qwen 模型",
				EnUs: "Qwen Model",
			},
			IconURI: "default_icon/qwen_v2.png",
			Description: &config.I18nText{
				ZhCn: "Qwen 模型家族",
				EnUs: "qwen model family",
			},
			ModelClass: developer_api.ModelClass_QWen,
		},
	}
}

func SupportProtocol(class developer_api.ModelClass) bool {
	_, ok := GetModelProvider(class)

	return ok
}

func GetModelProvider(class developer_api.ModelClass) (*config.ModelProvider, bool) {
	modelProviders := getModelProviderList()
	for _, modelProvider := range modelProviders {
		if modelProvider.ModelClass == class {
			return modelProvider, true
		}
	}

	return nil, false
}
