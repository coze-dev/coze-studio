package agent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Agent struct {
	common.Info
	entity.AgentType

	ReactAgent *singleagent.SingleAgent
}
