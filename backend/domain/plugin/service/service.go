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

package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

//go:generate mockgen -destination ../../../internal/mock/domain/plugin/interface.go --package mockPlugin -source service.go
type PluginService interface {
	// Draft Plugin
	CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (pluginID int64, err error)
	CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error)
	GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGetDraftPlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error)
	UpdateDraftPlugin(ctx context.Context, plugin *UpdateDraftPluginRequest) (err error)
	UpdateDraftPluginWithCode(ctx context.Context, req *UpdateDraftPluginWithCodeRequest) (err error)
	DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error)
	DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error)
	GetAPPAllPlugins(ctx context.Context, appID int64) (plugins []*entity.PluginInfo, err error)

	// Online Plugin
	PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error)
	PublishAPPPlugins(ctx context.Context, req *PublishAPPPluginsRequest) (resp *PublishAPPPluginsResponse, err error)
	GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *MGetPluginLatestVersionResponse, err error)
	GetPluginNextVersion(ctx context.Context, pluginID int64) (version string, err error)
	MGetVersionPlugins(ctx context.Context, versionPlugins []entity.VersionPlugin) (plugins []*entity.PluginInfo, err error)
	ListCustomOnlinePlugins(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error)

	// Draft Tool
	MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	UpdateDraftTool(ctx context.Context, req *UpdateDraftToolRequest) (err error)
	ConvertToOpenapi3Doc(ctx context.Context, req *ConvertToOpenapi3DocRequest) (resp *ConvertToOpenapi3DocResponse)
	CreateDraftToolsWithCode(ctx context.Context, req *CreateDraftToolsWithCodeRequest) (resp *CreateDraftToolsWithCodeResponse, err error)
	CheckPluginToolsDebugStatus(ctx context.Context, pluginID int64) (err error)

	// Online Tool
	GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error)
	MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	MGetVersionTools(ctx context.Context, versionTools []entity.VersionTool) (tools []*entity.ToolInfo, err error)
	CopyPlugin(ctx context.Context, req *CopyPluginRequest) (resp *CopyPluginResponse, err error)
	MoveAPPPluginToLibrary(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)

	// Agent Tool
	BindAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error)
	DuplicateDraftAgentTools(ctx context.Context, fromAgentID, toAgentID int64) (err error)
	GetDraftAgentToolByName(ctx context.Context, agentID int64, toolName string) (tool *entity.ToolInfo, err error)
	MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (tools []*entity.ToolInfo, err error)
	UpdateBotDefaultParams(ctx context.Context, req *UpdateBotDefaultParamsRequest) (err error)

	PublishAgentTools(ctx context.Context, agentID int64, agentVersion string) (err error)

	ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpt) (resp *ExecuteToolResponse, err error)

	// Product
	ListPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error)
	GetPluginProductAllTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)

	GetOAuthStatus(ctx context.Context, userID, pluginID int64) (resp *GetOAuthStatusResponse, err error)
	GetAgentPluginsOAuthStatus(ctx context.Context, userID, agentID int64) (status []*AgentPluginOAuthStatus, err error)
	OAuthCode(ctx context.Context, code string, state *entity.OAuthState) (err error)
	GetAccessToken(ctx context.Context, oa *entity.OAuthInfo) (accessToken string, err error)
	RevokeAccessToken(ctx context.Context, meta *entity.AuthorizationCodeMeta) (err error)
}

