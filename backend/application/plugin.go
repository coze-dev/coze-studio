package application

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"
	"gopkg.in/yaml.v3"

	pluginAPI "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/plugin_develop"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var PluginSVC = &Plugin{}

type Plugin struct {
}

func (p *Plugin) GetOAuthSchema(ctx, req *pluginAPI.GetOAuthSchemaRequest) (resp *pluginAPI.GetOAuthSchemaResponse, err error) {
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

		pluginLists = append(pluginLists, toPluginInfoForPlayground(pl, toolsRes.Tools))
	}

	resp.Data = &common.GetPlaygroundPluginListData{
		Total:      int32(res.Total),
		PluginList: pluginLists,
	}

	return resp, nil
}

func toPluginInfoForPlayground(pl *entity.PluginInfo, tools []*entity.ToolInfo) *common.PluginInfoForPlayground {
	pluginAPIs := make([]*common.PluginApi, 0, len(tools))
	for _, tl := range tools {
		pluginAPIs = append(pluginAPIs, &common.PluginApi{
			APIID:      strconv.FormatInt(tl.ID, 10),
			Name:       tl.GetName(),
			Desc:       tl.GetDesc(),
			PluginID:   strconv.FormatInt(pl.ID, 10),
			PluginName: pl.GetName(),
			RunMode:    common.RunMode_Sync, // TODO(@maronghong): 区分同步和异步模式
			Parameters: convertToPluginParameter(tl.Operation),
		})
	}

	pluginInfo := common.PluginInfoForPlayground{
		Auth:           0,
		CreateTime:     strconv.FormatInt(pl.CreatedAt/1000, 10),
		CreationMethod: common.CreationMethod_COZE,
		Creator:        common.NewCreator(),
		DescForHuman:   pl.GetDesc(),
		ID:             strconv.FormatInt(pl.ID, 10),
		IsOfficial:     false,
		MaterialID:     strconv.FormatInt(pl.ID, 10), // TODO(@maronghong): 确认含义
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

	return &pluginInfo
}

func convertToPluginParameter(op *openapi3.Operation) []*common.PluginParameter {
	var params []*common.PluginParameter

	for _, prop := range op.Parameters {
		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value
		if schemaVal.Type == openapi3.TypeObject || schemaVal.Type == openapi3.TypeArray {
			continue
		}

		if disabledParam(prop.Value.Schema.Value) {
			continue
		}

		var assistType *common.PluginParamTypeFormat
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendAssistType]; ok {
			if _v, ok := v.(string); ok {
				assistType = toPluginParamTypeFormat(_v)
			}
		}

		params = append(params, &common.PluginParameter{
			Name:     paramVal.Name,
			Desc:     paramVal.Description,
			Required: paramVal.Required,
			Type:     schemaVal.Type,
			Format:   assistType,
		})
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			paramInfo := toPluginParameter(paramName, required[paramName], prop.Value)
			if paramInfo != nil {
				params = append(params, paramInfo)
			}
		}

		break // 只取一种 MIME
	}

	return params
}

func toPluginParameter(paramName string, isRequired bool, sc *openapi3.Schema) *common.PluginParameter {
	if disabledParam(sc) {
		return nil
	}

	var assistType *common.PluginParamTypeFormat
	if v, ok := sc.Extensions[consts.APISchemaExtendAssistType]; ok {
		if _v, ok := v.(string); ok {
			assistType = toPluginParamTypeFormat(_v)
		}
	}

	pluginParam := &common.PluginParameter{
		Name:     paramName,
		Type:     sc.Type,
		Desc:     sc.Description,
		Required: isRequired,
		Format:   assistType,
	}

	switch sc.Type {
	case openapi3.TypeObject:
		if len(sc.Properties) == 0 {
			return pluginParam
		}

		required := slices.ToMap(sc.Required, func(e string) (string, bool) {
			return e, true
		})
		for subParamName, prop := range sc.Properties {
			subParam := toPluginParameter(subParamName, required[subParamName], prop.Value)
			pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)
		}

		return pluginParam

	case openapi3.TypeArray:
		pluginParam.SubType = sc.Items.Value.Type

		if sc.Items.Value.Type == openapi3.TypeObject {
			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})
			for subParamName, prop := range sc.Items.Value.Properties {
				subParam := toPluginParameter(subParamName, required[subParamName], prop.Value)
				pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)
			}

			return pluginParam
		}

		subParam := toPluginParameter("", isRequired, sc.Items.Value)
		pluginParam.SubParameters = append(pluginParam.SubParameters, subParam)

		return pluginParam
	}

	return pluginParam
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}

