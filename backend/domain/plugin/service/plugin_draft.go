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
	"net/http"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	searchModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/search"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crosssearch"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/openapi"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *pluginServiceImpl) CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (pluginID int64, err error) {
	mf := entity.NewDefaultPluginManifest()
	mf.CommonParams = map[model.HTTPParamLocation][]*plugin_develop_common.CommonParamSchema{}
	mf.NameForHuman = req.Name
	mf.NameForModel = req.Name
	mf.DescriptionForHuman = req.Desc
	mf.DescriptionForModel = req.Desc
	mf.API.Type, _ = model.ToPluginType(req.PluginType)
	mf.LogoURL = req.IconURI

	authV2, err := req.AuthInfo.toAuthV2()
	if err != nil {
		return 0, err
	}
	mf.Auth = authV2

	for loc, params := range req.CommonParams {
		location, ok := model.ToHTTPParamLocation(loc)
		if !ok {
			return 0, fmt.Errorf("invalid location '%s'", loc.String())
		}
		for _, param := range params {
			mf.CommonParams[location] = append(mf.CommonParams[location],
				&plugin_develop_common.CommonParamSchema{
					Name:  param.Name,
					Value: param.Value,
				})
		}
	}

	doc := entity.NewDefaultOpenapiDoc()
	doc.Servers = append(doc.Servers, &openapi3.Server{
		URL: req.ServerURL,
	})
	doc.Info.Title = req.Name
	doc.Info.Description = req.Desc

	err = doc.Validate(ctx)
	if err != nil {
		return 0, err
	}
	err = mf.Validate(false)
	if err != nil {
		return 0, err
	}

	pl := entity.NewPluginInfo(&model.PluginInfo{
		IconURI:     ptr.Of(req.IconURI),
		SpaceID:     req.SpaceID,
		ServerURL:   ptr.Of(req.ServerURL),
		DeveloperID: req.DeveloperID,
		APPID:       req.ProjectID,
		PluginType:  req.PluginType,
		Manifest:    mf,
		OpenapiDoc:  doc,
	})

	pluginID, err = p.pluginRepo.CreateDraftPlugin(ctx, pl)
	if err != nil {
		return 0, errorx.Wrapf(err, "CreateDraftPlugin failed")
	}

	return pluginID, nil
}

func (p *pluginServiceImpl) GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", pluginID)
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	return pl, nil
}

func (p *pluginServiceImpl) MGetDraftPlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins, err = p.pluginRepo.MGetDraftPlugins(ctx, pluginIDs)
	if err != nil {
		return nil, err
	}

	return plugins, nil
}

func (p *pluginServiceImpl) ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error) {
	if req.PageInfo.Name == nil || *req.PageInfo.Name == "" {
		res, err := p.pluginRepo.ListDraftPlugins(ctx, &repository.ListDraftPluginsRequest{
			SpaceID:  req.SpaceID,
			APPID:    req.APPID,
			PageInfo: req.PageInfo,
		})
		if err != nil {
			return nil, errorx.Wrapf(err, "ListDraftPlugins failed, spaceID=%d, appID=%d", req.SpaceID, req.APPID)
		}

		return &ListDraftPluginsResponse{
			Plugins: res.Plugins,
			Total:   res.Total,
		}, nil
	}

	res, err := crosssearch.DefaultSVC().SearchResources(ctx, &searchModel.SearchResourcesRequest{
		SpaceID:  req.SpaceID,
		APPID:    req.APPID,
		Name:     *req.PageInfo.Name,
		OrderAsc: false,
		ResTypeFilter: []resCommon.ResType{
			resCommon.ResType_Plugin,
		},
		OrderFiledName: func() string {
			if req.PageInfo.SortBy == nil || *req.PageInfo.SortBy != entity.SortByCreatedAt {
				return searchModel.FieldOfUpdateTime
			}
			return searchModel.FieldOfCreateTime
		}(),
		Page:  ptr.Of(int32(req.PageInfo.Page)),
		Limit: int32(req.PageInfo.Size),
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "SearchResources failed, spaceID=%d, appID=%d", req.SpaceID, req.APPID)
	}

	plugins := make([]*entity.PluginInfo, 0, len(res.Data))
	for _, pl := range res.Data {
		draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pl.ResID)
		if err != nil {
			return nil, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", pl.ResID)
		}
		if !exist {
			logs.CtxWarnf(ctx, "draft plugin not exist, pluginID=%d", pl.ResID)
			continue
		}
		plugins = append(plugins, draftPlugin)
	}

	total := int64(0)
	if res.TotalHits != nil {
		total = *res.TotalHits
	}

	return &ListDraftPluginsResponse{
		Plugins: plugins,
		Total:   total,
	}, nil
}

