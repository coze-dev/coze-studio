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

// convertPluginToProductInfo converts a plugin entity to ProductInfo
func convertPluginToProductInfo(plugin *entity.PluginInfo) *productAPI.ProductInfo {
	return &productAPI.ProductInfo{
		MetaInfo: &productAPI.ProductMetaInfo{
			ID:          plugin.ID,
			Name:        plugin.GetName(),
			EntityID:    plugin.ID,
			Description: plugin.GetDesc(),
			IconURL:     plugin.GetIconURI(),
			ListedAt:    plugin.CreatedAt,
		},
		PluginExtra: &productAPI.PluginExtraInfo{
			IsOfficial: plugin.IsOfficial(),
		},
	}
}

// convertPluginsToProductInfos converts a slice of plugins to ProductInfo slice
func convertPluginsToProductInfos(plugins []*entity.PluginInfo) []*productAPI.ProductInfo {
	products := make([]*productAPI.ProductInfo, 0, len(plugins))
	for _, plugin := range plugins {
		products = append(products, convertPluginToProductInfo(plugin))
	}
	return products
}

// getSaasPluginList is a common method to get SaaS plugin list from domain service
func (t *PluginApplicationService) getSaasPluginList(ctx context.Context) ([]*entity.PluginInfo, int64, error) {
	domainReq := &dto.ListPluginProductsRequest{}
	domainResp, err := t.DomainSVC.ListSaasPluginProducts(ctx, domainReq)
	if err != nil {
		return nil, 0, err
	}
	return domainResp.Plugins, domainResp.Total, nil
}

// convertPluginsToSuggestions converts plugins to suggestion products with deduplication and limit
func convertPluginsToSuggestions(plugins []*entity.PluginInfo, limit int) []*productAPI.ProductInfo {
	suggestionProducts := make([]*productAPI.ProductInfo, 0, len(plugins))
	suggestionSet := make(map[string]bool) // Use map to avoid duplicates

	for _, plugin := range plugins {
		// Add plugin as suggestion if name is unique
		if plugin.GetName() != "" && !suggestionSet[plugin.GetName()] {
			suggestionProducts = append(suggestionProducts, convertPluginToProductInfo(plugin))
			suggestionSet[plugin.GetName()] = true
		}

		// Limit suggestions to avoid too many results
		if len(suggestionProducts) >= limit {
			break
		}
	}

	return suggestionProducts
}

func (t *PluginApplicationService) GetCozeSaasPluginList(ctx context.Context, req *productAPI.GetProductListRequest) (resp *productAPI.GetProductListResponse, err error) {
	plugins, total, err := t.getSaasPluginList(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "ListSaasPluginProducts failed: %v", err)
		return &productAPI.GetProductListResponse{
			Code:    -1,
			Message: "Failed to get SaaS plugin list",
		}, nil
	}

	products := convertPluginsToProductInfos(plugins)

	return &productAPI.GetProductListResponse{
		Code:    0,
		Message: "success",
		Data: &productAPI.GetProductListData{
			Products: products,
			Total:    int32(total),
			HasMore:  false,
		},
	}, nil
}

func (t *PluginApplicationService) PublicSearchProduct(ctx context.Context, req *productAPI.SearchProductRequest) (resp *productAPI.SearchProductResponse, err error) {
	plugins, total, err := t.getSaasPluginList(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "ListSaasPluginProducts failed: %v", err)
		return &productAPI.SearchProductResponse{
			Code:    -1,
			Message: "Failed to search SaaS plugins",
		}, nil
	}

	products := convertPluginsToProductInfos(plugins)

	return &productAPI.SearchProductResponse{
		Code:    0,
		Message: "success",
		Data: &productAPI.SearchProductResponseData{
			Products: products,
			Total:    ptr.Of(int32(total)),
			HasMore:  ptr.Of(false),
		},
	}, nil
}

