package service

import (
	"context"

	"github.com/cloudwego/eino/components/tool"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type impl struct{}

var implSingleton *impl

func InitWorkflowService() {
	implSingleton = &impl{}
}

func GetWorkflowService() workflow.Service {
	return implSingleton
}

func (i *impl) MGetWorkflows(ctx context.Context, ids []*entity.WorkflowIdentity) ([]*entity.Workflow, error) {
	//TODO implement me
	panic("implement me")
}

func (i *impl) WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) ([]tool.BaseTool, error) {
	//TODO implement me
	panic("implement me")
}

func (i *impl) ListNodeMeta(ctx context.Context, nodeTypes map[nodes.NodeType]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error) {
	// Initialize result maps
	nodeMetaMap := make(map[string][]*entity.NodeTypeMeta)
	pluginNodeMetaMap := make(map[string][]*entity.PluginNodeMeta)
	pluginCategoryMetaMap := make(map[string][]*entity.PluginCategoryMeta)

	// Helper function to check if a type should be included based on the filter
	shouldInclude := func(nodeType nodes.NodeType) bool {
		if nodeTypes == nil || len(nodeTypes) == 0 {
			return true // No filter, include all
		}
		_, ok := nodeTypes[nodeType]
		return ok
	}

	// Process standard node types
	for _, meta := range nodeTypeMetas {
		if shouldInclude(meta.Type) {
			category := meta.Category
			nodeMetaMap[category] = append(nodeMetaMap[category], meta)
		}
	}

	// Process plugin node types
	for _, meta := range pluginNodeMetas {
		if shouldInclude(meta.NodeType) {
			category := meta.Category
			pluginNodeMetaMap[category] = append(pluginNodeMetaMap[category], meta)
		}
	}

	// Process plugin category node types
	for _, meta := range pluginCategoryMetas {
		if shouldInclude(meta.NodeType) {
			category := meta.Category
			pluginCategoryMetaMap[category] = append(pluginCategoryMetaMap[category], meta)
		}
	}

	return nodeMetaMap, pluginNodeMetaMap, pluginCategoryMetaMap, nil
}