func (p *pluginServiceImpl) CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error) {
	err = req.OpenapiDoc.Validate(ctx)
	if err != nil {
		return nil, err
	}
	err = req.Manifest.Validate(false)
	if err != nil {
		return nil, err
	}

	res, err := p.pluginRepo.CreateDraftPluginWithCode(ctx, &repository.CreateDraftPluginWithCodeRequest{
		SpaceID:     req.SpaceID,
		DeveloperID: req.DeveloperID,
		ProjectID:   req.ProjectID,
		Manifest:    req.Manifest,
		OpenapiDoc:  req.OpenapiDoc,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftPluginWithCode failed")
	}

	resp = &CreateDraftPluginWithCodeResponse{
		Plugin: res.Plugin,
		Tools:  res.Tools,
	}

	return resp, nil
}

func (p *pluginServiceImpl) UpdateDraftPluginWithCode(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error) {
	doc := req.OpenapiDoc
	mf := req.Manifest

	err = doc.Validate(ctx)
	if err != nil {
		return err
	}
	err = mf.Validate(false)
	if err != nil {
		return err
	}

	apiSchemas := make(map[entity.UniqueToolAPI]*model.Openapi3Operation, len(doc.Paths))
	apis := make([]entity.UniqueToolAPI, 0, len(doc.Paths))

	for subURL, pathItem := range doc.Paths {
		for method, op := range pathItem.Operations() {
			api := entity.UniqueToolAPI{
				SubURL: subURL,
				Method: method,
			}
			apiSchemas[api] = model.NewOpenapi3Operation(op)
			apis = append(apis, api)
		}
	}

	oldDraftTools, err := p.toolRepo.GetPluginAllDraftTools(ctx, req.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", req.PluginID)
	}

	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", req.PluginID)
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	if draftPlugin.GetServerURL() != doc.Servers[0].URL {
		for _, draftTool := range oldDraftTools {
			draftTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
		}
	}

	oldDraftToolsMap := slices.ToMap(oldDraftTools, func(e *entity.ToolInfo) (entity.UniqueToolAPI, *entity.ToolInfo) {
		return entity.UniqueToolAPI{
			SubURL: e.GetSubURL(),
			Method: e.GetMethod(),
		}, e
	})

	// 1. Delete tool - > Turn off Enable
	for api, oldTool := range oldDraftToolsMap {
		_, ok := apiSchemas[api]
		if !ok {
			oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
			oldTool.ActivatedStatus = ptr.Of(model.DeactivateTool)
		}
	}

	newDraftTools := make([]*entity.ToolInfo, 0, len(apis))
	for api, newOp := range apiSchemas {
		oldTool, ok := oldDraftToolsMap[api]
		if ok { // 2. Update tool - > Overlay
			oldTool.ActivatedStatus = ptr.Of(model.ActivateTool)
			oldTool.Operation = newOp
			if needResetDebugStatusTool(ctx, newOp, oldTool.Operation) {
				oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
			}
			continue
		}

		// 3. New tools
		newDraftTools = append(newDraftTools, &entity.ToolInfo{
			PluginID:        req.PluginID,
			ActivatedStatus: ptr.Of(model.ActivateTool),
			DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
			SubURL:          ptr.Of(api.SubURL),
			Method:          ptr.Of(api.Method),
			Operation:       newOp,
		})
	}

	err = p.pluginRepo.UpdateDraftPluginWithCode(ctx, &repository.UpdatePluginDraftWithCode{
		PluginID:      req.PluginID,
		OpenapiDoc:    doc,
		Manifest:      mf,
		UpdatedTools:  oldDraftTools,
		NewDraftTools: newDraftTools,
	})
	if err != nil {
		return errorx.Wrapf(err, "UpdateDraftPluginWithCode failed, pluginID=%d", req.PluginID)
	}

	return nil
}

func needResetDebugStatusTool(_ context.Context, nt, ot *model.Openapi3Operation) bool {
	if len(nt.Parameters) != len(ot.Parameters) {
		return true
	}

	otParams := make(map[string]*openapi3.Parameter, len(ot.Parameters))
	cnt := make(map[string]int, len(nt.Parameters))

	for _, p := range nt.Parameters {
		cnt[p.Value.Name]++
	}
	for _, p := range ot.Parameters {
		cnt[p.Value.Name]--
		otParams[p.Value.Name] = p.Value
	}
	for _, v := range cnt {
		if v != 0 {
			return true
		}
	}

	for _, p := range nt.Parameters {
		np, op := p.Value, otParams[p.Value.Name]
		if np.In != op.In {
			return true
		}
		if np.Required != op.Required {
			return true
		}

		if !isJsonSchemaEqual(op.Schema.Value, np.Schema.Value) {
			return true
		}
	}

	if nt.RequestBody == nil && ot.RequestBody == nil {
		return false
	}
	if (nt.RequestBody == nil && ot.RequestBody != nil) ||
		(nt.RequestBody != nil && ot.RequestBody == nil) {
		return true
	}

	nReqBody, oReqBody := nt.RequestBody.Value, ot.RequestBody.Value

	if len(nReqBody.Content) != len(oReqBody.Content) {
		return true
	}
	cnt = make(map[string]int, len(nReqBody.Content))
	for ct := range nReqBody.Content {
		cnt[ct]++
	}
	for ct := range oReqBody.Content {
		cnt[ct]--
	}
	for _, v := range cnt {
		if v != 0 {
			return true
		}
	}

	for ct, nct := range nReqBody.Content {
		oct := oReqBody.Content[ct]
		if !isJsonSchemaEqual(nct.Schema.Value, oct.Schema.Value) {
			return true
		}
	}

	return false
}

func isJsonSchemaEqual(nsc, osc *openapi3.Schema) bool {
	if nsc.Type != osc.Type {
		return false
	}
	if nsc.Format != osc.Format {
		return false
	}
	if nsc.Default != osc.Default {
		return false
	}
	if nsc.Extensions[model.APISchemaExtendAssistType] != osc.Extensions[model.APISchemaExtendAssistType] {
		return false
	}
	if nsc.Extensions[model.APISchemaExtendGlobalDisable] != osc.Extensions[model.APISchemaExtendGlobalDisable] {
		return false
	}

	switch nsc.Type {
	case openapi3.TypeObject:
		if len(nsc.Required) != len(osc.Required) {
			return false
		}
		if len(nsc.Required) > 0 {
			cnt := make(map[string]int, len(nsc.Required))
			for _, x := range nsc.Required {
				cnt[x]++
			}
			for _, x := range osc.Required {
				cnt[x]--
			}
			for _, v := range cnt {
				if v != 0 {
					return true
				}
			}
		}

		if len(nsc.Properties) != len(osc.Properties) {
			return false
		}
		if len(nsc.Properties) > 0 {
			for paramName, np := range nsc.Properties {
				op, ok := osc.Properties[paramName]
				if !ok {
					return false
				}
				if !isJsonSchemaEqual(np.Value, op.Value) {
					return false
				}
			}
		}
	case openapi3.TypeArray:
		if !isJsonSchemaEqual(nsc.Items.Value, osc.Items.Value) {
			return false
		}
	}

	return true
}

func (p *pluginServiceImpl) UpdateDraftPlugin(ctx context.Context, req *UpdateDraftPluginRequest) (err error) {
	oldPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", req.PluginID)
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	doc, err := updatePluginOpenapiDoc(ctx, oldPlugin.OpenapiDoc, req)
	if err != nil {
		return errorx.Wrapf(err, "updatePluginOpenapiDoc failed")
	}
	mf, err := updatePluginManifest(ctx, oldPlugin.Manifest, req)
	if err != nil {
		return errorx.Wrapf(err, "updatePluginManifest failed")
	}

	newPlugin := entity.NewPluginInfo(&model.PluginInfo{
		ID:         req.PluginID,
		IconURI:    ptr.Of(mf.LogoURL),
		ServerURL:  req.URL,
		Manifest:   mf,
		OpenapiDoc: doc,
	})

	if newPlugin.GetServerURL() == "" ||
		oldPlugin.GetServerURL() == newPlugin.GetServerURL() {
		err = p.pluginRepo.UpdateDraftPluginWithoutURLChanged(ctx, newPlugin)
		if err != nil {
			return errorx.Wrapf(err, "UpdateDraftPluginWithoutURLChanged failed, pluginID=%d", req.PluginID)
		}
		return nil
	}

	err = p.pluginRepo.UpdateDraftPlugin(ctx, newPlugin)
	if err != nil {
		return errorx.Wrapf(err, "UpdateDraftPlugin failed, pluginID=%d", req.PluginID)
	}

	return nil
}

func updatePluginOpenapiDoc(_ context.Context, doc *model.Openapi3T, req *UpdateDraftPluginRequest) (*model.Openapi3T, error) {
	if req.Name != nil {
		doc.Info.Title = *req.Name
	}

	if req.Desc != nil {
		doc.Info.Description = *req.Desc
	}

	if req.URL != nil {
		hasServer := false
		for _, svr := range doc.Servers {
			if svr.URL == *req.URL {
				hasServer = true
			}
		}
		if !hasServer {
			doc.Servers = openapi3.Servers{{URL: *req.URL}}
		}
	}

	return doc, nil
}

func updatePluginManifest(_ context.Context, mf *entity.PluginManifest, req *UpdateDraftPluginRequest) (*entity.PluginManifest, error) {
	if req.Name != nil {
		mf.NameForHuman = *req.Name
		mf.NameForModel = *req.Name
	}

	if req.Desc != nil {
		mf.DescriptionForHuman = *req.Desc
		mf.DescriptionForModel = *req.Desc
	}

	if req.Icon != nil {
		mf.LogoURL = req.Icon.URI
	}

	if len(req.CommonParams) > 0 {
		if mf.CommonParams == nil {
			mf.CommonParams = make(map[model.HTTPParamLocation][]*plugin_develop_common.CommonParamSchema, len(req.CommonParams))
		}
		for loc, params := range req.CommonParams {
			location, ok := model.ToHTTPParamLocation(loc)
			if !ok {
				return nil, fmt.Errorf("invalid location '%s'", loc.String())
			}
			commonParams := make([]*plugin_develop_common.CommonParamSchema, 0, len(params))
			for _, param := range params {
				commonParams = append(commonParams, &plugin_develop_common.CommonParamSchema{
					Name:  param.Name,
					Value: param.Value,
				})
			}
			mf.CommonParams[location] = commonParams
		}
	}

	if req.AuthInfo != nil {
		authV2, err := req.AuthInfo.toAuthV2()
		if err != nil {
			return nil, err
		}

		mf.Auth = authV2
	}

	return mf, nil
}

func (p *pluginServiceImpl) DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error) {
	return p.pluginRepo.DeleteDraftPlugin(ctx, pluginID)
}

