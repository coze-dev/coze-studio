package service

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/openapi"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func (p *pluginServiceImpl) CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (pluginID int64, err error) {
	mf := entity.NewDefaultPluginManifest()
	mf.NameForHuman = req.Name
	mf.DescriptionForHuman = req.Desc
	mf.API.Type, _ = model.ToPluginType(req.PluginType)
	mf.LogoURL = req.IconURI

	authV2, err := convertPluginAuthInfoToAuthV2(req.AuthInfo)
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
			mParams := mf.CommonParams[location]
			mParams = append(mParams, &plugin_develop_common.CommonParamSchema{
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
		return 0, err
	}

	return pluginID, nil
}

func (p *pluginServiceImpl) GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", pluginID)
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
	res, err := p.pluginRepo.ListDraftPlugins(ctx, &repository.ListDraftPluginsRequest{
		SpaceID:  req.SpaceID,
		APPID:    req.APPID,
		PageInfo: req.PageInfo,
	})
	if err != nil {
		return nil, err
	}
	return &ListDraftPluginsResponse{
		Plugins: res.Plugins,
		Total:   res.Total,
	}, nil
}

func (p *pluginServiceImpl) CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error) {
	res, err := p.pluginRepo.CreateDraftPluginWithCode(ctx, &repository.CreateDraftPluginWithCodeRequest{
		SpaceID:     req.SpaceID,
		DeveloperID: req.DeveloperID,
		ProjectID:   req.ProjectID,
		Manifest:    req.Manifest,
		OpenapiDoc:  req.OpenapiDoc,
	})
	if err != nil {
		return nil, err
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
		return fmt.Errorf("openapi doc validates failed, err=%v", err)
	}
	err = mf.Validate()
	if err != nil {
		return fmt.Errorf("plugin manifest validated failed, err=%v", err)
	}

	apiSchemas := make(map[entity.UniqueToolAPI]*model.Openapi3Operation, len(doc.Paths))
	apis := make([]entity.UniqueToolAPI, 0, len(doc.Paths))

	for subURL, pathItem := range doc.Paths {
		for method, operation := range pathItem.Operations() {
			api := entity.UniqueToolAPI{
				SubURL: subURL,
				Method: method,
			}
			apiSchemas[api] = ptr.Of(model.Openapi3Operation(*operation))
			apis = append(apis, api)
		}
	}

	oldDraftTools, err := p.toolRepo.GetPluginAllDraftTools(ctx, req.PluginID)
	if err != nil {
		return err
	}

	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft plugin '%d' not found", req.PluginID)
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

	// 1. 删除 tool -> 关闭启用
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
		if ok { // 2. 更新 tool -> 覆盖
			oldTool.ActivatedStatus = ptr.Of(model.ActivateTool)
			oldTool.Operation = newOp
			if needResetDebugStatusTool(ctx, newOp, oldTool.Operation) {
				oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
			}
			continue
		}

		// 3. 新增 tool
		newDraftTools = append(newDraftTools, &entity.ToolInfo{
			PluginID:        req.PluginID,
			ActivatedStatus: ptr.Of(model.ActivateTool),
			DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
			SubURL:          ptr.Of(api.SubURL),
			Method:          ptr.Of(api.Method),
			Operation:       newOp,
		})
	}

	// TODO(@maronghong): 细化更新判断，减少更新的 tool，提升性能

	err = p.pluginRepo.UpdateDraftPluginWithCode(ctx, &repository.UpdatePluginDraftWithCode{
		PluginID:      req.PluginID,
		OpenapiDoc:    doc,
		Manifest:      mf,
		UpdatedTools:  oldDraftTools,
		NewDraftTools: newDraftTools,
	})
	if err != nil {
		return err
	}

	return nil
}

func needResetDebugStatusTool(_ context.Context, nt, ot *model.Openapi3Operation) bool {
	if len(ot.Parameters) != len(ot.Parameters) {
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
		return err
	}
	if !exist {
		return fmt.Errorf("plugin draft '%d' not found", req.PluginID)
	}

	doc, err := updatePluginOpenapiDoc(ctx, oldPlugin.OpenapiDoc, req)
	if err != nil {
		return err
	}
	mf, err := updatePluginManifest(ctx, oldPlugin.Manifest, req)
	if err != nil {
		return err
	}

	newPlugin := entity.NewPluginInfo(&model.PluginInfo{
		ID:         req.PluginID,
		IconURI:    ptr.Of(req.Icon.URI),
		ServerURL:  req.URL,
		Manifest:   mf,
		OpenapiDoc: doc,
	})

	if newPlugin.GetServerURL() == "" ||
		oldPlugin.GetServerURL() == newPlugin.GetServerURL() {
		return p.pluginRepo.UpdateDraftPluginWithoutURLChanged(ctx, newPlugin)
	}

	return p.pluginRepo.UpdateDraftPlugin(ctx, newPlugin)
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
			doc.Servers = append(openapi3.Servers{{URL: *req.URL}}, doc.Servers...)
		}
	}

	return doc, nil
}

