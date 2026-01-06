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

const projectIndexName = "project_draft"

type projectHandlerImpl struct {
	esClient es.Client
}

type ConsumerHandler = eventbus.ConsumerHandler

var defaultProjectHandle *projectHandlerImpl

func NewProjectHandler(ctx context.Context, e es.Client) ConsumerHandler {
	handler := &projectHandlerImpl{
		esClient: e,
	}

	defaultProjectHandle = handler
	return handler
}

func (s *projectHandlerImpl) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	ev := &entity.ProjectDomainEvent{}

	logs.CtxInfof(ctx, "Project Handler receive: %s", string(msg.Body))
	err := sonic.Unmarshal(msg.Body, ev)
	if err != nil {
		return err
	}

	err = s.indexProject(ctx, ev)
	if err != nil {
		return err
	}

	return nil
}

func (s *projectHandlerImpl) indexProject(ctx context.Context, ev *entity.ProjectDomainEvent) error {
	if ev.Project == nil {
		return fmt.Errorf("project is nil")
	}

	if ev.Meta == nil {
		ev.Meta = &entity.EventMeta{}
	}

	ev.Meta.ReceiveTimeMs = time.Now().UnixMilli()

	switch ev.OpType {
	case entity.Created:
		return s.esClient.Create(ctx, projectIndexName, conv.Int64ToStr(ev.Project.ID), ev.Project)
	case entity.Updated:
		return s.esClient.Update(ctx, projectIndexName, conv.Int64ToStr(ev.Project.ID), ev.Project)
	case entity.Deleted:
		return s.esClient.Delete(ctx, projectIndexName, conv.Int64ToStr(ev.Project.ID))
	}

	return fmt.Errorf("unexpected op type: %v", ev.OpType)
}
