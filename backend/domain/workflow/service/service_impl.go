package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	workflow2 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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
		DeletedAt:   gorm.DeletedAt{Valid: false},
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
		DeletedAt:        gorm.DeletedAt{Valid: false},
	}

	if err = i.query.Transaction(func(tx *query.Query) error {
		if err = tx.WorkflowMeta.Create(wfMeta); err != nil {
			return fmt.Errorf("create workflow meta: %w", err)
		}
		if err = tx.WorkflowReference.WithContext(ctx).Create(wfRef); err != nil {
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

	if err = i.query.WorkflowDraft.WithContext(ctx).Save(d); err != nil {
		return fmt.Errorf("save workflow draft: %w", err)
	}

	return nil
}

func (i *impl) DeleteWorkflow(ctx context.Context, id int64) error {
	return i.query.Transaction(func(tx *query.Query) error {
		// Delete from workflow_meta
		_, err := tx.WorkflowMeta.WithContext(ctx).Where(tx.WorkflowMeta.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow meta: %w", err)
		}

		_, err = tx.WorkflowDraft.WithContext(ctx).Where(tx.WorkflowDraft.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow draft: %w", err)
		}

		_, err = tx.WorkflowVersion.WithContext(ctx).Where(tx.WorkflowVersion.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow versions: %w", err)
		}

		_, err = tx.WorkflowReference.WithContext(ctx).Where(tx.WorkflowReference.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow references: %w", err)
		}

		_, err = tx.WorkflowReference.WithContext(ctx).Where(tx.WorkflowReference.ReferringID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete incoming workflow references: %w", err)
		}

		return nil
	})
}

func (i *impl) GetWorkflow(ctx context.Context, id *entity.WorkflowIdentity) (*entity.Workflow, error) {
	// 1. Get workflow meta
	meta, err := i.query.WorkflowMeta.WithContext(ctx).Where(i.query.WorkflowMeta.ID.Eq(id.ID)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow meta not found for ID %d: %w", id.ID, err)
		}
		return nil, fmt.Errorf("failed to get workflow meta for ID %d: %w", id.ID, err)
	}

	// Initialize the result entity
	wf := &entity.Workflow{
		WorkflowIdentity: *id,
		Name:             meta.Name,
		Desc:             meta.Description,
		IconURI:          meta.IconURI,
		ContentType:      entity.ContentType(meta.ContentType),
		Mode:             entity.Mode(meta.Mode),
		CreatorID:        meta.CreatorID,
		AuthorID:         meta.AuthorID,
		SpaceID:          meta.SpaceID,
		CreatedAt:        time.UnixMilli(meta.CreatedAt),
	}
	if meta.Tag != 0 {
		tag := entity.Tag(meta.Tag)
		wf.Tag = &tag
	}
	if meta.SourceID != 0 {
		wf.SourceID = &meta.SourceID
	}
	if meta.ProjectID != 0 {
		wf.ProjectID = &meta.ProjectID
	}
	if meta.UpdatedAt > 0 {
		wf.UpdatedAt = ptr.Of(time.UnixMilli(meta.UpdatedAt))
	}

	var inputParamsStr, outputParamsStr string

	// 2. Check if a specific version is requested
	if id.Version != "" {
		// Get from workflow_version
		version, err := i.query.WorkflowVersion.WithContext(ctx).
			Where(i.query.WorkflowVersion.ID.Eq(id.ID), i.query.WorkflowVersion.Version.Eq(id.Version)).
			First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("workflow version %s not found for ID %d: %w", id.Version, id.ID, err)
			}
			return nil, fmt.Errorf("failed to get workflow version %s for ID %d: %w", id.Version, id.ID, err)
		}
		wf.Canvas = &version.Canvas
		inputParamsStr = version.InputParams
		outputParamsStr = version.OutputParams
		wf.Version = version.Version
		wf.VersionDesc = version.VersionDescription
		wf.DevStatus = workflow2.WorkFlowDevStatus_HadSubmit
	} else {
		// Get from workflow_draft
		draft, err := i.query.WorkflowDraft.WithContext(ctx).Where(i.query.WorkflowDraft.ID.Eq(id.ID)).First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("workflow draft not found for ID %d: %w", id.ID, err)
			}
			return nil, fmt.Errorf("failed to get workflow draft for ID %d: %w", id.ID, err)
		}

		wf.Canvas = &draft.Canvas
		inputParamsStr = draft.InputParams
		outputParamsStr = draft.OutputParams
		wf.DevStatus = workflow2.WorkFlowDevStatus_CanNotSubmit // TODO: check if the draft is ready for submission
	}

	// 3. Unmarshal parameters if they exist
	if inputParamsStr != "" {
		input := map[string]*entity.TypeInfo{}
		err = sonic.UnmarshalString(inputParamsStr, &input)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal input params for workflow %d: %w", id.ID, err)
		}
		wf.InputParams = input
	}
	if outputParamsStr != "" {
		output := map[string]*entity.TypeInfo{}
		err = sonic.UnmarshalString(outputParamsStr, &output)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal output params for workflow %d: %w", id.ID, err)
		}
		wf.OutputParams = output
	}

	return wf, nil
}