type CreateDraftPluginRequest struct {
	PluginType   common.PluginType
	IconURI      string
	SpaceID      int64
	DeveloperID  int64
	ProjectID    *int64
	Name         string
	Desc         string
	ServerURL    string
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type UpdateDraftPluginWithCodeRequest struct {
	UserID     int64
	PluginID   int64
	OpenapiDoc *model.Openapi3T
	Manifest   *entity.PluginManifest
}

type UpdateDraftPluginRequest struct {
	PluginID     int64
	Name         *string
	Desc         *string
	URL          *string
	Icon         *common.PluginIcon
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type ListDraftPluginsRequest struct {
	SpaceID  int64
	APPID    int64
	PageInfo entity.PageInfo
}

type ListDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type CreateDraftPluginWithCodeRequest struct {
	SpaceID     int64
	DeveloperID int64
	ProjectID   *int64
	Manifest    *entity.PluginManifest
	OpenapiDoc  *model.Openapi3T
}

type CreateDraftPluginWithCodeResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}

type CreateDraftToolsWithCodeRequest struct {
	PluginID   int64
	OpenapiDoc *model.Openapi3T

	ConflictAndUpdate bool
}

type CreateDraftToolsWithCodeResponse struct {
	DuplicatedTools []entity.UniqueToolAPI
}

type PluginAuthInfo struct {
	AuthzType    *model.AuthzType
	Location     *model.HTTPParamLocation
	Key          *string
	ServiceToken *string
	OAuthInfo    *string
	AuthzSubType *model.AuthzSubType
	AuthzPayload *string
}

func (p PluginAuthInfo) toAuthV2() (*model.AuthV2, error) {
	if p.AuthzType == nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "auth type is required"))
	}

	switch *p.AuthzType {
	case model.AuthzTypeOfNone:
		return &model.AuthV2{
			Type: model.AuthzTypeOfNone,
		}, nil

	case model.AuthzTypeOfOAuth:
		m, err := p.authOfOAuthToAuthV2()
		if err != nil {
			return nil, err
		}
		return m, nil

	case model.AuthzTypeOfService:
		m, err := p.authOfServiceToAuthV2()
		if err != nil {
			return nil, err
		}
		return m, nil

	default:
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
			"the type '%s' of auth is invalid", *p.AuthzType))
	}
}

func (p PluginAuthInfo) authOfOAuthToAuthV2() (*model.AuthV2, error) {
	if p.AuthzSubType == nil {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "sub-auth type is required"))
	}

	if p.OAuthInfo == nil || *p.OAuthInfo == "" {
		return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "oauth info is required"))
	}

	oauthInfo := make(map[string]string)
	err := sonic.Unmarshal([]byte(*p.OAuthInfo), &oauthInfo)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginInvalidManifest, errorx.KV(errno.PluginMsgKey, "invalid oauth info"))
	}

	if *p.AuthzSubType == model.AuthzSubTypeOfOAuthClientCredentials {
		_oauthInfo := &model.OAuthClientCredentialsConfig{
			ClientID:     oauthInfo["client_id"],
			ClientSecret: oauthInfo["client_secret"],
			TokenURL:     oauthInfo["token_url"],
		}

		str, err := sonic.MarshalString(_oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("marshal oauth info failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:                         model.AuthzTypeOfOAuth,
			SubType:                      model.AuthzSubTypeOfOAuthClientCredentials,
			Payload:                      str,
			AuthOfOAuthClientCredentials: _oauthInfo,
		}, nil
	}

	if *p.AuthzSubType == model.AuthzSubTypeOfOAuthAuthorizationCode {
		contentType := oauthInfo["authorization_content_type"]
		if contentType != model.MediaTypeJson { // only support application/json
			return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
				"the type '%s' of authorization content is invalid", contentType))
		}

		_oauthInfo := &model.OAuthAuthorizationCodeConfig{
			ClientID:                 oauthInfo["client_id"],
			ClientSecret:             oauthInfo["client_secret"],
			ClientURL:                oauthInfo["client_url"],
			Scope:                    oauthInfo["scope"],
			AuthorizationURL:         oauthInfo["authorization_url"],
			AuthorizationContentType: contentType,
		}

		str, err := sonic.MarshalString(_oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("marshal oauth info failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:                         model.AuthzTypeOfOAuth,
			SubType:                      model.AuthzSubTypeOfOAuthAuthorizationCode,
			Payload:                      str,
			AuthOfOAuthAuthorizationCode: _oauthInfo,
		}, nil
	}

	return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
		"the type '%s' of sub-auth is invalid", *p.AuthzSubType))
}

