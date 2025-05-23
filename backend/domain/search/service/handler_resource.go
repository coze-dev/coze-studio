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

const resourceIndexName = "coze_resource"

type resourceHandlerImpl struct {
	esClient *es8.Client
}

var defaultResourceHandler *resourceHandlerImpl

func NewResourceHandler(ctx context.Context, e *es8.Client) ConsumerHandler {
	defaultResourceHandler = &resourceHandlerImpl{
		esClient: e,
	}

	return defaultResourceHandler
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
		_, err := s.esClient.Index(resourceIndexName).Id(conv.Int64ToStr(r.ResID)).
			Document(r).Do(ctx)
		return err
	case entity.Updated:
		_, err := s.esClient.Update(resourceIndexName, conv.Int64ToStr(r.ResID)).
			Doc(r).Do(ctx)
		return err
	case entity.Deleted:
		_, err := s.esClient.Delete(resourceIndexName, conv.Int64ToStr(r.ResID)).
			Do(ctx)
		return err
	}

	return fmt.Errorf("unexpected op type: %v", opType)
}
