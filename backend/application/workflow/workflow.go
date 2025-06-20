package workflow

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	xmaps "golang.org/x/exp/maps"

	"github.com/cloudwego/eino/schema"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	pluginmodel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	pluginAPI "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/plugin_develop"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	appknowledge "code.byted.org/flow/opencoze/backend/application/knowledge"
	appmemory "code.byted.org/flow/opencoze/backend/application/memory"
	appplugin "code.byted.org/flow/opencoze/backend/application/plugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossuser"
	domainWorkflow "code.byted.org/flow/opencoze/backend/domain/workflow"
	workflowDomain "code.byted.org/flow/opencoze/backend/domain/workflow"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/pkg/lang/maps"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type ApplicationService struct {
	DomainSVC workflowDomain.Service
	ImageX    imagex.ImageX // we set Imagex here, because Imagex is used as a proxy to get auth token, there is no actual correlation with the workflow domain.
}

var SVC = &ApplicationService{}

func GetWorkflowDomainSVC() domainWorkflow.Service {
	return SVC.DomainSVC
}

func (w *ApplicationService) GetNodeTemplateList(ctx context.Context, req *workflow.NodeTemplateListRequest) (*workflow.NodeTemplateListResponse, error) {
	toQueryTypes := make(map[entity.NodeType]bool)
	for _, t := range req.NodeTypes {
		entityType, err := nodeType2EntityNodeType(t)
		if err != nil {
			logs.Warnf("get node type %v failed, err:=%v", t, err)
			continue
		}
		toQueryTypes[entityType] = true
	}
	category2NodeMetaList, err := GetWorkflowDomainSVC().ListNodeMeta(ctx, toQueryTypes, ternary.IFElse(req.GetLocale() == workflow.Locale_en_US, entity.EnUS, entity.ZhCN))
	if err != nil {
		return nil, err
	}

	resp := &workflow.NodeTemplateListResponse{
		Data: &workflow.NodeTemplateListData{},
	}

	categoryMap := make(map[string]*workflow.NodeCategory)

	for category, nodeMetaList := range category2NodeMetaList {
		categoryMap[category] = &workflow.NodeCategory{
			Name: category,
		}
		for _, nodeMeta := range nodeMetaList {
			tplType, err := entityNodeTypeToAPINodeTemplateType(nodeMeta.Type)
			if err != nil {
				return nil, err
			}
			tpl := &workflow.NodeTemplate{
				ID:           fmt.Sprintf("%d", nodeMeta.ID),
				Type:         tplType,
				Name:         ternary.IFElse(req.GetLocale() == workflow.Locale_en_US, nodeMeta.EnUSName, nodeMeta.Name),
				Desc:         ternary.IFElse(req.GetLocale() == workflow.Locale_en_US, nodeMeta.EnUSDescription, nodeMeta.Desc),
				IconURL:      nodeMeta.IconURL,
				SupportBatch: ternary.IFElse(nodeMeta.SupportBatch, workflow.SupportBatch_SUPPORT, workflow.SupportBatch_NOT_SUPPORT),
				NodeType:     fmt.Sprintf("%d", tplType),
				Color:        nodeMeta.Color,
			}

			resp.Data.TemplateList = append(resp.Data.TemplateList, tpl)
			categoryMap[category].NodeTypeList = append(categoryMap[category].NodeTypeList, fmt.Sprintf("%d", tplType))
		}
	}

	var headerCategory *workflow.NodeCategory
	for category, nodeCategory := range categoryMap {
		nodeCategory = &workflow.NodeCategory{
			Name:         category,
			NodeTypeList: nodeCategory.NodeTypeList,
		}
		if category == "" {
			headerCategory = nodeCategory
			continue
		}
		resp.Data.CateList = append(resp.Data.CateList, nodeCategory)
	}
	sort.Slice(resp.Data.CateList, func(i, j int) bool {
		return strings.Compare(resp.Data.CateList[i].Name, resp.Data.CateList[j].Name) < 0
	})
	if headerCategory != nil {
		resp.Data.CateList = append([]*workflow.NodeCategory{headerCategory}, resp.Data.CateList...)
	}

	return resp, nil
}

func (w *ApplicationService) CreateWorkflow(ctx context.Context, req *workflow.CreateWorkflowRequest) (*workflow.CreateWorkflowResponse, error) {
	uID := ctxutil.MustGetUIDFromCtx(ctx)
	spaceID := mustParseInt64(req.GetSpaceID())
	if err := checkUserSpace(ctx, uID, spaceID); err != nil {
		return nil, err
	}
	wf := &vo.MetaCreate{
		CreatorID:        uID,
		SpaceID:          spaceID,
		ContentType:      workflow.WorkFlowType_User,
		Name:             req.Name,
		Desc:             req.Desc,
		IconURI:          req.IconURI,
		AppID:            parseInt64(req.ProjectID),
		Mode:             ternary.IFElse(req.IsSetFlowMode(), req.GetFlowMode(), workflow.WorkflowMode_Workflow),
		InitCanvasSchema: entity.GetDefaultInitCanvasJsonSchema(ternary.IFElse(req.GetLocale() == workflow.Locale_en_US, entity.EnUS, entity.ZhCN)),
	}

	id, err := GetWorkflowDomainSVC().Create(ctx, wf)
	if err != nil {
		return nil, err
	}

	return &workflow.CreateWorkflowResponse{
		Data: &workflow.CreateWorkflowData{
			WorkflowID: strconv.FormatInt(id, 10),
		},
	}, nil
}

func (w *ApplicationService) SaveWorkflow(ctx context.Context, req *workflow.SaveWorkflowRequest) (*workflow.SaveWorkflowResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	if err := GetWorkflowDomainSVC().Save(ctx, mustParseInt64(req.WorkflowID), req.GetSchema()); err != nil {
		return nil, err
	}

	return &workflow.SaveWorkflowResponse{
		Data: &workflow.SaveWorkflowData{},
	}, nil
}

func (w *ApplicationService) UpdateWorkflowMeta(ctx context.Context, req *workflow.UpdateWorkflowMetaRequest) (*workflow.UpdateWorkflowMetaResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	err := GetWorkflowDomainSVC().UpdateMeta(ctx, mustParseInt64(req.GetWorkflowID()), &vo.MetaUpdate{
		Name:    req.Name,
		Desc:    req.Desc,
		IconURI: req.IconURI,
	})
	if err != nil {
		return nil, err
	}
	return &workflow.UpdateWorkflowMetaResponse{}, nil
}

func (w *ApplicationService) DeleteWorkflow(ctx context.Context, req *workflow.DeleteWorkflowRequest) (*workflow.DeleteWorkflowResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	err := GetWorkflowDomainSVC().Delete(ctx, &vo.DeletePolicy{ID: ptr.Of(mustParseInt64(req.GetWorkflowID()))})
	if err != nil {
		return &workflow.DeleteWorkflowResponse{
			Data: &workflow.DeleteWorkflowData{
				Status: workflow.DeleteStatus_FAIL,
			},
		}, err
	}

	return &workflow.DeleteWorkflowResponse{
		Data: &workflow.DeleteWorkflowData{
			Status: workflow.DeleteStatus_SUCCESS,
		},
	}, nil
}

func (w *ApplicationService) BatchDeleteWorkflow(ctx context.Context, req *workflow.BatchDeleteWorkflowRequest) (*workflow.BatchDeleteWorkflowResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	ids, err := slices.TransformWithErrorCheck(req.GetWorkflowIDList(), func(a string) (int64, error) {
		return strconv.ParseInt(a, 10, 64)
	})
	if err != nil {
		return nil, err
	}

	err = GetWorkflowDomainSVC().Delete(ctx, &vo.DeletePolicy{
		IDs: ids,
	})
	if err != nil {
		return nil, err
	}

	return &workflow.BatchDeleteWorkflowResponse{
		Data: &workflow.DeleteWorkflowData{
			Status: workflow.DeleteStatus_SUCCESS,
		},
	}, nil
}

func (w *ApplicationService) GetCanvasInfo(ctx context.Context, req *workflow.GetCanvasInfoRequest) (*workflow.GetCanvasInfoResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	wf, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:    mustParseInt64(req.GetWorkflowID()),
		QType: vo.FromDraft,
	})
	if err != nil {
		return nil, err
	}

	devStatus := workflow.WorkFlowDevStatus_CanNotSubmit
	if wf.TestRunSuccess {
		devStatus = workflow.WorkFlowDevStatus_CanSubmit
	}

	vcsType := workflow.VCSCanvasType_Draft

	if !wf.Modified {
		vcsType = workflow.VCSCanvasType_Publish
		devStatus = workflow.WorkFlowDevStatus_HadSubmit
	}

	var updateTime = time.Time{}
	if wf.UpdatedAt != nil {
		updateTime = *wf.UpdatedAt
	}
	if wf.DraftMeta != nil && wf.DraftMeta.Timestamp.After(updateTime) {
		updateTime = wf.DraftMeta.Timestamp
	}
	if wf.VersionMeta != nil && wf.VersionMeta.VersionCreatedAt.After(updateTime) {
		updateTime = wf.VersionMeta.VersionCreatedAt
	}

	pluginID := "0"
	if wf.HasPublished {
		pluginID = strconv.FormatInt(wf.ID, 10)
	}

	canvasData := &workflow.CanvasData{
		Workflow: &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(wf.ID, 10),
			Name:             wf.Name,
			Desc:             wf.Desc,
			URL:              wf.IconURL,
			IconURI:          wf.IconURI,
			Status:           devStatus,
			Type:             wf.ContentType,
			CreateTime:       wf.CreatedAt.Unix(),
			UpdateTime:       updateTime.Unix(),
			Tag:              wf.Tag,
			TemplateAuthorID: ternary.IFElse(wf.AuthorID > 0, ptr.Of(strconv.FormatInt(wf.AuthorID, 10)), nil),
			SpaceID:          ptr.Of(strconv.FormatInt(wf.SpaceID, 10)),
			SchemaJSON:       ptr.Of(wf.Canvas),
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
			FlowMode:  wf.Mode,
			ProjectID: i64PtrToStringPtr(wf.AppID),

			PersistenceModel: workflow.PersistenceModel_DB,
			PluginID:         pluginID,
		},
		VcsData: &workflow.VCSCanvasData{
			SubmitCommitID: wf.CommitID,
			DraftCommitID:  wf.CommitID,
			Type:           vcsType,
		},
		WorkflowVersion: wf.LatestPublishedVersion,
	}

	return &workflow.GetCanvasInfoResponse{
		Data: canvasData,
	}, nil
}

