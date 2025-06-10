package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/bytedance/sonic"
	"github.com/redis/go-redis/v9"
	"github.com/spf13/cast"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"

	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	cloudworkflow "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/validate"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
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

func NewWorkflowRepository(idgen idgen.IDGenerator, db *gorm.DB, redis *redis.Client, tos storage.Storage,
	cpStore einoCompose.CheckPointStore) workflow.Repository {
	return repo.NewRepository(idgen, db, redis, tos, cpStore)
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
			if len(vInfo.InputParams) > 0 {
				workflowMeta.InputParams = make([]*vo.NamedTypeInfo, 0)
				err := sonic.UnmarshalString(vInfo.InputParams, &workflowMeta.InputParams)
				if err != nil {
					return nil, err
				}
			}
			if len(vInfo.OutputParams) > 0 {
				workflowMeta.OutputParams = make([]*vo.NamedTypeInfo, 0)
				err := sonic.UnmarshalString(vInfo.OutputParams, &workflowMeta.OutputParams)
				if err != nil {
					return nil, err
				}
			}

		} else {
			vInfo, err := i.repo.GetWorkflowVersion(ctx, identify.ID, identify.Version)
			if err != nil {
				return nil, err
			}

			workflowMeta.Version = vInfo.Version
			workflowMeta.VersionDesc = vInfo.VersionDescription
			workflowMeta.Canvas = &vInfo.Canvas
			if len(vInfo.InputParams) > 0 {
				workflowMeta.InputParams = make([]*vo.NamedTypeInfo, 0)
				err := sonic.UnmarshalString(vInfo.InputParams, &workflowMeta.InputParams)
				if err != nil {
					return nil, err
				}
			}
			if len(vInfo.OutputParams) > 0 {
				workflowMeta.OutputParams = make([]*vo.NamedTypeInfo, 0)
				err := sonic.UnmarshalString(vInfo.OutputParams, &workflowMeta.OutputParams)
				if err != nil {
					return nil, err
				}
			}
		}

		workflows = append(workflows, workflowMeta)
	}

	return workflows, err
}

func (i *impl) WorkflowAsModelTool(ctx context.Context, ids []*entity.WorkflowIdentity) (tools []tool.BaseTool, err error) {
	for _, id := range ids {
		t, err := i.repo.WorkflowAsTool(ctx, *id, vo.WorkflowToolConfig{})
		if err != nil {
			return nil, err
		}
		tools = append(tools, t)
	}

	return tools, nil
}

func (i *impl) ListNodeMeta(_ context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, map[string][]*entity.PluginNodeMeta, map[string][]*entity.PluginCategoryMeta, error) {
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
	id, err := i.repo.CreateWorkflowMeta(ctx, wf, ref)
	if err != nil {
		return 0, err
	}

	// save the initialized  canvas information to the draft
	wf.Canvas = ptr.Of(vo.GetDefaultInitCanvasJsonSchema())
	wf.ID = id
	err = i.SaveWorkflow(ctx, wf)
	if err != nil {
		return 0, err
	}

	err = search.GetNotifier().PublishWorkflowResource(ctx, search.Created, &search.Resource{
		WorkflowID:    id,
		URI:           &wf.IconURI,
		Name:          &wf.Name,
		Desc:          &wf.Desc,
		APPID:         wf.AppID,
		SpaceID:       &wf.SpaceID,
		OwnerID:       &wf.CreatorID,
		Mode:          ptr.Of(int32(wf.Mode)),
		PublishStatus: ptr.Of(search.UnPublished),
		CreatedAt:     ptr.Of(time.Now().UnixMilli()),
	})
	if err != nil {
		return 0, err
	}
	return id, nil
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
	inputs, outputs, err := extractInputsAndOutputsNamedInfoList(c)
	if err != nil {
		return err
	}
	inputParams, err = sonic.MarshalString(inputs)
	if err != nil {
		return err
	}

	outputParams, err = sonic.MarshalString(outputs)
	if err != nil {
		return err
	}

	resetTestRun, err := i.shouldResetTestRun(ctx, c, draft.ID)
	if err != nil {
		return err
	}

	return i.repo.CreateOrUpdateDraft(ctx, draft.ID, *draft.Canvas, inputParams, outputParams, resetTestRun)
}

func extractInputsAndOutputsNamedInfoList(c *vo.Canvas) (inputs []*vo.NamedTypeInfo, outputs []*vo.NamedTypeInfo, err error) {
	var (
		startNode *vo.Node
		endNode   *vo.Node
	)
	for _, node := range c.Nodes {
		if startNode != nil && endNode != nil {
			break
		}
		if node.Type == vo.BlockTypeBotStart {
			startNode = node
		}
		if node.Type == vo.BlockTypeBotEnd {
			endNode = node
		}
	}

	if startNode == nil {
		return nil, nil, fmt.Errorf("invalid canvas, can not find start node in canvas")
	}

	if endNode == nil {
		return nil, nil, fmt.Errorf("invalid canvas, can not find end node in canvas")
	}

	inputs, err = slices.TransformWithErrorCheck(startNode.Data.Outputs, func(o any) (*vo.NamedTypeInfo, error) {
		v, err := vo.ParseVariable(o)
		if err != nil {
			return nil, err
		}
		nInfo, err := adaptor.VariableToNamedTypeInfo(v)
		if err != nil {
			return nil, err
		}
		return nInfo, nil
	})
	if err != nil {
		return nil, nil, err
	}

	outputs, err = slices.TransformWithErrorCheck(endNode.Data.Inputs.InputParameters, func(a *vo.Param) (*vo.NamedTypeInfo, error) {
		return adaptor.BlockInputToNamedTypeInfo(a.Name, a.Input)
	})
	if err != nil {
		return nil, nil, err
	}

	return inputs, outputs, nil
}

