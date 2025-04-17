package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

type Service interface {
	MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error)
}
