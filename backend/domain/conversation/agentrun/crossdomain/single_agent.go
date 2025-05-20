package crossdomain

import (
	"context"

	"github.com/cloudwego/eino/schema"

	sad "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type AgentInfo = sad.SingleAgent

type AgentRuntime struct {
	AgentVersion string
	IsDraft      bool
	SpaceID      int64
}
type SingleAgent interface {
	StreamExecute(ctx context.Context, historyMsg []*entity.Message, query *entity.Message, agentRuntime *AgentRuntime) (*schema.StreamReader[*sad.AgentEvent], error)
	GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *AgentInfo, err error)
}
