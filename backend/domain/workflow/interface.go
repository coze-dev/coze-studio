package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

type Service interface {
	MGetWorkflows(ctx context.Context, ids []*entity.WorkflowIdentity) ([]*entity.Workflow, error)
	WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) ([]tool.BaseTool, error)

	ListNodeMeta(ctx context.Context, nodeTypes map[int]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error)
}
