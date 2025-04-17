package convertor

import (
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
)

func AgentToolVersionToDO(tool *model.AgentToolVersion) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:             tool.ToolID,
		Version:        &tool.ToolVersion,
		ReqParameters:  tool.RequestParams,
		RespParameters: tool.ResponseParams,
	}
}

func AgentToolDraftToDO(tool *model.AgentToolDraft) *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:             tool.ToolID,
		CreatedAt:      tool.CreatedAt,
		Version:        &tool.ToolVersion,
		ReqParameters:  tool.RequestParams,
		RespParameters: tool.ResponseParams,
	}
}