func (w *ApplicationService) TestRun(ctx context.Context, req *workflow.WorkFlowTestRunRequest) (*workflow.WorkFlowTestRunResponse, error) {
	uID := ctxutil.MustGetUIDFromCtx(ctx)

	if err := checkUserSpace(ctx, uID, mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var appID, agentID *int64
	if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	exeCfg := vo.ExecuteConfig{
		ID:           mustParseInt64(req.GetWorkflowID()),
		From:         vo.FromDraft,
		CommitID:     req.GetCommitID(),
		Operator:     uID,
		Mode:         vo.ExecuteModeDebug,
		AppID:        appID,
		AgentID:      agentID,
		ConnectorID:  consts.CozeConnectorID,
		ConnectorUID: strconv.FormatInt(uID, 10),
		TaskType:     vo.TaskTypeForeground,
		SyncPattern:  vo.SyncPatternAsync,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	exeID, err := GetWorkflowDomainSVC().AsyncExecute(ctx, exeCfg, maps.ToAnyValue(req.Input))
	if err != nil {
		return nil, err
	}

	return &workflow.WorkFlowTestRunResponse{
		Data: &workflow.WorkFlowTestRunData{
			WorkflowID: req.WorkflowID,
			ExecuteID:  fmt.Sprintf("%d", exeID),
		},
	}, nil
}

func (w *ApplicationService) NodeDebug(ctx context.Context, req *workflow.WorkflowNodeDebugV2Request) (*workflow.WorkflowNodeDebugV2Response, error) {
	uID := ctxutil.MustGetUIDFromCtx(ctx)

	if err := checkUserSpace(ctx, uID, mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	// merge input, batch and setting, they are all the same when executing
	mergedInput := make(map[string]string, len(req.Input)+len(req.Batch)+len(req.Setting))
	for k, v := range req.Input {
		mergedInput[k] = v
	}
	for k, v := range req.Batch {
		mergedInput[k] = v
	}
	for k, v := range req.Setting {
		mergedInput[k] = v
	}

	var appID, agentID *int64
	if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	exeCfg := vo.ExecuteConfig{
		ID:           mustParseInt64(req.GetWorkflowID()),
		From:         vo.FromDraft,
		Operator:     uID,
		Mode:         vo.ExecuteModeNodeDebug,
		AppID:        appID,
		AgentID:      agentID,
		ConnectorID:  consts.CozeConnectorID,
		ConnectorUID: strconv.FormatInt(uID, 10),
		TaskType:     vo.TaskTypeForeground,
		SyncPattern:  vo.SyncPatternAsync,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	exeID, err := GetWorkflowDomainSVC().AsyncExecuteNode(ctx, req.NodeID, exeCfg, maps.ToAnyValue(mergedInput))
	if err != nil {
		return nil, err
	}

	return &workflow.WorkflowNodeDebugV2Response{
		Data: &workflow.WorkflowNodeDebugV2Data{
			WorkflowID: req.WorkflowID,
			NodeID:     req.NodeID,
			ExecuteID:  fmt.Sprintf("%d", exeID),
		},
	}, nil
}

func (w *ApplicationService) GetProcess(ctx context.Context, req *workflow.GetWorkflowProcessRequest) (*workflow.GetWorkflowProcessResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var wfExeEntity *entity.WorkflowExecution
	if req.SubExecuteID == nil {
		wfExeEntity = &entity.WorkflowExecution{
			ID:         mustParseInt64(req.GetExecuteID()),
			WorkflowID: mustParseInt64(req.GetWorkflowID()),
		}
	} else {
		wfExeEntity = &entity.WorkflowExecution{
			ID:              mustParseInt64(req.GetSubExecuteID()),
			WorkflowID:      mustParseInt64(req.GetWorkflowID()),
			RootExecutionID: mustParseInt64(req.GetExecuteID()),
		}
	}

	wfExeEntity, err := GetWorkflowDomainSVC().GetExecution(ctx, wfExeEntity, true)
	if err != nil {
		return nil, err
	}

	status := wfExeEntity.Status
	if status == entity.WorkflowInterrupted {
		status = entity.WorkflowRunning
	}

	resp := &workflow.GetWorkflowProcessResponse{
		Data: &workflow.GetWorkFlowProcessData{
			WorkFlowId:       fmt.Sprintf("%d", wfExeEntity.WorkflowID),
			ExecuteId:        fmt.Sprintf("%d", wfExeEntity.ID),
			ExecuteStatus:    workflow.WorkflowExeStatus(status),
			ExeHistoryStatus: workflow.WorkflowExeHistoryStatus_HasHistory,
			WorkflowExeCost:  fmt.Sprintf("%.3fs", wfExeEntity.Duration.Seconds()),
			Reason:           wfExeEntity.FailReason,
			NodeEvents:       make([]*workflow.NodeEvent, 0),
		},
	}

	if wfExeEntity.TokenInfo != nil {
		resp.Data.TokenAndCost = &workflow.TokenAndCost{
			InputTokens:  ptr.Of(fmt.Sprintf("%d Tokens", wfExeEntity.TokenInfo.InputTokens)),
			OutputTokens: ptr.Of(fmt.Sprintf("%d Tokens", wfExeEntity.TokenInfo.OutputTokens)),
			TotalTokens:  ptr.Of(fmt.Sprintf("%d Tokens", wfExeEntity.TokenInfo.InputTokens+wfExeEntity.TokenInfo.OutputTokens)),
		}
	}

	if wfExeEntity.AppID != nil {
		resp.Data.ProjectId = fmt.Sprintf("%d", *wfExeEntity.AppID)
	}

	batchNodeID2NodeResult := make(map[string]*workflow.NodeResult)
	batchNodeID2InnerNodeResult := make(map[string]*workflow.NodeResult)
	successNum := 0
	for _, nodeExe := range wfExeEntity.NodeExecutions {
		nr, err := convertNodeExecution(nodeExe)
		if err != nil {
			return nil, err
		}

		if nodeExe.NodeType == entity.NodeTypeBatch {
			if inner, ok := batchNodeID2InnerNodeResult[nodeExe.NodeID]; ok {
				nr = mergeBatchModeNodes(inner, nr)
				delete(batchNodeID2InnerNodeResult, nodeExe.NodeID)
			} else {
				batchNodeID2NodeResult[nodeExe.NodeID] = nr
				continue
			}
		} else if len(nodeExe.IndexedExecutions) > 0 {
			if vo.IsGeneratedNodeForBatchMode(nodeExe.NodeID, *nodeExe.ParentNodeID) {
				parentNodeResult, ok := batchNodeID2NodeResult[*nodeExe.ParentNodeID]
				if ok {
					nr = mergeBatchModeNodes(parentNodeResult, nr)
					delete(batchNodeID2NodeResult, *nodeExe.ParentNodeID)
				} else {
					batchNodeID2InnerNodeResult[*nodeExe.ParentNodeID] = nr
					continue
				}
			}
		}

		if nr.NodeStatus == workflow.NodeExeStatus_Success {
			successNum++
		}

		resp.Data.NodeResults = append(resp.Data.NodeResults, nr)
	}

	for id := range batchNodeID2NodeResult {
		nr := batchNodeID2NodeResult[id]
		if nr.NodeStatus == workflow.NodeExeStatus_Success {
			successNum++
		}
		resp.Data.NodeResults = append(resp.Data.NodeResults, nr)
	}

	if wfExeEntity.NodeCount > 0 {
		resp.Data.Rate = fmt.Sprintf("%.2f", float64(successNum)/float64(wfExeEntity.NodeCount))
	}

	for _, ie := range wfExeEntity.InterruptEvents {
		if ie.EventType == entity.InterruptEventLLM {
			ie = &entity.InterruptEvent{
				ID:            ie.ID,
				NodeKey:       ie.ToolInterruptEvent.NodeKey,
				NodeType:      ie.ToolInterruptEvent.NodeType,
				NodeTitle:     ie.ToolInterruptEvent.NodeTitle,
				NodeIcon:      ie.ToolInterruptEvent.NodeIcon,
				EventType:     ie.ToolInterruptEvent.EventType,
				InterruptData: ie.ToolInterruptEvent.InterruptData,
			}
		}

		resp.Data.NodeEvents = append(resp.Data.NodeEvents, &workflow.NodeEvent{
			ID:           strconv.FormatInt(ie.ID, 10),
			NodeID:       string(ie.NodeKey),
			NodeTitle:    ie.NodeTitle,
			NodeIcon:     ie.NodeIcon,
			Data:         ie.InterruptData,
			Type:         ie.EventType,
			SchemaNodeID: string(ie.NodeKey),
		})
	}

	return resp, nil
}

func (w *ApplicationService) GetNodeExecuteHistory(ctx context.Context, req *workflow.GetNodeExecuteHistoryRequest) (
	*workflow.GetNodeExecuteHistoryResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	executeID := req.GetExecuteID()
	scene := req.GetNodeHistoryScene()

	if scene == workflow.NodeHistoryScene_TestRunInput {
		if len(executeID) > 0 {
			return nil, fmt.Errorf("when scene is test_run_input, execute_id should be empty")
		}

		nodeID := req.GetNodeID()
		if nodeID == "100001" {
			nodeExe, found, err := GetWorkflowDomainSVC().GetLatestTestRunInput(ctx, mustParseInt64(req.GetWorkflowID()),
				ptr.FromOrDefault(ctxutil.GetUIDFromCtx(ctx), 0))
			if err != nil {
				return nil, err
			}
			if !found {
				return &workflow.GetNodeExecuteHistoryResponse{
					Data: &workflow.NodeResult{},
				}, nil
			}

			result, err := convertNodeExecution(nodeExe)
			if err != nil {
				return nil, err
			}

			return &workflow.GetNodeExecuteHistoryResponse{
				Data: result,
			}, nil
		} else {
			nodeExe, innerExe, found, err := GetWorkflowDomainSVC().GetLatestNodeDebugInput(ctx, mustParseInt64(req.GetWorkflowID()), nodeID,
				ptr.FromOrDefault(ctxutil.GetUIDFromCtx(ctx), 0))
			if err != nil {
				return nil, err
			}
			if !found {
				return &workflow.GetNodeExecuteHistoryResponse{
					Data: &workflow.NodeResult{},
				}, nil
			}

			result, err := convertNodeExecution(nodeExe)
			if err != nil {
				return nil, err
			}

			if innerExe == nil {
				return &workflow.GetNodeExecuteHistoryResponse{
					Data: result,
				}, nil
			}

			inner, err := convertNodeExecution(innerExe)
			if err != nil {
				return nil, err
			}

			result = mergeBatchModeNodes(result, inner)
			return &workflow.GetNodeExecuteHistoryResponse{
				Data: result,
			}, nil
		}
	} else {
		if len(executeID) == 0 {
			return nil, fmt.Errorf("when scene is not test_run_input, execute_id should not be empty")
		}

		nodeExe, innerNodeExe, err := GetWorkflowDomainSVC().GetNodeExecution(ctx, mustParseInt64(executeID), req.GetNodeID())
		if err != nil {
			return nil, err
		}

		result, err := convertNodeExecution(nodeExe)
		if err != nil {
			return nil, err
		}

		if innerNodeExe != nil {
			inner, err := convertNodeExecution(innerNodeExe)
			if err != nil {
				return nil, err
			}

			result := mergeBatchModeNodes(result, inner)
			return &workflow.GetNodeExecuteHistoryResponse{
				Data: result,
			}, nil
		}

		return &workflow.GetNodeExecuteHistoryResponse{
			Data: result,
		}, nil
	}
}

func (w *ApplicationService) DeleteWorkflowsByAppID(ctx context.Context, appID int64) error {
	return GetWorkflowDomainSVC().Delete(ctx, &vo.DeletePolicy{
		AppID: ptr.Of(appID),
	})
}

func (w *ApplicationService) CheckWorkflowsExistByAppID(ctx context.Context, appID int64) (bool, error) {
	wfs, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			AppID: &appID,
			Page: &vo.Page{
				Size: 1,
				Page: 0,
			},
		},
		QType:    vo.FromDraft,
		MetaOnly: true,
	})

	return len(wfs) > 0, err
}

func (w *ApplicationService) CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, spaceID, appID int64) (int64, []*vo.ValidateIssue, error) {
	ds, err := GetWorkflowDomainSVC().GetWorkflowDependenceResource(ctx, workflowID)
	if err != nil {
		return 0, nil, err
	}

	pluginMap := make(map[int64]*vo.PluginEntity)
	pluginToolMap := make(map[int64]int64)

	if len(ds.PluginIDs) > 0 {
		for idx := range ds.PluginIDs {
			id := ds.PluginIDs[idx]
			response, err := appplugin.PluginApplicationSVC.CopyPlugin(ctx, &appplugin.CopyPluginRequest{
				PluginID:  id,
				UserID:    ctxutil.MustGetUIDFromCtx(ctx),
				CopyScene: pluginmodel.CopySceneOfToLibrary,
			})
			if err != nil {
				return 0, nil, err
			}
			pInfo := response.Plugin
			pluginMap[id] = &vo.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			}
			for o, n := range response.Tools {
				pluginToolMap[o] = n.ID
			}

		}
	}
	relatedKnowledgeMap := make(map[int64]int64, len(ds.KnowledgeIDs))
	if len(ds.KnowledgeIDs) > 0 {
		for idx := range ds.KnowledgeIDs {
			id := ds.KnowledgeIDs[idx]
			response, err := appknowledge.KnowledgeSVC.CopyKnowledge(ctx, &model.CopyKnowledgeRequest{
				KnowledgeID:   id,
				TargetAppID:   appID,
				TargetSpaceID: spaceID,
				TargetUserID:  ctxutil.MustGetUIDFromCtx(ctx),
			})
			if err != nil {
				return 0, nil, err
			}
			if response.CopyStatus == model.CopyStatus_Failed {
				return 0, nil, fmt.Errorf("failed to copy knowledge, knowledge id=%d", id)
			}
			relatedKnowledgeMap[id] = response.TargetKnowledgeID
		}
	}

	relatedDatabaseMap := make(map[int64]int64, len(ds.DatabaseIDs))
	if len(ds.DatabaseIDs) > 0 {
		response, err := appmemory.DatabaseApplicationSVC.CopyDatabase(ctx, &appmemory.CopyDatabaseRequest{
			DatabaseIDs: ds.DatabaseIDs,
		})
		if err != nil {
			return 0, nil, err
		}
		for oid, e := range response.Databases {
			relatedDatabaseMap[oid] = e.ID
		}

	}

	relatedWorkflows, vIssues, err := GetWorkflowDomainSVC().CopyWorkflowFromAppToLibrary(ctx, workflowID, appID, vo.ExternalResourceRelated{
		PluginMap:     pluginMap,
		PluginToolMap: pluginToolMap,
		KnowledgeMap:  relatedKnowledgeMap,
		DatabaseMap:   relatedDatabaseMap,
	})
	if err != nil {
		return 0, nil, err
	}

	if len(vIssues) > 0 {
		return 0, vIssues, nil
	}

	copiedWf, ok := relatedWorkflows[workflowID]
	if !ok {
		return 0, nil, fmt.Errorf("failed to get copy workflow id, workflow id=%d", workflowID)
	}

	return copiedWf.ID, vIssues, nil
}

