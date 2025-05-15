package agentrun

import (
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run"
)

func NewCDAgentRun(ar run.Run) crossdomain.AgentRun {
	return ar
}
