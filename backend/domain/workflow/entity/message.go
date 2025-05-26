package entity

import (
	"github.com/cloudwego/eino/schema"
)

type Message struct {
	*StateMessage
	*DataMessage
}

// StateMessage represents a status change for the workflow execution.
type StateMessage struct {
	ExecuteID      int64
	EventID        int64 // the resuming event ID for current execution
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
	Role      schema.RoleType
	Type      MessageType
	Content   string
	NodeID    string
	NodeTitle string
	NodeType  NodeType
	Last      bool
}

type MessageType string

const (
	Answer       MessageType = "answer"
	FunctionCall MessageType = "function_call"
	ToolResponse MessageType = "tool_response"
)

type FunctionCallInfo struct {
	Name       string
	Arguments  string
	PluginID   int64
	PluginName string
	APIID      int64
	APIName    string
	Type       ToolType
}

type ToolType string

const (
	PluginTool   ToolType = "plugin"
	WorkflowTool ToolType = "workflow"
)
