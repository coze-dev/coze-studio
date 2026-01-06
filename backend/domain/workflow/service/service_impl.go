/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/spf13/cast"
	"golang.org/x/exp/maps"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"

	cloudworkflow "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/adaptor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/repo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/infra/cache"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type impl struct {
	repo workflow.Repository
	*asToolImpl
	*executableImpl
	*conversationImpl
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
		conversationImpl: &conversationImpl{repo: repo},
	}
}

func NewWorkflowRepository(idgen idgen.IDGenerator, db *gorm.DB, redis cache.Cmdable, tos storage.Storage,
	cpStore einoCompose.CheckPointStore, chatModel modelbuilder.BaseChatModel, cfg workflow.WorkflowConfig) (workflow.Repository, error) {
	return repo.NewRepository(idgen, db, redis, tos, cpStore, chatModel, cfg)
}

func (i *impl) ListNodeMeta(_ context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, []entity.Category, error) {
	// Initialize result maps
	nodeMetaMap := make(map[string][]*entity.NodeTypeMeta)

	// Helper function to check if a type should be included based on the filter
	shouldInclude := func(meta *entity.NodeTypeMeta) bool {
		if meta.Disabled {
			return false
		}
		nodeType := meta.Key
		if nodeTypes == nil || len(nodeTypes) == 0 {
			return true // No filter, include all
		}
		_, ok := nodeTypes[nodeType]
		return ok
	}

	// Process standard node types
	for _, meta := range entity.NodeTypeMetas {
		if shouldInclude(meta) {
			nodeMetaMap[meta.Category] = append(nodeMetaMap[meta.Category], meta)
		}
	}

	return nodeMetaMap, entity.Categories, nil
}

func (i *impl) Create(ctx context.Context, meta *vo.MetaCreate) (int64, error) {
	id, err := i.repo.CreateMeta(ctx, &vo.Meta{
		CreatorID:   meta.CreatorID,
		SpaceID:     meta.SpaceID,
		ContentType: meta.ContentType,
		Name:        meta.Name,
		Desc:        meta.Desc,
		IconURI:     meta.IconURI,
		AppID:       meta.AppID,
		Mode:        meta.Mode,
	})
	if err != nil {
		return 0, err
	}

	// save the initialized  canvas information to the draft
	if err = i.Save(ctx, id, meta.InitCanvasSchema); err != nil {
		return 0, err
	}

	return id, nil
}

func (i *impl) Save(ctx context.Context, id int64, schema string) (err error) {
	var draft vo.Canvas
	if err = sonic.UnmarshalString(schema, &draft); err != nil {
		return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	var inputParams, outputParams string
	inputs, outputs := extractInputsAndOutputsNamedInfoList(&draft)
	if inputParams, err = sonic.MarshalString(inputs); err != nil {
		return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	if outputParams, err = sonic.MarshalString(outputs); err != nil {
		return vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	testRunSuccess, err := i.calculateTestRunSuccess(ctx, &draft, id)
	if err != nil {
		return err
	}

	commitID, err := i.repo.GenID(ctx) // generate a new commit ID for this draft version
	if err != nil {
		return vo.WrapError(errno.ErrIDGenError, err)
	}

	return i.repo.CreateOrUpdateDraft(ctx, id, &vo.DraftInfo{
		Canvas: schema,
		DraftMeta: &vo.DraftMeta{
			TestRunSuccess: testRunSuccess,
			Modified:       true,
		},
		InputParamsStr:  inputParams,
		OutputParamsStr: outputParams,
		CommitID:        strconv.FormatInt(commitID, 10),
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
		if node.Type == entity.NodeTypeEntry.IDStr() {
			startNode = node
		}
		if node.Type == entity.NodeTypeExit.IDStr() {
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
			nInfo, err := convert.VariableToNamedTypeInfo(v)
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
			return convert.BlockInputToNamedTypeInfo(a.Name, a.Input)
		})
		if err != nil {
			logs.Warn(fmt.Sprintf("transform end node inputs to named info failed, err=%v", err))
		}
	}

	return inputs, outputs
}

func (i *impl) Delete(ctx context.Context, policy *vo.DeletePolicy) (ids []int64, err error) {
	if policy.ID != nil || len(policy.IDs) == 1 {
		var id int64
		if policy.ID != nil {
			id = *policy.ID
		} else {
			id = policy.IDs[0]
		}

		if err = i.repo.Delete(ctx, id); err != nil {
			return nil, err
		}

		return []int64{id}, nil
	}

	ids = policy.IDs
	if policy.AppID != nil {
		metas, _, err := i.repo.MGetMetas(ctx, &vo.MetaQuery{
			AppID: policy.AppID,
		})
		if err != nil {
			return nil, err
		}
		ids = maps.Keys(metas)
	}

	if err = i.repo.MDelete(ctx, ids); err != nil {
		return nil, err
	}

	return ids, nil
}

func (i *impl) Get(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error) {
	return i.repo.GetEntity(ctx, policy)
}

func (i *impl) GetWorkflowReference(ctx context.Context, id int64) (map[int64]*vo.Meta, error) {
	parent, err := i.repo.MGetReferences(ctx, &vo.MGetReferencePolicy{
		ReferredIDs:      []int64{id},
		ReferringBizType: []vo.ReferringBizType{vo.ReferringBizTypeWorkflow},
	})
	if err != nil {
		return nil, err
	}

	if len(parent) == 0 {
		// if not parent, it means that it is not cited, so it is returned empty
		return map[int64]*vo.Meta{}, nil
	}

	wfIDs := make(map[int64]struct{}, len(parent))
	for _, ref := range parent {
		wfIDs[ref.ReferringID] = struct{}{}
	}
	ret, _, err := i.repo.MGetMetas(ctx, &vo.MetaQuery{
		IDs: maps.Keys(wfIDs),
	})
	if err != nil {
		return nil, err
	}

	return ret, nil
}

type workflowIdentity struct {
	ID      string `json:"id"`
	Version string `json:"version"`
}

func getAllSubWorkflowIdentities(c *vo.Canvas) []*workflowIdentity {
	workflowEntities := make([]*workflowIdentity, 0)

	var collectSubWorkFlowEntities func(nodes []*vo.Node)
	collectSubWorkFlowEntities = func(nodes []*vo.Node) {
		for _, n := range nodes {
			if n.Type == entity.NodeTypeSubWorkflow.IDStr() {
				workflowEntities = append(workflowEntities, &workflowIdentity{
					ID:      n.Data.Inputs.WorkflowID,
					Version: n.Data.Inputs.WorkflowVersion,
				})
			}
			if len(n.Blocks) > 0 {
				collectSubWorkFlowEntities(n.Blocks)
			}
		}
	}

	collectSubWorkFlowEntities(c.Nodes)

	return workflowEntities
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
			Errors:     toValidateErrorData(issues),
		})
	}

	c := &vo.Canvas{}
	err = sonic.UnmarshalString(validateConfig.CanvasSchema, &c)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail,
			fmt.Errorf("failed to unmarshal canvas schema: %w", err))
	}

	subWorkflowIdentities := getAllSubWorkflowIdentities(c)

	if len(subWorkflowIdentities) > 0 {
		var ids []int64
		for _, e := range subWorkflowIdentities {
			if e.Version != "" {
				continue
			}
			// only project-level workflows need to validate sub-workflows
			ids = append(ids, cast.ToInt64(e.ID)) // TODO: this should be int64 from the start
		}
		if len(ids) == 0 {
			return wfValidateInfos, nil
		}
		workflows, _, err := i.MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs: ids,
			},
			QType: workflowModel.FromDraft,
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
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
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
		if n.Type == entity.NodeTypeSubWorkflow.IDStr() {
			nodeSchema := &schema.NodeSchema{
				Key:  vo.NodeKey(n.ID),
				Type: entity.NodeTypeSubWorkflow,
				Name: n.Data.Meta.Title,
			}
			err := convert.SetInputsForNodeSchema(n, nodeSchema)
			if err != nil {
				return nil, err
			}
			prop := &vo.NodeProperty{
				Type:                nodeSchema.Type.IDStr(),
				IsEnableUserQuery:   isEnableUserQuery(nodeSchema),
				IsEnableChatHistory: isEnableChatHistory(nodeSchema),
				IsRefGlobalVariable: isRefGlobalVariable(nodeSchema),
			}
			nodePropertyMap[string(nodeSchema.Key)] = prop
			wid, err := strconv.ParseInt(n.Data.Inputs.WorkflowID, 10, 64)
			if err != nil {
				return nil, vo.WrapError(errno.ErrSchemaConversionFail, err)
			}

			var canvasSchema string
			if n.Data.Inputs.WorkflowVersion != "" {
				versionInfo, existed, err := i.repo.GetVersion(ctx, wid, n.Data.Inputs.WorkflowVersion)
				if err != nil {
					return nil, err
				}
				if !existed {
					return nil, vo.WrapError(errno.ErrWorkflowNotFound, fmt.Errorf("workflow version %s not found for ID %d: %w", n.Data.Inputs.WorkflowVersion, wid, err), errorx.KV("id", strconv.FormatInt(wid, 10)))
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
				return nil, vo.WrapError(errno.ErrSchemaConversionFail, err)
			}
			ret, err := i.collectNodePropertyMap(ctx, c)
			if err != nil {
				return nil, err
			}
			prop.SubWorkflow = ret

		} else {
			nodeSchemas, _, err := adaptor.NodeToNodeSchema(ctx, n, canvas)
			if err != nil {
				return nil, err
			}
			for _, nodeSchema := range nodeSchemas {
				nodePropertyMap[string(nodeSchema.Key)] = &vo.NodeProperty{
					Type:                nodeSchema.Type.IDStr(),
					IsEnableUserQuery:   isEnableUserQuery(nodeSchema),
					IsEnableChatHistory: isEnableChatHistory(nodeSchema),
					IsRefGlobalVariable: isRefGlobalVariable(nodeSchema),
				}
			}

		}
	}
	return nodePropertyMap, nil
}

