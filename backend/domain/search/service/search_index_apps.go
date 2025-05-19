package service

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
)

func NewAppEventbus(p eventbus.Producer) search.AppEventbus {
	return &eventbusImpl{
		producer: p,
	}
}

const appIndexName = "app_draft"

func (s *searchImpl) indexApps(ctx context.Context, ev *entity.AppDomainEvent) error {
	switch ev.DomainName {
	case entity.SingleAgent:
		return s.indexAgent(ctx, ev.OpType, ev.Agent)
	case entity.Project:

	}

	return fmt.Errorf("unpected domain event: %v", ev.DomainName)
}

func (s *searchImpl) indexAgent(ctx context.Context, opType entity.OpType, a *entity.Agent) error {
	switch opType {
	case entity.Created:
		ad := a.ToAppDocument()
		_, err := s.esClient.Index(appIndexName).Id(strconv.FormatInt(ad.ID, 10)).Document(ad).Do(ctx)
		return err
	case entity.Updated:
		return nil

	case entity.Deleted:
		_, err := s.esClient.Delete(appIndexName, strconv.FormatInt(a.ID, 10)).Do(ctx)
		return err
	}

	return fmt.Errorf("unexpected op type: %v", opType)
}
