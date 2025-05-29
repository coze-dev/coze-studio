package execute

import (
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
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

	Duration  time.Duration
	Input     map[string]any
	Output    map[string]any
	Answer    string // if the node is output_emitter or exit node with answer as terminate plan, this field will be set
	StreamEnd bool

	RawOutput map[string]any // TODO: fill this when needed

	Err   *ErrorInfo
	Token *TokenInfo

	InterruptEvents []*entity.InterruptEvent

	functionCall *entity.FunctionCallInfo
	toolResponse *entity.ToolResponseInfo
}

type ErrorLevel string

const (
	LevelWarn   ErrorLevel = "warn"
	LevelError  ErrorLevel = "error"
	LevelCancel ErrorLevel = "pending" // TODO: this 'pending' will be changed to 'cancel' or similar in the near future
)

type ErrorInfo struct {
	Err   error
	Level ErrorLevel
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
