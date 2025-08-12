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
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"
	"gopkg.in/yaml.v3"

	botOpenAPI "github.com/coze-dev/coze-studio/backend/api/model/app/bot_open_api"
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	searchModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/search"
	productCommon "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_common"
	productAPI "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"
	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/base/pluginutil"
	crosssearch "github.com/coze-dev/coze-studio/backend/crossdomain/contract/search"
	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/encrypt"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	commonConsts "github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var PluginApplicationSVC = &PluginApplicationService{}

type PluginApplicationService struct {
	DomainSVC service.PluginService
	eventbus  search.ResourceEventBus
	oss       storage.Storage
	userSVC   user.User

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
		plugins []*entity.PluginInfo
		total   int64
	)
	if len(req.PluginIds) > 0 {
		plugins, total, err = p.getPlaygroundPluginListByIDs(ctx, req.PluginIds)
	} else {
		plugins, total, err = p.getPlaygroundPluginList(ctx, req)
	}

	pluginList := make([]*common.PluginInfoForPlayground, 0, len(plugins))
	for _, pl := range plugins {
		tools, err := p.toolRepo.GetPluginAllOnlineTools(ctx, pl.ID)
		if err != nil {
			return nil, errorx.Wrapf(err, "GetPluginAllOnlineTools failed, pluginID=%d", pl.ID)
		}

		pluginInfo, err := p.toPluginInfoForPlayground(ctx, pl, tools)
		if err != nil {
			return nil, err
		}

		pluginList = append(pluginList, pluginInfo)
	}

	resp = &pluginAPI.GetPlaygroundPluginListResponse{
		Data: &common.GetPlaygroundPluginListData{
			Total:      int32(total),
			PluginList: pluginList,
		},
	}

	return resp, nil
}

func (p *PluginApplicationService) getPlaygroundPluginListByIDs(ctx context.Context, pluginIDs []string) (plugins []*entity.PluginInfo, total int64, err error) {
	ids := make([]int64, 0, len(pluginIDs))
	for _, id := range pluginIDs {
		pluginID, err := strconv.ParseInt(id, 10, 64)
		if err != nil {
			return nil, 0, fmt.Errorf("invalid pluginID '%s'", id)
		}
		ids = append(ids, pluginID)
	}

	plugins, err = p.pluginRepo.MGetOnlinePlugins(ctx, ids)
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "MGetOnlinePlugins failed, pluginIDs=%v", pluginIDs)
	}

	total = int64(len(plugins))

	return plugins, total, nil
}

func (p *PluginApplicationService) getPlaygroundPluginList(ctx context.Context, req *pluginAPI.GetPlaygroundPluginListRequest) (plugins []*entity.PluginInfo, total int64, err error) {
	pageInfo := entity.PageInfo{
		Name: req.Name,
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
	plugins, total, err = p.DomainSVC.ListCustomOnlinePlugins(ctx, req.GetSpaceID(), pageInfo)
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "ListCustomOnlinePlugins failed, spaceID=%d", req.GetSpaceID())
	}

	return plugins, total, nil
}

func (p *PluginApplicationService) toPluginInfoForPlayground(ctx context.Context, pl *entity.PluginInfo, tools []*entity.ToolInfo) (*common.PluginInfoForPlayground, error) {
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
			RunMode:    common.RunMode_Sync,
			Parameters: params,
		})
	}

	var creator *common.Creator
	userInfo, err := p.userSVC.GetUserInfo(context.Background(), pl.DeveloperID)
	if err != nil {
		logs.CtxErrorf(ctx, "get user info failed, err=%v", err)
		creator = common.NewCreator()
	} else {
		creator = &common.Creator{
			ID:             strconv.FormatInt(pl.DeveloperID, 10),
			Name:           userInfo.Name,
			AvatarURL:      userInfo.IconURL,
			UserUniqueName: userInfo.UniqueName,
		}
	}

	iconURL, err := p.oss.GetObjectUrl(ctx, pl.GetIconURI())
	if err != nil {
		logs.Errorf("get plugin icon url failed, err=%v", err)
	}

	authType, ok := model.ToThriftAuthType(pl.GetAuthInfo().Type)
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%s'", pl.GetAuthInfo().Type)
	}

	pluginInfo := &common.PluginInfoForPlayground{
		Auth:           int32(authType),
		CreateTime:     strconv.FormatInt(pl.CreatedAt/1000, 10),
		CreationMethod: common.CreationMethod_COZE,
		Creator:        creator,
		DescForHuman:   pl.GetDesc(),
		ID:             strconv.FormatInt(pl.ID, 10),
		IsOfficial:     pl.IsOfficial(),
		MaterialID:     strconv.FormatInt(pl.ID, 10),
		Name:           pl.GetName(),
		PluginIcon:     iconURL,
		PluginType:     pl.PluginType,
		SpaceID:        strconv.FormatInt(pl.SpaceID, 10),
		StatisticData:  common.NewPluginStatisticData(),
		Status:         common.PluginStatus_SUBMITTED,
		UpdateTime:     strconv.FormatInt(pl.UpdatedAt/1000, 10),
		ProjectID:      strconv.FormatInt(pl.GetAPPID(), 10),
		VersionName:    pl.GetVersion(),
		VersionTs:      pl.GetVersion(), // Compatible with front-end logic, in theory VersionName should be used
		PluginApis:     pluginAPIs,
	}

	return pluginInfo, nil
}