func (i *impl) DeleteWorkflow(ctx context.Context, id int64) error {
	err := i.repo.DeleteWorkflow(ctx, id)
	if err != nil {
		return err
	}
	err = search.GetNotifier().PublishWorkflowResource(ctx, search.Deleted, &search.Resource{
		WorkflowID: id,
	})
	if err != nil {
		return err
	}
	return nil
}

func (i *impl) GetWorkflowDraft(ctx context.Context, id int64) (*entity.Workflow, error) {
	wf, err := i.repo.GetWorkflowMeta(ctx, id)
	if err != nil {
		return nil, err
	}

	draft, err := i.repo.GetWorkflowDraft(ctx, id)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	var inputParamsStr, outputParamsStr string

	if draft == nil {
		return wf, nil
	}

	wf.Canvas = &draft.Canvas
	inputParamsStr = draft.InputParams
	outputParamsStr = draft.OutputParams
	wf.TestRunSuccess = draft.TestRunSuccess
	wf.Modified = draft.Modified

	// 3. Unmarshal parameters if they exist
	if inputParamsStr != "" {
		input := make([]*vo.NamedTypeInfo, 0)
		err = sonic.UnmarshalString(inputParamsStr, &input)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal input params for workflow %d: %w", id, err)
		}
		wf.InputParams = input
	}
	if outputParamsStr != "" {
		output := make([]*vo.NamedTypeInfo, 0)
		err = sonic.UnmarshalString(outputParamsStr, &output)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal output params for workflow %d: %w", id, err)
		}
		wf.OutputParams = output
	}

	// If Workflow is already published, get the latest released version
	if wf.HasPublished {
		latestVersion, err := i.repo.GetLatestWorkflowVersion(ctx, id)
		if err != nil {
			return nil, err
		}
		wf.LatestVersion = latestVersion.Version
	}

	return wf, nil
}

func (i *impl) GetWorkflowVersion(ctx context.Context, wfe *entity.WorkflowIdentity) (*entity.Workflow, error) {
	// 1. Get workflow meta
	wf, err := i.repo.GetWorkflowMeta(ctx, wfe.ID)
	if err != nil {
		return nil, err
	}

	vInfo, err := i.repo.GetWorkflowVersion(ctx, wfe.ID, wfe.Version)
	if err != nil {
		return nil, err
	}

	wf.Canvas = &vInfo.Canvas
	wf.Version = vInfo.Version
	wf.VersionDesc = vInfo.VersionDescription

	// 3. Unmarshal parameters if they exist
	if vInfo.InputParams != "" {
		input := make([]*vo.NamedTypeInfo, 0)
		err = sonic.UnmarshalString(vInfo.InputParams, &input)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal input params for workflow %d: %w", wfe.ID, err)
		}
		wf.InputParams = input
	}
	if vInfo.OutputParams != "" {
		output := make([]*vo.NamedTypeInfo, 0)
		err = sonic.UnmarshalString(vInfo.OutputParams, &output)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal output params for workflow %d: %w", wfe.ID, err)
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
			if errors.Is(err, gorm.ErrRecordNotFound) {
				continue
			}
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

			inputNamedTypeInfos := make([]*vo.NamedTypeInfo, 0)
			err = sonic.UnmarshalString(latestVersion.InputParams, &inputNamedTypeInfos)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal input params for workflow %d: %w", wfID, err)
			}
			meta.InputParams = inputNamedTypeInfos

			outputNamedTypeInfos := make([]*vo.NamedTypeInfo, 0)
			err = sonic.UnmarshalString(latestVersion.OutputParams, &outputNamedTypeInfos)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal output params for workflow %d: %w", wfID, err)
			}
			meta.OutputParams = outputNamedTypeInfos
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

func (i *impl) ValidateTree(ctx context.Context, id int64, validateConfig vo.ValidateTreeConfig) ([]*cloudworkflow.ValidateTreeInfo, error) {
	wfValidateInfos := make([]*cloudworkflow.ValidateTreeInfo, 0)
	issues, err := validateWorkflowTree(ctx, validateConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to validate work flow: %w", err)
	}

	if len(issues) > 0 {
		wfValidateInfos = append(wfValidateInfos, &cloudworkflow.ValidateTreeInfo{
			WorkflowID: strconv.FormatInt(id, 10),
			Name:       "", // TODO front doesn't seem to care about this workflow name
			Errors:     toValidateErrorData(issues),
		})
	}

	c := &vo.Canvas{}
	err = sonic.UnmarshalString(validateConfig.CanvasSchema, &c)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal canvas schema: %w", err)
	}

	subWorkflowIdentities := c.GetAllSubWorkflowIdentities()

	if len(subWorkflowIdentities) > 0 {
		entities := make([]*entity.WorkflowIdentity, 0, len(subWorkflowIdentities))
		for _, e := range subWorkflowIdentities {
			if e.Version != "" {
				continue
			}
			// only project-level workflows need to validate sub-workflows
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
			issues, err = validateWorkflowTree(ctx, vo.ValidateTreeConfig{
				CanvasSchema: ptr.From(wf.Canvas),
				APPID:        wf.AppID, // application workflow use same app id
			})
			if err != nil {
				return nil, err
			}

			if len(issues) > 0 {
				wfValidateInfos = append(wfValidateInfos, &cloudworkflow.ValidateTreeInfo{
					WorkflowID: strconv.FormatInt(wf.ID, 10),
					Name:       wf.Name,
					Errors:     toValidateErrorData(issues),
				})
			}

		}
	}

	return wfValidateInfos, err
}

