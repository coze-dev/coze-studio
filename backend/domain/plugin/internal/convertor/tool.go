package convertor

import (
	"code.byted.org/flow/opencoze/backend/api/model/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func ToolDraftToDO(tool *model.ToolDraft) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:             tool.ID,
		PluginID:       tool.PluginID,
		Name:           &tool.Name,
		Desc:           &tool.Desc,
		IconURI:        &tool.IconURI,
		CreatedAt:      tool.CreatedAt,
		UpdatedAt:      tool.UpdatedAt,
		SubURLPath:     &tool.SubURLPath,
		ReqMethod:      ptr.Of(plugin_common.APIMethod(tool.RequestMethod)),
		ReqParameters:  tool.RequestParams,
		RespParameters: tool.ResponseParams,
		DebugStatus:    ptr.Of(plugin_common.APIDebugStatus(tool.DebugStatus)),
		ActivatedStatus: func() *bool {
			if tool.ActivatedStatus == int32(ActivateTool) {
				return ptr.Of(true)
			}
			return ptr.Of(false)
		}(),
	}
}

func ToolToDO(tool *model.Tool) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:             tool.ID,
		PluginID:       tool.PluginID,
		Name:           &tool.Name,
		Desc:           &tool.Desc,
		IconURI:        &tool.IconURI,
		CreatedAt:      tool.CreatedAt,
		UpdatedAt:      tool.UpdatedAt,
		Version:        &tool.Version,
		SubURLPath:     &tool.SubURLPath,
		ReqMethod:      ptr.Of(plugin_common.APIMethod(tool.RequestMethod)),
		ReqParameters:  tool.RequestParams,
		RespParameters: tool.ResponseParams,
		ActivatedStatus: func() *bool {
			if tool.ActivatedStatus == int32(ActivateTool) {
				return ptr.Of(true)
			}
			return ptr.Of(false)
		}(),
	}
}

func ToolVersionToDO(tool *model.ToolVersion) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:             tool.ID,
		PluginID:       tool.PluginID,
		Name:           &tool.Name,
		Desc:           &tool.Desc,
		IconURI:        &tool.IconURI,
		CreatedAt:      tool.CreatedAt,
		Version:        &tool.Version,
		SubURLPath:     &tool.SubURLPath,
		ReqMethod:      ptr.Of(plugin_common.APIMethod(tool.RequestMethod)),
		ReqParameters:  tool.RequestParams,
		RespParameters: tool.ResponseParams,
	}
}
