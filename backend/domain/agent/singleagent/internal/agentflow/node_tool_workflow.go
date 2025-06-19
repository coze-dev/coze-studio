package agentflow

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type workflowConfig struct {
	wfInfos []*bot_common.WorkflowInfo
}

func newWorkflowTools(ctx context.Context, conf *workflowConfig) ([]workflow.ToolFromWorkflow, error) {
	var policies []*vo.GetPolicy

	for _, info := range conf.wfInfos {
		id := info.GetWorkflowId()
		policies = append(policies, &vo.GetPolicy{
			ID:    id,
			QType: vo.FromLatestVersion,
		})
	}

	return crossworkflow.DefaultSVC().WorkflowAsModelTool(ctx, policies)
}
