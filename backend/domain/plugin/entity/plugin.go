package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Plugin struct {
	common.Info

	ApiIDs []int64
}

type PluginAPI struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	DeveloperID int64
	SpaceID     int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

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
