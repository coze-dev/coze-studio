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
	"fmt"
	"net/http"
	"slices"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *pluginServiceImpl) BindAgentTools(ctx context.Context, agentID int64, bindTools []*model.BindToolInfo) (err error) {
	return p.toolRepo.BindDraftAgentTools(ctx, agentID, bindTools)
}

func (p *pluginServiceImpl) DuplicateDraftAgentTools(ctx context.Context, fromAgentID, toAgentID int64) (err error) {
	return p.toolRepo.DuplicateDraftAgentTools(ctx, fromAgentID, toAgentID)
}

func (p *pluginServiceImpl) GetDraftAgentToolByName(ctx context.Context, agentID int64, pluginID int64, toolName string) (tool *entity.ToolInfo, err error) {
	draftAgentTool, exist, err := p.toolRepo.GetDraftAgentToolWithToolName(ctx, agentID, toolName)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftAgentToolWithToolName failed, agentID=%d, toolName=%s", agentID, toolName)
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	if draftAgentTool.GetPluginFrom() == bot_common.PluginFrom_FromSaas {
		tools, _, err := p.toolRepo.BatchGetSaasPluginToolsInfo(ctx, []int64{draftAgentTool.PluginID})
		if err != nil {
			return nil, errorx.Wrapf(err, "BatchGetSaasPluginToolsInfo failed, pluginIDs=%v", []int64{draftAgentTool.PluginID})
		}
		if len(tools) == 0 || len(tools[draftAgentTool.PluginID]) == 0 {
			return nil, errorx.New(errno.ErrPluginRecordNotFound)
		}
		exist = false
		for _, saasTool := range tools[draftAgentTool.PluginID] {
			if saasTool.ID == draftAgentTool.ID {
				tool = saasTool
				exist = true
				break
			}
		}

	} else {
		_, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pluginID, repository.WithPluginID())
		if err != nil {
			return nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", pluginID)
		}
		if !exist {
			return nil, errorx.New(errno.ErrPluginRecordNotFound)
		}
		tool, exist, err = p.toolRepo.GetOnlineTool(ctx, draftAgentTool.ID)
		if err != nil {
			return nil, errorx.Wrapf(err, "GetOnlineTool failed, id=%d", draftAgentTool.ID)
		}

	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	draftAgentTool, err = mergeAgentToolInfo(ctx, tool, draftAgentTool)
	if err != nil {
		return nil, errorx.Wrapf(err, "mergeAgentToolInfo failed")
	}

	return draftAgentTool, nil
}

func (p *pluginServiceImpl) MGetAgentTools(ctx context.Context, req *model.MGetAgentToolsRequest) (tools []*entity.ToolInfo, err error) {
	localToolIDs := make([]int64, 0, len(req.VersionAgentTools))
	saasToolIDs := make([]int64, 0, len(req.VersionAgentTools))
	saasToolPluginIDs := make([]int64, 0, len(req.VersionAgentTools))
	for _, v := range req.VersionAgentTools {
		if ptr.From(v.PluginFrom) == bot_common.PluginFrom_FromSaas {
			saasToolIDs = append(saasToolIDs, v.ToolID)
			saasToolPluginIDs = append(saasToolPluginIDs, v.PluginID)
		} else {
			localToolIDs = append(localToolIDs, v.ToolID)
		}
	}

	existTools, err := p.toolRepo.MGetOnlineTools(ctx, localToolIDs, repository.WithToolID())
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetOnlineTools failed, toolIDs=%v", localToolIDs)
	}

	if len(saasToolIDs) > 0 {
		saasToolPluginInfos, _, err := p.toolRepo.BatchGetSaasPluginToolsInfo(ctx, saasToolPluginIDs)
		if err != nil {
			return nil, errorx.Wrapf(err, "BatchGetSaasPluginToolsInfo failed, pluginIDs=%v", saasToolPluginIDs)
		}
		for _, tools := range saasToolPluginInfos {
			for _, saasTool := range tools {
				if slices.Contains(saasToolIDs, saasTool.ID) {
					existTools = append(existTools, saasTool)
				}
			}
		}
	}

	if len(existTools) == 0 {
		return nil, nil
	}

	existMap := make(map[int64]bool, len(existTools))
	for _, tool := range existTools {
		existMap[tool.ID] = true
	}

	if req.IsDraft {
		existToolIDs := make([]int64, 0, len(existMap))
		for _, v := range req.VersionAgentTools {
			if existMap[v.ToolID] {
				existToolIDs = append(existToolIDs, v.ToolID)
			}
		}

		tools, err = p.toolRepo.MGetDraftAgentTools(ctx, req.AgentID, existToolIDs)
		if err != nil {
			return nil, errorx.Wrapf(err, "MGetDraftAgentTools failed, agentID=%d, toolIDs=%v", req.AgentID, existToolIDs)
		}

		return tools, nil
	}

	vTools := make([]model.VersionAgentTool, 0, len(existMap))
	for _, v := range req.VersionAgentTools {
		if existMap[v.ToolID] {
			vTools = append(vTools, v)
		}
	}

	//local plugin
	tools, err = p.toolRepo.MGetVersionAgentTool(ctx, req.AgentID, vTools)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetVersionAgentTool failed, agentID=%d, vTools=%v", req.AgentID, vTools)
	}

	return tools, nil
}

