package crossworkflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

// TODO(@fanlv): 参数引用需要修改。
type Workflow interface {
	MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error)
}

var defaultSVC *impl

type impl struct {
	DomainSVC workflow.Service
}

func InitDomainService(c workflow.Service) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() Workflow {
	return defaultSVC
}

func (i *impl) MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error) {
	return i.DomainSVC.MGetWorkflows(ctx, ids)
}

func (i *impl) WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error) {
	return i.DomainSVC.WorkflowAsModelTool(ctx, ids)
}
