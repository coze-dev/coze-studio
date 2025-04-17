package agentflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type workflowConfig struct {
	wfInfos []*agent_common.WorkflowInfo
	wfSvr   crossdomain.Workflow
}

func newWorkflowTools(ctx context.Context, conf *workflowConfig) ([]tool.BaseTool, error) {

	wfIDs := slices.Transform(conf.wfInfos, func(a *agent_common.WorkflowInfo) *workflowEntity.WorkflowIdentity {
		return &workflowEntity.WorkflowIdentity{
			ID:      a.GetWorkflowId(),
			Version: "",
		}
	})
	return conf.wfSvr.WorkflowAsModelTool(ctx, wfIDs)
}
