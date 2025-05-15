package singleagent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
)

type ModelManagerConfig struct {
	ModelMgrSVC modelmgr.Manager
}

func NewModelManager(conf *ModelManagerConfig) crossdomain.ModelMgr {
	return conf.ModelMgrSVC
}
