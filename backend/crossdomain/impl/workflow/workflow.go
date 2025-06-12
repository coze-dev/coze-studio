package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
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

func (i *impl) PublishWorkflow(ctx context.Context, wfID int64, version, desc string, force bool) (err error) {
	return i.DomainSVC.PublishWorkflow(ctx, wfID, version, desc, force)
}

func (i *impl) DeleteWorkflow(ctx context.Context, id int64) error {
	return i.DomainSVC.DeleteWorkflow(ctx, id)
}

func (i *impl) ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error) {
	return i.DomainSVC.ReleaseApplicationWorkflows(ctx, appID, config)
}

func (i *impl) WithResumeToolWorkflow(resumingEvent *workflowEntity.ToolInterruptEvent, resumeData string, allInterruptEvents map[string]*workflowEntity.ToolInterruptEvent) einoCompose.Option {
	return i.DomainSVC.WithResumeToolWorkflow(resumingEvent, resumeData, allInterruptEvents)
}
func (i *impl) SyncExecuteWorkflow(ctx context.Context, id *workflowEntity.WorkflowIdentity, input map[string]any, config vo.ExecuteConfig) (*workflowEntity.WorkflowExecution, vo.TerminatePlan, error) {
	return i.DomainSVC.SyncExecuteWorkflow(ctx, id, input, config)
}
