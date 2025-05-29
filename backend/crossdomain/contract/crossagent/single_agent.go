package crossagent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	arEntity "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type AgentInfo = entity.SingleAgent

type AgentRuntime struct {
	AgentVersion     string
	IsDraft          bool
	SpaceID          int64
	ConnectorID      int64
	PreRetrieveTools []*arEntity.Tool
}

type SingleAgent interface {
	StreamExecute(ctx context.Context, historyMsg []*msgEntity.Message, query *msgEntity.Message, agentRuntime *AgentRuntime) (*schema.StreamReader[*entity.AgentEvent], error)
	GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *AgentInfo, err error)
}

var defaultSVC SingleAgent

func DefaultSVC() SingleAgent {
	return defaultSVC
}

func SetDefaultSVC(svc SingleAgent) {
	defaultSVC = svc
}
