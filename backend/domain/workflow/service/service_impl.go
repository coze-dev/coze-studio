package service

import (
	"context"
	"fmt"

	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/redis/go-redis/v9"
	"github.com/spf13/cast"
	"gorm.io/gorm"

	cloudworkflow "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/validate"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/receiver"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type impl struct {
	repo workflow.Repository
}

func NewWorkflowService(repo workflow.Repository) workflow.Service {
	return &impl{
		repo: repo,
	}
}

func NewWorkflowRepository(idgen idgen.IDGenerator, db *gorm.DB, redis *redis.Client) workflow.Repository {
	return repo.NewRepository(idgen, db, redis)
}

func (i *impl) MGetWorkflows(ctx context.Context, identifies []*entity.WorkflowIdentity) ([]*entity.Workflow, error) {
	workflows := make([]*entity.Workflow, 0, len(identifies))
	wfIDs := make([]int64, 0, len(identifies))
	for _, e := range identifies {
		wfIDs = append(wfIDs, e.ID)
	}

	wfIDs = slices.Unique(wfIDs)
	wfMetas, err := i.repo.MGetWorkflowMeta(ctx, wfIDs...)
	if err != nil {
		return nil, err
	}

	for _, identify := range identifies {
		workflowMeta, ok := wfMetas[identify.ID]
		if !ok {
			logs.Warnf("workflow meta not found for identify id %v", identify.ID)
			continue
		}

		if len(identify.Version) == 0 {
			vInfo, err := i.repo.GetWorkflowDraft(ctx, identify.ID)
			if err != nil {
				return nil, err
			}

			workflowMeta.Canvas = &vInfo.Canvas
			workflowMeta.InputParamsOfString = vInfo.InputParams
			workflowMeta.OutputParamsOfString = vInfo.OutputParams

		} else {
			vInfo, err := i.repo.GetWorkflowVersion(ctx, identify.ID, identify.Version)
			if err != nil {
				return nil, err
			}

			workflowMeta.Version = vInfo.Version
			workflowMeta.Canvas = &vInfo.Canvas
			workflowMeta.InputParamsOfString = vInfo.InputParams
			workflowMeta.OutputParamsOfString = vInfo.OutputParams
		}

		workflows = append(workflows, workflowMeta)
	}

	return workflows, err
}

func (i *impl) WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) ([]tool.BaseTool, error) {
	//TODO implement me
	panic("implement me")
}

func (i *impl) ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error) {
	// Initialize result maps
	nodeMetaMap := make(map[string][]*entity.NodeTypeMeta)
	pluginNodeMetaMap := make(map[string][]*entity.PluginNodeMeta)
	pluginCategoryMetaMap := make(map[string][]*entity.PluginCategoryMeta)

	// Helper function to check if a type should be included based on the filter
	shouldInclude := func(nodeType entity.NodeType) bool {
		if nodeTypes == nil || len(nodeTypes) == 0 {
			return true // No filter, include all
		}
		_, ok := nodeTypes[nodeType]
		return ok
	}

	// Process standard node types
	for _, meta := range entity.NodeTypeMetas {
		if shouldInclude(meta.Type) {
			category := meta.Category
			nodeMetaMap[category] = append(nodeMetaMap[category], meta)
		}
	}

	// Process plugin node types
	for _, meta := range entity.PluginNodeMetas {
		if shouldInclude(meta.NodeType) {
			category := meta.Category
			pluginNodeMetaMap[category] = append(pluginNodeMetaMap[category], meta)
		}
	}

	// Process plugin category node types
	for _, meta := range entity.PluginCategoryMetas {
		if shouldInclude(meta.NodeType) {
			category := meta.Category
			pluginCategoryMetaMap[category] = append(pluginCategoryMetaMap[category], meta)
		}
	}

	return nodeMetaMap, pluginNodeMetaMap, pluginCategoryMetaMap, nil
}

func (i *impl) CreateWorkflow(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error) {
	return i.repo.CreateWorkflowMeta(ctx, wf, ref)
}

