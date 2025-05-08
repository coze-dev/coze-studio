package application

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"

	pluginAPI "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/plugin_develop"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var PluginSVC = &Plugin{}

type Plugin struct{}

func (p *Plugin) GetOAuthSchema(ctx context.Context, req *pluginAPI.GetOAuthSchemaRequest) (resp *pluginAPI.GetOAuthSchemaResponse, err error) {
	oauthSchema := `
[
    {
        "key": "standard",
        "value": 4,
        "label": "standard",
        "items": [
            {
                "key":"client_id",
                "type": "text", 
                "max_len": 100,
                "required": true
            },
            {
                "key": "client_secret",
                "type": "text",
                "max_len": 100,
                "required": true
            },
            {
                "key": "client_url",
                "type": "url",
                "required": true
            },
            {
                "key": "scope",
                "type": "text",
                "max_len": 500
            },
            {
                "key": "authorization_url",
                "type": "url",
                "required": true
            },
            {
                "key": "authorization_content_type",
                "type": "text",
                "default": consts.MIMETypeJson,
                "required": true
            }
        ]
    }
]
`
	return &pluginAPI.GetOAuthSchemaResponse{
		OauthSchema: oauthSchema,
	}, nil
}

func (p *Plugin) GetPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (resp *pluginAPI.GetPlaygroundPluginListResponse, err error) {
	r := &plugin.ListPluginsRequest{
		SpaceID: req.GetSpaceID(),
		PageInfo: entity.PageInfo{
			Page: int(req.GetPage()),
			Size: int(req.GetSize()),
			SortBy: func() entity.SortField {
				if req.GetOrderBy() == 0 {
					return entity.SortByUpdatedAt
				}
				return entity.SortByCreatedAt
			}(),
		},
	}
	res, err := pluginDomainSVC.ListPlugins(ctx, r)
	if err != nil {
		return nil, err
	}

	pluginLists := make([]*common.PluginInfoForPlayground, 0, len(res.Plugins))
	for _, pl := range res.Plugins {
		r := &plugin.GetAllToolsRequest{
			PluginID: pl.ID,
		}
		toolsRes, err := pluginDomainSVC.GetAllTools(ctx, r)
		if err != nil {
			return nil, err
		}

		pluginInfo, err := toPluginInfoForPlayground(pl, toolsRes.Tools)
		if err != nil {
			return nil, err
		}

		pluginLists = append(pluginLists, pluginInfo)
	}

	resp.Data = &common.GetPlaygroundPluginListData{
		Total:      int32(res.Total),
		PluginList: pluginLists,
	}

	return resp, nil
}

func toPluginInfoForPlayground(pl *entity.PluginInfo, tools []*entity.ToolInfo) (*common.PluginInfoForPlayground, error) {
	pluginAPIs := make([]*common.PluginApi, 0, len(tools))
	for _, tl := range tools {
		params, err := tl.ToPluginParameters()
		if err != nil {
			return nil, err
		}

		pluginAPIs = append(pluginAPIs, &common.PluginApi{
			APIID:      strconv.FormatInt(tl.ID, 10),
			Name:       tl.GetName(),
			Desc:       tl.GetDesc(),
			PluginID:   strconv.FormatInt(pl.ID, 10),
			PluginName: pl.GetName(),
			RunMode:    common.RunMode_Sync, // TODO(@maronghong): 区分同步和异步模式
			Parameters: params,
		})
	}

	pluginInfo := &common.PluginInfoForPlayground{
		Auth:           0,
		CreateTime:     strconv.FormatInt(pl.CreatedAt/1000, 10),
		CreationMethod: common.CreationMethod_COZE,
		Creator:        common.NewCreator(),
		DescForHuman:   pl.GetDesc(),
		ID:             strconv.FormatInt(pl.ID, 10),
		IsOfficial:     false,
		MaterialID:     strconv.FormatInt(pl.ID, 10),
		Name:           pl.GetName(),
		PluginIcon:     pl.GetIconURI(),
		PluginType:     pl.PluginType,
		SpaceID:        strconv.FormatInt(pl.SpaceID, 10),
		StatisticData:  common.NewPluginStatisticData(), // TODO(@maronghong): 引用计数
		Status:         common.PluginStatus_SUBMITTED,   // TODO(@maronghong): 确认含义
		UpdateTime:     strconv.FormatInt(pl.UpdatedAt/1000, 10),
		VersionName:    pl.GetVersion(),
		PluginApis:     pluginAPIs,
	}

	return pluginInfo, nil
}

