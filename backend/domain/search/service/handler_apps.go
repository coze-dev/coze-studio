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

const appIndexName = "app_draft"

type appHandlerImpl struct {
	esClient *es8.Client
}

type ConsumerHandler = eventbus.ConsumerHandler

var defaultAppHandle *appHandlerImpl

func NewAppHandler(ctx context.Context, e *es8.Client) ConsumerHandler {
	defaultAppHandle = &appHandlerImpl{
		esClient: e,
	}
	return defaultAppHandle
}

func (s *appHandlerImpl) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	ev := &entity.AppDomainEvent{}

	logs.CtxInfof(ctx, "App Handler receive: %s", string(msg.Body))
	err := sonic.Unmarshal(msg.Body, ev)
	if err != nil {
		return err
	}

	err = s.indexApps(ctx, ev)
	if err != nil {
		return err
	}

	return nil
}

func (s *appHandlerImpl) indexApps(ctx context.Context, ev *entity.AppDomainEvent) error {
	if ev.Meta == nil {
		ev.Meta = &entity.EventMeta{}
	}

	ev.Meta.ReceiveTimeMs = time.Now().UnixMilli()

	switch ev.DomainName {
	case entity.SingleAgent:
		return s.indexAgent(ctx, ev.OpType, ev.Agent)
	case entity.Project:

	}

	return fmt.Errorf("unpected domain event: %v", ev.DomainName)
}

func (s *appHandlerImpl) indexAgent(ctx context.Context, opType entity.OpType, a *entity.Agent) (err error) {
	ad := a.ToAppDocument()

	switch opType {
	case entity.Created:
		_, err = s.esClient.Index(appIndexName).Id(conv.Int64ToStr(a.ID)).Document(ad).Do(ctx)
		return err
	case entity.Updated:
		_, err = s.esClient.Update(resourceIndexName, conv.Int64ToStr(a.ID)).
			Doc(ad).Do(ctx)
		return err
	case entity.Deleted:
		_, err = s.esClient.Delete(appIndexName, conv.Int64ToStr(a.ID)).Do(ctx)
		return err
	}

	return fmt.Errorf("unexpected op type: %v", opType)
}