func isEnableUserQuery(s *schema.NodeSchema) bool {
	if s == nil {
		return false
	}
	if s.Type != entity.NodeTypeEntry {
		return false
	}

	if len(s.OutputSources) == 0 {
		return false
	}

	for _, source := range s.OutputSources {
		fieldPath := source.Path
		if len(fieldPath) == 1 && (fieldPath[0] == "BOT_USER_INPUT" || fieldPath[0] == "USER_INPUT") {
			return true
		}
	}

	return false
}

func isEnableChatHistory(s *schema.NodeSchema) bool {
	if s == nil {
		return false
	}

	chatHistoryAware, ok := s.Configs.(schema.ChatHistoryAware)
	if !ok {
		return false
	}

	return chatHistoryAware.ChatHistoryEnabled()
}

func isRefGlobalVariable(s *schema.NodeSchema) bool {
	for _, source := range s.InputSources {
		if source.IsRefGlobalVariable() {
			return true
		}
	}
	for _, source := range s.OutputSources {
		if source.IsRefGlobalVariable() {
			return true
		}
	}
	return false
}

func (i *impl) CreateChatFlowRole(ctx context.Context, role *vo.ChatFlowRoleCreate) (int64, error) {
	id, err := i.repo.CreateChatFlowRoleConfig(ctx, &entity.ChatFlowRole{
		Name:                role.Name,
		Description:         role.Description,
		WorkflowID:          role.WorkflowID,
		CreatorID:           role.CreatorID,
		AudioConfig:         role.AudioConfig,
		UserInputConfig:     role.UserInputConfig,
		AvatarUri:           role.AvatarUri,
		BackgroundImageInfo: role.BackgroundImageInfo,
		OnboardingInfo:      role.OnboardingInfo,
		SuggestReplyInfo:    role.SuggestReplyInfo,
	})

	if err != nil {
		return 0, err
	}

	return id, nil
}

func (i *impl) UpdateChatFlowRole(ctx context.Context, workflowID int64, role *vo.ChatFlowRoleUpdate) error {
	err := i.repo.UpdateChatFlowRoleConfig(ctx, workflowID, role)

	if err != nil {
		return err
	}

	return nil
}