func toPluginParamTypeFormat(format string) *common.PluginParamTypeFormat {
	if format == "" {
		return nil
	}
	switch consts.APIFileAssistType(format) {
	case consts.AssistTypeFile:
		return ptr.Of(common.PluginParamTypeFormat_FileUrl)
	case consts.AssistTypeImage:
		return ptr.Of(common.PluginParamTypeFormat_ImageUrl)
	case consts.AssistTypeDoc:
		return ptr.Of(common.PluginParamTypeFormat_DocUrl)
	case consts.AssistTypePPT:
		return ptr.Of(common.PluginParamTypeFormat_PptUrl)
	case consts.AssistTypeCode:
		return ptr.Of(common.PluginParamTypeFormat_CodeUrl)
	case consts.AssistTypeExcel:
		return ptr.Of(common.PluginParamTypeFormat_ExcelUrl)
	case consts.AssistTypeZIP:
		return ptr.Of(common.PluginParamTypeFormat_ZipUrl)
	case consts.AssistTypeVideo:
		return ptr.Of(common.PluginParamTypeFormat_VideoUrl)
	case consts.AssistTypeAudio:
		return ptr.Of(common.PluginParamTypeFormat_AudioUrl)
	case consts.AssistTypeTXT:
		return ptr.Of(common.PluginParamTypeFormat_TxtUrl)
	default:
		return nil
	}
}

func (p *Plugin) RegisterPluginMeta(ctx context.Context, req *pluginAPI.RegisterPluginMetaRequest) (resp *pluginAPI.RegisterPluginMetaResponse, err error) {
	userID := getUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	// TODO(@maronghong): 补充 auth
	manifest := entity.NewDefaultPluginManifest()
	manifest.Name = req.Name
	manifest.Description = req.Desc
	manifest.LogoURL = req.Icon.URI
	for loc, params := range req.CommonParams {
		for _, param := range params {
			mParams := manifest.CommonParams[loc]
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
		Name:        ptr.Of(req.Name),
		Desc:        ptr.Of(req.Desc),
		IconURI:     ptr.Of(req.Icon.URI),
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
			Method:         toThriftAPIMethod(tool.GetMethod()),
			Name:           tool.GetName(),
			OnlineStatus:   common.OnlineStatus_ONLINE,
			Path:           tool.GetSubURL(),
			PluginID:       strconv.FormatInt(tool.PluginID, 10),
			RequestParams:  toReqAPIParameter(tool.Operation),
			ResponseParams: toRespAPIParameter(tool.Operation),
			StatisticData:  common.NewPluginStatisticData(), // TODO(@maronghong): 补充统计数据
		})
	}

	resp = &pluginAPI.GetPluginAPIsResponse{
		APIInfo: apis,
		Total:   int32(tools.Total),
	}

	return resp, nil
}

func toRespAPIParameter(op *openapi3.Operation) []*common.APIParameter {
	params := make([]*common.APIParameter, 0, len(op.Parameters))

	response := op.Responses[strconv.Itoa(http.StatusOK)]
	if response == nil {
		return params
	}

	mType := response.Value.Content[consts.MIMETypeJson]
	if mType == nil {
		return params
	}

	schemaVal := mType.Schema.Value
	if len(schemaVal.Properties) == 0 {
		return params
	}

	required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
		return e, true
	})

	for paramName, prop := range schemaVal.Properties {
		loc := string(consts.ParamInBody)
		apiParam := toAPIParameter(paramName, loc, required[paramName], prop.Value)
		params = append(params, apiParam)
	}

	return params
}