func (p *pluginServiceImpl) MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools, err = p.toolRepo.MGetDraftTools(ctx, toolIDs)
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetDraftTools failed, toolIDs=%v", toolIDs)
	}

	return tools, nil
}

func (p *pluginServiceImpl) UpdateDraftTool(ctx context.Context, req *UpdateDraftToolRequest) (err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", req.PluginID)
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	draftTool, exist, err := p.toolRepo.GetDraftTool(ctx, req.ToolID)
	if err != nil {
		return errorx.Wrapf(err, "GetDraftTool failed, toolID=%d", req.ToolID)
	}
	if !exist {
		return errorx.New(errno.ErrPluginRecordNotFound)
	}

	if req.SaveExample != nil {
		return p.updateDraftToolDebugExample(ctx, draftPlugin, draftTool, *req.SaveExample, req.DebugExample)
	}

	return p.updateDraftTool(ctx, req, draftTool)
}

func (p *pluginServiceImpl) updateDraftTool(ctx context.Context, req *UpdateDraftToolRequest, draftTool *entity.ToolInfo) (err error) {
	if req.Method != nil && req.SubURL != nil {
		api := entity.UniqueToolAPI{
			SubURL: ptr.FromOrDefault(req.SubURL, ""),
			Method: ptr.FromOrDefault(req.Method, ""),
		}
		existTool, exist, err := p.toolRepo.GetDraftToolWithAPI(ctx, draftTool.PluginID, api)
		if err != nil {
			return errorx.Wrapf(err, "GetDraftToolWithAPI failed, pluginID=%d, api=%v", draftTool.PluginID, api)
		}
		if exist && draftTool.ID != existTool.ID {
			return errorx.New(errno.ErrPluginDuplicatedTool, errorx.KVf(errno.PluginMsgKey, "[%s]:%s", api.Method, api.SubURL))
		}
	}

	var activatedStatus *model.ActivatedStatus
	if req.Disabled != nil {
		if *req.Disabled {
			activatedStatus = ptr.Of(model.DeactivateTool)
		} else {
			activatedStatus = ptr.Of(model.ActivateTool)
		}
	}

	debugStatus := draftTool.DebugStatus
	if req.Method != nil ||
		req.SubURL != nil ||
		req.Parameters != nil ||
		req.RequestBody != nil ||
		req.Responses != nil {
		debugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
	}

	op := draftTool.Operation
	if req.Name != nil {
		op.OperationID = *req.Name
	}
	if req.Desc != nil {
		op.Summary = *req.Desc
	}
	if req.APIExtend != nil {
		if op.Extensions == nil {
			op.Extensions = map[string]any{}
		}
		authMode, ok := model.ToAPIAuthMode(req.APIExtend.AuthMode)
		if ok {
			op.Extensions[model.APISchemaExtendAuthMode] = authMode
		}
	}

	// update request parameters
	if req.Parameters != nil {
		op.Parameters = req.Parameters
	}

	// update request body
	if req.RequestBody == nil {
		op.RequestBody = draftTool.Operation.RequestBody
	} else {
		mType, ok := req.RequestBody.Value.Content[model.MediaTypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in request body", model.MediaTypeJson)
		}
		if op.RequestBody == nil || op.RequestBody.Value == nil || op.RequestBody.Value.Content == nil {
			op.RequestBody = &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: map[string]*openapi3.MediaType{},
				},
			}
		}
		op.RequestBody.Value.Content[model.MediaTypeJson] = mType
	}

	// update responses
	if req.Responses == nil {
		op.Responses = draftTool.Operation.Responses
	} else {
		newRespRef, ok := req.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
		}
		newMIMEType, ok := newRespRef.Value.Content[model.MediaTypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in responses", model.MediaTypeJson)
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

		oldRespRef.Value.Content[model.MediaTypeJson] = newMIMEType
	}

	updatedTool := &entity.ToolInfo{
		ID:              req.ToolID,
		PluginID:        req.PluginID,
		ActivatedStatus: activatedStatus,
		DebugStatus:     debugStatus,
		Method:          req.Method,
		SubURL:          req.SubURL,
		Operation:       op,
	}

	err = p.toolRepo.UpdateDraftTool(ctx, updatedTool)
	if err != nil {
		return errorx.Wrapf(err, "UpdateDraftTool failed, toolID=%d", req.ToolID)
	}

	return nil
}

