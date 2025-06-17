package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/redis/go-redis/v9"
	"github.com/spf13/cast"
	"golang.org/x/exp/maps"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"

	einoCompose "github.com/cloudwego/eino/compose"

	cloudworkflow "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type impl struct {
	repo workflow.Repository
	*asToolImpl
	*executableImpl
}

func NewWorkflowService(repo workflow.Repository) workflow.Service {
	return &impl{
		repo: repo,
		asToolImpl: &asToolImpl{
			repo: repo,
		},
		executableImpl: &executableImpl{
			repo: repo,
		},
	}
}

func NewWorkflowRepository(idgen idgen.IDGenerator, db *gorm.DB, redis *redis.Client, tos storage.Storage,
	cpStore einoCompose.CheckPointStore) workflow.Repository {
	return repo.NewRepository(idgen, db, redis, tos, cpStore)
}

func (i *impl) ListNodeMeta(_ context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, error) {
	// Initialize result maps
	nodeMetaMap := make(map[string][]*entity.NodeTypeMeta)

	// Helper function to check if a type should be included based on the filter
	shouldInclude := func(meta *entity.NodeTypeMeta) bool {
		if meta.Disabled {
			return false
		}
		nodeType := meta.Type
		if nodeTypes == nil || len(nodeTypes) == 0 {
			return true // No filter, include all
		}
		_, ok := nodeTypes[nodeType]
		return ok
	}

	// Process standard node types
	for _, meta := range entity.NodeTypeMetas {
		if shouldInclude(meta) {
			category := meta.Category
			nodeMetaMap[category] = append(nodeMetaMap[category], meta)
		}
	}

	return nodeMetaMap, nil
}

func (i *impl) Create(ctx context.Context, meta *vo.Meta) (int64, error) {
	id, err := i.repo.CreateMeta(ctx, meta)
	if err != nil {
		return 0, err
	}

	// save the initialized  canvas information to the draft
	if err = i.Save(ctx, id, vo.GetDefaultInitCanvasJsonSchema()); err != nil {
		return 0, err
	}

	err = search.GetNotifier().PublishWorkflowResource(ctx, search.Created, &search.Resource{
		WorkflowID:    id,
		URI:           &meta.IconURI,
		Name:          &meta.Name,
		Desc:          &meta.Desc,
		APPID:         meta.AppID,
		SpaceID:       &meta.SpaceID,
		OwnerID:       &meta.CreatorID,
		Mode:          ptr.Of(int32(meta.Mode)),
		PublishStatus: ptr.Of(search.UnPublished),
		CreatedAt:     ptr.Of(time.Now().UnixMilli()),
	})
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (i *impl) Save(ctx context.Context, id int64, schema string) (err error) {
	var draft vo.Canvas
	if err = sonic.UnmarshalString(schema, &draft); err != nil {
		return err
	}

	var inputParams, outputParams string
	inputs, outputs := extractInputsAndOutputsNamedInfoList(&draft)
	if inputParams, err = sonic.MarshalString(inputs); err != nil {
		return err
	}

	if outputParams, err = sonic.MarshalString(outputs); err != nil {
		return err
	}

	testRunSuccess, err := i.calculateTestRunSuccess(ctx, &draft, id)
	if err != nil {
		return err
	}

	commitID, err := i.repo.GenID(ctx) // generate a new commit ID for this draft version
	if err != nil {
		return err
	}

	return i.repo.CreateOrUpdateDraft(ctx, id, &vo.DraftInfo{
		Canvas: schema,
		DraftMeta: &vo.DraftMeta{
			TestRunSuccess: testRunSuccess,
			Modified:       true,
		},
		InputParams:  inputParams,
		OutputParams: outputParams,
		CommitID:     strconv.FormatInt(commitID, 10),
	})
}

func extractInputsAndOutputsNamedInfoList(c *vo.Canvas) (inputs []*vo.NamedTypeInfo, outputs []*vo.NamedTypeInfo) {
	defer func() {
		if err := recover(); err != nil {
			logs.Warnf("failed to extract inputs and outputs: %v", err)
		}
	}()
	var (
		startNode *vo.Node
		endNode   *vo.Node
	)
	inputs = make([]*vo.NamedTypeInfo, 0)
	outputs = make([]*vo.NamedTypeInfo, 0)
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

	var err error
	if startNode != nil {
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
			logs.Warn(fmt.Sprintf("transform start node outputs to named info failed, err=%v", err))
		}
	}

	if endNode != nil {
		outputs, err = slices.TransformWithErrorCheck(endNode.Data.Inputs.InputParameters, func(a *vo.Param) (*vo.NamedTypeInfo, error) {
			return adaptor.BlockInputToNamedTypeInfo(a.Name, a.Input)
		})
		if err != nil {
			logs.Warn(fmt.Sprintf("transform end node inputs to named info failed, err=%v", err))
		}
	}

	return inputs, outputs
}