func toReqAPIParameter(op *openapi3.Operation) []*common.APIParameter {
	params := make([]*common.APIParameter, 0, len(op.Parameters))
	for _, param := range op.Parameters {
		paramVal := param.Value
		schemaVal := paramVal.Schema.Value

		apiParam := toAPIParameter(paramVal.Name, paramVal.In, paramVal.Required, schemaVal)
		params = append(params, apiParam)
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			loc := string(consts.ParamInBody)
			apiParam := toAPIParameter(paramName, loc, required[paramName], prop.Value)
			params = append(params, apiParam)
		}

		break // 只取一种 MIME
	}

	return params
}

func toAPIParameter(paramName string, loc string, isRequired bool, sc *openapi3.Schema) *common.APIParameter {
	apiParam := &common.APIParameter{
		Name:       paramName,
		Desc:       sc.Description,
		Type:       toThriftParamType(strings.ToLower(sc.Type)),
		Location:   toThriftHTTPParamLocation(consts.HTTPParamLocation(loc)), //使用父节点的值
		IsRequired: isRequired,
	}

	if sc.Default != nil {
		apiParam.GlobalDefault = ptr.Of(fmt.Sprintf("%v", sc.Default))
	}

	aType := formatToAssistType[sc.Format]
	if aType != "" {
		apiParam.AssistType = ptr.Of(toThriftAPIAssistType(aType))
	}

	if v, ok := sc.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
		if disable, ok := v.(bool); ok {
			apiParam.GlobalDisable = disable
		}
	}

	switch sc.Type {
	case openapi3.TypeObject:
		if len(sc.Properties) > 0 {
			return apiParam
		}

		required := slices.ToMap(sc.Required, func(e string) (string, bool) {
			return e, true
		})
		for subParamName, prop := range sc.Properties {
			subParam := toAPIParameter(subParamName, loc, required[subParamName], prop.Value)
			apiParam.SubParameters = append(apiParam.SubParameters, subParam)
		}

		return apiParam

	case openapi3.TypeArray:
		if sc.Items.Value.Type == openapi3.TypeObject {
			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})
			for subParamName, prop := range sc.Properties {
				subParam := toAPIParameter(subParamName, loc, required[subParamName], prop.Value)
				apiParam.SubParameters = append(apiParam.SubParameters, subParam)
			}

			return apiParam
		}

		subType := toThriftParamType(strings.ToLower(sc.Items.Value.Type))
		apiParam.SubType = ptr.Of(subType)
		subParam := toAPIParameter("[Array Item]", loc, isRequired, sc.Items.Value)
		apiParam.SubParameters = append(apiParam.SubParameters, subParam)

		return apiParam
	}

	return apiParam
}

