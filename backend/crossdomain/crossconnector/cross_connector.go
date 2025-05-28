package crossconnector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
)

type ConnectorEntity = entity.Connector

type Connector interface {
	List(ctx context.Context) ([]*ConnectorEntity, error)
	GetByIDs(ctx context.Context, ids []int64) (map[int64]*ConnectorEntity, error)
	GetByID(ctx context.Context, id int64) (*ConnectorEntity, error)
}

var defaultSVC *connectorImpl

func InitDomainService(c connector.Connector) {
	defaultSVC = &connectorImpl{
		DomainSVC: c,
	}
}

func DefaultSVC() Connector {
	return defaultSVC
}

type connectorImpl struct {
	DomainSVC connector.Connector
}

func (c *connectorImpl) GetByIDs(ctx context.Context, ids []int64) (map[int64]*ConnectorEntity, error) {
	return c.DomainSVC.GetByIDs(ctx, ids)
}

func (c *connectorImpl) List(ctx context.Context) ([]*ConnectorEntity, error) {
	return c.DomainSVC.List(ctx)
}

func (c *connectorImpl) GetByID(ctx context.Context, id int64) (*ConnectorEntity, error) {
	return c.DomainSVC.GetByID(ctx, id)
}
