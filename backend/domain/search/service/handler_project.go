package service

import (
	"context"
	"fmt"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/es"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

const projectIndexName = "project_draft"

type projectHandlerImpl struct {
	esClient es.Client
}

type ConsumerHandler = eventbus.ConsumerHandler

var defaultProjectHandle *projectHandlerImpl

func NewProjectHandler(ctx context.Context, e es.Client) ConsumerHandler {
	defaultProjectHandle = &projectHandlerImpl{
		esClient: e,
	}

	return defaultProjectHandle
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
