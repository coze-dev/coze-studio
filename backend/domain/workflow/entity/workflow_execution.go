package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type WorkflowExecuteStatus workflow.WorkflowExeStatus
type NodeExecuteStatus workflow.NodeExeStatus

type WorkflowExecution struct {
	ID int64
	WorkflowIdentity
	SpaceID int64
	vo.ExecuteConfig
	ConnectorID  int64
	ConnectorUID string
	CreatedAt    time.Time
	LogID        string
	AppID        *int64
	NodeCount    int32

	Status     WorkflowExecuteStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	ErrorCode  *string
	FailReason *string
	TokenInfo  *TokenUsage
	UpdatedAt  *time.Time

	ParentNodeID           *string
	ParentNodeExecuteID    *int64
	NodeExecutions         []*NodeExecution
	RootExecutionID        int64
	CurrentResumingEventID *int64

	InterruptEvents []*InterruptEvent
}

const (
	WorkflowRunning     = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Running)
	WorkflowSuccess     = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Success)
	WorkflowFailed      = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Fail)
	WorkflowCancel      = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Cancel)
	WorkflowInterrupted = WorkflowExecuteStatus(5)
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

	Extra *NodeExtra
}

func (we *WorkflowExecution) GetBasic() *WorkflowBasic {
	return &WorkflowBasic{
		WorkflowIdentity: we.WorkflowIdentity,
		SpaceID:          we.SpaceID,
		APPID:            we.AppID,
		NodeCount:        we.NodeCount,
	}
}

type NodeExtra struct {
	CurrentSubExecuteID int64          `json:"current_sub_execute_id,omitempty"`
	ResponseExtra       *ResponseExtra `json:"response_extra,omitempty"`
	SubExecuteID        int64          `json:"subExecuteID,omitempty"` // for subworkflow node, the execute id of the sub workflow
}

type ResponseExtra struct {
	ReasoningContent string                     `json:"reasoning_content,omitempty"`
	FCCalledDetail   *FCCalledDetail            `json:"fc_called_detail,omitempty"`
	VariableSelect   []int                      `json:"variable_select,omitempty"`
	TerminalPlan     workflow.TerminatePlanType `json:"terminal_plan,omitempty"`
}

type FCCalled struct {
	Input  string `json:"input,omitempty"`
	Output string `json:"output,omitempty"`
}

type FCCalledDetail struct {
	FCCalledList []*FCCalled `json:"fc_called_list,omitempty"`
}
