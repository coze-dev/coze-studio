package service

import (
	"context"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func NewResourceEventbus(p eventbus.Producer) search.ResourceEventbus {
	return &eventbusImpl{
		producer: p,
	}
}

type eventbusImpl struct {
	producer eventbus.Producer
}

func (d *eventbusImpl) PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error {
	if event.Meta == nil {
		event.Meta = &entity.EventMeta{}
	}

	event.Meta.SendTimeMs = time.Now().UnixMilli()

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}

	logs.Infof("PublishResources success: %s", string(bytes))
	return d.producer.Send(ctx, bytes)
}

func (d *eventbusImpl) PublishApps(ctx context.Context, event *entity.AppDomainEvent) error {
	if event.Meta == nil {
		event.Meta = &entity.EventMeta{}
	}

	event.Meta.SendTimeMs = time.Now().UnixMilli()

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}

	logs.Infof("PublishApps success: %s", string(bytes))
	return d.producer.Send(ctx, bytes)
}

func wrapDomainSubscriber(ctx context.Context, h search.AppHandler) eventbus.ConsumerHandler {
	return &subscriberFromRMQ{
		subHdr: h,
	}
}

func wrapResourceDomainSubscriber(ctx context.Context, h search.ResourceHandler) eventbus.ConsumerHandler {
	return &subscriberResourceEventFromRMQ{
		subHdr: h,
	}
}

type subscriberFromRMQ struct {
	subHdr search.AppHandler
}
type subscriberResourceEventFromRMQ struct {
	subHdr search.ResourceHandler
}

func (s *subscriberFromRMQ) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	ev := &entity.AppDomainEvent{}

	logs.Infof("App Handler receive: %s", string(msg.Body))
	err := sonic.Unmarshal(msg.Body, ev)
	if err != nil {
		return err
	}

	if ev.Meta == nil {
		ev.Meta = &entity.EventMeta{}
	}

	ev.Meta.ReceiveTimeMs = time.Now().UnixMilli()

	err = s.subHdr(ctx, ev)
	if err != nil {
		return err
	}

	return nil
}

func (s *subscriberResourceEventFromRMQ) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	ev := &entity.ResourceDomainEvent{}

	logs.Infof("Resource Handler receive: %s", string(msg.Body))

	err := sonic.Unmarshal(msg.Body, ev)
	if err != nil {
		return err
	}

	if ev.Meta == nil {
		ev.Meta = &entity.EventMeta{}
	}

	ev.Meta.ReceiveTimeMs = time.Now().UnixMilli()

	err = s.subHdr(ctx, ev)
	if err != nil {
		return err
	}

	return nil
}
