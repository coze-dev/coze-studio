package plugin

import (
	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type CopyPluginRequest struct {
	PluginID    int64
	UserID      int64
	CopyScene   model.CopyScene
	TargetAPPID *int64
}

type CopyPluginResponse struct {
	Plugin  *entity.PluginInfo
	ToolIDs map[int64]int64 // old tool id -> new tool id
}
