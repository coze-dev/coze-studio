package singleagent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

func NewDatabase(wfSvr service.Database) crossdomain.Database {
	return wfSvr
}
