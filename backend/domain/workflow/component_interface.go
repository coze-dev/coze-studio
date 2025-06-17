package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type Executable interface {
	SyncExecute(ctx context.Context, config vo.ExecuteConfig, input map[string]any) (*entity.WorkflowExecution, vo.TerminatePlan, error)
	AsyncExecute(ctx context.Context, config vo.ExecuteConfig, input map[string]any) (int64, error)
	AsyncExecuteNode(ctx context.Context, nodeID string, config vo.ExecuteConfig, input map[string]any) (int64, error)
	AsyncResume(ctx context.Context, req *entity.ResumeRequest, config vo.ExecuteConfig) error
	StreamExecute(ctx context.Context, config vo.ExecuteConfig, input map[string]any) (*schema.StreamReader[*entity.Message], error)
	StreamResume(ctx context.Context, req *entity.ResumeRequest, config vo.ExecuteConfig) (
		*schema.StreamReader[*entity.Message], error)

	GetExecution(ctx context.Context, wfExe *entity.WorkflowExecution, includeNodes bool) (*entity.WorkflowExecution, error)
	GetNodeExecution(ctx context.Context, exeID int64, nodeID string) (*entity.NodeExecution, *entity.NodeExecution, error)
	GetLatestTestRunInput(ctx context.Context, wfID int64, userID int64) (*entity.NodeExecution, bool, error)
	GetLatestNodeDebugInput(ctx context.Context, wfID int64, nodeID string, userID int64) (
		*entity.NodeExecution, *entity.NodeExecution, bool, error)

	Cancel(ctx context.Context, wfExeID int64, wfID, spaceID int64) error
}

type AsTool interface {
	WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) ([]tool.BaseTool, error)
	WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message])
	WithExecuteConfig(cfg vo.ExecuteConfig) compose.Option
	WithResumeToolWorkflow(resumingEvent *entity.ToolInterruptEvent, resumeData string,
		allInterruptEvents map[string]*entity.ToolInterruptEvent) compose.Option
}

type InterruptEventStore interface {
	SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) error
	GetFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error)
	UpdateFirstInterruptEvent(ctx context.Context, wfExeID int64, event *entity.InterruptEvent) error
	PopFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error)
	ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error)
}

type CancelSignalStore interface {
	EmitWorkflowCancelSignal(ctx context.Context, wfExeID int64) error
	SubscribeWorkflowCancelSignal(ctx context.Context, wfExeID int64) (<-chan *redis.Message, func(), error)
	GetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (bool, error)
}

type ExecuteHistoryStore interface {
	CreateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) error
	UpdateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution, allowedStatus []entity.WorkflowExecuteStatus) (int64, entity.WorkflowExecuteStatus, error)
	TryLockWorkflowExecution(ctx context.Context, wfExeID, resumingEventID int64) (bool, entity.WorkflowExecuteStatus, error)
	GetWorkflowExecution(ctx context.Context, id int64) (*entity.WorkflowExecution, bool, error)
	CreateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error
	UpdateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error
	CancelAllRunningNodes(ctx context.Context, wfExeID int64) error
	GetNodeExecutionsByWfExeID(ctx context.Context, wfExeID int64) (result []*entity.NodeExecution, err error)
	GetNodeExecution(ctx context.Context, wfExeID int64, nodeID string) (*entity.NodeExecution, bool, error)
	GetNodeExecutionByParent(ctx context.Context, wfExeID int64, parentNodeID string) (
		[]*entity.NodeExecution, error)
	SetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64, exeID int64) error
	GetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64) (int64, error)
	SetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64, exeID int64) error
	GetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64) (int64, error)
}

type ToolFromWorkflow interface {
	tool.BaseTool
	TerminatePlan() vo.TerminatePlan
	GetWorkflow() *entity.Workflow
}
