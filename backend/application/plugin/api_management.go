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

package plugin

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"

	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert/api"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *PluginApplicationService) GetPluginAPIs(ctx context.Context, req *pluginAPI.GetPluginAPIsRequest) (resp *pluginAPI.GetPluginAPIsResponse, err error) {
	pl, err := p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateGetPluginAPIsRequest failed")
	}

	var (
		draftTools []*entity.ToolInfo
		total      int64
	)
	if len(req.APIIds) > 0 {
		toolIDs := make([]int64, 0, len(req.APIIds))
		for _, id := range req.APIIds {
			toolID, pErr := strconv.ParseInt(id, 10, 64)
			if pErr != nil {
				return nil, fmt.Errorf("invalid tool id '%s'", id)
			}
			toolIDs = append(toolIDs, toolID)
		}

		draftTools, err = p.toolRepo.MGetDraftTools(ctx, toolIDs)
		if err != nil {
			return nil, errorx.Wrapf(err, "MGetDraftTools failed, toolIDs=%v", toolIDs)
		}

		total = int64(len(draftTools))

	} else {
		pageInfo := dto.PageInfo{
			Page:       int(req.Page),
			Size:       int(req.Size),
			SortBy:     ptr.Of(dto.SortByCreatedAt),
			OrderByACS: ptr.Of(false),
		}
		draftTools, total, err = p.toolRepo.ListPluginDraftTools(ctx, req.PluginID, pageInfo)
		if err != nil {
			return nil, errorx.Wrapf(err, "ListPluginDraftTools failed, pluginID=%d", req.PluginID)
		}
	}

	if len(draftTools) == 0 {
		return &pluginAPI.GetPluginAPIsResponse{
			APIInfo: make([]*common.PluginAPIInfo, 0),
			Total:   0,
		}, nil
	}

	draftToolIDs := slices.Transform(draftTools, func(tl *entity.ToolInfo) int64 {
		return tl.ID
	})
	onlineStatus, err := p.getToolOnlineStatus(ctx, draftToolIDs)
	if err != nil {
		return nil, err
	}

	apis := make([]*common.PluginAPIInfo, 0, len(draftTools))
	for _, tool := range draftTools {
		method, ok := convert.ToThriftAPIMethod(tool.GetMethod())
		if !ok {
			return nil, fmt.Errorf("invalid method '%s'", tool.GetMethod())
		}
		reqParams, err := tool.ToReqAPIParameter()
		if err != nil {
			return nil, err
		}
		respParams, err := tool.ToRespAPIParameter()
		if err != nil {
			return nil, err
		}

		var apiExtend *common.APIExtend
		if tmp, ok := tool.Operation.Extensions[consts.APISchemaExtendAuthMode].(string); ok {
			if mode, ok := convert.ToThriftAPIAuthMode(consts.ToolAuthMode(tmp)); ok {
				apiExtend = &common.APIExtend{
					AuthMode: mode,
				}
			}
		}

		api := &common.PluginAPIInfo{
			APIID:       strconv.FormatInt(tool.ID, 10),
			CreateTime:  strconv.FormatInt(tool.CreatedAt/1000, 10),
			DebugStatus: tool.GetDebugStatus(),
			Desc:        tool.GetDesc(),
			Disabled: func() bool {
				return tool.IsDeactivated()
			}(),
			Method:         method,
			Name:           tool.GetName(),
			OnlineStatus:   onlineStatus[tool.ID],
			Path:           tool.GetSubURL(),
			PluginID:       strconv.FormatInt(tool.PluginID, 10),
			RequestParams:  reqParams,
			ResponseParams: respParams,
			StatisticData:  common.NewPluginStatisticData(),
			APIExtend:      apiExtend,
		}
		example := pl.GetToolExample(ctx, tool.GetName())
		if example != nil {
			api.DebugExample = &common.DebugExample{
				ReqExample:  example.RequestExample,
				RespExample: example.ResponseExample,
			}
			api.DebugExampleStatus = common.DebugExampleStatus_Enable
		}

		apis = append(apis, api)
	}

	resp = &pluginAPI.GetPluginAPIsResponse{
		APIInfo: apis,
		Total:   int32(total),
	}

	return resp, nil
}