func (i *impl) GetChatFlowRole(ctx context.Context, workflowID int64, version string) (*entity.ChatFlowRole, error) {
	role, err, isExist := i.repo.GetChatFlowRoleConfig(ctx, workflowID, version)
	if !isExist {
		logs.CtxWarnf(ctx, "chat flow role not exist, workflow id %v, version %v", workflowID, version)
		// Return (nil, nil) on 'NotExist' to align with the production behavior,
		// where the GET API may be called before the CREATE API during chatflow creation.
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return role, nil
}

func (i *impl) GetWorkflowVersionsByConnector(ctx context.Context, connectorID, workflowID int64, limit int) ([]string, error) {
	return i.repo.GetVersionListByConnectorAndWorkflowID(ctx, connectorID, workflowID, limit)
}

func (i *impl) DeleteChatFlowRole(ctx context.Context, id int64, workflowID int64) error {
	return i.repo.DeleteChatFlowRoleConfig(ctx, id, workflowID)
}

func (i *impl) PublishChatFlowRole(ctx context.Context, policy *vo.PublishRolePolicy) error {
	if policy.WorkflowID == 0 || policy.CreatorID == 0 || policy.Version == "" {
		logs.CtxErrorf(ctx, "invalid publish role policy, workflow id %v, creator id %v should not be zero, version %v should not be empty", policy.WorkflowID, policy.CreatorID, policy.Version)
		return vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("invalid publish role policy, workflow id %v, creator id %v should not be zero, version %v should not be empty", policy.WorkflowID, policy.CreatorID, policy.Version))
	}
	wf, err := i.repo.GetEntity(ctx, &vo.GetPolicy{
		ID:       policy.WorkflowID,
		MetaOnly: true,
	})
	if err != nil {
		return err
	}
	if wf.Mode != cloudworkflow.WorkflowMode_ChatFlow {
		return vo.WrapError(errno.ErrChatFlowRoleOperationFail, fmt.Errorf("workflow id %v, mode %v is not a chatflow", policy.WorkflowID, wf.Mode))
	}
	role, err, isExist := i.repo.GetChatFlowRoleConfig(ctx, policy.WorkflowID, "")
	if !isExist {
		logs.CtxErrorf(ctx, "get draft chat flow role nil, workflow id %v", policy.WorkflowID)
		return vo.WrapError(errno.ErrChatFlowRoleOperationFail, fmt.Errorf("get draft chat flow role nil, workflow id %v", policy.WorkflowID))
	}
	if err != nil {
		return vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err)
	}

	_, err = i.repo.CreateChatFlowRoleConfig(ctx, &entity.ChatFlowRole{
		Name:                role.Name,
		Description:         role.Description,
		WorkflowID:          policy.WorkflowID,
		CreatorID:           policy.CreatorID,
		AudioConfig:         role.AudioConfig,
		UserInputConfig:     role.UserInputConfig,
		AvatarUri:           role.AvatarUri,
		BackgroundImageInfo: role.BackgroundImageInfo,
		OnboardingInfo:      role.OnboardingInfo,
		SuggestReplyInfo:    role.SuggestReplyInfo,
		Version:             policy.Version,
	})

	if err != nil {
		return err
	}
	return nil
}

func canvasToRefs(referringID int64, canvasStr string) (map[entity.WorkflowReferenceKey]struct{}, error) {
	var canvas vo.Canvas
	if err := sonic.UnmarshalString(canvasStr, &canvas); err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	wfRefs := map[entity.WorkflowReferenceKey]struct{}{}
	var getRefFn func([]*vo.Node) error
	getRefFn = func(nodes []*vo.Node) error {
		for _, node := range nodes {
			if node.Type == entity.NodeTypeSubWorkflow.IDStr() {
				referredID, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
				if err != nil {
					return vo.WrapError(errno.ErrSchemaConversionFail, err)
				}
				wfRefs[entity.WorkflowReferenceKey{
					ReferredID:       referredID,
					ReferringID:      referringID,
					ReferType:        vo.ReferTypeSubWorkflow,
					ReferringBizType: vo.ReferringBizTypeWorkflow,
				}] = struct{}{}
			} else if node.Type == entity.NodeTypeLLM.IDStr() {
				if node.Data.Inputs.LLM != nil {
					if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
						for _, w := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
							referredID, err := strconv.ParseInt(w.WorkflowID, 10, 64)
							if err != nil {
								return vo.WrapError(errno.ErrSchemaConversionFail, err)
							}
							wfRefs[entity.WorkflowReferenceKey{
								ReferredID:       referredID,
								ReferringID:      referringID,
								ReferType:        vo.ReferTypeTool,
								ReferringBizType: vo.ReferringBizTypeWorkflow,
							}] = struct{}{}
						}
					}
				}
			} else if len(node.Blocks) > 0 {
				for _, subNode := range node.Blocks {
					if err := getRefFn([]*vo.Node{subNode}); err != nil {
						return err
					}
				}
			}
		}
		return nil
	}

	if err := getRefFn(canvas.Nodes); err != nil {
		return nil, err
	}

	return wfRefs, nil
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

	wfRefs, err := canvasToRefs(policy.ID, draft.Canvas)
	if err != nil {
		return err
	}

	versionInfo := &vo.VersionInfo{
		VersionMeta: &vo.VersionMeta{
			Version:            policy.Version,
			VersionDescription: policy.VersionDescription,
			VersionCreatorID:   policy.CreatorID,
		},
		CanvasInfo: vo.CanvasInfo{
			Canvas:          draft.Canvas,
			InputParamsStr:  draft.InputParamsStr,
			OutputParamsStr: draft.OutputParamsStr,
		},
		CommitID: draft.CommitID,
	}

	if err = i.repo.CreateVersion(ctx, policy.ID, versionInfo, wfRefs); err != nil {
		return err
	}

	return nil
}

func (i *impl) UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) (err error) {
	err = i.repo.UpdateMeta(ctx, id, metaUpdate)
	if err != nil {
		return err
	}

	if metaUpdate.WorkflowMode != nil && *metaUpdate.WorkflowMode == cloudworkflow.WorkflowMode_ChatFlow {
		err = i.adaptToChatFlow(ctx, id)
		if err != nil {
			return err
		}
	}

	return nil
}

func (i *impl) CopyWorkflow(ctx context.Context, workflowID int64, policy vo.CopyWorkflowPolicy) (*entity.Workflow, error) {
	wf, err := i.repo.CopyWorkflow(ctx, workflowID, policy)
	if err != nil {
		return nil, err
	}
	// chat flow should copy role config
	if wf.Mode == cloudworkflow.WorkflowMode_ChatFlow {
		role, err, isExist := i.repo.GetChatFlowRoleConfig(ctx, workflowID, "")
		if !isExist {
			logs.CtxErrorf(ctx, "get draft chat flow role nil, workflow id %v", workflowID)
			return nil, vo.WrapError(errno.ErrChatFlowRoleOperationFail, fmt.Errorf("get draft chat flow role nil, workflow id %v", workflowID))
		}

		if err != nil {
			return nil, vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err)
		}
		_, err = i.repo.CreateChatFlowRoleConfig(ctx, &entity.ChatFlowRole{
			Name:                role.Name,
			Description:         role.Description,
			WorkflowID:          wf.ID,
			CreatorID:           wf.CreatorID,
			AudioConfig:         role.AudioConfig,
			UserInputConfig:     role.UserInputConfig,
			AvatarUri:           role.AvatarUri,
			BackgroundImageInfo: role.BackgroundImageInfo,
			OnboardingInfo:      role.OnboardingInfo,
			SuggestReplyInfo:    role.SuggestReplyInfo,
		})

		if err != nil {
			return nil, err
		}

	}

	return wf, nil

}