func (p *Plugin) RegisterPluginMeta(ctx context.Context, req *pluginAPI.RegisterPluginMetaRequest) (resp *pluginAPI.RegisterPluginMetaResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	// TODO(@maronghong): 补充 auth
	manifest := entity.NewDefaultPluginManifest()
	manifest.NameForModel = req.Name
	manifest.DescriptionForModel = req.Desc
	//manifest.LogoURL = req.Icon.URI
	for loc, params := range req.CommonParams {
		location, ok := convertor.ToHTTPParamLocation(loc)
		if !ok {
			return nil, fmt.Errorf("invalid location '%s'", loc.String())
		}
		for _, param := range params {
			mParams := manifest.CommonParams[location]
			mParams = append(mParams, &entity.CommonParamSchema{
				Name:  param.Name,
				Value: param.Value,
			})
		}
	}

	doc := entity.NewDefaultOpenapiDoc()
	doc.Servers = append(doc.Servers, &openapi3.Server{
		URL: req.GetURL(),
	})
	doc.Info.Title = req.Name
	doc.Info.Description = req.Desc

	pl := &entity.PluginInfo{
		//IconURI:     ptr.Of(req.Icon.URI),
		SpaceID:     req.SpaceID,
		ServerURL:   req.URL,
		DeveloperID: *userID,
		PluginType:  req.GetPluginType(),
		Manifest:    manifest,
		OpenapiDoc:  doc,
	}

	r := &plugin.CreatePluginDraftRequest{
		Plugin: pl,
	}
	res, err := pluginDomainSVC.CreatePluginDraft(ctx, r)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.RegisterPluginMetaResponse{
		PluginID: res.PluginID,
	}

	return resp, nil
}

func (p *Plugin) GetPluginAPIs(ctx context.Context, req *pluginAPI.GetPluginAPIsRequest) (resp *pluginAPI.GetPluginAPIsResponse, err error) {
	r := &plugin.ListDraftToolsRequest{
		PluginID: req.PluginID,
		PageInfo: entity.PageInfo{
			Page:   int(req.Page),
			Size:   int(req.Size),
			SortBy: entity.SortByUpdatedAt,
		},
	}
	tools, err := pluginDomainSVC.ListDraftTools(ctx, r)
	if err != nil {
		return nil, err
	}

	apis := make([]*common.PluginAPIInfo, 0, len(tools.Tools))
	for _, tool := range tools.Tools {
		method, ok := convertor.ToThriftAPIMethod(tool.GetMethod())
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

		apis = append(apis, &common.PluginAPIInfo{
			APIID:       strconv.FormatInt(tool.ID, 10),
			CreateTime:  strconv.FormatInt(tool.CreatedAt/1000, 10),
			DebugStatus: tool.GetDebugStatus(),
			Desc:        tool.GetDesc(),
			Disabled: func() bool {
				if tool.GetActivatedStatus() == consts.DeactivateTool {
					return true
				}
				return false
			}(),
			Method:         method,
			Name:           tool.GetName(),
			OnlineStatus:   common.OnlineStatus_ONLINE,
			Path:           tool.GetSubURL(),
			PluginID:       strconv.FormatInt(tool.PluginID, 10),
			RequestParams:  reqParams,
			ResponseParams: respParams,
			StatisticData:  common.NewPluginStatisticData(), // TODO(@maronghong): 补充统计数据
		})
	}

	resp = &pluginAPI.GetPluginAPIsResponse{
		APIInfo: apis,
		Total:   int32(tools.Total),
	}

	return resp, nil
}

