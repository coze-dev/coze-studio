package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Plugin struct {
	common.Info

	ApiIDs []int64
}

type PluginAPI struct {
	common.Info

	PluginID int64

	ReqParameters  []*ParameterInfo
	RespParameters []*ParameterInfo
}

type ParameterInfo struct {
	Name              string
	Desc              string
	Required          bool
	Type              DataType
	SubParams         []*ParameterInfo
	Enum              []string
	Default           string // Default Value
	NotVisibleToModel bool
}
