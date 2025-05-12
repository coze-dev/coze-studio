package service

import (
	"context"
	"errors"
	"fmt"

	"strconv"
	"strings"
	"time"

	"github.com/bytedance/sonic"
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
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/receiver"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
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

	resetTestRun, err := i.shouldResetTestRun(ctx, sc, draft.ID)
	if err != nil {
		return err
	}

	return i.repo.CreateOrUpdateDraft(ctx, draft.ID, *draft.Canvas, inputParams, outputParams, resetTestRun)
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
	} else {
		// Get from workflow_draft
		draft, err := i.repo.GetWorkflowDraft(ctx, id.ID)
		if err != nil {
			return nil, err
		}
		wf.Canvas = &draft.Canvas
		inputParamsStr = draft.InputParams
		outputParamsStr = draft.OutputParams

		wf.TestRunSuccess = draft.TestRunSuccess
		wf.Published = draft.Published

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

	opts := designateOptions(wfEntity.ID, wfEntity.SpaceID, wfEntity.Version, wfEntity.ProjectID,
		workflowSC, executeID, eventChan, nil)

	wf.Run(ctx, convertedInput, opts...)

	go func() {
		i.handleExecuteEvent(ctx, eventChan)
	}()

	return executeID, nil
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

	interruptEvent, found, err := i.repo.GetInterruptEvent(ctx, wfExeID, eventID)
	if err != nil {
		return err
	}

	if !found {
		return fmt.Errorf("interrupt event does not exist, id: %d", eventID)
	}

	opts := designateOptions(wfExe.WorkflowIdentity.ID, wfExe.SpaceID, wfExe.WorkflowIdentity.Version, wfExe.ProjectID,
		workflowSC, wfExeID, eventChan, interruptEvent)

	switch interruptEvent.EventType {
	case entity.InterruptEventInput:
		stateModifier := func(ctx context.Context, path einoCompose.NodePath, state any) error {
			for i, p := range path.GetPath() {
				if interruptEvent.NodePath[i] != p { // not the state modifier for this event
					return nil
				}
			}

			input := map[string]any{
				receiver.ReceivedDataKey: resumeData,
			}
			state.(*compose.State).Inputs[interruptEvent.NodeKey] = input
			return nil
		}
		opts = append(opts, einoCompose.WithStateModifier(stateModifier))
	case entity.InterruptEventQuestion:
		stateModifier := func(ctx context.Context, path einoCompose.NodePath, state any) error {
			for i, p := range path.GetPath() {
				if interruptEvent.NodePath[i] != p { // not the state modifier for this event
					return nil
				}
			}

			state.(*compose.State).Answers[interruptEvent.NodeKey] = append(state.(*compose.State).Answers[interruptEvent.NodeKey], resumeData)
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

func (i *impl) QueryWorkflowNodeTypes(ctx context.Context, wfID int64) (map[string]*vo.NodeProperty, error) {

	draftInfo, err := i.repo.GetWorkflowDraft(ctx, wfID)
	if err != nil {
		return nil, err
	}

	canvasSchema := draftInfo.Canvas
	if len(canvasSchema) == 0 {
		return nil, fmt.Errorf("no canvas schema")
	}

	mainCanvas := &vo.Canvas{}
	err = sonic.UnmarshalString(canvasSchema, mainCanvas)
	if err != nil {
		return nil, err
	}
	nodePropertyMap, err := i.collectNodePropertyMap(ctx, mainCanvas)
	if err != nil {
		return nil, err
	}
	return nodePropertyMap, nil
}

// entityNodeTypeToBlockType converts an entity.NodeType to the corresponding vo.BlockType.
func entityNodeTypeToBlockType(nodeType entity.NodeType) (vo.BlockType, error) {
	switch nodeType {
	case entity.NodeTypeEntry:
		return vo.BlockTypeBotStart, nil
	case entity.NodeTypeExit:
		return vo.BlockTypeBotEnd, nil
	case entity.NodeTypeLLM:
		return vo.BlockTypeBotLLM, nil
	case entity.NodeTypePlugin:
		return vo.BlockTypeBotAPI, nil
	case entity.NodeTypeCodeRunner:
		return vo.BlockTypeBotCode, nil
	case entity.NodeTypeKnowledgeRetriever:
		return vo.BlockTypeBotDataset, nil
	case entity.NodeTypeSelector:
		return vo.BlockTypeCondition, nil
	case entity.NodeTypeSubWorkflow:
		return vo.BlockTypeBotSubWorkflow, nil
	case entity.NodeTypeDatabaseCustomSQL:
		return vo.BlockTypeDatabase, nil
	case entity.NodeTypeOutputEmitter:
		return vo.BlockTypeBotMessage, nil
	case entity.NodeTypeTextProcessor:
		return vo.BlockTypeBotText, nil
	case entity.NodeTypeQuestionAnswer:
		return vo.BlockTypeQuestion, nil
	case entity.NodeTypeBreak:
		return vo.BlockTypeBotBreak, nil
	case entity.NodeTypeVariableAssigner:
		return vo.BlockTypeBotAssignVariable, nil
	case entity.NodeTypeVariableAssignerWithinLoop:
		return vo.BlockTypeBotLoopSetVariable, nil
	case entity.NodeTypeLoop:
		return vo.BlockTypeBotLoop, nil
	case entity.NodeTypeIntentDetector:
		return vo.BlockTypeBotIntent, nil
	case entity.NodeTypeKnowledgeIndexer:
		return vo.BlockTypeBotDatasetWrite, nil
	case entity.NodeTypeBatch:
		return vo.BlockTypeBotBatch, nil
	case entity.NodeTypeContinue:
		return vo.BlockTypeBotContinue, nil
	case entity.NodeTypeInputReceiver:
		return vo.BlockTypeBotInput, nil
	case entity.NodeTypeDatabaseUpdate:
		return vo.BlockTypeDatabaseUpdate, nil
	case entity.NodeTypeDatabaseQuery:
		return vo.BlockTypeDatabaseSelect, nil
	case entity.NodeTypeDatabaseDelete:
		return vo.BlockTypeDatabaseDelete, nil
	case entity.NodeTypeHTTPRequester:
		return vo.BlockTypeBotHttp, nil
	case entity.NodeTypeDatabaseInsert:
		return vo.BlockTypeDatabaseInsert, nil
	default:
		return vo.BlockType(""), fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType)
	}
}

func (i *impl) collectNodePropertyMap(ctx context.Context, canvas *vo.Canvas) (map[string]*vo.NodeProperty, error) {
	nodePropertyMap := make(map[string]*vo.NodeProperty)
	for _, n := range canvas.Nodes {
		if n.Type == vo.BlockTypeBotSubWorkflow {
			nodeSchema := &compose.NodeSchema{
				Key:  vo.NodeKey(n.ID),
				Type: entity.NodeTypeSubWorkflow,
				Name: n.Data.Meta.Title,
			}
			err := adaptor.SetInputsForNodeSchema(n, nodeSchema)
			if err != nil {
				return nil, err
			}
			blockType, err := entityNodeTypeToBlockType(nodeSchema.Type)
			if err != nil {
				return nil, err
			}
			prop := &vo.NodeProperty{
				Type:                string(blockType),
				IsEnableUserQuery:   nodeSchema.IsEnableUserQuery(),
				IsEnableChatHistory: nodeSchema.IsEnableChatHistory(),
				IsRefGlobalVariable: nodeSchema.IsRefGlobalVariable(),
			}
			nodePropertyMap[string(nodeSchema.Key)] = prop
			wid, err := strconv.ParseInt(n.Data.Inputs.WorkflowID, 10, 64)
			if err != nil {
				return nil, err
			}

			var canvasSchema string
			if n.Data.Inputs.WorkflowVersion != "" {
				versionInfo, err := i.repo.GetWorkflowVersion(ctx, wid, n.Data.Inputs.WorkflowVersion)
				if err != nil {
					return nil, err
				}
				canvasSchema = versionInfo.Canvas
			} else {
				draftInfo, err := i.repo.GetWorkflowDraft(ctx, wid)
				if err != nil {
					return nil, err
				}
				canvasSchema = draftInfo.Canvas
			}

			if len(canvasSchema) == 0 {
				return nil, fmt.Errorf("workflow id %v ,not get canvas schema, version %v", wid, n.Data.Inputs.WorkflowVersion)
			}

			c := &vo.Canvas{}
			err = sonic.UnmarshalString(canvasSchema, c)
			if err != nil {
				return nil, err
			}
			ret, err := i.collectNodePropertyMap(ctx, c)
			if err != nil {
				return nil, err
			}
			prop.SubWorkflow = ret

		} else {
			nodeSchemas, _, err := adaptor.NodeToNodeSchema(n)
			if err != nil {
				return nil, err
			}
			for _, nodeSchema := range nodeSchemas {
				blockType, err := entityNodeTypeToBlockType(nodeSchema.Type)
				if err != nil {
					return nil, err
				}
				nodePropertyMap[string(nodeSchema.Key)] = &vo.NodeProperty{
					Type:                string(blockType),
					IsEnableUserQuery:   nodeSchema.IsEnableUserQuery(),
					IsEnableChatHistory: nodeSchema.IsEnableChatHistory(),
					IsRefGlobalVariable: nodeSchema.IsRefGlobalVariable(),
				}
			}

		}

	}
	return nodePropertyMap, nil
}

func (i *impl) PublishWorkflow(ctx context.Context, wfID int64, force bool, version *vo.VersionInfo) (err error) {

	_, err = i.repo.GetWorkflowVersion(ctx, wfID, version.Version)
	if err == nil {
		return fmt.Errorf("workflow version %v already exists", version.Version)
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	latestVersionInfo, err := i.repo.GetLatestWorkflowVersion(ctx, wfID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		draftInfo, err := i.repo.GetWorkflowDraft(ctx, wfID)
		if err != nil {
			return err
		}
		version.Canvas = draftInfo.Canvas
		version.InputParams = draftInfo.InputParams
		version.OutputParams = draftInfo.OutputParams

		_, err = i.repo.CreateWorkflowVersion(ctx, wfID, version)
		if err != nil {
			return err
		}
		return nil
	}

	latestVersion, err := parseVersion(latestVersionInfo.Version)
	if err != nil {
		return err
	}
	currentVersion, err := parseVersion(version.Version)
	if err != nil {
		return err
	}

	if !isIncremental(latestVersion, currentVersion) {
		return fmt.Errorf("the version number is not self-incrementing, old version %v, current version is %v", latestVersionInfo.Version, version.Version)
	}

	draftInfo, err := i.repo.GetWorkflowDraft(ctx, wfID)
	if err != nil {
		return err
	}

	version.Canvas = draftInfo.Canvas
	version.InputParams = draftInfo.InputParams
	version.OutputParams = draftInfo.OutputParams

	_, err = i.repo.CreateWorkflowVersion(ctx, wfID, version)
	if err != nil {
		return err
	}
	return nil
}

func (i *impl) shouldResetTestRun(ctx context.Context, sc *compose.WorkflowSchema, wid int64) (bool, error) {

	if sc == nil { // 新的不合法, 需要改
		return true, nil
	}

	existedDraft, err := i.repo.GetWorkflowDraft(ctx, wid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return true, nil
		}
		return false, err
	}

	var shouldReset bool
	existedDraftCanvas := &vo.Canvas{}
	err = sonic.Unmarshal([]byte(existedDraft.Canvas), existedDraftCanvas)
	existedSc, err := adaptor.CanvasToWorkflowSchema(ctx, existedDraftCanvas)
	if err == nil { // 老的也合法 对比
		if !existedSc.IsEqual(sc) {
			shouldReset = true
		}
	} else { // 老的不合法 也修改
		shouldReset = true
	}

	return shouldReset, nil
}

type version struct {
	Prefix string
	Major  int
	Minor  int
	Patch  int
}

func parseVersion(versionString string) (version, error) {
	if !strings.HasPrefix(versionString, "v") {
		return version{}, fmt.Errorf("invalid prefix format: %s", versionString)
	}
	versionString = strings.TrimPrefix(versionString, "v")
	parts := strings.Split(versionString, ".")
	if len(parts) != 3 {
		return version{}, fmt.Errorf("invalid version format: %s", versionString)
	}

	major, err := strconv.Atoi(parts[0])
	if err != nil {
		return version{}, fmt.Errorf("invalid major version: %s", parts[0])
	}

	minor, err := strconv.Atoi(parts[1])
	if err != nil {
		return version{}, fmt.Errorf("invalid minor version: %s", parts[1])
	}

	patch, err := strconv.Atoi(parts[2])
	if err != nil {
		return version{}, fmt.Errorf("invalid patch version: %s", parts[2])
	}

	return version{Major: major, Minor: minor, Patch: patch}, nil
}

func isIncremental(prev version, next version) bool {

	if next.Major < prev.Major {
		return false
	}
	if next.Major > prev.Major {
		return true
	}

	if next.Minor < prev.Minor {
		return false
	}
	if next.Minor > prev.Minor {
		return true
	}

	return next.Patch > prev.Patch
}
