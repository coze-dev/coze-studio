package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
)

type ToolInfo struct {
	ID       int64
	PluginID int64
	Name     string
	Desc     string

	HTTPMethod HTTPMethod
	URLSubPath string

	ReqParameters  []*plugin_common.APIParameter
	RespParameters []*plugin_common.APIParameter
}

type ToolIdentity struct {
	ToolID   int64
	PluginID int64
}
