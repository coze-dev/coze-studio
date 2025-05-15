package crossdomain

import (
	"context"

	"github.com/cloudwego/eino/schema"

	sad "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type AgentInfo = sad.SingleAgent

type SingleAgent interface {
	StreamExecute(ctx context.Context, historyMsg []*entity.Message, query *entity.Message) (*schema.StreamReader[*sad.AgentEvent], error)
	GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *AgentInfo, err error)
}