type ExternalResource struct {
	PluginMap     map[int64]int64
	PluginToolMap map[int64]int64
	KnowledgeMap  map[int64]int64
	DatabaseMap   map[int64]int64
}

func (w *ApplicationService) DuplicateWorkflowsByAppID(ctx context.Context, sourceAppID, targetAppID int64, externalResource ExternalResource) error {
	pluginMap := make(map[int64]*vo.PluginEntity)
	for o, n := range externalResource.PluginMap {
		pluginMap[o] = &vo.PluginEntity{
			PluginID: n,
		}
	}
	externalResourceRelated := vo.ExternalResourceRelated{
		PluginMap:     pluginMap,
		PluginToolMap: externalResource.PluginToolMap,
		KnowledgeMap:  externalResource.KnowledgeMap,
		DatabaseMap:   externalResource.DatabaseMap,
	}

	return GetWorkflowDomainSVC().DuplicateWorkflowsByAppID(ctx, sourceAppID, targetAppID, externalResourceRelated)

}

func (w *ApplicationService) CopyWorkflowFromLibraryToApp(ctx context.Context, workflowID int64, appID int64) (int64, error) {
	copiedID, err := GetWorkflowDomainSVC().CopyWorkflow(ctx, workflowID, vo.CopyWorkflowPolicy{
		TargetAppID: &appID,
	})
	if err != nil {
		return 0, err
	}

	return copiedID, nil
}

func (w *ApplicationService) MoveWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, spaceID, appID int64) ([]*vo.ValidateIssue, error) {
	ds, err := GetWorkflowDomainSVC().GetWorkflowDependenceResource(ctx, workflowID)
	if err != nil {
		return nil, err
	}

	pluginMap := make(map[int64]*vo.PluginEntity)
	if len(ds.PluginIDs) > 0 {
		for idx := range ds.PluginIDs {
			id := ds.PluginIDs[idx]
			pInfo, err := appplugin.PluginApplicationSVC.MoveAPPPluginToLibrary(ctx, id)
			if err != nil {
				return nil, err
			}
			pluginMap[id] = &vo.PluginEntity{
				PluginID:      pInfo.ID,
				PluginVersion: pInfo.Version,
			}

		}

	}

	if len(ds.KnowledgeIDs) > 0 {
		for idx := range ds.KnowledgeIDs {
			id := ds.KnowledgeIDs[idx]
			err := appknowledge.KnowledgeSVC.MoveKnowledgeToLibrary(ctx, &model.MoveKnowledgeToLibraryRequest{
				KnowledgeID: id,
			})
			if err != nil {
				return nil, err
			}
		}

	}

	if len(ds.DatabaseIDs) > 0 {
		_, err = appmemory.DatabaseApplicationSVC.MoveDatabaseToLibrary(ctx, &appmemory.MoveDatabaseToLibraryRequest{
			DatabaseIDs: ds.DatabaseIDs,
		})
		if err != nil {
			return nil, err
		}
	}

	relatedWorkflows, vIssues, err := GetWorkflowDomainSVC().CopyWorkflowFromAppToLibrary(ctx, workflowID, appID, vo.ExternalResourceRelated{
		PluginMap: pluginMap,
	})

	if err != nil {
		return nil, err
	}
	if len(vIssues) > 0 {
		return vIssues, nil
	}

	err = GetWorkflowDomainSVC().SyncRelatedWorkflowResources(ctx, appID, relatedWorkflows, vo.ExternalResourceRelated{
		PluginMap: pluginMap,
	})

	if err != nil {
		return nil, err
	}

	deleteWorkflowIDs := xmaps.Keys(relatedWorkflows)
	err = GetWorkflowDomainSVC().Delete(ctx, &vo.DeletePolicy{
		IDs: deleteWorkflowIDs,
	})
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func convertNodeExecution(nodeExe *entity.NodeExecution) (*workflow.NodeResult, error) {
	nType, err := entityNodeTypeToAPINodeTemplateType(nodeExe.NodeType)
	if err != nil {
		return nil, err
	}

	nr := &workflow.NodeResult{
		NodeId:      nodeExe.NodeID,
		NodeName:    nodeExe.NodeName,
		NodeType:    nType.String(),
		NodeStatus:  workflow.NodeExeStatus(nodeExe.Status),
		ErrorInfo:   ptr.FromOrDefault(nodeExe.ErrorInfo, ""),
		Input:       ptr.FromOrDefault(nodeExe.Input, ""),
		Output:      ptr.FromOrDefault(nodeExe.Output, ""),
		NodeExeCost: fmt.Sprintf("%.3fs", nodeExe.Duration.Seconds()),
		RawOutput:   nodeExe.RawOutput,
		ErrorLevel:  ptr.FromOrDefault(nodeExe.ErrorLevel, ""),
	}

	if nodeExe.TokenInfo != nil {
		nr.TokenAndCost = &workflow.TokenAndCost{
			InputTokens:  ptr.Of(fmt.Sprintf("%d Tokens", nodeExe.TokenInfo.InputTokens)),
			OutputTokens: ptr.Of(fmt.Sprintf("%d Tokens", nodeExe.TokenInfo.OutputTokens)),
			TotalTokens:  ptr.Of(fmt.Sprintf("%d Tokens", nodeExe.TokenInfo.InputTokens+nodeExe.TokenInfo.OutputTokens)),
		}
	}

	if nodeExe.ParentNodeID != nil {
		nr.Index = ptr.Of(int32(nodeExe.Index))
		nr.Items = nodeExe.Items
	}

	if len(nodeExe.IndexedExecutions) > 0 {
		nr.IsBatch = ptr.Of(true)
		subResults := make([]*workflow.NodeResult, 0, len(nodeExe.IndexedExecutions))
		for _, subNodeExe := range nodeExe.IndexedExecutions {
			if subNodeExe == nil {
				subResults = append(subResults, nil)
				continue
			}
			subResult, err := convertNodeExecution(subNodeExe)
			if err != nil {
				return nil, err
			}
			subResults = append(subResults, subResult)
		}
		m, err := sonic.MarshalString(subResults)
		if err != nil {
			return nil, err
		}
		nr.Batch = ptr.Of(m)
	}

	if nodeExe.SubWorkflowExecution != nil {
		if nodeExe.Extra == nil {
			nodeExe.Extra = &entity.NodeExtra{}
		}
		nodeExe.Extra.SubExecuteID = nodeExe.SubWorkflowExecution.ID
		nr.SubExecuteId = ptr.Of(strconv.FormatInt(nodeExe.SubWorkflowExecution.ID, 10))
		nr.ExecuteId = ptr.Of(strconv.FormatInt(nodeExe.ExecuteID, 10))
	}

	if nodeExe.Extra != nil {
		m, err := sonic.MarshalString(nodeExe.Extra)
		if err != nil {
			return nil, err
		}
		nr.Extra = m
	}

	return nr, nil
}

func mergeBatchModeNodes(parent, inner *workflow.NodeResult) *workflow.NodeResult {
	merged := &workflow.NodeResult{
		NodeId:       parent.NodeId,
		NodeType:     inner.NodeType,
		NodeName:     parent.NodeName,
		NodeStatus:   parent.NodeStatus,
		ErrorInfo:    parent.ErrorInfo,
		Input:        parent.Input,
		Output:       parent.Output,
		NodeExeCost:  parent.NodeExeCost,
		TokenAndCost: parent.TokenAndCost,
		RawOutput:    parent.RawOutput,
		ErrorLevel:   parent.ErrorLevel,
		Batch:        inner.Batch,
		IsBatch:      inner.IsBatch,
		Extra:        inner.Extra,
		ExecuteId:    parent.ExecuteId,
		SubExecuteId: parent.SubExecuteId,
		NeedAsync:    parent.NeedAsync,
	}

	return merged
}

type StreamRunEventType string

const (
	DoneEvent      StreamRunEventType = "done"
	MessageEvent   StreamRunEventType = "message"
	ErrEvent       StreamRunEventType = "error"
	InterruptEvent StreamRunEventType = "interrupt"
)

func convertStreamRunEvent(workflowID int64) func(msg *entity.Message) (res *workflow.OpenAPIStreamRunFlowResponse, err error) {
	var (
		messageID  int
		executeID  int64
		spaceID    int64
		nodeID2Seq = make(map[string]int)
	)

	return func(msg *entity.Message) (res *workflow.OpenAPIStreamRunFlowResponse, err error) {
		defer func() {
			if err == nil {
				messageID++
			}
		}()

		if msg.StateMessage != nil {
			// stream run will skip all messages from workflow tools
			if executeID > 0 && executeID != msg.StateMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}

			switch msg.StateMessage.Status {
			case entity.WorkflowSuccess:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:       strconv.Itoa(messageID),
					Event:    string(DoneEvent),
					DebugUrl: ptr.Of(fmt.Sprintf(vo.DebugURLTpl, executeID, spaceID, workflowID)),
				}, nil
			case entity.WorkflowFailed, entity.WorkflowCancel:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:           strconv.Itoa(messageID),
					Event:        string(ErrEvent),
					DebugUrl:     ptr.Of(fmt.Sprintf(vo.DebugURLTpl, executeID, spaceID, workflowID)),
					ErrorCode:    ptr.Of(int64(msg.StateMessage.LastError.Code)),
					ErrorMessage: ptr.Of(msg.StateMessage.LastError.Msg),
				}, nil
			case entity.WorkflowInterrupted:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:       strconv.Itoa(messageID),
					Event:    string(InterruptEvent),
					DebugUrl: ptr.Of(fmt.Sprintf(vo.DebugURLTpl, executeID, spaceID, workflowID)),
					InterruptData: &workflow.Interrupt{
						EventID: fmt.Sprintf("%d/%d", executeID, msg.InterruptEvent.ID),
						Type:    workflow.InterruptType(msg.InterruptEvent.EventType),
						InData:  msg.InterruptEvent.InterruptData,
					},
				}, nil
			case entity.WorkflowRunning:
				executeID = msg.StateMessage.ExecuteID
				spaceID = msg.SpaceID
				return nil, schema.ErrNoValue
			default:
				return nil, schema.ErrNoValue
			}
		}

		if msg.DataMessage != nil {
			if msg.Type != entity.Answer {
				// stream run api do not emit FunctionCall or ToolResponse
				return nil, schema.ErrNoValue
			}

			// stream run will skip all messages from workflow tools
			if executeID > 0 && executeID != msg.DataMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}

			var nodeType workflow.NodeTemplateType
			nodeType, err = entityNodeTypeToAPINodeTemplateType(msg.NodeType)
			if err != nil {
				logs.Errorf("convert node type %v failed, err:=%v", msg.NodeType, err)
				nodeType = workflow.NodeTemplateType(0)
			}

			res = &workflow.OpenAPIStreamRunFlowResponse{
				ID:           strconv.Itoa(messageID),
				Event:        string(MessageEvent),
				NodeTitle:    ptr.Of(msg.NodeTitle),
				Content:      ptr.Of(msg.Content),
				ContentType:  ptr.Of("text"),
				NodeIsFinish: ptr.Of(msg.Last),
				NodeType:     ptr.Of(nodeType.String()),
				NodeID:       ptr.Of(msg.NodeID),
			}

			if msg.DataMessage.Usage != nil {
				token := msg.DataMessage.Usage.InputTokens + msg.DataMessage.Usage.OutputTokens
				res.Token = ptr.Of(token)
			}

			seq, ok := nodeID2Seq[msg.NodeID]
			if !ok {
				seq = 0
				nodeID2Seq[msg.NodeID] = 0
			}

			res.NodeSeqID = ptr.Of(strconv.Itoa(seq))
			nodeID2Seq[msg.NodeID]++
		}

		return res, nil
	}
}

