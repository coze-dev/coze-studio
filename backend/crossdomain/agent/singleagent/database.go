package singleagent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
)

func NewDatabase(wfSvr database.Database) crossdomain.Database {
	return wfSvr
}
