package search

import (
	"context"
	"fmt"
	"os"

	"code.byted.org/flow/opencoze/backend/application/singleagent"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func InitService(ctx context.Context, tos storage.Storage, e *es8.Client, s singleagent.SingleAgent, u user.User) error {
	searchDomainSVC := search.NewDomainService(ctx, e)

	ResourceSVC.DomainSVC = searchDomainSVC
	ResourceSVC.userDomainSVC = u
	ResourceSVC.tos = tos

	IntelligenceSVC.DomainSVC = searchDomainSVC
	IntelligenceSVC.singleAgentSVC = s
	IntelligenceSVC.tosClient = tos
	IntelligenceSVC.userDomainSVC = u

	// setup consumer
	searchConsumer := search.NewAppHandler(ctx, e)

	logs.Infof("start search domain consumer...")
	nameServer := os.Getenv(consts.RocketMQServer)

	err := rmq.RegisterConsumer(nameServer, "opencoze_search_app", "cg_search_app", searchConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}

	searchResourceConsumer := search.NewResourceHandler(ctx, e)

	err = rmq.RegisterConsumer(nameServer, "opencoze_search_resource", "cg_search_resource", searchResourceConsumer)
	if err != nil {
		return fmt.Errorf("register search consumer failed, err=%w", err)
	}

	return nil
}

type (
	ResourceEventbus = search.ResourceEventbus
	AppEventbus      = search.AppProjectEventbus
)

func NewResourceEventbus(p eventbus.Producer) search.ResourceEventbus {
	return search.NewResourceEventbus(p)
}

func NewAppEventbus(p eventbus.Producer) search.AppProjectEventbus {
	return search.NewAppEventbus(p)
}
