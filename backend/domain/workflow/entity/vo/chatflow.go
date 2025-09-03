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

package vo

import "github.com/cloudwego/eino/schema"

type ChatFlowEvent string

const (
	ChatFlowCreated          ChatFlowEvent = "conversation.chat.created"
	ChatFlowInProgress       ChatFlowEvent = "conversation.chat.in_progress"
	ChatFlowCompleted        ChatFlowEvent = "conversation.chat.completed"
	ChatFlowFailed           ChatFlowEvent = "conversation.chat.failed"
	ChatFlowRequiresAction   ChatFlowEvent = "conversation.chat.requires_action"
	ChatFlowError            ChatFlowEvent = "error"
	ChatFlowDone             ChatFlowEvent = "done"
	ChatFlowMessageDelta     ChatFlowEvent = "conversation.message.delta"
	ChatFlowMessageCompleted ChatFlowEvent = "conversation.message.completed"
)

const (
	ConversationNameKey = "CONVERSATION_NAME"
	UserInputKey        = "USER_INPUT"
)

type Usage struct {
	TokenCount   *int32 `form:"token_count" json:"token_count,omitempty"`
	OutputTokens *int32 `form:"output_count" json:"output_count,omitempty"`
	InputTokens  *int32 `form:"input_count" json:"input_count,omitempty"`
}

type Status string

const (
	Created        Status = "created"
	InProgress     Status = "in_progress"
	Completed      Status = "completed"
	Failed         Status = "failed"
	RequiresAction Status = "requires_action"
	Canceled       Status = "canceled"
)

type ChatFlowDetail struct {
	ID             string `json:"id,omitempty"`
	ConversationID string `json:"conversation_id,omitempty"`
	BotID          string `json:"bot_id,omitempty"`
	Status         Status `json:"status,omitempty"`
	Usage          *Usage `json:"usage,omitempty"`
	ExecuteID      string `json:"execute_id,omitempty"`
	SectionID      string `json:"section_id"`
}

type MessageDetail struct {
	ID             string `json:"id"`
	ChatID         string `json:"chat_id"`
	ConversationID string `json:"conversation_id"`
	BotID          string `json:"bot_id"`
	Role           string `json:"role"`
	Type           string `json:"type"`
	Content        string `json:"content"`
	ContentType    string `json:"content_type"`
	SectionID      string `json:"section_id"`
}

type ErrorDetail struct {
	Code     string `form:"code,required" json:"code,required"`
	Msg      string `form:"msg,required" json:"msg,required"`
	DebugUrl string `form:"debug_url" json:"debug_url,omitempty"`
}

type SuggestInfo struct {
	UserInput    *schema.Message `json:"user_input,omitempty"`
	AnswerInput  *schema.Message `json:"answer,omitempty"`
	PersonaInput *string         `json:"persona_input,omitempty"`
}