func (p *Plugin) GetPluginInfo(ctx context.Context, req pluginAPI.GetPluginInfoRequest) (resp *pluginAPI.GetPluginInfoResponse, err error) {
	plDraft, exist, err := pluginDraftRepo.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	commonParams := make(map[common.ParameterLocation][]*common.CommonParamSchema, len(plDraft.Manifest.CommonParams))
	for loc, params := range plDraft.Manifest.CommonParams {
		commonParams[loc] = make([]*common.CommonParamSchema, 0, len(params))
		for _, param := range params {
			commonParams[loc] = append(commonParams[loc], &common.CommonParamSchema{
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
		//ServiceToken:  // TODO(@maronghong): 补充 auth
	}

	resp = &pluginAPI.GetPluginInfoResponse{
		MetaInfo:      metaInfo,
		CodeInfo:      codeInfo,
		Creator:       common.NewCreator(),
		StatisticData: common.NewPluginStatisticData(),
		PrivacyStatus: plDraft.GetPrivacyInfoInJson() != "",
		PrivacyInfo:   plDraft.GetPrivacyInfoInJson(),
		PluginType:    plDraft.PluginType,
	}

	return resp, nil
}

func (p *Plugin) GetUpdatedAPIs(ctx context.Context, req pluginAPI.GetUpdatedAPIsRequest) (resp *pluginAPI.GetUpdatedAPIsResponse, err error) {
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

func (p *Plugin) GetOAuthStatus(ctx context.Context, req pluginAPI.GetOAuthStatusRequest) (resp *pluginAPI.GetOAuthStatusResponse, err error) {
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
		Name:            ptr.Of(req.Name),
		Desc:            ptr.Of(req.Desc),
		ActivatedStatus: ptr.Of(consts.ActivateTool),
		DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
		SubURL:          ptr.Of(defaultSubURL),
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
			Responses: openapi3.Responses{},
			Servers: &openapi3.Servers{
				{URL: defaultSubURL},
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
	tool, exist, err := toolDraftRepo.Get(ctx, req.APIID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("tool '%d' not found", req.APIID)
	}

	var activatedStatus *consts.ActivatedStatus
	if req.Disabled != nil {
		if *req.Disabled {
			activatedStatus = ptr.Of(consts.DeactivateTool)
		} else {
			activatedStatus = ptr.Of(consts.ActivateTool)
		}
	}

	op := tool.Operation
	var (
		hasResetReqBody  = false
		hasResetRespBody = false
		hasResetParams   = false
	)
	for _, apiParam := range req.RequestParams {
		if apiParam.Location != common.ParameterLocation_Body {
			if !hasResetParams {
				hasResetParams = true
				op.Parameters = []*openapi3.ParameterRef{}
			}

			op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
				Value: toOpenapiParameter(apiParam),
			})

			continue
		}

		mType := op.RequestBody.Value.Content[consts.MIMETypeJson]
		if !hasResetReqBody {
			hasResetReqBody = true
			mType = &openapi3.MediaType{
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type:       openapi3.TypeObject,
						Properties: map[string]*openapi3.SchemaRef{},
					},
				},
			}
		}

		mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
			Value: toOpenapi3Schema(apiParam),
		}
		if apiParam.IsRequired {
			mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
		}
	}

	for _, apiParam := range req.ResponseParams {
		if hasResetRespBody {
			mType := op.Responses[strconv.Itoa(http.StatusOK)].Value.Content[consts.MIMETypeJson]
			mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
				Value: toOpenapi3Schema(apiParam),
			}
			if apiParam.IsRequired {
				mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
			}

			continue
		}

		hasResetRespBody = true
		respRef, ok := op.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return nil, fmt.Errorf("response '200' not found")
		}

		respRef.Value.Content[consts.MIMETypeJson] = &openapi3.MediaType{
			Schema: &openapi3.SchemaRef{
				Value: &openapi3.Schema{
					Type:       openapi3.TypeObject,
					Properties: map[string]*openapi3.SchemaRef{},
				},
			},
		}
	}

	updatedTool := &entity.ToolInfo{
		Name:            req.Name,
		Desc:            req.Desc,
		PluginID:        req.PluginID,
		SubURL:          req.Path,
		ActivatedStatus: activatedStatus,
		Operation:       op,
	}

	err = pluginDomainSVC.UpdateToolDraft(ctx, &plugin.UpdateToolDraftRequest{
		Tool: updatedTool,
	})
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdateAPIResponse{}

	return resp, nil
}

