package plugin

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"
	"gopkg.in/yaml.v3"

	productCommon "code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_common"
	productAPI "code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_public_api"
	pluginAPI "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/plugin_develop"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	resCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/application/base/pluginutil"
	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	commonConsts "code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var PluginApplicationSVC = &PluginApplicationService{}

type PluginApplicationService struct {
	DomainSVC  service.PluginService
	eventbus   search.ResourceEventbus
	oss        storage.Storage
	toolRepo   repository.ToolRepository
	pluginRepo repository.PluginRepository
}

func (p *PluginApplicationService) GetOAuthSchema(ctx context.Context, req *pluginAPI.GetOAuthSchemaRequest) (resp *pluginAPI.GetOAuthSchemaResponse, err error) {
	return &pluginAPI.GetOAuthSchemaResponse{
		OauthSchema: pluginConf.GetOAuthSchema(),
	}, nil
}

func (p *PluginApplicationService) GetPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (resp *pluginAPI.GetPlaygroundPluginListResponse, err error) {
	var (
		onlinePlugins []*entity.PluginInfo
		total         int64
	)
	if len(req.PluginIds) > 0 {
		pluginIDs := make([]int64, 0, len(req.PluginIds))
		for _, id := range req.PluginIds {
			pluginID, err := strconv.ParseInt(id, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid plugin id '%s'", id)
			}
			pluginIDs = append(pluginIDs, pluginID)
		}

		onlinePlugins, err = p.pluginRepo.MGetOnlinePlugins(ctx, pluginIDs)
		if err != nil {
			return nil, err
		}

		total = int64(len(onlinePlugins))

	} else {
		pageInfo := entity.PageInfo{
			Page: int(req.GetPage()),
			Size: int(req.GetSize()),
			SortBy: func() *entity.SortField {
				if req.GetOrderBy() == 0 {
					return ptr.Of(entity.SortByUpdatedAt)
				}
				return ptr.Of(entity.SortByCreatedAt)
			}(),
			OrderByACS: ptr.Of(false),
		}
		onlinePlugins, total, err = p.pluginRepo.ListCustomOnlinePlugins(ctx, req.GetSpaceID(), pageInfo)
		if err != nil {
			return nil, err
		}
	}

	pluginLists := make([]*common.PluginInfoForPlayground, 0, len(onlinePlugins))
	for _, pl := range onlinePlugins {
		tools, err := p.pluginRepo.GetPluginAllOnlineTools(ctx, pl.ID)
		if err != nil {
			return nil, err
		}

		pluginInfo, err := toPluginInfoForPlayground(pl, tools)
		if err != nil {
			return nil, err
		}

		pluginLists = append(pluginLists, pluginInfo)
	}

	resp = &pluginAPI.GetPlaygroundPluginListResponse{
		Data: &common.GetPlaygroundPluginListData{
			Total:      int32(total),
			PluginList: pluginLists,
		},
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

func (p *PluginApplicationService) RegisterPluginMeta(ctx context.Context, req *pluginAPI.RegisterPluginMetaRequest) (resp *pluginAPI.RegisterPluginMetaResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.AuthType == nil {
		return nil, fmt.Errorf("auth type is empty")
	}

	_authType, ok := convertor.ToAuthType(req.GetAuthType())
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%d'", req.GetAuthType())
	}
	authType := ptr.Of(_authType)

	var authSubType *consts.AuthSubType
	if req.SubAuthType != nil {
		_authSubType, ok := convertor.ToAuthSubType(req.GetSubAuthType())
		if !ok {
			return nil, fmt.Errorf("invalid sub auth type '%d'", req.GetSubAuthType())
		}
		authSubType = ptr.Of(_authSubType)
	}

	var loc consts.HTTPParamLocation
	if *authType != consts.AuthTypeOfNone {
		if req.GetLocation() == common.AuthorizationServiceLocation_Query {
			loc = consts.ParamInQuery
		} else if req.GetLocation() == common.AuthorizationServiceLocation_Header {
			loc = consts.ParamInPath
		} else {
			return nil, fmt.Errorf("invalid location '%s'", req.GetLocation())
		}
	}

	r := &service.CreateDraftPluginRequest{
		PluginType:   req.GetPluginType(),
		SpaceID:      req.GetSpaceID(),
		DeveloperID:  *userID,
		IconURI:      req.Icon.URI,
		ProjectID:    req.ProjectID,
		Name:         req.GetName(),
		Desc:         req.GetDesc(),
		ServerURL:    req.GetURL(),
		CommonParams: req.CommonParams,
		AuthInfo: &service.PluginAuthInfo{
			AuthType:     authType,
			Location:     ptr.Of(loc),
			Key:          req.Key,
			ServiceToken: req.ServiceToken,
			OauthInfo:    req.OauthInfo,
			AuthSubType:  authSubType,
			AuthPayload:  req.AuthPayload,
		},
	}
	res, err := p.DomainSVC.CreateDraftPlugin(ctx, r)
	if err != nil {
		return nil, err
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Created,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResID:         res.PluginID,
			Name:          &req.Name,
			SpaceID:       &req.SpaceID,
			OwnerID:       userID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_UnPublished),
			CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.RegisterPluginMetaResponse{
		PluginID: res.PluginID,
	}

	return resp, nil
}

func (p *PluginApplicationService) RegisterPlugin(ctx context.Context, req *pluginAPI.RegisterPluginRequest) (resp *pluginAPI.RegisterPluginResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	mf := &entity.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, &mf)
	if err != nil {
		return nil, err
	}

	mf.LogoURL = commonConsts.DefaultPluginIcon

	doc, err := openapi3.NewLoader().LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, err
	}

	res, err := p.DomainSVC.CreateDraftPluginWithCode(ctx, &service.CreateDraftPluginWithCodeRequest{
		SpaceID:     req.GetSpaceID(),
		DeveloperID: *userID,
		ProjectID:   req.ProjectID,
		Manifest:    mf,
		OpenapiDoc:  ptr.Of(entity.Openapi3T(*doc)),
	})
	if err != nil {
		return nil, err
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Created,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResID:         res.Plugin.ID,
			Name:          ptr.Of(res.Plugin.GetName()),
			SpaceID:       &req.SpaceID,
			OwnerID:       userID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_UnPublished),
			CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.RegisterPluginResponse{
		Data: &common.RegisterPluginData{
			PluginID: res.Plugin.ID,
			Openapi:  req.Openapi,
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) GetPluginAPIs(ctx context.Context, req *pluginAPI.GetPluginAPIsRequest) (resp *pluginAPI.GetPluginAPIsResponse, err error) {
	pl, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("draft plugin '%d' not found", req.PluginID)
	}

	var (
		draftTools []*entity.ToolInfo
		total      int64
	)
	if len(req.APIIds) > 0 {
		toolIDs := make([]int64, 0, len(req.APIIds))
		for _, id := range req.APIIds {
			toolID, err := strconv.ParseInt(id, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid tool id '%s'", id)
			}
			toolIDs = append(toolIDs, toolID)
		}

		draftTools, err = p.toolRepo.MGetDraftTools(ctx, toolIDs)
		if err != nil {
			return nil, err
		}

		total = int64(len(draftTools))

	} else {
		pageInfo := entity.PageInfo{
			Page:       int(req.Page),
			Size:       int(req.Size),
			SortBy:     ptr.Of(entity.SortByCreatedAt),
			OrderByACS: ptr.Of(false),
		}
		draftTools, total, err = p.pluginRepo.ListPluginDraftTools(ctx, req.PluginID, pageInfo)
		if err != nil {
			return nil, err
		}
	}

	apis := make([]*common.PluginAPIInfo, 0, len(draftTools))
	for _, tool := range draftTools {
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

		api := &common.PluginAPIInfo{
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

func (p *PluginApplicationService) GetPluginInfo(ctx context.Context, req *pluginAPI.GetPluginInfoRequest) (resp *pluginAPI.GetPluginInfoResponse, err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	tools, err := p.pluginRepo.GetPluginAllDraftTools(ctx, draftPlugin.ID)
	if err != nil {
		return nil, err
	}

	paths := openapi3.Paths{}
	for _, tool := range tools {
		if tool.GetActivatedStatus() == consts.DeactivateTool {
			continue
		}
		item := &openapi3.PathItem{}
		item.SetOperation(tool.GetMethod(), ptr.Of(openapi3.Operation(*tool.Operation)))
		paths[tool.GetSubURL()] = item
	}
	draftPlugin.OpenapiDoc.Paths = paths

	commonParams := make(map[common.ParameterLocation][]*common.CommonParamSchema, len(draftPlugin.Manifest.CommonParams))
	for loc, params := range draftPlugin.Manifest.CommonParams {
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

	iconURL, err := p.oss.GetObjectUrl(ctx, draftPlugin.GetIconURI())
	if err != nil {
		logs.CtxErrorf(ctx, "get icon url with '%s' failed, err=%v", draftPlugin.GetIconURI(), err)
	}

	metaInfo := &common.PluginMetaInfo{
		Name: draftPlugin.GetName(),
		Desc: draftPlugin.GetDesc(),
		URL:  draftPlugin.GetServerURL(),
		Icon: &common.PluginIcon{
			URI: draftPlugin.GetIconURI(),
			URL: iconURL,
		},
		AuthType:     []common.AuthorizationType{common.AuthorizationType_None},
		CommonParams: commonParams,
	}

	manifestStr, err := sonic.MarshalString(draftPlugin.Manifest)
	if err != nil {
		return nil, err
	}

	docBytes, err := yaml.Marshal(draftPlugin.OpenapiDoc)
	if err != nil {
		return nil, err
	}

	codeInfo := &common.CodeInfo{
		OpenapiDesc: string(docBytes),
		PluginDesc:  manifestStr,
	}

	resp = &pluginAPI.GetPluginInfoResponse{
		MetaInfo:       metaInfo,
		CodeInfo:       codeInfo,
		Creator:        common.NewCreator(),
		StatisticData:  common.NewPluginStatisticData(),
		PluginType:     draftPlugin.PluginType,
		CreationMethod: common.CreationMethod_COZE,
	}

	return resp, nil
}

func (p *PluginApplicationService) GetUpdatedAPIs(ctx context.Context, req *pluginAPI.GetUpdatedAPIsRequest) (resp *pluginAPI.GetUpdatedAPIsResponse, err error) {
	draftTools, err := p.pluginRepo.GetPluginAllDraftTools(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	onlineTools, err := p.pluginRepo.GetPluginAllOnlineTools(ctx, req.PluginID)
	if err != nil {
		return nil, err
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

func (p *PluginApplicationService) GetUserAuthority(ctx context.Context, req *pluginAPI.GetUserAuthorityRequest) (resp *pluginAPI.GetUserAuthorityResponse, err error) {
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

func (p *PluginApplicationService) GetOAuthStatus(ctx context.Context, req *pluginAPI.GetOAuthStatusRequest) (resp *pluginAPI.GetOAuthStatusResponse, err error) {
	// TDOO(@maronghong): 完善逻辑
	resp = &pluginAPI.GetOAuthStatusResponse{
		IsOauth: false,
	}

	return resp, nil
}

func (p *PluginApplicationService) CheckAndLockPluginEdit(ctx context.Context, req *pluginAPI.CheckAndLockPluginEditRequest) (resp *pluginAPI.CheckAndLockPluginEditResponse, err error) {
	// TDOO(@maronghong): 完善逻辑
	resp = &pluginAPI.CheckAndLockPluginEditResponse{
		Data: &common.CheckAndLockPluginEditData{
			Seized: true,
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) CreateAPI(ctx context.Context, req *pluginAPI.CreateAPIRequest) (resp *pluginAPI.CreateAPIResponse, err error) {
	defaultSubURL := gonanoid.MustID(6)

	tool := &entity.ToolInfo{
		PluginID:        req.PluginID,
		ActivatedStatus: ptr.Of(consts.ActivateTool),
		DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
		SubURL:          ptr.Of("/" + defaultSubURL),
		Method:          ptr.Of(http.MethodGet),
		Operation: &entity.Openapi3Operation{
			Summary:     req.Desc,
			OperationID: req.Name,
			Parameters:  []*openapi3.ParameterRef{},
			RequestBody: &openapi3.RequestBodyRef{
				Value: &openapi3.RequestBody{
					Content: map[string]*openapi3.MediaType{
						consts.MIMETypeJson: {
							Schema: &openapi3.SchemaRef{
								Value: &openapi3.Schema{
									Type:       openapi3.TypeObject,
									Properties: map[string]*openapi3.SchemaRef{},
								},
							},
						},
					},
				},
			},
			Responses: openapi3.Responses{
				strconv.Itoa(http.StatusOK): {
					Value: &openapi3.Response{
						Content: map[string]*openapi3.MediaType{
							consts.MIMETypeJson: {
								Schema: &openapi3.SchemaRef{
									Value: &openapi3.Schema{
										Type:       openapi3.TypeObject,
										Properties: map[string]*openapi3.SchemaRef{},
									},
								},
							},
						},
					},
				},
			},
			Extensions: map[string]interface{}{
				consts.APISchemaExtendGlobalDisable: false,
			},
		},
	}

	toolID, err := p.toolRepo.CreateDraftTool(ctx, tool)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.CreateAPIResponse{
		APIID: strconv.FormatInt(toolID, 10),
	}

	return resp, nil
}

func (p *PluginApplicationService) UpdateAPI(ctx context.Context, req *pluginAPI.UpdateAPIRequest) (resp *pluginAPI.UpdateAPIResponse, err error) {
	op, err := pluginutil.APIParamsToOpenapiOperation(req.RequestParams, req.ResponseParams)
	if err != nil {
		return nil, err
	}

	var method *string
	if m, ok := convertor.ToHTTPMethod(req.GetMethod()); ok {
		method = &m
	}

	updateReq := &service.UpdateToolDraftRequest{
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
	}
	err = p.DomainSVC.UpdateDraftTool(ctx, updateReq)
	if err != nil {
		return nil, err
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
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.UpdateAPIResponse{}

	return resp, nil
}

func (p *PluginApplicationService) UpdatePlugin(ctx context.Context, req *pluginAPI.UpdatePluginRequest) (resp *pluginAPI.UpdatePluginResponse, err error) {
	loader := openapi3.NewLoader()
	_doc, err := loader.LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, err
	}

	doc := ptr.Of(entity.Openapi3T(*_doc))

	manifest := &entity.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, manifest)
	if err != nil {
		return nil, err
	}

	err = p.DomainSVC.UpdateDraftPluginWithCode(ctx, &service.UpdateDraftPluginWithCodeRequest{
		PluginID:   req.PluginID,
		OpenapiDoc: doc,
		Manifest:   manifest,
	})
	if err != nil {
		return nil, err
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:      resCommon.ResType_Plugin,
			ResID:        req.PluginID,
			Name:         &manifest.NameForHuman,
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.UpdatePluginResponse{
		Data: &common.UpdatePluginData{
			Res: true,
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) DeleteAPI(ctx context.Context, req *pluginAPI.DeleteAPIRequest) (resp *pluginAPI.DeleteAPIResponse, err error) {
	err = p.toolRepo.DeleteDraftTool(ctx, req.APIID)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.DeleteAPIResponse{}

	return resp, nil
}

func (p *PluginApplicationService) DelPlugin(ctx context.Context, req *pluginAPI.DelPluginRequest) (resp *pluginAPI.DelPluginResponse, err error) {
	err = p.DomainSVC.DeleteDraftPlugin(ctx, &service.DeleteDraftPluginRequest{
		PluginID: req.PluginID,
	})
	if err != nil {
		return nil, err
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Deleted,
		Resource: &searchEntity.ResourceDocument{
			ResType:      resCommon.ResType_Plugin,
			ResID:        req.PluginID,
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.DelPluginResponse{}

	return resp, nil
}

func (p *PluginApplicationService) PublishPlugin(ctx context.Context, req *pluginAPI.PublishPluginRequest) (resp *pluginAPI.PublishPluginResponse, err error) {
	err = p.DomainSVC.PublishPlugin(ctx, &service.PublishPluginRequest{
		PluginID:    req.PluginID,
		Version:     req.VersionName,
		VersionDesc: req.VersionDesc,
	})
	if err != nil {
		return nil, err
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResID:         req.PluginID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_Published),
			PublishTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.PublishPluginResponse{}

	return resp, nil
}

func (p *PluginApplicationService) UpdatePluginMeta(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (resp *pluginAPI.UpdatePluginMetaResponse, err error) {
	if req.AuthType == nil {
		return nil, fmt.Errorf("auth type is empty")
	}

	_authType, ok := convertor.ToAuthType(req.GetAuthType())
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%d'", req.GetAuthType())
	}
	authType := &_authType

	var authSubType *consts.AuthSubType
	if req.SubAuthType != nil {
		_authSubType, ok := convertor.ToAuthSubType(req.GetSubAuthType())
		if !ok {
			return nil, fmt.Errorf("invalid sub auth type '%d'", req.GetSubAuthType())
		}
		authSubType = &_authSubType
	}

	var location *consts.HTTPParamLocation
	if req.Location != nil {
		if *req.Location == common.AuthorizationServiceLocation_Header {
			location = ptr.Of(consts.ParamInHeader)
		} else if *req.Location == common.AuthorizationServiceLocation_Query {
			location = ptr.Of(consts.ParamInQuery)
		} else {
			return nil, fmt.Errorf("invalid location '%d'", req.GetLocation())
		}
	}

	updateReq := &service.UpdateDraftPluginRequest{
		PluginID:     req.PluginID,
		Name:         req.Name,
		Desc:         req.Desc,
		URL:          req.URL,
		Icon:         req.Icon,
		CommonParams: req.CommonParams,
		AuthInfo: &service.PluginAuthInfo{
			AuthType:     authType,
			Location:     location,
			Key:          req.Key,
			ServiceToken: req.ServiceToken,
			OauthInfo:    req.OauthInfo,
			AuthSubType:  authSubType,
			AuthPayload:  req.AuthPayload,
		},
	}
	err = p.DomainSVC.UpdateDraftPlugin(ctx, updateReq)
	if err != nil {
		return nil, err
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:      resCommon.ResType_Plugin,
			ResID:        req.PluginID,
			Name:         req.Name,
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource failed, err=%v", err)
	}

	resp = &pluginAPI.UpdatePluginMetaResponse{}

	return resp, nil
}

func (p *PluginApplicationService) GetBotDefaultParams(ctx context.Context, req *pluginAPI.GetBotDefaultParamsRequest) (resp *pluginAPI.GetBotDefaultParamsResponse, err error) {
	exist, err := p.pluginRepo.CheckOnlinePluginExist(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	res, err := p.DomainSVC.GetDraftAgentTool(ctx, &service.GetDraftAgentToolRequest{
		ToolName: req.APIName,
		AgentID:  req.BotID,
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

func (p *PluginApplicationService) UpdateBotDefaultParams(ctx context.Context, req *pluginAPI.UpdateBotDefaultParamsRequest) (resp *pluginAPI.UpdateBotDefaultParamsResponse, err error) {
	op, err := pluginutil.APIParamsToOpenapiOperation(req.RequestParams, req.ResponseParams)
	if err != nil {
		return nil, err
	}

	err = p.DomainSVC.UpdateBotDefaultParams(ctx, &service.UpdateBotDefaultParamsRequest{
		PluginID:    req.PluginID,
		ToolName:    req.APIName,
		AgentID:     req.BotID,
		Parameters:  op.Parameters,
		RequestBody: op.RequestBody,
		Responses:   op.Responses,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdateBotDefaultParamsResponse{}

	return resp, nil
}

func (p *PluginApplicationService) DebugAPI(ctx context.Context, req *pluginAPI.DebugAPIRequest) (resp *pluginAPI.DebugAPIResponse, err error) {
	res, err := p.DomainSVC.ExecuteTool(ctx, &service.ExecuteToolRequest{
		PluginID:        req.PluginID,
		ToolID:          req.APIID,
		ExecScene:       consts.ExecSceneOfToolDebug,
		ArgumentsInJson: req.Parameters,
	})
	if err != nil {
		reason := fmt.Sprintf("execute tool failed, err=%v", err)
		logs.CtxErrorf(ctx, reason)
		return &pluginAPI.DebugAPIResponse{
			Success: false,
			Reason:  reason,
			RawReq:  req.Parameters,
			RawResp: "{}",
			Resp:    "{}",
		}, nil
	}

	success := true
	reason := ""

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
		RawReq:         req.Parameters,
		RawResp:        res.RawResp,
		ResponseParams: respParams,
	}

	return resp, nil
}

func (p *PluginApplicationService) UnlockPluginEdit(ctx context.Context, req *pluginAPI.UnlockPluginEditRequest) (resp *pluginAPI.UnlockPluginEditResponse, err error) {
	resp = &pluginAPI.UnlockPluginEditResponse{
		Released: true,
	}
	return resp, nil
}

func (p *PluginApplicationService) PublicGetProductList(ctx context.Context, req *productAPI.GetProductListRequest) (resp *productAPI.GetProductListResponse, err error) {
	res, err := p.DomainSVC.ListPluginProducts(ctx, &service.ListPluginProductsRequest{})
	if err != nil {
		return nil, err
	}

	products := make([]*productAPI.ProductInfo, 0, len(res.Plugins))
	for _, pl := range res.Plugins {
		tls, err := p.pluginRepo.GetPluginAllOnlineTools(ctx, pl.ID)
		if err != nil {
			return nil, err
		}

		pi, err := p.buildProductInfo(ctx, pl, tls)
		if err != nil {
			return nil, err
		}

		products = append(products, pi)
	}

	resp = &productAPI.GetProductListResponse{
		Data: &productAPI.GetProductListData{
			Products: products,
			HasMore:  false, // 一次性拉完
			Total:    int32(res.Total),
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) buildProductInfo(ctx context.Context, plugin *entity.PluginInfo, tools []*entity.ToolInfo) (*productAPI.ProductInfo, error) {
	metaInfo, err := p.buildProductMetaInfo(ctx, plugin)
	if err != nil {
		return nil, err
	}

	extraInfo, err := p.buildPluginProductExtraInfo(ctx, plugin, tools)
	if err != nil {
		return nil, err
	}

	pi := &productAPI.ProductInfo{
		CommercialSetting: &productCommon.CommercialSetting{
			CommercialType: productCommon.ProductPaidType_Free,
		},
		MetaInfo:    metaInfo,
		PluginExtra: extraInfo,
	}

	return pi, nil
}

func (p *PluginApplicationService) buildProductMetaInfo(ctx context.Context, plugin *entity.PluginInfo) (*productAPI.ProductMetaInfo, error) {
	iconURL, err := p.oss.GetObjectUrl(ctx, plugin.GetIconURI())
	if err != nil {
		logs.CtxErrorf(ctx, "get icon url failed with '%s', err=%v", plugin.GetIconURI(), err)
	}

	return &productAPI.ProductMetaInfo{
		ID:          plugin.GetRefProductID(),
		EntityID:    plugin.ID,
		EntityType:  productCommon.ProductEntityType_Plugin,
		IconURL:     iconURL,
		Name:        plugin.GetName(),
		Description: plugin.GetDesc(),
		IsFree:      true,
		IsOfficial:  true,
		Status:      productCommon.ProductStatus_Listed,
		ListedAt:    time.Now().Unix(),
		UserInfo: &productCommon.UserInfo{
			Name: "Coze Official",
		},
	}, nil
}

func (p *PluginApplicationService) buildPluginProductExtraInfo(ctx context.Context, plugin *entity.PluginInfo, tools []*entity.ToolInfo) (*productAPI.PluginExtraInfo, error) {
	ei := &productAPI.PluginExtraInfo{
		IsOfficial: true,
		PluginType: func() *productCommon.PluginType {
			if plugin.PluginType == common.PluginType_LOCAL {
				return ptr.Of(productCommon.PluginType_LocalPlugin)
			}
			return ptr.Of(productCommon.PluginType_CLoudPlugin)
		}(),
	}

	toolInfos := make([]*productAPI.PluginToolInfo, 0, len(tools))
	for _, tl := range tools {
		params, err := tl.ToToolParameters()
		if err != nil {
			return nil, err
		}

		toolInfo := &productAPI.PluginToolInfo{
			ID:          tl.ID,
			Name:        tl.GetName(),
			Description: tl.GetDesc(),
			Parameters:  params,
		}

		example := plugin.GetToolExample(ctx, tl.GetName())
		if example != nil {
			toolInfo.Example = &productAPI.PluginToolExample{
				ReqExample:  example.RequestExample,
				RespExample: example.ResponseExample,
			}
		}

		toolInfos = append(toolInfos, toolInfo)
	}

	ei.Tools = toolInfos

	return ei, nil
}

func (p *PluginApplicationService) PublicGetProductDetail(ctx context.Context, req *productAPI.GetProductDetailRequest) (resp *productAPI.GetProductDetailResponse, err error) {
	plugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.GetEntityID())
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online plugin '%d' not found", req.GetEntityID())
	}

	tools, err := p.pluginRepo.GetPluginAllOnlineTools(ctx, plugin.ID)
	if err != nil {
		return nil, err
	}
	pi, err := p.buildProductInfo(ctx, plugin, tools)
	if err != nil {
		return nil, err
	}

	resp = &productAPI.GetProductDetailResponse{
		Data: &productAPI.GetProductDetailData{
			MetaInfo:    pi.MetaInfo,
			PluginExtra: pi.PluginExtra,
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) GetPluginNextVersion(ctx context.Context, req *pluginAPI.GetPluginNextVersionRequest) (resp *pluginAPI.GetPluginNextVersionResponse, err error) {
	res, err := p.DomainSVC.GetPluginNextVersion(ctx, &service.GetPluginNextVersionRequest{
		PluginID: req.PluginID,
	})
	if err != nil {
		return nil, err
	}
	resp = &pluginAPI.GetPluginNextVersionResponse{
		NextVersionName: res.Version,
	}
	return resp, nil
}