func (i *impl) ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error) {
	if len(config.ConnectorIDs) == 0 {
		return nil, fmt.Errorf("connector ids is required")
	}

	allWorkflowsInApp, _, err := i.MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			AppID: &appID,
		},
		QType: workflowModel.FromDraft,
	})
	if err != nil {
		return nil, err
	}

	relatedPlugins := make(map[int64]*vo.PluginEntity, len(config.PluginIDs))
	relatedWorkflow := make(map[int64]entity.IDVersionPair, len(allWorkflowsInApp))

	for _, wf := range allWorkflowsInApp {
		relatedWorkflow[wf.ID] = entity.IDVersionPair{
			ID:      wf.ID,
			Version: config.Version,
		}
	}

	for _, id := range config.PluginIDs {
		relatedPlugins[id] = &vo.PluginEntity{
			PluginID:      id,
			PluginVersion: &config.Version,
		}
	}

	vIssues := make([]*vo.ValidateIssue, 0)

	willPublishWorkflows := make([]*entity.Workflow, 0)

	if len(config.WorkflowIDs) == 0 {
		willPublishWorkflows = allWorkflowsInApp
	} else {
		willPublishWorkflows, _, err = i.MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				AppID: &appID,
				IDs:   config.WorkflowIDs,
			},
			QType: workflowModel.FromDraft,
		})
	}

	for _, wf := range willPublishWorkflows {
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

	for _, wf := range willPublishWorkflows {
		c := &vo.Canvas{}
		err := sonic.UnmarshalString(wf.Canvas, c)
		if err != nil {
			return nil, err
		}

		err = replaceRelatedWorkflowOrExternalResourceInWorkflowNodes(c.Nodes, relatedWorkflow, vo.ExternalResourceRelated{
			PluginMap: relatedPlugins,
		})

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
	for _, wf := range willPublishWorkflows {
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
				Canvas:          wf.Canvas,
				InputParamsStr:  inputStr,
				OutputParamsStr: outputStr,
			},
			CommitID: wf.CommitID,
		}
	}

	workflowIDs := make([]int64, 0, len(willPublishWorkflows))
	for id, vInfo := range workflowsToPublish {
		// if version existed skip
		_, existed, err := i.repo.GetVersion(ctx, id, config.Version)
		if err != nil {
			return nil, err
		}
		if existed {
			continue
		}
		wfRefs, err := canvasToRefs(id, vInfo.Canvas)
		if err != nil {
			return nil, err
		}

		workflowIDs = append(workflowIDs, id)
		if err = i.repo.CreateVersion(ctx, id, vInfo, wfRefs); err != nil {
			return nil, err
		}
	}

	err = i.ReleaseConversationTemplate(ctx, appID, config.Version)
	if err != nil {
		return nil, err
	}

	for _, wf := range willPublishWorkflows {
		if wf.Mode == cloudworkflow.WorkflowMode_ChatFlow {
			err = i.PublishChatFlowRole(ctx, &vo.PublishRolePolicy{
				WorkflowID: wf.ID,
				CreatorID:  wf.CreatorID,
				Version:    config.Version,
			})
			if err != nil {
				return nil, err
			}
		}
	}

	for _, connectorID := range config.ConnectorIDs {
		err = i.repo.BatchCreateConnectorWorkflowVersion(ctx, appID, connectorID, workflowIDs, config.Version)
		if err != nil {
			return nil, err
		}
	}

	return nil, nil
}