func (p *pluginServiceImpl) updateDraftToolDebugExample(ctx context.Context, draftPlugin *entity.PluginInfo,
	draftTool *entity.ToolInfo, save bool, example *common.DebugExample) (err error) {

	components := draftPlugin.OpenapiDoc.Components

	if !save && components != nil && components.Examples != nil {
		delete(components.Examples, draftTool.Operation.OperationID)
	}

	if save {
		if components == nil {
			components = &openapi3.Components{}
		}
		if components.Examples == nil {
			components.Examples = make(map[string]*openapi3.ExampleRef)
		}

		draftPlugin.OpenapiDoc.Components = components

		reqExample, respExample := map[string]any{}, map[string]any{}
		if example.ReqExample != "" {
			err = sonic.UnmarshalString(example.ReqExample, &reqExample)
			if err != nil {
				return errorx.WrapByCode(err, errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, "invalid request example"))
			}
		}
		if example.RespExample != "" {
			err = sonic.UnmarshalString(example.RespExample, &respExample)
			if err != nil {
				return errorx.WrapByCode(err, errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, "invalid response example"))
			}
		}

		components.Examples[draftTool.Operation.OperationID] = &openapi3.ExampleRef{
			Value: &openapi3.Example{
				Value: map[string]any{
					"ReqExample":  reqExample,
					"RespExample": respExample,
				},
			},
		}
	}

	err = p.pluginRepo.UpdateDebugExample(ctx, draftPlugin.ID, draftPlugin.OpenapiDoc)
	if err != nil {
		return errorx.Wrapf(err, "UpdateDebugExample failed, pluginID=%d", draftPlugin.ID)
	}

	return nil
}