func updatePluginManifest(_ context.Context, mf *entity.PluginManifest, req *UpdateDraftPluginRequest) (*entity.PluginManifest, error) {
	if req.Name != nil {
		mf.NameForHuman = *req.Name
	}

	if req.Desc != nil {
		mf.DescriptionForHuman = *req.Desc
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

	authV2, err := convertPluginAuthInfoToAuthV2(req.AuthInfo)
	if err != nil {
		return nil, err
	}

	mf.Auth = authV2

	return mf, nil
}

func convertPluginAuthInfoToAuthV2(authInfo *PluginAuthInfo) (*model.AuthV2, error) {
	if authInfo.AuthType == nil {
		return nil, fmt.Errorf("auth type is empty")
	}

	switch *authInfo.AuthType {
	case model.AuthTypeOfNone:
		return &model.AuthV2{
			Type: model.AuthTypeOfNone,
		}, nil

	case model.AuthTypeOfOAuth:
		if authInfo.OauthInfo == nil || *authInfo.OauthInfo == "" {
			return nil, fmt.Errorf("oauth info is empty")
		}

		oauthInfo := make(map[string]string)
		err := sonic.Unmarshal([]byte(*authInfo.OauthInfo), &oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("unmarshal oauth info failed, err=%v", err)
		}

		contentType := oauthInfo["authorization_content_type"]
		if contentType != model.MIMETypeJson { // only support application/json
			return nil, fmt.Errorf("invalid authorization content type '%s'", contentType)
		}

		_oauthInfo := &model.AuthOfOAuth{
			ClientID:                 oauthInfo["client_id"],
			ClientSecret:             oauthInfo["client_secret"],
			ClientURL:                oauthInfo["client_url"],
			AuthorizationURL:         oauthInfo["authorization_url"],
			AuthorizationContentType: contentType,
			Scope:                    oauthInfo["scope"],
		}

		str, err := sonic.MarshalString(_oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("marshal oauth info failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:    model.AuthTypeOfOAuth,
			Payload: &str,
		}, nil

	case model.AuthTypeOfService:
		if authInfo.AuthSubType == nil {
			return nil, fmt.Errorf("auth sub type is empty")
		}

		switch *authInfo.AuthSubType {
		case model.AuthSubTypeOfToken:
			if authInfo.Location == nil {
				return nil, fmt.Errorf("location is empty")
			}
			if authInfo.ServiceToken == nil {
				return nil, fmt.Errorf("service token is empty")
			}
			if authInfo.Key == nil {
				return nil, fmt.Errorf("key is empty")
			}

			tokenAuth := &model.AuthOfToken{
				ServiceToken: *authInfo.ServiceToken,
				Location:     *authInfo.Location,
				Key:          *authInfo.Key,
			}

			str, err := sonic.MarshalString(tokenAuth)
			if err != nil {
				return nil, fmt.Errorf("marshal token auth failed, err=%v", err)
			}

			return &model.AuthV2{
				Type:    model.AuthTypeOfService,
				SubType: model.AuthSubTypeOfToken,
				Payload: &str,
			}, nil

		case model.AuthSubTypeOfOIDC:
			if authInfo.AuthPayload == nil || *authInfo.AuthPayload == "" {
				return nil, fmt.Errorf("auth payload is empty")
			}

			oidcAuth := &model.AuthOfOIDC{}
			err := sonic.UnmarshalString(*authInfo.AuthPayload, &oidcAuth)
			if err != nil {
				return nil, fmt.Errorf("unmarshal oidc auth info failed, err=%v", err)
			}

			return &model.AuthV2{
				Type:    model.AuthTypeOfService,
				SubType: model.AuthSubTypeOfToken,
				Payload: authInfo.AuthPayload,
			}, nil

		default:
			return nil, fmt.Errorf("invalid sub auth type '%s'", *authInfo.AuthSubType)
		}

	default:
		return nil, fmt.Errorf("invalid auth type '%v'", authInfo.AuthType)
	}
}

func (p *pluginServiceImpl) DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error) {
	return p.pluginRepo.DeleteDraftPlugin(ctx, pluginID)
}

func (p *pluginServiceImpl) MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools, err = p.toolRepo.MGetDraftTools(ctx, toolIDs)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (p *pluginServiceImpl) UpdateDraftTool(ctx context.Context, req *UpdateToolDraftRequest) (err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft plugin '%d' not found", req.PluginID)
	}

	draftTool, exist, err := p.toolRepo.GetDraftTool(ctx, req.ToolID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft tool '%d' not found", req.ToolID)
	}

	if req.Method != nil && req.SubURL != nil {
		api := entity.UniqueToolAPI{
			SubURL: ptr.FromOrDefault(req.SubURL, ""),
			Method: ptr.FromOrDefault(req.Method, ""),
		}
		existTool, exist, err := p.toolRepo.GetDraftToolWithAPI(ctx, draftTool.PluginID, api)
		if err != nil {
			return err
		}
		if exist && draftTool.ID != existTool.ID {
			return fmt.Errorf("api '[%s]:%s' already exists", api.SubURL, api.Method)
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
		ID:              req.ToolID,
		PluginID:        req.PluginID,
		ActivatedStatus: activatedStatus,
		DebugStatus:     debugStatus,
		Method:          req.Method,
		SubURL:          req.SubURL,
		Operation:       op,
	}

	components := draftPlugin.OpenapiDoc.Components
	if req.SaveExample != nil && !*req.SaveExample &&
		components != nil && components.Examples != nil {
		delete(components.Examples, draftTool.Operation.OperationID)
	} else if req.DebugExample != nil {
		if components == nil {
			components = &openapi3.Components{}
		}
		if components.Examples == nil {
			components.Examples = make(map[string]*openapi3.ExampleRef)
		}

		draftPlugin.OpenapiDoc.Components = components

		reqExample, respExample := map[string]any{}, map[string]any{}
		if req.DebugExample.ReqExample != "" {
			err = sonic.UnmarshalString(req.DebugExample.ReqExample, &reqExample)
			if err != nil {
				return err
			}
		}
		if req.DebugExample.RespExample != "" {
			err = sonic.UnmarshalString(req.DebugExample.RespExample, &respExample)
			if err != nil {
				return err
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

	err = p.toolRepo.UpdateDraftToolAndDebugExample(ctx, draftPlugin.ID, draftPlugin.OpenapiDoc, updatedTool)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) ConvertToOpenapi3Doc(ctx context.Context, req *ConvertToOpenapi3DocRequest) (resp *ConvertToOpenapi3DocResponse) {
	cvt, format, err := p.getConvertFunc(ctx, req.RawInput)
	if err != nil {
		return &ConvertToOpenapi3DocResponse{
			Format: format,
			ErrMsg: err.Error(),
		}
	}

	doc, mf, err := cvt(ctx, req.RawInput)
	if err != nil {
		return &ConvertToOpenapi3DocResponse{
			Format: format,
			ErrMsg: err.Error(),
		}
	}

	err = p.validateConvertResult(ctx, req, doc, mf)
	if err != nil {
		return &ConvertToOpenapi3DocResponse{
			Format: format,
			ErrMsg: err.Error(),
		}
	}

	return &ConvertToOpenapi3DocResponse{
		OpenapiDoc: doc,
		Manifest:   mf,
		Format:     format,
		ErrMsg:     "",
	}
}

type convertFunc func(ctx context.Context, rawInput string) (*model.Openapi3T, *entity.PluginManifest, error)

func (p *pluginServiceImpl) getConvertFunc(ctx context.Context, rawInput string) (convertFunc, common.PluginDataFormat, error) {
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

func (p *pluginServiceImpl) validateConvertResult(ctx context.Context, req *ConvertToOpenapi3DocRequest, doc *model.Openapi3T, mf *entity.PluginManifest) error {
	if req.PluginServerURL != nil {
		if doc.Servers[0].URL != *req.PluginServerURL {
			return fmt.Errorf("inconsistent API URL prefix")
		}
	}

	err := doc.Validate(ctx)
	if err != nil {
		return err
	}

	err = mf.Validate()
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

	existTools, err := p.toolRepo.MGetDraftToolWithAPI(ctx, req.PluginID, toolAPIs, repository.WithToolID())
	if err != nil {
		return nil, err
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
				Operation:       ptr.Of(model.Openapi3Operation(*op)),
			})
		}
	}

	err = p.toolRepo.UpsertDraftTools(ctx, req.PluginID, tools)
	if err != nil {
		return nil, err
	}

	resp = &CreateDraftToolsWithCodeResponse{}

	return resp, nil
}
