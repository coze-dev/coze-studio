package workflow

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/schema"

	pluginAPI "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/plugin_develop"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
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

func (w *ApplicationService) CreateWorkflow(ctx context.Context, req *workflow.CreateWorkflowRequest) (*workflow.CreateWorkflowResponse, error) {

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

func (w *ApplicationService) SaveWorkflow(ctx context.Context, req *workflow.SaveWorkflowRequest) (*workflow.SaveWorkflowResponse, error) {
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

func (w *ApplicationService) UpdateWorkflowMeta(ctx context.Context, req *workflow.UpdateWorkflowMetaRequest) (*workflow.UpdateWorkflowMetaResponse, error) {
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

func (w *ApplicationService) DeleteWorkflow(ctx context.Context, req *workflow.DeleteWorkflowRequest) (*workflow.DeleteWorkflowResponse, error) {
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

func (w *ApplicationService) GetWorkflow(ctx context.Context, req *workflow.GetCanvasInfoRequest) (*workflow.GetCanvasInfoResponse, error) {
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
			WorkflowID:       strconv.FormatInt(wf.ID, 10),
			Name:             wf.Name,
			Desc:             wf.Desc,
			URL:              wf.IconURL,
			IconURI:          wf.IconURI,
			Status:           devStatus,
			Type:             wf.ContentType,
			CreateTime:       wf.CreatedAt.UnixMilli(),
			UpdateTime:       wf.UpdatedAt.UnixMilli(),
			Tag:              wf.Tag,
			TemplateAuthorID: ternary.IFElse(wf.AuthorID > 0, ptr.Of(strconv.FormatInt(wf.AuthorID, 10)), nil),
			SpaceID:          ptr.Of(strconv.FormatInt(wf.SpaceID, 10)),
			SchemaJSON:       wf.Canvas,
			Creator: &workflow.Creator{
				ID:   strconv.FormatInt(wf.CreatorID, 10),
				Self: ternary.IFElse[bool](wf.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
			FlowMode:  wf.Mode,
			ProjectID: i64PtrToStringPtr(wf.ProjectID),

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

func (w *ApplicationService) TestRun(ctx context.Context, req *workflow.WorkFlowTestRunRequest) (*workflow.WorkFlowTestRunResponse, error) {
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

func (w *ApplicationService) GetProcess(ctx context.Context, req *workflow.GetWorkflowProcessRequest) (*workflow.GetWorkflowProcessResponse, error) {
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

	if wfExeEntity.NodeCount > 0 {
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

type StreamRunEventType string

const (
	DoneEvent      StreamRunEventType = "done"
	MessageEvent   StreamRunEventType = "message"
	ErrEvent       StreamRunEventType = "error"
	InterruptEvent StreamRunEventType = "interrupt"
)

var debugURLTpl = "https://www.coze.cn/work_flow?execute_id=%d&space_id=%d&workflow_id=%d&execute_mode=2"

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
			switch msg.StateMessage.Status {
			case entity.WorkflowSuccess:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:       strconv.Itoa(messageID),
					Event:    string(DoneEvent),
					DebugUrl: ptr.Of(fmt.Sprintf(debugURLTpl, executeID, spaceID, workflowID)),
				}, nil
			case entity.WorkflowFailed, entity.WorkflowCancel:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:           strconv.Itoa(messageID),
					Event:        string(ErrEvent),
					DebugUrl:     ptr.Of(fmt.Sprintf(debugURLTpl, executeID, spaceID, workflowID)),
					ErrorCode:    ptr.Of(int64(msg.StateMessage.LastError.Code)),
					ErrorMessage: ptr.Of(msg.StateMessage.LastError.Msg),
				}, nil
			case entity.WorkflowInterrupted:
				return &workflow.OpenAPIStreamRunFlowResponse{
					ID:       strconv.Itoa(messageID),
					Event:    string(InterruptEvent),
					DebugUrl: ptr.Of(fmt.Sprintf(debugURLTpl, executeID, spaceID, workflowID)),
					InterruptData: &workflow.Interrupt{
						EventID: fmt.Sprintf("%d/%d", executeID, msg.InterruptEvent.ID),
						Type:    workflow.InterruptType(msg.InterruptEvent.EventType),
						InData:  msg.InterruptEvent.InterruptData,
					},
				}, nil
			case entity.WorkflowRunning:
				executeID = msg.ExecuteID
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

func (w *ApplicationService) StreamRun(ctx context.Context, req *workflow.OpenAPIRunFlowRequest) (
	*schema.StreamReader[*workflow.OpenAPIStreamRunFlowResponse], error) {
	parameters := make(map[string]any)
	if req.Parameters != nil {
		err := sonic.UnmarshalString(*req.Parameters, &parameters)
		if err != nil {
			return nil, err
		}
	}

	wfIdentity := &entity.WorkflowIdentity{
		ID: mustParseInt64(req.GetWorkflowID()),
	}

	if req.Version != nil {
		wfIdentity.Version = *req.Version
	}

	sr, err := GetWorkflowDomainSVC().StreamExecuteWorkflow(ctx, wfIdentity, parameters)
	if err != nil {
		return nil, err
	}

	convert := convertStreamRunEvent(wfIdentity.ID)

	return schema.StreamReaderWithConvert(sr, convert), nil
}

func (w *ApplicationService) StreamResume(ctx context.Context, req *workflow.OpenAPIStreamResumeFlowRequest) (
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

	sr, err := GetWorkflowDomainSVC().StreamResumeWorkflow(ctx, resumeReq)
	if err != nil {
		return nil, err
	}

	convert := convertStreamRunEvent(workflowID)

	return schema.StreamReaderWithConvert(sr, convert), nil
}

func (w *ApplicationService) ValidateTree(ctx context.Context, req *workflow.ValidateTreeRequest) (*workflow.ValidateTreeResponse, error) {
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

func (w *ApplicationService) GetWorkflowReferences(ctx context.Context, req *workflow.GetWorkflowReferencesRequest) (*workflow.GetWorkflowReferencesResponse, error) {
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

// GetReleasedWorkflows TODO currently, the online version of this API is no longer used, and you need to confirm with the front-end
func (w *ApplicationService) GetReleasedWorkflows(ctx context.Context, req *workflow.GetReleasedWorkflowsRequest) (*vo.ReleasedWorkflowData, error) {
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
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wfMeta := range workflowMetas {
		wfIDStr := strconv.FormatInt(wfMeta.ID, 10)
		subWk := make([]*workflow.SubWorkflow, 0, len(wfMeta.SubWorkflows))
		for _, w := range wfMeta.SubWorkflows {
			subWk = append(subWk, &workflow.SubWorkflow{
				ID:   strconv.FormatInt(w.ID, 10),
				Name: w.Name,
			})
		}
		releaseWorkflow := &workflow.ReleasedWorkflow{
			WorkflowID:            wfIDStr,
			Name:                  wfMeta.Name,
			Icon:                  wfMeta.IconURL,
			Desc:                  wfMeta.Desc,
			Type:                  int32(wfMeta.ContentType),
			FlowVersion:           wfMeta.Version,
			LatestFlowVersionDesc: wfMeta.LatestFlowVersionDesc,
			LatestFlowVersion:     wfMeta.LatestFlowVersion,
			SubWorkflowList:       subWk,
		}
		inputs[wfIDStr], err = toVariables(wfMeta.InputParams)
		if err != nil {
			return nil, err
		}
		outputs[wfIDStr], err = toVariables(wfMeta.OutputParams)
		if err != nil {
			return nil, err
		}
		releasedWorkflows = append(releasedWorkflows, releaseWorkflow)

	}
	response := &vo.ReleasedWorkflowData{
		WorkflowList: releasedWorkflows,
		Inputs:       inputs,
		Outputs:      outputs,
	}

	return response, nil
}

func (w *ApplicationService) TestResume(ctx context.Context, req *workflow.WorkflowTestResumeRequest) (*workflow.WorkflowTestResumeResponse, error) {
	resumeReq := &entity.ResumeRequest{
		ExecuteID:  mustParseInt64(req.GetExecuteID()),
		EventID:    mustParseInt64(req.GetEventID()),
		ResumeData: req.GetData(),
	}
	err := GetWorkflowDomainSVC().AsyncResumeWorkflow(ctx, resumeReq)
	if err != nil {
		return nil, err
	}

	return &workflow.WorkflowTestResumeResponse{}, nil
}

func (w *ApplicationService) Cancel(ctx context.Context, req *workflow.CancelWorkFlowRequest) (*workflow.CancelWorkFlowResponse, error) {
	err := GetWorkflowDomainSVC().CancelWorkflow(ctx, mustParseInt64(req.GetExecuteID()),
		mustParseInt64(req.GetWorkflowID()), mustParseInt64(req.GetSpaceID()))
	if err != nil {
		return nil, err
	}

	return &workflow.CancelWorkFlowResponse{}, nil
}

func (w *ApplicationService) QueryWorkflowNodeTypes(ctx context.Context, req *workflow.QueryWorkflowNodeTypeRequest) (*workflow.QueryWorkflowNodeTypeResponse, error) {
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

func (w *ApplicationService) PublishWorkflow(ctx context.Context, req *workflow.PublishWorkflowRequest) (*workflow.PublishWorkflowResponse, error) {
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

func (w *ApplicationService) ListWorkflow(ctx context.Context, req *workflow.GetWorkFlowListRequest) (*workflow.GetWorkFlowListResponse, error) {
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

	status := req.GetStatus()
	if status == workflow.WorkFlowListStatus_UnPublished {
		option.PublishStatus = vo.UnPublished
	} else if status == workflow.WorkFlowListStatus_HadPublished {
		option.PublishStatus = vo.HasPublished
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
			PluginID: func() string {
				if status == workflow.WorkFlowListStatus_UnPublished {
					return ""
				}
				return strconv.FormatInt(w.WorkflowIdentity.ID, 10)
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

	workflowDetailDataList := &vo.WorkflowDetailDataList{
		List: make([]*workflow.WorkflowDetailData, 0, len(wfs)),
	}
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wf := range wfs {
		wfIDStr := strconv.FormatInt(wf.WorkflowIdentity.ID, 10)
		wd := &workflow.WorkflowDetailData{
			WorkflowID: wfIDStr,
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

	workflowDetailInfoDataList := &vo.WorkflowDetailInfoDataList{
		List: make([]*workflow.WorkflowDetailInfoData, 0, len(wfs)),
	}
	inputs := make(map[string]any)
	outputs := make(map[string]any)
	for _, wf := range wfs {
		wfIDStr := strconv.FormatInt(wf.WorkflowIdentity.ID, 10)
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

			FlowVersion:           wf.Version,
			FlowVersionDesc:       wf.VersionDesc,
			LatestFlowVersion:     wf.LatestFlowVersion,
			LatestFlowVersionDesc: wf.LatestFlowVersionDesc,
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
			PluginID:   req.GetPluginID(),
			SpaceID:    req.GetSpaceID(),
			Icon:       toolInfoResponse.IconURL,
			Name:       toolInfoResponse.PluginName,
			Desc:       toolInfoResponse.Description,
			ApiName:    toolInfo.ToolName,
			PluginType: workflow.PluginType(toolInfoResponse.PluginType),
		},
		ToolInputs:  inputVars,
		ToolOutputs: outputVars,
	}

	return toolDetailInfo, nil

}

func (w *ApplicationService) GetLLMNodeFCSettingDetail(ctx context.Context, req *workflow.GetLLMNodeFCSettingDetailRequest) (*workflow.GetLLMNodeFCSettingDetailResponse, error) {
	var (
		toolSvc             = plugin.GetToolService()
		pluginToolsInfoReqs = make(map[int64]*plugin.PluginToolsInfoRequest)
		pluginDetailMap     = make(map[string]*workflow.PluginDetail)
		toolsDetailInfo     = make(map[string]*workflow.APIDetail)
		workflowDetailMap   = make(map[string]*workflow.WorkflowDetail)
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
				pluginToolsInfoReqs[pluginID] = &plugin.PluginToolsInfoRequest{
					PluginEntity: plugin.PluginEntity{
						PluginID: pluginID,
					},
					ToolIDs: []int64{toolID},
				}
			}

		}
		for _, r := range pluginToolsInfoReqs {
			resp, err := toolSvc.GetPluginToolsInfo(ctx, r)
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

					//LatestVersionName: "",  // TODO plugin use version or version ts
					//LatestVersionTs: "",
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
		entities, err := slices.TransformWithErrorCheck(req.GetWorkflowList(), func(w *workflow.WorkflowFCItem) (*entity.WorkflowIdentity, error) {
			wid, err := strconv.ParseInt(w.GetWorkflowID(), 10, 64)
			if err != nil {
				return nil, err
			}

			if w.IsDraft {
				return &entity.WorkflowIdentity{
					ID: wid,
				}, nil
			}
			return &entity.WorkflowIdentity{
				ID:      wid,
				Version: w.GetWorkflowVersion(),
			}, nil

		})
		if err != nil {
			return nil, err
		}
		wfs, err := GetWorkflowDomainSVC().MGetWorkflowDetailInfo(ctx, entities)
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
				LatestVersionName: wf.LatestVersion,
				APIDetail: &workflow.APIDetail{
					ID:         wfIDStr,
					PluginID:   wfIDStr,
					Name:       wf.Name,
					Parameters: workflowParameters,
				},
			}
		}

	}

	response := &workflow.GetLLMNodeFCSettingDetailResponse{
		PluginDetailMap:    pluginDetailMap,
		PluginAPIDetailMap: toolsDetailInfo,
		WorkflowDetailMap:  workflowDetailMap,
	}

	return response, nil
}

func (w *ApplicationService) GetLLMNodeFCSettingsMerged(ctx context.Context, req *workflow.GetLLMNodeFCSettingsMergedRequest) (*workflow.GetLLMNodeFCSettingsMergedResponse, error) {

	var fcPluginSetting *workflow.FCPluginSetting
	if req.GetPluginFcSetting() != nil {
		var (
			toolSvc         = plugin.GetToolService()
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

		pluginReq := &plugin.PluginToolsInfoRequest{
			PluginEntity: plugin.PluginEntity{
				PluginID: pluginID,
			},
			ToolIDs: []int64{toolID},
			IsDraft: isDraft,
		}

		pInfo, err := toolSvc.GetPluginToolsInfo(ctx, pluginReq)
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
	if req.GetWorkflowFcSetting() != nil {
		var (
			workflowFcSetting = req.GetWorkflowFcSetting()
		)
		wid, err := strconv.ParseInt(workflowFcSetting.GetWorkflowID(), 10, 64)
		if err != nil {
			return nil, err
		}
		var e *entity.WorkflowIdentity
		if workflowFcSetting.GetIsDraft() {
			e = &entity.WorkflowIdentity{
				ID: wid,
			}
		} else {
			e = &entity.WorkflowIdentity{
				ID:      wid,
				Version: workflowFcSetting.GetWorkflowVersion(),
			}
		}

		wfs, err := GetWorkflowDomainSVC().MGetWorkflowDetailInfo(ctx, []*entity.WorkflowIdentity{e})
		if err != nil {
			return nil, err
		}

		var wf *entity.Workflow
		for _, f := range wfs {
			if f.ID == wid {
				wf = f
			}
		}

		if wf == nil {
			return nil, fmt.Errorf("workflow not found, workflow id=%v", wid)
		}

		latestRequestParams, err := slices.TransformWithErrorCheck(wf.InputParams, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}

		latestResponseParams, err := slices.TransformWithErrorCheck(wf.OutputParams, toWorkflowAPIParameter)
		if err != nil {
			return nil, err
		}

		mergeWorkflowAPIParameters(latestRequestParams, workflowFcSetting.GetRequestParams())

		mergeWorkflowAPIParameters(latestResponseParams, workflowFcSetting.GetResponseParams())

		fCWorkflowSetting = &workflow.FCWorkflowSetting{
			WorkflowID:     strconv.FormatInt(wid, 10),
			PluginID:       strconv.FormatInt(wid, 10),
			IsDraft:        workflowFcSetting.GetIsDraft(),
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

func (w *ApplicationService) GetPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (resp *pluginAPI.GetPlaygroundPluginListResponse, err error) {

	var (
		toolsInfo []*vo.WorkFlowAsToolInfo
	)
	if len(req.GetPluginIds()) > 0 {
		toolIDs, err := slices.TransformWithErrorCheck(req.GetPluginIds(), func(a string) (int64, error) {
			return strconv.ParseInt(a, 10, 64)
		})
		if err != nil {
			return nil, err
		}
		toolsInfo, err = GetWorkflowDomainSVC().ListWorkflowAsToolData(ctx, req.GetSpaceID(), &vo.QueryToolInfoOption{
			IDs: toolIDs,
		})

	} else if req.GetPage() > 0 && req.GetSize() > 0 {
		toolsInfo, err = GetWorkflowDomainSVC().ListWorkflowAsToolData(ctx, req.GetSpaceID(), &vo.QueryToolInfoOption{
			Page: &vo.Page{
				Page: req.GetPage(),
				Size: req.GetSize(),
			},
		})
	}

	if err != nil {
		return nil, err
	}

	pluginInfoList := make([]*common.PluginInfoForPlayground, 0)
	for _, toolInfo := range toolsInfo {
		pInfo := &common.PluginInfoForPlayground{
			ID:           strconv.FormatInt(toolInfo.ID, 10),
			Name:         toolInfo.Name,
			PluginIcon:   toolInfo.IconURL,
			DescForHuman: toolInfo.Desc,
			Creator: &common.Creator{
				Self: ternary.IFElse[bool](toolInfo.CreatorID == ptr.From(ctxutil.GetUIDFromCtx(ctx)), true, false),
			},
			PluginType:  common.PluginType_WORKFLOW,
			VersionName: toolInfo.VersionName,
			CreateTime:  strconv.FormatInt(toolInfo.CreatedAt, 10),
		}
		if toolInfo.UpdatedAt != nil {
			pInfo.UpdateTime = strconv.FormatInt(*toolInfo.UpdatedAt, 10)
		}

		var pluginApi = &common.PluginApi{
			APIID:    strconv.FormatInt(toolInfo.ID, 10),
			Name:     toolInfo.Name,
			Desc:     toolInfo.Desc,
			PluginID: strconv.FormatInt(toolInfo.ID, 10),
		}
		pluginApi.Parameters, err = slices.TransformWithErrorCheck(toolInfo.InputParams, toPluginParameter)

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
	case workflow.ParameterType_Array:
		v.Type = vo.VariableTypeList
		av := &vo.Variable{
			Type: vo.VariableTypeString,
		}
		switch *p.SubType {
		case workflow.ParameterType_String:
			av.Type = vo.VariableTypeString
		case workflow.ParameterType_Integer:
			av.Type = vo.VariableTypeInteger
		case workflow.ParameterType_Number:
			av.Type = vo.VariableTypeFloat
		case workflow.ParameterType_Array:
			av.Type = vo.VariableTypeList
		case workflow.ParameterType_Object:
			av.Type = vo.VariableTypeObject
		}
		v.Schema = av
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
