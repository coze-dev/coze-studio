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
		CreatedAt:   plugin.CreatedAt,
		UpdatedAt:   plugin.UpdatedAt,
		ServerURL:   &plugin.ServerURL,
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
		CreatedAt:   plugin.CreatedAt,
		UpdatedAt:   plugin.UpdatedAt,
		Version:     &plugin.Version,
		ServerURL:   &plugin.ServerURL,
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
		PrivacyInfoInJson: &plugin.PrivacyInfo,
		CreatedAt:         plugin.CreatedAt,
		Version:           &plugin.Version,
		ServerURL:         &plugin.ServerURL,
	}
}