func (i *impl) GetWorkflowReference(ctx context.Context, id int64) ([]*entity.WorkflowReference, error) {
	// Query workflow_reference table for records matching the ID
	refs, err := i.query.WorkflowReference.WithContext(ctx).Where(i.query.WorkflowReference.ID.Eq(id)).Find()
	if err != nil {
		// Don't treat RecordNotFound as an error, just return an empty slice
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return []*entity.WorkflowReference{}, nil
		}
		return nil, fmt.Errorf("failed to query workflow references for ID %d: %w", id, err)
	}

	// Convert model objects to entity objects
	result := make([]*entity.WorkflowReference, 0, len(refs))
	for _, ref := range refs {
		result = append(result, &entity.WorkflowReference{
			ID:               ref.ID,
			SpaceID:          ref.SpaceID,
			ReferringID:      ref.ReferringID,
			ReferType:        entity.ReferType(ref.ReferType),
			ReferringBizType: entity.ReferringBizType(ref.ReferringBizType),
			CreatorID:        ref.CreatorID,
			Stage:            entity.Stage(ref.Stage),
			CreatedAt:        time.UnixMilli(ref.CreatedAt),
			UpdatedAt:        ptr.Of(time.UnixMilli(ref.UpdatedAt)),
		})
	}

	return result, nil
}

// AsyncExecuteWorkflow executes the specified workflow asynchronously, returning the execution ID before the execution starts.
func (i *impl) AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]any) (int64, error) {
	wfEntity, err := i.GetWorkflow(ctx, id) // TODO: decide whether to get the canvas or get the expanded workflow schema
	if err != nil {
		return 0, err
	}

	var c *canvas.Canvas
	if err = sonic.UnmarshalString(*wfEntity.Canvas, c); err != nil {
		return 0, fmt.Errorf("failed to unmarshal canvas: %w", err)
	}

	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err != nil {
		return 0, fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, einoCompose.WithGraphName(fmt.Sprintf("%d", wfEntity.ID)))
	if err != nil {
		return 0, fmt.Errorf("failed to create workflow: %w", err)
	}

	eventChan := make(chan *execute.Event)

	opts := []einoCompose.Option{
		einoCompose.WithCallbacks(execute.NewWorkflowHandler(wfEntity.ID, eventChan)),
	}

	// TODO: unify loop and batch options
	// TODO: support checkpoint
	// TODO: verify sub workflow
	for key := range workflowSC.GetAllNodes() {
		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, einoCompose.WithCallbacks(execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			if parent.Type == nodes.NodeTypeLoop {
				opts = append(opts, einoCompose.WithLambdaOption(
					loop.WithOptsForInner(
						einoCompose.WithCallbacks(
							execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))).
					DesignateNode(string(parent.Key)))
			} else if parent.Type == nodes.NodeTypeBatch {
				opts = append(opts, einoCompose.WithLambdaOption(
					batch.WithOptsForInner(
						einoCompose.WithCallbacks(
							execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))).
					DesignateNode(string(parent.Key)))
			}
		}
	}

	executeID, err := i.idgen.GenID(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to generate workflow execute ID: %w", err)
	}

	exeContext := &execute.Context{
		SpaceID:      wfEntity.SpaceID,
		WorkflowID:   wfEntity.ID,
		ExecuteID:    executeID,
		SubExecuteID: executeID,
	}

	ctx, err = execute.PrepareExecuteContext(ctx, exeContext, nil)

	wf.Run(ctx, input, opts...)

	go func() {
		// consumes events from eventChan and update database as we go
		for {
			event := <-eventChan
			switch event.Type {
			case execute.WorkflowStart:
				wfExec := &model.WorkflowExecution{
					ID:              event.SubExecuteID,
					WorkflowID:      event.WorkflowID,
					Version:         id.Version,
					SpaceID:         event.SpaceID,
					Mode:            0, // TODO: how to know whether it's a debug run or release run? Version alone is not sufficient.
					OperatorID:      0, // TODO: fill operator information
					Status:          int32(entity.WorkflowRunning),
					Input:           mustMarshalToString(event.Input),
					RootExecutionID: exeContext.ExecuteID,
					ParentNodeID:    event.NodeKey,
				}
				if err = i.query.WorkflowExecution.WithContext(ctx).Create(wfExec); err != nil {
					logs.Error("failed to save workflow execution: %v", err)
				}
			case execute.WorkflowSuccess:
				wfExec := &model.WorkflowExecution{
					ID:           event.SubExecuteID,
					Duration:     event.Duration.Microseconds(),
					Status:       int32(entity.WorkflowSuccess),
					InputTokens:  event.GetInputTokens(), // TODO: how to aggregate the input and output tokens from all nodes
					OutputTokens: event.GetOutputTokens(),
					InputCost:    event.GetInputCost(),
					OutputCost:   event.GetOutputCost(),
					CostUnit:     "", // TODO: decide on the unit of the cost
				}
				if event.Output != nil {
					wfExec.Output = mustMarshalToString(event.Output)
				}
			case execute.WorkflowFailed:
			case execute.NodeStart:
			case execute.NodeEnd:
			case execute.NodeError:
			default:
				panic("unimplemented event type: " + event.Type)
			}
		}
	}()

	return executeID, nil
}

func mustMarshalToString(m map[string]any) string {
	b, err := sonic.MarshalString(m)
	if err != nil {
		panic(err)
	}
	return b
}
