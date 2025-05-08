package model

import (
	"code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func AgentToolVersionToDO(tool *AgentToolVersion) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        tool.ToolID,
		Version:   &tool.ToolVersion,
		Operation: tool.Operation,
	}
}

func AgentToolDraftToDO(tool *AgentToolDraft) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        tool.ToolID,
		CreatedAt: tool.CreatedAt,
		Version:   &tool.ToolVersion,
		Operation: tool.Operation,
	}
}

func PluginDraftToDO(plugin *PluginDraft) *entity.PluginInfo {
	return &entity.PluginInfo{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		ProjectID:   &plugin.ProjectID,
		IconURI:     &plugin.IconURI,
		ServerURL:   &plugin.ServerURL,
		CreatedAt:   plugin.CreatedAt,
		UpdatedAt:   plugin.UpdatedAt,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	}
}

func PluginToDO(plugin *Plugin) *entity.PluginInfo {
	return &entity.PluginInfo{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		IconURI:     &plugin.IconURI,
		ServerURL:   &plugin.ServerURL,
		CreatedAt:   plugin.CreatedAt,
		UpdatedAt:   plugin.UpdatedAt,
		Version:     &plugin.Version,
		VersionDesc: &plugin.VersionDesc,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	}
}

func PluginVersionToDO(plugin *PluginVersion) *entity.PluginInfo {
	return &entity.PluginInfo{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		IconURI:     &plugin.IconURI,
		ServerURL:   &plugin.ServerURL,
		CreatedAt:   plugin.CreatedAt,
		Version:     &plugin.Version,
		VersionDesc: &plugin.VersionDesc,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	}
}

func ToolDraftToDO(tool *ToolDraft) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              tool.ID,
		PluginID:        tool.PluginID,
		CreatedAt:       tool.CreatedAt,
		UpdatedAt:       tool.UpdatedAt,
		SubURL:          &tool.SubURL,
		Method:          ptr.Of(tool.Method),
		Operation:       tool.Operation,
		DebugStatus:     ptr.Of(plugin_develop_common.APIDebugStatus(tool.DebugStatus)),
		ActivatedStatus: ptr.Of(consts.ActivatedStatus(tool.ActivatedStatus)),
	}
}

func ToolToDO(tool *Tool) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              tool.ID,
		PluginID:        tool.PluginID,
		CreatedAt:       tool.CreatedAt,
		UpdatedAt:       tool.UpdatedAt,
		Version:         &tool.Version,
		SubURL:          &tool.SubURL,
		Method:          ptr.Of(tool.Method),
		Operation:       tool.Operation,
		ActivatedStatus: ptr.Of(consts.ActivatedStatus(tool.ActivatedStatus)),
	}
}

func ToolVersionToDO(tool *ToolVersion) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        tool.ID,
		PluginID:  tool.PluginID,
		CreatedAt: tool.CreatedAt,
		Version:   &tool.Version,
		SubURL:    &tool.SubURL,
		Method:    ptr.Of(tool.Method),
		Operation: tool.Operation,
	}
}
