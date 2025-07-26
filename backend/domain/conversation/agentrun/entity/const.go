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

const ConversationTurnsDefault int32 = 100

type RunStatus string

const (
	RunStatusCreated        RunStatus = "created"
	RunStatusInProgress     RunStatus = "in_progress"
	RunStatusCompleted      RunStatus = "completed"
	RunStatusFailed         RunStatus = "failed"
	RunStatusExpired        RunStatus = "expired"
	RunStatusCancelled      RunStatus = "cancelled"
	RunStatusRequiredAction RunStatus = "required_action"
	RunStatusDeleted        RunStatus = "deleted"
)

type RunEvent string

const (
	RunEventCreated        RunEvent = "conversation.chat.created"
	RunEventInProgress     RunEvent = "conversation.chat.in_progress"
	RunEventCompleted      RunEvent = "conversation.chat.completed"
	RunEventFailed         RunEvent = "conversation.chat.failed"
	RunEventExpired        RunEvent = "conversation.chat.expired"
	RunEventCancelled      RunEvent = "conversation.chat.cancelled"
	RunEventRequiredAction RunEvent = "conversation.chat.required_action"

	RunEventMessageDelta     RunEvent = "conversation.message.delta"
	RunEventMessageCompleted RunEvent = "conversation.message.completed"

	RunEventAck                 = "conversation.ack"
	RunEventError      RunEvent = "conversation.error"
	RunEventStreamDone RunEvent = "conversation.stream.done"
)

type ReplyType int64

const (
	ReplyTypeAnswer      ReplyType = 1
	ReplyTypeSuggest     ReplyType = 2
	ReplyTypeLLMOutput   ReplyType = 3
	ReplyTypeToolOutput  ReplyType = 4
	ReplyTypeVerbose     ReplyType = 100
	ReplyTypePlaceHolder ReplyType = 101
)

type MetaType int64

const (
	MetaTypeKnowledgeCard MetaType = 4
)

type RoleType string

const (
	RoleTypeSystem    RoleType = "system"
	RoleTypeUser      RoleType = "user"
	RoleTypeAssistant RoleType = "assistant"
	RoleTypeTool      RoleType = "tool"
)

type MessageSubType string

const (
	MessageSubTypeKnowledgeCall  MessageSubType = "knowledge_recall"
	MessageSubTypeGenerateFinish MessageSubType = "generate_answer_finish"
	MessageSubTypeInterrupt      MessageSubType = "interrupt"
)
