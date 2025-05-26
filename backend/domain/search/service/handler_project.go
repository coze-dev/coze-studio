package service

import (
	"context"
	"fmt"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

const projectIndexName = "project_draft"

type projectHandlerImpl struct {
	esClient *es8.Client
}

type ConsumerHandler = eventbus.ConsumerHandler

var defaultProjectHandle *projectHandlerImpl

func NewProjectHandler(ctx context.Context, e *es8.Client) ConsumerHandler {
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
		_, err := s.esClient.Index(projectIndexName).Id(conv.Int64ToStr(ev.Project.ID)).Document(ev.Project).Do(ctx)
		return err
	case entity.Updated:
		_, err := s.esClient.Update(projectIndexName, conv.Int64ToStr(ev.Project.ID)).
			Doc(ev.Project).Do(ctx)
		return err
	case entity.Deleted:
		_, err := s.esClient.Delete(projectIndexName, conv.Int64ToStr(ev.Project.ID)).Do(ctx)
		return err
	}

	return fmt.Errorf("unexpected op type: %v", ev.OpType)
}
