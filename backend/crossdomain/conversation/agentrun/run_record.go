package agentrun

import (
	agentrun "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/service"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/crossdomain"
)

func NewCDAgentRun(ar agentrun.Run) crossdomain.AgentRun {
	return ar
}