func (i *impl) Delete(ctx context.Context, policy *vo.DeletePolicy) (err error) {
	if policy.ID != nil || len(policy.IDs) == 1 {
		var id int64
		if policy.ID != nil {
			id = *policy.ID
		} else {
			id = policy.IDs[0]
		}

		if err = i.repo.Delete(ctx, id); err != nil {
			return err
		}

		return search.GetNotifier().PublishWorkflowResource(ctx, search.Deleted, &search.Resource{
			WorkflowID: id,
		})
	}

	ids := policy.IDs
	if policy.AppID != nil {
		metas, err := i.repo.MGetMeta(ctx, &vo.MetaQuery{
			AppID: policy.AppID,
		})
		if err != nil {
			return err
		}
		ids = maps.Keys(metas)
	}

	if err = i.repo.MDelete(ctx, ids); err != nil {
		return err
	}

	g := errgroup.Group{}
	for i := range ids {
		wid := ids[i]
		g.Go(func() error {
			return search.GetNotifier().PublishWorkflowResource(ctx, search.Deleted, &search.Resource{
				WorkflowID: wid,
			})
		})
	}

	return g.Wait()
}

func (i *impl) Get(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error) {
	meta, err := i.repo.GetMeta(ctx, policy.ID)
	if err != nil {
		return nil, err
	}

	if policy.MetaOnly {
		return &entity.Workflow{
			ID:   policy.ID,
			Meta: meta,
		}, nil
	}

	var (
		canvas, inputParams, outputParams string
		draftMeta                         *vo.DraftMeta
		versionMeta                       *vo.VersionMeta
		commitID                          string
	)
	switch policy.QType {
	case vo.FromDraft:
		draft, err := i.repo.DraftV2(ctx, policy.ID, policy.CommitID)
		if err != nil {
			return nil, err
		}

		canvas = draft.Canvas
		inputParams = draft.InputParams
		outputParams = draft.OutputParams
		draftMeta = draft.DraftMeta
		commitID = draft.CommitID
	case vo.FromSpecificVersion:
		v, err := i.repo.GetVersion(ctx, policy.ID, policy.Version)
		if err != nil {
			return nil, err
		}
		canvas = v.Canvas
		inputParams = v.InputParams
		outputParams = v.OutputParams
		versionMeta = v.VersionMeta
		commitID = v.CommitID
	case vo.FromLatestVersion:
		v, err := i.repo.GetLatestVersion(ctx, policy.ID)
		if err != nil {
			return nil, err
		}
		canvas = v.Canvas
		inputParams = v.InputParams
		outputParams = v.OutputParams
		versionMeta = v.VersionMeta
		commitID = v.CommitID
	default:
		return nil, errors.New("invalid query type")
	}

	var inputs, outputs []*vo.NamedTypeInfo
	if inputParams != "" {
		err = sonic.UnmarshalString(inputParams, &inputs)
		if err != nil {
			return nil, err
		}
	}
	if outputParams != "" {
		err = sonic.UnmarshalString(outputParams, &outputs)
		if err != nil {
			return nil, err
		}
	}

	return &entity.Workflow{
		ID:       policy.ID,
		CommitID: commitID,
		Meta:     meta,
		CanvasInfoV2: &vo.CanvasInfoV2{
			Canvas:       canvas,
			InputParams:  inputs,
			OutputParams: outputs,
		},
		DraftMeta:   draftMeta,
		VersionMeta: versionMeta,
	}, nil
}

