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

func NewProjectEventBus(p eventbus.Producer) AppProjectEventBus {
	return &eventbusImpl{
		producer: p,
	}
}

func NewResourceEventBus(p eventbus.Producer) ResourceEventBus {
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
		(event.Resource.CreateTimeMS == nil || *event.Resource.CreateTimeMS == 0) {
		event.Resource.CreateTimeMS = ptr.Of(now)
	}

	if (event.OpType == entity.Created || event.OpType == entity.Updated) &&
		event.Resource != nil &&
		(event.Resource.UpdateTimeMS == nil || *event.Resource.UpdateTimeMS == 0) {
		event.Resource.UpdateTimeMS = ptr.Of(now)
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

func (d *eventbusImpl) PublishProject(ctx context.Context, event *entity.ProjectDomainEvent) error {
	if event.Meta == nil {
		event.Meta = &entity.EventMeta{}
	}

	event.Meta.SendTimeMs = time.Now().UnixMilli()
	now := time.Now().UnixMilli()
	event.Meta.SendTimeMs = time.Now().UnixMilli()

	if event.OpType == entity.Created &&
		event.Project != nil &&
		(event.Project.CreateTimeMS == nil || *event.Project.CreateTimeMS == 0) {
		event.Project.CreateTimeMS = ptr.Of(now)
	}

	if (event.OpType == entity.Created || event.OpType == entity.Updated) &&
		event.Project != nil &&
		(event.Project.UpdateTimeMS == nil || *event.Project.UpdateTimeMS == 0) {
		event.Project.UpdateTimeMS = ptr.Of(now)
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