func (p *PluginApplicationService) RegisterPluginMeta(ctx context.Context, req *pluginAPI.RegisterPluginMetaRequest) (resp *pluginAPI.RegisterPluginMetaResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	_authType, ok := model.ToAuthType(req.GetAuthType())
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%d'", req.GetAuthType())
	}
	authType := ptr.Of(_authType)

	var authSubType *model.AuthzSubType
	if req.SubAuthType != nil {
		_authSubType, ok := model.ToAuthSubType(req.GetSubAuthType())
		if !ok {
			return nil, fmt.Errorf("invalid sub authz type '%d'", req.GetSubAuthType())
		}
		authSubType = ptr.Of(_authSubType)
	}

	var loc model.HTTPParamLocation
	if *authType == model.AuthzTypeOfService {
		if req.GetLocation() == common.AuthorizationServiceLocation_Query {
			loc = model.ParamInQuery
		} else if req.GetLocation() == common.AuthorizationServiceLocation_Header {
			loc = model.ParamInHeader
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
			AuthzType:    authType,
			Location:     ptr.Of(loc),
			Key:          req.Key,
			ServiceToken: req.ServiceToken,
			OAuthInfo:    req.OauthInfo,
			AuthzSubType: authSubType,
			AuthzPayload: req.AuthPayload,
		},
	}
	pluginID, err := p.DomainSVC.CreateDraftPlugin(ctx, r)
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftPlugin failed")
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Created,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResSubType:    ptr.Of(int32(req.GetPluginType())),
			ResID:         pluginID,
			Name:          &req.Name,
			SpaceID:       &req.SpaceID,
			APPID:         req.ProjectID,
			OwnerID:       userID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_UnPublished),
			CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish resource '%d' failed, err=%v", pluginID, err)
	}

	resp = &pluginAPI.RegisterPluginMetaResponse{
		PluginID: pluginID,
	}

	return resp, nil
}

