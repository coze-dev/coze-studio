package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
)

type ToolInfo struct {
	PluginID int64

	ID      int64
	Name    string
	Desc    string
	Version string

	ReqMethod  HTTPMethod
	SubURLPath string

	ReqParameters  []*plugin_common.APIParameter
	RespParameters []*plugin_common.APIParameter
}
