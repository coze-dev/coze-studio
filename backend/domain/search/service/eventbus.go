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

	"code.byted.org/data_edc/workflow_engine_next/domain/search/entity"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/eventbus"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
	"code.byted.org/gopkg/logs"
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

	err := defaultResourceHandler.indexResources(ctx, event)
	if err == nil {
		json, _ := sonic.Marshal(event)
		logs.CtxInfo(ctx, "Sync PublishResources success: %s", string(json))

		return nil
	}

	logs.CtxError(ctx, "Sync PublishResources indexResources error: %s", err.Error())

	//if defaultResourceHandler != nil {
	//	err := defaultResourceHandler.indexResources(ctx, event)
	//	if err == nil {
	//		json, _ := sonic.Marshal(event)
	//		logs.CtxInfo(ctx, "Sync PublishResources success: %s", string(json))
	//
	//		return nil
	//	}
	//
	//	logs.CtxWarn(ctx, "Sync PublishResources indexResources error: %s", err.Error())
	//}

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}

	logs.CtxInfo(ctx, "PublishResources success: %s", string(bytes))
	//return d.producer.Send(ctx, bytes)
	return nil
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

	// 默认同步创建ES
	err := defaultProjectHandle.indexProject(ctx, event)
	if err == nil {
		json, _ := sonic.Marshal(event)
		logs.CtxInfo(ctx, "Sync PublishProject success: %s", string(json))
		return nil
	}
	logs.CtxError(ctx, "Sync PublishProject indexProject error: %s", err.Error())

	//if defaultProjectHandle != nil {
	//	err := defaultProjectHandle.indexProject(ctx, event)
	//	if err == nil {
	//		json, _ := sonic.Marshal(event)
	//		logs.CtxInfof(ctx, "Sync PublishProject success: %s", string(json))
	//		return nil
	//	}
	//	logs.CtxWarnf(ctx, "Sync PublishProject indexProject error: %s", err.Error())
	//}

	bytes, err := sonic.Marshal(event)
	if err != nil {
		return err
	}

	logs.CtxInfo(ctx, "PublishProject success: %s", string(bytes))
	return nil
	//return d.producer.Send(ctx, bytes)
}
