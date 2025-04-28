package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type WorkflowExecuteStatus workflow.WorkflowExeStatus
type NodeExecuteStatus workflow.NodeExeStatus

type WorkflowExecution struct {
	ID int64
	WorkflowIdentity
	Mode         ExecuteMode
	OperatorID   int64
	ConnectorID  int64
	ConnectorUID string
	CreatedAt    time.Time
	LogID        string
	ProjectID    *int64
	NodeCount    int32

	Status     WorkflowExecuteStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	ErrorCode  *string
	FailReason *string
	TokenInfo  *TokenUsageAndCost
	UpdatedAt  *time.Time

	NodeExecutions  []*NodeExecution
	RootExecutionID int64
}

type ExecuteMode string

const (
	ExecuteModeDebug   ExecuteMode = "debug"
	ExecuteModeRelease ExecuteMode = "release"
)

const (
	WorkflowRunning = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Running)
	WorkflowSuccess = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Success)
	WorkflowFailed  = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Fail)
	WorkflowCancel  = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Cancel)
)

const (
	NodeRunning = NodeExecuteStatus(workflow.NodeExeStatus_Running)
	NodeSuccess = NodeExecuteStatus(workflow.NodeExeStatus_Success)
	NodeFailed  = NodeExecuteStatus(workflow.NodeExeStatus_Fail)
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
	NodeType  nodes.NodeType
	CreatedAt time.Time

	Status     NodeExecuteStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	RawOutput  *string
	ErrorInfo  *string
	ErrorLevel *string
	TokenInfo  *TokenUsageAndCost
	UpdatedAt  *time.Time

	Index int
	Items *string

	SubWorkflowExecution *WorkflowExecution
	IndexedExecutions    []*NodeExecution
}
