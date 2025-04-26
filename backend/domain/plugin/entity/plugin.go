package entity

import (
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type PluginInfo struct {
	ID                int64
	PluginType        common.PluginType
	SpaceID           int64
	DeveloperID       int64
	Name              *string
	Desc              *string
	IconURI           *string
	ServerURL         *string
	Version           *string
	PrivacyInfoInJson *string

	CreatedAt int64
	UpdatedAt int64

	Manifest   *PluginManifest
	OpenapiDoc *openapi3.T

	Tools []*ToolInfo
}

func (p PluginInfo) GetName() string {
	return ptr.FromOrDefault(p.Name, "")
}

func (p PluginInfo) GetDesc() string {
	return ptr.FromOrDefault(p.Desc, "")
}

func (p PluginInfo) GetIconURI() string {
	return ptr.FromOrDefault(p.IconURI, "")
}

func (p PluginInfo) GetServerURL() string {
	return ptr.FromOrDefault(p.ServerURL, "")
}

func (p PluginInfo) GetVersion() string {
	return ptr.FromOrDefault(p.Version, "")
}

func (p PluginInfo) GetPrivacyInfoInJson() string {
	return ptr.FromOrDefault(p.PrivacyInfoInJson, "")
}

type ToolInfo struct {
	ID        int64
	PluginID  int64
	Name      *string
	Desc      *string
	CreatedAt int64
	UpdatedAt int64
	Version   *string

	ActivatedStatus *consts.ActivatedStatus
	DebugStatus     *common.APIDebugStatus

	Method    *string
	SubURL    *string
	Operation *openapi3.Operation
}

func (t ToolInfo) GetName() string {
	return ptr.FromOrDefault(t.Name, "")
}

func (t ToolInfo) GetDesc() string {
	return ptr.FromOrDefault(t.Desc, "")
}

func (t ToolInfo) GetVersion() string {
	return ptr.FromOrDefault(t.Version, "")
}

func (t ToolInfo) GetActivatedStatus() consts.ActivatedStatus {
	return ptr.FromOrDefault(t.ActivatedStatus, consts.ActivateTool)
}

func (t ToolInfo) GetSubURL() string {
	return ptr.FromOrDefault(t.SubURL, "")
}

func (t ToolInfo) GetMethod() string {
	return ptr.FromOrDefault(t.Method, "")
}

func (t ToolInfo) GetDebugStatus() common.APIDebugStatus {
	return ptr.FromOrDefault(t.DebugStatus, common.APIDebugStatus_DebugWaiting)
}

type AgentToolIdentity struct {
	AgentID   int64
	UserID    int64
	ToolID    int64
	VersionMs *int64
}

type VersionTool struct {
	ToolID  int64
	Version *string
}

type VersionAgentTool struct {
	ToolID    int64
	VersionMs *int64
}

type PluginManifest struct {
	SchemaVersion string `json:"schema_version" validate:"required"`
	Name          string `json:"name" validate:"required"`
	Description   string `json:"description" validate:"required"`
	//NameForModel              string                            `json:"name_for_model" validate:"required"`
	//NameForHuman              string                            `json:"name_for_human" validate:"required"`
	//DescriptionForModel       string                            `json:"description_for_model" validate:"required"`
	//DescriptionForHuman       string                            `json:"description_for_human" validate:"required"`
	Auth         *Auth  `json:"auth"`
	LogoURL      string `json:"logo_url"`
	ContactEmail string `json:"contact_email"`
	LegalInfoURL string `json:"legal_info_url"`
	//IdeCodeRuntime            string                            `json:"ide_code_runtime,omitempty"`
	API          APIDesc                         `json:"api" `
	CommonParams map[string][]*CommonParamSchema `json:"common_params" `
	//SelectMode   *int32                          `json:"select_mode" `
	//APIExtend                 map[string]map[string]interface{} `json:"api_extend"`
	//DescriptionForClaudeModel string `json:"description_for_claude3"`
	//FixedExportIP *bool `json:"fixed_export_ip,omitempty"`
}

type Auth struct {
	Type                     string `json:"type" validate:"required"`
	AuthorizationType        string `json:"authorization_type,omitempty"`
	ClientURL                string `json:"client_url,omitempty"`
	Scope                    string `json:"scope,omitempty"`
	AuthorizationURL         string `json:"authorization_url,omitempty"`
	AuthorizationContentType string `json:"authorization_content_type,omitempty"`
	Platform                 string `json:"platform,omitempty"`
	ClientID                 string `json:"client_id,omitempty"`
	ClientSecret             string `json:"client_secret,omitempty"`
	Location                 string `json:"location,omitempty"`
	Key                      string `json:"key,omitempty"`
	ServiceToken             string `json:"service_token"`
	SubType                  string `json:"sub_type"`
	Payload                  string `json:"payload"`
}

type CommonParamSchema struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type APIDesc struct {
	Type string `json:"type"`
	URL  string `json:"url"`
	//Package string `json:"package,omitempty"`
}

type UniqueToolAPI struct {
	SubURL string
	Method string
}
