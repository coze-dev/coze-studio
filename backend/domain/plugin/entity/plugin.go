package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Plugin struct {
	common.Info

	APIs []*PluginAPI
}

type PluginAPI struct {
	ApiID      int64
	ApiName    string
	Parameters []*PluginParameter
}

type PluginParameter struct {
	Name      string
	Desc      string
	Required  bool
	Type      DataType
	SubParams []*PluginParameter
	Enum      []string
}
