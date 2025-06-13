package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

//go:generate mockgen -destination ../../internal/mock/domain/workflow/interface.go --package mockWorkflow -source interface.go
type Service interface {
	MGetWorkflows(ctx context.Context, ids []*entity.WorkflowIdentity) ([]*entity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) ([]tool.BaseTool, error)
	ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error)
	CreateWorkflow(ctx context.Context, wf *entity.Workflow) (int64, error)
	SaveWorkflow(ctx context.Context, draft *entity.Workflow) error
	DeleteWorkflow(ctx context.Context, id int64) error
	GetWorkflowDraft(ctx context.Context, id int64) (*entity.Workflow, error)
	GetWorkflowVersion(ctx context.Context, wfe *entity.WorkflowIdentity) (*entity.Workflow, error)
	GetWorkflowLatestVersion(ctx context.Context, id int64) (*entity.Workflow, error)
	ValidateTree(ctx context.Context, id int64, validateConfig vo.ValidateTreeConfig) ([]*workflow.ValidateTreeInfo, error)
	SyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]any, config vo.ExecuteConfig) (
		*entity.WorkflowExecution, vo.TerminatePlan, error)
	AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]any, config vo.ExecuteConfig) (int64, *entity.WorkflowBasic, error)
	AsyncExecuteNode(ctx context.Context, id *entity.WorkflowIdentity, nodeID string, input map[string]any, config vo.ExecuteConfig) (int64, error)
	GetExecution(ctx context.Context, wfExe *entity.WorkflowExecution, includeNodes bool) (*entity.WorkflowExecution, error)
	GetNodeExecution(ctx context.Context, exeID int64, nodeID string) (*entity.NodeExecution, *entity.NodeExecution, error)
	GetLatestTestRunInput(ctx context.Context, wfID int64, userID int64) (*entity.NodeExecution, bool, error)
	GetLatestNodeDebugInput(ctx context.Context, wfID int64, nodeID string, userID int64) (
		*entity.NodeExecution, *entity.NodeExecution, bool, error)
	GetWorkflowReference(ctx context.Context, id int64) (map[int64]*entity.Workflow, error)
	AsyncResumeWorkflow(ctx context.Context, req *entity.ResumeRequest, config vo.ExecuteConfig) error
	StreamExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]any, config vo.ExecuteConfig) (
		*schema.StreamReader[*entity.Message], error)
	StreamResumeWorkflow(ctx context.Context, req *entity.ResumeRequest, config vo.ExecuteConfig) (
		*schema.StreamReader[*entity.Message], error)
	CancelWorkflow(ctx context.Context, wfExeID int64, wfID, spaceID int64) error
	QueryWorkflowNodeTypes(ctx context.Context, wfID int64) (map[string]*vo.NodeProperty, error)

	Publish(ctx context.Context, info *vo.CreateVersionInfo) (err error)

	UpdateWorkflowMeta(ctx context.Context, wf *entity.Workflow) (err error)
	ListWorkflow(ctx context.Context, spaceID int64, page *vo.Page, queryOption *vo.QueryOption) ([]*entity.Workflow, error)
	ListWorkflowAsToolData(ctx context.Context, spaceID int64, queryInfo *vo.QueryToolInfoOption) ([]*vo.WorkFlowAsToolInfo, error)
	MGetWorkflowDetailInfo(ctx context.Context, ids []*entity.WorkflowIdentity) ([]*entity.Workflow, error)
	WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message])
	WithExecuteConfig(cfg vo.ExecuteConfig) compose.Option
	WithResumeToolWorkflow(resumingEvent *entity.ToolInterruptEvent, resumeData string,
		allInterruptEvents map[string]*entity.ToolInterruptEvent) compose.Option
	CopyWorkflow(ctx context.Context, spaceID int64, workflowID int64) (int64, error)
	ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error)
	CheckWorkflowsExistByAppID(ctx context.Context, appID int64) (bool, error)
	BatchDeleteWorkflow(ctx context.Context, ids []int64) error
	DeleteWorkflowsByAppID(ctx context.Context, appID int64) error
}