// AsyncExecuteWorkflow executes the specified workflow asynchronously, returning the execution ID.
// Intermediate results are not emitted on the fly.
// The caller is expected to poll the execution status using the GetExecution method and the returned execution ID.
func (i *impl) AsyncExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]any, config vo.ExecuteConfig) (int64, error) {
	var (
		err      error
		wfEntity *entity.Workflow
	)
	if id.Version != "" {
		wfEntity, err = i.GetWorkflowVersion(ctx, id)
		if err != nil {
			return 0, err
		}
	} else {
		wfEntity, err = i.GetWorkflowDraft(ctx, id.ID)
		if err != nil {
			return 0, err
		}
	}

	c := &vo.Canvas{}
	if err = sonic.UnmarshalString(*wfEntity.Canvas, c); err != nil {
		return 0, fmt.Errorf("failed to unmarshal canvas: %w", err)
	}

	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err != nil {
		return 0, fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(wfEntity.ID))
	if err != nil {
		return 0, fmt.Errorf("failed to create workflow: %w", err)
	}

	if wfEntity.AppID != nil && config.AppID == nil {
		config.AppID = wfEntity.AppID
	}

	convertedInput, err := convertInputs(input, wf.Inputs())
	if err != nil {
		return 0, fmt.Errorf("failed to convert inputs: %w", err)
	}

	inStr, err := sonic.MarshalString(input)
	if err != nil {
		return 0, err
	}
	cancelCtx, executeID, opts, err := compose.Prepare(ctx, inStr, wfEntity.GetBasic(workflowSC.NodeCount()),
		nil, i.repo, workflowSC, nil, config)
	if err != nil {
		return 0, err
	}

	if config.Mode == vo.ExecuteModeDebug {
		if err = i.repo.SetTestRunLatestExeID(ctx, id.ID, config.Operator, executeID); err != nil {
			logs.CtxErrorf(ctx, "failed to set test run latest exe id: %v", err)
		}
	}

	wf.AsyncRun(cancelCtx, convertedInput, opts...)

	return executeID, nil
}

func (i *impl) AsyncExecuteNode(ctx context.Context, id *entity.WorkflowIdentity, nodeID string, input map[string]any, config vo.ExecuteConfig) (int64, error) {
	var (
		err      error
		wfEntity *entity.Workflow
	)
	if id.Version != "" {
		wfEntity, err = i.GetWorkflowVersion(ctx, id)
		if err != nil {
			return 0, err
		}
	} else {
		wfEntity, err = i.GetWorkflowDraft(ctx, id.ID)
		if err != nil {
			return 0, err
		}
	}

	c := &vo.Canvas{}
	if err = sonic.UnmarshalString(*wfEntity.Canvas, c); err != nil {
		return 0, fmt.Errorf("failed to unmarshal canvas: %w", err)
	}

	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err != nil {
		return 0, fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, newSC, err := compose.NewWorkflowFromNode(ctx, workflowSC, vo.NodeKey(nodeID), einoCompose.WithGraphName(fmt.Sprintf("%d", wfEntity.ID)))
	if err != nil {
		return 0, fmt.Errorf("failed to create workflow: %w", err)
	}

	convertedInput, err := convertInputs(input, wf.Inputs())
	if err != nil {
		return 0, fmt.Errorf("failed to convert inputs: %w", err)
	}

	inStr, err := sonic.MarshalString(input)
	if err != nil {
		return 0, err
	}
	cancelCtx, executeID, opts, err := compose.Prepare(ctx, inStr, wfEntity.GetBasic(newSC.NodeCount()),
		nil, i.repo, newSC, nil, config)
	if err != nil {
		return 0, err
	}

	if config.Mode == vo.ExecuteModeNodeDebug {
		if err = i.repo.SetNodeDebugLatestExeID(ctx, id.ID, nodeID, config.Operator, executeID); err != nil {
			logs.CtxErrorf(ctx, "failed to set node debug latest exe id: %v", err)
		}
	}

	wf.AsyncRun(cancelCtx, convertedInput, opts...)

	return executeID, nil
}

// StreamExecuteWorkflow executes the specified workflow, returning a stream of execution events.
// The caller is expected to receive from the returned stream immediately.
func (i *impl) StreamExecuteWorkflow(ctx context.Context, id *entity.WorkflowIdentity, input map[string]any, config vo.ExecuteConfig) (
	*schema.StreamReader[*entity.Message], error) {
	var (
		err      error
		wfEntity *entity.Workflow
	)
	if id.Version != "" {
		wfEntity, err = i.GetWorkflowVersion(ctx, id)
		if err != nil {
			return nil, err
		}
	} else {
		wfEntity, err = i.GetWorkflowDraft(ctx, id.ID)
		if err != nil {
			return nil, err
		}
	}

	c := &vo.Canvas{}
	if err = sonic.UnmarshalString(*wfEntity.Canvas, c); err != nil {
		return nil, fmt.Errorf("failed to unmarshal canvas: %w", err)
	}

	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err != nil {
		return nil, fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(wfEntity.ID))
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	if wfEntity.AppID != nil && config.AppID == nil {
		config.AppID = wfEntity.AppID
	}

	input, err = convertInputs(input, wf.Inputs())
	if err != nil {
		return nil, fmt.Errorf("failed to convert inputs: %w", err)
	}

	inStr, err := sonic.MarshalString(input)
	if err != nil {
		return nil, err
	}

	sr, sw := schema.Pipe[*entity.Message](10)

	cancelCtx, executeID, opts, err := compose.Prepare(ctx, inStr, wfEntity.GetBasic(workflowSC.NodeCount()),
		nil, i.repo, workflowSC, sw, config)
	if err != nil {
		return nil, err
	}

	_ = executeID

	wf.AsyncRun(cancelCtx, input, opts...)

	return sr, nil
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
		groupNodeExe := mergeCompositeInnerNodes(nodeExes, nodeGroupMaxIndex[nodeID])
		wfExeEntity.NodeExecutions = append(wfExeEntity.NodeExecutions, groupNodeExe)
	}

	interruptEvent, found, err := i.repo.GetFirstInterruptEvent(ctx, wfExeID)
	if err != nil {
		return nil, fmt.Errorf("failed to find interrupt events: %v", err)
	}

	if found {
		// if we are currently interrupted, return this interrupt event,
		// otherwise only return this event if it's the current resuming event
		if wfExeEntity.Status == entity.WorkflowInterrupted ||
			(wfExeEntity.CurrentResumingEventID != nil && *wfExeEntity.CurrentResumingEventID == interruptEvent.ID) {
			wfExeEntity.InterruptEvents = []*entity.InterruptEvent{interruptEvent}
		}
	}

	return wfExeEntity, nil
}