func (p *pluginServiceImpl) ConvertToOpenapi3Doc(ctx context.Context, req *ConvertToOpenapi3DocRequest) (resp *ConvertToOpenapi3DocResponse) {
	var err error
	defer func() {
		if err != nil {
			logs.Errorf("ConvertToOpenapi3Doc failed, err=%s", err)

			resp.ErrMsg = "internal server error"

			var e errorx.StatusError
			if errors.As(err, &e) {
				resp.ErrMsg = e.Msg()
			}
		}
	}()

	resp = &ConvertToOpenapi3DocResponse{}

	cvt, format, err := getConvertFunc(ctx, req.RawInput)
	if err != nil {
		resp.Format = format
		return resp
	}

	doc, mf, err := cvt(ctx, req.RawInput)
	if err != nil {
		resp.Format = format
		return resp
	}

	err = validateConvertResult(ctx, req, doc, mf)
	if err != nil {
		resp.Format = format
		return resp
	}

	return &ConvertToOpenapi3DocResponse{
		OpenapiDoc: doc,
		Manifest:   mf,
		Format:     format,
		ErrMsg:     "",
	}
}

type convertFunc func(ctx context.Context, rawInput string) (*model.Openapi3T, *entity.PluginManifest, error)

func getConvertFunc(ctx context.Context, rawInput string) (convertFunc, common.PluginDataFormat, error) {
	if strings.HasPrefix(rawInput, "curl") {
		return openapi.CurlToOpenapi3Doc, common.PluginDataFormat_Curl, nil
	}

	if strings.Contains(rawInput, "_postman_id") { // postman collection
		return openapi.PostmanToOpenapi3Doc, common.PluginDataFormat_Postman, nil
	}

	var vd struct {
		OpenAPI string `json:"openapi" yaml:"openapi"`
		Swagger string `json:"swagger" yaml:"swagger"`
	}

	err := sonic.UnmarshalString(rawInput, &vd)
	if err != nil {
		err = yaml.Unmarshal([]byte(rawInput), &vd)
		if err != nil {
			return nil, 0, fmt.Errorf("invalid schema")
		}
	}

	if vd.OpenAPI == "3" || strings.HasPrefix(vd.OpenAPI, "3.") {
		return openapi.ToOpenapi3Doc, common.PluginDataFormat_OpenAPI, nil
	}

	if vd.Swagger == "2" || strings.HasPrefix(vd.Swagger, "2.") {
		return openapi.SwaggerToOpenapi3Doc, common.PluginDataFormat_Swagger, nil
	}

	return nil, 0, fmt.Errorf("invalid schema")
}

