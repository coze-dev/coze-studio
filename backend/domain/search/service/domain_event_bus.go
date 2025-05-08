package service

import (
	"context"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
)

type DomainNotifierConfig struct {
	Producer eventbus.Producer
}

func NewDomainNotifier(c *DomainNotifierConfig) (search.DomainNotifier, error) {
	return &domainNotifier{
		producer: c.Producer,
	}, nil
}

type domainNotifier struct {
	producer eventbus.Producer
}

func (d *domainNotifier) PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error {
	if event.Meta == nil {
		event.Meta = &entity.EventMeta{}
	}

	event.Meta.SendTimeMs = time.Now().UnixMilli()

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}
	return d.producer.Send(ctx, bytes)
}

func (d *domainNotifier) PublishApps(ctx context.Context, event *entity.AppDomainEvent) error {
	if event.Meta != nil {
		event.Meta = &entity.EventMeta{}
	}

	event.Meta.SendTimeMs = time.Now().UnixMilli()

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}
	return d.producer.Send(ctx, bytes)
}

func wrapDomainSubscriber(ctx context.Context, h search.Handler) eventbus.ConsumerHandler {
	return &subscriberFromRMQ{
		subHdr: h,
	}
}

type subscriberFromRMQ struct {
	subHdr search.Handler
}

func (s *subscriberFromRMQ) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	ev := &entity.AppDomainEvent{}
	err := sonic.Unmarshal(msg.Body, ev)
	if err != nil {
		return err
	}

	if ev.Meta != nil {
		ev.Meta = &entity.EventMeta{}
	}

	ev.Meta.ReceiveTimeMs = time.Now().UnixMilli()

	err = s.subHdr(ctx, ev)
	if err != nil {
		return err
	}

	return nil
}