func (i *impl) CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, appID int64, related vo.ExternalResourceRelated) (*entity.CopyWorkflowFromAppToLibraryResult, error) {
	type copiedWorkflow struct {
		id        int64
		draftInfo *vo.DraftInfo
		refWfs    map[int64]*copiedWorkflow
	}
	var (
		err                    error
		vIssues                = make([]*vo.ValidateIssue, 0)
		draftVersion           *vo.DraftInfo
		workflowPublishVersion = "v0.0.1"
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
			if node.Type == entity.NodeTypeSubWorkflow.IDStr() {
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

			if node.Type == entity.NodeTypeLLM.IDStr() {
				if node.Data.Inputs.LLM != nil && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
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
		return &entity.CopyWorkflowFromAppToLibraryResult{
			ValidateIssues: vIssues,
		}, nil
	}

	var copyAndPublishWorkflowProcess func(wf *copiedWorkflow) error

	hasPublishedWorkflows := make(map[int64]entity.IDVersionPair)
	copiedWorkflowArray := make([]*entity.Workflow, 0)
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
				inputParams       = wf.draftInfo.InputParamsStr
				outputParams      = wf.draftInfo.OutputParamsStr
			)

			canvas := &vo.Canvas{}
			err = sonic.UnmarshalString(draftCanvasString, &canvas)
			if err != nil {
				return err
			}
			err = replaceRelatedWorkflowOrExternalResourceInWorkflowNodes(canvas.Nodes, hasPublishedWorkflows, related)
			if err != nil {
				return err
			}

			modifiedCanvasString, err := sonic.MarshalString(canvas)
			if err != nil {
				return err
			}

			cwf, err := i.CopyWorkflow(ctx, wf.id, vo.CopyWorkflowPolicy{
				TargetAppID:          ptr.Of(int64(0)),
				ModifiedCanvasSchema: ptr.Of(modifiedCanvasString),
			})
			if err != nil {
				return err
			}

			wfRefs, err := canvasToRefs(cwf.ID, modifiedCanvasString)
			if err != nil {
				return err
			}

			err = i.repo.CreateVersion(ctx, cwf.ID, &vo.VersionInfo{
				CommitID: cwf.CommitID,
				VersionMeta: &vo.VersionMeta{
					Version:          workflowPublishVersion,
					VersionCreatorID: ctxutil.MustGetUIDFromCtx(ctx),
				},
				CanvasInfo: vo.CanvasInfo{
					Canvas:          modifiedCanvasString,
					InputParamsStr:  inputParams,
					OutputParamsStr: outputParams,
				},
			}, wfRefs)
			if err != nil {
				return err
			}

			copiedWorkflowArray = append(copiedWorkflowArray, cwf)

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

	return &entity.CopyWorkflowFromAppToLibraryResult{
		WorkflowIDVersionMap: hasPublishedWorkflows,
		CopiedWorkflows:      copiedWorkflowArray,
	}, nil

}

func (i *impl) DuplicateWorkflowsByAppID(ctx context.Context, sourceAppID, targetAppID int64, related vo.ExternalResourceRelated) ([]*entity.Workflow, error) {

	type copiedWorkflow struct {
		id           int64
		draftInfo    *vo.DraftInfo
		refWfs       map[int64]*copiedWorkflow
		err          error
		draftVersion *vo.DraftInfo
	}

	draftWorkflows, _, err := i.repo.GetDraftWorkflowsByAppID(ctx, sourceAppID)
	if err != nil {
		return nil, err
	}

	var duplicateWorkflowProcess func(workflowID int64, info *vo.DraftInfo) error

	hasCopiedWorkflows := make(map[int64]entity.IDVersionPair)
	var buildWorkflowReference func(nodes []*vo.Node, wf *copiedWorkflow) error
	buildWorkflowReference = func(nodes []*vo.Node, wf *copiedWorkflow) error {
		for _, node := range nodes {
			if node.Type == entity.NodeTypeSubWorkflow.IDStr() {
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
				err = buildWorkflowReference(subCanvas.Nodes, swf)
				if err != nil {
					return err
				}

			}
			if node.Type == entity.NodeTypeLLM.IDStr() {
				if node.Data.Inputs.LLM != nil && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
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

						err = buildWorkflowReference(subCanvas.Nodes, swf)
						if err != nil {
							return err
						}
					}

				}

			}
			if len(node.Blocks) > 0 {
				err := buildWorkflowReference(node.Blocks, wf)
				if err != nil {
					return err
				}
			}
		}
		return nil
	}

	copiedWorkflowArray := make([]*entity.Workflow, 0)
	var duplicateWorkflow func(wf *copiedWorkflow) error
	duplicateWorkflow = func(wf *copiedWorkflow) error {
		for _, refWorkflow := range wf.refWfs {
			err := duplicateWorkflow(refWorkflow)
			if err != nil {
				return err
			}
		}
		if _, ok := hasCopiedWorkflows[wf.id]; !ok {
			draftCanvasString := wf.draftInfo.Canvas
			canvas := &vo.Canvas{}
			err = sonic.UnmarshalString(draftCanvasString, &canvas)
			if err != nil {
				return err
			}
			err = replaceRelatedWorkflowOrExternalResourceInWorkflowNodes(canvas.Nodes, hasCopiedWorkflows, related)
			if err != nil {
				return err
			}

			modifiedCanvasString, err := sonic.MarshalString(canvas)
			if err != nil {
				return err
			}

			cwf, err := i.CopyWorkflow(ctx, wf.id, vo.CopyWorkflowPolicy{
				TargetAppID:          ptr.Of(targetAppID),
				ModifiedCanvasSchema: ptr.Of(modifiedCanvasString),
			})
			if err != nil {
				return err
			}

			copiedWorkflowArray = append(copiedWorkflowArray, cwf)

			hasCopiedWorkflows[wf.id] = entity.IDVersionPair{
				ID: cwf.ID,
			}
		}
		return nil
	}

	duplicateWorkflowProcess = func(workflowID int64, draftVersion *vo.DraftInfo) error {
		copiedWf := &copiedWorkflow{
			id:        workflowID,
			draftInfo: draftVersion,
			refWfs:    make(map[int64]*copiedWorkflow),
		}
		draftCanvas := &vo.Canvas{}
		err = sonic.UnmarshalString(draftVersion.Canvas, &draftCanvas)
		if err != nil {
			return err
		}
		err = buildWorkflowReference(draftCanvas.Nodes, copiedWf)
		if err != nil {
			return err
		}
		err = duplicateWorkflow(copiedWf)
		if err != nil {
			return err
		}
		return nil
	}

	for workflowID, draftVersion := range draftWorkflows {
		if _, ok := hasCopiedWorkflows[workflowID]; ok {
			continue
		}
		err = duplicateWorkflowProcess(workflowID, draftVersion)
		if err != nil {
			return nil, err
		}
	}

	err = i.repo.CopyTemplateConversationByAppID(ctx, sourceAppID, targetAppID)
	if err != nil {
		return nil, err
	}

	return copiedWorkflowArray, nil

}

func (i *impl) SyncRelatedWorkflowResources(ctx context.Context, appID int64, relatedWorkflows map[int64]entity.IDVersionPair, related vo.ExternalResourceRelated) error {
	draftVersions, _, err := i.repo.GetDraftWorkflowsByAppID(ctx, appID)
	if err != nil {
		return err
	}
	commitIDs, err := i.repo.GenMultiIDs(ctx, len(draftVersions)-len(relatedWorkflows))
	if err != nil {
		return err
	}

	g := &errgroup.Group{}
	idx := 0
	for id, vInfo := range draftVersions {
		if _, ok := relatedWorkflows[id]; ok {
			continue
		}
		commitID := commitIDs[idx]
		idx++
		verInfo := vInfo
		wid := id
		g.Go(func() error {
			canvas := &vo.Canvas{}
			err = sonic.UnmarshalString(verInfo.Canvas, &canvas)
			err = replaceRelatedWorkflowOrExternalResourceInWorkflowNodes(canvas.Nodes, relatedWorkflows, related)
			if err != nil {
				return err
			}
			modifiedCanvasString, err := sonic.MarshalString(canvas)
			if err != nil {
				return err
			}

			return i.repo.CreateOrUpdateDraft(ctx, wid, &vo.DraftInfo{
				DraftMeta: &vo.DraftMeta{
					TestRunSuccess: false,
					Modified:       true,
				},
				Canvas:          modifiedCanvasString,
				InputParamsStr:  verInfo.InputParamsStr,
				OutputParamsStr: verInfo.OutputParamsStr,
				CommitID:        strconv.FormatInt(commitID, 10),
			})

		})
	}
	return g.Wait()

}

