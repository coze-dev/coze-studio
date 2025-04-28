package application

import (
	"context"
	"fmt"
	"strconv"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	workflow2 "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
)

type WorkflowApplicationService struct{}

var WorkflowSVC = &WorkflowApplicationService{}

func GetWorkflowDomainSVC() workflow2.Service {
	return workflowDomainSVC
}

func (w *WorkflowApplicationService) GetNodeTemplateList(ctx context.Context, req *workflow.NodeTemplateListRequest) (*workflow.NodeTemplateListResponse, error) {
	toQueryTypes := make(map[entity.NodeType]bool)
	for _, t := range req.NodeTypes {
		entityType, err := nodeType2EntityNodeType(t)
		if err != nil {
			return nil, err
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

	// TODO: handle the plugin lists

	for category, nodeCategory := range categoryMap {
		resp.Data.CateList = append(resp.Data.CateList, &workflow.NodeCategory{
			Name:         category,
			NodeTypeList: nodeCategory.NodeTypeList,
		})
	}

	return resp, nil
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
		return workflow.NodeTemplateType_DatabaseInsert, nil
	default:
		// Handle entity types that don't have a corresponding NodeTemplateType
		return workflow.NodeTemplateType(0), fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType)
	}
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

	uid := getUIDFromCtx(ctx)
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

func (w *WorkflowApplicationService) DeleteWorkflow(ctx context.Context, req *workflow.DeleteWorkflowRequest) (*workflow.DeleteWorkflowResponse, error) {
	err := service.GetWorkflowService().DeleteWorkflow(ctx, mustParseInt64(req.GetWorkflowID()))
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
	wf, err := GetWorkflowDomainSVC().GetWorkflow(ctx, &entity.WorkflowIdentity{
		ID: mustParseInt64(req.GetWorkflowID()),
	})
	if err != nil {
		return nil, err
	}

	canvasData := &workflow.CanvasData{
		Workflow: &workflow.Workflow{
			WorkflowID:               strconv.FormatInt(wf.ID, 10),
			Name:                     wf.Name,
			Desc:                     wf.Desc,
			URL:                      wf.IconURL,
			IconURI:                  wf.IconURI,
			Status:                   wf.DevStatus,
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
				ID: strconv.FormatInt(wf.CreatorID, 10),
			},
			FlowMode:    wf.Mode,
			CheckResult: nil, // TODO: validate the workflow
			ProjectID:   i64PtrToStringPtr(wf.ProjectID),
		},
		WorkflowVersion: nil, // TODO: we are querying the draft here, do we need to return a version?
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

	resp := &workflow.GetWorkflowProcessResponse{
		Data: &workflow.GetWorkFlowProcessData{
			WorkFlowId:       fmt.Sprintf("%d", wfExeEntity.WorkflowIdentity.ID),
			ExecuteId:        fmt.Sprintf("%d", wfExeEntity.ID),
			ExecuteStatus:    workflow.WorkflowExeStatus(wfExeEntity.Status),
			ExeHistoryStatus: workflow.WorkflowExeHistoryStatus_HasHistory,
			WorkflowExeCost:  fmt.Sprintf("%.3fs", wfExeEntity.Duration.Seconds()),
			Reason:           wfExeEntity.FailReason,
			NodeEvents:       nil, // TODO
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
			NodeId:      fmt.Sprintf("%d", nodeExe.ID),
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

	if wfExeEntity.NodeCount > 0 {
		resp.Data.Rate = fmt.Sprintf("%.2f", float64(successNum)/float64(wfExeEntity.NodeCount))
	}

	return resp, nil
}
