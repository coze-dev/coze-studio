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
	"fmt"
	"strings"
	"time"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"

	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

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
		if tool.IsDeactivated() {
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
		location, ok := convert.ToThriftHTTPParamLocation(loc)
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
	authType, ok := convert.ToThriftAuthType(authInfo.Type)
	if !ok {
		return fmt.Errorf("invalid auth type '%s'", authInfo.Type)
	}

	var subAuthType *int32
	if authInfo.SubType != "" {
		_subAuthType, ok := convert.ToThriftAuthSubType(authInfo.SubType)
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
		_loc := consts.HTTPParamLocation(strings.ToLower(string(authInfo.AuthOfAPIToken.Location)))
		if _loc == consts.ParamInHeader {
			loc = common.AuthorizationServiceLocation_Header
		} else if _loc == consts.ParamInQuery {
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

	manifest := &model.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, manifest)
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	err = p.DomainSVC.UpdateDraftPluginWithCode(ctx, &dto.UpdateDraftPluginWithCodeRequest{
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

func (p *PluginApplicationService) UpdatePluginMeta(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (resp *pluginAPI.UpdatePluginMetaResponse, err error) {
	_, err = p.validateDraftPluginAccess(ctx, req.PluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "validateUpdatePluginMetaRequest failed")
	}

	authInfo, err := getUpdateAuthInfo(ctx, req)
	if err != nil {
		return nil, err
	}

	updateReq := &dto.UpdateDraftPluginRequest{
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

func getUpdateAuthInfo(ctx context.Context, req *pluginAPI.UpdatePluginMetaRequest) (authInfo *dto.PluginAuthInfo, err error) {
	if req.AuthType == nil {
		return nil, nil
	}

	_authType, ok := convert.ToAuthType(req.GetAuthType())
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%d'", req.GetAuthType())
	}
	authType := &_authType

	var authSubType *consts.AuthzSubType
	if req.SubAuthType != nil {
		_authSubType, ok := convert.ToAuthSubType(req.GetSubAuthType())
		if !ok {
			return nil, fmt.Errorf("invalid sub authz type '%d'", req.GetSubAuthType())
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

	authInfo = &dto.PluginAuthInfo{
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
