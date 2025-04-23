package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
)

type WorkflowExecution struct {
	ID int64
	WorkflowIdentity
	Mode         ExecuteMode
	OperatorID   int64
	ConnectorID  int64
	ConnectorUID string
	CreatedAt    time.Time
	SessionID    int64
	LogID        string

	Status     workflow.WorkflowExeStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	ErrorCode  *string
	FailReason *string
	TokenInfo  *TokenUsageAndCost
	UpdatedAt  *time.Time

	NodeExecutions []*NodeExecution
}

type ExecuteMode string

const (
	ExecuteModeDebug   ExecuteMode = "debug"
	ExecuteModeRelease ExecuteMode = "release"
)

type TokenUsageAndCost struct {
	InputTokens  int64
	OutputTokens int64
	InputCost    float64
	OutputCost   float64
	CostUnit     string
}

type NodeExecution struct {
	ID        int64
	ExecuteID int64
	NodeID    string
	NodeName  string
	NodeType  NodeType
	CreatedAt time.Time

	Status     workflow.NodeExeStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	RawOutput  *string
	ErrorInfo  *string
	ErrorLevel *string
	TokenInfo  *TokenUsageAndCost
	UpdatedAt  *time.Time

	Index int
	Items map[string]any

	SubWorkflowExecution *WorkflowExecution
	InnerNodeExecutions  []*NodeExecution
}