func (i *impl) GetNodeExecution(ctx context.Context, exeID int64, nodeID string) (*entity.NodeExecution, *entity.NodeExecution, error) {
	nodeExe, found, err := i.repo.GetNodeExecution(ctx, exeID, nodeID)
	if err != nil {
		return nil, nil, err
	}

	if !found {
		return nil, nil, fmt.Errorf("try getting node exe for exeID : %d, nodeID : %s, but not found", exeID, nodeID)
	}

	if nodeExe.NodeType != entity.NodeTypeBatch {
		return nodeExe, nil, nil
	}

	wfExe, found, err := i.repo.GetWorkflowExecution(ctx, exeID)
	if err != nil {
		return nil, nil, err
	}

	if !found {
		return nil, nil, fmt.Errorf("try getting node exe for exeID : %d, nodeID : %s, but not found", exeID, nodeID)
	}

	if wfExe.Mode != vo.ExecuteModeNodeDebug {
		return nodeExe, nil, nil
	}

	// when node debugging a node with batch mode, we need to query the inner node executions and return it together
	innerNodeExecs, err := i.repo.GetNodeExecutionByParent(ctx, exeID, nodeExe.NodeID)
	if err != nil {
		return nil, nil, err
	}

	for i := range innerNodeExecs {
		innerNodeID := innerNodeExecs[i].NodeID
		if !vo.IsGeneratedNodeForBatchMode(innerNodeID, nodeExe.NodeID) {
			// inner node is not generated, means this is normal batch, not node in batch mode
			return nodeExe, nil, nil
		}
	}

	var (
		maxIndex  int
		index2Exe = make(map[int]*entity.NodeExecution)
	)

	for i := range innerNodeExecs {
		index2Exe[innerNodeExecs[i].Index] = innerNodeExecs[i]
		if innerNodeExecs[i].Index > maxIndex {
			maxIndex = innerNodeExecs[i].Index
		}
	}

	return nodeExe, mergeCompositeInnerNodes(index2Exe, maxIndex), nil
}

func (i *impl) GetLatestTestRunInput(ctx context.Context, wfID int64, userID int64) (*entity.NodeExecution, bool, error) {
	exeID, err := i.repo.GetTestRunLatestExeID(ctx, wfID, userID)
	if err != nil {
		return nil, false, err
	}

	if exeID == 0 {
		return nil, false, nil
	}

	nodeExe, _, err := i.GetNodeExecution(ctx, exeID, compose.EntryNodeKey)
	if err != nil {
		return nil, false, err
	}

	return nodeExe, true, nil
}

func (i *impl) GetLatestNodeDebugInput(ctx context.Context, wfID int64, nodeID string, userID int64) (
	*entity.NodeExecution, *entity.NodeExecution, bool, error) {
	exeID, err := i.repo.GetNodeDebugLatestExeID(ctx, wfID, nodeID, userID)
	if err != nil {
		return nil, nil, false, err
	}

	if exeID == 0 {
		return nil, nil, false, nil
	}

	nodeExe, innerExe, err := i.GetNodeExecution(ctx, exeID, nodeID)
	if err != nil {
		return nil, nil, false, err
	}

	return nodeExe, innerExe, true, nil
}

func mergeCompositeInnerNodes(nodeExes map[int]*entity.NodeExecution, maxIndex int) *entity.NodeExecution {
	var groupNodeExe *entity.NodeExecution
	for _, v := range nodeExes {
		groupNodeExe = &entity.NodeExecution{
			ID:           v.ID,
			ExecuteID:    v.ExecuteID,
			NodeID:       v.NodeID,
			NodeName:     v.NodeName,
			NodeType:     v.NodeType,
			ParentNodeID: v.ParentNodeID,
		}
		break
	}

	var (
		duration  time.Duration
		tokenInfo *entity.TokenUsage
		status    = entity.NodeSuccess
	)

	groupNodeExe.IndexedExecutions = make([]*entity.NodeExecution, maxIndex+1)

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

	return groupNodeExe
}