func (i *impl) GetWorkflowDependenceResource(ctx context.Context, workflowID int64) (*vo.DependenceResource, error) {
	wf, err := i.Get(ctx, &vo.GetPolicy{
		ID:    workflowID,
		QType: workflowModel.FromDraft,
	})
	if err != nil {
		return nil, err
	}
	canvas := &vo.Canvas{}
	err = sonic.UnmarshalString(wf.Canvas, canvas)
	if err != nil {
		return nil, err
	}

	ds := &vo.DependenceResource{
		PluginIDs:    make([]int64, 0),
		KnowledgeIDs: make([]int64, 0),
		DatabaseIDs:  make([]int64, 0),
	}
	var collectDependence func(nodes []*vo.Node) error
	collectDependence = func(nodes []*vo.Node) error {
		for _, node := range nodes {
			nType := entity.IDStrToNodeType(node.Type)
			meta := entity.NodeMetaByNodeType(nType)
			if meta.UseDatabase {
				dsList := node.Data.Inputs.DatabaseInfoList
				if len(dsList) == 0 {
					return fmt.Errorf("database info is requird")
				}
				for _, d := range dsList {
					dsID, err := strconv.ParseInt(d.DatabaseInfoID, 10, 64)
					if err != nil {
						return err
					}
					ds.DatabaseIDs = append(ds.DatabaseIDs, dsID)
				}
				continue
			}

			if meta.UseKnowledge {
				datasetListInfoParam := node.Data.Inputs.DatasetParam[0]
				datasetIDs := datasetListInfoParam.Input.Value.Content.([]any)
				for _, id := range datasetIDs {
					k, err := strconv.ParseInt(id.(string), 10, 64)
					if err != nil {
						return err
					}
					ds.KnowledgeIDs = append(ds.KnowledgeIDs, k)
				}

				continue
			}

			if meta.UsePlugin {
				apiParams := slices.ToMap(node.Data.Inputs.APIParams, func(e *vo.Param) (string, *vo.Param) {
					return e.Name, e
				})
				pluginIDParam, ok := apiParams["pluginID"]
				if !ok {
					return fmt.Errorf("plugin id param is not found")
				}
				pID, err := strconv.ParseInt(pluginIDParam.Input.Value.Content.(string), 10, 64)
				if err != nil {
					return err
				}

				pluginVersionParam, ok := apiParams["pluginVersion"]
				if !ok {
					return fmt.Errorf("plugin version param is not found")
				}

				pVersion := pluginVersionParam.Input.Value.Content.(string)
				if pVersion == "0" { // version = 0 to represent the plug-in in the app
					ds.PluginIDs = append(ds.PluginIDs, pID)
				}
			}

			switch nType {
			case entity.NodeTypeLLM:
				if node.Data.Inputs.LLM != nil && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.PluginFCParam != nil {
					for idx := range node.Data.Inputs.FCParam.PluginFCParam.PluginList {
						if node.Data.Inputs.FCParam.PluginFCParam.PluginList[idx].IsDraft {
							pl := node.Data.Inputs.FCParam.PluginFCParam.PluginList[idx]
							pluginID, err := strconv.ParseInt(pl.PluginID, 10, 64)
							if err != nil {
								return err
							}
							ds.PluginIDs = append(ds.PluginIDs, pluginID)

						}
					}
				}
				if node.Data.Inputs.LLM != nil && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.KnowledgeFCParam != nil {
					for idx := range node.Data.Inputs.FCParam.KnowledgeFCParam.KnowledgeList {
						kn := node.Data.Inputs.FCParam.KnowledgeFCParam.KnowledgeList[idx]
						kid, err := strconv.ParseInt(kn.ID, 10, 64)
						if err != nil {
							return err
						}
						ds.KnowledgeIDs = append(ds.KnowledgeIDs, kid)

					}
				}

				if node.Data.Inputs.LLM != nil && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
					for idx := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
						if node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList[idx].IsDraft {
							wID, err := strconv.ParseInt(node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList[idx].WorkflowID, 10, 64)
							if err != nil {
								return err
							}

							wfe, err := i.repo.GetEntity(ctx, &vo.GetPolicy{
								ID:    wID,
								QType: workflowModel.FromDraft,
							})
							if err != nil {
								return err
							}

							workflowToolCanvas := &vo.Canvas{}
							err = sonic.UnmarshalString(wfe.Canvas, workflowToolCanvas)
							if err != nil {
								return err
							}

							err = collectDependence(workflowToolCanvas.Nodes)
							if err != nil {
								return err
							}
						}

					}

				}

			case entity.NodeTypeSubWorkflow:
				if node.Data.Inputs.WorkflowVersion == "" {
					wfID, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
					if err != nil {
						return err
					}

					subWorkflow, err := i.repo.GetEntity(ctx, &vo.GetPolicy{
						ID:    wfID,
						QType: workflowModel.FromDraft,
					})
					if err != nil {
						return err
					}

					subCanvas := &vo.Canvas{}
					err = sonic.UnmarshalString(subWorkflow.Canvas, subCanvas)
					if err != nil {
						return err
					}

					err = collectDependence(subCanvas.Nodes)
					if err != nil {
						return err
					}
				}

			}

		}
		return nil
	}

	err = collectDependence(canvas.Nodes)
	if err != nil {
		return nil, err
	}
	return ds, nil

}

func (i *impl) checkBotAgentNode(node *vo.Node) error {
	if node.Type == entity.NodeTypeCreateConversation.IDStr() || node.Type == entity.NodeTypeConversationDelete.IDStr() || node.Type == entity.NodeTypeConversationUpdate.IDStr() || node.Type == entity.NodeTypeConversationList.IDStr() {
		return errors.New("conversation-related nodes are not supported in chatflow")
	}
	return nil
}

func (i *impl) validateNodesRecursively(ctx context.Context, nodes []*vo.Node, checkType cloudworkflow.CheckType, visited map[string]struct{}, repo workflow.Repository) error {
	queue := make([]*vo.Node, 0, len(nodes))
	queue = append(queue, nodes...)

	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]

		if node == nil {
			continue
		}

		var checkErr error
		switch checkType {
		case cloudworkflow.CheckType_BotAgent:
			checkErr = i.checkBotAgentNode(node)
		default:
			// For now, we only handle BotAgent check, so we can do nothing here.
			// In the future, if there are other check types that need to be validated on every node, this logic will need to be adjusted.
		}
		if checkErr != nil {
			return checkErr
		}

		// Enqueue nested nodes for BFS traversal. This handles Loop, Batch, and other nodes with nested blocks.
		if len(node.Blocks) > 0 {
			queue = append(queue, node.Blocks...)
		}

		if node.Type == entity.NodeTypeSubWorkflow.IDStr() && node.Data != nil && node.Data.Inputs != nil {
			workflowIDStr := node.Data.Inputs.WorkflowID
			if workflowIDStr == "" {
				continue
			}

			workflowID, err := strconv.ParseInt(workflowIDStr, 10, 64)
			if err != nil {
				return fmt.Errorf("invalid workflow ID in sub-workflow node %s: %w", node.ID, err)
			}

			version := node.Data.Inputs.WorkflowVersion
			qType := workflowModel.FromDraft
			if version != "" {
				qType = workflowModel.FromSpecificVersion
			}

			visitedKey := fmt.Sprintf("%d:%s", workflowID, version)
			if _, ok := visited[visitedKey]; ok {
				continue
			}
			visited[visitedKey] = struct{}{}

			subWfEntity, err := repo.GetEntity(ctx, &vo.GetPolicy{
				ID:      workflowID,
				QType:   qType,
				Version: version,
			})
			if err != nil {
				delete(visited, visitedKey)
				if errors.Is(err, gorm.ErrRecordNotFound) {
					continue
				}
				return fmt.Errorf("failed to get sub-workflow entity %d: %w", workflowID, err)
			}

			var canvas vo.Canvas
			if err := sonic.UnmarshalString(subWfEntity.Canvas, &canvas); err != nil {
				return fmt.Errorf("failed to unmarshal canvas for workflow %d: %w", subWfEntity.ID, err)
			}

			queue = append(queue, canvas.Nodes...)
		}

		if node.Type == entity.NodeTypeLLM.IDStr() && node.Data != nil && node.Data.Inputs != nil && node.Data.Inputs.LLM != nil && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
			for _, subWfInfo := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
				if subWfInfo.WorkflowID == "" {
					continue
				}
				workflowID, err := strconv.ParseInt(subWfInfo.WorkflowID, 10, 64)
				if err != nil {
					return fmt.Errorf("invalid workflow ID in large model node %s: %w", node.ID, err)
				}

				version := subWfInfo.WorkflowVersion
				qType := workflowModel.FromDraft
				if version != "" {
					qType = workflowModel.FromSpecificVersion
				}

				visitedKey := fmt.Sprintf("%d:%s", workflowID, version)
				if _, ok := visited[visitedKey]; ok {
					continue
				}
				visited[visitedKey] = struct{}{}

				subWfEntity, err := repo.GetEntity(ctx, &vo.GetPolicy{
					ID:      workflowID,
					QType:   qType,
					Version: version,
				})
				if err != nil {
					delete(visited, visitedKey)
					if errors.Is(err, gorm.ErrRecordNotFound) {
						continue
					}
					return fmt.Errorf("failed to get sub-workflow entity %d from large model node: %w", workflowID, err)
				}

				var canvas vo.Canvas
				if err := sonic.UnmarshalString(subWfEntity.Canvas, &canvas); err != nil {
					return fmt.Errorf("failed to unmarshal canvas for workflow %d from large model node: %w", subWfEntity.ID, err)
				}

				queue = append(queue, canvas.Nodes...)
			}
		}
	}
	return nil
}

