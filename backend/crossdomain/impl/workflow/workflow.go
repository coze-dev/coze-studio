package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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

func (i *impl) WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) ([]tool.BaseTool, error) {
	return i.DomainSVC.WorkflowAsModelTool(ctx, policies)
}

func (i *impl) PublishWorkflow(ctx context.Context, info *vo.PublishPolicy) (err error) {
	return i.DomainSVC.Publish(ctx, info)
}

func (i *impl) DeleteWorkflow(ctx context.Context, id int64) error {
	return i.DomainSVC.Delete(ctx, &vo.DeletePolicy{
		ID: ptr.Of(id),
	})
}

func (i *impl) ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error) {
	return i.DomainSVC.ReleaseApplicationWorkflows(ctx, appID, config)
}

func (i *impl) WithResumeToolWorkflow(resumingEvent *workflowEntity.ToolInterruptEvent, resumeData string, allInterruptEvents map[string]*workflowEntity.ToolInterruptEvent) einoCompose.Option {
	return i.DomainSVC.WithResumeToolWorkflow(resumingEvent, resumeData, allInterruptEvents)
}
func (i *impl) SyncExecuteWorkflow(ctx context.Context, config vo.ExecuteConfig, input map[string]any) (*workflowEntity.WorkflowExecution, vo.TerminatePlan, error) {
	return i.DomainSVC.SyncExecute(ctx, config, input)
}
