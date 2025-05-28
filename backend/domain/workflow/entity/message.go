package entity

import (
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type Message struct {
	*StateMessage
	*DataMessage
}

// StateMessage represents a status change for the workflow execution.
type StateMessage struct {
	ExecuteID      int64
	EventID        int64 // the resuming event ID for current execution
	SpaceID        int64
	Status         WorkflowExecuteStatus
	Usage          *TokenUsage
	LastError      *ErrorInfo
	InterruptEvent *InterruptEvent
}

type ErrorInfo struct {
	Code int
	Msg  string
}

// DataMessage represents a full or chunked message during a run that should go into message history.
type DataMessage struct {
	ExecuteID    int64 // the root execute ID for current execution
	Role         schema.RoleType
	Type         MessageType
	Content      string
	NodeID       string
	NodeTitle    string
	NodeType     NodeType
	Last         bool
	Usage        *TokenUsage
	FunctionCall *FunctionCallInfo
	ToolResponse *ToolResponseInfo
}

type MessageType string

const (
	Answer       MessageType = "answer"
	FunctionCall MessageType = "function_call"
	ToolResponse MessageType = "tool_response"
)

type FunctionInfo struct {
	Name string
	Type ToolType

	PluginID   int64
	PluginName string
	APIID      int64
	APIName    string

	WorkflowName          string
	WorkflowTerminatePlan vo.TerminatePlan
}

type FunctionCallInfo struct {
	FunctionInfo
	CallID    string
	Arguments string
}

type ToolResponseInfo struct {
	FunctionInfo
	CallID   string
	Response string
}

type ToolType string

const (
	PluginTool   ToolType = "plugin"
	WorkflowTool ToolType = "workflow"
)