func toOpenapi3Schema(apiParam *common.APIParameter) *openapi3.Schema {
	paramType := toOpenapiParamType(apiParam.Type)
	sc := &openapi3.Schema{
		Description: apiParam.Desc,
		Type:        paramType,
		Default:     apiParam.GlobalDefault,
		Extensions: map[string]interface{}{
			consts.APISchemaExtendGlobalDisable: apiParam.GlobalDisable,
		},
	}

	if apiParam.GetAssistType() > 0 {
		aType := toAPIAssistType(apiParam.GetAssistType())
		sc.Extensions[consts.APISchemaExtendAssistType] = aType
		sc.Format = assistTypeToFormat[aType]
	}

	switch paramType {
	case openapi3.TypeObject:
		sc.Properties = map[string]*openapi3.SchemaRef{}
		for _, subParam := range apiParam.SubParameters {
			sc.Properties[subParam.Name] = &openapi3.SchemaRef{
				Value: toOpenapi3Schema(subParam),
			}
			if subParam.IsRequired {
				sc.Required = append(sc.Required, subParam.Name)
			}
		}

		return sc

	case openapi3.TypeArray:
		if toOpenapiParamType(apiParam.GetSubType()) != openapi3.TypeObject {
			sc.Items = &openapi3.SchemaRef{
				Value: toOpenapi3Schema(apiParam.SubParameters[0]),
			}

			return sc
		}

		itemValue := &openapi3.Schema{}
		itemValue.Properties = make(map[string]*openapi3.SchemaRef, len(apiParam.SubParameters))
		for _, subParam := range apiParam.SubParameters {
			itemValue.Properties[subParam.Name] = &openapi3.SchemaRef{
				Value: toOpenapi3Schema(subParam),
			}
			if subParam.IsRequired {
				itemValue.Required = append(itemValue.Required, subParam.Name)
			}
		}

		sc.Items = &openapi3.SchemaRef{
			Value: itemValue,
		}

		return sc
	}

	return sc
}

func toOpenapiParameter(apiParam *common.APIParameter) *openapi3.Parameter {
	paramSchema := &openapi3.Schema{
		Description: apiParam.Desc,
		Type:        toOpenapiParamType(apiParam.Type),
		Default:     apiParam.GlobalDefault,
		Extensions: map[string]interface{}{
			consts.APISchemaExtendGlobalDisable: apiParam.GlobalDisable,
		},
	}

	if apiParam.GetAssistType() > 0 {
		aType := toAPIAssistType(apiParam.GetAssistType())
		paramSchema.Extensions[consts.APISchemaExtendAssistType] = aType
		paramSchema.Format = assistTypeToFormat[aType]
	}

	param := &openapi3.Parameter{
		Description: apiParam.Desc,
		Name:        apiParam.Name,
		In:          string(toHTTPParamLocation(apiParam.Location)),
		Required:    apiParam.IsRequired,
		Schema: &openapi3.SchemaRef{
			Value: paramSchema,
		},
	}

	return param
}