func (i *impl) SaveWorkflow(ctx context.Context, draft *entity.Workflow) error {
	if draft.Canvas == nil {
		return fmt.Errorf("workflow canvas is nil")
	}

	c := &vo.Canvas{}
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

	return i.repo.CreateOrUpdateDraft(ctx, draft.ID, *draft.Canvas, inputParams, outputParams)
}

func (i *impl) DeleteWorkflow(ctx context.Context, id int64) error {
	return i.repo.DeleteWorkflow(ctx, id)
}

func (i *impl) GetWorkflow(ctx context.Context, id *entity.WorkflowIdentity) (*entity.Workflow, error) {
	// 1. Get workflow meta
	wf, err := i.repo.GetWorkflowMeta(ctx, id.ID)
	if err != nil {
		return nil, err
	}

	var inputParamsStr, outputParamsStr string

	// 2. Check if a specific version is requested
	if id.Version != "" {
		// Get from workflow_version
		vInfo, err := i.repo.GetWorkflowVersion(ctx, id.ID, id.Version)
		if err != nil {
			return nil, err
		}
		wf.Canvas = &vInfo.Canvas
		inputParamsStr = vInfo.InputParams
		outputParamsStr = vInfo.OutputParams
		wf.Version = vInfo.Version
		wf.VersionDesc = vInfo.VersionDescription
		wf.DevStatus = cloudworkflow.WorkFlowDevStatus_HadSubmit
	} else {
		// Get from workflow_draft
		draft, err := i.repo.GetWorkflowDraft(ctx, id.ID)
		if err != nil {
			return nil, err
		}

		wf.Canvas = &draft.Canvas
		inputParamsStr = draft.InputParams
		outputParamsStr = draft.OutputParams
		wf.DevStatus = cloudworkflow.WorkFlowDevStatus_CanNotSubmit // TODO: check if the draft is ready for submission
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

func (i *impl) GetWorkflowReference(ctx context.Context, id int64) (map[int64]*entity.Workflow, error) {
	parent, err := i.repo.GetParentWorkflowsBySubWorkflowID(ctx, id)
	if err != nil {
		return nil, err
	}

	if len(parent) == 0 {
		// if not parent, it means that it is not cited, so it is returned empty
		return map[int64]*entity.Workflow{}, nil
	}

	wfIDs := make([]int64, 0, len(parent))
	for _, ref := range parent {
		wfIDs = append(wfIDs, ref.ID)
	}

	wfMetas, err := i.repo.MGetWorkflowMeta(ctx, wfIDs...)
	if err != nil {
		return nil, err
	}

	return wfMetas, nil

}

func (i *impl) GetReleasedWorkflows(ctx context.Context, wfEntities []*entity.WorkflowIdentity) (map[int64]*entity.Workflow, error) {

	wfIDs := make([]int64, 0, len(wfEntities))

	wfID2CurrentVersion := make(map[int64]string, len(wfEntities))
	wfID2LatestVersion := make(map[int64]*vo.VersionInfo, len(wfEntities))

	// 1. 获取当前 workflow 的最新发布版本
	for idx := range wfEntities {
		wfID := wfEntities[idx].ID
		wfVersion, err := i.repo.GetLatestWorkflowVersion(ctx, wfID)
		if err != nil {
			return nil, err
		}
		wfIDs = append(wfIDs, wfID)
		wfID2LatestVersion[wfID] = wfVersion
		wfID2CurrentVersion[wfID] = wfEntities[idx].Version
	}

	// 2. 获取当前workflow 关联的 子workflow 信息
	wfID2References, err := i.repo.MGetSubWorkflowReferences(ctx, wfIDs...)
	if err != nil {
		return nil, err
	}

	for _, refs := range wfID2References {
		for _, r := range refs {
			wfIDs = append(wfIDs, r.ID)
		}
	}

	wfIDs = slices.Unique(wfIDs)

	// 3. 查询全部workflow的 meta 信息
	workflowMetas, err := i.repo.MGetWorkflowMeta(ctx, wfIDs...)
	if err != nil {
		return nil, err
	}

	for wfID, latestVersion := range wfID2LatestVersion {
		if meta, ok := workflowMetas[wfID]; ok {
			meta.Version = wfID2CurrentVersion[wfID]
			meta.LatestFlowVersion = latestVersion.Version
			meta.LatestFlowVersionDesc = latestVersion.VersionDescription
			meta.InputParamsOfString = latestVersion.InputParams
			meta.OutputParamsOfString = latestVersion.OutputParams
			if references, ok := wfID2References[wfID]; ok {
				subWorkflows := make([]*entity.Workflow, 0, len(references))
				for _, ref := range references {
					if refMeta, ok := workflowMetas[ref.ID]; ok {
						subWorkflows = append(subWorkflows, &entity.Workflow{
							WorkflowIdentity: entity.WorkflowIdentity{
								ID: refMeta.ID,
							},
							Name: refMeta.Name,
						})
					}
				}
				meta.SubWorkflows = subWorkflows
			}
		}
	}

	return workflowMetas, nil
}

func (i *impl) ValidateTree(ctx context.Context, id int64, schemaJSON string) ([]*cloudworkflow.ValidateTreeInfo, error) {

	wfValidateInfos := make([]*cloudworkflow.ValidateTreeInfo, 0)

	wErrs, err := validateWorkflowTree(ctx, schemaJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to validate work flow: %w", err)
	}

	wfValidateInfos = append(wfValidateInfos, &cloudworkflow.ValidateTreeInfo{
		WorkflowID: strconv.FormatInt(id, 10),
		Name:       "", // TODO How to get this name
		Errors:     wErrs,
	})

	c := &vo.Canvas{}
	err = sonic.UnmarshalString(schemaJSON, &c)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal canvas schema: %w", err)
	}

	subWorkflowIdentities := c.GetAllSubWorkflowIdentities()

	if len(subWorkflowIdentities) > 0 {
		entities := make([]*entity.WorkflowIdentity, 0, len(subWorkflowIdentities))
		for _, e := range subWorkflowIdentities {
			if e.Version != "" { // not validate
				continue
			}
			entities = append(entities, &entity.WorkflowIdentity{
				ID: cast.ToInt64(e.ID),
			})
		}
		workflows, err := i.MGetWorkflows(ctx, entities)
		if err != nil {
			return nil, err
		}
		for _, wf := range workflows {
			if wf.Canvas == nil {
				continue
			}
			wErrs, err = validateWorkflowTree(ctx, *wf.Canvas)
			if err != nil {
				return nil, err
			}
			wfValidateInfos = append(wfValidateInfos, &cloudworkflow.ValidateTreeInfo{
				WorkflowID: strconv.FormatInt(wf.ID, 10),
				Name:       wf.Name,
				Errors:     wErrs,
			})
		}
	}

	return wfValidateInfos, err
}

func validateWorkflowTree(ctx context.Context, schemaJSON string) ([]*cloudworkflow.ValidateErrorData, error) {
	c := &vo.Canvas{}
	err := sonic.UnmarshalString(schemaJSON, &c)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal canvas schema: %w", err)
	}
	validator, err := validate.NewCanvasValidator(ctx, &validate.Config{
		Canvas:              c,
		ProjectID:           "project_id", // TODO need to be fetched and assigned
		ProjectVersion:      "",           // TODO need to be fetched and assigned
		VariablesMetaGetter: variable.GetVariablesMetaGetter(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to new canvas validate : %w", err)
	}

	var issues []*validate.Issue
	issues, err = validator.ValidateConnections(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check connectivity : %w", err)
	}
	if len(issues) > 0 {
		return handleValidationIssues(issues), nil
	}

	issues, err = validator.DetectCycles(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check loops: %w", err)
	}
	if len(issues) > 0 {
		return handleValidationIssues(issues), nil
	}

	issues, err = validator.ValidateNestedFlows(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check nested batch or recurse: %w", err)
	}
	if len(issues) > 0 {
		return handleValidationIssues(issues), nil
	}

	issues, err = validator.CheckRefVariable(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check ref variable: %w", err)
	}
	if len(issues) > 0 {
		return handleValidationIssues(issues), nil
	}

	issues, err = validator.CheckGlobalVariables(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check global variables: %w", err)
	}
	if len(issues) > 0 {
		return handleValidationIssues(issues), nil
	}

	issues, err = validator.CheckSubWorkFlowTerminatePlanType(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check sub workflow terminate plan type: %w", err)
	}
	if len(issues) > 0 {
		return handleValidationIssues(issues), nil
	}

	return handleValidationIssues(issues), nil
}

func convertToValidationError(issue *validate.Issue) *cloudworkflow.ValidateErrorData {
	e := &cloudworkflow.ValidateErrorData{}
	e.Message = issue.Message
	if issue.NodeErr != nil {
		e.Type = cloudworkflow.ValidateErrorType_BotValidateNodeErr
		e.NodeError = &cloudworkflow.NodeError{
			NodeID: issue.NodeErr.NodeID,
		}
	} else if issue.PathErr != nil {
		e.Type = cloudworkflow.ValidateErrorType_BotValidatePathErr
		e.PathError = &cloudworkflow.PathError{
			Start: issue.PathErr.StartNode,
			End:   issue.PathErr.EndNode,
		}
	}

	return e
}

func handleValidationIssues(issues []*validate.Issue) []*cloudworkflow.ValidateErrorData {
	validateErrors := make([]*cloudworkflow.ValidateErrorData, 0, len(issues))
	for _, issue := range issues {
		validateErrors = append(validateErrors, convertToValidationError(issue))
	}

	return validateErrors
}

// AsyncExecuteWorkflow executes the specified workflow asynchronously, returning the execution ID before the execution starts.
func (i *impl) AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]string) (int64, error) {
	wfEntity, err := i.GetWorkflow(ctx, id) // TODO: decide whether to get the canvas or get the expanded workflow schema
	if err != nil {
		return 0, err
	}

	c := &vo.Canvas{}
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

	executeID, err := i.repo.GenID(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to generate workflow execute ID: %w", err)
	}

	eventChan := make(chan *execute.Event)

	opts := []einoCompose.Option{
		einoCompose.WithCallbacks(execute.NewRootWorkflowHandler(
			wfEntity.ID,
			wfEntity.SpaceID,
			executeID,
			int32(len(workflowSC.GetAllNodes())),
			false,
			workflowSC.RequireCheckpoint(),
			wfEntity.Version,
			wfEntity.ProjectID,
			eventChan)),
	}

	// TODO: unify loop and batch options
	// TODO: support checkpoint
	// TODO: verify sub workflow
	for key := range workflowSC.GetAllNodes() {
		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, einoCompose.WithCallbacks(execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			if parent.Type == entity.NodeTypeLoop {
				opts = append(opts, einoCompose.WithLambdaOption(
					loop.WithOptsForInner(
						einoCompose.WithCallbacks(
							execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))).
					DesignateNode(string(parent.Key)))
			} else if parent.Type == entity.NodeTypeBatch {
				opts = append(opts, einoCompose.WithLambdaOption(
					batch.WithOptsForInner(
						einoCompose.WithCallbacks(
							execute.NewNodeHandler(string(key), eventChan)).DesignateNode(string(key)))).
					DesignateNode(string(parent.Key)))
			}
		}
	}

	if workflowSC.RequireCheckpoint() {
		opts = append(opts, einoCompose.WithCheckPointID(strconv.FormatInt(executeID, 10)))
	}

	wf.Run(ctx, convertedInput, opts...)

	go func() {
		i.handleExecuteEvent(ctx, eventChan)
	}()

	return executeID, nil
}

