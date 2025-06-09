package plugin

import (
	api "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
)

type VersionPlugin struct {
	PluginID int64
	Version  string
}

type VersionTool struct {
	ToolID  int64
	Version string
}

type MGetPluginLatestVersionResponse struct {
	Versions map[int64]string // pluginID vs version
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

func (p PluginInfo) GetName() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.NameForHuman
}

func (p PluginInfo) GetDesc() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.DescriptionForHuman
}

func (p PluginInfo) GetAuthInfo() *AuthV2 {
	if p.Manifest == nil {
		return nil
	}
	return p.Manifest.Auth
}

type VersionAgentTool struct {
	ToolName *string
	ToolID   int64

	AgentVersion *string
}

type MGetAgentToolsRequest struct {
	AgentID int64
	SpaceID int64
	IsDraft bool

	VersionAgentTools []VersionAgentTool
}

type ExecuteToolRequest struct {
	PluginID      int64
	ToolID        int64
	ExecDraftTool bool
	ExecScene     ExecuteScene

	ArgumentsInJson string
}

type ExecuteToolResponse struct {
	Tool        *ToolInfo
	TrimmedResp string
	RawResp     string
}

type PublishPluginRequest struct {
	PluginID    int64
	Version     string
	VersionDesc string
}

type PublishAPPPluginsRequest struct {
	APPID   int64
	Version string
}

type PublishAPPPluginsResponse struct {
	FailedPlugins   []*PluginInfo
	AllDraftPlugins []*PluginInfo
}

type CheckCanPublishPluginsRequest struct {
	PluginIDs []int64
	Version   string
}

type CheckCanPublishPluginsResponse struct {
	InvalidPlugins []*PluginInfo
}
