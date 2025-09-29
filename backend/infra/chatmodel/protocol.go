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

package chatmodel

import "github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"

type Protocol string

const (
	ProtocolOpenAI   Protocol = "openai"
	ProtocolClaude   Protocol = "claude"
	ProtocolDeepseek Protocol = "deepseek"
	ProtocolGemini   Protocol = "gemini"
	ProtocolArk      Protocol = "ark"
	ProtocolOllama   Protocol = "ollama"
	ProtocolQwen     Protocol = "qwen"
	ProtocolErnie    Protocol = "ernie"
)

func (p Protocol) TOModelClass() developer_api.ModelClass {
	switch p {
	case ProtocolArk:
		return developer_api.ModelClass_SEED
	case ProtocolOpenAI:
		return developer_api.ModelClass_GPT
	case ProtocolDeepseek:
		return developer_api.ModelClass_DeekSeek
	case ProtocolClaude:
		return developer_api.ModelClass_Claude
	case ProtocolGemini:
		return developer_api.ModelClass_Gemini
	case ProtocolOllama:
		return developer_api.ModelClass_Llama
	case ProtocolQwen:
		return developer_api.ModelClass_QWen
	case ProtocolErnie:
		return developer_api.ModelClass_Ernie
	default:
		return developer_api.ModelClass_Other
	}
}
