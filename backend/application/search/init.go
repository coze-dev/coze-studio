package search

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/search"
	searchDomain "code.byted.org/flow/opencoze/backend/domain/search/service"
	svc "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

var (
	searchDomainSVC search.Search
	singleAgentSVC  singleagent.SingleAgent
	tosClient       storage.Storage
	esClient        *es8.Client
)

func InitService(ctx context.Context, tos storage.Storage, e *es8.Client, s singleagent.SingleAgent) error {
	tosClient = tos
	singleAgentSVC = s
	esClient = e
	searchDomainSVC = svc.NewDomainService(ctx, &svc.SearchConfig{Storage: tos, ESClient: e})

	searchConsumer, err := svc.NewSearchService(ctx, &svc.SearchConfig{
		ESClient: esClient,
		Storage:  tosClient,
	})
	if err != nil {
		return err
	}

	// TODO: 等下看怎么搞
	logs.Infof("start search domain consumer...")
	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_search_app", "cg_search_app", searchConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}

	searchResourceConsumer, err := svc.NewSearchResourceService(ctx, &svc.SearchConfig{
		ESClient: esClient,
		Storage:  tosClient,
	})
	if err != nil {
		return err
	}

	err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_search_resource", "cg_search_resource", searchResourceConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}

	return nil
}

type (
	ResourceEventbus = search.ResourceEventbus
	AppEventbus      = search.AppEventbus
)

func NewResourceEventbus(p eventbus.Producer) search.ResourceEventbus {
	return searchDomain.NewResourceEventbus(p)
}

func NewAppEventbus(p eventbus.Producer) search.AppEventbus {
	return searchDomain.NewAppEventbus(p)
}
