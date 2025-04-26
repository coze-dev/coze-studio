package convertor

import (
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
)

func PluginDraftToDO(plugin *model.PluginDraft) *entity.PluginInfo {
	return &entity.PluginInfo{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		Name:        &plugin.Name,
		Desc:        &plugin.Desc,
		IconURI:     &plugin.IconURI,
		ServerURL:   &plugin.ServerURL,
		CreatedAt:   plugin.CreatedAt,
		UpdatedAt:   plugin.UpdatedAt,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	}
}

func PluginToDO(plugin *model.Plugin) *entity.PluginInfo {
	return &entity.PluginInfo{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		Name:        &plugin.Name,
		Desc:        &plugin.Desc,
		IconURI:     &plugin.IconURI,
		ServerURL:   &plugin.ServerURL,
		CreatedAt:   plugin.CreatedAt,
		UpdatedAt:   plugin.UpdatedAt,
		Version:     &plugin.Version,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	}
}

func PluginVersionToDO(plugin *model.PluginVersion) *entity.PluginInfo {
	return &entity.PluginInfo{
		ID:                plugin.ID,
		SpaceID:           plugin.SpaceID,
		DeveloperID:       plugin.DeveloperID,
		Name:              &plugin.Name,
		Desc:              &plugin.Desc,
		IconURI:           &plugin.IconURI,
		ServerURL:         &plugin.ServerURL,
		PrivacyInfoInJson: &plugin.PrivacyInfo,
		CreatedAt:         plugin.CreatedAt,
		Version:           &plugin.Version,
		Manifest:          plugin.Manifest,
		OpenapiDoc:        plugin.OpenapiDoc,
	}
}
