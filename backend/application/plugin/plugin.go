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
	"strings"
	"time"

	productCommon "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_common"
	productAPI "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"
	pluginAPI "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin/convert/api"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
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

func (p *PluginApplicationService) CheckAndLockPluginEdit(ctx context.Context, req *pluginAPI.CheckAndLockPluginEditRequest) (resp *pluginAPI.CheckAndLockPluginEditResponse, err error) {
	resp = &pluginAPI.CheckAndLockPluginEditResponse{
		Data: &common.CheckAndLockPluginEditData{
			Seized: true,
		},
	}

	return resp, nil
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
	op, err := api.APIParamsToOpenapiOperation(req.RequestParams, req.ResponseParams)
	if err != nil {
		return nil, err
	}

	err = p.DomainSVC.UpdateBotDefaultParams(ctx, &dto.UpdateBotDefaultParamsRequest{
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

func (p *PluginApplicationService) UnlockPluginEdit(ctx context.Context, req *pluginAPI.UnlockPluginEditRequest) (resp *pluginAPI.UnlockPluginEditResponse, err error) {
	resp = &pluginAPI.UnlockPluginEditResponse{
		Released: true,
	}
	return resp, nil
}

func (p *PluginApplicationService) PublicGetProductList(ctx context.Context, req *productAPI.GetProductListRequest) (resp *productAPI.GetProductListResponse, err error) {
	res, err := p.DomainSVC.ListPluginProducts(ctx, &dto.ListPluginProductsRequest{})
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
		if authInfo.Type == consts.AuthzTypeOfService || authInfo.Type == consts.AuthzTypeOfOAuth {
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

func (p *PluginApplicationService) validateDraftPluginAccess(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "session is required"))
	}

	plugin, err = p.DomainSVC.GetDraftPlugin(ctx, pluginID)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", pluginID)
	}

	if plugin.DeveloperID != *uid {
		return nil, errorx.New(errno.ErrPluginPermissionCode, errorx.KV(errno.PluginMsgKey, "you are not the plugin owner"))
	}

	return plugin, nil
}