func (p *pluginServiceImpl) PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error) {
	tools, err := p.toolRepo.GetSpaceAllDraftAgentTools(ctx, agentID)
	if err != nil {
		return errorx.Wrapf(err, "GetSpaceAllDraftAgentTools failed, agentID=%d", agentID)
	}

	err = p.toolRepo.BatchCreateVersionAgentTools(ctx, agentID, agentVersion, tools)
	if err != nil {
		return errorx.Wrapf(err, "BatchCreateVersionAgentTools failed, agentID=%d, agentVersion=%s", agentID, agentVersion)
	}

	return nil
}

func (p *pluginServiceImpl) UpdateBotDefaultParams(ctx context.Context, req *dto.UpdateBotDefaultParamsRequest) (err error) {

	draftAgentTool, exist, err := p.toolRepo.GetDraftAgentToolWithToolName(ctx, req.AgentID, req.ToolName)
	if err != nil {
		return errorx.Wrapf(err, "GetDraftAgentToolWithToolName failed, agentID=%d, toolName=%s", req.AgentID, req.ToolName)
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	var onlineTool *entity.ToolInfo
	if draftAgentTool.GetPluginFrom() == bot_common.PluginFrom_FromSaas {
		tools, _, err := p.toolRepo.BatchGetSaasPluginToolsInfo(ctx, []int64{draftAgentTool.PluginID})
		if err != nil {
			return errorx.Wrapf(err, "BatchGetSaasPluginToolsInfo failed, pluginIDs=%v", []int64{draftAgentTool.PluginID})
		}
		if len(tools) == 0 || len(tools[draftAgentTool.PluginID]) == 0 {
			return errorx.New(errno.ErrPluginRecordNotFound)
		}
		for _, saasTool := range tools[draftAgentTool.PluginID] {
			if saasTool.ID == draftAgentTool.ID {
				onlineTool = saasTool
				exist = true
				break
			}
		}
	} else {
		_, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID, repository.WithPluginID())
		if err != nil {
			return errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
		}
		if !exist {
			return errorx.New(errno.ErrPluginRecordNotFound)
		}

		onlineTool, exist, err = p.toolRepo.GetOnlineTool(ctx, draftAgentTool.ID)
		if err != nil {
			return errorx.Wrapf(err, "GetOnlineTool failed, id=%d", draftAgentTool.ID)
		}
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	op := onlineTool.Operation

	if req.Parameters != nil {
		op.Parameters = req.Parameters
	}

	if req.RequestBody != nil {
		mType, ok := req.RequestBody.Value.Content[consts.MediaTypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in request body", consts.MediaTypeJson)
		}
		if op.RequestBody == nil || op.RequestBody.Value == nil {
			op.RequestBody = model.DefaultOpenapi3RequestBody()
		}
		if op.RequestBody.Value.Content == nil {
			op.RequestBody.Value.Content = map[string]*openapi3.MediaType{}
		}
		op.RequestBody.Value.Content[consts.MediaTypeJson] = mType
	}

	if req.Responses != nil {
		newRespRef, ok := req.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
		}
		newMIMEType, ok := newRespRef.Value.Content[consts.MediaTypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in responses", consts.MediaTypeJson)
		}

		if op.Responses == nil {
			op.Responses = model.DefaultOpenapi3Responses()
		}

		oldRespRef, ok := op.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			oldRespRef = model.DefaultOpenapi3Responses()[strconv.Itoa(http.StatusOK)]
			op.Responses[strconv.Itoa(http.StatusOK)] = oldRespRef
		}

		if oldRespRef.Value.Content == nil {
			oldRespRef.Value.Content = map[string]*openapi3.MediaType{}
		}

		oldRespRef.Value.Content[consts.MediaTypeJson] = newMIMEType
	}

	updatedTool := &entity.ToolInfo{
		Version:   onlineTool.Version,
		Method:    onlineTool.Method,
		SubURL:    onlineTool.SubURL,
		Operation: op,
	}
	err = p.toolRepo.UpdateDraftAgentTool(ctx, &repository.UpdateDraftAgentToolRequest{
		AgentID:  req.AgentID,
		ToolName: req.ToolName,
		Tool:     updatedTool,
	})
	if err != nil {
		return errorx.Wrapf(err, "UpdateDraftAgentTool failed, agentID=%d, toolName=%s", req.AgentID, req.ToolName)
	}

	return nil
}