func (i *impl) GetWorkflowReference(ctx context.Context, id int64) (map[int64]*vo.Meta, error) {
	parent, err := i.repo.GetParentWorkflowsBySubWorkflowID(ctx, id)
	if err != nil {
		return nil, err
	}

	if len(parent) == 0 {
		// if not parent, it means that it is not cited, so it is returned empty
		return map[int64]*vo.Meta{}, nil
	}

	wfIDs := make([]int64, 0, len(parent))
	for _, ref := range parent {
		wfIDs = append(wfIDs, ref.ID)
	}

	wfMetas, err := i.repo.MGetMeta(ctx, &vo.MetaQuery{
		IDs: wfIDs,
	})
	if err != nil {
		return nil, err
	}

	return wfMetas, nil
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
		var ids []int64
		for _, e := range subWorkflowIdentities {
			if e.Version != "" {
				continue
			}
			// only project-level workflows need to validate sub-workflows
			ids = append(ids, cast.ToInt64(e.ID)) // TODO: this should be int64 from the start
		}
		workflows, err := i.MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs: ids,
			},
			QType: vo.FromDraft,
		})
		if err != nil {
			return nil, err
		}

		for _, wf := range workflows {
			issues, err = validateWorkflowTree(ctx, vo.ValidateTreeConfig{
				CanvasSchema: wf.Canvas,
				AppID:        wf.AppID, // application workflow use same app id
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

func (i *impl) QueryNodeProperties(ctx context.Context, wfID int64) (map[string]*vo.NodeProperty, error) {
	draftInfo, err := i.repo.DraftV2(ctx, wfID, "")
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
				versionInfo, err := i.repo.GetVersion(ctx, wid, n.Data.Inputs.WorkflowVersion)
				if err != nil {
					return nil, err
				}
				canvasSchema = versionInfo.Canvas
			} else {
				draftInfo, err := i.repo.DraftV2(ctx, wid, "")
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

func (i *impl) Publish(ctx context.Context, policy *vo.PublishPolicy) (err error) {
	meta, err := i.repo.GetMeta(ctx, policy.ID)
	if err != nil {
		return err
	}

	if meta.LatestPublishedVersion != nil {
		latestVersion, err := parseVersion(*meta.LatestPublishedVersion)
		if err != nil {
			return err
		}
		currentVersion, err := parseVersion(policy.Version)
		if err != nil {
			return err
		}

		if !isIncremental(latestVersion, currentVersion) {
			return fmt.Errorf("the version number is not self-incrementing, old version %v, current version is %v", *meta.LatestPublishedVersion, policy.Version)
		}
	}

	draft, err := i.repo.DraftV2(ctx, policy.ID, policy.CommitID)
	if err != nil {
		return err
	}

	if !policy.Force && !draft.TestRunSuccess {
		return fmt.Errorf("workflow %d's current draft needs to pass the test run before publishing", policy.ID)
	}

	versionInfo := &vo.VersionInfo{
		VersionMeta: &vo.VersionMeta{
			Version:            policy.Version,
			VersionDescription: policy.VersionDescription,
			VersionCreatorID:   policy.CreatorID,
		},
		CanvasInfo: vo.CanvasInfo{
			Canvas:       draft.Canvas,
			InputParams:  draft.InputParams,
			OutputParams: draft.OutputParams,
		},
		CommitID: draft.CommitID,
	}

	if err = i.repo.CreateVersion(ctx, policy.ID, versionInfo); err != nil {
		return err
	}

	now := time.Now().UnixMilli()
	if err = search.GetNotifier().PublishWorkflowResource(ctx, search.Updated, &search.Resource{
		WorkflowID:    policy.ID,
		PublishStatus: ptr.Of(search.Published),
		UpdatedAt:     ptr.Of(now),
		PublishedAt:   ptr.Of(now),
	}); err != nil {
		return err
	}

	return nil
}

func (i *impl) UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) (err error) {
	err = i.repo.UpdateMeta(ctx, id, metaUpdate)
	if err != nil {
		return err
	}

	err = search.GetNotifier().PublishWorkflowResource(ctx, search.Updated, &search.Resource{
		WorkflowID: id,
		URI:        metaUpdate.IconURI,
		Name:       metaUpdate.Name,
		Desc:       metaUpdate.Desc,
		UpdatedAt:  ptr.Of(time.Now().UnixMilli()),
	})
	if err != nil {
		return err
	}

	return nil
}

func (i *impl) CopyWorkflow(ctx context.Context, workflowID int64, cfg vo.CopyWorkflowConfig) (int64, error) {
	wf, err := i.repo.CopyWorkflow(ctx, workflowID, cfg)
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
	wfs, err := i.MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			AppID: &appID,
		},
		QType: vo.FromDraft,
	})

	relatedPlugins := make(map[int64]entity.PluginEntity, len(wfs))
	relatedWorkflow := make(map[int64]entity.IDVersionPair, len(config.PluginIDs))

	for _, wf := range wfs {
		relatedWorkflow[wf.ID] = entity.IDVersionPair{
			ID:      wf.ID,
			Version: config.Version,
		}
	}
	for _, id := range config.PluginIDs {
		relatedPlugins[id] = entity.PluginEntity{
			PluginID:      id,
			PluginVersion: &config.Version,
		}
	}

	vIssues := make([]*vo.ValidateIssue, 0)
	for _, wf := range wfs {
		issues, err := validateWorkflowTree(ctx, vo.ValidateTreeConfig{
			CanvasSchema: wf.Canvas,
			AppID:        ptr.Of(appID),
		})

		if err != nil {
			return nil, err
		}

		if len(issues) > 0 {
			vIssues = append(vIssues, toValidateIssue(wf.ID, wf.Name, issues))
		}

	}
	if len(vIssues) > 0 {
		return vIssues, nil
	}

	for _, wf := range wfs {
		c := &vo.Canvas{}
		err := sonic.UnmarshalString(wf.Canvas, c)
		if err != nil {
			return nil, err
		}

		err = replaceRelatedWorkflowOrPluginInWorkflowNodes(c.Nodes, relatedWorkflow, relatedPlugins)

		if err != nil {
			return nil, err
		}

		canvasSchema, err := sonic.MarshalString(c)
		if err != nil {
			return nil, err
		}
		wf.Canvas = canvasSchema

	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)

	workflowsToPublish := make(map[int64]*vo.VersionInfo)
	for _, wf := range wfs {
		inputStr, err := sonic.MarshalString(wf.InputParams)
		if err != nil {
			return nil, err
		}

		outputStr, err := sonic.MarshalString(wf.OutputParams)
		if err != nil {
			return nil, err
		}

		workflowsToPublish[wf.ID] = &vo.VersionInfo{
			VersionMeta: &vo.VersionMeta{
				Version:          config.Version,
				VersionCreatorID: userID,
			},
			CanvasInfo: vo.CanvasInfo{
				Canvas:       wf.Canvas,
				InputParams:  inputStr,
				OutputParams: outputStr,
			},
		}
	}

	for id, vInfo := range workflowsToPublish {
		if err = i.repo.CreateVersion(ctx, id, vInfo); err != nil {
			return nil, err
		}
	}

	return nil, nil
}

