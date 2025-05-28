package crossagent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
)

// Requests and responses must not reference domain entities and can only use models under api/model/crossdomain.
type SingleAgent interface {
	StreamExecute(ctx context.Context, historyMsg []*message.Message, query *message.Message,
		agentRuntime *singleagent.AgentRuntime) (*schema.StreamReader[*singleagent.AgentEvent], error)
	GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *singleagent.SingleAgent, err error)
}

var defaultSVC SingleAgent

func DefaultSVC() SingleAgent {
	return defaultSVC
}

func SetDefaultSVC(svc SingleAgent) {
	defaultSVC = svc
}
