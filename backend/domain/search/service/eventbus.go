/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package service

import (
	"context"
	"time"

	"github.com/bytedance/sonic"

	"github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type eventbusImpl struct {
	producer eventbus.Producer
}

func NewProjectEventBus(p eventbus.Producer) ProjectEventBus {
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

	if defaultProjectHandle != nil {
		err := defaultProjectHandle.indexProject(ctx, event)
		if err == nil {
			json, _ := sonic.Marshal(event)
			logs.CtxInfof(ctx, "Sync PublishProject success: %s", string(json))
			return nil
		}
		logs.CtxWarnf(ctx, "Sync PublishProject indexProject error: %s", err.Error())
	}

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}

	logs.Infof("PublishProject success: %s", string(bytes))
	return d.producer.Send(ctx, bytes)
}
