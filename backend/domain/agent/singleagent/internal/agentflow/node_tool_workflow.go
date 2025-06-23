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

func newWorkflowTools(ctx context.Context, conf *workflowConfig) ([]workflow.ToolFromWorkflow, map[string]struct{}, error) {
	var policies []*vo.GetPolicy

	for _, info := range conf.wfInfos {
		id := info.GetWorkflowId()
		policies = append(policies, &vo.GetPolicy{
			ID:    id,
			QType: vo.FromLatestVersion,
		})
	}

	toolsReturnDirectly := make(map[string]struct{})

	workflowTools, err := crossworkflow.DefaultSVC().WorkflowAsModelTool(ctx, policies)

	if len(workflowTools) > 0 {
		for _, workflowTool := range workflowTools {
			if workflowTool.TerminatePlan() == vo.UseAnswerContent {
				toolInfo, err := workflowTool.Info(ctx)
				if err != nil {
					return nil, nil, err
				}
				if toolInfo == nil || toolInfo.Name == "" {
					continue
				}
				toolsReturnDirectly[toolInfo.Name] = struct{}{}
			}
		}
	}

	return workflowTools, toolsReturnDirectly, err
}
