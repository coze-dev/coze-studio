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
	"fmt"
	"time"

	"github.com/bytedance/sonic"

	"github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/infra/es"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

const resourceIndexName = "coze_resource"

type resourceHandlerImpl struct {
	esClient es.Client
}

var defaultResourceHandler *resourceHandlerImpl // deprecate

func NewResourceHandler(ctx context.Context, e es.Client) ConsumerHandler {
	handler := &resourceHandlerImpl{
		esClient: e,
	}

	return handler
}

func (s *resourceHandlerImpl) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	ev := &entity.ResourceDomainEvent{}

	logs.Infof("Resource Handler receive: %s", string(msg.Body))

	err := sonic.Unmarshal(msg.Body, ev)
	if err != nil {
		return err
	}

	err = s.indexResources(ctx, ev)
	if err != nil {
		return err
	}

	return nil
}

func (s *resourceHandlerImpl) indexResources(ctx context.Context, ev *entity.ResourceDomainEvent) error {
	if ev.Meta == nil {
		ev.Meta = &entity.EventMeta{}
	}

	ev.Meta.ReceiveTimeMs = time.Now().UnixMilli()

	return s.indexResource(ctx, ev.OpType, ev.Resource)
}

func (s *resourceHandlerImpl) indexResource(ctx context.Context, opType entity.OpType, r *entity.ResourceDocument) error {
	switch opType {
	case entity.Created:
		return s.esClient.Create(ctx, resourceIndexName, conv.Int64ToStr(r.ResID), r)
	case entity.Updated:
		return s.esClient.Update(ctx, resourceIndexName, conv.Int64ToStr(r.ResID), r)
	case entity.Deleted:
		return s.esClient.Delete(ctx, resourceIndexName, conv.Int64ToStr(r.ResID))
	}

	return fmt.Errorf("unexpected op type: %v", opType)
}
