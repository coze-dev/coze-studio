package plugin

import (
	api "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
)

type MGetVersionPluginsRequest struct {
	VersionPlugins []VersionPlugin
}

type VersionPlugin struct {
	PluginID int64
	Version  string
}

type MGetVersionPluginsResponse struct {
	Plugins []*PluginInfo
}

type PluginInfo struct {
	ID           int64
	PluginType   api.PluginType
	SpaceID      int64
	DeveloperID  int64
	APPID        *int64
	RefProductID *int64 // for product plugin
	IconURI      *string
	ServerURL    *string // TODO(@mrh): 去除，直接使用 doc 内的 servers 定义？
	Version      *string
	VersionDesc  *string

	CreatedAt int64
	UpdatedAt int64

	Manifest   *PluginManifest
	OpenapiDoc *Openapi3T
}

type PluginManifest struct {
	SchemaVersion       string                                         `json:"schema_version" yaml:"schema_version" validate:"required" `
	NameForModel        string                                         `json:"name_for_model" validate:"required" yaml:"name_for_model"`
	NameForHuman        string                                         `json:"name_for_human" yaml:"name_for_human" validate:"required" `
	DescriptionForModel string                                         `json:"description_for_model" validate:"required" yaml:"description_for_model"`
	DescriptionForHuman string                                         `json:"description_for_human" yaml:"description_for_human" validate:"required"`
	Auth                *AuthV2                                        `json:"auth" yaml:"auth" validate:"required"`
	LogoURL             string                                         `json:"logo_url" yaml:"logo_url" validate:"required"`
	API                 APIDesc                                        `json:"api" yaml:"api"`
	CommonParams        map[HTTPParamLocation][]*api.CommonParamSchema `json:"common_params" yaml:"common_params"`
}
type AuthV2 struct {
	Type        AuthType     `json:"type" validate:"required" yaml:"type"`
	SubType     AuthSubType  `json:"sub_type" yaml:"sub_type"`
	Payload     *string      `json:"payload,omitempty" yaml:"payload,omitempty"`
	AuthOfOIDC  *AuthOfOIDC  `json:"-"`
	AuthOfToken *AuthOfToken `json:"-"`
	AuthOfOAuth *AuthOfOAuth `json:"-"`
}

type AuthOfOIDC struct {
	GrantType    string `json:"grant_type"`
	EndpointURL  string `json:"endpoint_url"`
	Audience     string `json:"audience,omitempty"`
	ODICScope    string `json:"oidc_scope,omitempty"`
	ODICClientID string `json:"oidc_client_id,omitempty"`
}

type AuthOfToken struct {
	Location     HTTPParamLocation `json:"location"` // header or query
	Key          string            `json:"key"`
	ServiceToken string            `json:"service_token"`
}

type AuthOfOAuth struct {
	ClientID                 string `json:"client_id"`
	ClientSecret             string `json:"client_secret"`
	ClientURL                string `json:"client_url"`
	Scope                    string `json:"scope,omitempty"`
	AuthorizationURL         string `json:"authorization_url"`
	AuthorizationContentType string `json:"authorization_content_type"` // only support application/json
}

type APIDesc struct {
	Type PluginType `json:"type" validate:"required"`
}

type BindAgentToolsRequest struct {
	AgentID int64
	ToolIDs []int64
}

type VersionAgentTool struct {
	ToolName *string
	ToolID   int64

	VersionMS *int64
}

type MGetAgentToolsRequest struct {
	AgentID int64
	SpaceID int64
	IsDraft bool

	VersionAgentTools []VersionAgentTool
}

type MGetAgentToolsResponse struct {
	Tools []*ToolInfo
}

type ExecuteToolRequest struct {
	PluginID  int64
	ToolID    int64
	ExecScene ExecuteScene

	ArgumentsInJson string
}

type ExecuteToolResponse struct {
	Tool        *ToolInfo
	TrimmedResp string
	RawResp     string
}

type PublishAgentToolsRequest struct {
	AgentID int64
}

type PublishAgentToolsResponse struct {
	VersionTools map[int64]VersionAgentTool
}

type DeleteDraftPluginRequest struct {
	PluginID int64
}

type PublishPluginRequest struct {
	PluginID    int64
	Version     string
	VersionDesc string
}

type GetPluginNextVersionRequest struct {
	PluginID int64
}

type GetPluginNextVersionResponse struct {
	Version string
}
