package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

var defaultSVC crossworkflow.Workflow

type impl struct {
	DomainSVC workflow.Service
}

func InitDomainService(c workflow.Service) crossworkflow.Workflow {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i *impl) MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error) {
	return i.DomainSVC.MGetWorkflows(ctx, ids)
}

func (i *impl) WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error) {
	return i.DomainSVC.WorkflowAsModelTool(ctx, ids)
}