func (i *impl) WorkflowSchemaCheck(ctx context.Context, wf *entity.Workflow, checks []cloudworkflow.CheckType) ([]*cloudworkflow.CheckResult, error) {
	checkResults := make([]*cloudworkflow.CheckResult, 0, len(checks))

	var canvas vo.Canvas
	if err := sonic.UnmarshalString(wf.Canvas, &canvas); err != nil {
		return nil, fmt.Errorf("failed to unmarshal canvas for workflow %d: %w", wf.ID, err)
	}

	for _, checkType := range checks {
		visited := make(map[string]struct{})
		visitedKey := fmt.Sprintf("%d:%s", wf.ID, wf.GetVersion())
		visited[visitedKey] = struct{}{}

		err := i.validateNodesRecursively(ctx, canvas.Nodes, checkType, visited, i.repo)

		if err != nil {
			checkResults = append(checkResults, &cloudworkflow.CheckResult{
				IsPass: false,
				Reason: err.Error(),
				Type:   checkType,
			})
		} else {
			checkResults = append(checkResults, &cloudworkflow.CheckResult{
				IsPass: true,
				Type:   checkType,
				Reason: "",
			})
		}
	}
	return checkResults, nil
}

func (i *impl) MGet(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, int64, error) {
	if policy.MetaOnly {
		metas, total, err := i.repo.MGetMetas(ctx, &policy.MetaQuery)
		if err != nil {
			return nil, 0, err
		}

		result := make([]*entity.Workflow, len(metas))
		var index int

		if len(metas) == 0 {
			return result, 0, nil
		}

		for id := range metas {
			wf := &entity.Workflow{
				ID:   id,
				Meta: metas[id],
			}
			result[index] = wf
			index++
		}
		return result, total, nil
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
	case workflowModel.FromDraft:
		return i.repo.MGetDrafts(ctx, policy)
	case workflowModel.FromSpecificVersion:
		if len(policy.IDs) == 0 || len(policy.Versions) != len(policy.IDs) {
			return nil, 0, fmt.Errorf("ids and versions are required when MGet from specific versions")
		}

		metas, total, err := i.repo.MGetMetas(ctx, &policy.MetaQuery)
		if err != nil {
			return nil, total, err
		}

		result := make([]*entity.Workflow, len(metas))
		index := 0

		for id, version := range policy.Versions {
			v, existed, err := i.repo.GetVersion(ctx, id, version)
			if err != nil {
				return nil, total, err
			}
			if !existed {
				return nil, total, vo.WrapError(errno.ErrWorkflowNotFound, fmt.Errorf("workflow version %s not found for ID %d: %w", version, id, err), errorx.KV("id", strconv.FormatInt(id, 10)))
			}
			inputs, outputs, err := ioF(v.InputParamsStr, v.OutputParamsStr)
			if err != nil {
				return nil, total, err
			}

			wf := &entity.Workflow{
				ID:       id,
				Meta:     metas[id],
				CommitID: v.CommitID,
				CanvasInfo: &vo.CanvasInfo{
					Canvas:          v.Canvas,
					InputParams:     inputs,
					OutputParams:    outputs,
					InputParamsStr:  v.InputParamsStr,
					OutputParamsStr: v.OutputParamsStr,
				},
				VersionMeta: v.VersionMeta,
			}
			result[index] = wf
			index++
		}

		return result, total, nil
	case workflowModel.FromLatestVersion:
		return i.repo.MGetLatestVersion(ctx, policy)
	default:
		panic("not implemented")
	}
}

func (i *impl) BindConvRelatedInfo(ctx context.Context, convID int64, info entity.ConvRelatedInfo) error {
	return i.repo.BindConvRelatedInfo(ctx, convID, info)
}

