package crossworkflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

// TODO(@fanlv): 参数引用需要修改。
type Workflow interface {
	MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error)
}

var defaultSVC Workflow

func DefaultSVC() Workflow {
	return defaultSVC
}

func SetDefaultSVC(svc Workflow) {
	defaultSVC = svc
}
