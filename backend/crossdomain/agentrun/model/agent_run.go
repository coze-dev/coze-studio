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

import "github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"

type Tool struct {
	PluginID   int64                  `json:"plugin_id"`
	ToolID     int64                  `json:"tool_id"`
	Arguments  string                 `json:"arguments"`
	ToolName   string                 `json:"tool_name"`
	Type       ToolType               `json:"type"`
	PluginFrom *bot_common.PluginFrom `json:"plugin_from"`
}

type ToolType int32

const (
	ToolTypePlugin   ToolType = 2
	ToolTypeWorkflow ToolType = 1
)

type ToolsRetriever struct {
	PluginID   int64
	ToolName   string
	ToolID     int64
	Arguments  string
	Type       ToolType
	PluginFrom *bot_common.PluginFrom `json:"plugin_from"`
}

type Usage struct {
	LlmPromptTokens     int64  `json:"llm_prompt_tokens"`
	LlmCompletionTokens int64  `json:"llm_completion_tokens"`
	LlmTotalTokens      int64  `json:"llm_total_tokens"`
	WorkflowTokens      *int64 `json:"workflow_tokens,omitempty"`
	WorkflowCost        *int64 `json:"workflow_cost,omitempty"`
}
