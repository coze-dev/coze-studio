package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

//go:generate  mockgen -destination ../../internal/mock/domain/workflow/service.go --package mockWorkflow -source interface.go
type Service interface {
	MGetWorkflows(ctx context.Context, ids []*entity.WorkflowIdentity) ([]*entity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) ([]tool.BaseTool, error)

	ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error)
	CreateWorkflow(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error)
	SaveWorkflow(ctx context.Context, draft *entity.Workflow) error
	DeleteWorkflow(ctx context.Context, id int64) error
	GetWorkflow(ctx context.Context, id *entity.WorkflowIdentity) (*entity.Workflow, error)
	GetWorkflowReference(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)
	AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]string) (int64, error)
}