func (p *PluginApplicationService) RegisterPlugin(ctx context.Context, req *pluginAPI.RegisterPluginRequest) (resp *pluginAPI.RegisterPluginResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	mf := &entity.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, &mf)
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	mf.LogoURL = commonConsts.DefaultPluginIcon

	doc, err := openapi3.NewLoader().LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	res, err := p.DomainSVC.CreateDraftPluginWithCode(ctx, &service.CreateDraftPluginWithCodeRequest{
		SpaceID:     req.GetSpaceID(),
		DeveloperID: *userID,
		ProjectID:   req.ProjectID,
		Manifest:    mf,
		OpenapiDoc:  ptr.Of(model.Openapi3T(*doc)),
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftPluginWithCode failed")
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Created,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResSubType:    ptr.Of(int32(res.Plugin.PluginType)),
			ResID:         res.Plugin.ID,
			Name:          ptr.Of(res.Plugin.GetName()),
			APPID:         req.ProjectID,
			SpaceID:       &req.SpaceID,
			OwnerID:       userID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_UnPublished),
			CreateTimeMS:  ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish resource '%d' failed, err=%v", res.Plugin.ID, err)
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
			toolID, err := strconv.ParseInt(id, 10, 64)
			if err != nil {
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
		pageInfo := entity.PageInfo{
			Page:       int(req.Page),
			Size:       int(req.Size),
			SortBy:     ptr.Of(entity.SortByCreatedAt),
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
		method, ok := model.ToThriftAPIMethod(tool.GetMethod())
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
		if tmp, ok := tool.Operation.Extensions[model.APISchemaExtendAuthMode].(string); ok {
			if mode, ok := model.ToThriftAPIAuthMode(model.ToolAuthMode(tmp)); ok {
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
				if tool.GetActivatedStatus() == model.DeactivateTool {
					return true
				}
				return false
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

func (p *PluginApplicationService) GetPluginInfo(ctx context.Context, req *pluginAPI.GetPluginInfoRequest) (resp *pluginAPI.GetPluginInfoResponse, err error) {
	draftPlugin, err := p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateGetPluginInfoRequest failed")
	}

	metaInfo, err := p.getPluginMetaInfo(ctx, draftPlugin)
	if err != nil {
		return nil, err
	}

	codeInfo, err := p.getPluginCodeInfo(ctx, draftPlugin)
	if err != nil {
		return nil, err
	}

	_, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID, repository.WithPluginID())
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
	}

	resp = &pluginAPI.GetPluginInfoResponse{
		MetaInfo:       metaInfo,
		CodeInfo:       codeInfo,
		Creator:        common.NewCreator(),
		StatisticData:  common.NewPluginStatisticData(),
		PluginType:     draftPlugin.PluginType,
		CreationMethod: common.CreationMethod_COZE,
		Published:      exist,
	}

	return resp, nil
}

func (p *PluginApplicationService) getPluginCodeInfo(ctx context.Context, draftPlugin *entity.PluginInfo) (*common.CodeInfo, error) {
	tools, err := p.toolRepo.GetPluginAllDraftTools(ctx, draftPlugin.ID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", draftPlugin.ID)
	}

	paths := openapi3.Paths{}
	for _, tool := range tools {
		if tool.GetActivatedStatus() == model.DeactivateTool {
			continue
		}
		item := &openapi3.PathItem{}
		item.SetOperation(tool.GetMethod(), tool.Operation.Operation)
		paths[tool.GetSubURL()] = item
	}
	draftPlugin.OpenapiDoc.Paths = paths

	manifestStr, err := sonic.MarshalString(draftPlugin.Manifest)
	if err != nil {
		return nil, fmt.Errorf("marshal manifest failed, err=%v", err)
	}

	docBytes, err := yaml.Marshal(draftPlugin.OpenapiDoc)
	if err != nil {
		return nil, fmt.Errorf("marshal openapi doc failed, err=%v", err)
	}

	codeInfo := &common.CodeInfo{
		OpenapiDesc: string(docBytes),
		PluginDesc:  manifestStr,
	}

	return codeInfo, nil
}

func (p *PluginApplicationService) getPluginMetaInfo(ctx context.Context, draftPlugin *entity.PluginInfo) (*common.PluginMetaInfo, error) {
	commonParams := make(map[common.ParameterLocation][]*common.CommonParamSchema, len(draftPlugin.Manifest.CommonParams))
	for loc, params := range draftPlugin.Manifest.CommonParams {
		location, ok := model.ToThriftHTTPParamLocation(loc)
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
		logs.CtxWarnf(ctx, "get icon url with '%s' failed, err=%v", draftPlugin.GetIconURI(), err)
	}

	metaInfo := &common.PluginMetaInfo{
		Name: draftPlugin.GetName(),
		Desc: draftPlugin.GetDesc(),
		URL:  draftPlugin.GetServerURL(),
		Icon: &common.PluginIcon{
			URI: draftPlugin.GetIconURI(),
			URL: iconURL,
		},
		CommonParams: commonParams,
	}

	err = p.fillAuthInfoInMetaInfo(ctx, draftPlugin, metaInfo)
	if err != nil {
		return nil, errorx.Wrapf(err, "fillAuthInfoInMetaInfo failed, pluginID=%d", draftPlugin.ID)
	}

	return metaInfo, nil
}

func (p *PluginApplicationService) fillAuthInfoInMetaInfo(ctx context.Context, draftPlugin *entity.PluginInfo, metaInfo *common.PluginMetaInfo) (err error) {
	authInfo := draftPlugin.GetAuthInfo()
	authType, ok := model.ToThriftAuthType(authInfo.Type)
	if !ok {
		return fmt.Errorf("invalid auth type '%s'", authInfo.Type)
	}

	var subAuthType *int32
	if authInfo.SubType != "" {
		_subAuthType, ok := model.ToThriftAuthSubType(authInfo.SubType)
		if !ok {
			return fmt.Errorf("invalid sub authz type '%s'", authInfo.SubType)
		}
		subAuthType = &_subAuthType
	}

	metaInfo.AuthType = append(metaInfo.AuthType, authType)
	metaInfo.SubAuthType = subAuthType

	if authType == common.AuthorizationType_None {
		return nil
	}

	if authType == common.AuthorizationType_Service {
		var loc common.AuthorizationServiceLocation
		_loc := model.HTTPParamLocation(strings.ToLower(string(authInfo.AuthOfAPIToken.Location)))
		if _loc == model.ParamInHeader {
			loc = common.AuthorizationServiceLocation_Header
		} else if _loc == model.ParamInQuery {
			loc = common.AuthorizationServiceLocation_Query
		} else {
			return fmt.Errorf("invalid location '%s'", authInfo.AuthOfAPIToken.Location)
		}

		metaInfo.Location = ptr.Of(loc)
		metaInfo.Key = ptr.Of(authInfo.AuthOfAPIToken.Key)
		metaInfo.ServiceToken = ptr.Of(authInfo.AuthOfAPIToken.ServiceToken)
	}

	if authType == common.AuthorizationType_OAuth {
		metaInfo.OauthInfo = &authInfo.Payload
	}

	return nil
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

func (p *PluginApplicationService) GetUserAuthority(ctx context.Context, req *pluginAPI.GetUserAuthorityRequest) (resp *pluginAPI.GetUserAuthorityResponse, err error) {
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
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrSearchPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	res, err := p.DomainSVC.GetOAuthStatus(ctx, *userID, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOAuthStatus failed, pluginID=%d", req.PluginID)
	}
	resp = &pluginAPI.GetOAuthStatusResponse{
		IsOauth: res.IsOauth,
		Status:  res.Status,
		Content: res.OAuthURL,
	}

	return resp, nil
}

func (p *PluginApplicationService) CheckAndLockPluginEdit(ctx context.Context, req *pluginAPI.CheckAndLockPluginEditRequest) (resp *pluginAPI.CheckAndLockPluginEditResponse, err error) {
	resp = &pluginAPI.CheckAndLockPluginEditResponse{
		Data: &common.CheckAndLockPluginEditData{
			Seized: true,
		},
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
		ActivatedStatus: ptr.Of(model.ActivateTool),
		DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
		SubURL:          ptr.Of("/" + defaultSubURL),
		Method:          ptr.Of(http.MethodGet),
		Operation: model.NewOpenapi3Operation(&openapi3.Operation{
			Summary:     req.Desc,
			OperationID: req.Name,
			Parameters:  []*openapi3.ParameterRef{},
			RequestBody: entity.DefaultOpenapi3RequestBody(),
			Responses:   entity.DefaultOpenapi3Responses(),
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

	op, err := pluginutil.APIParamsToOpenapiOperation(req.RequestParams, req.ResponseParams)
	if err != nil {
		return nil, err
	}

	var method *string
	if m, ok := model.ToHTTPMethod(req.GetMethod()); ok {
		method = &m
	}

	updateReq := &service.UpdateDraftToolRequest{
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

func (p *PluginApplicationService) UpdatePlugin(ctx context.Context, req *pluginAPI.UpdatePluginRequest) (resp *pluginAPI.UpdatePluginResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateUpdatePluginRequest failed")
	}

	userID := ctxutil.GetUIDFromCtx(ctx)

	loader := openapi3.NewLoader()
	_doc, err := loader.LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	doc := ptr.Of(model.Openapi3T(*_doc))

	manifest := &entity.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, manifest)
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	err = p.DomainSVC.UpdateDraftPluginWithCode(ctx, &service.UpdateDraftPluginWithCodeRequest{
		UserID:     *userID,
		PluginID:   req.PluginID,
		OpenapiDoc: doc,
		Manifest:   manifest,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "UpdateDraftPluginWithCode failed, pluginID=%d", req.PluginID)
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
		logs.CtxErrorf(ctx, "publish resource '%d' failed, err=%v", req.PluginID, err)
	}

	resp = &pluginAPI.UpdatePluginResponse{
		Data: &common.UpdatePluginData{
			Res: true,
		},
	}

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

func (p *PluginApplicationService) DelPlugin(ctx context.Context, req *pluginAPI.DelPluginRequest) (resp *pluginAPI.DelPluginResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateDelPluginRequest failed")
	}

	err = p.DomainSVC.DeleteDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "DeleteDraftPlugin failed, pluginID=%d", req.PluginID)
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
		return nil, errorx.Wrapf(err, "publish resource '%d' failed", req.PluginID)
	}

	resp = &pluginAPI.DelPluginResponse{}

	return resp, nil
}

func (p *PluginApplicationService) PublishPlugin(ctx context.Context, req *pluginAPI.PublishPluginRequest) (resp *pluginAPI.PublishPluginResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validatePublishPluginRequest failed")
	}

	err = p.DomainSVC.PublishPlugin(ctx, &service.PublishPluginRequest{
		PluginID:    req.PluginID,
		Version:     req.VersionName,
		VersionDesc: req.VersionDesc,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "PublishPlugin failed, pluginID=%d", req.PluginID)
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
		logs.CtxErrorf(ctx, "publish resource '%d' failed, err=%v", req.PluginID, err)
	}

	resp = &pluginAPI.PublishPluginResponse{}

	return resp, nil
}

func (p *PluginApplicationService) UpdatePluginMeta(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (resp *pluginAPI.UpdatePluginMetaResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateUpdatePluginMetaRequest failed")
	}

	authInfo, err := getUpdateAuthInfo(ctx, req)
	if err != nil {
		return nil, err
	}

	updateReq := &service.UpdateDraftPluginRequest{
		PluginID:     req.PluginID,
		Name:         req.Name,
		Desc:         req.Desc,
		URL:          req.URL,
		Icon:         req.Icon,
		CommonParams: req.CommonParams,
		AuthInfo:     authInfo,
	}
	err = p.DomainSVC.UpdateDraftPlugin(ctx, updateReq)
	if err != nil {
		return nil, errorx.Wrapf(err, "UpdateDraftPlugin failed, pluginID=%d", req.PluginID)
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
		logs.CtxErrorf(ctx, "publish resource '%d' failed, err=%v", req.PluginID, err)
	}

	resp = &pluginAPI.UpdatePluginMetaResponse{}

	return resp, nil
}

func getUpdateAuthInfo(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (authInfo *service.PluginAuthInfo, err error) {
	if req.AuthType == nil {
		return nil, nil
	}

	_authType, ok := model.ToAuthType(req.GetAuthType())
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%d'", req.GetAuthType())
	}
	authType := &_authType

	var authSubType *model.AuthzSubType
	if req.SubAuthType != nil {
		_authSubType, ok := model.ToAuthSubType(req.GetSubAuthType())
		if !ok {
			return nil, fmt.Errorf("invalid sub authz type '%d'", req.GetSubAuthType())
		}
		authSubType = &_authSubType
	}

	var location *model.HTTPParamLocation
	if req.Location != nil {
		if *req.Location == common.AuthorizationServiceLocation_Header {
			location = ptr.Of(model.ParamInHeader)
		} else if *req.Location == common.AuthorizationServiceLocation_Query {
			location = ptr.Of(model.ParamInQuery)
		} else {
			return nil, fmt.Errorf("invalid location '%d'", req.GetLocation())
		}
	}

	authInfo = &service.PluginAuthInfo{
		AuthzType:    authType,
		Location:     location,
		Key:          req.Key,
		ServiceToken: req.ServiceToken,
		OAuthInfo:    req.OauthInfo,
		AuthzSubType: authSubType,
		AuthzPayload: req.AuthPayload,
	}

	return authInfo, nil
}

func (p *PluginApplicationService) GetBotDefaultParams(ctx context.Context, req *pluginAPI.GetBotDefaultParamsRequest) (resp *pluginAPI.GetBotDefaultParamsResponse, err error) {
	_, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID, repository.WithPluginID())
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	draftAgentTool, err := p.DomainSVC.GetDraftAgentToolByName(ctx, req.BotID, req.APIName)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftAgentToolByName failed, agentID=%d, toolName=%s", req.BotID, req.APIName)
	}

	reqAPIParams, err := draftAgentTool.ToReqAPIParameter()
	if err != nil {
		return nil, err
	}
	respAPIParams, err := draftAgentTool.ToRespAPIParameter()
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
		return nil, errorx.Wrapf(err, "UpdateBotDefaultParams failed, agentID=%d, toolName=%s", req.BotID, req.APIName)
	}

	resp = &pluginAPI.UpdateBotDefaultParamsResponse{}

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
		opts = append(opts, model.WithInvalidRespProcessStrategy(model.InvalidResponseProcessStrategyOfReturnErr))
	case common.DebugOperation_Parse:
		opts = append(opts, model.WithAutoGenRespSchema(),
			model.WithInvalidRespProcessStrategy(model.InvalidResponseProcessStrategyOfReturnRaw),
		)
	}

	res, err := p.DomainSVC.ExecuteTool(ctx, &service.ExecuteToolRequest{
		UserID:          conv.Int64ToStr(*userID),
		PluginID:        req.PluginID,
		ToolID:          req.APIID,
		ExecScene:       model.ExecSceneOfToolDebug,
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

func (p *PluginApplicationService) UnlockPluginEdit(ctx context.Context, req *pluginAPI.UnlockPluginEditRequest) (resp *pluginAPI.UnlockPluginEditResponse, err error) {
	resp = &pluginAPI.UnlockPluginEditResponse{
		Released: true,
	}
	return resp, nil
}

func (p *PluginApplicationService) PublicGetProductList(ctx context.Context, req *productAPI.GetProductListRequest) (resp *productAPI.GetProductListResponse, err error) {
	res, err := p.DomainSVC.ListPluginProducts(ctx, &service.ListPluginProductsRequest{})
	if err != nil {
		return nil, errorx.Wrapf(err, "ListPluginProducts failed")
	}

	products := make([]*productAPI.ProductInfo, 0, len(res.Plugins))
	for _, pl := range res.Plugins {
		tls, err := p.toolRepo.GetPluginAllOnlineTools(ctx, pl.ID)
		if err != nil {
			return nil, errorx.Wrapf(err, "GetPluginAllOnlineTools failed, pluginID=%d", pl.ID)
		}

		pi, err := p.buildProductInfo(ctx, pl, tls)
		if err != nil {
			return nil, err
		}

		products = append(products, pi)
	}

	if req.GetKeyword() != "" {
		filterProducts := make([]*productAPI.ProductInfo, 0, len(products))
		for _, _p := range products {
			if strings.Contains(strings.ToLower(_p.MetaInfo.Name), strings.ToLower(req.GetKeyword())) {
				filterProducts = append(filterProducts, _p)
			}
		}
		products = filterProducts
	}

	resp = &productAPI.GetProductListResponse{
		Data: &productAPI.GetProductListData{
			Products: products,
			HasMore:  false, // Finish at one time
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
		logs.CtxWarnf(ctx, "get icon url failed with '%s', err=%v", plugin.GetIconURI(), err)
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

	authInfo := plugin.GetAuthInfo()

	authMode := ptr.Of(productAPI.PluginAuthMode_NoAuth)
	if authInfo != nil {
		if authInfo.Type == model.AuthzTypeOfService || authInfo.Type == model.AuthzTypeOfOAuth {
			authMode = ptr.Of(productAPI.PluginAuthMode_Required)
			err := plugin.Manifest.Validate(false)
			if err != nil {
				logs.CtxWarnf(ctx, "validate plugin manifest failed, err=%v", err)
			} else {
				authMode = ptr.Of(productAPI.PluginAuthMode_Configured)
			}
		}
	}

	ei.AuthMode = authMode

	return ei, nil
}

func (p *PluginApplicationService) PublicGetProductDetail(ctx context.Context, req *productAPI.GetProductDetailRequest) (resp *productAPI.GetProductDetailResponse, err error) {
	plugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.GetEntityID())
	if err != nil {
		return nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.GetEntityID())
	}
	if !exist {
		return nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	tools, err := p.toolRepo.GetPluginAllOnlineTools(ctx, plugin.ID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginAllOnlineTools failed, pluginID=%d", plugin.ID)
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
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateGetPluginNextVersionRequest failed")
	}

	nextVersion, err := p.DomainSVC.GetPluginNextVersion(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetPluginNextVersion failed, pluginID=%d", req.PluginID)
	}
	resp = &pluginAPI.GetPluginNextVersionResponse{
		NextVersionName: nextVersion,
	}
	return resp, nil
}

func (p *PluginApplicationService) GetDevPluginList(ctx context.Context, req *pluginAPI.GetDevPluginListRequest) (resp *pluginAPI.GetDevPluginListResponse, err error) {
	pageInfo := entity.PageInfo{
		Name:       req.Name,
		Page:       int(req.GetPage()),
		Size:       int(req.GetSize()),
		OrderByACS: ptr.Of(false),
	}
	if req.GetOrderBy() == common.OrderBy_UpdateTime {
		pageInfo.SortBy = ptr.Of(entity.SortByUpdatedAt)
	} else {
		pageInfo.SortBy = ptr.Of(entity.SortByCreatedAt)
	}

	res, err := p.DomainSVC.ListDraftPlugins(ctx, &service.ListDraftPluginsRequest{
		SpaceID:  req.SpaceID,
		APPID:    req.ProjectID,
		PageInfo: pageInfo,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "ListDraftPlugins failed, spaceID=%d, appID=%d", req.SpaceID, req.ProjectID)
	}

	pluginList := make([]*common.PluginInfoForPlayground, 0, len(res.Plugins))
	for _, pl := range res.Plugins {
		tools, err := p.toolRepo.GetPluginAllDraftTools(ctx, pl.ID)
		if err != nil {
			return nil, errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", pl.ID)
		}

		pluginInfo, err := p.toPluginInfoForPlayground(ctx, pl, tools)
		if err != nil {
			return nil, err
		}

		pluginInfo.VersionTs = "0" // when you get the plugin information in the project, version ts is set to 0 by default
		pluginList = append(pluginList, pluginInfo)
	}

	resp = &pluginAPI.GetDevPluginListResponse{
		PluginList: pluginList,
		Total:      res.Total,
	}

	return resp, nil
}

func (p *PluginApplicationService) getDevPluginListByName(ctx context.Context, req *pluginAPI.GetDevPluginListRequest) (pluginList []*common.PluginInfoForPlayground, total int64, err error) {
	limit := req.GetSize()
	if limit == 0 {
		limit = 10
	}

	res, err := crosssearch.DefaultSVC().SearchResources(ctx, &searchModel.SearchResourcesRequest{
		SpaceID:  req.SpaceID,
		APPID:    req.ProjectID,
		Name:     req.GetName(),
		OrderAsc: false,
		ResTypeFilter: []resCommon.ResType{
			resCommon.ResType_Plugin,
		},
		Page:  req.Page,
		Limit: limit,
	})
	if err != nil {
		return nil, 0, errorx.Wrapf(err, "SearchResources failed, spaceID=%d, appID=%d", req.SpaceID, req.ProjectID)
	}

	pluginList = make([]*common.PluginInfoForPlayground, 0, len(res.Data))
	for _, pl := range res.Data {
		draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, pl.ResID)
		if err != nil {
			return nil, 0, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", pl.ResID)
		}
		if !exist {
			logs.CtxWarnf(ctx, "plugin not exist, pluginID=%d", pl.ResID)
			continue
		}

		tools, err := p.toolRepo.GetPluginAllDraftTools(ctx, draftPlugin.ID)
		if err != nil {
			return nil, 0, errorx.Wrapf(err, "GetPluginAllDraftTools failed, pluginID=%d", draftPlugin.ID)
		}

		pluginInfo, err := p.toPluginInfoForPlayground(ctx, draftPlugin, tools)
		if err != nil {
			return nil, 0, err
		}

		pluginInfo.VersionTs = "0" // when you get the plugin information in the project, version ts is set to 0 by default
		pluginList = append(pluginList, pluginInfo)
	}

	if res.TotalHits != nil {
		total = *res.TotalHits
	}

	return pluginList, total, nil
}

func (p *PluginApplicationService) DeleteAPPAllPlugins(ctx context.Context, appID int64) (err error) {
	pluginIDs, err := p.DomainSVC.DeleteAPPAllPlugins(ctx, appID)
	if err != nil {
		return errorx.Wrapf(err, "DeleteAPPAllPlugins failed, appID=%d", appID)
	}

	for _, id := range pluginIDs {
		err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
			OpType: searchEntity.Deleted,
			Resource: &searchEntity.ResourceDocument{
				ResType: resCommon.ResType_Plugin,
				ResID:   id,
			},
		})
		if err != nil {
			return errorx.Wrapf(err, "publish resource '%d' failed", id)
		}
	}

	return nil
}