func (p *Plugin) GetPluginInfo(ctx context.Context, req *pluginAPI.GetPluginInfoRequest) (resp *pluginAPI.GetPluginInfoResponse, err error) {
	plDraft, exist, err := pluginDraftRepo.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	tools, err := toolDraftRepo.GetAll(ctx, plDraft.ID)
	if err != nil {
		return nil, err
	}

	paths := openapi3.Paths{}
	for _, tool := range tools {
		if tool.GetActivatedStatus() == consts.DeactivateTool {
			continue
		}
		item := &openapi3.PathItem{}
		item.SetOperation(tool.GetMethod(), tool.Operation)
		paths[tool.GetSubURL()] = item
	}
	plDraft.OpenapiDoc.Paths = paths

	commonParams := make(map[common.ParameterLocation][]*common.CommonParamSchema, len(plDraft.Manifest.CommonParams))
	for loc, params := range plDraft.Manifest.CommonParams {
		location, ok := convertor.ToThriftHTTPParamLocation(loc)
		if !ok {
			return nil, fmt.Errorf("invalid location '%s'", loc)
		}
		commonParams[location] = make([]*common.CommonParamSchema, 0, len(params))
		for _, param := range params {
			commonParams[location] = append(commonParams[location], &common.CommonParamSchema{
				Name:  param.Name,
				Value: param.Value,
			})
		}
	}

	metaInfo := &common.PluginMetaInfo{
		Name: plDraft.GetName(),
		Desc: plDraft.GetDesc(),
		Icon: &common.PluginIcon{
			URI: plDraft.GetIconURI(),
		},
		AuthType:     []common.AuthorizationType{common.AuthorizationType_None},
		CommonParams: commonParams,
	}

	manifestStr, err := sonic.MarshalString(plDraft.Manifest)
	if err != nil {
		return nil, err
	}

	docStr, err := sonic.MarshalString(plDraft.OpenapiDoc)
	if err != nil {
		return nil, err
	}

	codeInfo := &common.CodeInfo{
		OpenapiDesc: docStr,
		PluginDesc:  manifestStr,
	}

	resp = &pluginAPI.GetPluginInfoResponse{
		MetaInfo:      metaInfo,
		CodeInfo:      codeInfo,
		Creator:       common.NewCreator(),
		StatisticData: common.NewPluginStatisticData(),
		PluginType:    plDraft.PluginType,
	}

	return resp, nil
}

