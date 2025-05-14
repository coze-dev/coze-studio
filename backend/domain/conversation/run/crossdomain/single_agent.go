package crossdomain

import (
	"context"

	"github.com/cloudwego/eino/schema"

	entity2 "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type SingleAgent interface {
	StreamExecute(ctx context.Context, historyMsg []*msgEntity.Message, query *msgEntity.Message) (*schema.StreamReader[*entity2.AgentEvent], error)
}
