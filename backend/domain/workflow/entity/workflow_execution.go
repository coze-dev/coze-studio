package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
)

type WorkflowExecuteStatus workflow.WorkflowExeStatus
type NodeExecuteStatus workflow.NodeExeStatus

type WorkflowExecution struct {
	ID int64
	WorkflowIdentity
	SpaceID      int64
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
	TokenInfo  *TokenUsage
	UpdatedAt  *time.Time

	ParentNodeID        *string
	ParentNodeExecuteID *int64
	NodeExecutions      []*NodeExecution
	RootExecutionID     int64
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

type TokenUsage struct {
	InputTokens  int64
	OutputTokens int64
}

type NodeExecution struct {
	ID        int64
	ExecuteID int64
	NodeID    string
	NodeName  string
	NodeType  NodeType
	CreatedAt time.Time

	Status     NodeExecuteStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	RawOutput  *string
	ErrorInfo  *string
	ErrorLevel *string
	TokenInfo  *TokenUsage
	UpdatedAt  *time.Time

	Index int
	Items *string

	ParentNodeID         *string
	SubWorkflowExecution *WorkflowExecution
	IndexedExecutions    []*NodeExecution
}
