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

const resourceIndexName = "coze_resource"

type resourceHandlerImpl struct {
	esClient es.Client
}

var defaultResourceHandler *resourceHandlerImpl

func NewResourceHandler(ctx context.Context, e es.Client) ConsumerHandler {
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
		return s.esClient.Create(ctx, resourceIndexName, conv.Int64ToStr(r.ResID), r)
	case entity.Updated:
		return s.esClient.Update(ctx, resourceIndexName, conv.Int64ToStr(r.ResID), r)
	case entity.Deleted:
		return s.esClient.Delete(ctx, resourceIndexName, conv.Int64ToStr(r.ResID))
	}

	return fmt.Errorf("unexpected op type: %v", opType)
}