func (i *impl) handleExecuteEvent(ctx context.Context, eventChan <-chan *execute.Event) {
	// consumes events from eventChan and update database as we go
	var err error
	for {
		event := <-eventChan
		switch event.Type {
		case execute.WorkflowStart:
			exeID := event.RootCtx.RootExecuteID
			wfID := event.RootCtx.WorkflowID
			var parentNodeID *string
			var parentNodeExecuteID *int64
			nodeCount := event.RootCtx.NodeCount
			version := event.RootCtx.Version
			projectID := event.RootCtx.ProjectID
			if event.SubWorkflowCtx != nil {
				exeID = event.SubExecuteID
				wfID = event.SubWorkflowID
				parentNodeID = ptr.Of(string(event.SubWorkflowCtx.SubWorkflowNodeKey))
				parentNodeExecuteID = ptr.Of(event.SubWorkflowCtx.SubWorkflowNodeExecuteID)
				nodeCount = event.SubWorkflowCtx.NodeCount
				version = event.SubWorkflowCtx.Version
				projectID = event.SubWorkflowCtx.ProjectID
			}

			wfExec := &entity.WorkflowExecution{
				ID: exeID,
				WorkflowIdentity: entity.WorkflowIdentity{
					ID:      wfID,
					Version: version,
				},
				SpaceID: event.SpaceID,
				// TODO: how to know whether it's a debug run or release run? Version alone is not sufficient.
				// TODO: fill operator information
				Status:              entity.WorkflowRunning,
				Input:               ptr.Of(mustMarshalToString(event.Input)),
				RootExecutionID:     event.RootExecuteID,
				ParentNodeID:        parentNodeID,
				ParentNodeExecuteID: parentNodeExecuteID,
				ProjectID:           projectID,
				NodeCount:           nodeCount,
			}

			if err = i.repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
				logs.Error("failed to create workflow execution: %v", err)
			}
		case execute.WorkflowSuccess:
			exeID := event.RootCtx.RootExecuteID
			if event.SubWorkflowCtx != nil {
				exeID = event.SubExecuteID
			}
			wfExec := &entity.WorkflowExecution{
				ID:       exeID,
				Duration: event.Duration,
				Status:   entity.WorkflowSuccess,
				Output:   ptr.Of(mustMarshalToString(event.Output)),
				TokenInfo: &entity.TokenUsage{
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				},
			}

			if err = i.repo.UpdateWorkflowExecution(ctx, wfExec); err != nil {
				logs.Error("failed to save workflow execution when successful: %v", err)
			}

			if event.SubWorkflowCtx == nil {
				return
			}
		case execute.WorkflowFailed:
			exeID := event.RootCtx.RootExecuteID
			if event.SubWorkflowCtx != nil {
				exeID = event.SubExecuteID
			}
			wfExec := &entity.WorkflowExecution{
				ID:       exeID,
				Duration: event.Duration,
				Status:   entity.WorkflowFailed,
				TokenInfo: &entity.TokenUsage{
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				},
				ErrorCode:  ptr.Of(event.Err.Err.Error()), // TODO: where can I get the error codes?
				FailReason: ptr.Of(event.Err.Err.Error()),
			}

			if err = i.repo.UpdateWorkflowExecution(ctx, wfExec); err != nil {
				logs.Error("failed to save workflow execution when failed: %v", err)
			}

			if event.SubWorkflowCtx == nil {
				return
			}
		case execute.WorkflowInterrupt:
			if err := i.repo.SaveInterruptEvents(ctx, event.RootExecuteID, event.InterruptEvents); err != nil {
				logs.Error("failed to save interrupt events: %v", err)
			}

			return
		case execute.NodeStart:
			wfExeID := event.RootCtx.RootExecuteID
			if event.SubWorkflowCtx != nil {
				wfExeID = event.SubExecuteID
			}
			nodeExec := &entity.NodeExecution{
				ID:        event.NodeExecuteID,
				ExecuteID: wfExeID,
				NodeID:    string(event.NodeKey),
				NodeName:  event.NodeName,
				NodeType:  event.NodeType,
				Status:    entity.NodeRunning,
				Input:     ptr.Of(mustMarshalToString(event.Input)),
			}
			if event.BatchInfo != nil {
				nodeExec.Index = event.BatchInfo.Index
				nodeExec.Items = ptr.Of(mustMarshalToString(event.BatchInfo.Items))
				nodeExec.ParentNodeID = ptr.Of(string(event.BatchInfo.CompositeNodeKey))
			}
			if err = i.repo.CreateNodeExecution(ctx, nodeExec); err != nil {
				logs.Error("failed to create node execution: %v", err)
			}
		case execute.NodeEnd:
			nodeExec := &entity.NodeExecution{
				ID:        event.NodeExecuteID,
				Status:    entity.NodeSuccess,
				Output:    ptr.Of(mustMarshalToString(event.Output)),
				RawOutput: ptr.Of(mustMarshalToString(event.RawOutput)),
				Duration:  event.Duration,
				TokenInfo: &entity.TokenUsage{
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				},
			}
			if err = i.repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
				logs.Error("failed to save node execution: %v", err)
			}
		case execute.NodeStreamingOutput:
			nodeExec := &entity.NodeExecution{
				ID:     event.NodeExecuteID,
				Output: ptr.Of(mustMarshalToString(event.Output)),
			}
			if err = i.repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
				logs.Error("failed to save node execution: %v", err)
			}
		case execute.NodeError:
			nodeExec := &entity.NodeExecution{
				ID:         event.NodeExecuteID,
				Status:     entity.NodeFailed,
				ErrorInfo:  ptr.Of(event.Err.Err.Error()),
				ErrorLevel: ptr.Of(string(execute.LevelError)),
				Duration:   event.Duration,
				TokenInfo: &entity.TokenUsage{
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				},
			}
			if err = i.repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
				logs.Error("failed to save node execution: %v", err)
			}
		default:
			panic("unimplemented event type: " + event.Type)
		}
	}
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

	wfExeEntity, found, err := i.repo.GetWorkflowExecution(ctx, wfExeID)
	if err != nil {
		return nil, err
	}

	if !found {
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

	// query the node executions for the root execution
	nodeExecs, err := i.repo.GetNodeExecutionsByWfExeID(ctx, wfExeID)
	if err != nil {
		return nil, fmt.Errorf("failed to find node executions: %v", err)
	}

	nodeGroups := make(map[string]map[int]*entity.NodeExecution)
	nodeGroupMaxIndex := make(map[string]int)
	for i := range nodeExecs {
		nodeExec := nodeExecs[i]
		if nodeExec.ParentNodeID != nil {
			if _, ok := nodeGroups[nodeExec.NodeID]; !ok {
				nodeGroups[nodeExec.NodeID] = make(map[int]*entity.NodeExecution)
			}
			nodeGroups[nodeExec.NodeID][nodeExec.Index] = nodeExecs[i]
			if nodeExec.Index > nodeGroupMaxIndex[nodeExec.NodeID] {
				nodeGroupMaxIndex[nodeExec.NodeID] = nodeExec.Index
			}
		} else {
			wfExeEntity.NodeExecutions = append(wfExeEntity.NodeExecutions, nodeExec)
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
			tokenInfo *entity.TokenUsage
			status    = entity.NodeSuccess
		)

		maxIndex := nodeGroupMaxIndex[nodeID]
		groupNodeExe.IndexedExecutions = make([]*entity.NodeExecution, maxIndex)

		for index, ne := range nodeExes {
			duration = max(duration, ne.Duration)
			if ne.TokenInfo != nil {
				if tokenInfo == nil {
					tokenInfo = &entity.TokenUsage{}
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

	interruptEvents, err := i.repo.ListInterruptEvents(ctx, wfExeID)
	if err != nil {
		return nil, fmt.Errorf("failed to find interrupt events: %v", err)
	}
	wfExeEntity.InterruptEvents = interruptEvents

	return wfExeEntity, nil
}

func (i *impl) ResumeWorkflow(ctx context.Context, wfExeID, eventID int64, resumeData string) error {
	// must get the interrupt event
	// generate the state modifier
	wfExe, found, err := i.repo.GetWorkflowExecution(ctx, wfExeID)
	if err != nil {
		return err
	}

	if !found {
		return fmt.Errorf("workflow execution does not exist, id: %d", wfExeID)
	}

	var canvas vo.Canvas
	if len(wfExe.Version) > 0 {
		wf, err := i.repo.GetWorkflowVersion(ctx, wfExe.WorkflowIdentity.ID, wfExe.Version)
		if err != nil {
			return err
		}
		err = sonic.UnmarshalString(wf.Canvas, &canvas)
		if err != nil {
			return err
		}
	} else {
		draft, err := i.repo.GetWorkflowDraft(ctx, wfExe.WorkflowIdentity.ID)
		if err != nil {
			return err
		}
		err = sonic.UnmarshalString(draft.Canvas, &canvas)
		if err != nil {
			return err
		}
	}
	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, &canvas)
	if err != nil {
		return fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, einoCompose.WithGraphName(fmt.Sprintf("%d", wfExe.WorkflowIdentity.ID)))
	if err != nil {
		return fmt.Errorf("failed to create workflow: %w", err)
	}

	eventChan := make(chan *execute.Event)

	opts := []einoCompose.Option{
		einoCompose.WithCallbacks(execute.NewRootWorkflowHandler(
			wfExe.WorkflowIdentity.ID,
			wfExe.SpaceID,
			wfExeID,
			wfExe.NodeCount,
			true,
			true,
			wfExe.Version,
			wfExe.ProjectID,
			eventChan)),
		einoCompose.WithCheckPointID(strconv.FormatInt(wfExeID, 10)),
	}

	interruptEvent, found, err := i.repo.GetInterruptEvent(ctx, wfExeID, eventID)
	if err != nil {
		return err
	}

	if !found {
		return fmt.Errorf("interrupt event does not exist, id: %d", eventID)
	}

	// TODO: unify loop and batch options
	// TODO: support checkpoint
	// TODO: verify sub workflow
	for key := range workflowSC.GetAllNodes() {
		var handler callbacks.Handler
		if key == interruptEvent.NodeKey {
			handler = execute.NewNodeResumeHandler(string(key), eventChan)
		} else {
			handler = execute.NewNodeHandler(string(key), eventChan)
		}

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, einoCompose.WithCallbacks(handler).DesignateNode(string(key)))
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			if parent.Type == entity.NodeTypeLoop {
				opts = append(opts, einoCompose.WithLambdaOption(
					loop.WithOptsForInner(
						einoCompose.WithCallbacks(handler).DesignateNode(string(key)))).
					DesignateNode(string(parent.Key)))
			} else if parent.Type == entity.NodeTypeBatch {
				opts = append(opts, einoCompose.WithLambdaOption(
					batch.WithOptsForInner(
						einoCompose.WithCallbacks(handler).DesignateNode(string(key)))).
					DesignateNode(string(parent.Key)))
			}
		}
	}

	switch interruptEvent.EventType {
	case entity.InterruptEventInput:
		stateModifier := func(ctx context.Context, path einoCompose.NodePath, state any) error {
			input := map[string]any{
				receiver.ReceivedDataKey: resumeData,
			}
			state.(*compose.State).Inputs[interruptEvent.NodeKey] = input
			return nil
		}
		opts = append(opts, einoCompose.WithStateModifier(stateModifier))
	default:
		panic(fmt.Sprintf("unimplemented interrupt event type: %v", interruptEvent.EventType))
	}

	deleted, err := i.repo.DeleteInterruptEvent(ctx, wfExeID, eventID)
	if err != nil {
		return err
	}

	if !deleted {
		return fmt.Errorf("interrupt event does not exist, id: %d", eventID)
	}

	wf.Run(ctx, nil, opts...)

	go func() {
		i.handleExecuteEvent(ctx, eventChan)
	}()

	return nil
}
