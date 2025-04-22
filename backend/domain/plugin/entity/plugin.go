package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
)

type PluginInfo struct {
	ID                int64
	SpaceID           int64
	DeveloperID       int64
	Name              *string
	Desc              *string
	IconURI           *string
	Version           *string
	PrivacyInfoInJson *string

	CreatedAt int64
	UpdatedAt int64

	ServerURL *string

	Tools []*ToolInfo

	ToolsDescInYaml  *string
	PluginDescInJson *string
}

type ToolInfo struct {
	ID        int64
	PluginID  int64
	Name      *string
	Desc      *string
	IconURI   *string
	CreatedAt int64
	UpdatedAt int64
	Version   *string

	ActivatedStatus *bool
	DebugStatus     *plugin_common.APIDebugStatus

	ReqMethod  *plugin_common.APIMethod
	SubURLPath *string

	ReqParameters  []*plugin_common.APIParameter
	RespParameters []*plugin_common.APIParameter
}

func (t ToolInfo) GetName() string {
	if t.Name == nil {
		return ""
	}

	return *t.Name
}

func (t ToolInfo) GetDesc() string {
	if t.Desc == nil {
		return ""
	}

	return *t.Desc
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
