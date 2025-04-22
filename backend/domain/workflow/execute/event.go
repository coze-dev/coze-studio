package execute

import (
	"time"

	schema2 "github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
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
	NodeStreamIn        EventType = "node_stream_in"
	NodeStreamOut       EventType = "node_stream_out"
	NodeInterruptBefore EventType = "node_interrupt_before"
	NodeInterruptAfter  EventType = "node_interrupt_after"
	NodeInterruptWithin EventType = "node_interrupt_within"
	NodeResume          EventType = "node_resume"
)

type Event struct {
	Type          EventType
	WorkflowID    int64
	SpaceID       int64
	ExecutorID    int64
	SubExecutorID int64

	NodeKey    string
	NodeName   string
	NodeType   entity.NodeType
	NodeStatus NodeStatus

	Duration      time.Duration
	Input         map[string]any
	Output        any // either map[string]any or string
	InputStream   *schema2.StreamReader[map[string]any]
	OutputStream  *schema2.StreamReader[any] // either map[string]any or string
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

type NodeStatus string

const (
	Waiting NodeStatus = "waiting"
	Running NodeStatus = "running"
	Success NodeStatus = "success"
	Failed  NodeStatus = "failed"
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
	InputToken  int
	OutputToken int
	TotalToken  int
	InputCost   float64
	OutputCost  float64
	TotalCost   float64
}
