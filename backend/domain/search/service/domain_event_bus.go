package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
)

type DomainNotifierConfig struct {
	eventbus.Producer
}

func NewDomainNotifier(_ context.Context, c *DomainNotifierConfig) (search.DomainNotifier, error) {
	return nil, nil
}

type DomainSubscriberConfig struct {
}

func NewDomainSubscriber(ctx context.Context, c *DomainSubscriberConfig) (search.DomainSubscriber, error) {
	return nil, nil
}
