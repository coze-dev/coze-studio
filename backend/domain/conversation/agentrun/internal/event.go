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

package internal

import (
	"context"
	"encoding/json"
	
	"github.com/cloudwego/eino/schema"

	crossDomainMessage "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
)

type Event struct {
}

func NewEvent() *Event {
	return &Event{}
}

// MessageEventHandler handles message events during agent runtime
type MessageEventHandler struct {
	messageEvent *Event
	sw           *schema.StreamWriter[*entity.AgentRunResponse]
}

// HandlerInput processes the input for the agent runtime
func (m *MessageEventHandler) HandlerInput(ctx context.Context, art *AgentRuntime) (*msgEntity.Message, error) {
	// Create input message from AgentRunMeta
	runMeta := art.GetRunMeta()
	
	// Build the message content from input metadata
	var content string
	if runMeta.Content != nil && len(runMeta.Content) > 0 {
		// For text content, get the first text item
		for _, item := range runMeta.Content {
			if item.Type == crossDomainMessage.InputTypeText {
				content = item.Text
				break
			}
		}
	}
	
	// Create schema message for model content
	schemaMsg := &schema.Message{
		Role:    schema.User,
		Content: content,
	}
	
	// Convert to JSON for ModelContent field
	modelContentBytes, err := json.Marshal(schemaMsg)
	if err != nil {
		return nil, err
	}
	
	return &msgEntity.Message{
		ID:           0, // Will be assigned by message service
		ModelContent: string(modelContentBytes),
		MessageType:  1, // Question type
		UserID:       runMeta.UserID,
	}, nil
}

// handlerErr handles error events
func (m *MessageEventHandler) handlerErr(ctx context.Context, err error) {
	if m.messageEvent != nil && m.sw != nil {
		m.messageEvent.SendErrEvent(entity.RunEventRunError, m.sw, &entity.RunError{
			Msg: err.Error(),
		})
	}
}

// handlerWfUsage handles workflow usage events
func (m *MessageEventHandler) handlerWfUsage(ctx context.Context, lastAnswerMsg *entity.ChunkMessageItem, usage interface{}) interface{} {
	// Placeholder implementation - return usage as is
	return usage
}

// handlerFinalAnswerFinish handles final answer finish events
func (m *MessageEventHandler) handlerFinalAnswerFinish(ctx context.Context, art *AgentRuntime) interface{} {
	// Placeholder implementation - return nil
	return nil
}

// handlerWfInterruptMsg handles workflow interrupt messages
func (m *MessageEventHandler) handlerWfInterruptMsg(ctx context.Context, msg interface{}, art *AgentRuntime) {
	// Placeholder implementation
}

// handlerAnswer handles answer events
func (m *MessageEventHandler) handlerAnswer(ctx context.Context, sendAnswerMsg, usage, art, preAnswerMsg interface{}) interface{} {
	// Placeholder implementation - return usage
	return usage
}

// handlerFunctionCall handles function call events
func (m *MessageEventHandler) handlerFunctionCall(ctx context.Context, chunk interface{}, art *AgentRuntime) error {
	// Placeholder implementation
	return nil
}

// handlerTooResponse handles tool response events  
func (m *MessageEventHandler) handlerTooResponse(ctx context.Context, chunk interface{}, art *AgentRuntime, preToolResponseMsg interface{}, content string) error {
	// Placeholder implementation
	return nil
}

// handlerKnowledge handles knowledge events
func (m *MessageEventHandler) handlerKnowledge(ctx context.Context, chunk interface{}, art *AgentRuntime) error {
	// Placeholder implementation
	return nil
}

// handlerSuggest handles suggest events
func (m *MessageEventHandler) handlerSuggest(ctx context.Context, chunk interface{}, art *AgentRuntime) error {
	// Placeholder implementation
	return nil
}

// handlerInterrupt handles interrupt events
func (m *MessageEventHandler) handlerInterrupt(ctx context.Context, chunk interface{}, art *AgentRuntime) error {
	// Placeholder implementation
	return nil
}

func (e *Event) buildMessageEvent(runEvent entity.RunEvent, chunkMsgItem *entity.ChunkMessageItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:            runEvent,
		ChunkMessageItem: chunkMsgItem,
	}
}

func (e *Event) buildRunEvent(runEvent entity.RunEvent, chunkRunItem *entity.ChunkRunItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:        runEvent,
		ChunkRunItem: chunkRunItem,
	}
}

func (e *Event) buildErrEvent(runEvent entity.RunEvent, err *entity.RunError) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event: runEvent,
		Error: err,
	}
}

func (e *Event) buildStreamDoneEvent() *entity.AgentRunResponse {

	return &entity.AgentRunResponse{
		Event: entity.RunEventStreamDone,
	}
}

func (e *Event) SendRunEvent(runEvent entity.RunEvent, runItem *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	resp := e.buildRunEvent(runEvent, runItem)
	sw.Send(resp, nil)
}

func (e *Event) SendMsgEvent(runEvent entity.RunEvent, messageItem *entity.ChunkMessageItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	resp := e.buildMessageEvent(runEvent, messageItem)
	sw.Send(resp, nil)
}

func (e *Event) SendErrEvent(runEvent entity.RunEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], err *entity.RunError) {
	resp := e.buildErrEvent(runEvent, err)
	sw.Send(resp, nil)
}

func (e *Event) SendStreamDoneEvent(sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	resp := e.buildStreamDoneEvent()
	sw.Send(resp, nil)
}
