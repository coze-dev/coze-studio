package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
)

type DomainEventBusConfig struct {
	eventbus.Producer
}

func NewDomainEventBus(_ context.Context, c *DomainEventBusConfig) (search.DomainEventBus, error) {
	return nil, nil
}
