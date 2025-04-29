package convertor

import (
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func ToolDraftToDO(tool *model.ToolDraft) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              tool.ID,
		PluginID:        tool.PluginID,
		Name:            &tool.Name,
		Desc:            &tool.Desc,
		CreatedAt:       tool.CreatedAt,
		UpdatedAt:       tool.UpdatedAt,
		SubURL:          &tool.SubURL,
		Method:          ptr.Of(tool.Method),
		Operation:       tool.Operation,
		DebugStatus:     ptr.Of(common.APIDebugStatus(tool.DebugStatus)),
		ActivatedStatus: ptr.Of(consts.ActivatedStatus(tool.ActivatedStatus)),
	}
}

func ToolToDO(tool *model.Tool) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              tool.ID,
		PluginID:        tool.PluginID,
		Name:            &tool.Name,
		Desc:            &tool.Desc,
		CreatedAt:       tool.CreatedAt,
		UpdatedAt:       tool.UpdatedAt,
		Version:         &tool.Version,
		SubURL:          &tool.SubURL,
		Method:          ptr.Of(tool.Method),
		Operation:       tool.Operation,
		ActivatedStatus: ptr.Of(consts.ActivatedStatus(tool.ActivatedStatus)),
	}
}

func ToolVersionToDO(tool *model.ToolVersion) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        tool.ID,
		PluginID:  tool.PluginID,
		Name:      &tool.Name,
		Desc:      &tool.Desc,
		CreatedAt: tool.CreatedAt,
		Version:   &tool.Version,
		SubURL:    &tool.SubURL,
		Method:    ptr.Of(tool.Method),
		Operation: tool.Operation,
	}
}
