package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

	// Draft Tool
	MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	UpdateDraftTool(ctx context.Context, req *UpdateToolDraftRequest) (err error)
	ConvertToOpenapi3Doc(ctx context.Context, req *ConvertToOpenapi3DocRequest) (resp *ConvertToOpenapi3DocResponse)
	CreateDraftToolsWithCode(ctx context.Context, req *CreateDraftToolsWithCodeRequest) (resp *CreateDraftToolsWithCodeResponse, err error)

	// Online Tool
	GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error)
	MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	MGetVersionTools(ctx context.Context, versionTools []entity.VersionTool) (tools []*entity.ToolInfo, err error)
	CopyPlugin(ctx context.Context, req *CopyPluginRequest) (plugin *entity.PluginInfo, err error)
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

	GetOAuthStatus(ctx context.Context, pluginID int64) (resp *GetOAuthStatusResponse, err error)
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
		_oauthInfo := &model.AuthOfOAuthClientCredentials{
			ClientID:     oauthInfo["client_id"],
			ClientSecret: oauthInfo["client_secret"],
			TokenURL:     oauthInfo["token_url"],
			Scopes:       strings.Split(oauthInfo["scope"], " "),
		}

		str, err := sonic.MarshalString(_oauthInfo)
		if err != nil {
			return nil, fmt.Errorf("marshal oauth info failed, err=%v", err)
		}

		return &model.AuthV2{
			Type:                         model.AuthzTypeOfOAuth,
			SubType:                      model.AuthzSubTypeOfOAuthClientCredentials,
			Payload:                      &str,
			AuthOfOAuthClientCredentials: _oauthInfo,
		}, nil
	}

	if *p.AuthzSubType == model.AuthzSubTypeOfOAuthAuthorizationCode {
		contentType := oauthInfo["authorization_content_type"]
		if contentType != model.MediaTypeJson { // only support application/json
			return nil, errorx.New(errno.ErrPluginInvalidManifest, errorx.KVf(errno.PluginMsgKey,
				"the type '%s' of authorization content is invalid", contentType))
		}

		_oauthInfo := &model.AuthOfOAuthAuthorizationCode{
			ClientID:                 oauthInfo["client_id"],
			ClientSecret:             oauthInfo["client_secret"],
			ClientURL:                oauthInfo["client_url"],
			Scopes:                   strings.Split(oauthInfo["scope"], " "),
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
			Payload:                      &str,
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
			Payload:        &str,
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

type UpdateToolDraftRequest struct {
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

type CopyPluginRequest struct {
	UserID    int64
	PluginID  int64
	CopyScene model.CopyScene

	TargetAPPID *int64
}

type MoveAPPPluginToLibRequest struct {
	PluginID int64
}