func (p *PluginApplicationService) CreateAPI(ctx context.Context, req *pluginAPI.CreateAPIRequest) (resp *pluginAPI.CreateAPIResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateCreateAPIRequest failed")
	}

	defaultSubURL := gonanoid.MustID(6)

	tool := &entity.ToolInfo{
		PluginID:        req.PluginID,
		ActivatedStatus: ptr.Of(consts.ActivateTool),
		DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
		SubURL:          ptr.Of("/" + defaultSubURL),
		Method:          ptr.Of(http.MethodGet),
		Operation: model.NewOpenapi3Operation(&openapi3.Operation{
			Summary:     req.Desc,
			OperationID: req.Name,
			Parameters:  []*openapi3.ParameterRef{},
			RequestBody: model.DefaultOpenapi3RequestBody(),
			Responses:   model.DefaultOpenapi3Responses(),
			Extensions:  map[string]any{},
		}),
	}

	toolID, err := p.toolRepo.CreateDraftTool(ctx, tool)
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftTool failed, pluginID=%d", req.PluginID)
	}

	resp = &pluginAPI.CreateAPIResponse{
		APIID: strconv.FormatInt(toolID, 10),
	}

	return resp, nil
}

func (p *PluginApplicationService) UpdateAPI(ctx context.Context, req *pluginAPI.UpdateAPIRequest) (resp *pluginAPI.UpdateAPIResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateUpdateAPIRequest failed")
	}

	op, err := api.APIParamsToOpenapiOperation(req.RequestParams, req.ResponseParams)
	if err != nil {
		return nil, err
	}

	var method *string
	if m, ok := convert.ToHTTPMethod(req.GetMethod()); ok {
		method = &m
	}

	updateReq := &dto.UpdateDraftToolRequest{
		PluginID:     req.PluginID,
		ToolID:       req.APIID,
		Name:         req.Name,
		Desc:         req.Desc,
		SubURL:       req.Path,
		Method:       method,
		Parameters:   op.Parameters,
		RequestBody:  op.RequestBody,
		Responses:    op.Responses,
		Disabled:     req.Disabled,
		SaveExample:  req.SaveExample,
		DebugExample: req.DebugExample,
		APIExtend:    req.APIExtend,
	}
	err = p.DomainSVC.UpdateDraftTool(ctx, updateReq)
	if err != nil {
		return nil, errorx.Wrapf(err, "UpdateDraftTool failed, pluginID=%d, toolID=%d", updateReq.PluginID, updateReq.ToolID)
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:      resCommon.ResType_Plugin,
			ResID:        req.PluginID,
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource '%d' failed, err=%v", req.PluginID, err)
	}

	resp = &pluginAPI.UpdateAPIResponse{}

	return resp, nil
}

func (p *PluginApplicationService) DeleteAPI(ctx context.Context, req *pluginAPI.DeleteAPIRequest) (resp *pluginAPI.DeleteAPIResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateDeleteAPIRequest failed")
	}

	err = p.toolRepo.DeleteDraftTool(ctx, req.APIID)
	if err != nil {
		return nil, errorx.Wrapf(err, "DeleteDraftTool failed, toolID=%d", req.APIID)
	}

	resp = &pluginAPI.DeleteAPIResponse{}

	return resp, nil
}

func (p *PluginApplicationService) BatchCreateAPI(ctx context.Context, req *pluginAPI.BatchCreateAPIRequest) (resp *pluginAPI.BatchCreateAPIResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateBatchCreateAPIRequest failed")
	}

	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	res, err := p.DomainSVC.CreateDraftToolsWithCode(ctx, &dto.CreateDraftToolsWithCodeRequest{
		PluginID:          req.PluginID,
		OpenapiDoc:        ptr.Of(model.Openapi3T(*doc)),
		ConflictAndUpdate: req.ReplaceSamePaths,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftToolsWithCode failed, pluginID=%d", req.PluginID)
	}

	duplicated := slices.Transform(res.DuplicatedTools, func(e dto.UniqueToolAPI) *common.PluginAPIInfo {
		method, _ := convert.ToThriftAPIMethod(e.Method)
		return &common.PluginAPIInfo{
			Path:   e.SubURL,
			Method: method,
		}
	})

	resp = &pluginAPI.BatchCreateAPIResponse{
		PathsDuplicated: duplicated,
	}

	if len(duplicated) > 0 {
		resp.Code = errno.ErrPluginDuplicatedTool
	}

	return resp, nil
}

