package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

//go:generate  mockgen -destination ../../internal/mock/domain/workflow/interface.go --package mockWorkflow -source interface.go
type Service interface {
	MGetWorkflows(ctx context.Context, ids []*entity.WorkflowIdentity) ([]*entity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) ([]tool.BaseTool, error)
	ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error)
	CreateWorkflow(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error)
	SaveWorkflow(ctx context.Context, draft *entity.Workflow) error
	DeleteWorkflow(ctx context.Context, id int64) error
	GetWorkflow(ctx context.Context, id *entity.WorkflowIdentity) (*entity.Workflow, error)
	ValidateTree(ctx context.Context, id int64, canvasSchema string) ([]*workflow.ValidateTreeInfo, error)
	AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]string) (int64, error)
	GetExecution(ctx context.Context, wfExe *entity.WorkflowExecution) (*entity.WorkflowExecution, error)
	GetWorkflowReference(ctx context.Context, id int64) (map[int64]*entity.Workflow, error)
	GetReleasedWorkflows(ctx context.Context, ids []*entity.WorkflowIdentity) (map[int64]*entity.Workflow, error)
	ResumeWorkflow(ctx context.Context, wfExeID, eventID int64, resumeData string) error
}

type Repository interface {
	GetSubWorkflowCanvas(ctx context.Context, parent *vo.Node) (*vo.Canvas, error)
	BatchGetSubWorkflowCanvas(ctx context.Context, parents []*vo.Node) (map[string]*vo.Canvas, error)
	GenID(ctx context.Context) (int64, error)
	CreateWorkflowMeta(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error)
	CreateOrUpdateDraft(ctx context.Context, id int64, canvas, inputParams, outputParams string) error
	DeleteWorkflow(ctx context.Context, id int64) error
	GetWorkflowMeta(ctx context.Context, id int64) (*entity.Workflow, error)
	GetWorkflowVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, error)
	GetWorkflowDraft(ctx context.Context, id int64) (*vo.DraftInfo, error)
	GetWorkflowReference(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)
	CreateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) error
	UpdateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) error
	GetWorkflowExecution(ctx context.Context, id int64) (*entity.WorkflowExecution, bool, error)
	CreateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error
	UpdateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error
	GetNodeExecutionsByWfExeID(ctx context.Context, wfExeID int64) (result []*entity.NodeExecution, err error)

	GetParentWorkflowsBySubWorkflowID(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)
	GetLatestWorkflowVersion(ctx context.Context, id int64) (*vo.VersionInfo, error)
	MGetWorkflowMeta(ctx context.Context, ids ...int64) (map[int64]*entity.Workflow, error)
	MGetSubWorkflowReferences(ctx context.Context, id ...int64) (map[int64][]*entity.WorkflowReference, error)

	SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) error
	GetInterruptEvent(ctx context.Context, wfExeID int64, eventID int64) (*entity.InterruptEvent, bool, error)
	DeleteInterruptEvent(ctx context.Context, wfExeID int64, eventID int64) (bool, error)
	ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error)
}

var repositorySingleton Repository

func GetRepository() Repository {
	return repositorySingleton
}

func SetRepository(repository Repository) {
	repositorySingleton = repository
}