type Repository interface {
	GetSubWorkflowCanvas(ctx context.Context, parent *vo.Node) (*vo.Canvas, error)
	MGetWorkflowCanvas(ctx context.Context, entities []*entity.WorkflowIdentity) (map[int64]*vo.Canvas, error)
	GenID(ctx context.Context) (int64, error)
	CreateWorkflowMeta(ctx context.Context, wf *entity.Workflow) (int64, error)

	CreateWorkflowVersion(ctx context.Context, wid int64, v *vo.VersionInfo) (int64, error)
	Publish(ctx context.Context, id int64, info *vo.VersionInfo) (err error)

	CreateOrUpdateDraft(ctx context.Context, id int64, canvas, inputParams, outputParams string, resetTestRun bool,
		commitID string) error
	DeleteWorkflow(ctx context.Context, id int64) error
	BatchDeleteWorkflow(ctx context.Context, ids []int64) error

	GetWorkflowMeta(ctx context.Context, id int64) (*entity.Workflow, error)
	GetWorkflowMetaV2(ctx context.Context, id int64) (*entity.WorkflowMeta, error)

	UpdateWorkflowMeta(ctx context.Context, wf *entity.Workflow) error
	GetWorkflowVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, error)

	GetWorkflowDraft(ctx context.Context, id int64) (*vo.DraftInfo, error)
	DraftV2(ctx context.Context, id int64, commitID string) (*vo.DraftInfo, error)

	GetWorkflowReference(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)

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
	UpdateWorkflowDraftTestRunSuccess(ctx context.Context, id int64) error

	GetParentWorkflowsBySubWorkflowID(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)
	GetLatestWorkflowVersion(ctx context.Context, id int64) (*vo.VersionInfo, error)
	MGetWorkflowMeta(ctx context.Context, ids ...int64) (map[int64]*entity.Workflow, error)
	MGetSubWorkflowReferences(ctx context.Context, id ...int64) (map[int64][]*entity.WorkflowReference, error)
	MGetWorkflowDraft(ctx context.Context, ids []int64) (map[int64]*vo.DraftInfo, error)
	ListWorkflowMeta(ctx context.Context, spaceID int64, page *vo.Page, queryOption *vo.QueryOption) ([]*entity.Workflow, error)

	SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) error
	GetFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error)
	UpdateFirstInterruptEvent(ctx context.Context, wfExeID int64, event *entity.InterruptEvent) error
	PopFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error)
	ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error)

	EmitWorkflowCancelSignal(ctx context.Context, wfExeID int64) error
	SubscribeWorkflowCancelSignal(ctx context.Context, wfExeID int64) (<-chan *redis.Message, func(), error)
	GetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (bool, error)
	WorkflowAsTool(ctx context.Context, wfID entity.WorkflowIdentity, wfToolConfig vo.WorkflowToolConfig) (ToolFromWorkflow, error)
	CopyWorkflow(ctx context.Context, spaceID int64, workflowID int64) (*entity.Workflow, error)
	SetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64, exeID int64) error
	GetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64) (int64, error)
	SetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64, exeID int64) error
	GetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64) (int64, error)

	GetDraftWorkflowsByAppID(ctx context.Context, AppID int64) (map[int64]*vo.DraftInfo, map[int64]string, error)
	BatchPublishWorkflows(ctx context.Context, workflows map[int64]*vo.VersionInfo) error
	HasWorkflow(ctx context.Context, appID int64) (bool, error)
	GetWorkflowIDsByAppId(ctx context.Context, appID int64) (es []int64, err error)

	compose.CheckPointStore
}

type ToolFromWorkflow interface {
	tool.BaseTool
	TerminatePlan() vo.TerminatePlan
	GetWorkflow() *entity.Workflow
}

var repositorySingleton Repository

func GetRepository() Repository {
	return repositorySingleton
}

func SetRepository(repository Repository) {
	repositorySingleton = repository
}
