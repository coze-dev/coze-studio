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

package execute

import (
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
)

type EventType string

const (
	WorkflowStart         EventType = "workflow_start"
	WorkflowSuccess       EventType = "workflow_success"
	WorkflowFailed        EventType = "workflow_failed"
	WorkflowCancel        EventType = "workflow_cancel"
	WorkflowInterrupt     EventType = "workflow_interrupt"
	WorkflowResume        EventType = "workflow_resume"
	NodeStart             EventType = "node_start"
	NodeEnd               EventType = "node_end"
	NodeEndStreaming      EventType = "node_end_streaming" // absolutely end, after all streaming content are sent
	NodeError             EventType = "node_error"
	NodeStreamingInput    EventType = "node_streaming_input"
	NodeStreamingOutput   EventType = "node_streaming_output"
	FunctionCall          EventType = "function_call"
	ToolResponse          EventType = "tool_response"
	ToolStreamingResponse EventType = "tool_streaming_response"
	ToolError             EventType = "tool_error"
)

type Event struct {
	Type EventType

	*Context

	Duration time.Duration
	Input    map[string]any
	Output   map[string]any

	// if the node is output_emitter or exit node with answer as terminate plan, this field will be set.
	// it contains the incremental change in the output.
	Answer    string
	StreamEnd bool

	RawOutput map[string]any

	Err   error
	Token *TokenInfo

	InterruptEvents []*entity.InterruptEvent

	functionCall *entity.FunctionCallInfo
	toolResponse *entity.ToolResponseInfo

	outputExtractor func(o map[string]any) string
	extra           *entity.NodeExtra

	done chan struct{}

	nodeCount int32
}

type TokenInfo struct {
	InputToken  int64
	OutputToken int64
	TotalToken  int64
}

func (e *Event) GetInputTokens() int64 {
	if e.Token == nil {
		return 0
	}
	return e.Token.InputToken
}

func (e *Event) GetOutputTokens() int64 {
	if e.Token == nil {
		return 0
	}
	return e.Token.OutputToken
}

func (e *Event) GetResumedEventID() int64 {
	if e.Context == nil {
		return 0
	}
	if e.Context.RootCtx.ResumeEvent == nil {
		return 0
	}
	return e.Context.RootCtx.ResumeEvent.ID
}

func (e *Event) GetFunctionCallInfo() (*entity.FunctionCallInfo, bool) {
	if e.functionCall == nil {
		return nil, false
	}
	return e.functionCall, true
}

func (e *Event) GetToolResponse() (*entity.ToolResponseInfo, bool) {
	if e.toolResponse == nil {
		return nil, false
	}
	return e.toolResponse, true
}
