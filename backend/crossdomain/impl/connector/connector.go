package connector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconnector"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
)

var defaultSVC crossconnector.Connector

func InitDomainService(c connector.Connector) crossconnector.Connector {
	defaultSVC = &connectorImpl{
		DomainSVC: c,
	}

	return defaultSVC
}

func DefaultSVC() crossconnector.Connector {
	return defaultSVC
}

type connectorImpl struct {
	DomainSVC connector.Connector
}

func (c *connectorImpl) GetByIDs(ctx context.Context, ids []int64) (map[int64]*crossconnector.EntityConnector, error) {
	return c.DomainSVC.GetByIDs(ctx, ids)
}

func (c *connectorImpl) List(ctx context.Context) ([]*crossconnector.EntityConnector, error) {
	return c.DomainSVC.List(ctx)
}

func (c *connectorImpl) GetByID(ctx context.Context, id int64) (*crossconnector.EntityConnector, error) {
	return c.DomainSVC.GetByID(ctx, id)
}
