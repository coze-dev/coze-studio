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
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
)

type Event struct {
}

func NewEvent() *Event {
	return &Event{}
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