func (t *PluginApplicationService) PublicSearchSuggest(ctx context.Context, req *productAPI.SearchSuggestRequest) (resp *productAPI.SearchSuggestResponse, err error) {
	plugins, _, err := t.getSaasPluginList(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "ListSaasPluginProducts for suggestions failed: %v", err)
		return &productAPI.SearchSuggestResponse{
			Code:    -1,
			Message: "Failed to get search suggestions",
		}, nil
	}

	// Convert plugins to suggestions with limit of 10
	suggestionProducts := convertPluginsToSuggestions(plugins, 10)

	return &productAPI.SearchSuggestResponse{
		Code:    0,
		Message: "success",
		Data: &productAPI.SearchSuggestResponseData{
			SuggestionV2: suggestionProducts,
			HasMore:      ptr.Of(false),
		},
	}, nil
}

func (t *PluginApplicationService) GetSaasProductCategoryList(ctx context.Context, req *productAPI.GetProductCategoryListRequest) (resp *productAPI.GetProductCategoryListResponse, err error) {
	// 构建 domain 层请求
	domainReq := &dto.ListPluginCategoriesRequest{}

	// 根据请求参数设置查询条件
	if req.GetEntityType() == productCommon.ProductEntityType_SaasPlugin {
		domainReq.EntityType = ptr.Of("plugin")
	}

	// 调用 domain 层服务
	domainResp, err := t.DomainSVC.ListSaasPluginCategories(ctx, domainReq)
	if err != nil {
		logs.CtxErrorf(ctx, "ListSaasPluginCategories failed: %v", err)
		return &productAPI.GetProductCategoryListResponse{
			Code:    -1,
			Message: "Failed to get SaaS plugin categories",
		}, nil
	}

	// 转换响应数据
	categories := make([]*productAPI.ProductCategory, 0)
	if domainResp.Data != nil && domainResp.Data.Items != nil {
		for _, item := range domainResp.Data.Items {
			// 将字符串 ID 转换为 int64
			categoryID, _ := strconv.ParseInt(item.ID, 10, 64)
			categories = append(categories, &productAPI.ProductCategory{
				ID:   categoryID,
				Name: item.Name,
			})
		}
	}

	return &productAPI.GetProductCategoryListResponse{
		Code:    0,
		Message: "success",
		Data: &productAPI.GetProductCategoryListData{
			EntityType: req.GetEntityType(),
			Categories: categories,
		},
	}, nil
}

func (t *PluginApplicationService) GetProductCallInfo(ctx context.Context, req *productAPI.GetProductCallInfoRequest) (resp *productAPI.GetProductCallInfoResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return &productAPI.GetProductCallInfoResponse{
			Code:    -1,
			Message: "User not authenticated",
		}, nil
	}

	// Call GetSaasUserInfo
	_, err = t.userSVC.GetSaasUserInfo(ctx, *userID)
	if err != nil {
		logs.CtxErrorf(ctx, "GetSaasUserInfo failed: %v", err)
		return &productAPI.GetProductCallInfoResponse{
			Code:    -1,
			Message: "Failed to get user info",
		}, nil
	}

	// Call GetUserBenefit
	_, err = t.userSVC.GetUserBenefit(ctx, *userID)
	if err != nil {
		logs.CtxErrorf(ctx, "GetUserBenefit failed: %v", err)
		return &productAPI.GetProductCallInfoResponse{
			Code:    -1,
			Message: "Failed to get user benefit",
		}, nil
	}

	// Build response data
	data := &productAPI.GetProductCallInfoData{
		McpJSON:   "", // TODO: Set appropriate MCP JSON based on requirements
		UserLevel: productAPI.UserLevel_Free, // TODO: Map from userBenefit to appropriate UserLevel
	}

	// TODO: Set CallCountLimit and CallRateLimit based on userBenefit
	// data.CallCountLimit = &productAPI.ProductCallCountLimit{...}
	// data.CallRateLimit = &productAPI.ProductCallRateLimit{...}

	return &productAPI.GetProductCallInfoResponse{
		Code:    0,
		Message: "success",
		Data:    data,
	}, nil
}
