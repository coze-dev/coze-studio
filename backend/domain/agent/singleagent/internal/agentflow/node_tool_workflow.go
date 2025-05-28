package agentflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/crossdomain/crossworkflow"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type workflowConfig struct {
	wfInfos []*bot_common.WorkflowInfo
}

func newWorkflowTools(ctx context.Context, conf *workflowConfig) ([]tool.BaseTool, error) {
	wfIDs := slices.Transform(conf.wfInfos, func(a *bot_common.WorkflowInfo) *workflowEntity.WorkflowIdentity {
		return &workflowEntity.WorkflowIdentity{
			ID:      a.GetWorkflowId(),
			Version: "",
		}
	})
	return crossworkflow.DefaultSVC().WorkflowAsModelTool(ctx, wfIDs)
}
