package workflow

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	domainWorkflow "code.byted.org/flow/opencoze/backend/domain/workflow"
	workflowDomain "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type WorkflowApplicationService struct {
	DomainSVC workflowDomain.Service
	ImageX    imagex.ImageX // we set Imagex here, because Imagex is used as a proxy to get auth token, there is no actual correlation with the workflow domain.
}

var WorkflowSVC = &WorkflowApplicationService{}

func GetWorkflowDomainSVC() domainWorkflow.Service {
	return WorkflowSVC.DomainSVC
}

func (w *WorkflowApplicationService) GetNodeTemplateList(ctx context.Context, req *workflow.NodeTemplateListRequest) (*workflow.NodeTemplateListResponse, error) {
	toQueryTypes := make(map[entity.NodeType]bool)
	for _, t := range req.NodeTypes {
		entityType, err := nodeType2EntityNodeType(t)
		if err != nil {
			logs.Warnf("get node type %v failed, err:=%v", t, err)
			continue
		}
		toQueryTypes[entityType] = true
	}

	category2NodeMetaList, _, _, err := GetWorkflowDomainSVC().ListNodeMeta(ctx, toQueryTypes)
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
				Name:         nodeMeta.Name,
				Desc:         nodeMeta.Desc,
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

func (w *WorkflowApplicationService) CreateWorkflow(ctx context.Context, req *workflow.CreateWorkflowRequest) (*workflow.CreateWorkflowResponse, error) {

	wf := &entity.Workflow{
		ContentType: workflow.WorkFlowType_User,
		Name:        req.Name,
		Desc:        req.Desc,
		IconURI:     req.IconURI,
		Mode:        workflow.WorkflowMode_Workflow,
		ProjectID:   parseInt64(req.ProjectID),
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid != nil {
		wf.CreatorID = *uid
	}

	if req.IsSetFlowMode() {
		wf.Mode = *req.FlowMode
	}

	spaceID, err := strconv.ParseInt(req.SpaceID, 10, 64)
	if err != nil {
		return nil, err
	}
	wf.SpaceID = spaceID

	var ref *entity.WorkflowReference
	if req.IsSetBindBizID() {
		if !req.IsSetBindBizType() {
			return nil, fmt.Errorf("bind_biz_id cannot be set when bind_biz_type is set")
		}

		if *req.BindBizType == int32(workflow.BindBizType_Agent) {
			return nil, fmt.Errorf("bind_biz_type cannot be set when bind_biz_type is set")
		}

		ref = &entity.WorkflowReference{
			ReferringID:      mustParseInt64(*req.BindBizID),
			SpaceID:          spaceID,
			ReferType:        entity.ReferTypeTool,
			ReferringBizType: entity.ReferringBizTypeAgent,
		}
	}

	id, err := GetWorkflowDomainSVC().CreateWorkflow(ctx, wf, ref)
	if err != nil {
		return nil, err
	}

	return &workflow.CreateWorkflowResponse{
		Data: &workflow.CreateWorkflowData{
			WorkflowID: fmt.Sprintf("%d", id),
		},
	}, nil
}

func (w *WorkflowApplicationService) SaveWorkflow(ctx context.Context, req *workflow.SaveWorkflowRequest) (*workflow.SaveWorkflowResponse, error) {
	draft := &entity.Workflow{
		WorkflowIdentity: entity.WorkflowIdentity{
			ID: mustParseInt64(req.GetWorkflowID()),
		},
		SpaceID: mustParseInt64(req.GetSpaceID()),
		Canvas:  req.Schema,
	}

	err := GetWorkflowDomainSVC().SaveWorkflow(ctx, draft)
	if err != nil {
		return nil, err
	}

	return &workflow.SaveWorkflowResponse{
		Data: &workflow.SaveWorkflowData{},
	}, nil
}

func (w *WorkflowApplicationService) UpdateWorkflowMeta(ctx context.Context, req *workflow.UpdateWorkflowMetaRequest) (*workflow.UpdateWorkflowMetaResponse, error) {
	wf := &entity.Workflow{
		WorkflowIdentity: entity.WorkflowIdentity{
			ID: mustParseInt64(req.GetWorkflowID()),
		},
		SpaceID: mustParseInt64(req.GetSpaceID()),
		Name:    req.GetName(),
		Desc:    req.GetDesc(),
		IconURI: req.GetIconURI(),
	}

	err := GetWorkflowDomainSVC().UpdateWorkflowMeta(ctx, wf)
	if err != nil {
		return nil, err
	}
	return &workflow.UpdateWorkflowMetaResponse{}, nil
}

func (w *WorkflowApplicationService) DeleteWorkflow(ctx context.Context, req *workflow.DeleteWorkflowRequest) (*workflow.DeleteWorkflowResponse, error) {
	err := GetWorkflowDomainSVC().DeleteWorkflow(ctx, mustParseInt64(req.GetWorkflowID()))
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

func (w *WorkflowApplicationService) GetWorkflow(ctx context.Context, req *workflow.GetCanvasInfoRequest) (*workflow.GetCanvasInfoResponse, error) {
	wf, err := GetWorkflowDomainSVC().GetWorkflowDraft(ctx, mustParseInt64(req.GetWorkflowID()))
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

	canvasData := &workflow.CanvasData{
		Workflow: &workflow.Workflow{
			WorkflowID:               strconv.FormatInt(wf.ID, 10),
			Name:                     wf.Name,
			Desc:                     wf.Desc,
			URL:                      wf.IconURL,
			IconURI:                  wf.IconURI,
			Status:                   devStatus,
			Type:                     wf.ContentType,
			CreateTime:               wf.CreatedAt.UnixMilli(),
			UpdateTime:               wf.UpdatedAt.UnixMilli(),
			Tag:                      wf.Tag,
			TemplateAuthorID:         ternary.IFElse(wf.AuthorID > 0, ptr.Of(strconv.FormatInt(wf.AuthorID, 10)), nil),
			TemplateAuthorName:       nil, // TODO: query the author's information
			TemplateAuthorPictureURL: nil, // TODO: query the author's information
			SpaceID:                  ptr.Of(strconv.FormatInt(wf.SpaceID, 10)),
			InterfaceStr:             nil, // TODO: format input and output into this
			SchemaJSON:               wf.Canvas,
			Creator: &workflow.Creator{ // TODO: query the creator's information
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
			FlowMode:    wf.Mode,
			CheckResult: nil, // TODO: validate the workflow
			ProjectID:   i64PtrToStringPtr(wf.ProjectID),

			PersistenceModel: workflow.PersistenceModel_DB,
		},
		VcsData: &workflow.VCSCanvasData{
			Type: vcsType,
		},
		WorkflowVersion: &wf.LatestVersion, // TODO: now if you have published it, return to the
	}

	return &workflow.GetCanvasInfoResponse{
		Data: canvasData,
	}, nil
}

func (w *WorkflowApplicationService) TestRun(ctx context.Context, req *workflow.WorkFlowTestRunRequest) (*workflow.WorkFlowTestRunResponse, error) {
	wfID := &entity.WorkflowIdentity{
		ID: mustParseInt64(req.GetWorkflowID()),
	}

	exeID, err := GetWorkflowDomainSVC().AsyncExecuteWorkflow(ctx, wfID, req.Input)
	if err != nil {
		return nil, err
	}

	return &workflow.WorkFlowTestRunResponse{
		Data: &workflow.WorkFlowTestRunData{
			WorkflowID: fmt.Sprintf("%d", wfID.ID),
			ExecuteID:  fmt.Sprintf("%d", exeID),
		},
	}, nil
}

func (w *WorkflowApplicationService) GetProcess(ctx context.Context, req *workflow.GetWorkflowProcessRequest) (*workflow.GetWorkflowProcessResponse, error) {
	var wfExeEntity *entity.WorkflowExecution
	if req.SubExecuteID == nil {
		wfExeEntity = &entity.WorkflowExecution{
			ID: mustParseInt64(req.GetExecuteID()),
			WorkflowIdentity: entity.WorkflowIdentity{
				ID: mustParseInt64(req.GetWorkflowID()),
			},
		}
	} else {
		wfExeEntity = &entity.WorkflowExecution{
			ID: mustParseInt64(req.GetSubExecuteID()),
			WorkflowIdentity: entity.WorkflowIdentity{
				ID: mustParseInt64(req.GetWorkflowID()),
			},
			RootExecutionID: mustParseInt64(req.GetExecuteID()),
		}
	}

	wfExeEntity, err := GetWorkflowDomainSVC().GetExecution(ctx, wfExeEntity)
	if err != nil {
		return nil, err
	}

	status := wfExeEntity.Status
	if status == entity.WorkflowInterrupted {
		status = entity.WorkflowRunning
	}

	resp := &workflow.GetWorkflowProcessResponse{
		Data: &workflow.GetWorkFlowProcessData{
			WorkFlowId:       fmt.Sprintf("%d", wfExeEntity.WorkflowIdentity.ID),
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

	if wfExeEntity.ProjectID != nil {
		resp.Data.ProjectId = fmt.Sprintf("%d", *wfExeEntity.ProjectID)
	}

	successNum := 0
	for _, nodeExe := range wfExeEntity.NodeExecutions {
		nr := &workflow.NodeResult{
			NodeId:      nodeExe.NodeID,
			NodeName:    nodeExe.NodeName,
			NodeType:    string(nodeExe.NodeType),
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

		if nodeExe.Index > 0 {
			nr.Index = ptr.Of(int32(nodeExe.Index))
			nr.Items = nodeExe.Items
		}

		if len(nodeExe.IndexedExecutions) > 0 {
			nr.IsBatch = ptr.Of(true)
			m, err := sonic.MarshalString(nodeExe.IndexedExecutions)
			if err != nil {
				return nil, err
			}
			nr.Batch = ptr.Of(m)
		}

		if nr.NodeStatus == workflow.NodeExeStatus_Success {
			successNum++
		}

		resp.Data.NodeResults = append(resp.Data.NodeResults, nr)
	}

	if wfExeEntity.NodeCount > 0 { // TODO: consider batch mode nodes when calculating this rate
		resp.Data.Rate = fmt.Sprintf("%.2f", float64(successNum)/float64(wfExeEntity.NodeCount))
	}

	for _, ie := range wfExeEntity.InterruptEvents {
		resp.Data.NodeEvents = append(resp.Data.NodeEvents, &workflow.NodeEvent{
			ID:        strconv.FormatInt(ie.ID, 10),
			NodeID:    string(ie.NodeKey),
			NodeTitle: ie.NodeTitle,
			NodeIcon:  ie.NodeIcon,
			Data:      ie.InterruptData,
			Type:      ie.EventType,
		})
	}

	return resp, nil
}

func (w *WorkflowApplicationService) ValidateTree(ctx context.Context, req *workflow.ValidateTreeRequest) (*workflow.ValidateTreeResponse, error) {
	canvasSchema := req.GetSchema()
	if len(canvasSchema) == 0 {
		return nil, errors.New("validate tree schema is required")
	}
	response := &workflow.ValidateTreeResponse{}
	wfValidateInfos, err := GetWorkflowDomainSVC().ValidateTree(ctx, mustParseInt64(req.GetWorkflowID()), canvasSchema)
	if err != nil {
		return nil, err
	}
	response.Data = wfValidateInfos

	return response, nil
}

func (w *WorkflowApplicationService) GetWorkflowReferences(ctx context.Context, req *workflow.GetWorkflowReferencesRequest) (*workflow.GetWorkflowReferencesResponse, error) {
	workflows, err := GetWorkflowDomainSVC().GetWorkflowReference(ctx, mustParseInt64(req.GetWorkflowID()))
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkflowReferencesResponse{}
	response.Data = &workflow.WorkflowReferencesData{
		WorkflowList: make([]*workflow.Workflow, 0, len(workflows)),
	}
	for _, wk := range workflows {
		wfw := &workflow.Workflow{
			WorkflowID: strconv.FormatInt(wk.ID, 10),
			Name:       wk.Name,
			Desc:       wk.Desc,
			URL:        wk.IconURL,
			IconURI:    wk.IconURI,

			CreateTime: wk.CreatedAt.UnixMilli(),
			SchemaType: workflow.SchemaType_FDL,

			Tag:              wk.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(wk.AuthorID, 10)),

			SpaceID:            ptr.Of(strconv.FormatInt(wk.SpaceID, 10)),
			Creator:            &workflow.Creator{}, // 创作者信息
			PersistenceModel:   workflow.PersistenceModel_DB,
			FlowMode:           wk.Mode,
			ProductDraftStatus: workflow.ProductDraftStatus_Default,
			CollaboratorMode:   workflow.CollaboratorMode_Close,
		}

		if wk.UpdatedAt != nil {
			wfw.UpdateTime = wk.UpdatedAt.UnixMilli()
		}

		if wk.ProjectID != nil {
			wfw.ProjectID = ptr.Of(strconv.FormatInt(ptr.From(wk.ProjectID), 10))
		}
		response.Data.WorkflowList = append(response.Data.WorkflowList, wfw)
	}

	return response, nil
}

func (w *WorkflowApplicationService) GetReleasedWorkflows(ctx context.Context, req *workflow.GetReleasedWorkflowsRequest) (*workflow.GetReleasedWorkflowsResponse, error) {
	wfEntities := make([]*entity.WorkflowIdentity, 0)
	for _, wf := range req.WorkflowFilterList {
		wfID, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
		if err != nil {
			return nil, err
		}
		wfEntities = append(wfEntities, &entity.WorkflowIdentity{
			ID:      wfID,
			Version: *wf.WorkflowVersion,
		})
	}

	workflowMetas, err := GetWorkflowDomainSVC().GetReleasedWorkflows(ctx, wfEntities)
	if err != nil {
		return nil, err
	}

	releasedWorkflows := make([]*workflow.ReleasedWorkflow, 0, len(workflowMetas))

	for _, wfMeta := range workflowMetas {
		subWk := make([]*workflow.SubWorkflow, 0, len(wfMeta.SubWorkflows))
		for _, w := range wfMeta.SubWorkflows {
			subWk = append(subWk, &workflow.SubWorkflow{
				ID:   strconv.FormatInt(w.ID, 10),
				Name: w.Name,
			})
		}
		releasedWorkflows = append(releasedWorkflows, &workflow.ReleasedWorkflow{
			WorkflowID:            strconv.FormatInt(wfMeta.ID, 10),
			Name:                  wfMeta.Name,
			Icon:                  wfMeta.IconURL,
			Desc:                  wfMeta.Desc,
			Type:                  int32(wfMeta.ContentType),
			FlowVersion:           wfMeta.Version,
			LatestFlowVersionDesc: wfMeta.LatestFlowVersionDesc,
			LatestFlowVersion:     wfMeta.LatestFlowVersion,
			//Inputs:                "", // todo don't set it for the time being, and see how to set this field in the subsequent self-test
			//Outputs:               "",
			SubWorkflowList: subWk,
		})
	}
	response := &workflow.GetReleasedWorkflowsResponse{}
	response.Data = &workflow.ReleasedWorkflowData{
		WorkflowList: releasedWorkflows,
		Total:        int64(len(releasedWorkflows)),
	}

	return response, nil
}

func (w *WorkflowApplicationService) TestResume(ctx context.Context, req *workflow.WorkflowTestResumeRequest) (*workflow.WorkflowTestResumeResponse, error) {
	err := GetWorkflowDomainSVC().ResumeWorkflow(ctx, mustParseInt64(req.GetExecuteID()), mustParseInt64(req.GetEventID()), req.GetData())
	if err != nil {
		return nil, err
	}

	return &workflow.WorkflowTestResumeResponse{}, nil
}

func (w *WorkflowApplicationService) Cancel(ctx context.Context, req *workflow.CancelWorkFlowRequest) (*workflow.CancelWorkFlowResponse, error) {
	err := GetWorkflowDomainSVC().CancelWorkflow(ctx, mustParseInt64(req.GetExecuteID()),
		mustParseInt64(req.GetWorkflowID()), mustParseInt64(req.GetSpaceID()))
	if err != nil {
		return nil, err
	}

	return &workflow.CancelWorkFlowResponse{}, nil
}

func (w *WorkflowApplicationService) QueryWorkflowNodeTypes(ctx context.Context, req *workflow.QueryWorkflowNodeTypeRequest) (*workflow.QueryWorkflowNodeTypeResponse, error) {
	nodeProperties, err := GetWorkflowDomainSVC().QueryWorkflowNodeTypes(ctx, mustParseInt64(req.GetWorkflowID()))
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

func (w *WorkflowApplicationService) PublishWorkflow(ctx context.Context, req *workflow.PublishWorkflowRequest) (*workflow.PublishWorkflowResponse, error) {
	versionInfo := &vo.VersionInfo{}
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid != nil {
		versionInfo.CreatorID = *uid
	}
	versionInfo.Version = req.GetWorkflowVersion()
	versionInfo.VersionDescription = req.GetVersionDescription()

	err := GetWorkflowDomainSVC().PublishWorkflow(ctx, mustParseInt64(req.GetWorkflowID()), req.GetForce(), versionInfo)
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

func (w *WorkflowApplicationService) ListWorkflow(ctx context.Context, req *workflow.GetWorkFlowListRequest) (*workflow.GetWorkFlowListResponse, error) {
	if req.GetSpaceID() == "" {
		return nil, errors.New("space id is required")
	}

	page := &vo.Page{}
	if req.GetPage() > 0 {
		page.Page = req.GetPage()
	}
	if req.GetSize() > 0 {
		page.Size = req.GetSize()
	}
	option := &vo.QueryOption{}
	wfType := req.GetType()
	if wfType == workflow.WorkFlowType_User {
		option.WorkflowType = vo.User
	} else if wfType == workflow.WorkFlowType_GuanFang {
		option.WorkflowType = vo.Official
	}

	virtualPluginID := ""
	status := req.GetStatus()
	if status == workflow.WorkFlowListStatus_UnPublished {
		option.PublishStatus = vo.UnPublished
	} else if status == workflow.WorkFlowListStatus_HadPublished {
		option.PublishStatus = vo.HasPublished
		virtualPluginID = "1"
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

	wfs, err := GetWorkflowDomainSVC().ListWorkflow(ctx, spaceID, page, option)
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
			WorkflowID:       strconv.FormatInt(w.WorkflowIdentity.ID, 10),
			Name:             w.Name,
			Desc:             w.Desc,
			IconURI:          w.IconURI,
			CreateTime:       w.CreatedAt.Unix(),
			Type:             w.ContentType,
			SchemaType:       workflow.SchemaType_FDL,
			Tag:              w.Tag,
			TemplateAuthorID: ptr.Of(strconv.FormatInt(w.AuthorID, 10)),
			SpaceID:          ptr.Of(strconv.FormatInt(w.SpaceID, 10)),
			PluginID:         virtualPluginID,
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
			param, err := convertNamedTypeInfo2WorkflowParameter(in)
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

func (w *WorkflowApplicationService) GetWorkflowDetail(ctx context.Context, req *workflow.GetWorkflowDetailRequest) (*workflow.GetWorkflowDetailResponse, error) {

	entities, err := slices.TransformWithErrorCheck(req.GetWorkflowIds(), func(s string) (*entity.WorkflowIdentity, error) {
		wid, err := strconv.ParseInt(s, 10, 64)
		if err != nil {
			return nil, err
		}
		return &entity.WorkflowIdentity{
			ID: wid,
		}, nil

	})
	if err != nil {
		return nil, err
	}

	wfs, err := GetWorkflowDomainSVC().MGetWorkflows(ctx, entities)
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkflowDetailResponse{
		Data: make([]*workflow.WorkflowDetailData, 0, len(wfs)),
	}
	for _, wf := range wfs {
		wd := &workflow.WorkflowDetailData{
			WorkflowID: strconv.FormatInt(wf.WorkflowIdentity.ID, 10),
			Name:       wf.Name,
			Desc:       wf.Desc,
			SpaceID:    strconv.FormatInt(wf.SpaceID, 10),
			CreateTime: wf.CreatedAt.Unix(),
			IconURI:    wf.IconURI,
			Icon:       wf.IconURL,
			FlowMode:   wf.Mode,
			Version:    wf.Version,
		}
		if wf.UpdatedAt != nil {
			wd.UpdateTime = wf.UpdatedAt.Unix()
		}
		if wf.InputParams != nil {
			wd.Inputs, err = convertNamedTypeInfoListToVariableString(wf.InputParams)
			if err != nil {
				return nil, err
			}
		}

		if wf.OutputParams != nil {
			wd.Outputs, err = convertNamedTypeInfoListToVariableString(wf.OutputParams)
			if err != nil {
				return nil, err
			}
		}

		response.Data = append(response.Data, wd)
	}

	return response, nil
}

func (w *WorkflowApplicationService) GetWorkflowDetailInfo(ctx context.Context, req *workflow.GetWorkflowDetailInfoRequest) (*workflow.GetWorkflowDetailInfoResponse, error) {

	entities, err := slices.TransformWithErrorCheck(req.GetWorkflowFilterList(), func(wf *workflow.WorkflowFilter) (*entity.WorkflowIdentity, error) {
		wid, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
		if err != nil {
			return nil, err
		}
		e := &entity.WorkflowIdentity{
			ID: wid,
		}
		if wf.WorkflowVersion != nil {
			e.Version = *wf.WorkflowVersion
		}
		return e, nil

	})
	if err != nil {
		return nil, err
	}

	wfs, err := GetWorkflowDomainSVC().MGetWorkflowDetailInfo(ctx, entities)
	if err != nil {
		return nil, err
	}

	response := &workflow.GetWorkflowDetailInfoResponse{
		Data: make([]*workflow.WorkflowDetailInfoData, 0, len(wfs)),
	}
	for _, wf := range wfs {
		wd := &workflow.WorkflowDetailInfoData{
			WorkflowID: strconv.FormatInt(wf.WorkflowIdentity.ID, 10),
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

			FlowVersion:           wf.Version,
			FlowVersionDesc:       wf.VersionDesc,
			LatestFlowVersion:     wf.LatestFlowVersion,
			LatestFlowVersionDesc: wf.LatestFlowVersionDesc,
		}
		if wf.UpdatedAt != nil {
			wd.UpdateTime = wf.UpdatedAt.Unix()
		}
		if wf.InputParams != nil {
			wd.Inputs, err = convertNamedTypeInfoListToVariableString(wf.InputParams)
			if err != nil {
				return nil, err
			}
		}

		if wf.OutputParams != nil {
			wd.Outputs, err = convertNamedTypeInfoListToVariableString(wf.OutputParams)
			if err != nil {
				return nil, err
			}
		}

		response.Data = append(response.Data, wd)
	}

	return response, nil
}

func (w *WorkflowApplicationService) GetWorkflowUploadAuthToken(ctx context.Context, req *workflow.GetUploadAuthTokenRequest) (*workflow.GetUploadAuthTokenResponse, error) {

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

func (w *WorkflowApplicationService) SignImageURL(ctx context.Context, req *workflow.SignImageURLRequest) (*workflow.SignImageURLResponse, error) {
	url, err := w.ImageX.GetResourceURL(ctx, req.GetURI())
	if err != nil {
		return nil, err
	}

	return &workflow.SignImageURLResponse{
		URL: url.URL,
	}, nil

}

func (w *WorkflowApplicationService) GetApiDetail(ctx context.Context, req *workflow.GetApiDetailRequest) (*vo.ToolDetailInfo, error) {

	toolID, err := strconv.ParseInt(req.GetAPIID(), 10, 64)
	if err != nil {
		return nil, err
	}
	pluginID, err := strconv.ParseInt(req.GetPluginID(), 10, 64)
	if err != nil {
		return nil, err
	}

	toolInfoResponse, err := plugin.GetToolService().GetPluginToolsInfo(ctx, &plugin.PluginToolsInfoRequest{
		PluginEntity: plugin.PluginEntity{
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

	resp := &vo.ToolDetailInfo{
		Data: &workflow.ApiDetailData{
			PluginID:   req.GetPluginID(),
			SpaceID:    req.GetSpaceID(),
			Icon:       toolInfoResponse.IconURI,
			Name:       toolInfoResponse.PluginName,
			Desc:       toolInfoResponse.Description,
			ApiName:    toolInfo.ToolName,
			PluginType: workflow.PluginType(toolInfoResponse.PluginType),
		},
		ToolInputs:  toolInfo.Inputs,
		ToolOutputs: toolInfo.Outputs,
	}

	return resp, nil

}

func convertNamedTypeInfo2WorkflowParameter(nType *vo.NamedTypeInfo) (*workflow.Parameter, error) {
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
		// Maps to AssignVariable (ID 40) in the API model.
		// API also has LoopSetVariable (ID 20).
		// TODO: needs to split 20 and 40 to two types in workflow entity defines.
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
	default:
		// Handle entity types that don't have a corresponding NodeTemplateType
		return workflow.NodeTemplateType(0), fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType)
	}
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

func i64PtrToStringPtr(i *int64) *string {
	if i == nil {
		return nil
	}

	s := strconv.FormatInt(*i, 10)
	return &s
}

func convertNamedTypeInfoListToVariableString(namedTypeInfoList []*vo.NamedTypeInfo) (string, error) {
	var outputAnyList = make([]any, 0, len(namedTypeInfoList))
	for _, in := range namedTypeInfoList {
		v, err := in.ToVariable()
		if err != nil {
			return "", err
		}
		outputAnyList = append(outputAnyList, v)
	}

	s, err := sonic.MarshalString(outputAnyList)
	if err != nil {
		return "", err
	}
	return s, nil

}
