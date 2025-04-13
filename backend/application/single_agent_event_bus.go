package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type singleAgentEventBus struct {
}

func (singleAgentEventBus) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	logs.CtxInfof(ctx, "receive message: %s", msg.Body)
	return nil
}