func (w *ApplicationService) OpenAPIStreamRun(ctx context.Context, req *workflow.OpenAPIRunFlowRequest) (
	*schema.StreamReader[*workflow.OpenAPIStreamRunFlowResponse], error) {
	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	parameters := make(map[string]any)
	if req.Parameters != nil {
		err := sonic.UnmarshalString(*req.Parameters, &parameters)
		if err != nil {
			return nil, err
		}
	}

	meta, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}

	if meta.LatestPublishedVersion == nil {
		return nil, errors.New("workflow has not been published")
	}

	if err = checkUserSpace(ctx, userID, meta.SpaceID); err != nil {
		return nil, err
	}

	var appID, agentID *int64
	if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	var connectorID int64
	if req.IsSetConnectorID() {
		connectorID = mustParseInt64(req.GetConnectorID())
	}

	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	exeCfg := vo.ExecuteConfig{
		ID:           meta.ID,
		From:         vo.FromSpecificVersion,
		Version:      *meta.LatestPublishedVersion,
		Operator:     userID,
		Mode:         vo.ExecuteModeRelease,
		AppID:        appID,
		AgentID:      agentID,
		ConnectorID:  connectorID,
		ConnectorUID: strconv.FormatInt(userID, 10),
		TaskType:     vo.TaskTypeForeground,
		SyncPattern:  vo.SyncPatternStream,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	sr, err := GetWorkflowDomainSVC().StreamExecute(ctx, exeCfg, parameters)
	if err != nil {
		return nil, err
	}

	convert := convertStreamRunEvent(meta.ID)

	return schema.StreamReaderWithConvert(sr, convert), nil
}

func (w *ApplicationService) OpenAPIStreamResume(ctx context.Context, req *workflow.OpenAPIStreamResumeFlowRequest) (
	*schema.StreamReader[*workflow.OpenAPIStreamRunFlowResponse], error) {
	idStr := req.EventID
	idSegments := strings.Split(idStr, "/")
	if len(idSegments) != 2 {
		return nil, fmt.Errorf("invalid event id when stream resume: %s", idStr)
	}

	executeID, err := strconv.ParseInt(idSegments[0], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse executeID from eventID segment %s: %w", idSegments[0], err)
	}
	eventID, err := strconv.ParseInt(idSegments[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse eventID from eventID segment %s: %w", idSegments[1], err)
	}

	workflowID := mustParseInt64(req.WorkflowID)

	resumeReq := &entity.ResumeRequest{
		ExecuteID:  executeID,
		EventID:    eventID,
		ResumeData: req.ResumeData,
	}

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	connectorID := mustParseInt64(req.GetConnectorID())

	sr, err := GetWorkflowDomainSVC().StreamResume(ctx, resumeReq, vo.ExecuteConfig{
		Operator:     userID,
		Mode:         vo.ExecuteModeRelease,
		ConnectorID:  connectorID,
		ConnectorUID: strconv.FormatInt(userID, 10),
	})
	if err != nil {
		return nil, err
	}

	convert := convertStreamRunEvent(workflowID)

	return schema.StreamReaderWithConvert(sr, convert), nil
}

func (w *ApplicationService) OpenAPIRun(ctx context.Context, req *workflow.OpenAPIRunFlowRequest) (
	*workflow.OpenAPIRunFlowResponse, error) {
	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	parameters := make(map[string]any)
	if req.Parameters != nil {
		err := sonic.UnmarshalString(*req.Parameters, &parameters)
		if err != nil {
			return nil, err
		}
	}

	meta, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
		ID:       mustParseInt64(req.GetWorkflowID()),
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}

	if meta.LatestPublishedVersion == nil {
		return nil, errors.New("workflow has not been published")
	}

	if err = checkUserSpace(ctx, userID, meta.SpaceID); err != nil {
		return nil, err
	}

	var appID, agentID *int64
	if req.IsSetProjectID() {
		appID = ptr.Of(mustParseInt64(req.GetProjectID()))
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
	}

	var connectorID int64
	if req.IsSetConnectorID() {
		connectorID = mustParseInt64(req.GetConnectorID())
	}

	if connectorID != consts.WebSDKConnectorID {
		connectorID = apiKeyInfo.ConnectorID
	}

	exeCfg := vo.ExecuteConfig{
		ID:           meta.ID,
		From:         vo.FromSpecificVersion,
		Version:      *meta.LatestPublishedVersion,
		Operator:     userID,
		Mode:         vo.ExecuteModeRelease,
		AppID:        appID,
		AgentID:      agentID,
		ConnectorID:  connectorID,
		ConnectorUID: strconv.FormatInt(userID, 10),
		TaskType:     vo.TaskTypeForeground,
	}

	if exeCfg.AppID != nil && exeCfg.AgentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	if req.GetIsAsync() {
		exeCfg.SyncPattern = vo.SyncPatternAsync
		exeID, err := GetWorkflowDomainSVC().AsyncExecute(ctx, exeCfg, parameters)
		if err != nil {
			return nil, err
		}

		return &workflow.OpenAPIRunFlowResponse{
			ExecuteID: ptr.Of(strconv.FormatInt(exeID, 10)),
			DebugUrl:  ptr.Of(fmt.Sprintf(vo.DebugURLTpl, exeID, meta.SpaceID, meta.ID)),
		}, nil
	}

	exeCfg.SyncPattern = vo.SyncPatternSync
	wfExe, tPlan, err := GetWorkflowDomainSVC().SyncExecute(ctx, exeCfg, parameters)
	if err != nil {
		return nil, err
	}

	if wfExe.Status == entity.WorkflowInterrupted {
		return nil, errors.New("sync run workflow does not support interrupt/resume")
	}

	var data *string
	if tPlan == vo.ReturnVariables {
		data = wfExe.Output
	} else {
		answerOutput := map[string]any{
			"content_type":   1,
			"data":           *wfExe.Output,
			"type_for_model": 2,
		}

		answerOutputStr, err := sonic.MarshalString(answerOutput)
		if err != nil {
			return nil, err
		}

		data = ptr.Of(answerOutputStr)
	}

	return &workflow.OpenAPIRunFlowResponse{
		Data:      data,
		ExecuteID: ptr.Of(strconv.FormatInt(wfExe.ID, 10)),
		DebugUrl:  ptr.Of(fmt.Sprintf(vo.DebugURLTpl, wfExe.ID, wfExe.SpaceID, meta.ID)),
		Token:     ptr.Of(wfExe.TokenInfo.InputTokens + wfExe.TokenInfo.OutputTokens),
		Cost:      ptr.Of("0.00000"),
	}, nil
}

func (w *ApplicationService) OpenAPIGetWorkflowRunHistory(ctx context.Context, req *workflow.GetWorkflowRunHistoryRequest) (
	*workflow.GetWorkflowRunHistoryResponse, error) {
	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	exe, err := GetWorkflowDomainSVC().GetExecution(ctx, &entity.WorkflowExecution{
		ID: mustParseInt64(req.GetExecuteID()),
	}, false)
	if err != nil {
		return nil, err
	}

	if err = checkUserSpace(ctx, userID, exe.SpaceID); err != nil {
		return nil, err
	}

	var updateTime *int64
	if exe.UpdatedAt != nil {
		updateTime = ptr.Of(exe.UpdatedAt.Unix())
	}

	var runMode *workflow.WorkflowRunMode
	switch exe.SyncPattern {
	case vo.SyncPatternSync:
		runMode = ptr.Of(workflow.WorkflowRunMode_Sync)
	case vo.SyncPatternAsync:
		runMode = ptr.Of(workflow.WorkflowRunMode_Async)
	case vo.SyncPatternStream:
		runMode = ptr.Of(workflow.WorkflowRunMode_Stream)
	default:
	}

	res := &workflow.GetWorkflowRunHistoryResponse{
		Data: []*workflow.WorkflowExecuteHistory{
			{
				ExecuteID:     ptr.Of(exe.ID),
				ExecuteStatus: ptr.Of(workflow.WorkflowExeStatus(exe.Status).String()),
				BotID:         exe.AgentID,
				ConnectorID:   ptr.Of(exe.ConnectorID),
				ConnectorUID:  ptr.Of(exe.ConnectorUID),
				RunMode:       runMode,
				LogID:         ptr.Of(exe.LogID),
				CreateTime:    ptr.Of(exe.CreatedAt.Unix()),
				UpdateTime:    updateTime,
				DebugUrl:      ptr.Of(fmt.Sprintf(vo.DebugURLTpl, exe.ID, exe.SpaceID, exe.WorkflowID)),
				Input:         exe.Input,
				Output:        exe.Output,
				Token:         ptr.Of(exe.TokenInfo.InputTokens + exe.TokenInfo.OutputTokens),
				Cost:          ptr.Of("0.00000"),
				ErrorCode:     exe.ErrorCode,
				ErrorMsg:      exe.FailReason,
			},
		},
	}

	return res, nil
}

func (w *ApplicationService) ValidateTree(ctx context.Context, req *workflow.ValidateTreeRequest) (*workflow.ValidateTreeResponse, error) {
	canvasSchema := req.GetSchema()
	if len(canvasSchema) == 0 {
		return nil, errors.New("validate tree schema is required")
	}
	response := &workflow.ValidateTreeResponse{}

	validateTreeCfg := vo.ValidateTreeConfig{
		CanvasSchema: canvasSchema,
	}
	if req.GetBindProjectID() != "" {
		pId, err := strconv.ParseInt(req.GetBindProjectID(), 10, 64)
		if err != nil {
			return nil, err
		}
		validateTreeCfg.AppID = ptr.Of(pId)
	}

	wfValidateInfos, err := GetWorkflowDomainSVC().ValidateTree(ctx, mustParseInt64(req.GetWorkflowID()), validateTreeCfg)
	if err != nil {
		return nil, err
	}
	response.Data = wfValidateInfos

	return response, nil
}

func (w *ApplicationService) GetWorkflowReferences(ctx context.Context, req *workflow.GetWorkflowReferencesRequest) (*workflow.GetWorkflowReferencesResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	workflows, err := GetWorkflowDomainSVC().GetWorkflowReference(ctx, mustParseInt64(req.GetWorkflowID()))
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkflowReferencesResponse{}
	response.Data = &workflow.WorkflowReferencesData{
		WorkflowList: make([]*workflow.Workflow, 0, len(workflows)),
	}
	for id, wk := range workflows {
		wfw := &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(id, 10),
			Name:             wk.Name,
			Desc:             wk.Desc,
			URL:              wk.IconURL,
			IconURI:          wk.IconURI,
			Status:           workflow.WorkFlowDevStatus_HadSubmit,
			CreateTime:       wk.CreatedAt.Unix(),
			Tag:              wk.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(wk.AuthorID, 10)),
			SpaceID:          ptr.Of(strconv.FormatInt(wk.SpaceID, 10)),
			Creator: &workflow.Creator{
				ID: strconv.FormatInt(wk.CreatorID, 10),
			},
			FlowMode: wk.Mode,
		}

		if wk.UpdatedAt != nil {
			wfw.UpdateTime = wk.UpdatedAt.Unix()
		}

		if wk.AppID != nil {
			wfw.ProjectID = ptr.Of(strconv.FormatInt(ptr.From(wk.AppID), 10))
		}

		response.Data.WorkflowList = append(response.Data.WorkflowList, wfw)
	}

	return response, nil
}

func (w *ApplicationService) TestResume(ctx context.Context, req *workflow.WorkflowTestResumeRequest) (*workflow.WorkflowTestResumeResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	resumeReq := &entity.ResumeRequest{
		ExecuteID:  mustParseInt64(req.GetExecuteID()),
		EventID:    mustParseInt64(req.GetEventID()),
		ResumeData: req.GetData(),
	}
	err := GetWorkflowDomainSVC().AsyncResume(ctx, resumeReq, vo.ExecuteConfig{
		Operator: ptr.FromOrDefault(ctxutil.GetUIDFromCtx(ctx), 0),
		Mode:     vo.ExecuteModeDebug, // at this stage it could be debug or node debug, we will decide it within AsyncResume
	})
	if err != nil {
		return nil, err
	}

	return &workflow.WorkflowTestResumeResponse{}, nil
}

func (w *ApplicationService) Cancel(ctx context.Context, req *workflow.CancelWorkFlowRequest) (*workflow.CancelWorkFlowResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	err := GetWorkflowDomainSVC().Cancel(ctx, mustParseInt64(req.GetExecuteID()),
		mustParseInt64(req.GetWorkflowID()), mustParseInt64(req.GetSpaceID()))
	if err != nil {
		return nil, err
	}

	return &workflow.CancelWorkFlowResponse{}, nil
}

