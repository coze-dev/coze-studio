package agent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
)

type Agent struct {
	entity.AgentType

	ReactAgent *singleagent.SingleAgent
}
