package singleagent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	knowledge2 "code.byted.org/flow/opencoze/backend/domain/knowledge"
)

func NewKnowledge(knlSvc knowledge2.Knowledge) crossdomain.Knowledge {
	return knlSvc
}
