package execute

import (
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

type EventType string

const (
	WorkflowStart       EventType = "workflow_start"
	WorkflowSuccess     EventType = "workflow_success"
	WorkflowFailed      EventType = "workflow_failed"
	WorkflowCancel      EventType = "workflow_cancel"
	WorkflowInterrupt   EventType = "workflow_interrupt"
	NodeStart           EventType = "node_start"
	NodeEnd             EventType = "node_end"
	NodeError           EventType = "node_error"
	NodeStreamingInput  EventType = "node_streaming_input"
	NodeStreamingOutput EventType = "node_streaming_output"
)

type Event struct {
	Type EventType

	*Context

	Duration time.Duration
	Input    map[string]any
	Output   map[string]any

	RawOutput map[string]any

	Err   *ErrorInfo
	Token *TokenInfo

	InterruptEvents []*entity.InterruptEvent
}

type ErrorLevel string

const (
	LevelWarn  ErrorLevel = "warn"
	LevelError ErrorLevel = "error"
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
