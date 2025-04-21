package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
)

type Workflow struct {
	ID      int64
	Name    string
	Desc    string
	IconURI string
	Version string

	ReqParameters  []*plugin_common.APIParameter
	RespParameters []*plugin_common.APIParameter
}

type WorkflowIdentity struct {
	ID      int64
	Version string
}