func validateConvertResult(ctx context.Context, req *ConvertToOpenapi3DocRequest, doc *model.Openapi3T, mf *entity.PluginManifest) error {
	if req.PluginServerURL != nil {
		if doc.Servers[0].URL != *req.PluginServerURL {
			return errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey, "inconsistent API URL prefix"))
		}
	}

	err := doc.Validate(ctx)
	if err != nil {
		return err
	}

	err = mf.Validate(false)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) CreateDraftToolsWithCode(ctx context.Context, req *CreateDraftToolsWithCodeRequest) (resp *CreateDraftToolsWithCodeResponse, err error) {
	err = req.OpenapiDoc.Validate(ctx)
	if err != nil {
		return nil, err
	}

	toolAPIs := make([]entity.UniqueToolAPI, 0, len(req.OpenapiDoc.Paths))
	for path, item := range req.OpenapiDoc.Paths {
		for method := range item.Operations() {
			toolAPIs = append(toolAPIs, entity.UniqueToolAPI{
				SubURL: path,
				Method: method,
			})
		}
	}

	existTools, err := p.toolRepo.MGetDraftToolWithAPI(ctx, req.PluginID, toolAPIs,
		repository.WithToolID(),
		repository.WithToolMethod(),
		repository.WithToolSubURL())
	if err != nil {
		return nil, errorx.Wrapf(err, "MGetDraftToolWithAPI failed, pluginID=%d, apis=%v", req.PluginID, toolAPIs)
	}

	duplicatedTools := make([]entity.UniqueToolAPI, 0, len(existTools))
	for _, api := range toolAPIs {
		if _, exist := existTools[api]; exist {
			duplicatedTools = append(duplicatedTools, api)
		}
	}

	if !req.ConflictAndUpdate && len(duplicatedTools) > 0 {
		return &CreateDraftToolsWithCodeResponse{
			DuplicatedTools: duplicatedTools,
		}, nil
	}

	tools := make([]*entity.ToolInfo, 0, len(toolAPIs))
	for path, item := range req.OpenapiDoc.Paths {
		for method, op := range item.Operations() {
			tools = append(tools, &entity.ToolInfo{
				PluginID:        req.PluginID,
				Method:          ptr.Of(method),
				SubURL:          ptr.Of(path),
				ActivatedStatus: ptr.Of(model.ActivateTool),
				DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
				Operation:       model.NewOpenapi3Operation(op),
			})
		}
	}

	err = p.toolRepo.UpsertDraftTools(ctx, req.PluginID, tools)
	if err != nil {
		return nil, errorx.Wrapf(err, "UpsertDraftTools failed, pluginID=%d", req.PluginID)
	}

	resp = &CreateDraftToolsWithCodeResponse{}

	return resp, nil
}