func (p *Plugin) UpdatePlugin(ctx context.Context, req *pluginAPI.UpdatePluginRequest) (resp *pluginAPI.UpdatePluginResponse, err error) {
	var doc *openapi3.T
	err = yaml.Unmarshal([]byte(req.Openapi), doc)
	if err != nil {
		return nil, err
	}

	var manifest *entity.PluginManifest
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

	resp = &pluginAPI.UpdatePluginResponse{}

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

func (p *Plugin) UpdatePluginMeta(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (resp *pluginAPI.UpdatePluginMetaResponse, err error) {
	pl, exist, err := pluginDraftRepo.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin draft '%d' not found", req.PluginID)
	}

	manifest := pl.Manifest
	doc := pl.OpenapiDoc

	if req.Name != nil {
		manifest.Name = *req.Name
		doc.Info.Title = *req.Name
	}
	if req.Desc != nil {
		manifest.Description = *req.Desc
		doc.Info.Description = *req.Desc
	}
	if len(req.CommonParams) > 0 {
		if manifest.CommonParams == nil {
			manifest.CommonParams = make(map[common.ParameterLocation][]*entity.CommonParamSchema, len(req.CommonParams))
		}
		for loc, params := range req.CommonParams {
			commonParams := make([]*entity.CommonParamSchema, 0, len(params))
			for _, param := range params {
				commonParams = append(commonParams, &entity.CommonParamSchema{
					Name:  param.Name,
					Value: param.Value,
				})
			}
			manifest.CommonParams[loc] = commonParams
		}
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

	pl.Name = req.Name
	pl.Desc = req.Desc
	pl.IconURI = ptr.Of(req.Icon.URI)
	pl.ServerURL = req.URL
	pl.Manifest = manifest
	pl.OpenapiDoc = doc

	err = pluginDraftRepo.Update(ctx, pl)
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

	reqAPIParams := toReqAPIParameter(res.Tool.Operation)
	respAPIParams := toRespAPIParameter(res.Tool.Operation)

	resp = &pluginAPI.GetBotDefaultParamsResponse{
		RequestParams:  reqAPIParams,
		ResponseParams: respAPIParams,
	}

	return resp, nil
}

func (p *Plugin) UpdateBotDefaultParams(ctx context.Context, req *pluginAPI.UpdateBotDefaultParamsRequest) (resp *pluginAPI.UpdateBotDefaultParamsResponse, err error) {
	_, exist, err := pluginRepo.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	tool, exist, err := toolDraftRepo.Get(ctx, req.APIID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("tool '%d' not found", req.APIID)
	}

	op := tool.Operation
	var (
		hasResetReqBody  = false
		hasResetRespBody = false
		hasResetParams   = false
	)
	for _, apiParam := range req.RequestParams {
		if apiParam.Location != common.ParameterLocation_Body {
			if !hasResetParams {
				hasResetParams = true
				op.Parameters = []*openapi3.ParameterRef{}
			}

			op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
				Value: toOpenapiParameter(apiParam),
			})

			continue
		}

		mType := op.RequestBody.Value.Content[consts.MIMETypeJson]
		if !hasResetReqBody {
			hasResetReqBody = true
			mType = &openapi3.MediaType{
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type:       openapi3.TypeObject,
						Properties: map[string]*openapi3.SchemaRef{},
					},
				},
			}
		}

		mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
			Value: toOpenapi3Schema(apiParam),
		}
		if apiParam.IsRequired {
			mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
		}
	}

	for _, apiParam := range req.ResponseParams {
		if hasResetRespBody {
			mType := op.Responses[strconv.Itoa(http.StatusOK)].Value.Content[consts.MIMETypeJson]
			mType.Schema.Value.Properties[apiParam.Name] = &openapi3.SchemaRef{
				Value: toOpenapi3Schema(apiParam),
			}
			if apiParam.IsRequired {
				mType.Schema.Value.Required = append(mType.Schema.Value.Required, apiParam.Name)
			}

			continue
		}

		hasResetRespBody = true
		respRef, ok := op.Responses[strconv.Itoa(http.StatusOK)]
		if !ok {
			return nil, fmt.Errorf("response '200' not found")
		}

		respRef.Value.Content[consts.MIMETypeJson] = &openapi3.MediaType{
			Schema: &openapi3.SchemaRef{
				Value: &openapi3.Schema{
					Type:       openapi3.TypeObject,
					Properties: map[string]*openapi3.SchemaRef{},
				},
			},
		}
	}

	updatedTool := &entity.ToolInfo{
		Operation: op,
	}
	identity := entity.AgentToolIdentity{
		AgentID: req.BotID,
		ToolID:  req.APIID,
		SpaceID: req.SpaceID,
	}
	err = agentToolDraftRepo.Update(ctx, identity, updatedTool)
	if err != nil {
		return nil, err
	}

	resp = &pluginAPI.UpdateBotDefaultParamsResponse{}

	return resp, nil
}

/******************
	convertor
 ******************/

var httpParamLocations = map[common.ParameterLocation]consts.HTTPParamLocation{
	common.ParameterLocation_Path:   consts.ParamInPath,
	common.ParameterLocation_Query:  consts.ParamInQuery,
	common.ParameterLocation_Body:   consts.ParamInBody,
	common.ParameterLocation_Header: consts.ParamInHeader,
}

var thriftHTTPParamLocations = func() map[consts.HTTPParamLocation]common.ParameterLocation {
	locations := make(map[consts.HTTPParamLocation]common.ParameterLocation, len(httpParamLocations))
	for k, v := range httpParamLocations {
		locations[v] = k
	}
	return locations
}()

func toHTTPParamLocation(loc common.ParameterLocation) consts.HTTPParamLocation {
	return httpParamLocations[loc]
}

func toThriftHTTPParamLocation(loc consts.HTTPParamLocation) common.ParameterLocation {
	return thriftHTTPParamLocations[loc]
}