// AsyncResumeWorkflow resumes a workflow execution asynchronously, using the passed in executionID and eventID.
// Intermediate results during the resuming run are not emitted on the fly.
// Caller is expected to poll the execution status using the GetExecution method.
func (i *impl) AsyncResumeWorkflow(ctx context.Context, req *entity.ResumeRequest, config vo.ExecuteConfig) error {
	wfExe, found, err := i.repo.GetWorkflowExecution(ctx, req.ExecuteID)
	if err != nil {
		return err
	}

	if !found {
		return fmt.Errorf("workflow execution does not exist, id: %d", req.ExecuteID)
	}

	if wfExe.RootExecutionID != wfExe.ID {
		return fmt.Errorf("only root workflow can be resumed")
	}

	if wfExe.Status != entity.WorkflowInterrupted {
		return fmt.Errorf("workflow execution %d is not interrupted, status is %v, cannot resume", req.ExecuteID, wfExe.Status)
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

	config.AppID = wfExe.AppID
	config.AgentID = wfExe.AgentID

	if config.ConnectorID == 0 {
		config.ConnectorID = wfExe.ConnectorID
	}

	if wfExe.Mode == vo.ExecuteModeNodeDebug {
		nodeExes, err := i.repo.GetNodeExecutionsByWfExeID(ctx, wfExe.ID)
		if err != nil {
			return err
		}

		if len(nodeExes) == 0 {
			return fmt.Errorf("during node debug resume, no node execution found for workflow execution %d", wfExe.ID)
		}

		var nodeID string
		for _, ne := range nodeExes {
			if ne.ParentNodeID == nil {
				nodeID = ne.NodeID
				break
			}
		}

		wf, newSC, err := compose.NewWorkflowFromNode(ctx, workflowSC, vo.NodeKey(nodeID),
			einoCompose.WithGraphName(fmt.Sprintf("%d", wfExe.WorkflowIdentity.ID)))
		if err != nil {
			return fmt.Errorf("failed to create workflow: %w", err)
		}

		config.Mode = vo.ExecuteModeNodeDebug

		cancelCtx, _, opts, err := compose.Prepare(ctx, "", wfExe.GetBasic(),
			req, i.repo, newSC, nil, config)

		wf.AsyncRun(cancelCtx, nil, opts...)
		return nil
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(wfExe.WorkflowIdentity.ID))
	if err != nil {
		return fmt.Errorf("failed to create workflow: %w", err)
	}

	cancelCtx, _, opts, err := compose.Prepare(ctx, "", wfExe.GetBasic(),
		req, i.repo, workflowSC, nil, config)

	wf.AsyncRun(cancelCtx, nil, opts...)

	return nil
}

// StreamResumeWorkflow resumes a workflow execution, using the passed in executionID and eventID.
// Intermediate results during the resuming run are emitted using the returned StreamReader.
// Caller is expected to poll the execution status using the GetExecution method.
func (i *impl) StreamResumeWorkflow(ctx context.Context, req *entity.ResumeRequest, config vo.ExecuteConfig) (
	*schema.StreamReader[*entity.Message], error) {
	// must get the interrupt event
	// generate the state modifier
	wfExe, found, err := i.repo.GetWorkflowExecution(ctx, req.ExecuteID)
	if err != nil {
		return nil, err
	}

	if !found {
		return nil, fmt.Errorf("workflow execution does not exist, id: %d", req.ExecuteID)
	}

	if wfExe.RootExecutionID != wfExe.ID {
		return nil, fmt.Errorf("only root workflow can be resumed")
	}

	if wfExe.Status != entity.WorkflowInterrupted {
		return nil, fmt.Errorf("workflow execution %d is not interrupted, status is %v, cannot resume", req.ExecuteID, wfExe.Status)
	}

	var canvas vo.Canvas
	if len(wfExe.Version) > 0 {
		wf, err := i.repo.GetWorkflowVersion(ctx, wfExe.WorkflowIdentity.ID, wfExe.Version)
		if err != nil {
			return nil, err
		}
		err = sonic.UnmarshalString(wf.Canvas, &canvas)
		if err != nil {
			return nil, err
		}
	} else {
		draft, err := i.repo.GetWorkflowDraft(ctx, wfExe.WorkflowIdentity.ID)
		if err != nil {
			return nil, err
		}
		err = sonic.UnmarshalString(draft.Canvas, &canvas)
		if err != nil {
			return nil, err
		}
	}
	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, &canvas)
	if err != nil {
		return nil, fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, compose.WithIDAsName(wfExe.WorkflowIdentity.ID))
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	config.AppID = wfExe.AppID
	config.AgentID = wfExe.AgentID

	if config.ConnectorID == 0 {
		config.ConnectorID = wfExe.ConnectorID
	}

	sr, sw := schema.Pipe[*entity.Message](10)
	cancelCtx, _, opts, err := compose.Prepare(ctx, "", wfExe.GetBasic(),
		req, i.repo, workflowSC, sw, config)

	wf.AsyncRun(cancelCtx, nil, opts...)

	return sr, nil
}

func (i *impl) CancelWorkflow(ctx context.Context, wfExeID int64, wfID, spaceID int64) error {
	wfExe, found, err := i.repo.GetWorkflowExecution(ctx, wfExeID)
	if err != nil {
		return err
	}

	if !found {
		return fmt.Errorf("workflow execution does not exist, wfExeID: %d", wfExeID)
	}

	if wfExe.WorkflowIdentity.ID != wfID || wfExe.SpaceID != spaceID {
		return fmt.Errorf("workflow execution id mismatch, wfExeID: %d, wfID: %d, spaceID: %d", wfExeID, wfID, spaceID)
	}

	if wfExe.Status != entity.WorkflowRunning && wfExe.Status != entity.WorkflowInterrupted {
		// already reached terminal state, no need to cancel
		return nil
	}

	if wfExe.ID != wfExe.RootExecutionID {
		return fmt.Errorf("can only cancel root execute ID")
	}

	wfExec := &entity.WorkflowExecution{
		ID:     wfExe.ID,
		Status: entity.WorkflowCancel,
	}

	var (
		updatedRows   int64
		currentStatus entity.WorkflowExecuteStatus
	)
	if updatedRows, currentStatus, err = i.repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowInterrupted}); err != nil {
		return fmt.Errorf("failed to save workflow execution to canceled while interrupted: %v", err)
	} else if updatedRows == 0 {
		if currentStatus != entity.WorkflowRunning {
			return fmt.Errorf("failed to update workflow execution to canceled while interrupted for execution id %d, current status is %v", wfExe.ID, currentStatus)
		}

		// current running, let the execution time event handle do the actual updating status to cancel
	}

	err = i.repo.EmitWorkflowCancelSignal(ctx, wfExeID)
	if err != nil {
		return err
	}
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

	mainCanvas.Nodes, mainCanvas.Edges = adaptor.PruneIsolatedNodes(mainCanvas.Nodes, mainCanvas.Edges, nil)
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
	case entity.NodeTypeVariableAggregator:
		return vo.BlockTypeBotVariableMerge, nil

	default:
		return "", fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType)
	}
}

