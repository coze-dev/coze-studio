package connector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type ConnectorApplicationService struct {
	domainSVC connector.Connector
}

var ConnectorApplicationSVC ConnectorApplicationService

func New(domainSVC connector.Connector, tosClient storage.Storage) ConnectorApplicationService {
	return ConnectorApplicationService{
		domainSVC: domainSVC,
	}
}

func (c *ConnectorApplicationService) List(ctx context.Context) ([]*entity.Connector, error) {
	return c.domainSVC.List(ctx)
}
