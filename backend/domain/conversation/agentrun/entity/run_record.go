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

import (
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	message2 "github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal/dal/model"
)

type RunRecord = model.RunRecord

type RunRecordMeta struct {
	ID             int64           `json:"id"`
	ConversationID int64           `json:"conversation_id"`
	SectionID      int64           `json:"section_id"`
	AgentID        int64           `json:"agent_id"`
	Status         RunStatus       `json:"status"`
	Error          *RunError       `json:"error"`
	Usage          *agentrun.Usage `json:"usage"`
	Ext            string          `json:"ext"`
	CreatedAt      int64           `json:"created_at"`
	UpdatedAt      int64           `json:"updated_at"`
	ChatRequest    *string         `json:"chat_message"`
	CompletedAt    int64           `json:"completed_at"`
	FailedAt       int64           `json:"failed_at"`
	CreatorID      int64           `json:"creator_id"`
}

type ChunkRunItem = RunRecordMeta

type ChunkMessageItem struct {
	ID               int64                    `json:"id"`
	ConversationID   int64                    `json:"conversation_id"`
	SectionID        int64                    `json:"section_id"`
	RunID            int64                    `json:"run_id"`
	AgentID          int64                    `json:"agent_id"`
	Role             RoleType                 `json:"role"`
	Type             message.MessageType      `json:"type"`
	Content          string                   `json:"content"`
	ContentType      message.ContentType      `json:"content_type"`
	MessageType      message.MessageType      `json:"message_type"`
	ReplyID          int64                    `json:"reply_id"`
	Ext              map[string]string        `json:"ext"`
	ReasoningContent *string                  `json:"reasoning_content"`
	Index            int64                    `json:"index"`
	RequiredAction   *message2.RequiredAction `json:"required_action"`
	SeqID            int64                    `json:"seq_id"`
	CreatedAt        int64                    `json:"created_at"`
	UpdatedAt        int64                    `json:"updated_at"`
	IsFinish         bool                     `json:"is_finish"`
}

type RunError struct {
	Code int64  `json:"code"`
	Msg  string `json:"msg"`
}

type CustomerConfig struct {
	ModelConfig *ModelConfig `json:"model_config"`
	AgentConfig *AgentConfig `json:"agent_config"`
}

type ModelConfig struct {
	ModelId *int64 `json:"model_id,omitempty"`
}

type AgentConfig struct {
	Prompt *string `json:"prompt"`
}

type Tool = agentrun.Tool

type AnswerFinshContent struct {
	MsgType  MessageSubType `json:"msg_type"`
	Data     string         `json:"data"`
	FromUnit string         `json:"from_unit"`
}
type Data struct {
	FinishReason int32  `json:"finish_reason"`
	FinData      string `json:"fin_data"`
}

type MetaInfo struct {
	Type MetaType `json:"type"`
	Info string   `json:"info"`
}

type AgentRunMeta struct {
	ConversationID     int64                    `json:"conversation_id"`
	ConnectorID        int64                    `json:"connector_id"`
	SpaceID            int64                    `json:"space_id"`
	Scene              common.Scene             `json:"scene"`
	SectionID          int64                    `json:"section_id"`
	Name               string                   `json:"name"`
	UserID             string                   `json:"user_id"`
	CozeUID            int64                    `json:"coze_uid"`
	AgentID            int64                    `json:"agent_id"`
	ContentType        message.ContentType      `json:"content_type"`
	Content            []*message.InputMetaData `json:"content"`
	PreRetrieveTools   []*Tool                  `json:"tools"`
	IsDraft            bool                     `json:"is_draft"`
	CustomerConfig     *CustomerConfig          `json:"customer_config"`
	DisplayContent     string                   `json:"display_content"`
	CustomVariables    map[string]string        `json:"custom_variables"`
	Version            string                   `json:"version"`
	Ext                map[string]string        `json:"ext"`
	AdditionalMessages []*AdditionalMessage     `json:"additional_messages"`
	ChatflowParameters map[string]any           `json:"chatflow_parameters"`
}

type AdditionalMessage struct {
	Role        schema.RoleType          `json:"role"`
	Type        message.MessageType      `json:"type"`
	Content     []*message.InputMetaData `json:"content"`
	ContentType message.ContentType      `json:"content_type"`
	Name        *string                  `json:"name"`
	Meta        map[string]string        `json:"meta"`
}

type UpdateMeta struct {
	Status      RunStatus
	LastError   *RunError
	Usage       *agentrun.Usage
	UpdatedAt   int64
	CompletedAt int64
	FailedAt    int64
}

type AgentRunResponse struct {
	Event            RunEvent          `json:"event"`
	ChunkRunItem     *ChunkRunItem     `json:"run_record_item"`
	ChunkMessageItem *ChunkMessageItem `json:"message_item"`
	Error            *RunError         `json:"error"`
}

type AgentRespEvent struct {
	EventType message.MessageType `json:"event_type"`

	ToolMidAnswer *schema.StreamReader[*schema.Message]
	ToolAsAnswer  *schema.StreamReader[*schema.Message]
	ModelAnswer   *schema.StreamReader[*schema.Message]
	ToolsMessage  []*schema.Message
	FuncCall      *schema.Message
	Suggest       *schema.Message
	Knowledge     []*schema.Document
	Interrupt     *singleagent.InterruptInfo
	Err           error
}

type ModelAnswerEvent struct {
	Message *schema.Message
	Err     error
}

type ListRunRecordMeta struct {
	ConversationID int64  `json:"conversation_id"`
	AgentID        int64  `json:"agent_id"`
	SectionID      int64  `json:"section_id"`
	Limit          int32  `json:"limit"`
	OrderBy        string `json:"order_by"` //desc asc
	BeforeID       int64  `json:"before_id"`
	AfterID        int64  `json:"after_id"`
}

type CancelRunMeta struct {
	ConversationID int64 `json:"conversation_id"`
	RunID          int64 `json:"run_id"`
}
