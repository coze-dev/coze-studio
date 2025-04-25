package execute

import (
	"time"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type EventType string

const (
	WorkflowStart       EventType = "workflow_start"
	WorkflowSuccess     EventType = "workflow_success"
	WorkflowFailed      EventType = "workflow_failed"
	WorkflowCancel      EventType = "workflow_cancel"
	WorkflowInterrupt   EventType = "workflow_interrupt"
	WorkflowResume      EventType = "workflow_resume"
	NodeStart           EventType = "node_start"
	NodeEnd             EventType = "node_end"
	NodeError           EventType = "node_error"
	NodeInterruptBefore EventType = "node_interrupt_before"
	NodeInterruptAfter  EventType = "node_interrupt_after"
	NodeInterruptWithin EventType = "node_interrupt_within"
	NodeResume          EventType = "node_resume"
	NodeStreamEnd       EventType = "node_stream_end" // node end stream finished emitting and got the final token count
)

type Event struct {
	Type EventType

	*Context

	NodeKey  string
	NodeName string
	NodeType nodes.NodeType

	Duration      time.Duration
	Input         map[string]any
	Output        map[string]any
	InputStream   *schema.StreamReader[map[string]any]
	OutputStream  *schema.StreamReader[map[string]any]
	InterruptData map[string]any
	RawOutput     map[string]any

	Err   *ErrorInfo
	Batch *BatchInfo
	Token *TokenInfo
}

type ErrorLevel string

const (
	LevelWarn  ErrorLevel = "warn"
	LevelError ErrorLevel = "error"
)

type BatchInfo struct {
	Index int
	Items map[string]any
}

type ErrorInfo struct {
	Err   error
	Level ErrorLevel
}

type TokenInfo struct {
	InputToken  int64
	OutputToken int64
	TotalToken  int64
	InputCost   float64
	OutputCost  float64
	TotalCost   float64
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

func (e *Event) GetInputCost() float64 {
	return e.Token.InputCost
}

func (e *Event) GetOutputCost() float64 {
	return e.Token.OutputCost
}
