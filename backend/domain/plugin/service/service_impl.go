package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"golang.org/x/mod/semver"
	"gorm.io/gorm"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type Components struct {
	IDGen      idgen.IDGenerator
	DB         *gorm.DB
	PluginRepo repository.PluginRepository
	ToolRepo   repository.ToolRepository
}

func NewService(components *Components) PluginService {
	return &pluginServiceImpl{
		db:         components.DB,
		pluginRepo: components.PluginRepo,
		toolRepo:   components.ToolRepo,
	}
}

type pluginServiceImpl struct {
	db         *gorm.DB
	pluginRepo repository.PluginRepository
	toolRepo   repository.ToolRepository
}

func (p *pluginServiceImpl) CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (resp *CreateDraftPluginResponse, err error) {
	mf := entity.NewDefaultPluginManifest()
	mf.NameForHuman = req.Name
	mf.DescriptionForHuman = req.Desc
	mf.API.Type, _ = convertor.ToPluginType(req.PluginType)
	mf.LogoURL = req.IconURI

	authV2, err := convertPluginAuthInfoToAuthV2(req.AuthInfo)
	if err != nil {
		return nil, err
	}
	mf.Auth = authV2

	for loc, params := range req.CommonParams {
		location, ok := convertor.ToHTTPParamLocation(loc)
		if !ok {
			return nil, fmt.Errorf("invalid location '%s'", loc.String())
		}
		for _, param := range params {
			mParams := mf.CommonParams[location]
			mParams = append(mParams, &entity.CommonParamSchema{
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

	pl := &entity.PluginInfo{
		IconURI:     ptr.Of(req.IconURI),
		SpaceID:     req.SpaceID,
		ServerURL:   ptr.Of(req.ServerURL),
		DeveloperID: req.DeveloperID,
		APPID:       req.ProjectID,
		PluginType:  req.PluginType,
		Manifest:    mf,
		OpenapiDoc:  doc,
	}

	res, err := p.pluginRepo.CreateDraftPlugin(ctx, &repository.CreateDraftPluginRequest{
		Plugin: pl,
	})
	if err != nil {
		return nil, err
	}

	return &CreateDraftPluginResponse{
		PluginID: res.PluginID,
	}, nil
}

func (p *pluginServiceImpl) GetDraftPlugin(ctx context.Context, req *GetDraftPluginRequest) (resp *GetDraftPluginResponse, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", req.PluginID)
	}

	return &GetDraftPluginResponse{
		Plugin: pl,
	}, nil
}

func (p *pluginServiceImpl) MGetDraftPlugins(ctx context.Context, req *MGetDraftPluginsRequest) (resp *MGetDraftPluginsResponse, err error) {
	plugins, err := p.pluginRepo.MGetDraftPlugins(ctx, req.PluginIDs)
	if err != nil {
		return nil, err
	}
	return &MGetDraftPluginsResponse{
		Plugins: plugins,
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

	apiSchemas := make(map[entity.UniqueToolAPI]*entity.Openapi3Operation, len(doc.Paths))
	apis := make([]entity.UniqueToolAPI, 0, len(doc.Paths))

	for subURL, pathItem := range doc.Paths {
		for method, operation := range pathItem.Operations() {
			api := entity.UniqueToolAPI{
				SubURL: subURL,
				Method: method,
			}
			apiSchemas[api] = ptr.Of(entity.Openapi3Operation(*operation))
			apis = append(apis, api)
		}
	}

	oldDraftTools, err := p.pluginRepo.GetPluginAllDraftTools(ctx, req.PluginID)
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

	if draftPlugin.GetIconURI() != mf.LogoURL {
		return fmt.Errorf("icon uri cannot be updated by code")
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
			oldTool.ActivatedStatus = ptr.Of(consts.DeactivateTool)
		}
	}

	newDraftTools := make([]*entity.ToolInfo, 0, len(apis))
	for api, newOp := range apiSchemas {
		oldTool, ok := oldDraftToolsMap[api]
		if ok { // 2. 更新 tool -> 覆盖
			oldTool.ActivatedStatus = ptr.Of(consts.ActivateTool)
			oldTool.Operation = newOp
			if needResetDebugStatusTool(ctx, newOp, oldTool.Operation) {
				oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
			}
			continue
		}

		// 3. 新增 tool
		newDraftTools = append(newDraftTools, &entity.ToolInfo{
			PluginID:        req.PluginID,
			ActivatedStatus: ptr.Of(consts.ActivateTool),
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

func needResetDebugStatusTool(_ context.Context, nt, ot *entity.Openapi3Operation) bool {
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
	if nsc.Extensions[consts.APISchemaExtendAssistType] != osc.Extensions[consts.APISchemaExtendAssistType] {
		return false
	}
	if nsc.Extensions[consts.APISchemaExtendGlobalDisable] != osc.Extensions[consts.APISchemaExtendGlobalDisable] {
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

	newPlugin := &entity.PluginInfo{
		ID:         req.PluginID,
		IconURI:    ptr.Of(req.Icon.URI),
		ServerURL:  req.URL,
		Manifest:   mf,
		OpenapiDoc: doc,
	}

	if newPlugin.GetServerURL() == "" ||
		oldPlugin.GetServerURL() == newPlugin.GetServerURL() {
		return p.pluginRepo.UpdateDraftPluginWithoutURLChanged(ctx, newPlugin)
	}

	return p.pluginRepo.UpdateDraftPlugin(ctx, newPlugin)
}

func updatePluginOpenapiDoc(_ context.Context, doc *entity.Openapi3T, req *UpdateDraftPluginRequest) (*entity.Openapi3T, error) {
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
			mf.CommonParams = make(map[consts.HTTPParamLocation][]*entity.CommonParamSchema, len(req.CommonParams))
		}
		for loc, params := range req.CommonParams {
			location, ok := convertor.ToHTTPParamLocation(loc)
			if !ok {
				return nil, fmt.Errorf("invalid location '%s'", loc.String())
			}
			commonParams := make([]*entity.CommonParamSchema, 0, len(params))
			for _, param := range params {
				commonParams = append(commonParams, &entity.CommonParamSchema{
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

func convertPluginAuthInfoToAuthV2(authInfo *PluginAuthInfo) (*entity.AuthV2, error) {
	if authInfo.AuthType == nil {
		return nil, fmt.Errorf("auth type is empty")
	}

	switch *authInfo.AuthType {
	case consts.AuthTypeOfNone:
		return &entity.AuthV2{
			Type: consts.AuthTypeOfNone,
		}, nil

	case consts.AuthTypeOfOAuth:
		if authInfo.OauthInfo == nil || *authInfo.OauthInfo == "" {
			return nil, fmt.Errorf("oauth info is empty")
		}

		oauthInfo := make(map[string]string)
		err := sonic.Unmarshal([]byte(*authInfo.OauthInfo), &oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("unmarshal oauth info failed, err=%v", err)
		}

		contentType := oauthInfo["authorization_content_type"]
		if contentType != consts.MIMETypeJson { // only support application/json
			return nil, fmt.Errorf("invalid authorization content type '%s'", contentType)
		}

		_oauthInfo := &entity.AuthOfOAuth{
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

		return &entity.AuthV2{
			Type:    consts.AuthTypeOfOAuth,
			Payload: &str,
		}, nil

	case consts.AuthTypeOfService:
		if authInfo.AuthSubType == nil {
			return nil, fmt.Errorf("auth sub type is empty")
		}

		switch *authInfo.AuthSubType {
		case consts.AuthSubTypeOfToken:
			if authInfo.Location == nil {
				return nil, fmt.Errorf("location is empty")
			}
			if authInfo.ServiceToken == nil {
				return nil, fmt.Errorf("service token is empty")
			}
			if authInfo.Key == nil {
				return nil, fmt.Errorf("key is empty")
			}

			tokenAuth := &entity.AuthOfToken{
				ServiceToken: *authInfo.ServiceToken,
				Location:     *authInfo.Location,
				Key:          *authInfo.Key,
			}

			str, err := sonic.MarshalString(tokenAuth)
			if err != nil {
				return nil, fmt.Errorf("marshal token auth failed, err=%v", err)
			}

			return &entity.AuthV2{
				Type:    consts.AuthTypeOfService,
				SubType: consts.AuthSubTypeOfToken,
				Payload: &str,
			}, nil

		case consts.AuthSubTypeOfOIDC:
			if authInfo.AuthPayload == nil || *authInfo.AuthPayload == "" {
				return nil, fmt.Errorf("auth payload is empty")
			}

			oidcAuth := &entity.AuthOfOIDC{}
			err := sonic.UnmarshalString(*authInfo.AuthPayload, &oidcAuth)
			if err != nil {
				return nil, fmt.Errorf("unmarshal oidc auth info failed, err=%v", err)
			}

			return &entity.AuthV2{
				Type:    consts.AuthTypeOfService,
				SubType: consts.AuthSubTypeOfToken,
				Payload: authInfo.AuthPayload,
			}, nil

		default:
			return nil, fmt.Errorf("invalid sub auth type '%s'", *authInfo.AuthSubType)
		}

	default:
		return nil, fmt.Errorf("invalid auth type '%v'", authInfo.AuthType)
	}
}

func (p *pluginServiceImpl) DeleteDraftPlugin(ctx context.Context, req *DeleteDraftPluginRequest) (err error) {
	return p.pluginRepo.DeleteDraftPlugin(ctx, req.PluginID)
}

func (p *pluginServiceImpl) GetGetOnlinePlugin(ctx context.Context, req *GetOnlinePluginRequest) (resp *GetOnlinePluginResponse, err error) {
	pl, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online plugin '%d' not found", req.PluginID)
	}

	return &GetOnlinePluginResponse{
		Plugin: pl,
	}, nil
}

func (p *pluginServiceImpl) MGetOnlinePlugins(ctx context.Context, req *MGetOnlinePluginsRequest) (resp *MGetOnlinePluginsResponse, err error) {
	plugins, err := p.pluginRepo.MGetOnlinePlugins(ctx, req.PluginIDs)
	if err != nil {
		return nil, err
	}

	return &MGetOnlinePluginsResponse{
		Plugins: plugins,
	}, nil
}

func (p *pluginServiceImpl) GetPluginNextVersion(ctx context.Context, req *GetPluginNextVersionRequest) (resp *GetPluginNextVersionResponse, err error) {
	pl, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return &GetPluginNextVersionResponse{
			Version: "v1.0.0",
		}, nil
	}

	const defaultVersion = "v1.0.0"

	parts := strings.Split(pl.GetVersion(), ".") // Remove the 'v' and split
	if len(parts) < 3 {
		logs.CtxErrorf(ctx, "invalid version format '%s'", pl.GetVersion())
		return &GetPluginNextVersionResponse{
			Version: defaultVersion,
		}, nil
	}

	patch, err := strconv.ParseInt(parts[3], 10, 64)
	if err != nil {
		logs.CtxErrorf(ctx, "invalid version format '%s'", pl.GetVersion())
		return &GetPluginNextVersionResponse{
			Version: defaultVersion,
		}, nil
	}

	parts[3] = strconv.FormatInt(patch+1, 10)
	nextVersion := strings.Join(parts, ".")

	return &GetPluginNextVersionResponse{
		Version: nextVersion,
	}, nil
}

func (p *pluginServiceImpl) PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft plugin draft '%d' not found", req.PluginID)
	}

	draftPlugin.Version = &req.Version
	draftPlugin.VersionDesc = &req.VersionDesc

	onlinePlugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	} else if exist && onlinePlugin.Version != nil {
		if semver.Compare(*draftPlugin.Version, *onlinePlugin.Version) != 1 {
			return fmt.Errorf("invalid version")
		}
	}

	err = p.pluginRepo.PublishPlugin(ctx, draftPlugin)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) MGetVersionPlugins(ctx context.Context, req *MGetVersionPluginsRequest) (resp *MGetVersionPluginsResponse, err error) {
	plugins, err := p.pluginRepo.MGetVersionPlugins(ctx, req.VersionPlugins)
	if err != nil {
		return nil, err
	}

	return &MGetVersionPluginsResponse{
		Plugins: plugins,
	}, nil
}

func (p *pluginServiceImpl) MGetDraftTools(ctx context.Context, req *MGetDraftToolsRequest) (resp *MGetDraftToolsResponse, err error) {
	tools, err := p.toolRepo.MGetDraftTools(ctx, req.ToolIDs)
	if err != nil {
		return nil, err
	}

	resp = &MGetDraftToolsResponse{
		Tools: tools,
	}

	return resp, nil
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

	var activatedStatus *consts.ActivatedStatus
	if req.Disabled != nil {
		if *req.Disabled {
			activatedStatus = ptr.Of(consts.DeactivateTool)
		} else {
			activatedStatus = ptr.Of(consts.ActivateTool)
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
		mType, ok := req.RequestBody.Value.Content[consts.MIMETypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in request body", consts.MIMETypeJson)
		}
		if op.RequestBody.Value.Content == nil {
			op.RequestBody.Value.Content = map[string]*openapi3.MediaType{}
		}
		op.RequestBody.Value.Content[consts.MIMETypeJson] = mType
	}

	if req.Responses != nil {
		newRespRef, ok := req.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
		}
		newMIMEType, ok := newRespRef.Value.Content[consts.MIMETypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in responses", consts.MIMETypeJson)
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

		oldRespRef.Value.Content[consts.MIMETypeJson] = newMIMEType
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

func (p *pluginServiceImpl) GetOnlineTool(ctx context.Context, req *GetOnlineToolsRequest) (resp *GetOnlineToolsResponse, err error) {
	tool, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online tool '%d' not found", req.ToolID)
	}

	return &GetOnlineToolsResponse{
		Tool: tool,
	}, nil
}

func (p *pluginServiceImpl) MGetOnlineTools(ctx context.Context, req *MGetOnlineToolsRequest) (resp *MGetOnlineToolsResponse, err error) {
	tools, err := p.toolRepo.MGetOnlineTools(ctx, req.ToolIDs)
	if err != nil {
		return nil, err
	}

	return &MGetOnlineToolsResponse{
		Tools: tools,
	}, nil
}

func (p *pluginServiceImpl) BindAgentTools(ctx context.Context, req *BindAgentToolsRequest) (err error) {
	return p.toolRepo.BindDraftAgentTools(ctx, req.AgentID, req.ToolIDs)
}

func (p *pluginServiceImpl) GetDraftAgentTool(ctx context.Context, req *GetDraftAgentToolRequest) (resp *GetAgentToolResponse, err error) {
	draftAgentTool, exist, err := p.toolRepo.GetDraftAgentToolWithToolName(ctx, &repository.GetDraftAgentToolWithToolNameRequest{
		AgentID:  req.AgentID,
		ToolName: req.ToolName,
	})
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("agent tool '%s' not found", req.ToolName)
	}

	tool, exist, err := p.toolRepo.GetOnlineTool(ctx, draftAgentTool.ID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online tool '%s' not found", req.ToolName)
	}

	op, err := syncToAgentTool(ctx, tool.Operation, draftAgentTool.Operation)
	if err != nil {
		return nil, err
	}

	draftAgentTool.Operation = op

	return &GetAgentToolResponse{
		Tool: draftAgentTool,
	}, nil
}

func syncToAgentTool(ctx context.Context, dest, src *entity.Openapi3Operation) (*entity.Openapi3Operation, error) {
	newParameters, err := syncParameters(ctx, dest.Parameters, src.Parameters)
	if err != nil {
		return nil, err
	}

	dest.Parameters = newParameters

	newReqBody, err := syncRequestBody(ctx, dest.RequestBody.Value, src.RequestBody.Value)
	if err != nil {
		return nil, err
	}

	dest.RequestBody.Value = newReqBody

	newRespBody, err := syncResponseBody(ctx, dest.Responses, src.Responses)
	if err != nil {
		return nil, err
	}

	dest.Responses = newRespBody

	return dest, nil
}

func syncParameters(ctx context.Context, dest, src openapi3.Parameters) (openapi3.Parameters, error) {
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

func syncRequestBody(ctx context.Context, dest, src *openapi3.RequestBody) (*openapi3.RequestBody, error) {
	for ct, dm := range dest.Content {
		sm, ok := src.Content[ct]
		if !ok {
			continue
		}

		nv, err := syncMediaSchema(ctx, dm.Schema.Value, sm.Schema.Value)
		if err != nil {
			return nil, err
		}

		dm.Schema.Value = nv
	}

	return dest, nil
}

func syncMediaSchema(ctx context.Context, dest, src *openapi3.Schema) (*openapi3.Schema, error) {
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

			nv, err := syncMediaSchema(ctx, dv.Value, sv.Value)
			if err != nil {
				return nil, err
			}

			dv.Value = nv
		}

		return dest, nil
	case openapi3.TypeArray:
		nv, err := syncMediaSchema(ctx, dest.Items.Value, src.Items.Value)
		if err != nil {
			return nil, err
		}

		dest.Items.Value = nv

		return dest, nil
	default:
		return dest, nil
	}
}

func syncResponseBody(ctx context.Context, dest, src openapi3.Responses) (openapi3.Responses, error) {
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

			nv, err := syncMediaSchema(ctx, dm.Schema.Value, sm.Schema.Value)
			if err != nil {
				return nil, err
			}

			dm.Schema.Value = nv
		}
	}

	return dest, nil
}

func (p *pluginServiceImpl) MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (resp *MGetAgentToolsResponse, err error) {
	toolIDs := make([]int64, 0, len(req.VersionAgentTools))
	for _, v := range req.VersionAgentTools {
		toolIDs = append(toolIDs, v.ToolID)
	}
	existMap, err := p.toolRepo.CheckOnlineToolsExist(ctx, toolIDs)
	if err != nil {
		return nil, err
	}
	if len(existMap) == 0 {
		return &MGetAgentToolsResponse{
			Tools: []*entity.ToolInfo{},
		}, nil
	}

	if req.IsDraft {
		existToolIDs := make([]int64, 0, len(existMap))
		for _, v := range req.VersionAgentTools {
			if existMap[v.ToolID] {
				existToolIDs = append(existToolIDs, v.ToolID)
			}
		}

		tools, err := p.toolRepo.MGetDraftAgentTools(ctx, &repository.MGetDraftAgentToolsRequest{
			AgentID: req.AgentID,
			ToolIDs: existToolIDs,
		})
		if err != nil {
			return nil, err
		}

		return &MGetAgentToolsResponse{
			Tools: tools,
		}, nil
	}

	vTools := make([]entity.VersionAgentTool, 0, len(existMap))
	for _, v := range req.VersionAgentTools {
		if existMap[v.ToolID] {
			vTools = append(vTools, v)
		}
	}

	tools, err := p.toolRepo.MGetVersionAgentTool(ctx, req.AgentID, vTools)
	if err != nil {
		return nil, err
	}

	return &MGetAgentToolsResponse{
		Tools: tools,
	}, nil
}

func (p *pluginServiceImpl) PublishAgentTools(ctx context.Context, req *PublishAgentToolsRequest) (resp *PublishAgentToolsResponse, err error) {
	tools, err := p.toolRepo.GetSpaceAllDraftAgentTools(ctx, req.AgentID)
	if err != nil {
		return nil, err
	}

	res, err := p.toolRepo.BatchCreateVersionAgentTools(ctx, req.AgentID, tools)
	if err != nil {
		return nil, err
	}

	versionTools := make(map[int64]entity.VersionAgentTool, len(tools))
	for _, tl := range tools {
		vs, ok := res[tl.ID]
		if !ok {
			return nil, fmt.Errorf("tool '%d' not found", tl.ID)
		}
		versionTools[tl.ID] = entity.VersionAgentTool{
			ToolID:    tl.ID,
			ToolName:  ptr.Of(tl.GetName()),
			VersionMs: &vs,
		}
	}

	return &PublishAgentToolsResponse{
		VersionTools: versionTools,
	}, nil
}

func (p *pluginServiceImpl) UpdateBotDefaultParams(ctx context.Context, req *UpdateBotDefaultParamsRequest) (err error) {
	exist, err := p.pluginRepo.CheckOnlinePluginExist(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("online plugin '%d' not found", req.PluginID)
	}

	draftAgentTool, exist, err := p.toolRepo.GetDraftAgentToolWithToolName(ctx, &repository.GetDraftAgentToolWithToolNameRequest{
		AgentID:  req.AgentID,
		ToolName: req.ToolName,
	})
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
		mType, ok := req.RequestBody.Value.Content[consts.MIMETypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in request body", consts.MIMETypeJson)
		}
		if op.RequestBody.Value.Content == nil {
			op.RequestBody.Value.Content = map[string]*openapi3.MediaType{}
		}
		op.RequestBody.Value.Content[consts.MIMETypeJson] = mType
	}

	if req.Responses != nil {
		newRespRef, ok := req.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
		}
		newMIMEType, ok := newRespRef.Value.Content[consts.MIMETypeJson]
		if !ok {
			return fmt.Errorf("the '%s' media type is not defined in responses", consts.MIMETypeJson)
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

		oldRespRef.Value.Content[consts.MIMETypeJson] = newMIMEType
	}

	updatedTool := &entity.ToolInfo{
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

func (p *pluginServiceImpl) ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *ExecuteToolResponse, err error) {
	execOpts := &entity.ExecuteOptions{}
	for _, opt := range opts {
		opt(execOpts)
	}

	var (
		tl    *entity.ToolInfo
		pl    *entity.PluginInfo
		exist bool
	)
	switch req.ExecScene {
	case consts.ExecSceneOfToolDebug:
		tl, exist, err = p.toolRepo.GetDraftTool(ctx, req.ToolID)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("draft tool '%d' not found", req.ToolID)
		}

		pl, exist, err = p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("draft plugin '%d' not found", req.PluginID)
		}

		if tl.GetActivatedStatus() != consts.ActivateTool {
			return nil, fmt.Errorf("tool '%s' is not activated", tl.GetName())
		}

	case consts.ExecSceneOfAgentOnline:
		if execOpts.AgentID == 0 {
			return nil, fmt.Errorf("invalid agentID")
		}

		tl, exist, err = p.toolRepo.GetVersionAgentTool(ctx, execOpts.AgentID, entity.VersionAgentTool{
			ToolID:    req.ToolID,
			VersionMs: ptr.Of(execOpts.AgentToolVersion),
		})
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
		}

		if execOpts.Version == "" {
			pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
			if err != nil {
				return nil, err
			}
			if !exist {
				return nil, fmt.Errorf("online plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
			}
		} else {
			pl, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
				PluginID: req.PluginID,
				Version:  execOpts.Version,
			})
			if err != nil {
				return nil, err
			}
			if !exist {
				return nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
			}
		}

	case consts.ExecSceneOfAgentDraft:
		if execOpts.Version == "" {
			pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
			if err != nil {
				return nil, err
			}
			if !exist {
				return nil, fmt.Errorf("online plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
			}
		} else {
			pl, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
				PluginID: req.PluginID,
				Version:  execOpts.Version,
			})
			if err != nil {
				return nil, err
			}
			if !exist {
				return nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
			}
		}

		if execOpts.AgentID == 0 {
			return nil, fmt.Errorf("invalid agentID")
		}
		if execOpts.SpaceID == 0 {
			return nil, fmt.Errorf("invalid userID")
		}

		tl, exist, err = p.toolRepo.GetDraftAgentTool(ctx, &repository.GetDraftAgentToolRequest{
			AgentID: execOpts.AgentID,
			ToolID:  req.ToolID,
		})
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
		}

	case consts.ExecSceneOfWorkflow:
		if execOpts.Version == "" {
			pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
			if err != nil {
				return nil, err
			}
			if !exist {
				return nil, fmt.Errorf("online plugin '%d' not found", req.PluginID)
			}
		} else {
			pl, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
				PluginID: req.PluginID,
				Version:  execOpts.Version,
			})
			if err != nil {
				return nil, err
			}
			if !exist {
				return nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
			}
		}

		tl, exist, err = p.toolRepo.GetVersionTool(ctx, entity.VersionTool{
			ToolID:  req.ToolID,
			Version: ptr.Of(execOpts.Version),
		})
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("tool '%d' with version '%s' not found", req.ToolID, execOpts.Version)
		}

	default:
		return nil, fmt.Errorf("invalid exec scene")
	}

	if execOpts.Operation != nil {
		err = tl.Operation.Validate()
		if err != nil {
			return nil, fmt.Errorf("tool operation validates failed, err=%v", err)
		}
		tl.Operation = execOpts.Operation
	}

	config := &plugin.ExecutorConfig{
		Plugin:                     pl,
		Tool:                       tl,
		InvalidRespProcessStrategy: execOpts.InvalidRespProcessStrategy,
	}
	executor, err := plugin.NewExecutor(ctx, config)
	if err != nil {
		return nil, err
	}

	result, err := executor.Execute(ctx, req.ArgumentsInJson)
	if err != nil {
		return nil, err
	}

	if req.ExecScene == consts.ExecSceneOfToolDebug {
		err = p.toolRepo.UpdateDraftTool(ctx, &entity.ToolInfo{
			ID:          req.ToolID,
			DebugStatus: ptr.Of(common.APIDebugStatus_DebugPassed),
		})
		if err != nil {
			return nil, err
		}
	}

	return &ExecuteToolResponse{
		Tool:        tl,
		RawResp:     result.RawResp,
		TrimmedResp: result.TrimmedResp,
	}, nil
}

func (p *pluginServiceImpl) ListPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error) {
	plugins := slices.Transform(pluginConf.GetAllPluginProducts(), func(p *pluginConf.PluginInfo) *entity.PluginInfo {
		return p.Info
	})
	sort.Slice(plugins, func(i, j int) bool {
		return plugins[i].GetRefProductID() < plugins[j].GetRefProductID()
	})

	return &ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
	}, nil
}
