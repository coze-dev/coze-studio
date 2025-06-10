package service

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
)

func (p *pluginServiceImpl) BindAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error) {
	return p.toolRepo.BindDraftAgentTools(ctx, agentID, toolIDs)
}

func (p *pluginServiceImpl) GetDraftAgentToolByName(ctx context.Context, agentID int64, toolName string) (tool *entity.ToolInfo, err error) {
	draftAgentTool, exist, err := p.toolRepo.GetDraftAgentToolWithToolName(ctx, agentID, toolName)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("agent tool '%s' not found", toolName)
	}

	tool, exist, err = p.toolRepo.GetOnlineTool(ctx, draftAgentTool.ID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online tool '%s' not found", toolName)
	}

	draftAgentTool, err = mergeAgentToolInfo(ctx, tool, draftAgentTool)
	if err != nil {
		return nil, err
	}

	return draftAgentTool, nil
}

func (p *pluginServiceImpl) MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (tools []*entity.ToolInfo, err error) {
	toolIDs := make([]int64, 0, len(req.VersionAgentTools))
	for _, v := range req.VersionAgentTools {
		toolIDs = append(toolIDs, v.ToolID)
	}

	existTools, err := p.toolRepo.MGetOnlineTools(ctx, toolIDs, repository.WithToolID())
	if err != nil {
		return nil, err
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
			return nil, err
		}

		return tools, nil
	}

	vTools := make([]entity.VersionAgentTool, 0, len(existMap))
	for _, v := range req.VersionAgentTools {
		if existMap[v.ToolID] {
			vTools = append(vTools, v)
		}
	}

	tools, err = p.toolRepo.MGetVersionAgentTool(ctx, req.AgentID, vTools)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (p *pluginServiceImpl) PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error) {
	tools, err := p.toolRepo.GetSpaceAllDraftAgentTools(ctx, agentID)
	if err != nil {
		return err
	}

	return p.toolRepo.BatchCreateVersionAgentTools(ctx, agentID, agentVersion, tools)
}

func (p *pluginServiceImpl) UpdateBotDefaultParams(ctx context.Context, req *UpdateBotDefaultParamsRequest) (err error) {
	_, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID, repository.WithPluginID())
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("online plugin '%d' not found", req.PluginID)
	}

	draftAgentTool, exist, err := p.toolRepo.GetDraftAgentToolWithToolName(ctx, req.AgentID, req.ToolName)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft agent tool '%s' not found", req.ToolName)
	}

	onlineTool, exist, err := p.toolRepo.GetOnlineTool(ctx, draftAgentTool.ID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft tool '%d' not found", draftAgentTool.ID)
	}

	op := onlineTool.Operation

	if req.Parameters != nil {
		op.Parameters = req.Parameters
	}

	if req.RequestBody != nil {
		mType, ok := req.RequestBody.Value.Content[model.MIMETypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in request body", model.MIMETypeJson)
		}
		if op.RequestBody.Value.Content == nil {
			op.RequestBody.Value.Content = map[string]*openapi3.MediaType{}
		}
		op.RequestBody.Value.Content[model.MIMETypeJson] = mType
	}

	if req.Responses != nil {
		newRespRef, ok := req.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
		}
		newMIMEType, ok := newRespRef.Value.Content[model.MIMETypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in responses", model.MIMETypeJson)
		}

		if op.Responses == nil {
			op.Responses = map[string]*openapi3.ResponseRef{}
		}

		oldRespRef, ok := op.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			oldRespRef = &openapi3.ResponseRef{
				Value: &openapi3.Response{
					Content: map[string]*openapi3.MediaType{},
				},
			}
			op.Responses[strconv.Itoa(http.StatusOK)] = oldRespRef
		}

		if oldRespRef.Value.Content == nil {
			oldRespRef.Value.Content = map[string]*openapi3.MediaType{}
		}

		oldRespRef.Value.Content[model.MIMETypeJson] = newMIMEType
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
		return err
	}

	return nil
}

func mergeAgentToolInfo(ctx context.Context, dest, src *entity.ToolInfo) (*entity.ToolInfo, error) {
	dest.Version = src.Version
	dest.Method = src.Method
	dest.SubURL = src.SubURL

	newParameters, err := mergeParameters(ctx, dest.Operation.Parameters, src.Operation.Parameters)
	if err != nil {
		return nil, err
	}

	dest.Operation.Parameters = newParameters

	newReqBody, err := mergeRequestBody(ctx, dest.Operation.RequestBody.Value, src.Operation.RequestBody.Value)
	if err != nil {
		return nil, err
	}

	dest.Operation.RequestBody.Value = newReqBody

	newRespBody, err := mergeResponseBody(ctx, dest.Operation.Responses, src.Operation.Responses)
	if err != nil {
		return nil, err
	}

	dest.Operation.Responses = newRespBody

	return dest, nil
}

func mergeParameters(ctx context.Context, dest, src openapi3.Parameters) (openapi3.Parameters, error) {
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

		if v, ok := sv.Extensions[model.APISchemaExtendLocalDisable]; ok {
			dv.Extensions[model.APISchemaExtendLocalDisable] = v
		}

		if v, ok := sv.Extensions[model.APISchemaExtendVariableRef]; ok {
			dv.Extensions[model.APISchemaExtendVariableRef] = v
		}

		dv.Default = sv.Default
	}

	return dest, nil
}

func mergeRequestBody(ctx context.Context, dest, src *openapi3.RequestBody) (*openapi3.RequestBody, error) {
	for ct, dm := range dest.Content {
		sm, ok := src.Content[ct]
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
	if v, ok := src.Extensions[model.APISchemaExtendLocalDisable]; ok {
		dest.Extensions[model.APISchemaExtendLocalDisable] = v
	}
	if v, ok := src.Extensions[model.APISchemaExtendVariableRef]; ok {
		dest.Extensions[model.APISchemaExtendVariableRef] = v
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
	for code, dr := range dest {
		sr, ok := src[code]
		if !ok {
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