func mergeAgentToolInfo(ctx context.Context, dest, src *entity.ToolInfo) (*entity.ToolInfo, error) {
	dest.Version = src.Version
	dest.Method = src.Method
	dest.SubURL = src.SubURL

	newParameters, err := mergeParameters(ctx, dest.Operation.Parameters, src.Operation.Parameters)
	if err != nil {
		return nil, errorx.Wrapf(err, "mergeParameters failed")
	}

	dest.Operation.Parameters = newParameters

	newReqBody, err := mergeRequestBody(ctx, dest.Operation.RequestBody, src.Operation.RequestBody)
	if err != nil {
		return nil, errorx.Wrapf(err, "mergeRequestBody failed")
	}

	dest.Operation.RequestBody = newReqBody

	newRespBody, err := mergeResponseBody(ctx, dest.Operation.Responses, src.Operation.Responses)
	if err != nil {
		return nil, errorx.Wrapf(err, "mergeResponseBody failed")
	}

	dest.Operation.Responses = newRespBody

	return dest, nil
}

func mergeParameters(ctx context.Context, dest, src openapi3.Parameters) (openapi3.Parameters, error) {
	if len(dest) == 0 || len(src) == 0 {
		return src, nil
	}

	srcMap := make(map[string]*openapi3.ParameterRef, len(src))
	for _, p := range src {
		srcMap[p.Value.Name] = p
	}

	for _, dp := range dest {
		sp, ok := srcMap[dp.Value.Name]
		if !ok {
			continue
		}

		dv := dp.Value.Schema.Value
		sv := sp.Value.Schema.Value

		if dv.Extensions == nil {
			dv.Extensions = make(map[string]any)
		}

		if v, ok := sv.Extensions[consts.APISchemaExtendLocalDisable]; ok {
			dv.Extensions[consts.APISchemaExtendLocalDisable] = v
		}

		if v, ok := sv.Extensions[consts.APISchemaExtendVariableRef]; ok {
			dv.Extensions[consts.APISchemaExtendVariableRef] = v
		}

		dv.Default = sv.Default
	}

	return dest, nil
}

func mergeRequestBody(ctx context.Context, dest, src *openapi3.RequestBodyRef) (*openapi3.RequestBodyRef, error) {
	if dest == nil || src == nil {
		return src, nil
	}

	for ct, dm := range dest.Value.Content {
		sm, ok := src.Value.Content[ct]
		if !ok {
			continue
		}

		nv, err := mergeMediaSchema(ctx, dm.Schema.Value, sm.Schema.Value)
		if err != nil {
			return nil, err
		}

		dm.Schema.Value = nv
	}

	return dest, nil
}

func mergeMediaSchema(ctx context.Context, dest, src *openapi3.Schema) (*openapi3.Schema, error) {
	if dest.Extensions == nil {
		dest.Extensions = map[string]any{}
	}
	if v, ok := src.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		dest.Extensions[consts.APISchemaExtendLocalDisable] = v
	}
	if v, ok := src.Extensions[consts.APISchemaExtendVariableRef]; ok {
		dest.Extensions[consts.APISchemaExtendVariableRef] = v
	}

	dest.Default = src.Default

	switch dest.Type {
	case openapi3.TypeObject:
		for k, dv := range dest.Properties {
			sv, ok := src.Properties[k]
			if !ok {
				continue
			}

			nv, err := mergeMediaSchema(ctx, dv.Value, sv.Value)
			if err != nil {
				return nil, err
			}

			dv.Value = nv
		}

		return dest, nil

	case openapi3.TypeArray:
		nv, err := mergeMediaSchema(ctx, dest.Items.Value, src.Items.Value)
		if err != nil {
			return nil, err
		}

		dest.Items.Value = nv

		return dest, nil

	default:
		return dest, nil
	}
}

func mergeResponseBody(ctx context.Context, dest, src openapi3.Responses) (openapi3.Responses, error) {
	if len(dest) == 0 || len(src) == 0 {
		return src, nil
	}

	for code, dr := range dest {
		sr := src[code]
		if dr == nil || sr == nil {
			continue
		}
		if len(dr.Value.Content) == 0 || len(sr.Value.Content) == 0 {
			continue
		}

		for ct, dm := range dr.Value.Content {
			sm, ok := sr.Value.Content[ct]
			if !ok {
				continue
			}

			nv, err := mergeMediaSchema(ctx, dm.Schema.Value, sm.Schema.Value)
			if err != nil {
				return nil, err
			}

			dm.Schema.Value = nv
		}
	}

	return dest, nil
}