func (p *PluginApplicationService) Convert2OpenAPI(ctx context.Context, req *pluginAPI.Convert2OpenAPIRequest) (resp *pluginAPI.Convert2OpenAPIResponse, err error) {
	res := p.DomainSVC.ConvertToOpenapi3Doc(ctx, &service.ConvertToOpenapi3DocRequest{
		RawInput:        req.Data,
		PluginServerURL: req.PluginURL,
	})

	if res.ErrMsg != "" {
		return &pluginAPI.Convert2OpenAPIResponse{
			Code:              errno.ErrPluginInvalidThirdPartyCode,
			Msg:               res.ErrMsg,
			DuplicateAPIInfos: []*common.DuplicateAPIInfo{},
			PluginDataFormat:  ptr.Of(res.Format),
		}, nil
	}

	doc, err := yaml.Marshal(res.OpenapiDoc)
	if err != nil {
		return nil, fmt.Errorf("marshal openapi doc failed, err=%v", err)
	}
	mf, err := json.Marshal(res.Manifest)
	if err != nil {
		return nil, fmt.Errorf("marshal manifest failed, err=%v", err)
	}

	resp = &pluginAPI.Convert2OpenAPIResponse{
		PluginDataFormat:  ptr.Of(res.Format),
		Openapi:           ptr.Of(string(doc)),
		AiPlugin:          ptr.Of(string(mf)),
		DuplicateAPIInfos: []*common.DuplicateAPIInfo{},
	}

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

	res, err := p.DomainSVC.CreateDraftToolsWithCode(ctx, &service.CreateDraftToolsWithCodeRequest{
		PluginID:          req.PluginID,
		OpenapiDoc:        ptr.Of(model.Openapi3T(*doc)),
		ConflictAndUpdate: req.ReplaceSamePaths,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CreateDraftToolsWithCode failed, pluginID=%d", req.PluginID)
	}

	duplicated := slices.Transform(res.DuplicatedTools, func(e entity.UniqueToolAPI) *common.PluginAPIInfo {
		method, _ := model.ToThriftAPIMethod(e.Method)
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

func (p *PluginApplicationService) RevokeAuthToken(ctx context.Context, req *pluginAPI.RevokeAuthTokenRequest) (resp *pluginAPI.RevokeAuthTokenResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	err = p.DomainSVC.RevokeAccessToken(ctx, &entity.AuthorizationCodeMeta{
		UserID:   conv.Int64ToStr(*userID),
		PluginID: req.PluginID,
		IsDraft:  req.GetBotID() == 0,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "RevokeAccessToken failed, pluginID=%d", req.PluginID)
	}

	resp = &pluginAPI.RevokeAuthTokenResponse{}

	return resp, nil
}

func (p *PluginApplicationService) CopyPlugin(ctx context.Context, req *CopyPluginRequest) (resp *CopyPluginResponse, err error) {
	res, err := p.DomainSVC.CopyPlugin(ctx, &service.CopyPluginRequest{
		UserID:      req.UserID,
		PluginID:    req.PluginID,
		CopyScene:   req.CopyScene,
		TargetAPPID: req.TargetAPPID,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "CopyPlugin failed, pluginID=%d", req.PluginID)
	}

	plugin := res.Plugin

	now := time.Now().UnixMilli()
	resDoc := &searchEntity.ResourceDocument{
		ResType:       resCommon.ResType_Plugin,
		ResSubType:    ptr.Of(int32(plugin.PluginType)),
		ResID:         plugin.ID,
		Name:          ptr.Of(plugin.GetName()),
		SpaceID:       &plugin.SpaceID,
		APPID:         plugin.APPID,
		OwnerID:       &req.UserID,
		PublishStatus: ptr.Of(resCommon.PublishStatus_UnPublished),
		CreateTimeMS:  ptr.Of(now),
	}
	if plugin.Published() {
		resDoc.PublishStatus = ptr.Of(resCommon.PublishStatus_Published)
		resDoc.PublishTimeMS = ptr.Of(now)
	}

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType:   searchEntity.Created,
		Resource: resDoc,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish resource '%d' failed", plugin.ID)
	}

	resp = &CopyPluginResponse{
		Plugin: res.Plugin,
		Tools:  res.Tools,
	}

	return resp, nil
}

func (p *PluginApplicationService) MoveAPPPluginToLibrary(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	plugin, err = p.DomainSVC.MoveAPPPluginToLibrary(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "MoveAPPPluginToLibrary failed, pluginID=%d", pluginID)
	}

	now := time.Now().UnixMilli()

	err = p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Plugin,
			ResID:         pluginID,
			APPID:         ptr.Of(int64(0)),
			PublishStatus: ptr.Of(resCommon.PublishStatus_Published),
			PublishTimeMS: ptr.Of(now),
			UpdateTimeMS:  ptr.Of(now),
		},
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "publish resource '%d' failed", pluginID)
	}

	return plugin, nil
}