func (i *impl) collectNodePropertyMap(ctx context.Context, canvas *vo.Canvas) (map[string]*vo.NodeProperty, error) {
	nodePropertyMap := make(map[string]*vo.NodeProperty)

	// If it is a nested type, you need to set its parent node
	for _, n := range canvas.Nodes {
		if len(n.Blocks) > 0 {
			for _, nb := range n.Blocks {
				nb.SetParent(n)
			}
		}
	}

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
			nodeSchemas, _, err := adaptor.NodeToNodeSchema(ctx, n)
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

func (i *impl) PublishWorkflow(ctx context.Context, wfID int64, version, desc string, force bool) (err error) {
	// TODO how to use force to publish
	_, err = i.repo.GetWorkflowVersion(ctx, wfID, version)
	if err == nil {
		return fmt.Errorf("workflow version %v already exists", version)
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	latestVersionInfo, err := i.repo.GetLatestWorkflowVersion(ctx, wfID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	versionInfo := &vo.VersionInfo{}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		draftInfo, err := i.repo.GetWorkflowDraft(ctx, wfID)
		if err != nil {
			return err
		}
		uid := ctxutil.GetUIDFromCtx(ctx)
		if uid != nil {
			versionInfo.CreatorID = *uid
		}
		versionInfo.Version = version
		versionInfo.Canvas = draftInfo.Canvas
		versionInfo.InputParams = draftInfo.InputParams
		versionInfo.OutputParams = draftInfo.OutputParams
		versionInfo.VersionDescription = desc

		_, err = i.repo.CreateWorkflowVersion(ctx, wfID, versionInfo)
		if err != nil {
			return err
		}

		now := time.Now().UnixMilli()
		err = search.GetNotifier().PublishWorkflowResource(ctx, search.Updated, &search.Resource{
			WorkflowID:    wfID,
			PublishStatus: ptr.Of(search.Published),
			UpdatedAt:     ptr.Of(now),
			PublishedAt:   ptr.Of(now),
		})
		if err != nil {
			return err
		}

		return nil
	}

	latestVersion, err := parseVersion(latestVersionInfo.Version)
	if err != nil {
		return err
	}
	currentVersion, err := parseVersion(version)
	if err != nil {
		return err
	}

	if !isIncremental(latestVersion, currentVersion) {
		return fmt.Errorf("the version number is not self-incrementing, old version %v, current version is %v", latestVersionInfo.Version, version)
	}

	draftInfo, err := i.repo.GetWorkflowDraft(ctx, wfID)
	if err != nil {
		return err
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid != nil {
		versionInfo.CreatorID = *uid
	}
	versionInfo.Version = version
	versionInfo.Canvas = draftInfo.Canvas
	versionInfo.InputParams = draftInfo.InputParams
	versionInfo.OutputParams = draftInfo.OutputParams
	versionInfo.VersionDescription = desc

	_, err = i.repo.CreateWorkflowVersion(ctx, wfID, versionInfo)
	if err != nil {
		return err
	}
	return nil
}

func (i *impl) UpdateWorkflowMeta(ctx context.Context, wf *entity.Workflow) (err error) {
	err = i.repo.UpdateWorkflowMeta(ctx, wf)
	if err != nil {
		return err
	}

	err = search.GetNotifier().PublishWorkflowResource(ctx, search.Updated, &search.Resource{
		WorkflowID: wf.ID,
		URI:        &wf.IconURI,
		Name:       &wf.Name,
		Desc:       &wf.Desc,
		UpdatedAt:  ptr.Of(time.Now().UnixMilli()),
	})
	if err != nil {
		return err
	}

	return nil
}

func (i *impl) ListWorkflow(ctx context.Context, spaceID int64, page *vo.Page, queryOption *vo.QueryOption) ([]*entity.Workflow, error) {
	wfs, err := i.repo.ListWorkflowMeta(ctx, spaceID, page, queryOption)
	if err != nil {
		return nil, err
	}
	draftIDs := make([]int64, 0)
	for _, wf := range wfs {
		draftIDs = append(draftIDs, wf.ID)
	}

	draftInfos, err := i.repo.MGetWorkflowDraft(ctx, draftIDs)
	if err != nil {
		return nil, err
	}
	for _, w := range wfs {
		draftInfo, ok := draftInfos[w.ID]
		if !ok {
			return nil, fmt.Errorf("draft info not found %v", w.ID)
		}
		w.Canvas = &draftInfo.Canvas
		w.InputParams = make([]*vo.NamedTypeInfo, 0)
		if len(draftInfo.InputParams) > 0 {
			err := sonic.UnmarshalString(draftInfo.InputParams, &w.InputParams)
			if err != nil {
				return nil, err
			}
		}

		if len(draftInfo.OutputParams) > 0 {
			w.OutputParams = make([]*vo.NamedTypeInfo, 0)
			err = sonic.UnmarshalString(draftInfo.OutputParams, &w.OutputParams)
			if err != nil {
				return nil, err
			}
		}

	}

	return wfs, nil
}

func (i *impl) ListWorkflowAsToolData(ctx context.Context, spaceID int64, query *vo.QueryToolInfoOption) ([]*vo.WorkFlowAsToolInfo, error) {
	var (
		err   error
		metas = map[int64]*entity.Workflow{}
	)
	if len(query.IDs) != 0 {
		metas, err = i.repo.MGetWorkflowMeta(ctx, query.IDs...)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return []*vo.WorkFlowAsToolInfo{}, nil
			}
			return nil, err
		}

	} else if query.Page != nil {
		listMetas, err := i.repo.ListWorkflowMeta(ctx, spaceID, query.Page, &vo.QueryOption{
			PublishStatus: vo.HasPublished,
		})
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
			return nil, err
		}

		metas = slices.ToMap(listMetas, func(e *entity.Workflow) (int64, *entity.Workflow) {
			return e.ID, e
		})
	}
	toolInfoList := make([]*vo.WorkFlowAsToolInfo, 0)
	for _, meta := range metas {
		versionInfo, err := i.repo.GetLatestWorkflowVersion(ctx, meta.ID)
		if err != nil {
			return nil, err
		}
		toolInfo := &vo.WorkFlowAsToolInfo{
			ID:            meta.ID,
			Name:          meta.Name,
			Desc:          meta.Desc,
			IconURL:       meta.IconURL,
			PublishStatus: vo.HasPublished,
			VersionName:   versionInfo.Version,
			CreatorID:     meta.CreatorID,
			CreatedAt:     meta.CreatedAt.Unix(),
		}
		if meta.UpdatedAt != nil {
			toolInfo.UpdatedAt = ptr.Of(meta.UpdatedAt.Unix())
		}
		if len(versionInfo.InputParams) == 0 {
			return nil, fmt.Errorf(" workflow id %v, published workflow must has input params", meta.ID)
		}

		namedTypeInfoList := make([]*vo.NamedTypeInfo, 0)
		err = sonic.UnmarshalString(versionInfo.InputParams, &namedTypeInfoList)
		if err != nil {
			return nil, err
		}

		toolInfo.InputParams = namedTypeInfoList

		toolInfoList = append(toolInfoList, toolInfo)

	}

	return toolInfoList, nil
}