func (p PluginAuthInfo) authOfServiceToAuthV2() (*model.AuthV2, error) {
	if p.AuthzSubType == nil {
		return nil, fmt.Errorf("sub-auth type is required")
	}

	if *p.AuthzSubType == model.AuthzSubTypeOfServiceAPIToken {
		if p.Location == nil {
			return nil, fmt.Errorf("'Location' of sub-auth is required")
		}
		if p.ServiceToken == nil {
			return nil, fmt.Errorf("'ServiceToken' of sub-auth is required")
		}
		if p.Key == nil {
			return nil, fmt.Errorf("'Key' of sub-auth is required")
		}

		tokenAuth := &model.AuthOfAPIToken{
			ServiceToken: *p.ServiceToken,
			Location:     model.HTTPParamLocation(strings.ToLower(string(*p.Location))),
			Key:          *p.Key,
		}

		str, err := sonic.MarshalString(tokenAuth)
		if err != nil {
			return nil, fmt.Errorf("marshal token auth failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:           model.AuthzTypeOfService,
			SubType:        model.AuthzSubTypeOfServiceAPIToken,
			Payload:        str,
			AuthOfAPIToken: tokenAuth,
		}, nil
	}

	return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
		"the type '%s' of sub-auth is invalid", *p.AuthzSubType))
}

type PublishPluginRequest = model.PublishPluginRequest

type PublishAPPPluginsRequest = model.PublishAPPPluginsRequest

type PublishAPPPluginsResponse = model.PublishAPPPluginsResponse

type MGetPluginLatestVersionResponse = model.MGetPluginLatestVersionResponse

type UpdateDraftToolRequest struct {
	PluginID     int64
	ToolID       int64
	Name         *string
	Desc         *string
	SubURL       *string
	Method       *string
	Parameters   openapi3.Parameters
	RequestBody  *openapi3.RequestBodyRef
	Responses    openapi3.Responses
	Disabled     *bool
	SaveExample  *bool
	DebugExample *common.DebugExample
	APIExtend    *common.APIExtend
}

type MGetAgentToolsRequest = model.MGetAgentToolsRequest

type UpdateBotDefaultParamsRequest struct {
	PluginID    int64
	AgentID     int64
	ToolName    string
	Parameters  openapi3.Parameters
	RequestBody *openapi3.RequestBodyRef
	Responses   openapi3.Responses
}

type ExecuteToolRequest = model.ExecuteToolRequest

type ExecuteToolResponse = model.ExecuteToolResponse

type ListPluginProductsRequest struct{}

type ListPluginProductsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type ConvertToOpenapi3DocRequest struct {
	RawInput        string
	PluginServerURL *string
}

type ConvertToOpenapi3DocResponse struct {
	OpenapiDoc *model.Openapi3T
	Manifest   *entity.PluginManifest
	Format     common.PluginDataFormat
	ErrMsg     string
}

type GetOAuthStatusResponse struct {
	IsOauth  bool
	Status   common.OAuthStatus
	OAuthURL string
}

type AgentPluginOAuthStatus struct {
	PluginID      int64
	PluginName    string
	PluginIconURL string
	Status        common.OAuthStatus
}

type CopyPluginRequest struct {
	UserID    int64
	PluginID  int64
	CopyScene model.CopyScene

	TargetAPPID *int64
}

type CopyPluginResponse struct {
	Plugin *entity.PluginInfo
	Tools  map[int64]*entity.ToolInfo // old tool id -> new tool
}

type MoveAPPPluginToLibRequest struct {
	PluginID int64
}

type GetAccessTokenRequest struct {
	UserID    string
	PluginID  *int64
	Mode      model.AuthzSubType
	OAuthInfo *entity.OAuthInfo
}
