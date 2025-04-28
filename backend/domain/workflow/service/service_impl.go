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
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
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
func (i *impl) AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]string) (int64, error) {
	wfEntity, err := i.GetWorkflow(ctx, id) // TODO: decide whether to get the canvas or get the expanded workflow schema
	if err != nil {
		return 0, err
	}

	c := &canvas.Canvas{}
	if err = sonic.UnmarshalString(*wfEntity.Canvas, c); err != nil {
		fmt.Println("unmarshal err: ", err)
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

	convertedInput, err := convertInputs(input, wf.Inputs())
	if err != nil {
		return 0, fmt.Errorf("failed to convert inputs: %w", err)
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

	ctx, err = execute.PrepareRootExeCtx(ctx, id.ID, wfEntity.SpaceID, executeID,
		int32(len(workflowSC.GetAllNodes())), i.idgen)

	wf.Run(ctx, convertedInput, opts...)

	go func() {
		// consumes events from eventChan and update database as we go
		for {
			event := <-eventChan
			switch event.Type {
			case execute.WorkflowStart:
				exeID := event.RootCtx.RootExecuteID
				wfID := event.RootCtx.WorkflowID
				parentNodeID := ""
				parentNodeExecuteID := int64(0)
				nodeCount := event.RootCtx.NodeCount
				if event.SubWorkflowCtx != nil {
					exeID = event.SubExecuteID
					wfID = event.SubWorkflowID
					parentNodeID = string(event.SubWorkflowCtx.SubWorkflowNodeKey)
					parentNodeExecuteID = event.SubWorkflowCtx.SubWorkflowNodeExecuteID
					nodeCount = event.SubWorkflowCtx.NodeCount
				}

				wfExec := &model.WorkflowExecution{
					ID:              exeID,
					WorkflowID:      wfID,
					Version:         id.Version,
					SpaceID:         event.SpaceID,
					Mode:            0, // TODO: how to know whether it's a debug run or release run? Version alone is not sufficient.
					OperatorID:      0, // TODO: fill operator information
					Status:          int32(entity.WorkflowRunning),
					Input:           mustMarshalToString(event.Input),
					RootExecutionID: event.RootExecuteID,
					ParentNodeID:    parentNodeID,
					ProjectID:       ptr.FromOrDefault(wfEntity.ProjectID, 0),
					NodeCount:       nodeCount,
				}
				if err = i.query.WorkflowExecution.WithContext(ctx).Create(wfExec); err != nil {
					logs.Error("failed to save workflow execution: %v", err)
				}
				if wfExec.ParentNodeID != "" {
					// update the parent node execution's sub execute id
					if _, err = i.query.NodeExecution.WithContext(ctx).Where(i.query.NodeExecution.ID.Eq(parentNodeExecuteID)).
						UpdateColumn(i.query.NodeExecution.SubExecuteID, wfExec.ID); err != nil {
						logs.Error("failed to update parent node execution: %v", err)
					}
				}
			case execute.WorkflowSuccess:
				exeID := event.RootCtx.RootExecuteID
				if event.SubWorkflowCtx != nil {
					exeID = event.SubExecuteID
				}
				wfExec := &model.WorkflowExecution{
					ID:           exeID,
					Duration:     event.Duration.Milliseconds(),
					Status:       int32(entity.WorkflowSuccess),
					Output:       mustMarshalToString(event.Output),
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				}

				if _, err = i.query.WorkflowExecution.WithContext(ctx).Where(i.query.WorkflowExecution.ID.Eq(wfExec.ID)).Updates(wfExec); err != nil {
					logs.Error("failed to save workflow execution when successful: %v", err)
				}
			case execute.WorkflowFailed:
				exeID := event.RootCtx.RootExecuteID
				if event.SubWorkflowCtx != nil {
					exeID = event.SubExecuteID
				}
				wfExec := &model.WorkflowExecution{
					ID:           exeID,
					Duration:     event.Duration.Milliseconds(),
					Status:       int32(entity.WorkflowFailed),
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
					ErrorCode:    event.Err.Err.Error(), // TODO: where can I get the error codes?
					FailReason:   event.Err.Err.Error(),
				}

				if _, err = i.query.WorkflowExecution.WithContext(ctx).Where(i.query.WorkflowExecution.ID.Eq(wfExec.ID)).Updates(wfExec); err != nil {
					logs.Error("failed to save workflow execution when failed: %v", err)
				}
			case execute.NodeStart:
				wfExeID := event.RootCtx.RootExecuteID
				if event.SubWorkflowCtx != nil {
					wfExeID = event.SubExecuteID
				}
				nodeExec := &model.NodeExecution{
					ID:        event.NodeExecuteID,
					ExecuteID: wfExeID,
					NodeID:    string(event.NodeKey),
					NodeName:  event.NodeName,
					NodeType:  string(event.NodeType),
					Status:    int32(entity.NodeRunning),
					Input:     mustMarshalToString(event.Input),
				}
				if event.BatchInfo != nil {
					nodeExec.CompositeNodeIndex = int64(event.BatchInfo.Index)
					nodeExec.CompositeNodeItems = mustMarshalToString(event.BatchInfo.Items)
					nodeExec.ParentNodeID = string(event.BatchInfo.CompositeNodeKey)
				}
				if err = i.query.NodeExecution.WithContext(ctx).Create(nodeExec); err != nil {
					logs.Error("failed to create node execution: %v", err)
				}
			case execute.NodeEnd:
				nodeExec := &model.NodeExecution{
					ID:           event.NodeExecuteID,
					Status:       int32(entity.NodeSuccess),
					Output:       mustMarshalToString(event.Output),
					RawOutput:    mustMarshalToString(event.RawOutput),
					Duration:     event.Duration.Milliseconds(),
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				}
				if _, err = i.query.NodeExecution.WithContext(ctx).Where(i.query.NodeExecution.ID.Eq(nodeExec.ID)).Updates(nodeExec); err != nil {
					logs.Error("failed to save node execution: %v", err)
				}
			case execute.NodeStreamingOutput:
				nodeExec := &model.NodeExecution{
					ID:     event.NodeExecuteID,
					Output: mustMarshalToString(event.Output),
				}
				if _, err = i.query.NodeExecution.WithContext(ctx).Where(i.query.NodeExecution.ID.Eq(nodeExec.ID)).Updates(nodeExec); err != nil {
					logs.Error("failed to save node execution: %v", err)
				}
			case execute.NodeError:
				nodeExec := &model.NodeExecution{
					ID:           event.NodeExecuteID,
					Status:       int32(entity.NodeFailed),
					ErrorInfo:    event.Err.Err.Error(),
					ErrorLevel:   string(execute.LevelError),
					Duration:     event.Duration.Milliseconds(),
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				}
				if _, err = i.query.NodeExecution.WithContext(ctx).Where(i.query.NodeExecution.ID.Eq(nodeExec.ID)).Updates(nodeExec); err != nil {
					logs.Error("failed to save node execution: %v", err)
				}
			default:
				panic("unimplemented event type: " + event.Type)
			}
		}
	}()

	return executeID, nil
}

func mustMarshalToString(m map[string]any) string {
	if len(m) == 0 {
		return ""
	}

	b, err := sonic.MarshalString(m)
	if err != nil {
		panic(err)
	}
	return b
}

func (i *impl) GetExecution(ctx context.Context, wfExe *entity.WorkflowExecution) (*entity.WorkflowExecution, error) {
	wfExeID := wfExe.ID
	wfID := wfExe.WorkflowIdentity.ID
	version := wfExe.WorkflowIdentity.Version
	rootExeID := wfExe.RootExecutionID

	wfExeEntity := &entity.WorkflowExecution{
		ID: wfExeID,
		WorkflowIdentity: entity.WorkflowIdentity{
			ID:      wfID,
			Version: version,
		},
		RootExecutionID: rootExeID,
	}

	// query the execution info
	rootExes, err := i.query.WorkflowExecution.WithContext(ctx).
		Where(i.query.WorkflowExecution.ID.Eq(wfExeID), i.query.WorkflowExecution.WorkflowID.Eq(wfID),
			i.query.WorkflowExecution.Version.Eq(version)).
		Find()
	if err != nil {
		return nil, fmt.Errorf("failed to find workflow execution: %v", err)
	}

	if len(rootExes) == 0 {
		return &entity.WorkflowExecution{
			ID: wfExeID,
			WorkflowIdentity: entity.WorkflowIdentity{
				ID:      wfID,
				Version: version,
			},
			RootExecutionID: rootExeID,
			Status:          entity.WorkflowRunning,
		}, nil
	}

	rootExe := rootExes[0]

	wfExeEntity.Mode = entity.ExecuteMode(rootExe.Mode)
	wfExeEntity.OperatorID = rootExe.OperatorID
	wfExeEntity.ConnectorID = rootExe.ConnectorID
	wfExeEntity.ConnectorUID = rootExe.ConnectorUID
	wfExeEntity.LogID = rootExe.LogID
	wfExeEntity.CreatedAt = time.UnixMilli(rootExe.CreatedAt)
	wfExeEntity.NodeCount = rootExe.NodeCount
	wfExeEntity.Status = entity.WorkflowExecuteStatus(rootExe.Status)
	wfExeEntity.Duration = time.Duration(rootExe.Duration)
	wfExeEntity.Input = &rootExe.Input
	wfExeEntity.Output = &rootExe.Output
	wfExeEntity.ErrorCode = &rootExe.ErrorCode
	wfExeEntity.FailReason = &rootExe.FailReason
	wfExeEntity.TokenInfo = &entity.TokenUsageAndCost{
		InputTokens:  rootExe.InputTokens,
		OutputTokens: rootExe.OutputTokens,
	}
	if rootExe.UpdatedAt > 0 {
		wfExeEntity.UpdatedAt = ptr.Of(time.UnixMilli(rootExe.UpdatedAt))
	}
	wfExeEntity.ProjectID = ternary.IFElse(rootExe.ProjectID > 0, ptr.Of(rootExe.ProjectID), nil)

	// query the node executions for the root execution
	nodeExecs, err := i.query.NodeExecution.WithContext(ctx).
		Where(i.query.NodeExecution.ExecuteID.Eq(wfExeID)).
		Find()
	if err != nil {
		return nil, fmt.Errorf("failed to find node executions: %v", err)
	}

	nodeGroups := make(map[string]map[int]*entity.NodeExecution)
	nodeGroupMaxIndex := make(map[string]int)
	for _, nodeExec := range nodeExecs {
		nodeExeEntity := &entity.NodeExecution{
			ID:         nodeExec.ID,
			ExecuteID:  nodeExec.ExecuteID,
			NodeID:     nodeExec.NodeID,
			NodeName:   nodeExec.NodeName,
			NodeType:   nodes.NodeType(nodeExec.NodeType),
			CreatedAt:  time.UnixMilli(nodeExec.CreatedAt),
			Status:     entity.NodeExecuteStatus(nodeExec.Status),
			Duration:   time.Duration(nodeExec.Duration),
			Input:      &nodeExec.Input,
			Output:     &nodeExec.Output,
			RawOutput:  &nodeExec.RawOutput,
			ErrorInfo:  &nodeExec.ErrorInfo,
			ErrorLevel: &nodeExec.ErrorLevel,
			TokenInfo:  &entity.TokenUsageAndCost{InputTokens: nodeExec.InputTokens, OutputTokens: nodeExec.OutputTokens},
		}

		if nodeExec.UpdatedAt > 0 {
			nodeExeEntity.UpdatedAt = ptr.Of(time.UnixMilli(nodeExec.UpdatedAt))
		}

		if nodeExec.SubExecuteID > 0 {
			nodeExeEntity.SubWorkflowExecution = &entity.WorkflowExecution{
				ID: nodeExec.SubExecuteID,
			}
		}

		if len(nodeExec.ParentNodeID) == 0 {
			wfExeEntity.NodeExecutions = append(wfExeEntity.NodeExecutions, nodeExeEntity)
		} else {
			nodeExeEntity.Index = int(nodeExec.CompositeNodeIndex)
			if nodeExec.CompositeNodeItems != "" {
				nodeExeEntity.Items = ptr.Of(nodeExec.CompositeNodeItems)
			}
			if _, ok := nodeGroups[nodeExec.NodeID]; !ok {
				nodeGroups[nodeExec.NodeID] = make(map[int]*entity.NodeExecution)
			}
			nodeGroups[nodeExec.NodeID][nodeExeEntity.Index] = nodeExeEntity
			if nodeExeEntity.Index > nodeGroupMaxIndex[nodeExec.NodeID] {
				nodeGroupMaxIndex[nodeExec.NodeID] = nodeExeEntity.Index
			}
		}
	}

	for nodeID, nodeExes := range nodeGroups {
		groupNodeExe := &entity.NodeExecution{
			ID:        nodeExes[0].ID,
			ExecuteID: nodeExes[0].ExecuteID,
			NodeID:    nodeID,
			NodeName:  nodeExes[0].NodeName,
			NodeType:  nodeExes[0].NodeType,
		}

		var (
			duration  time.Duration
			tokenInfo *entity.TokenUsageAndCost
			status    = entity.NodeSuccess
		)

		maxIndex := nodeGroupMaxIndex[nodeID]
		groupNodeExe.IndexedExecutions = make([]*entity.NodeExecution, maxIndex)

		for index, ne := range nodeExes {
			duration = max(duration, ne.Duration)
			if ne.TokenInfo != nil {
				if tokenInfo == nil {
					tokenInfo = &entity.TokenUsageAndCost{}
				}
				tokenInfo.InputTokens += ne.TokenInfo.InputTokens
				tokenInfo.OutputTokens += ne.TokenInfo.OutputTokens
			}
			if ne.Status == entity.NodeFailed {
				status = entity.NodeFailed
			} else if ne.Status == entity.NodeRunning {
				status = entity.NodeRunning
			}

			groupNodeExe.IndexedExecutions[index] = nodeExes[index]
		}

		groupNodeExe.Duration = duration
		groupNodeExe.TokenInfo = tokenInfo
		groupNodeExe.Status = status

		wfExeEntity.NodeExecutions = append(wfExeEntity.NodeExecutions, groupNodeExe)
	}

	return wfExeEntity, nil
}
