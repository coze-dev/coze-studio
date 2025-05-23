package service

import (
	"context"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type eventbusImpl struct {
	producer eventbus.Producer
}

func NewAppEventbus(p eventbus.Producer) AppEventbus {
	return &eventbusImpl{
		producer: p,
	}
}

func NewResourceEventbus(p eventbus.Producer) ResourceEventbus {
	return &eventbusImpl{
		producer: p,
	}
}

func (d *eventbusImpl) PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error {
	if event.Meta == nil {
		event.Meta = &entity.EventMeta{}
	}

	now := time.Now().UnixMilli()
	event.Meta.SendTimeMs = time.Now().UnixMilli()

	if event.OpType == entity.Created &&
		event.Resource != nil &&
		(event.Resource.CreatedAt == nil || *event.Resource.CreatedAt == 0) {
		event.Resource.CreatedAt = ptr.Of(now)
	}

	if (event.OpType == entity.Created || event.OpType == entity.Updated) &&
		event.Resource != nil &&
		(event.Resource.UpdatedAt == nil || *event.Resource.UpdatedAt == 0) {
		event.Resource.UpdatedAt = ptr.Of(now)
	}

	if defaultResourceHandler != nil {
		err := defaultResourceHandler.indexResources(ctx, event)
		if err == nil {
			json, _ := sonic.Marshal(event)
			logs.CtxInfof(ctx, "Sync PublishResources success: %s", string(json))

			return nil
		}

		logs.CtxWarnf(ctx, "Sync PublishResources indexResources error: %s", err.Error())
	}

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
	now := time.Now().UnixMilli()
	event.Meta.SendTimeMs = time.Now().UnixMilli()

	if event.OpType == entity.Created &&
		event.Agent != nil &&
		(event.Agent.CreatedAt == nil || *event.Agent.CreatedAt == 0) {
		event.Agent.CreatedAt = ptr.Of(now)
	}

	if (event.OpType == entity.Created || event.OpType == entity.Updated) &&
		event.Agent != nil &&
		(event.Agent.UpdatedAt == nil || *event.Agent.UpdatedAt == 0) {
		event.Agent.UpdatedAt = ptr.Of(now)
	}

	if defaultAppHandle != nil {
		err := defaultAppHandle.indexApps(ctx, event)
		if err == nil {
			json, _ := sonic.Marshal(event)
			logs.CtxInfof(ctx, "Sync PublishApps success: %s", string(json))
			return nil
		}
		logs.CtxWarnf(ctx, "Sync PublishApps indexApps error: %s", err.Error())
	}

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}

	logs.Infof("PublishApps success: %s", string(bytes))
	return d.producer.Send(ctx, bytes)
}