func (p *PluginApplicationService) validateDraftPluginAccess(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	plugin, err = p.DomainSVC.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", pluginID)
	}

	// 首先检查是否是插件开发者
	if plugin.DeveloperID == *uid {
		return plugin, nil
	}

	// 如果不是开发者，检查是否是空间成员
	// 检查用户是否是空间成员
	isMember, _, _, _, err := p.userSVC.CheckMemberPermission(ctx, plugin.SpaceID, *uid)
	if err != nil {
		logs.CtxErrorf(ctx, "failed to check member permission for user(%d) in space(%d): %v", *uid, plugin.SpaceID, err)
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "failed to check space member permission"))
	}

	if !isMember {
		logs.CtxErrorf(ctx, "user(%d) is not a member of space(%d) for plugin(%d)", *uid, plugin.SpaceID, pluginID)
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "you are not a member of this space"))
	}

	// 是空间成员，允许访问
	logs.CtxInfof(ctx, "user(%d) is a member of space(%d), allowing access to plugin(%d)", *uid, plugin.SpaceID, pluginID)
	return plugin, nil
}

func (p *PluginApplicationService) OauthAuthorizationCode(ctx context.Context, req *botOpenAPI.OauthAuthorizationCodeReq) (resp *botOpenAPI.OauthAuthorizationCodeResp, err error) {
	stateStr, err := url.QueryUnescape(req.State)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	secret := os.Getenv(encrypt.StateSecretEnv)
	if secret == "" {
		secret = encrypt.DefaultStateSecret
	}

	stateBytes, err := encrypt.DecryptByAES(stateStr, secret)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	state := &entity.OAuthState{}
	err = json.Unmarshal(stateBytes, state)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "invalid state"))
	}

	err = p.DomainSVC.OAuthCode(ctx, req.Code, state)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginOAuthFailed, errorx.KV(errno.PluginMsgKey, "authorize failed"))
	}

	resp = &botOpenAPI.OauthAuthorizationCodeResp{}

	return resp, nil
}

func (p *PluginApplicationService) GetQueriedOAuthPluginList(ctx context.Context, req *pluginAPI.GetQueriedOAuthPluginListRequest) (resp *pluginAPI.GetQueriedOAuthPluginListResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	status, err := p.DomainSVC.GetAgentPluginsOAuthStatus(ctx, *userID, req.BotID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetAgentPluginsOAuthStatus failed, userID=%d, agentID=%d", *userID, req.BotID)
	}

	if len(status) == 0 {
		return &pluginAPI.GetQueriedOAuthPluginListResponse{
			OauthPluginList: []*pluginAPI.OAuthPluginInfo{},
		}, nil
	}

	oauthPluginList := make([]*pluginAPI.OAuthPluginInfo, 0, len(status))
	for _, s := range status {
		oauthPluginList = append(oauthPluginList, &pluginAPI.OAuthPluginInfo{
			PluginID:   s.PluginID,
			Status:     s.Status,
			Name:       s.PluginName,
			PluginIcon: s.PluginIconURL,
		})
	}

	resp = &pluginAPI.GetQueriedOAuthPluginListResponse{
		OauthPluginList: oauthPluginList,
	}

	return resp, nil
}
