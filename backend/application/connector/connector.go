package connector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type ConnectorApplicationService struct {
	DomainSVC connector.Connector
}

var ConnectorApplicationSVC ConnectorApplicationService

func New(domainSVC connector.Connector, tosClient storage.Storage) ConnectorApplicationService {
	return ConnectorApplicationService{
		DomainSVC: domainSVC,
	}
}

func (c *ConnectorApplicationService) List(ctx context.Context) ([]*entity.Connector, error) {
	return c.DomainSVC.List(ctx)
}