func (p *PluginApplicationService) GetUpdatedAPIs(ctx context.Context, req *pluginAPI.GetUpdatedAPIsRequest) (resp *pluginAPI.GetUpdatedAPIsResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateGetUpdatedAPIsRequest failed")
	}

	draftTools, err := p.toolRepo.GetPluginAllDraftTools(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", req.PluginID)
	}
	onlineTools, err := p.toolRepo.GetPluginAllOnlineTools(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginAllOnlineTools failed, pluginID=%d", req.PluginID)
	}

	var updatedToolName, createdToolName, delToolName []string

	draftMap := slices.ToMap(draftTools, func(e *entity.ToolInfo) (string, *entity.ToolInfo) {
		return e.GetName(), e
	})
	onlineMap := slices.ToMap(onlineTools, func(e *entity.ToolInfo) (string, *entity.ToolInfo) {
		return e.GetName(), e
	})

	for name := range draftMap {
		if _, ok := onlineMap[name]; !ok {
			createdToolName = append(createdToolName, name)
		}
	}

	for name, ot := range onlineMap {
		dt, ok := draftMap[name]
		if !ok {
			delToolName = append(delToolName, name)
			continue
		}

		if ot.GetMethod() != dt.GetMethod() ||
			ot.GetSubURL() != dt.GetSubURL() ||
			ot.GetDesc() != dt.GetDesc() {
			updatedToolName = append(updatedToolName, name)
			continue
		}

		os, err := sonic.MarshalString(ot.Operation)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal online tool operation failed, toolID=%d, err=%v", ot.ID, err)

			updatedToolName = append(updatedToolName, name)
			continue
		}
		ds, err := sonic.MarshalString(dt.Operation)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal draft tool operation failed, toolID=%d, err=%v", ot.ID, err)

			updatedToolName = append(updatedToolName, name)
			continue
		}

		if os != ds {
			updatedToolName = append(updatedToolName, name)
		}
	}

	resp = &pluginAPI.GetUpdatedAPIsResponse{
		UpdatedAPINames: updatedToolName,
		CreatedAPINames: createdToolName,
		DeletedAPINames: delToolName,
	}

	return resp, nil
}

func (p *PluginApplicationService) DebugAPI(ctx context.Context, req *pluginAPI.DebugAPIRequest) (resp *pluginAPI.DebugAPIResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateDebugAPIRequest failed")
	}

	const defaultErrReason = "internal server error"

	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	resp = &pluginAPI.DebugAPIResponse{
		Success: false,
		RawReq:  "{}",
		RawResp: "{}",
		Resp:    "{}",
	}

	opts := []model.ExecuteToolOpt{}
	switch req.Operation {
	case common.DebugOperation_Debug:
		opts = append(opts, model.WithInvalidRespProcessStrategy(consts.InvalidResponseProcessStrategyOfReturnErr))
	case common.DebugOperation_Parse:
		opts = append(opts, model.WithAutoGenRespSchema(),
			model.WithInvalidRespProcessStrategy(consts.InvalidResponseProcessStrategyOfReturnRaw),
		)
	}

	res, err := p.DomainSVC.ExecuteTool(ctx, &model.ExecuteToolRequest{
		UserID:          conv.Int64ToStr(*userID),
		PluginID:        req.PluginID,
		ToolID:          req.APIID,
		ExecScene:       consts.ExecSceneOfToolDebug,
		ExecDraftTool:   true,
		ArgumentsInJson: req.Parameters,
	}, opts...)
	if err != nil {
		var e errorx.StatusError
		if errors.As(err, &e) {
			resp.Reason = e.Msg()
			return resp, nil
		}

		logs.CtxErrorf(ctx, "ExecuteTool failed, err=%v", err)
		resp.Reason = defaultErrReason

		return resp, nil
	}

	resp = &pluginAPI.DebugAPIResponse{
		Success:        true,
		Resp:           res.TrimmedResp,
		RawReq:         res.Request,
		RawResp:        res.RawResp,
		ResponseParams: []*common.APIParameter{},
	}

	if req.Operation == common.DebugOperation_Parse {
		res.Tool.Operation.Responses = res.RespSchema
	}

	respParams, err := res.Tool.ToRespAPIParameter()
	if err != nil {
		logs.CtxErrorf(ctx, "ToRespAPIParameter failed, err=%v", err)
		resp.Success = false
		resp.Reason = defaultErrReason
	} else {
		resp.ResponseParams = respParams
	}

	return resp, nil
}

func (p *PluginApplicationService) getToolOnlineStatus(ctx context.Context, toolIDs []int64) (map[int64]common.OnlineStatus, error) {
	onlineTools, err := p.toolRepo.MGetOnlineTools(ctx, toolIDs, repository.WithToolID())
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlineTools failed, toolIDs=%v", toolIDs)
	}

	onlineStatus := make(map[int64]common.OnlineStatus, len(onlineTools))
	for _, tool := range onlineTools {
		onlineStatus[tool.ID] = common.OnlineStatus_ONLINE
	}

	return onlineStatus, nil
}