func (i *impl) MGetWorkflowDetailInfo(ctx context.Context, identifies []*entity.WorkflowIdentity) ([]*entity.Workflow, error) {
	wfs, err := i.MGetWorkflows(ctx, identifies)
	if err != nil {
		return nil, err
	}
	for _, w := range wfs {
		v, err := i.repo.GetLatestWorkflowVersion(ctx, w.ID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				continue
			}
			return nil, err
		}

		w.LatestFlowVersion = v.Version
		w.LatestFlowVersionDesc = v.VersionDescription
	}
	return wfs, nil
}

func (i *impl) WithMessagePipe() (einoCompose.Option, *schema.StreamReader[*entity.Message]) {
	return execute.WithMessagePipe()
}

func (i *impl) WithExecuteConfig(cfg vo.ExecuteConfig) einoCompose.Option {
	return einoCompose.WithToolsNodeOption(einoCompose.WithToolOption(execute.WithExecuteConfig(cfg)))
}

func (i *impl) WithResumeToolWorkflow(resumingEvent *entity.ToolInterruptEvent, resumeData string,
	allInterruptEvents map[string]*entity.ToolInterruptEvent) einoCompose.Option {
	return einoCompose.WithToolsNodeOption(
		einoCompose.WithToolOption(
			execute.WithResume(&entity.ResumeRequest{
				ExecuteID:  resumingEvent.ExecuteID,
				EventID:    resumingEvent.ID,
				ResumeData: resumeData,
			}, allInterruptEvents)))
}

func (i *impl) CopyWorkflow(ctx context.Context, spaceID int64, workflowID int64) (int64, error) {
	wf, err := i.repo.CopyWorkflow(ctx, spaceID, workflowID)
	if err != nil {
		return 0, err
	}

	// TODO(zhuangjie): publish workflow resource logic should move to application
	err = search.GetNotifier().PublishWorkflowResource(ctx, search.Created, &search.Resource{
		WorkflowID:    wf.ID,
		URI:           &wf.IconURI,
		Name:          &wf.Name,
		Desc:          &wf.Desc,
		APPID:         wf.AppID,
		SpaceID:       &wf.SpaceID,
		OwnerID:       &wf.CreatorID,
		PublishStatus: ptr.Of(search.UnPublished),
		CreatedAt:     ptr.Of(time.Now().UnixMilli()),
	})

	if err != nil {
		return 0, err
	}
	return wf.ID, nil

}