func (p *Plugin) GetUpdatedAPIs(ctx context.Context, req *pluginAPI.GetUpdatedAPIsRequest) (resp *pluginAPI.GetUpdatedAPIsResponse, err error) {
	draftRes, err := pluginDomainSVC.GetAllTools(ctx, &plugin.GetAllToolsRequest{
		PluginID: req.PluginID,
		Draft:    true,
	})
	if err != nil {
		return nil, err
	}

	onlineRes, err := pluginDomainSVC.GetAllTools(ctx, &plugin.GetAllToolsRequest{
		PluginID: req.PluginID,
		Draft:    false,
	})
	if err != nil {
		return nil, err
	}

	var updatedToolName, createdToolName, delToolName []string

	draftMap := slices.ToMap(draftRes.Tools, func(e *entity.ToolInfo) (string, *entity.ToolInfo) {
		return e.GetName(), e
	})
	onlineMap := slices.ToMap(onlineRes.Tools, func(e *entity.ToolInfo) (string, *entity.ToolInfo) {
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
			logs.CtxErrorf(ctx, "marshal online tool operation failed, id=%d, err=%v", ot.ID, err)

			updatedToolName = append(updatedToolName, name)
			continue
		}
		ds, err := sonic.MarshalString(dt.Operation)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal draft tool operation failed, id=%d, err=%v", ot.ID, err)

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

func (p *Plugin) GetUserAuthority(ctx context.Context, req *pluginAPI.GetUserAuthorityRequest) (resp *pluginAPI.GetUserAuthorityResponse, err error) {
	// TDOO(@maronghong): 完善逻辑
	resp = &pluginAPI.GetUserAuthorityResponse{
		Data: &common.GetUserAuthorityData{
			CanEdit:          true,
			CanRead:          true,
			CanDelete:        true,
			CanDebug:         true,
			CanPublish:       true,
			CanReadChangelog: true,
		},
	}

	return resp, nil
}

func (p *Plugin) GetOAuthStatus(ctx context.Context, req *pluginAPI.GetOAuthStatusRequest) (resp *pluginAPI.GetOAuthStatusResponse, err error) {
	// TDOO(@maronghong): 完善逻辑
	resp = &pluginAPI.GetOAuthStatusResponse{
		IsOauth: false,
	}

	return resp, nil
}

func (p *Plugin) CheckAndLockPluginEdit(ctx context.Context, req *pluginAPI.CheckAndLockPluginEditRequest) (resp *pluginAPI.CheckAndLockPluginEditResponse, err error) {
	// TDOO(@maronghong): 完善逻辑
	resp = &pluginAPI.CheckAndLockPluginEditResponse{
		Data: &common.CheckAndLockPluginEditData{
			Seized: true,
		},
	}

	return resp, nil
}

func (p *Plugin) CreateAPI(ctx context.Context, req *pluginAPI.CreateAPIRequest) (resp *pluginAPI.CreateAPIResponse, err error) {
	defaultSubURL := gonanoid.MustID(6)

	tool := &entity.ToolInfo{
		PluginID:        req.PluginID,
		ActivatedStatus: ptr.Of(consts.ActivateTool),
		DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
		SubURL:          ptr.Of("/" + defaultSubURL),
		Method:          ptr.Of(http.MethodGet),
		Operation: &openapi3.Operation{
			Summary:     req.Desc,
			OperationID: req.Name,
			Parameters:  []*openapi3.ParameterRef{},
			RequestBody: &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: map[string]*openapi3.MediaType{},
				},
			},
			Responses: openapi3.Responses{
				strconv.Itoa(http.StatusOK): {
					Value: &openapi3.Response{
						Content: map[string]*openapi3.MediaType{},
					},
				},
			},
			Extensions: map[string]interface{}{
				consts.APISchemaExtendGlobalDisable: false,
			},
		},
	}

	res, err := pluginDomainSVC.CreateToolDraft(ctx, &plugin.CreateToolDraftRequest{
		Tool: tool,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.CreateAPIResponse{
		APIID: strconv.FormatInt(res.ToolID, 10),
	}

	return resp, nil
}

func (p *Plugin) UpdateAPI(ctx context.Context, req *pluginAPI.UpdateAPIRequest) (resp *pluginAPI.UpdateAPIResponse, err error) {
	var method *string
	if m, ok := convertor.ToHTTPMethod(req.GetMethod()); ok {
		method = &m
	}

	updateReq := &plugin.UpdateToolDraftRequest{
		PluginID:       req.PluginID,
		ToolID:         req.APIID,
		Name:           req.Name,
		Desc:           req.Desc,
		SubURL:         req.Path,
		Method:         method,
		ResponseParams: req.ResponseParams,
		RequestParams:  req.RequestParams,
		Disabled:       req.Disabled,
		SaveExample:    req.SaveExample,
		DebugExample:   req.DebugExample,
	}
	err = pluginDomainSVC.UpdateToolDraft(ctx, updateReq)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdateAPIResponse{}

	return resp, nil
}

func (p *Plugin) UpdatePlugin(ctx context.Context, req *pluginAPI.UpdatePluginRequest) (resp *pluginAPI.UpdatePluginResponse, err error) {
	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, err
	}

	manifest := &entity.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, manifest)
	if err != nil {
		return nil, err
	}

	err = pluginDomainSVC.UpdatePluginDraftWithDoc(ctx, &plugin.UpdatePluginDraftWithCodeRequest{
		PluginID:   req.PluginID,
		OpenapiDoc: doc,
		Manifest:   manifest,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdatePluginResponse{
		Data: &common.UpdatePluginData{
			Res: true,
		},
	}

	return resp, nil
}

func (p *Plugin) DeleteAPI(ctx context.Context, req *pluginAPI.DeleteAPIRequest) (resp *pluginAPI.DeleteAPIResponse, err error) {
	err = toolDraftRepo.Delete(ctx, req.APIID)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.DeleteAPIResponse{}

	return resp, nil
}

func (p *Plugin) DelPlugin(ctx context.Context, req *pluginAPI.DelPluginRequest) (resp *pluginAPI.DelPluginResponse, err error) {
	err = pluginDomainSVC.DeletePluginDraft(ctx, &plugin.DeletePluginDraftRequest{
		PluginID: req.PluginID,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.DelPluginResponse{}

	return resp, nil
}

func (p *Plugin) PublishPlugin(ctx context.Context, req *pluginAPI.PublishPluginRequest) (resp *pluginAPI.PublishPluginResponse, err error) {
	err = pluginDomainSVC.PublishPlugin(ctx, &plugin.PublishPluginRequest{
		PluginID:    req.PluginID,
		Version:     req.VersionName,
		VersionDesc: req.VersionDesc,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.PublishPluginResponse{}

	return resp, nil
}

func (p *Plugin) UpdatePluginMeta(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (resp *pluginAPI.UpdatePluginMetaResponse, err error) {
	var authType *consts.AuthType
	if req.AuthType != nil {
		if typ, ok := convertor.ToAuthType(req.GetAuthType()); ok {
			authType = &typ
		}
	}

	var authSubType *consts.AuthSubType
	if req.SubAuthType != nil {
		if typ, ok := convertor.ToAuthSubType(req.GetSubAuthType()); ok {
			authSubType = &typ
		}
	}

	var location *consts.HTTPParamLocation
	if req.Location != nil {
		if *req.Location == common.AuthorizationServiceLocation_Header {
			location = ptr.Of(consts.ParamInHeader)
		} else if *req.Location == common.AuthorizationServiceLocation_Query {
			location = ptr.Of(consts.ParamInQuery)
		} else {
			return nil, fmt.Errorf("invalid location '%s'", req.Location.String())
		}
	}

	updateReq := &plugin.UpdatePluginDraftRequest{
		PluginID:     req.PluginID,
		Name:         req.Name,
		Desc:         req.Desc,
		URL:          req.URL,
		Icon:         req.Icon,
		AuthType:     authType,
		AuthSubType:  authSubType,
		Location:     location,
		Key:          req.Key,
		ServiceToken: req.ServiceToken,
		OauthInfo:    req.OauthInfo,
		CommonParams: req.CommonParams,
		AuthPayload:  req.AuthPayload,
	}
	err = pluginDomainSVC.UpdatePluginDraft(ctx, updateReq)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdatePluginMetaResponse{}

	return resp, nil
}

func (p *Plugin) GetBotDefaultParams(ctx context.Context, req *pluginAPI.GetBotDefaultParamsRequest) (resp *pluginAPI.GetBotDefaultParamsResponse, err error) {
	_, exist, err := pluginRepo.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	res, err := pluginDomainSVC.GetAgentTool(ctx, &plugin.GetAgentToolRequest{
		IsDraft: true,
		AgentToolIdentity: entity.AgentToolIdentity{
			AgentID: req.BotID,
			ToolID:  req.APIID,
			SpaceID: req.SpaceID,
		},
	})
	if err != nil {
		return nil, err
	}

	reqAPIParams, err := res.Tool.ToReqAPIParameter()
	if err != nil {
		return nil, err
	}
	respAPIParams, err := res.Tool.ToRespAPIParameter()
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.GetBotDefaultParamsResponse{
		RequestParams:  reqAPIParams,
		ResponseParams: respAPIParams,
	}

	return resp, nil
}

func (p *Plugin) UpdateBotDefaultParams(ctx context.Context, req *pluginAPI.UpdateBotDefaultParamsRequest) (resp *pluginAPI.UpdateBotDefaultParamsResponse, err error) {
	err = pluginDomainSVC.UpdateBotDefaultParams(ctx, &plugin.UpdateBotDefaultParamsRequest{
		PluginID: req.PluginID,
		Identity: entity.AgentToolIdentity{
			AgentID: req.BotID,
			SpaceID: req.SpaceID,
			ToolID:  req.APIID,
		},
		RequestParams:  req.RequestParams,
		ResponseParams: req.ResponseParams,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdateBotDefaultParamsResponse{}

	return resp, nil
}

func (p *Plugin) DebugAPI(ctx context.Context, req *pluginAPI.DebugAPIRequest) (resp *pluginAPI.DebugAPIResponse, err error) {
	res, err := pluginDomainSVC.ExecuteTool(ctx, &plugin.ExecuteToolRequest{
		PluginID:        req.PluginID,
		ToolID:          req.APIID,
		ExecScene:       consts.ExecSceneOfToolDebug,
		ArgumentsInJson: req.Parameters,
	})

	success := true
	reason := ""
	if err != nil {
		reason = fmt.Sprintf("execute tool failed, err=%v", err)
		logs.CtxErrorf(ctx, reason)
		success = false
	}

	respParams, err := res.Tool.ToRespAPIParameter()
	if err != nil {
		reason = err.Error()
		logs.CtxErrorf(ctx, reason)
		success = false
	}

	resp = &pluginAPI.DebugAPIResponse{
		Success:        success,
		Reason:         reason,
		Resp:           res.TrimmedResp,
		RawResp:        res.RawResp,
		ResponseParams: respParams,
	}

	return resp, nil
}