func (w *ApplicationService) QueryWorkflowNodeTypes(ctx context.Context, req *workflow.QueryWorkflowNodeTypeRequest) (*workflow.QueryWorkflowNodeTypeResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	nodeProperties, err := GetWorkflowDomainSVC().QueryNodeProperties(ctx, mustParseInt64(req.GetWorkflowID()))
	if err != nil {
		return nil, err
	}

	response := &workflow.QueryWorkflowNodeTypeResponse{
		Data: &workflow.WorkflowNodeTypeData{
			NodeTypes:                  make([]string, 0),
			SubWorkflowNodeTypes:       make([]string, 0),
			NodesProperties:            make([]*workflow.NodeProps, 0),
			SubWorkflowNodesProperties: make([]*workflow.NodeProps, 0),
		},
	}
	var combineNodesTypes func(props map[string]*vo.NodeProperty, deep int) error

	deepestSubWorkflowNodeTypes := make([]string, 0)

	combineNodesTypes = func(m map[string]*vo.NodeProperty, deep int) error {
		deepestSubWorkflowNodeTypes = make([]string, 0)
		for id, nodeProp := range m {
			if deep == 0 {
				response.Data.NodesProperties = append(response.Data.NodesProperties, &workflow.NodeProps{
					ID:                  id,
					Type:                nodeProp.Type,
					IsEnableChatHistory: nodeProp.IsEnableChatHistory,
					IsEnableUserQuery:   nodeProp.IsEnableUserQuery,
					IsRefGlobalVariable: nodeProp.IsRefGlobalVariable,
				})

				response.Data.NodeTypes = append(response.Data.NodeTypes, nodeProp.Type)
			} else {
				response.Data.SubWorkflowNodesProperties = append(response.Data.SubWorkflowNodesProperties, &workflow.NodeProps{
					ID:                  id,
					Type:                nodeProp.Type,
					IsEnableChatHistory: nodeProp.IsEnableChatHistory,
					IsEnableUserQuery:   nodeProp.IsEnableUserQuery,
					IsRefGlobalVariable: nodeProp.IsRefGlobalVariable,
				})
				deepestSubWorkflowNodeTypes = append(deepestSubWorkflowNodeTypes, nodeProp.Type)

			}
			if len(nodeProp.SubWorkflow) > 0 {
				err := combineNodesTypes(nodeProp.SubWorkflow, deep+1)
				if err != nil {
					return err
				}
			}
		}
		response.Data.SubWorkflowNodeTypes = slices.Unique(deepestSubWorkflowNodeTypes)
		return nil
	}
	response.Data.NodeTypes = slices.Unique(response.Data.NodeTypes)

	err = combineNodesTypes(nodeProperties, 0)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (w *ApplicationService) PublishWorkflow(ctx context.Context, req *workflow.PublishWorkflowRequest) (*workflow.PublishWorkflowResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)
	if err := checkUserSpace(ctx, userID, mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	info := &vo.PublishPolicy{
		ID:                 mustParseInt64(req.GetWorkflowID()),
		Version:            req.GetWorkflowVersion(),
		VersionDescription: req.GetVersionDescription(),
		CreatorID:          userID,
		CommitID:           req.GetCommitID(),
		Force:              req.GetForce(),
	}

	err := GetWorkflowDomainSVC().Publish(ctx, info)
	if err != nil {
		return nil, err
	}

	return &workflow.PublishWorkflowResponse{
		Data: &workflow.PublishWorkflowData{
			WorkflowID: req.GetWorkflowID(),
			Success:    true,
		},
	}, nil
}

func (w *ApplicationService) ListWorkflow(ctx context.Context, req *workflow.GetWorkFlowListRequest) (*workflow.GetWorkFlowListResponse, error) {
	if req.GetSpaceID() == "" {
		return nil, errors.New("space id is required")
	}

	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	page := &vo.Page{}
	if req.GetPage() > 0 {
		page.Page = req.GetPage()
	}
	if req.GetSize() > 0 {
		page.Size = req.GetSize()
	}
	option := vo.MetaQuery{
		Page: page,
	}

	if req.ProjectID != nil {
		option.AppID = ptr.Of(mustParseInt64(*req.ProjectID))
	} else {
		option.LibOnly = true
	}

	status := req.GetStatus()
	if status == workflow.WorkFlowListStatus_UnPublished {
		option.PublishStatus = ptr.Of(vo.UnPublished)
	} else if status == workflow.WorkFlowListStatus_HadPublished {
		option.PublishStatus = ptr.Of(vo.HasPublished)
	}

	if len(req.GetName()) > 0 {
		option.Name = req.Name
	}

	if len(req.GetWorkflowIds()) > 0 {
		ids, err := slices.TransformWithErrorCheck[string, int64](req.GetWorkflowIds(), func(s string) (int64, error) {
			return strconv.ParseInt(s, 10, 64)
		})
		if err != nil {
			return nil, err
		}
		option.IDs = ids
	}

	spaceID, err := strconv.ParseInt(req.GetSpaceID(), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("space id is invalid, parse to int64 failed, err: %w", err)
	}

	option.SpaceID = ptr.Of(spaceID)

	wfs, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: option,
		QType:     vo.FromDraft,
		MetaOnly:  false,
	})
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkFlowListResponse{
		Data: &workflow.WorkFlowListData{
			// TODO: The auth list needs to call the user domain query information based on the workflow creator id, temporarily leave it blank, and then check whether the interface side has strong dependencies
			AuthList:     make([]*workflow.ResourceAuthInfo, 0),
			WorkflowList: make([]*workflow.Workflow, 0, len(wfs)),
		},
	}
	for _, w := range wfs {
		ww := &workflow.Workflow{
			WorkflowID:       strconv.FormatInt(w.ID, 10),
			Name:             w.Name,
			Desc:             w.Desc,
			IconURI:          w.IconURI,
			URL:              w.IconURL,
			CreateTime:       w.CreatedAt.Unix(),
			Type:             w.ContentType,
			SchemaType:       workflow.SchemaType_FDL,
			Tag:              w.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(w.AuthorID, 10)),
			SpaceID:          ptr.Of(strconv.FormatInt(w.SpaceID, 10)),
			PluginID: func() string {
				if status == workflow.WorkFlowListStatus_UnPublished {
					return ""
				}
				return strconv.FormatInt(w.ID, 10)
			}(),
		}
		if w.UpdatedAt != nil {
			ww.UpdateTime = w.UpdatedAt.Unix()
		}

		startNode := &workflow.Node{
			NodeID:    "100001",
			NodeName:  "start-node",
			NodeParam: &workflow.NodeParam{InputParameters: make([]*workflow.Parameter, 0)},
		}

		for _, in := range w.InputParams {
			param, err := toWorkflowParameter(in)
			if err != nil {
				return nil, err
			}
			startNode.NodeParam.InputParameters = append(startNode.NodeParam.InputParameters, param)
		}

		ww.StartNode = startNode
		response.Data.WorkflowList = append(response.Data.WorkflowList, ww)
	}

	return response, nil
}

func (w *ApplicationService) GetWorkflowDetail(ctx context.Context, req *workflow.GetWorkflowDetailRequest) (*vo.WorkflowDetailDataList, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	ids, err := slices.TransformWithErrorCheck(req.GetWorkflowIds(), func(s string) (int64, error) {
		wid, err := strconv.ParseInt(s, 10, 64)
		if err != nil {
			return 0, err
		}
		return wid, nil

	})
	if err != nil {
		return nil, err
	}

	if len(ids) == 0 {
		return &vo.WorkflowDetailDataList{}, nil
	}

	wfs, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			IDs: ids,
		},
		QType:    vo.FromDraft,
		MetaOnly: false,
	})
	if err != nil {
		return nil, err
	}

	workflowDetailDataList := &vo.WorkflowDetailDataList{
		List: make([]*workflow.WorkflowDetailData, 0, len(wfs)),
	}
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wf := range wfs {
		wfIDStr := strconv.FormatInt(wf.ID, 10)
		wd := &workflow.WorkflowDetailData{
			WorkflowID: wfIDStr,
			Name:       wf.Name,
			Desc:       wf.Desc,
			SpaceID:    strconv.FormatInt(wf.SpaceID, 10),
			CreateTime: wf.CreatedAt.Unix(),
			IconURI:    wf.IconURI,
			Icon:       wf.IconURL,
			FlowMode:   wf.Mode,
		}

		cv := &vo.Canvas{}
		err = sonic.UnmarshalString(wf.Canvas, cv)
		if err != nil {
			return nil, err
		}

		wd.EndType, err = parseWorkflowTerminatePlanType(cv)
		if err != nil {
			return nil, err
		}

		if wf.AppID != nil {
			wd.ProjectID = strconv.FormatInt(*wf.AppID, 10)
		}

		if wf.UpdatedAt != nil {
			wd.UpdateTime = wf.UpdatedAt.Unix()
		}
		inputs[wfIDStr], err = toVariables(wf.InputParams)
		if err != nil {
			return nil, err
		}
		outputs[wfIDStr], err = toVariables(wf.OutputParams)
		if err != nil {
			return nil, err
		}
		workflowDetailDataList.List = append(workflowDetailDataList.List, wd)
	}

	workflowDetailDataList.Inputs = inputs
	workflowDetailDataList.Outputs = outputs

	return workflowDetailDataList, nil
}

func (w *ApplicationService) GetWorkflowDetailInfo(ctx context.Context, req *workflow.GetWorkflowDetailInfoRequest) (*vo.WorkflowDetailInfoDataList, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var (
		ids        []int64
		id2Version = make(map[int64]string)
		locator    = vo.FromDraft
	)

	for _, wf := range req.GetWorkflowFilterList() {
		id, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
		if err != nil {
			return nil, err
		}
		ids = append(ids, id)
		if wf.WorkflowVersion != nil {
			locator = vo.FromSpecificVersion
			id2Version[id] = *wf.WorkflowVersion
		}
	}

	if len(ids) == 0 {
		return &vo.WorkflowDetailInfoDataList{}, nil
	}

	wfs, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			IDs: ids,
		},
		QType:    locator,
		MetaOnly: false,
		Versions: id2Version,
	})
	if err != nil {
		return nil, err
	}

	workflowDetailInfoDataList := &vo.WorkflowDetailInfoDataList{
		List: make([]*workflow.WorkflowDetailInfoData, 0, len(wfs)),
	}
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wf := range wfs {
		wfIDStr := strconv.FormatInt(wf.ID, 10)
		wd := &workflow.WorkflowDetailInfoData{
			WorkflowID: wfIDStr,
			Name:       wf.Name,
			Desc:       wf.Desc,
			SpaceID:    strconv.FormatInt(wf.SpaceID, 10),
			CreateTime: wf.CreatedAt.Unix(),
			IconURI:    wf.IconURI,
			Icon:       wf.IconURL,
			FlowMode:   wf.Mode,
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},

			LatestFlowVersion:     wf.GetLatestVersion(),
			LatestFlowVersionDesc: "", // TODO: is this really needed?
		}

		if wf.VersionMeta != nil {
			wd.FlowVersion = wf.Version
			wd.FlowVersionDesc = wf.VersionDescription
		}

		cv := &vo.Canvas{}
		err = sonic.UnmarshalString(wf.Canvas, cv)
		if err != nil {
			return nil, err
		}

		wd.EndType, err = parseWorkflowTerminatePlanType(cv)
		if err != nil {
			return nil, err
		}

		if wf.UpdatedAt != nil {
			wd.UpdateTime = wf.UpdatedAt.Unix()
		}

		if wf.AppID != nil {
			wd.ProjectID = strconv.FormatInt(*wf.AppID, 10)
		}

		inputs[wfIDStr], err = toVariables(wf.InputParams)
		if err != nil {
			return nil, err
		}
		outputs[wfIDStr], err = toVariables(wf.OutputParams)
		if err != nil {
			return nil, err
		}
		workflowDetailInfoDataList.List = append(workflowDetailInfoDataList.List, wd)
	}
	workflowDetailInfoDataList.Inputs = inputs
	workflowDetailInfoDataList.Outputs = outputs
	return workflowDetailInfoDataList, nil
}

