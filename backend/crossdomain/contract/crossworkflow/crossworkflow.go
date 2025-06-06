package crossworkflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"

	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

// TODO(@fanlv): 参数引用需要修改。
type Workflow interface {
	MGetWorkflows(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]*workflowEntity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*workflowEntity.WorkflowIdentity) ([]tool.BaseTool, error)
	DeleteWorkflow(ctx context.Context, id int64) error
	PublishWorkflow(ctx context.Context, wfID int64, version, desc string, force bool) (err error)
	WithResumeToolWorkflow(resumingEvent *workflowEntity.ToolInterruptEvent, resumeData string,
		allInterruptEvents map[string]*workflowEntity.ToolInterruptEvent) einoCompose.Option
	ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error)
}

type ReleaseWorkflowConfig = vo.ReleaseWorkflowConfig

type ToolInterruptEvent = workflowEntity.ToolInterruptEvent

var defaultSVC Workflow

func DefaultSVC() Workflow {
	return defaultSVC
}

func SetDefaultSVC(svc Workflow) {
	defaultSVC = svc
}
