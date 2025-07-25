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

package entity

type MessageExtKey string

const (
	MessageExtKeyInputTokens         MessageExtKey = "input_tokens"
	MessageExtKeyOutputTokens        MessageExtKey = "output_tokens"
	MessageExtKeyToken               MessageExtKey = "token"
	MessageExtKeyPluginStatus        MessageExtKey = "plugin_status"
	MessageExtKeyTimeCost            MessageExtKey = "time_cost"
	MessageExtKeyWorkflowTokens      MessageExtKey = "workflow_tokens"
	MessageExtKeyBotState            MessageExtKey = "bot_state"
	MessageExtKeyPluginRequest       MessageExtKey = "plugin_request"
	MessageExtKeyToolName            MessageExtKey = "tool_name"
	MessageExtKeyPlugin              MessageExtKey = "plugin"
	MessageExtKeyMockHitInfo         MessageExtKey = "mock_hit_info"
	MessageExtKeyMessageTitle        MessageExtKey = "message_title"
	MessageExtKeyStreamPluginRunning MessageExtKey = "stream_plugin_running"
	MessageExtKeyExecuteDisplayName  MessageExtKey = "execute_display_name"
	MessageExtKeyTaskType            MessageExtKey = "task_type"
	MessageExtKeyCallID              MessageExtKey = "call_id"
	ExtKeyResumeInfo                 MessageExtKey = "resume_info"
	ExtKeyBreakPoint                 MessageExtKey = "break_point"
	ExtKeyToolCallsIDs               MessageExtKey = "tool_calls_ids"
	ExtKeyRequiresAction             MessageExtKey = "requires_action"
)

type BotStateExt struct {
	BotID     string `json:"bot_id"`
	AgentName string `json:"agent_name"`
	AgentID   string `json:"agent_id"`
	Awaiting  string `json:"awaiting"`
}

type UsageExt struct {
	TotalCount   int64 `json:"total_count"`
	InputTokens  int64 `json:"input_tokens"`
	OutputTokens int64 `json:"output_tokens"`
}