func (w *ApplicationService) GetWorkflowUploadAuthToken(ctx context.Context, req *workflow.GetUploadAuthTokenRequest) (*workflow.GetUploadAuthTokenResponse, error) {
	var (
		sceneToUploadPrefixMap = map[string]string{
			"imageflow": "imageflow-",
		}
		prefix string
		ok     bool
	)

	if prefix, ok = sceneToUploadPrefixMap[req.GetScene()]; !ok {
		return nil, fmt.Errorf("scene %s is not supported", req.GetScene())
	}

	authToken, err := w.ImageX.GetUploadAuth(ctx)
	if err != nil {
		return nil, err
	}

	return &workflow.GetUploadAuthTokenResponse{
		Data: &workflow.GetUploadAuthTokenData{
			ServiceID:        w.ImageX.GetServerID(),
			UploadPathPrefix: prefix,
			UploadHost:       w.ImageX.GetUploadHost(),
			Auth: &workflow.UploadAuthTokenInfo{
				AccessKeyID:     authToken.AccessKeyID,
				SecretAccessKey: authToken.SecretAccessKey,
				SessionToken:    authToken.SessionToken,
				ExpiredTime:     authToken.ExpiredTime,
				CurrentTime:     authToken.CurrentTime,
			},
		},
	}, nil

}

func (w *ApplicationService) SignImageURL(ctx context.Context, req *workflow.SignImageURLRequest) (*workflow.SignImageURLResponse, error) {
	url, err := w.ImageX.GetResourceURL(ctx, req.GetURI())
	if err != nil {
		return nil, err
	}

	return &workflow.SignImageURLResponse{
		URL: url.URL,
	}, nil

}

func (w *ApplicationService) GetApiDetail(ctx context.Context, req *workflow.GetApiDetailRequest) (*vo.ToolDetailInfo, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	toolID, err := strconv.ParseInt(req.GetAPIID(), 10, 64)
	if err != nil {
		return nil, err
	}
	pluginID, err := strconv.ParseInt(req.GetPluginID(), 10, 64)
	if err != nil {
		return nil, err
	}

	toolInfoResponse, err := crossplugin.GetPluginService().GetPluginToolsInfo(ctx, &crossplugin.PluginToolsInfoRequest{
		PluginEntity: crossplugin.PluginEntity{
			PluginID:      pluginID,
			PluginVersion: req.PluginVersion,
		},
		ToolIDs: []int64{toolID},
	})
	if err != nil {
		return nil, err
	}

	toolInfo, ok := toolInfoResponse.ToolInfoList[toolID]
	if !ok {
		return nil, fmt.Errorf("tool info not found, tool id: %d", toolID)
	}

	inputVars, err := slices.TransformWithErrorCheck(toolInfo.Inputs, toVariable)
	if err != nil {
		return nil, err
	}

	outputVars, err := slices.TransformWithErrorCheck(toolInfo.Outputs, toVariable)
	if err != nil {
		return nil, err
	}

	toolDetailInfo := &vo.ToolDetailInfo{
		ApiDetailData: &workflow.ApiDetailData{
			PluginID:            req.GetPluginID(),
			SpaceID:             req.GetSpaceID(),
			Icon:                toolInfoResponse.IconURL,
			Name:                toolInfoResponse.PluginName,
			Desc:                toolInfoResponse.Description,
			ApiName:             toolInfo.ToolName,
			Version:             &toolInfoResponse.Version,
			VersionName:         &toolInfoResponse.Version,
			PluginType:          workflow.PluginType(toolInfoResponse.PluginType),
			LatestVersionName:   toolInfoResponse.LatestVersion,
			LatestVersion:       toolInfoResponse.LatestVersion,
			PluginProductStatus: ternary.IFElse(toolInfoResponse.IsOfficial, int64(1), 0),
		},
		ToolInputs:  inputVars,
		ToolOutputs: outputVars,
	}

	return toolDetailInfo, nil

}

func (w *ApplicationService) GetLLMNodeFCSettingDetail(ctx context.Context, req *workflow.GetLLMNodeFCSettingDetailRequest) (*GetLLMNodeFCSettingDetailResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var (
		pluginSvc           = crossplugin.GetPluginService()
		pluginToolsInfoReqs = make(map[int64]*crossplugin.PluginToolsInfoRequest)
		pluginDetailMap     = make(map[string]*workflow.PluginDetail)
		toolsDetailInfo     = make(map[string]*workflow.APIDetail)
		workflowDetailMap   = make(map[string]*workflow.WorkflowDetail)
		knowledgeDetailMap  = make(map[string]*workflow.DatasetDetail)
	)

	if len(req.GetPluginList()) > 0 {
		for _, pl := range req.GetPluginList() {
			pluginID, err := strconv.ParseInt(pl.PluginID, 10, 64)
			if err != nil {
				return nil, err
			}

			toolID, err := strconv.ParseInt(pl.APIID, 10, 64)
			if err != nil {
				return nil, err
			}

			if r, ok := pluginToolsInfoReqs[pluginID]; ok {
				r.ToolIDs = append(r.ToolIDs, toolID)
			} else {
				pluginToolsInfoReqs[pluginID] = &crossplugin.PluginToolsInfoRequest{
					PluginEntity: crossplugin.PluginEntity{
						PluginID:      pluginID,
						PluginVersion: pl.PluginVersion,
					},
					ToolIDs: []int64{toolID},
					IsDraft: pl.IsDraft,
				}
			}

		}
		for _, r := range pluginToolsInfoReqs {
			resp, err := pluginSvc.GetPluginToolsInfo(ctx, r)
			if err != nil {
				return nil, err
			}

			pluginIdStr := strconv.FormatInt(resp.PluginID, 10)
			if _, ok := pluginDetailMap[pluginIdStr]; !ok {
				pluginDetail := &workflow.PluginDetail{
					ID:          pluginIdStr,
					Name:        resp.PluginName,
					IconURL:     resp.IconURL,
					Description: resp.Description,
					PluginType:  resp.PluginType,
					VersionName: resp.Version,
					IsOfficial:  resp.IsOfficial,
				}

				if resp.LatestVersion != nil {
					pluginDetail.LatestVersionName = *resp.LatestVersion
				}
				pluginDetailMap[pluginIdStr] = pluginDetail
			}

			for id, tl := range resp.ToolInfoList {
				toolIDStr := strconv.FormatInt(id, 10)
				if _, ok := toolsDetailInfo[toolIDStr]; !ok {
					toolDetail := &workflow.APIDetail{
						ID:          toolIDStr,
						PluginID:    pluginIdStr,
						Name:        tl.ToolName,
						Description: tl.Description,
					}
					toolsDetailInfo[toolIDStr] = toolDetail

					toolDetail.Parameters = tl.Inputs

				}

			}

		}
	}

	if len(req.GetWorkflowList()) > 0 {
		var (
			ids        []int64
			id2Version = make(map[int64]string)
			locator    = vo.FromDraft
		)

		for _, wf := range req.GetWorkflowList() {
			id, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
			if err != nil {
				return nil, err
			}
			ids = append(ids, id)
			if wf.WorkflowVersion != nil {
				locator = vo.FromSpecificVersion
				id2Version[id] = *wf.WorkflowVersion
			}
		}

		wfs, err := GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs: ids,
			},
			QType:    locator,
			MetaOnly: false,
			Versions: id2Version,
		})
		if err != nil {
			return nil, err
		}
		for _, wf := range wfs {
			wfIDStr := strconv.FormatInt(wf.ID, 10)
			workflowParameters, err := slices.TransformWithErrorCheck(wf.InputParams, toWorkflowAPIParameter)
			if err != nil {
				return nil, err
			}

			workflowDetailMap[wfIDStr] = &workflow.WorkflowDetail{
				ID:                wfIDStr,
				PluginID:          wfIDStr,
				Description:       wf.Desc,
				Name:              wf.Name,
				IconURL:           wf.IconURL,
				Type:              int64(common.PluginType_WORKFLOW),
				LatestVersionName: wf.GetLatestVersion(),
				APIDetail: &workflow.APIDetail{
					ID:         wfIDStr,
					PluginID:   wfIDStr,
					Name:       wf.Name,
					Parameters: workflowParameters,
				},
			}
		}
	}

	if len(req.GetDatasetList()) > 0 {
		knowledgeOperator := crossknowledge.GetKnowledgeOperator()
		knowledgeIDs, err := slices.TransformWithErrorCheck(req.GetDatasetList(), func(a *workflow.DatasetFCItem) (int64, error) {
			return strconv.ParseInt(a.GetDatasetID(), 10, 64)
		})
		if err != nil {
			return nil, err
		}
		details, err := knowledgeOperator.ListKnowledgeDetail(ctx, &crossknowledge.ListKnowledgeDetailRequest{KnowledgeIDs: knowledgeIDs})
		if err != nil {
			return nil, err
		}
		knowledgeDetailMap = slices.ToMap(details.KnowledgeDetails, func(kd *crossknowledge.KnowledgeDetail) (string, *workflow.DatasetDetail) {
			return strconv.FormatInt(kd.ID, 10), &workflow.DatasetDetail{
				ID:         strconv.FormatInt(kd.ID, 10),
				Name:       kd.Name,
				IconURL:    kd.IconURL,
				FormatType: kd.FormatType,
			}
		})

	}

	response := &workflow.GetLLMNodeFCSettingDetailResponse{
		PluginDetailMap:    pluginDetailMap,
		PluginAPIDetailMap: toolsDetailInfo,
		WorkflowDetailMap:  workflowDetailMap,
		DatasetDetailMap:   knowledgeDetailMap,
	}

	return &GetLLMNodeFCSettingDetailResponse{
		GetLLMNodeFCSettingDetailResponse: response,
	}, nil
}

func (w *ApplicationService) GetLLMNodeFCSettingsMerged(ctx context.Context, req *workflow.GetLLMNodeFCSettingsMergedRequest) (*workflow.GetLLMNodeFCSettingsMergedResponse, error) {
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	var fcPluginSetting *workflow.FCPluginSetting
	if req.GetPluginFcSetting() != nil {
		var (
			pluginSvc       = crossplugin.GetPluginService()
			pluginFcSetting = req.GetPluginFcSetting()
			isDraft         = pluginFcSetting.GetIsDraft()
		)

		pluginID, err := strconv.ParseInt(pluginFcSetting.GetPluginID(), 10, 64)
		if err != nil {
			return nil, err
		}

		toolID, err := strconv.ParseInt(pluginFcSetting.GetAPIID(), 10, 64)
		if err != nil {
			return nil, err
		}

		pluginReq := &crossplugin.PluginToolsInfoRequest{
			PluginEntity: vo.PluginEntity{
				PluginID: pluginID,
			},
			ToolIDs: []int64{toolID},
			IsDraft: isDraft,
		}

		pInfo, err := pluginSvc.GetPluginToolsInfo(ctx, pluginReq)
		if err != nil {
			return nil, err
		}
		toolInfo, ok := pInfo.ToolInfoList[toolID]
		if !ok {
			return nil, fmt.Errorf("tool info not found, too id=%v", toolID)
		}

		latestRequestParams := toolInfo.Inputs
		latestResponseParams := toolInfo.Outputs
		mergeWorkflowAPIParameters(latestRequestParams, pluginFcSetting.GetRequestParams())
		mergeWorkflowAPIParameters(latestResponseParams, pluginFcSetting.GetResponseParams())

		fcPluginSetting = &workflow.FCPluginSetting{
			PluginID:       strconv.FormatInt(pInfo.PluginID, 10),
			APIID:          strconv.FormatInt(toolInfo.ToolID, 10),
			APIName:        toolInfo.ToolName,
			IsDraft:        isDraft,
			RequestParams:  latestRequestParams,
			ResponseParams: latestResponseParams,
			PluginVersion:  pluginFcSetting.GetPluginVersion(),
			ResponseStyle:  &workflow.ResponseStyle{},
		}
	}
	var fCWorkflowSetting *workflow.FCWorkflowSetting
	if setting := req.GetWorkflowFcSetting(); setting != nil {
		wID, err := strconv.ParseInt(setting.GetWorkflowID(), 10, 64)
		if err != nil {
			return nil, err
		}

		policy := &vo.GetPolicy{
			ID:      wID,
			QType:   ternary.IFElse(len(setting.WorkflowVersion) == 0, vo.FromDraft, vo.FromSpecificVersion),
			Version: setting.WorkflowVersion,
		}

		wf, err := GetWorkflowDomainSVC().Get(ctx, policy)
		if err != nil {
			return nil, err
		}

		latestRequestParams, err := slices.TransformWithErrorCheck(wf.InputParams, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}

		latestResponseParams, err := slices.TransformWithErrorCheck(wf.OutputParams, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}

		mergeWorkflowAPIParameters(latestRequestParams, setting.GetRequestParams())

		mergeWorkflowAPIParameters(latestResponseParams, setting.GetResponseParams())

		fCWorkflowSetting = &workflow.FCWorkflowSetting{
			WorkflowID:     strconv.FormatInt(wID, 10),
			PluginID:       strconv.FormatInt(wID, 10),
			IsDraft:        setting.GetIsDraft(),
			RequestParams:  latestRequestParams,
			ResponseParams: latestResponseParams,
			ResponseStyle:  &workflow.ResponseStyle{},
		}
	}

	return &workflow.GetLLMNodeFCSettingsMergedResponse{
		PluginFcSetting:  fcPluginSetting,
		WorflowFcSetting: fCWorkflowSetting,
	}, nil
}

