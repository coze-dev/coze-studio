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
	"fmt"
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
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	commonConsts "github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *PluginApplicationService) RegisterPluginMeta(ctx context.Context, req *pluginAPI.RegisterPluginMetaRequest) (resp *pluginAPI.RegisterPluginMetaResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	_authType, ok := convert.ToAuthType(req.GetAuthType())
	if !ok {
		return nil, fmt.Errorf("invalid auth type '%d'", req.GetAuthType())
	}
	authType := ptr.Of(_authType)

	var authSubType *consts.AuthzSubType
	if req.SubAuthType != nil {
		_authSubType, ok := convert.ToAuthSubType(req.GetSubAuthType())
		if !ok {
			return nil, fmt.Errorf("invalid sub authz type '%d'", req.GetSubAuthType())
		}
		authSubType = ptr.Of(_authSubType)
	}

	var loc consts.HTTPParamLocation
	if *authType == consts.AuthzTypeOfService {
		if req.GetLocation() == common.AuthorizationServiceLocation_Query {
			loc = consts.ParamInQuery
		} else if req.GetLocation() == common.AuthorizationServiceLocation_Header {
			loc = consts.ParamInHeader
		} else {
			return nil, fmt.Errorf("invalid location '%s'", req.GetLocation())
		}
	}

	r := &dto.CreateDraftPluginRequest{
		PluginType:   req.GetPluginType(),
		SpaceID:      req.GetSpaceID(),
		DeveloperID:  *userID,
		IconURI:      req.Icon.URI,
		ProjectID:    req.ProjectID,
		Name:         req.GetName(),
		Desc:         req.GetDesc(),
		ServerURL:    req.GetURL(),
		CommonParams: req.CommonParams,
		AuthInfo: &dto.PluginAuthInfo{
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

	mf := &model.PluginManifest{}
	err = sonic.UnmarshalString(req.AiPlugin, &mf)
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	mf.LogoURL = commonConsts.DefaultPluginIcon

	doc, err := openapi3.NewLoader().LoadFromData([]byte(req.Openapi))
	if err != nil {
		return nil, errorx.New(errno.ErrPluginInvalidOpenapi3Doc, errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	res, err := p.DomainSVC.CreateDraftPluginWithCode(ctx, &dto.CreateDraftPluginWithCodeRequest{
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

func (p *PluginApplicationService) Convert2OpenAPI(ctx context.Context, req *pluginAPI.Convert2OpenAPIRequest) (resp *pluginAPI.Convert2OpenAPIResponse, err error) {
	res := p.DomainSVC.ConvertToOpenapi3Doc(ctx, &dto.ConvertToOpenapi3DocRequest{
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
