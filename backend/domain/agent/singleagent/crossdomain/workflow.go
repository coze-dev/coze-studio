package crossdomain

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

//go:generate mockgen -destination ../../../../internal/mock/domain/agent/singleagent/workflow_mock.go --package mock -source workflow.go
type Workflow interface {
	MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error)
}