var openapiTypes = map[common.ParameterType]string{
	common.ParameterType_String:  openapi3.TypeString,
	common.ParameterType_Integer: openapi3.TypeInteger,
	common.ParameterType_Number:  openapi3.TypeNumber,
	common.ParameterType_Object:  openapi3.TypeObject,
	common.ParameterType_Array:   openapi3.TypeArray,
	common.ParameterType_Bool:    openapi3.TypeBoolean,
}

var thriftParameterTypes = func() map[string]common.ParameterType {
	types := make(map[string]common.ParameterType, len(openapiTypes))
	for k, v := range openapiTypes {
		types[v] = k
	}
	return types
}()

func toOpenapiParamType(typ common.ParameterType) string {
	return openapiTypes[typ]
}

func toThriftParamType(typ string) common.ParameterType {
	return thriftParameterTypes[typ]
}

var apiAssistTypes = map[common.AssistParameterType]consts.APIFileAssistType{
	common.AssistParameterType_DEFAULT: consts.AssistTypeFile,
	common.AssistParameterType_IMAGE:   consts.AssistTypeImage,
	common.AssistParameterType_DOC:     consts.AssistTypeDoc,
	common.AssistParameterType_PPT:     consts.AssistTypePPT,
	common.AssistParameterType_CODE:    consts.AssistTypeCode,
	common.AssistParameterType_EXCEL:   consts.AssistTypeExcel,
	common.AssistParameterType_ZIP:     consts.AssistTypeZIP,
	common.AssistParameterType_VIDEO:   consts.AssistTypeVideo,
	common.AssistParameterType_AUDIO:   consts.AssistTypeAudio,
	common.AssistParameterType_TXT:     consts.AssistTypeTXT,
}

var thriftAPIAssistTypes = func() map[consts.APIFileAssistType]common.AssistParameterType {
	types := make(map[consts.APIFileAssistType]common.AssistParameterType, len(apiAssistTypes))
	for k, v := range apiAssistTypes {
		types[v] = k
	}
	return types
}()

func toAPIAssistType(typ common.AssistParameterType) consts.APIFileAssistType {
	return apiAssistTypes[typ]
}

func toThriftAPIAssistType(typ consts.APIFileAssistType) common.AssistParameterType {
	return thriftAPIAssistTypes[typ]
}

var httpMethods = map[common.APIMethod]string{
	common.APIMethod_GET:    strings.ToLower(http.MethodGet),
	common.APIMethod_POST:   strings.ToLower(http.MethodPost),
	common.APIMethod_PUT:    strings.ToLower(http.MethodPut),
	common.APIMethod_DELETE: strings.ToLower(http.MethodDelete),
	common.APIMethod_PATCH:  strings.ToLower(http.MethodPatch),
}

var thriftAPIMethods = func() map[string]common.APIMethod {
	methods := make(map[string]common.APIMethod, len(httpMethods))
	for k, v := range httpMethods {
		methods[v] = k
	}
	return methods
}()

func toHttpMethod(method common.APIMethod) string {
	return httpMethods[method]
}

func toThriftAPIMethod(method string) common.APIMethod {
	return thriftAPIMethods[method]
}

var assistTypeToFormat = map[consts.APIFileAssistType]string{
	consts.AssistTypeFile:  "file_url",
	consts.AssistTypeImage: "image_url",
	consts.AssistTypeDoc:   "doc_url",
	consts.AssistTypePPT:   "ppt_url",
	consts.AssistTypeCode:  "code_url",
	consts.AssistTypeExcel: "excel_url",
	consts.AssistTypeZIP:   "zip_url",
	consts.AssistTypeVideo: "video_url",
	consts.AssistTypeAudio: "audio_url",
	consts.AssistTypeTXT:   "txt_url",
}

var formatToAssistType = func() map[string]consts.APIFileAssistType {
	types := make(map[string]consts.APIFileAssistType, len(assistTypeToFormat))
	for k, v := range assistTypeToFormat {
		types[v] = k
	}
	return types
}()
