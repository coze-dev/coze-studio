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

package model

import (
	"context"

	"github.com/cloudwego/eino/components/model"

	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
)

type LLMParams struct {
	ModelName         string         `json:"modelName"`
	ModelType         int64          `json:"modelType"`
	Prompt            string         `json:"prompt"` // user prompt
	Temperature       *float64       `json:"temperature"`
	FrequencyPenalty  float64        `json:"frequencyPenalty"`
	PresencePenalty   float64        `json:"presencePenalty"`
	MaxTokens         int            `json:"maxTokens"`
	TopP              *float64       `json:"topP"`
	TopK              *int           `json:"topK"`
	EnableChatHistory bool           `json:"enableChatHistory"`
	SystemPrompt      string         `json:"systemPrompt"`
	ResponseFormat    ResponseFormat `json:"responseFormat"`
}

type ResponseFormat int64

const (
	ResponseFormatText     ResponseFormat = 0
	ResponseFormatMarkdown ResponseFormat = 1
	ResponseFormatJSON     ResponseFormat = 2
)

var ManagerImpl Manager

func GetManager() Manager {
	return ManagerImpl
}

func SetManager(m Manager) {
	ManagerImpl = m
}

//go:generate  mockgen -destination modelmock/model_mock.go --package mockmodel -source model.go
type Manager interface {
	GetModel(ctx context.Context, params *LLMParams) (model.BaseChatModel, *modelmgr.Model, error)
}