func (w *ApplicationService) GetPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (
	resp *pluginAPI.GetPlaygroundPluginListResponse, err error) {
	currentUser := ctxutil.MustGetUIDFromCtx(ctx)
	if err = checkUserSpace(ctx, currentUser, req.GetSpaceID()); err != nil {
		return nil, err
	}

	var (
		toolIDs []int64
		wfs     []*entity.Workflow
	)
	if len(req.GetPluginIds()) > 0 {
		toolIDs, err = slices.TransformWithErrorCheck(req.GetPluginIds(), func(a string) (int64, error) {
			return strconv.ParseInt(a, 10, 64)
		})
		if err != nil {
			return nil, err
		}

		wfs, err = GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs:           toolIDs,
				SpaceID:       ptr.Of(req.GetSpaceID()),
				PublishStatus: ptr.Of(vo.HasPublished),
			},
			QType: vo.FromLatestVersion,
		})
	} else if req.GetPage() > 0 && req.GetSize() > 0 {
		wfs, err = GetWorkflowDomainSVC().MGet(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				Page: &vo.Page{
					Size: req.GetSize(),
					Page: req.GetPage(),
				},
				SpaceID:       ptr.Of(req.GetSpaceID()),
				PublishStatus: ptr.Of(vo.HasPublished),
			},
			QType: vo.FromLatestVersion,
		})
	}

	if err != nil {
		return nil, err
	}

	pluginInfoList := make([]*common.PluginInfoForPlayground, 0)
	for _, wf := range wfs {
		pInfo := &common.PluginInfoForPlayground{
			ID:           strconv.FormatInt(wf.ID, 10),
			Name:         wf.Name,
			PluginIcon:   wf.IconURL,
			DescForHuman: wf.Desc,
			Creator: &common.Creator{
				Self: ternary.IFElse(wf.CreatorID == currentUser, true, false),
			},
			PluginType:  common.PluginType_WORKFLOW,
			VersionName: wf.VersionMeta.Version,
			CreateTime:  strconv.FormatInt(wf.CreatedAt.Unix(), 10),
			UpdateTime:  strconv.FormatInt(wf.VersionCreatedAt.Unix(), 10),
		}

		var pluginApi = &common.PluginApi{
			APIID:    strconv.FormatInt(wf.ID, 10),
			Name:     wf.Name,
			Desc:     wf.Desc,
			PluginID: strconv.FormatInt(wf.ID, 10),
		}
		pluginApi.Parameters, err = slices.TransformWithErrorCheck(wf.InputParams, toPluginParameter)

		if err != nil {
			return nil, err
		}

		pInfo.PluginApis = []*common.PluginApi{pluginApi}
		pluginInfoList = append(pluginInfoList, pInfo)
	}

	return &pluginAPI.GetPlaygroundPluginListResponse{
		Data: &common.GetPlaygroundPluginListData{
			PluginList: pluginInfoList,
			Total:      int32(len(pluginInfoList)),
		},
	}, nil
}

func (w *ApplicationService) CopyWorkflow(ctx context.Context, req *workflow.CopyWorkflowRequest) (resp *workflow.CopyWorkflowResponse, err error) {
	spaceID, err := strconv.ParseInt(req.GetSpaceID(), 10, 64)
	if err != nil {
		return nil, err
	}

	if err = checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), spaceID); err != nil {
		return nil, err
	}

	workflowID, err := strconv.ParseInt(req.GetWorkflowID(), 10, 64)
	if err != nil {
		return nil, err
	}

	copiedID, err := GetWorkflowDomainSVC().CopyWorkflow(ctx, workflowID, vo.CopyWorkflowPolicy{
		ShouldModifyWorkflowName: true,
	})
	if err != nil {
		return nil, err
	}

	return &workflow.CopyWorkflowResponse{
		Data: &workflow.CopyWorkflowData{
			WorkflowID: strconv.FormatInt(copiedID, 10),
		},
	}, err
}

func (w *ApplicationService) GetHistorySchema(ctx context.Context, req *workflow.GetHistorySchemaRequest) (resp *workflow.GetHistorySchemaResponse, err error) {
	spaceID := mustParseInt64(req.GetSpaceID())
	if err = checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}

	workflowID := mustParseInt64(req.GetWorkflowID())
	executeID := mustParseInt64(req.GetExecuteID())

	var subExecuteID *int64
	if req.IsSetSubExecuteID() {
		subExecuteID = ptr.Of(mustParseInt64(req.GetSubExecuteID()))
	}

	exe := &entity.WorkflowExecution{
		WorkflowID: workflowID,
		SpaceID:    spaceID,
	}

	if subExecuteID == nil {
		exe.ID = executeID
		exe.RootExecutionID = executeID
	} else {
		exe.ID = *subExecuteID
		exe.RootExecutionID = executeID
	}
	// use executeID and sub_executeID to get the workflow execution
	exe, err = GetWorkflowDomainSVC().GetExecution(ctx, exe, false)
	if err != nil {
		return nil, err
	}

	// verify the workflowID
	if exe.WorkflowID != workflowID {
		return nil, fmt.Errorf("workflowID mismatch")
	}

	// get the workflow entity for that workflowID and commitID
	policy := &vo.GetPolicy{
		ID:       workflowID,
		QType:    ternary.IFElse(len(exe.Version) > 0, vo.FromSpecificVersion, vo.FromDraft),
		Version:  exe.Version,
		CommitID: exe.CommitID,
	}

	wfEntity, err := GetWorkflowDomainSVC().Get(ctx, policy)
	if err != nil {
		return nil, err
	}

	// convert the workflow entity to workflow history schema
	return &workflow.GetHistorySchemaResponse{
		Data: &workflow.GetHistorySchemaData{
			Name:         wfEntity.Name,
			Describe:     wfEntity.Desc,
			URL:          wfEntity.IconURL,
			Schema:       wfEntity.Canvas,
			FlowMode:     wfEntity.Mode,
			WorkflowID:   req.GetWorkflowID(),
			CommitID:     wfEntity.CommitID,
			ExecuteID:    req.ExecuteID,
			SubExecuteID: req.SubExecuteID,
		},
	}, nil
}

func mustParseInt64(s string) int64 {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		panic(err)
	}
	return i
}

func parseInt64(s *string) *int64 {
	if s == nil {
		return nil
	}

	i := mustParseInt64(*s)
	return &i
}

func toWorkflowParameter(nType *vo.NamedTypeInfo) (*workflow.Parameter, error) {
	wp := &workflow.Parameter{Name: nType.Name}
	wp.Desc = nType.Desc
	if nType.Required {
		wp.Required = true
	}
	switch nType.Type {
	case vo.DataTypeString, vo.DataTypeTime, vo.DataTypeFile:
		wp.Type = workflow.InputType_String
	case vo.DataTypeInteger:
		wp.Type = workflow.InputType_Integer
	case vo.DataTypeNumber:
		wp.Type = workflow.InputType_Number
	case vo.DataTypeBoolean:
		wp.Type = workflow.InputType_Boolean
	case vo.DataTypeArray:
		wp.Type = workflow.InputType_Array
		if nType.ElemTypeInfo != nil {
			switch nType.ElemTypeInfo.Type {
			case vo.DataTypeString, vo.DataTypeTime, vo.DataTypeFile:
				wp.SubType = workflow.InputType_String
			case vo.DataTypeInteger:
				wp.SubType = workflow.InputType_Integer
			case vo.DataTypeNumber:
				wp.SubType = workflow.InputType_Number
			case vo.DataTypeBoolean:
				wp.SubType = workflow.InputType_Boolean
			case vo.DataTypeObject:
				wp.SubType = workflow.InputType_Object
			}
		}
	case vo.DataTypeObject:
		wp.Type = workflow.InputType_Object
	default:
		return nil, fmt.Errorf("unknown type: %s", nType.Type)

	}

	return wp, nil
}

func nodeType2EntityNodeType(t string) (entity.NodeType, error) {
	i, err := strconv.Atoi(t)
	if err != nil {
		return "", fmt.Errorf("invalid node type string '%s': %w", t, err)
	}

	switch i {
	case 1:
		return entity.NodeTypeEntry, nil
	case 2:
		return entity.NodeTypeExit, nil
	case 3:
		return entity.NodeTypeLLM, nil
	case 4:
		return entity.NodeTypePlugin, nil
	case 5:
		return entity.NodeTypeCodeRunner, nil
	case 6:
		return entity.NodeTypeKnowledgeRetriever, nil
	case 8:
		return entity.NodeTypeSelector, nil
	case 9:
		return entity.NodeTypeSubWorkflow, nil
	case 12:
		return entity.NodeTypeDatabaseCustomSQL, nil
	case 13:
		return entity.NodeTypeOutputEmitter, nil
	case 15:
		return entity.NodeTypeTextProcessor, nil
	case 18:
		return entity.NodeTypeQuestionAnswer, nil
	case 19:
		return entity.NodeTypeBreak, nil
	case 20:
		return entity.NodeTypeVariableAssignerWithinLoop, nil
	case 21:
		return entity.NodeTypeLoop, nil
	case 22:
		return entity.NodeTypeIntentDetector, nil
	case 27:
		return entity.NodeTypeKnowledgeIndexer, nil
	case 28:
		return entity.NodeTypeBatch, nil
	case 29:
		return entity.NodeTypeContinue, nil
	case 30:
		return entity.NodeTypeInputReceiver, nil
	case 32:
		return entity.NodeTypeVariableAggregator, nil
	case 37:
		return entity.NodeTypeMessageList, nil
	case 38:
		return entity.NodeTypeClearMessage, nil
	case 39:
		return entity.NodeTypeCreateConversation, nil
	case 40:
		return entity.NodeTypeVariableAssigner, nil
	case 42:
		return entity.NodeTypeDatabaseUpdate, nil
	case 43:
		return entity.NodeTypeDatabaseQuery, nil
	case 44:
		return entity.NodeTypeDatabaseDelete, nil
	case 45:
		return entity.NodeTypeHTTPRequester, nil
	case 46:
		return entity.NodeTypeDatabaseInsert, nil
	default:
		// Handle all unknown or unsupported types here
		return "", fmt.Errorf("unsupported or unknown node type ID: %d", i)
	}
}

