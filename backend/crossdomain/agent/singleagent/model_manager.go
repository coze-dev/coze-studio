package singleagent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel"
)

type ModelManagerConfig struct {
	ModelMgrSVC chatmodel.Manager
}

func NewModelManagerService(conf *ModelManagerConfig) crossdomain.Workflow {
	return nil
}