func (i *impl) GetConvRelatedInfo(ctx context.Context, convID int64) (*entity.ConvRelatedInfo, bool, func() error, error) {
	return i.repo.GetConvRelatedInfo(ctx, convID)
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

func replaceRelatedWorkflowOrExternalResourceInWorkflowNodes(nodes []*vo.Node, relatedWorkflows map[int64]entity.IDVersionPair, related vo.ExternalResourceRelated) error {
	var (
		hasWorkflowRelated  = len(relatedWorkflows) > 0
		hasPluginRelated    = len(related.PluginMap) > 0
		hasKnowledgeRelated = len(related.KnowledgeMap) > 0
		hasDatabaseRelated  = len(related.DatabaseMap) > 0
	)

	for _, node := range nodes {
		nType := entity.IDStrToNodeType(node.Type)
		meta := entity.NodeMetaByNodeType(nType)
		if meta.UseDatabase {
			if !hasDatabaseRelated || node.Data.Inputs.DatabaseNode == nil {
				continue
			}
			dsList := node.Data.Inputs.DatabaseInfoList
			for idx := range dsList {
				databaseInfo := dsList[idx]
				did, err := strconv.ParseInt(databaseInfo.DatabaseInfoID, 10, 64)
				if err != nil {
					return err
				}
				if refDatabaseID, ok := related.DatabaseMap[did]; ok {
					databaseInfo.DatabaseInfoID = strconv.FormatInt(refDatabaseID, 10)
				}

			}
			continue
		}

		if meta.UseKnowledge {
			if !hasKnowledgeRelated || node.Data.Inputs.Knowledge == nil {
				continue
			}
			datasetListInfoParam := node.Data.Inputs.DatasetParam[0]
			knowledgeIDs := datasetListInfoParam.Input.Value.Content.([]any)
			for idx := range knowledgeIDs {
				kid, err := strconv.ParseInt(knowledgeIDs[idx].(string), 10, 64)
				if err != nil {
					return err
				}
				if refKnowledgeID, ok := related.KnowledgeMap[kid]; ok {
					knowledgeIDs[idx] = strconv.FormatInt(refKnowledgeID, 10)
				}
			}

			continue
		}

		if meta.UsePlugin {
			if !hasPluginRelated || node.Data.Inputs.PluginAPIParam == nil {
				continue
			}
			apiParams := slices.ToMap(node.Data.Inputs.APIParams, func(e *vo.Param) (string, *vo.Param) {
				return e.Name, e
			})
			pluginIDParam, ok := apiParams["pluginID"]
			if !ok {
				return fmt.Errorf("plugin id param is not found")
			}

			pID, err := strconv.ParseInt(pluginIDParam.Input.Value.Content.(string), 10, 64)
			if err != nil {
				return err
			}

			pluginVersionParam, ok := apiParams["pluginVersion"]
			if !ok {
				return fmt.Errorf("plugin version param is not found")
			}

			if refPlugin, ok := related.PluginMap[pID]; ok {
				pluginIDParam.Input.Value.Content = strconv.FormatInt(refPlugin.PluginID, 10)
				if refPlugin.PluginVersion != nil {
					pluginVersionParam.Input.Value.Content = *refPlugin.PluginVersion
				}
			}

			apiIDParam, ok := apiParams["apiID"]
			if !ok {
				return fmt.Errorf("apiID param is not found")
			}

			apiID, err := strconv.ParseInt(apiIDParam.Input.Value.Content.(string), 10, 64)
			if err != nil {
				return err
			}

			if refApiID, ok := related.PluginToolMap[apiID]; ok {
				apiIDParam.Input.Value.Content = strconv.FormatInt(refApiID, 10)
			}

			continue
		}

		switch nType {
		case entity.NodeTypeSubWorkflow:
			if !hasWorkflowRelated || node.Data.Inputs.SubWorkflow == nil {
				continue
			}
			workflowID, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
			if err != nil {
				return err
			}
			if wf, ok := relatedWorkflows[workflowID]; ok {
				node.Data.Inputs.WorkflowID = strconv.FormatInt(wf.ID, 10)
				node.Data.Inputs.WorkflowVersion = wf.Version
			}
		case entity.NodeTypeLLM:
			if node.Data.Inputs.LLM == nil {
				continue
			}
			if hasWorkflowRelated && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
				for idx := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
					wf := node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList[idx]
					workflowID, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
					if err != nil {
						return err
					}
					if refWf, ok := relatedWorkflows[workflowID]; ok {
						wf.WorkflowID = strconv.FormatInt(refWf.ID, 10)
						wf.WorkflowVersion = refWf.Version
					}
					node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList[idx] = wf
				}

			}
			if hasPluginRelated && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.PluginFCParam != nil {
				for idx := range node.Data.Inputs.FCParam.PluginFCParam.PluginList {
					pl := node.Data.Inputs.FCParam.PluginFCParam.PluginList[idx]
					pluginID, err := strconv.ParseInt(pl.PluginID, 10, 64)
					if err != nil {
						return err
					}

					toolID, err := strconv.ParseInt(pl.ApiId, 10, 64)
					if err != nil {
						return err
					}

					if refPlugin, ok := related.PluginMap[pluginID]; ok {
						tID, ok := related.PluginToolMap[toolID]
						if ok {
							pl.ApiId = strconv.FormatInt(tID, 10)
						}
						pl.PluginID = strconv.FormatInt(refPlugin.PluginID, 10)
						if refPlugin.PluginVersion != nil {
							pl.PluginVersion = *refPlugin.PluginVersion

							pl.IsDraft = false
						}

					}
					node.Data.Inputs.FCParam.PluginFCParam.PluginList[idx] = pl

				}
			}
			if hasKnowledgeRelated && node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.KnowledgeFCParam != nil {
				for idx := range node.Data.Inputs.FCParam.KnowledgeFCParam.KnowledgeList {
					kn := node.Data.Inputs.FCParam.KnowledgeFCParam.KnowledgeList[idx]
					kid, err := strconv.ParseInt(kn.ID, 10, 64)
					if err != nil {
						return err
					}
					if refKnowledgeID, ok := related.KnowledgeMap[kid]; ok {
						kn.ID = strconv.FormatInt(refKnowledgeID, 10)
					}

				}
			}
		}
		if len(node.Blocks) > 0 {
			err := replaceRelatedWorkflowOrExternalResourceInWorkflowNodes(node.Blocks, relatedWorkflows, related)
			if err != nil {
				return err
			}
		}

	}
	return nil
}

func RegisterAllNodeAdaptors() {
	adaptor.RegisterAllNodeAdaptors()
}
func (i *impl) adaptToChatFlow(ctx context.Context, wID int64) error {
	wfEntity, err := i.repo.GetEntity(ctx, &vo.GetPolicy{
		ID:    wID,
		QType: workflowModel.FromDraft,
	})
	if err != nil {
		return err
	}

	canvas := &vo.Canvas{}
	err = sonic.UnmarshalString(wfEntity.Canvas, canvas)
	if err != nil {
		return err
	}

	var startNode *vo.Node
	for _, node := range canvas.Nodes {
		if node.Type == entity.NodeTypeEntry.IDStr() {
			startNode = node
			break
		}
	}

	if startNode == nil {
		return fmt.Errorf("can not find start node")
	}

	vMap := make(map[string]bool)
	for _, o := range startNode.Data.Outputs {
		v, err := vo.ParseVariable(o)
		if err != nil {
			return err
		}
		vMap[v.Name] = true
	}

	if _, ok := vMap[vo.UserInputKey]; !ok {
		startNode.Data.Outputs = append(startNode.Data.Outputs, &vo.Variable{
			Name: vo.UserInputKey,
			Type: vo.VariableTypeString,
		})
	}
	if _, ok := vMap[vo.ConversationNameKey]; !ok {
		startNode.Data.Outputs = append(startNode.Data.Outputs, &vo.Variable{
			Name:         vo.ConversationNameKey,
			Type:         vo.VariableTypeString,
			DefaultValue: "Default",
		})
	}
	canvasStr, err := sonic.MarshalString(canvas)
	if err != nil {
		return err
	}
	return i.Save(ctx, wID, canvasStr)
}
