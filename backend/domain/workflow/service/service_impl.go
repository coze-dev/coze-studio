package service

import (
	"context"
	"fmt"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type impl struct {
	idgen idgen.IDGenerator
	query *query.Query
}

var implSingleton *impl

func InitWorkflowService(idgen idgen.IDGenerator, db *gorm.DB) {
	implSingleton = &impl{
		idgen: idgen,
		query: query.Use(db),
	}
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

func (i *impl) CreateWorkflow(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error) {
	id, err := i.idgen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	wfMeta := &model.WorkflowMeta{
		ID:          id,
		Name:        wf.Name,
		Description: wf.Desc,
		IconURI:     wf.IconURI,
		Status:      1,
		ContentType: int32(wf.ContentType),
		Mode:        int32(wf.Mode),
		CreatorID:   wf.CreatorID,
		AuthorID:    wf.AuthorID,
		SpaceID:     wf.SpaceID,
	}

	if wf.Tag != nil {
		wfMeta.Tag = int32(*wf.Tag)
	}

	if wf.SourceID != nil {
		wfMeta.SourceID = *wf.SourceID
	}

	if wf.ProjectID != nil {
		wfMeta.ProjectID = *wf.ProjectID
	}

	if ref == nil {
		if err = i.query.WorkflowMeta.Create(wfMeta); err != nil {
			return 0, fmt.Errorf("create workflow meta: %w", err)
		}

		return id, nil
	}

	wfRef := &model.WorkflowReference{
		ID:               id,
		SpaceID:          wfMeta.SpaceID,
		ReferringID:      ref.ReferringID,
		ReferType:        int32(ref.ReferType),
		ReferringBizType: int32(ref.ReferringBizType),
		CreatorID:        wfMeta.CreatorID,
		Stage:            int32(entity.StageDraft),
	}

	if err = i.query.Transaction(func(tx *query.Query) error {
		if err = tx.WorkflowMeta.Create(wfMeta); err != nil {
			return fmt.Errorf("create workflow meta: %w", err)
		}
		if err = tx.WorkflowReference.Create(wfRef); err != nil {
			return fmt.Errorf("create workflow reference: %w", err)
		}
		return nil
	}); err != nil {
		return 0, err
	}

	return id, nil
}

func (i *impl) SaveWorkflow(ctx context.Context, draft *entity.Workflow) error {
	if draft.Canvas == nil {
		return fmt.Errorf("workflow canvas is nil")
	}

	c := &canvas.Canvas{}
	err := sonic.Unmarshal([]byte(*draft.Canvas), c)
	if err != nil {
		return fmt.Errorf("unmarshal workflow canvas: %w", err)
	}

	var inputParams, outputParams string
	sc, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err == nil {
		wf, err := compose.NewWorkflow(ctx, sc)
		if err == nil {
			inputs := wf.Inputs()
			outputs := wf.Outputs()
			inputParams, err = sonic.MarshalString(inputs)
			if err != nil {
				return fmt.Errorf("marshal workflow input params: %w", err)
			}
			outputParams, err = sonic.MarshalString(outputs)
			if err != nil {
				return fmt.Errorf("marshal workflow output params: %w", err)
			}
		}
	}

	d := &model.WorkflowDraft{
		ID:           draft.ID,
		Canvas:       *draft.Canvas,
		InputParams:  inputParams,
		OutputParams: outputParams,
	}

	if err = i.query.WorkflowDraft.Save(d); err != nil {
		return fmt.Errorf("save workflow draft: %w", err)
	}

	return nil
}