// entityNodeTypeToAPINodeTemplateType converts an entity.NodeType to the corresponding workflow.NodeTemplateType.
func entityNodeTypeToAPINodeTemplateType(nodeType entity.NodeType) (workflow.NodeTemplateType, error) {
	switch nodeType {
	case entity.NodeTypeEntry:
		return workflow.NodeTemplateType_Start, nil
	case entity.NodeTypeExit:
		return workflow.NodeTemplateType_End, nil
	case entity.NodeTypeLLM:
		return workflow.NodeTemplateType_LLM, nil
	case entity.NodeTypePlugin:
		// Maps to Api type in the API model
		return workflow.NodeTemplateType_Api, nil
	case entity.NodeTypeCodeRunner:
		return workflow.NodeTemplateType_Code, nil
	case entity.NodeTypeKnowledgeRetriever:
		// Maps to Dataset type in the API model
		return workflow.NodeTemplateType_Dataset, nil
	case entity.NodeTypeSelector:
		// Maps to If type in the API model
		return workflow.NodeTemplateType_If, nil
	case entity.NodeTypeSubWorkflow:
		return workflow.NodeTemplateType_SubWorkflow, nil
	case entity.NodeTypeDatabaseCustomSQL:
		// Maps to the generic Database type in the API model
		return workflow.NodeTemplateType_Database, nil
	case entity.NodeTypeOutputEmitter:
		// Maps to Message type in the API model
		return workflow.NodeTemplateType_Message, nil
	case entity.NodeTypeTextProcessor:
		return workflow.NodeTemplateType_Text, nil
	case entity.NodeTypeQuestionAnswer:
		return workflow.NodeTemplateType_Question, nil
	case entity.NodeTypeBreak:
		return workflow.NodeTemplateType_Break, nil
	case entity.NodeTypeVariableAssigner:
		return workflow.NodeTemplateType_AssignVariable, nil
	case entity.NodeTypeVariableAssignerWithinLoop:
		return workflow.NodeTemplateType_LoopSetVariable, nil
	case entity.NodeTypeLoop:
		return workflow.NodeTemplateType_Loop, nil
	case entity.NodeTypeIntentDetector:
		return workflow.NodeTemplateType_Intent, nil
	case entity.NodeTypeKnowledgeIndexer:
		// Maps to DatasetWrite type in the API model
		return workflow.NodeTemplateType_DatasetWrite, nil
	case entity.NodeTypeBatch:
		return workflow.NodeTemplateType_Batch, nil
	case entity.NodeTypeContinue:
		return workflow.NodeTemplateType_Continue, nil
	case entity.NodeTypeInputReceiver:
		return workflow.NodeTemplateType_Input, nil
	case entity.NodeTypeMessageList:
		return workflow.NodeTemplateType(37), nil
	case entity.NodeTypeVariableAggregator:
		return workflow.NodeTemplateType(32), nil
	case entity.NodeTypeClearMessage:
		return workflow.NodeTemplateType(38), nil
	case entity.NodeTypeCreateConversation:
		return workflow.NodeTemplateType(39), nil
	// Note: entity.NodeTypeVariableAggregator (ID 32) has no direct mapping in NodeTemplateType
	// Note: entity.NodeTypeMessageList (ID 37) has no direct mapping in NodeTemplateType
	// Note: entity.NodeTypeClearMessage (ID 38) has no direct mapping in NodeTemplateType
	// Note: entity.NodeTypeCreateConversation (ID 39) has no direct mapping in NodeTemplateType
	case entity.NodeTypeDatabaseUpdate:
		return workflow.NodeTemplateType_DatabaseUpdate, nil
	case entity.NodeTypeDatabaseQuery:
		// Maps to DatabasesELECT (ID 43) in the API model (note potential typo)
		return workflow.NodeTemplateType_DatabasesELECT, nil
	case entity.NodeTypeDatabaseDelete:
		return workflow.NodeTemplateType_DatabaseDelete, nil

	// Note: entity.NodeTypeHTTPRequester (ID 45) has no direct mapping in NodeTemplateType
	case entity.NodeTypeHTTPRequester:
		return workflow.NodeTemplateType(45), nil

	case entity.NodeTypeDatabaseInsert:
		// Maps to DatabaseInsert (ID 41) in the API model, despite entity ID being 46.
		// return workflow.NodeTemplateType_DatabaseInsert, nil
		return workflow.NodeTemplateType(46), nil
	case entity.NodeTypeLambda:
		return 0, nil
	default:
		// Handle entity types that don't have a corresponding NodeTemplateType
		return workflow.NodeTemplateType(0), fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType)
	}
}

func i64PtrToStringPtr(i *int64) *string {
	if i == nil {
		return nil
	}

	s := strconv.FormatInt(*i, 10)
	return &s
}

func toVariables(namedTypeInfoList []*vo.NamedTypeInfo) ([]*vo.Variable, error) {
	var vs = make([]*vo.Variable, 0, len(namedTypeInfoList))
	for _, in := range namedTypeInfoList {
		v, err := in.ToVariable()
		if err != nil {
			return nil, err
		}
		vs = append(vs, v)
	}

	return vs, nil

}

func toPluginParameter(info *vo.NamedTypeInfo) (*common.PluginParameter, error) {
	if info == nil {
		return nil, fmt.Errorf("named type info is nil")
	}
	p := &common.PluginParameter{
		Name:     info.Name,
		Desc:     info.Desc,
		Required: info.Required,
	}

	if info.Type == vo.DataTypeFile && info.FileType != nil {
		switch *info.FileType {
		case vo.FileTypeZip:
			p.Format = ptr.Of(common.PluginParamTypeFormat_ZipUrl)
		case vo.FileTypeCode:
			p.Format = ptr.Of(common.PluginParamTypeFormat_CodeUrl)
		case vo.FileTypeTxt:
			p.Format = ptr.Of(common.PluginParamTypeFormat_TxtUrl)
		case vo.FileTypeExcel:
			p.Format = ptr.Of(common.PluginParamTypeFormat_ExcelUrl)
		case vo.FileTypePPT:
			p.Format = ptr.Of(common.PluginParamTypeFormat_PptUrl)
		case vo.FileTypeDocument:
			p.Format = ptr.Of(common.PluginParamTypeFormat_DocUrl)
		case vo.FileTypeVideo:
			p.Format = ptr.Of(common.PluginParamTypeFormat_VideoUrl)
		case vo.FileTypeAudio:
			p.Format = ptr.Of(common.PluginParamTypeFormat_AudioUrl)
		case vo.FileTypeImage:
			p.Format = ptr.Of(common.PluginParamTypeFormat_ImageUrl)
		default:
			// missing types use file as the default type
			p.Format = ptr.Of(common.PluginParamTypeFormat_FileUrl)
		}
	}

	switch info.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		p.Type = "string"
	case vo.DataTypeInteger:
		p.Type = "integer"
	case vo.DataTypeNumber:
		p.Type = "number"
	case vo.DataTypeBoolean:
		p.Type = "boolean"
	case vo.DataTypeObject:
		p.Type = "object"
		p.SubParameters = make([]*common.PluginParameter, 0, len(info.Properties))
		for _, sub := range info.Properties {
			subParameter, err := toPluginParameter(sub)
			if err != nil {
				return nil, err
			}
			p.SubParameters = append(p.SubParameters, subParameter)
		}
	case vo.DataTypeArray:
		p.Type = "array"
		eleParameter, err := toPluginParameter(info.ElemTypeInfo)
		if err != nil {
			return nil, err
		}
		p.SubType = eleParameter.Type
		p.SubParameters = []*common.PluginParameter{eleParameter}
	default:
		return nil, fmt.Errorf("unknown named type info type: %s", info.Type)
	}

	return p, nil
}

func toWorkflowAPIParameter(info *vo.NamedTypeInfo) (*workflow.APIParameter, error) {
	if info == nil {
		return nil, fmt.Errorf("named type info is nil")
	}
	p := &workflow.APIParameter{
		Name:       info.Name,
		Desc:       info.Desc,
		IsRequired: info.Required,
	}

	if info.Type == vo.DataTypeFile && info.FileType != nil {
		p.AssistType = ptr.Of(toWorkflowAPIParameterAssistType(*info.FileType))
	}

	switch info.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		p.Type = workflow.ParameterType_String
	case vo.DataTypeInteger:
		p.Type = workflow.ParameterType_Integer
	case vo.DataTypeBoolean:
		p.Type = workflow.ParameterType_Bool
	case vo.DataTypeObject:
		p.Type = workflow.ParameterType_Object
		p.SubParameters = make([]*workflow.APIParameter, 0, len(info.Properties))
		subParameters, err := slices.TransformWithErrorCheck(info.Properties, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}
		p.SubParameters = append(p.SubParameters, subParameters...)
	case vo.DataTypeNumber:
		p.Type = workflow.ParameterType_Number
	case vo.DataTypeArray:
		p.Type = workflow.ParameterType_Array
		eleParameters, err := slices.TransformWithErrorCheck([]*vo.NamedTypeInfo{info.ElemTypeInfo}, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}
		eleParameter := eleParameters[0]
		p.SubType = &eleParameter.Type
		p.SubParameters = []*workflow.APIParameter{eleParameter}
	default:
		return nil, fmt.Errorf("unknown named type info type: %s", info.Type)
	}

	return p, nil
}

func toWorkflowAPIParameterAssistType(ty vo.FileSubType) workflow.AssistParameterType {
	switch ty {
	case vo.FileTypeImage:
		return workflow.AssistParameterType_IMAGE
	case vo.FileTypeSVG:
		return workflow.AssistParameterType_SVG
	case vo.FileTypeAudio:
		return workflow.AssistParameterType_AUDIO
	case vo.FileTypeVideo:
		return workflow.AssistParameterType_VIDEO
	case vo.FileTypeVoice:
		return workflow.AssistParameterType_Voice
	case vo.FileTypeDocument:
		return workflow.AssistParameterType_DOC
	case vo.FileTypePPT:
		return workflow.AssistParameterType_PPT
	case vo.FileTypeExcel:
		return workflow.AssistParameterType_EXCEL
	case vo.FileTypeTxt:
		return workflow.AssistParameterType_TXT
	case vo.FileTypeCode:
		return workflow.AssistParameterType_CODE
	case vo.FileTypeZip:
		return workflow.AssistParameterType_ZIP
	default:
		return workflow.APIParameter_AssistType_DEFAULT
	}
}

func toVariable(p *workflow.APIParameter) (*vo.Variable, error) {
	v := &vo.Variable{
		Name:        p.Name,
		Description: p.Desc,
		Required:    p.IsRequired,
	}

	if p.AssistType != nil {
		v.AssistType = vo.AssistType(*p.AssistType)
	}

	switch p.Type {
	case workflow.ParameterType_String:
		v.Type = vo.VariableTypeString
	case workflow.ParameterType_Integer:
		v.Type = vo.VariableTypeInteger
	case workflow.ParameterType_Number:
		v.Type = vo.VariableTypeFloat
	case workflow.ParameterType_Bool:
		v.Type = vo.VariableTypeBoolean
	case workflow.ParameterType_Array:
		v.Type = vo.VariableTypeList
		if len(p.SubParameters) > 0 {
			subVs := make([]any, 0)
			for _, ap := range p.SubParameters {
				av, err := toVariable(ap)
				if err != nil {
					return nil, err
				}
				subVs = append(subVs, av)
			}
			v.Schema = &vo.Variable{
				Type:   vo.VariableTypeObject,
				Schema: subVs,
			}
		}

	case workflow.ParameterType_Object:
		v.Type = vo.VariableTypeObject
		vs := make([]*vo.Variable, 0)
		for _, v := range p.SubParameters {
			objV, err := toVariable(v)
			if err != nil {
				return nil, err
			}
			vs = append(vs, objV)

		}
		v.Schema = vs
	default:
		return nil, fmt.Errorf("unknown workflow api parameter type: %v", p.Type)
	}
	return v, nil
}

func mergeWorkflowAPIParameters(latestAPIParameters []*workflow.APIParameter, existAPIParameters []*workflow.APIParameter) {

	existAPIParameterMap := slices.ToMap(existAPIParameters, func(w *workflow.APIParameter) (string, *workflow.APIParameter) {
		return w.Name, w
	})

	for _, parameter := range latestAPIParameters {
		if ep, ok := existAPIParameterMap[parameter.Name]; ok {
			parameter.LocalDisable = ep.LocalDisable
			parameter.LocalDefault = ep.LocalDefault
			if len(parameter.SubParameters) > 0 && len(ep.SubParameters) > 0 {
				mergeWorkflowAPIParameters(parameter.SubParameters, ep.SubParameters)
			}

		} else {
			existAPIParameters = append(existAPIParameters, parameter)
		}

	}

}

func parseWorkflowTerminatePlanType(c *vo.Canvas) (int32, error) {
	var endNode *vo.Node
	for _, n := range c.Nodes {
		if n.Type == vo.BlockTypeBotEnd {
			endNode = n
			break
		}
	}
	if endNode == nil {
		return 0, fmt.Errorf("can not find end node")
	}
	switch *endNode.Data.Inputs.TerminatePlan {
	case vo.ReturnVariables:
		return 0, nil
	case vo.UseAnswerContent:
		return 1, nil
	default:
		return 0, fmt.Errorf("invalid terminate plan type %v", *endNode.Data.Inputs.TerminatePlan)
	}

}

type GetLLMNodeFCSettingDetailResponse struct {
	*workflow.GetLLMNodeFCSettingDetailResponse
}

func (g *GetLLMNodeFCSettingDetailResponse) MarshalJSON() ([]byte, error) {
	bs, err := sonic.Marshal(g.GetLLMNodeFCSettingDetailResponse)
	if err != nil {
		return nil, err
	}
	result := make(map[string]interface{})
	_ = sonic.Unmarshal(bs, &result)
	pluginDetailMaps := result["plugin_detail_map"].(map[string]interface{})
	for k, value := range pluginDetailMaps {
		pluginDetail := value.(map[string]interface{})
		pluginDetail["latest_version_ts"] = pluginDetail["latest_version_name"]
		pluginDetailMaps[k] = pluginDetail
	}
	return sonic.Marshal(result)
}

func checkUserSpace(ctx context.Context, uid int64, spaceID int64) error {
	spaces, err := crossuser.DefaultSVC().GetUserSpaceList(ctx, uid)
	if err != nil {
		return err
	}

	var match bool
	for _, s := range spaces {
		if s.ID == spaceID {
			match = true
			break
		}
	}

	if !match {
		return fmt.Errorf("user %d does not have access to space %d", uid, spaceID)
	}

	return nil
}