func (i *impl) ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error) {

	draftVersions, wid2Named, err := i.repo.GetDraftWorkflowsByAppID(ctx, appID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // there are no Workflows to be published under the app， return nil,nil
		}
		return nil, err
	}

	allPluginIDMap := slices.ToMap(config.PluginIDs, func(e int64) (string, bool) {
		return strconv.FormatInt(e, 10), true
	})
	var processWfNodes func(nodes []*vo.Node) error
	processWfNodes = func(nodes []*vo.Node) error {
		for _, n := range nodes {
			if n.Type == vo.BlockTypeBotSubWorkflow {
				workflowID, err := strconv.ParseInt(n.Data.Inputs.WorkflowID, 10, 64)
				if err != nil {
					return err
				}
				// in the current app
				if _, ok := draftVersions[workflowID]; ok {
					n.Data.Inputs.WorkflowVersion = config.Version
				}
			}

			if n.Type == vo.BlockTypeBotLLM {
				if n.Data.Inputs.FCParam != nil && n.Data.Inputs.FCParam.WorkflowFCParam != nil {
					for idx := range n.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
						w := n.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList[idx]
						workflowID, err := strconv.ParseInt(w.WorkflowID, 10, 64)
						if err != nil {
							return err
						}
						if _, ok := draftVersions[workflowID]; ok {
							w.WorkflowVersion = config.Version
						}
					}
				}
				if n.Data.Inputs.FCParam != nil && n.Data.Inputs.FCParam.PluginFCParam != nil {
					// In the application, the workflow llm node When the plugin version is equal to 0, the plugin is a plugin created in the application
					for idx := range n.Data.Inputs.FCParam.PluginFCParam.PluginList {
						p := n.Data.Inputs.FCParam.PluginFCParam.PluginList[idx]
						if allPluginIDMap[p.PluginID] {
							p.PluginVersion = config.Version
						}

					}
				}
			}

			if n.Type == vo.BlockTypeBotAPI {
				for _, apiParam := range n.Data.Inputs.APIParams {
					// In the application, the workflow plugin node When the plugin version is equal to 0, the plugin is a plugin created in the application
					if apiParam.Name == "pluginVersion" && apiParam.Input.Value.Content == "0" {
						apiParam.Input.Value.Content = config.Version
					}
				}
			}

			if len(n.Blocks) > 0 {
				err = processWfNodes(n.Blocks)
				if err != nil {
					return err
				}
			}

		}
		return nil
	}

	vIssues := make([]*vo.ValidateIssue, 0)
	for id, draftVersion := range draftVersions {
		issues, err := validateWorkflowTree(ctx, vo.ValidateTreeConfig{
			CanvasSchema: draftVersion.Canvas,
			APPID:        ptr.Of(appID),
		})

		if err != nil {
			return nil, err
		}

		if len(issues) > 0 {
			vIssues = append(vIssues, toValidateIssue(id, wid2Named[id], issues))
		}

	}
	if len(vIssues) > 0 {
		return vIssues, nil
	}

	for _, draftVersion := range draftVersions {
		//TODO(zhuangjie): When a new canvas is generated for storage, the front-end description information of the original canvas will be lost,
		// and the front-end description field needs to be completed in the canvas structure later
		c := &vo.Canvas{}
		err := sonic.UnmarshalString(draftVersion.Canvas, c)
		if err != nil {
			return nil, err
		}

		err = processWfNodes(c.Nodes)
		if err != nil {
			return nil, err
		}

		canvasSchema, err := sonic.MarshalString(c)
		if err != nil {
			return nil, err
		}
		draftVersion.Canvas = canvasSchema

	}

	workflowsToPublish := make(map[int64]*vo.VersionInfo)
	for wid, draftVersion := range draftVersions {
		workflowsToPublish[wid] = &vo.VersionInfo{
			Version:      config.Version,
			Canvas:       draftVersion.Canvas,
			InputParams:  draftVersion.InputParams,
			OutputParams: draftVersion.OutputParams,
			CreatorID:    ctxutil.MustGetUIDFromCtx(ctx),
		}
	}

	err = i.repo.BatchPublishWorkflows(ctx, workflowsToPublish)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (i *impl) CheckWorkflowsExistByAppID(ctx context.Context, appID int64) (bool, error) {
	return i.repo.HasWorkflow(ctx, appID)
}
func (i *impl) BatchDeleteWorkflow(ctx context.Context, ids []int64) error {
	if len(ids) == 1 {
		return i.DeleteWorkflow(ctx, ids[0])
	}
	err := i.repo.BatchDeleteWorkflow(ctx, ids)
	if err != nil {
		return err
	}

	g := errgroup.Group{}
	for _, id := range ids {
		wid := id
		g.Go(func() error {
			err = search.GetNotifier().PublishWorkflowResource(ctx, search.Deleted, &search.Resource{
				WorkflowID: wid,
			})
			return err
		})
	}

	err = g.Wait()
	if err != nil {
		return err
	}
	return nil

}

func (i *impl) DeleteWorkflowsByAppID(ctx context.Context, appID int64) error {
	ids, err := i.repo.GetWorkflowIDsByAppId(ctx, appID)
	if err != nil {
		return err
	}

	err = i.BatchDeleteWorkflow(ctx, ids)
	if err != nil {
		return err
	}
	return nil

}

func (i *impl) shouldResetTestRun(ctx context.Context, c *vo.Canvas, wid int64) (bool, error) {

	sc, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err != nil {
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

func validateWorkflowTree(ctx context.Context, config vo.ValidateTreeConfig) ([]*validate.Issue, error) {
	c := &vo.Canvas{}
	err := sonic.UnmarshalString(config.CanvasSchema, &c)
	c.Nodes, c.Edges = adaptor.PruneIsolatedNodes(c.Nodes, c.Edges, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal canvas schema: %w", err)
	}
	validator, err := validate.NewCanvasValidator(ctx, &validate.Config{
		Canvas:              c,
		APPID:               config.APPID,
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
		return issues, nil
	}

	issues, err = validator.DetectCycles(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check loops: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.ValidateNestedFlows(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check nested batch or recurse: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.CheckRefVariable(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check ref variable: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.CheckGlobalVariables(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check global variables: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.CheckSubWorkFlowTerminatePlanType(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check sub workflow terminate plan type: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	return issues, nil
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

func toValidateErrorData(issues []*validate.Issue) []*cloudworkflow.ValidateErrorData {
	validateErrors := make([]*cloudworkflow.ValidateErrorData, 0, len(issues))
	for _, issue := range issues {
		validateErrors = append(validateErrors, convertToValidationError(issue))
	}
	return validateErrors
}

func toValidateIssue(id int64, name string, issues []*validate.Issue) *vo.ValidateIssue {
	vIssue := &vo.ValidateIssue{
		WorkflowID:   id,
		WorkflowName: name,
	}
	for _, issue := range issues {
		vIssue.IssueMessages = append(vIssue.IssueMessages, issue.Message)
	}
	return vIssue
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