func (i *impl) CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, appID int64, relatedPlugins map[int64]entity.PluginEntity) ([]*vo.ValidateIssue, error) {

	type copiedWorkflow struct {
		id        int64
		draftInfo *vo.DraftInfo
		refWfs    map[int64]*copiedWorkflow
	}
	var (
		err          error
		vIssues      = make([]*vo.ValidateIssue, 0)
		draftVersion *vo.DraftInfo
	)

	draftVersion, err = i.repo.DraftV2(ctx, workflowID, "")
	if err != nil {
		return nil, err
	}

	issues, err := validateWorkflowTree(ctx, vo.ValidateTreeConfig{
		CanvasSchema: draftVersion.Canvas,
		AppID:        ptr.Of(appID),
	})
	if err != nil {
		return nil, err
	}

	draftWorkflows, wid2Named, err := i.repo.GetDraftWorkflowsByAppID(ctx, appID)
	if err != nil {
		return nil, err
	}

	if len(issues) > 0 {
		vIssues = append(vIssues, toValidateIssue(workflowID, wid2Named[workflowID], issues))
	}

	var validateAndBuildWorkflowReference func(nodes []*vo.Node, wf *copiedWorkflow) error
	hasVerifiedWorkflowIDMap := make(map[int64]bool)

	validateAndBuildWorkflowReference = func(nodes []*vo.Node, wf *copiedWorkflow) error {
		for _, node := range nodes {
			if node.Type == vo.BlockTypeBotSubWorkflow {
				var (
					v    *vo.DraftInfo
					wfID int64
					ok   bool
				)
				wfID, err = strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
				if err != nil {
					return err
				}

				if v, ok = draftWorkflows[wfID]; !ok {
					continue
				}
				if _, ok = wf.refWfs[wfID]; ok {
					continue
				}

				if !hasVerifiedWorkflowIDMap[wfID] {
					issues, err = validateWorkflowTree(ctx, vo.ValidateTreeConfig{
						CanvasSchema: v.Canvas,
						AppID:        ptr.Of(appID),
					})
					if err != nil {
						return err
					}

					if len(issues) > 0 {
						vIssues = append(vIssues, toValidateIssue(wfID, wid2Named[wfID], issues))
					}
					hasVerifiedWorkflowIDMap[wfID] = true
				}

				swf := &copiedWorkflow{
					id:        wfID,
					draftInfo: v,
					refWfs:    make(map[int64]*copiedWorkflow),
				}
				wf.refWfs[wfID] = swf
				var subCanvas *vo.Canvas
				err = sonic.UnmarshalString(v.Canvas, &subCanvas)
				if err != nil {
					return err
				}
				err = validateAndBuildWorkflowReference(subCanvas.Nodes, swf)
				if err != nil {
					return err
				}

			}

			if node.Type == vo.BlockTypeBotLLM {
				if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
					for _, w := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
						var (
							v    *vo.DraftInfo
							wfID int64
							ok   bool
						)
						wfID, err = strconv.ParseInt(w.WorkflowID, 10, 64)
						if err != nil {
							return err
						}

						if v, ok = draftWorkflows[wfID]; !ok {
							continue
						}

						if _, ok = wf.refWfs[wfID]; ok {
							continue
						}

						if !hasVerifiedWorkflowIDMap[wfID] {
							issues, err = validateWorkflowTree(ctx, vo.ValidateTreeConfig{
								CanvasSchema: v.Canvas,
								AppID:        ptr.Of(appID),
							})
							if err != nil {
								return err
							}

							if len(issues) > 0 {
								vIssues = append(vIssues, toValidateIssue(wfID, wid2Named[wfID], issues))
							}
							hasVerifiedWorkflowIDMap[wfID] = true
						}

						swf := &copiedWorkflow{
							id:        wfID,
							draftInfo: v,
							refWfs:    make(map[int64]*copiedWorkflow),
						}
						wf.refWfs[wfID] = swf
						var subCanvas *vo.Canvas
						err = sonic.UnmarshalString(v.Canvas, &subCanvas)
						if err != nil {
							return err
						}

						err = validateAndBuildWorkflowReference(subCanvas.Nodes, swf)
						if err != nil {
							return err
						}
					}

				}

			}

			if len(node.Blocks) > 0 {
				err := validateAndBuildWorkflowReference(node.Blocks, wf)
				if err != nil {
					return err
				}
			}
		}
		return nil
	}

	copiedWf := &copiedWorkflow{
		id:        workflowID,
		draftInfo: draftVersion,
		refWfs:    make(map[int64]*copiedWorkflow),
	}
	draftCanvas := &vo.Canvas{}
	err = sonic.UnmarshalString(draftVersion.Canvas, &draftCanvas)
	if err != nil {
		return nil, err
	}

	err = validateAndBuildWorkflowReference(draftCanvas.Nodes, copiedWf)
	if err != nil {
		return nil, err
	}

	if len(vIssues) > 0 {
		return vIssues, nil
	}

	var copyAndPublishWorkflowProcess func(wf *copiedWorkflow) error

	hasPublishedWorkflows := make(map[int64]entity.IDVersionPair)

	workflowPublishVersion := "v0.0.1"

	if relatedPlugins == nil {
		relatedPlugins = map[int64]entity.PluginEntity{}
	}
	copyAndPublishWorkflowProcess = func(wf *copiedWorkflow) error {
		for _, refWorkflow := range wf.refWfs {
			err := copyAndPublishWorkflowProcess(refWorkflow)
			if err != nil {
				return err
			}
		}
		if _, ok := hasPublishedWorkflows[wf.id]; !ok {

			var (
				draftCanvasString = wf.draftInfo.Canvas
				inputParams       = wf.draftInfo.InputParams
				outputParams      = wf.draftInfo.OutputParams
			)

			canvas := &vo.Canvas{}
			err = sonic.UnmarshalString(draftCanvasString, &canvas)
			if err != nil {
				return err
			}
			err = replaceRelatedWorkflowOrPluginInWorkflowNodes(canvas.Nodes, hasPublishedWorkflows, relatedPlugins)
			if err != nil {
				return err
			}

			modifiedCanvasString, err := sonic.MarshalString(canvas)
			if err != nil {
				return err
			}

			cwf, err := i.repo.CopyWorkflowFromAppToLibrary(ctx, wf.id, modifiedCanvasString)
			if err != nil {
				return err
			}

			err = i.repo.CreateVersion(ctx, cwf.ID, &vo.VersionInfo{
				VersionMeta: &vo.VersionMeta{
					Version:          workflowPublishVersion,
					VersionCreatorID: ctxutil.MustGetUIDFromCtx(ctx),
				},
				CanvasInfo: vo.CanvasInfo{
					Canvas:       modifiedCanvasString,
					InputParams:  inputParams,
					OutputParams: outputParams,
				},
			})
			if err != nil {
				return err
			}

			err = search.GetNotifier().PublishWorkflowResource(ctx, search.Created, &search.Resource{
				WorkflowID:    cwf.ID,
				URI:           &cwf.IconURI,
				Name:          &cwf.Name,
				Desc:          &cwf.Desc,
				SpaceID:       &cwf.SpaceID,
				OwnerID:       &cwf.CreatorID,
				PublishStatus: ptr.Of(search.Published),
				CreatedAt:     ptr.Of(time.Now().UnixMilli()),
			})
			if err != nil {
				return err
			}

			hasPublishedWorkflows[wf.id] = entity.IDVersionPair{
				ID:      cwf.ID,
				Version: workflowPublishVersion,
			}
		}
		return nil
	}

	err = copyAndPublishWorkflowProcess(copiedWf)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (i *impl) MGet(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, error) {
	metas, err := i.repo.MGetMeta(ctx, &policy.MetaQuery)
	if err != nil {
		return nil, err
	}

	result := make([]*entity.Workflow, len(metas))
	var index int

	if len(metas) == 0 {
		return result, nil
	} else if policy.MetaOnly {
		for id := range metas {
			wf := &entity.Workflow{
				ID:   id,
				Meta: metas[id],
			}
			result[index] = wf
			index++
		}
		return result, nil
	}

	ioF := func(inputParam, outputParam string) (input []*vo.NamedTypeInfo, output []*vo.NamedTypeInfo, err error) {
		if inputParam != "" {
			err := sonic.UnmarshalString(inputParam, &input)
			if err != nil {
				return nil, nil, err
			}
		}

		if outputParam != "" {
			err := sonic.UnmarshalString(outputParam, &output)
			if err != nil {
				return nil, nil, err
			}
		}

		return input, output, err
	}

	switch policy.QType {
	case vo.FromDraft:
		draftInfos, err := i.repo.MGetDraft(ctx, maps.Keys(metas))
		if err != nil {
			return nil, err
		}

		for id := range metas {
			inputs, outputs, err := ioF(draftInfos[id].InputParams, draftInfos[id].OutputParams)
			if err != nil {
				return nil, err
			}

			wf := &entity.Workflow{
				ID:       id,
				Meta:     metas[id],
				CommitID: draftInfos[id].CommitID,
				CanvasInfoV2: &vo.CanvasInfoV2{
					Canvas:       draftInfos[id].Canvas,
					InputParams:  inputs,
					OutputParams: outputs,
				},
				DraftMeta: draftInfos[id].DraftMeta,
			}
			result[index] = wf
			index++
		}

		return result, nil
	case vo.FromSpecificVersion:
		for id := range metas {
			version, ok := policy.Versions[id]
			if !ok {
				return nil, fmt.Errorf("version not found for workflow %v", id)
			}
			v, err := i.repo.GetVersion(ctx, id, version)
			if err != nil {
				return nil, err
			}

			inputs, outputs, err := ioF(v.InputParams, v.OutputParams)
			if err != nil {
				return nil, err
			}

			wf := &entity.Workflow{
				ID:       id,
				Meta:     metas[id],
				CommitID: v.CommitID,
				CanvasInfoV2: &vo.CanvasInfoV2{
					Canvas:       v.Canvas,
					InputParams:  inputs,
					OutputParams: outputs,
				},
				VersionMeta: v.VersionMeta,
			}
			result[index] = wf
			index++
		}
	case vo.FromLatestVersion:
		for id := range metas {
			v, err := i.repo.GetLatestVersion(ctx, id)
			if err != nil {
				return nil, err
			}

			inputs, outputs, err := ioF(v.InputParams, v.OutputParams)
			if err != nil {
				return nil, err
			}

			wf := &entity.Workflow{
				ID:       id,
				Meta:     metas[id],
				CommitID: v.CommitID,
				CanvasInfoV2: &vo.CanvasInfoV2{
					Canvas:       v.Canvas,
					InputParams:  inputs,
					OutputParams: outputs,
				},
				VersionMeta: v.VersionMeta,
			}
			result[index] = wf
			index++
		}
	default:
		panic("not implemented")
	}

	return result, nil
}

func (i *impl) calculateTestRunSuccess(ctx context.Context, c *vo.Canvas, wid int64) (bool, error) {
	sc, err := adaptor.CanvasToWorkflowSchema(ctx, c)
	if err != nil { // not even legal, test run can't possibly be successful
		return false, nil
	}

	existedDraft, err := i.repo.DraftV2(ctx, wid, "")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil // previous draft version not exists, does not have any test run
		}
		return false, err
	}

	var existedDraftCanvas vo.Canvas
	err = sonic.UnmarshalString(existedDraft.Canvas, &existedDraftCanvas)
	existedSc, err := adaptor.CanvasToWorkflowSchema(ctx, &existedDraftCanvas)
	if err == nil { // the old existing draft is legal, check if it's equal to the new draft in terms of execution
		if !existedSc.IsEqual(sc) { // there is modification to the execution logic, needs new test run
			return false, nil
		}
	} else { // the old existing draft is not legal, of course haven't any successful test run
		return false, nil
	}

	return existedDraft.TestRunSuccess, nil // inherit previous draft snapshot's test run success flag
}
